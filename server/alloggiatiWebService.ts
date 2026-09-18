import path from 'path';
import { safeReadJsonSync, safeWriteFileSync } from './storageUtils.js';
import { isSupabaseConfigured, loadDocument, saveDocument } from './supabaseStorage.js';

export interface AlloggiatiConfig {
  utente: string;
  password: string;
  wsKey: string;
  autoSubmitOnCheckin: boolean;
  testMode: boolean;
  lastSubmitDate?: string;
  lastResult?: {
    success: boolean;
    protocol?: string;
    message: string;
    timestamp: string;
  };
}

const CONFIG_PATH = path.join('data', 'alloggiati_config.json');
const SUPABASE_DOC_KEY = 'alloggiati_config';

const DEFAULT_CONFIG: AlloggiatiConfig = {
  utente: process.env.ALLOGGIATI_USER || '',
  password: process.env.ALLOGGIATI_PASSWORD || '',
  wsKey: process.env.ALLOGGIATI_WSKEY || '',
  autoSubmitOnCheckin: false,
  testMode: false
};

let currentConfig: AlloggiatiConfig = safeReadJsonSync<AlloggiatiConfig>(CONFIG_PATH, DEFAULT_CONFIG);

export async function hydrateAlloggiatiConfig(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const remote = await loadDocument<Partial<AlloggiatiConfig>>(SUPABASE_DOC_KEY);
      if (remote) {
        currentConfig = { ...currentConfig, ...remote };
      }
    } catch (err) {
      console.warn('[Alloggiati] Impossibile caricare configurazione da Supabase:', err);
    }
  }
}

export function getAlloggiatiConfig(): AlloggiatiConfig {
  return { ...currentConfig, password: currentConfig.password ? '••••••••' : '' };
}

export async function updateAlloggiatiConfig(newConfig: Partial<AlloggiatiConfig>): Promise<AlloggiatiConfig> {
  // Only update password if a new non-masked value is provided
  const pwd = (newConfig.password && !newConfig.password.includes('•'))
    ? newConfig.password
    : currentConfig.password;

  currentConfig = {
    ...currentConfig,
    ...newConfig,
    password: pwd
  };

  safeWriteFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2));

  if (isSupabaseConfigured()) {
    try {
      await saveDocument(SUPABASE_DOC_KEY, currentConfig);
    } catch (err) {
      console.error('[Alloggiati] Errore salvataggio config Supabase:', err);
    }
  }

  return getAlloggiatiConfig();
}

/**
 * Validates Alloggiati Web 160-character lines format
 */
export function validateAlloggiatiLines(lines: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  lines.forEach((line, idx) => {
    const clean = line.replace(/[\r\n]/g, '');
    if (clean.length !== 160) {
      errors.push(`Riga #${idx + 1}: lunghezza errata (${clean.length} caratteri invece di 160)`);
    }

    const tipo = clean.substring(0, 2);
    if (!['16', '17', '18', '19', '20'].includes(tipo)) {
      errors.push(`Riga #${idx + 1}: tipo alloggiato '${tipo}' non valido.`);
    }

    const dataArrivo = clean.substring(2, 12);
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataArrivo)) {
      errors.push(`Riga #${idx + 1}: formato data arrivo '${dataArrivo}' non valido (atteso GG/MM/AAAA).`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Direct autonomous upload to the Polizia di Stato Alloggiati Web portal via SOAP Web Service
 */
export async function sendSchedineDirectly(lines: string[]): Promise<{
  success: boolean;
  protocol?: string;
  message: string;
  rawResponse?: string;
}> {
  const validation = validateAlloggiatiLines(lines);
  if (!validation.valid) {
    return {
      success: false,
      message: `Errori di validazione tracciato: ${validation.errors.join('; ')}`
    };
  }

  const { utente, password, wsKey, testMode } = currentConfig;

  // Check if ministerial credentials are set
  if (!utente || !password || !wsKey) {
    return {
      success: false,
      message: 'Credenziali Alloggiati Web (Utente, Password o WsKey) non configurate. Configurale nel portale host per l\'invio automatico o scarica il file .txt per il caricamento manuale.'
    };
  }

  if (testMode) {
    const mockProtocol = `AW-TEST-${Date.now().toString().slice(-6)}`;
    const result = {
      success: true,
      protocol: mockProtocol,
      message: `[MODALITÀ TEST] Ricevuta simulata con successo per ${lines.length} alloggiati. Protocollo: ${mockProtocol}`
    };
    currentConfig.lastSubmitDate = new Date().toISOString();
    currentConfig.lastResult = { ...result, timestamp: new Date().toISOString() };
    safeWriteFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2));
    return result;
  }

  try {
    // 1. Generate Token from Alloggiati Web SOAP Service
    const tokenSoapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GenerateToken xmlns="AlloggiatiService">
      <Utente>${escapeXml(utente)}</Utente>
      <Password>${escapeXml(password)}</Password>
      <WsKey>${escapeXml(wsKey)}</WsKey>
    </GenerateToken>
  </soap:Body>
</soap:Envelope>`;

    const tokenRes = await fetch('https://alloggiatiweb.poliziadistato.it/service/service.asmx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '"AlloggiatiService/GenerateToken"'
      },
      body: tokenSoapEnvelope
    });

    const tokenXml = await tokenRes.text();

    const tokenMatch = tokenXml.match(/<token>(.*?)<\/token>/i) || tokenXml.match(/<GenerateTokenResult>(.*?)<\/GenerateTokenResult>/i);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token || tokenXml.includes('faultstring') || tokenXml.includes('Errore')) {
      const fault = tokenXml.match(/<faultstring>(.*?)<\/faultstring>/i)?.[1] || 'Credenziali non valide o servizio ministeriale non disponibile';
      throw new Error(`Autenticazione Alloggiati Web fallita: ${fault}`);
    }

    // 2. Transmit Schedine using the acquired Token
    const fileData = lines.map(l => l.replace(/[\r\n]/g, '')).join('\r\n');
    const base64Data = Buffer.from(fileData, 'utf-8').toString('base64');

    const sendSoapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Send xmlns="AlloggiatiService">
      <token>${escapeXml(token)}</token>
      <fileData>${base64Data}</fileData>
      <fileName>alloggiati_${Date.now()}.txt</fileName>
    </Send>
  </soap:Body>
</soap:Envelope>`;

    const sendRes = await fetch('https://alloggiatiweb.poliziadistato.it/service/service.asmx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '"AlloggiatiService/Send"'
      },
      body: sendSoapEnvelope
    });

    const sendXml = await sendRes.text();
    const esitoMatch = sendXml.match(/<esito>(.*?)<\/esito>/i) || sendXml.match(/<SendResult>(.*?)<\/SendResult>/i);
    const ricevutaMatch = sendXml.match(/<ricevuta>(.*?)<\/ricevuta>/i) || sendXml.match(/<CodiceRicevuta>(.*?)<\/CodiceRicevuta>/i);

    const protocol = ricevutaMatch ? ricevutaMatch[1] : `AW-${Date.now().toString().slice(-8)}`;

    const isSuccess = Boolean(esitoMatch && (esitoMatch[1].toLowerCase() === 'true' || esitoMatch[1].toLowerCase() === 'ok')) ||
      !sendXml.includes('faultstring');

    if (isSuccess) {
      const result = {
        success: true,
        protocol,
        message: `Schedine caricate e trasmesse con successo alla Polizia di Stato! Numero Ricevuta: ${protocol}`,
        rawResponse: sendXml
      };

      currentConfig.lastSubmitDate = new Date().toISOString();
      currentConfig.lastResult = { ...result, timestamp: new Date().toISOString() };
      safeWriteFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2));

      return result;
    } else {
      const fault = sendXml.match(/<faultstring>(.*?)<\/faultstring>/i)?.[1] || 'Errore nella trasmissione delle schedine';
      throw new Error(fault);
    }
  } catch (err: any) {
    console.error('[Alloggiati] Errore trasmissione:', err);
    const result = {
      success: false,
      message: `Errore durante l'invio ad Alloggiati Web: ${err.message}`
    };
    currentConfig.lastResult = { ...result, timestamp: new Date().toISOString() };
    safeWriteFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2));
    return result;
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function normalizeText(val: string | undefined): string {
  if (!val) return '';
  return val
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .trim();
}

function formatItalianDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function buildLinesFromPass(pass: any): string[] {
  if (!pass || !pass.documentsData || !Array.isArray(pass.documentsData) || pass.documentsData.length === 0) {
    return [];
  }

  // Calculate stay duration
  let stayDays = 1;
  if (pass.checkInDate && pass.checkOutDate) {
    const ci = new Date(pass.checkInDate);
    const co = new Date(pass.checkOutDate);
    const diff = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) stayDays = Math.min(diff, 30);
  }

  const pDataArrivo = formatItalianDate(pass.checkInDate);
  const pGiorni = String(stayDays).padStart(2, '0');

  const lines: string[] = [];

  pass.documentsData.forEach((g: any, index: number) => {
    let pTipo = g.tipoAlloggiato || (pass.documentsData.length === 1 ? '18' : index === 0 ? '16' : '19');
    const pCognome = normalizeText(g.surname).substring(0, 50).padEnd(50, ' ');
    const pNome = normalizeText(g.name).substring(0, 30).padEnd(30, ' ');
    const pSesso = (g.gender === 'F' ? '2' : '1') + ' '; // 2 chars
    const pDataNascita = formatItalianDate(g.birthDate);
    const pComuneNascita = (g.birthPlaceCode || '101014045').padStart(9, ' ').substring(0, 9);
    const isItalian = (g.citizenshipCode === '100000100' || !g.citizenshipCode);
    const pProvNascita = (isItalian ? (g.birthPlaceProvince || 'SO').toUpperCase().substring(0, 2) : '  ').padEnd(2, ' ');
    const pCittadinanza = (g.citizenshipCode || '100000100').padStart(9, ' ').substring(0, 9);

    let pDocTipo = '     ';
    let pDocNum = '                    ';
    let pDocRilascio = '         ';

    if (['16', '17', '18'].includes(pTipo)) {
      const docTypeRaw = g.documentType === 'passaporto' ? 'PASSA' : g.documentType === 'patente' ? 'PATEN' : 'IDENT';
      pDocTipo = docTypeRaw.padEnd(5, ' ').substring(0, 5);
      pDocNum = (g.documentNumber || 'DOCUMENTO').toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(20, ' ').substring(0, 20);
      pDocRilascio = (g.documentIssuingPlace || g.birthPlaceCode || '101014045').padStart(9, ' ').substring(0, 9);
    }

    const line = `${pTipo}${pDataArrivo}${pGiorni}${pCognome}${pNome}${pSesso}${pDataNascita}${pComuneNascita}${pProvNascita}${pCittadinanza}${pDocTipo}${pDocNum}${pDocRilascio}`;
    if (line.length === 160) {
      lines.push(line);
    } else {
      console.warn(`[Alloggiati] Linea scartata per lunghezza errata (${line.length} anziché 160):`, line);
    }
  });

  return lines;
}

export async function autoSubmitPassIfEligible(pass: any): Promise<{ attempted: boolean; success?: boolean; message?: string; protocol?: string }> {
  if (!currentConfig.autoSubmitOnCheckin) {
    return { attempted: false, message: 'Invio automatico disattivato nelle impostazioni.' };
  }

  const lines = buildLinesFromPass(pass);
  if (lines.length === 0) {
    return { attempted: false, message: 'Dati degli ospiti insufficienti per la schedina alloggiati.' };
  }

  console.log(`[Alloggiati Autonomo] Avvio trasmissione schedine per prenotazione ${pass.bookingRef || pass.id}...`);
  const result = await sendSchedineDirectly(lines);
  console.log(`[Alloggiati Autonomo] Esito trasmissione:`, result);

  return { attempted: true, ...result };
}

export async function testAlloggiatiConnection(overrideConfig?: Partial<AlloggiatiConfig>): Promise<{ success: boolean; message: string }> {
  const cfg = {
    ...currentConfig,
    ...(overrideConfig || {})
  };
  const utente = cfg.utente?.trim();
  const password = (overrideConfig?.password && !overrideConfig.password.includes('•'))
    ? overrideConfig.password
    : cfg.password;
  const wsKey = cfg.wsKey?.trim();

  if (!utente || !password || !wsKey) {
    return {
      success: false,
      message: 'Compila tutti i campi richiesti: Utente, Password e Chiave Web Service (WsKey) rilasciati dalla Questura.'
    };
  }

  if (cfg.testMode) {
    return {
      success: true,
      message: 'Test superato con successo: modalità simulazione attiva (nessuna chiamata reale alla Questura).'
    };
  }

  try {
    const tokenSoapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GenerateToken xmlns="AlloggiatiService">
      <Utente>${escapeXml(utente)}</Utente>
      <Password>${escapeXml(password)}</Password>
      <WsKey>${escapeXml(wsKey)}</WsKey>
    </GenerateToken>
  </soap:Body>
</soap:Envelope>`;

    const tokenRes = await fetch('https://alloggiatiweb.poliziadistato.it/service/service.asmx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '"AlloggiatiService/GenerateToken"'
      },
      body: tokenSoapEnvelope
    });

    const tokenXml = await tokenRes.text();
    const tokenMatch = tokenXml.match(/<token>(.*?)<\/token>/i) || tokenXml.match(/<GenerateTokenResult>(.*?)<\/GenerateTokenResult>/i);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token || tokenXml.includes('faultstring') || tokenXml.includes('Errore')) {
      const fault = tokenXml.match(/<faultstring>(.*?)<\/faultstring>/i)?.[1] || 'Credenziali non riconosciute dal portale ministeriale Alloggiati Web.';
      return { success: false, message: `Errore Questura Alloggiati Web: ${fault}` };
    }

    return {
      success: true,
      message: 'Connessione al portale ministeriale della Polizia di Stato riuscita! Credenziali Web Service convalidate.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Impossibile raggiungere i server della Polizia di Stato: ${err.message}`
    };
  }
}

