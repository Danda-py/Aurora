import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';
import { GoogleGenAI } from '@google/genai';
import { simpleParser } from 'mailparser';
import { 
  parseBedAndBreakfastBooking, 
  generateRandomPin, 
  formatInvitationMessage,
  parseIReservationEmail
} from '../src/services/guestPassService.js';
import { GuestPass } from '../src/types.js';
import { AMENITIES, APARTMENT_INFO, EXPERIENCES, NEARBY_PLACES } from '../src/data/apartmentData.js';
import {
  getHomeAssistantConfig,
  updateHomeAssistantConfig,
  updateHomeAssistantConfigAsync,
  hydrateHomeAssistantConfig,
  triggerHomeAssistantOn,
  triggerHomeAssistantCheckout
} from './homeAssistantService.js';
import {
  getCmsData,
  getCmsDataAsync,
  saveCmsData,
  saveCmsDataAsync,
  updateCmsSection,
  resetCmsData,
  getCmsMedia,
  getCmsMediaAsync,
  saveUploadedPhoto,
  resetCmsPhoto,
  saveCmsMedia,
  saveCmsMediaAsync
} from './cmsService.js';
import { safeReadJsonSync, safeWriteFileSync, getReadFilePath } from './storageUtils.js';
import { bootstrapHost, getHostSession, hostRegistrationOpen, isHostConfigured, loginHost, logoutHost, requireHost } from './hostAuthService.js';
import { deletePass as deleteSupabasePass, isSupabaseConfigured, loadPasses, upsertPass, logDigitalKeyAccess, loadDigitalKeyLogs, loadDocument, saveDocument } from './supabaseStorage.js';
import { startIcalWatcher, getIcalConfig, updateIcalConfig, hydrateIcalConfig, syncReservationsFromIcal } from './icalWatcherService.js';
import { checkNewEmailsAndGeneratePasses, startEmailWatcher, addEmailLog, getEmailLogs, hydrateImapConfig, updateImapConfigAsync, getImapConfig, parseEmailWithGemini } from './emailWatcherService.js';
import { sendGuestNotification, sendHostNotification } from './notificationService.js';
import {
  scheduleBookingMessages,
  getScheduledMessages,
  cancelScheduledMessage,
  cancelAllMessagesForPass,
  retryScheduledMessage,
  startScheduledMessagingWatcher
} from './scheduledMessagingService.js';
import { 
  getPropertyConfig, 
  updatePropertyConfig, 
  hydratePropertyConfig 
} from './propertyConfigService.js';
import { getSmartLockProvider } from './smartLockAdapter.js';
import { verifyGuestProximity, Coordinates } from './proximityService.js';
import { extractClientIps } from './clientIpUtils.js';

const PASSES_REL_PATH = path.join('data', 'passes.json');
const LOGS_REL_PATH = path.join('data', 'digital_key_logs.json');

const defaultPasses: GuestPass[] = [
  {
    id: 'pass-demo-vip',
    guestName: 'Marco',
    guestSurname: 'Rossi',
    phone: '+39 340 123 4567',
    checkInDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    checkInTime: '14:00',
    checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    checkOutTime: '10:00',
    pinCode: '2741',
    bookingRef: 'BB-67807',
    guestsCount: 2,
    bookingSource: 'bed-and-breakfast.it',
    notes: 'Arrivo in treno da Milano Centrale',
    createdAt: new Date().toISOString(),
    active: true,
    checkInConfirmed: true,
    token: 'eyJndWVzdE5hbWUiOiJNYXJjbyIsImd1ZXN0U3VybmFtZSI6IlJvc3NpIiwicGluQ29kZSI6IjI3NDEifQ=='
  }
];

// Persistent list of passes on server
const serverPasses: GuestPass[] = safeReadJsonSync<GuestPass[]>(PASSES_REL_PATH, defaultPasses);

const defaultLogs: any[] = [];
const serverLogs: any[] = safeReadJsonSync<any[]>(LOGS_REL_PATH, defaultLogs);

const DELETED_REFS_REL_PATH = path.join('data', 'deleted_booking_refs.json');
const deletedBookingRefs: string[] = safeReadJsonSync<string[]>(DELETED_REFS_REL_PATH, []);

let passesHydration: Promise<void> | null = null;
let logsHydration: Promise<void> | null = null;
let deletedRefsHydration: Promise<void> | null = null;

let lastPassesHydrationTime = 0;
let lastLogsHydrationTime = 0;
let lastDeletedRefsHydrationTime = 0;

const CACHE_TTL_MS = 10000; // 10 seconds cache TTL

async function hydrateLogsFromSupabase(force = false) {
  const now = Date.now();
  if (!force && logsHydration && (now - lastLogsHydrationTime < CACHE_TTL_MS)) {
    return logsHydration;
  }
  logsHydration = (async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const remoteLogs = await loadDigitalKeyLogs();
      if (remoteLogs) {
        serverLogs.splice(0, serverLogs.length, ...remoteLogs);
        lastLogsHydrationTime = Date.now();
      }
    } catch (error) {
      logsHydration = null;
      console.error('Supabase logs load failed; keeping local fallback:', error);
    }
  })();
  return logsHydration;
}

function persistLogs() {
  safeWriteFileSync(LOGS_REL_PATH, JSON.stringify(serverLogs, null, 2));
}

async function hydratePassesFromSupabase(force = false) {
  const now = Date.now();
  if (!force && passesHydration && (now - lastPassesHydrationTime < CACHE_TTL_MS)) {
    return passesHydration;
  }
  passesHydration = (async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const remotePasses = await loadPasses();
      if (remotePasses) {
        serverPasses.splice(0, serverPasses.length, ...sortGuestPasses(remotePasses));
        lastPassesHydrationTime = Date.now();
      }
    } catch (error) {
      passesHydration = null;
      console.error('Supabase passes load failed; keeping local fallback:', error);
    }
  })();
  return passesHydration;
}

function persistPasses() {
  safeWriteFileSync(PASSES_REL_PATH, JSON.stringify(serverPasses, null, 2));
  void hydratePassesFromSupabase(true);
}

async function hydrateDeletedRefsFromSupabase(force = false) {
  const now = Date.now();
  if (!force && deletedRefsHydration && (now - lastDeletedRefsHydrationTime < CACHE_TTL_MS)) {
    return deletedRefsHydration;
  }
  deletedRefsHydration = (async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const remoteRefs = await loadDocument<string[]>('deleted_booking_refs');
      if (remoteRefs && Array.isArray(remoteRefs)) {
        deletedBookingRefs.splice(0, deletedBookingRefs.length, ...remoteRefs);
        lastDeletedRefsHydrationTime = Date.now();
      }
    } catch (error) {
      deletedRefsHydration = null;
      console.error('Supabase deleted booking refs load failed:', error);
    }
  })();
  return deletedRefsHydration;
}

function sortGuestPasses(passes: GuestPass[]): GuestPass[] {
  const todayStr = new Date().toISOString().split('T')[0];

  return [...passes].sort((a, b) => {
    const aCancelled = a.active === false;
    const bCancelled = b.active === false;
    if (aCancelled !== bCancelled) {
      return aCancelled ? 1 : -1;
    }

    const aActive = Boolean(a.checkInDate && a.checkOutDate && a.checkInDate <= todayStr && a.checkOutDate >= todayStr);
    const bActive = Boolean(b.checkInDate && b.checkOutDate && b.checkInDate <= todayStr && b.checkOutDate >= todayStr);

    // 1. Pass attivi sempre in cima
    if (aActive !== bActive) {
      return aActive ? -1 : 1;
    }

    if (aActive && bActive) {
      const cmpOut = (a.checkOutDate || '').localeCompare(b.checkOutDate || '');
      if (cmpOut !== 0) return cmpOut;
      return (a.checkInDate || '').localeCompare(b.checkInDate || '');
    }

    // 2. Futuri (in arrivo)
    const aUpcoming = Boolean(a.checkInDate && a.checkInDate > todayStr);
    const bUpcoming = Boolean(b.checkInDate && b.checkInDate > todayStr);

    if (aUpcoming !== bUpcoming) {
      return aUpcoming ? -1 : 1;
    }

    if (aUpcoming && bUpcoming) {
      const cmpIn = (a.checkInDate || '').localeCompare(b.checkInDate || '');
      if (cmpIn !== 0) return cmpIn;
      return (a.checkOutDate || '').localeCompare(b.checkOutDate || '');
    }

    // 3. Passati (scaduti)
    const cmpPast = (b.checkOutDate || '').localeCompare(a.checkOutDate || '');
    if (cmpPast !== 0) return cmpPast;
    return (b.checkInDate || '').localeCompare(a.checkInDate || '');
  });
}

function isPassCurrentlyValid(pass: GuestPass): boolean {
  if (!pass.active) return false;
  const today = new Date().toISOString().split('T')[0];
  return Boolean(pass.checkInDate && pass.checkOutDate && pass.checkInDate <= today && pass.checkOutDate >= today);
}

function findValidGuestPass(token: string | undefined): GuestPass | null {
  if (!token) return null;
  const pass = serverPasses.find(item => item.token === token);
  return pass && isPassCurrentlyValid(pass) ? pass : null;
}

const auroraAiKnowledge = JSON.stringify({
  apartment: APARTMENT_INFO,
  amenities: AMENITIES.map(({ name, description }) => ({ name: name.it, description: description.it })),
  experiences: EXPERIENCES.map(({ title, subtitle, duration, driveTime, description, tips }) => ({
    title: title.it,
    subtitle: subtitle.it,
    duration,
    driveTime,
    description: description.it,
    tips: tips.it
  })),
  nearbyPlaces: NEARBY_PLACES.map(({ name, category, distance, walkTime, address, description, highlight }) => ({
    name,
    category,
    distance,
    walkTime,
    address,
    description: description.it,
    highlight: highlight?.it
  }))
});

const auroraAiInstructions = `Sei Aurora AI, la concierge digitale dell'appartamento Aurora in Valtellina a Morbegno. Aiuti gli ospiti con informazioni pratiche sull'appartamento, su Morbegno e sulla Valtellina (ristoranti, eventi, trasporti, meteo, attivita, curiosita locali). Rispondi nella lingua usata dall'ospite, in modo conciso e cordiale.

Per i dati specifici dell'appartamento e del soggiorno (orari, dotazioni, prezzi, servizi dell'host) usa esclusivamente il KNOWLEDGE BASE VERIFICATO qui sotto: non inventare o alterare questi dati. Se un'informazione sull'appartamento non e presente nel knowledge base, dillo chiaramente e invita l'ospite a contattare Nino su WhatsApp.

Per domande generali su Morbegno e la Valtellina che non riguardano l'appartamento (es. eventi del mese, sagre, mercati, meteo, orari di mezzi pubblici, punti di interesse), puoi e devi rispondere usando la tua conoscenza generale e la ricerca web, come faresti normalmente, per dare la risposta piu utile e aggiornata possibile: non rifiutarti di rispondere solo perche il dato non e nel knowledge base dell'appartamento.

Non chiedere, memorizzare o ripetere dati sensibili come codici di accesso.

KNOWLEDGE BASE VERIFICATO (SOLO PER DATI DELL'APPARTAMENTO):
${auroraAiKnowledge}`;

interface HassLog {
  timestamp: string;
  guest: string;
  detail: string;
}

// Home Assistant Switch & Door Opener State
const hassDoorState = {
  lastTriggeredAt: new Date().toISOString(),
  guestName: 'Marco Rossi',
  status: 'ready' as 'ready' | 'active' | 'error',
  device: 'Home Assistant (Pulsante Portone)',
  currentActivePin: '2741',
  logs: [
    {
      timestamp: new Date().toISOString(),
      guest: 'Marco Rossi',
      detail: 'Pulsante apriporta Home Assistant pronto per comando ON'
    }
  ] as HassLog[]
};

// Home Assistant Real-time Lock & Door physical status
const lockPhysicalState = {
  state: 'closed' as 'closed' | 'open' | 'offline',
  lastUpdatedAt: new Date().toISOString(),
  battery: 88,
  signalStrength: -65
};

/**
 * Sends an ON impulse to Home Assistant
 */
async function sendHomeAssistantOnInput(guest: string = 'Host', source: string = 'Manuale', wifiConnected: boolean = true) {
  hassDoorState.lastTriggeredAt = new Date().toISOString();
  hassDoorState.guestName = guest;
  
  const result = await triggerHomeAssistantOn({ guestName: guest, source, wifiConnected });
  
  if (result.success) {
    hassDoorState.status = 'ready';
    hassDoorState.logs.unshift({
      timestamp: new Date().toISOString(),
      guest,
      detail: `Input ON inviato a Home Assistant [${source}]: ${result.message}`
    });
  } else {
    hassDoorState.status = 'error';
    hassDoorState.logs.unshift({
      timestamp: new Date().toISOString(),
      guest,
      detail: `Errore comando ON Home Assistant: ${result.error}`
    });
  }

  if (hassDoorState.logs.length > 25) {
    hassDoorState.logs.pop();
  }

  return result;
}

function verifyWifiConnection(req: express.Request, config: any): { verified: boolean; isMatchIp: boolean; isLocal: boolean; clientIp: string; homePublicIp: string } {
  const ips = extractClientIps(req);
  const clientIp = ips[0] || '';
  const homePublicIp = (config?.homePublicIp || '').replace(/^::ffff:/, '').trim();

  const isMatchIp = Boolean(homePublicIp && ips.some(ip => ip === homePublicIp));
  const isLocal = ips.some(ip => 
    ip.startsWith('192.168.') || 
    ip.startsWith('10.') || 
    ip.startsWith('172.16.') || 
    ip.startsWith('172.17.') || 
    ip.startsWith('172.18.') || 
    ip.startsWith('172.19.') || 
    ip.startsWith('172.2') || 
    ip.startsWith('172.3') || 
    ip.startsWith('127.') || 
    ip === '::1' || 
    ip === 'localhost'
  );

  return {
    verified: isMatchIp || isLocal,
    isMatchIp,
    isLocal,
    clientIp,
    homePublicIp
  };
}

export function createApp() {
  const app = express();

  void hydratePassesFromSupabase();
  void hydrateLogsFromSupabase();
  void hydrateDeletedRefsFromSupabase();
  void hydrateHomeAssistantConfig();
  void hydratePropertyConfig();
  void hydrateIcalConfig();
  void hydrateImapConfig();

  // Condividiamo l'array delle prenotazioni per l'engine iCal globale
  (global as any).serverPassesRef = serverPasses;
  (global as any).deletedBookingRefsRef = deletedBookingRefs;
  (global as any).persistPassesRef = persistPasses;

  // Avvia l'engine di polling iCal (se abilitato nelle variabili d'ambiente)
  startIcalWatcher();

  // Avvia l'engine di polling email IMAP (se abilitato nelle variabili d'ambiente)
  startEmailWatcher();

  // Avvia l'engine di messaggistica programmata
  startScheduledMessagingWatcher();

  // Middlewares for JSON and form-urlencoded webhooks (up to 25mb for high-res photo uploads)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Same-origin by default. External booking systems use the authenticated webhook secret.
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Booking-Webhook-Secret, X-Guest-Token');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Serve permanent uploads directory directly (/uploads/*)
  const uploadsStaticPath = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsStaticPath)) {
    try {
      fs.mkdirSync(uploadsStaticPath, { recursive: true });
    } catch {}
  }
  app.use('/uploads', express.static(uploadsStaticPath));

  // Serve static assets directory directly (/assets/*)
  const assetsStaticPath = path.join(process.cwd(), 'public', 'assets');
  if (!fs.existsSync(assetsStaticPath)) {
    try {
      fs.mkdirSync(assetsStaticPath, { recursive: true });
    } catch {}
  }
  app.use('/assets', express.static(assetsStaticPath));

  // Il portale standalone è la versione pubblicata su /host-portal/.
  // L'interfaccia mostra il login prima della dashboard e ogni API operativa
  // resta comunque protetta dalla sessione HttpOnly lato server.
  app.use('/host-portal', express.static(path.join(process.cwd(), 'standalone-host-portal')));

  // Serve public directory static files
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Create API router for modular routing
  const apiRouter = express.Router();

  apiRouter.use(async (req, res, next) => {
    await hydratePassesFromSupabase();
    await hydrateLogsFromSupabase();
    await hydrateDeletedRefsFromSupabase();
    await hydrateHomeAssistantConfig();
    if (
      req.path === '/health' ||
      req.path === '/wifi/verify' ||
      req.path === '/proximity/verify' ||
      (req.method === 'GET' && req.path === '/property/config') ||
      req.path.startsWith('/auth/') ||
      req.path === '/guest/pass' ||
      req.path === '/lock/status' ||
      req.path === '/webhook/lock-status'
    ) {
      next();
      return;
    }
    // Allow public read access to CMS content and media (photos and guide text)
    if (req.method === 'GET' && (req.path === '/cms/content' || req.path === '/cms/media')) {
      next();
      return;
    }
    if (req.path === '/webhook/booking' || req.path === '/webhook/ireservation') {
      if (req.method === 'GET') {
        next();
        return;
      }
      const expected = process.env.BOOKING_WEBHOOK_SECRET || '';
      const hostSession = getHostSession(req);
      const hasWebhookSecret = Boolean(expected && req.get('x-booking-webhook-secret') === expected);
      if (!hostSession && !hasWebhookSecret) {
        res.status(401).json({ success: false, error: 'Webhook non autorizzato.' });
        return;
      }
      next();
      return;
    }
    if (req.path === '/hass/unlock' || req.path === '/ewelink/unlock' || req.path === '/hass/checkout') {
      const session = getHostSession(req);
      const guestToken = req.get('x-guest-token') || req.body?.guestToken;
      if (session || findValidGuestPass(guestToken)) {
        next();
        return;
      }
      res.status(401).json({ success: false, error: 'Link guest valido o autenticazione host richiesta.' });
      return;
    }
    if (req.path === '/aurora-ai/chat') {
      const guestToken = req.get('x-guest-token') || req.body?.guestToken;
      if (findValidGuestPass(guestToken)) {
        next();
        return;
      }
      res.status(401).json({ success: false, error: 'Link guest valido richiesto.' });
      return;
    }
    requireHost(req, res, next);
  });

  apiRouter.post('/auth/login', loginHost);
  apiRouter.post('/auth/bootstrap', bootstrapHost);
  apiRouter.post('/auth/logout', logoutHost);
  apiRouter.get('/auth/me', (req, res) => {
    const session = getHostSession(req);
    res.json({ authenticated: Boolean(session), email: session?.email || null, configured: isHostConfigured(), registrationOpen: hostRegistrationOpen() });
  });

  apiRouter.get('/guest/pass', (req, res) => {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const pass = serverPasses.find(item => item.token === token);
    if (!pass || !pass.active) {
      res.status(404).json({ success: false, error: 'Link ospite non valido.' });
      return;
    }
    
    // Se il soggiorno non è attualmente attivo o il check-in non è confermato, nascondi il PIN sensibile per la serratura
    if (!isPassCurrentlyValid(pass) || !pass.checkInConfirmed) {
      const sanitized = {
        ...pass,
        pinCode: '••••'
      };
      res.json({ success: true, pass: sanitized });
      return;
    }
    
    res.json({ success: true, pass });
  });

  apiRouter.post('/guest/documents', async (req, res) => {
    try {
      const { token, documentsData } = req.body;
      if (!token) {
        res.status(400).json({ success: false, error: 'Token non valido.' });
        return;
      }
      if (!Array.isArray(documentsData)) {
        res.status(400).json({ success: false, error: 'Dati dei documenti non validi.' });
        return;
      }

      // Trova il pass tramite token (anche se futuro, per pre-check-in)
      const pass = serverPasses.find(item => item.token === token);
      if (!pass || !pass.active) {
        res.status(404).json({ success: false, error: 'Pass ospite non valido o scaduto.' });
        return;
      }

      // Aggiorna i dati del pass
      pass.documentsUploaded = true;
      pass.documentsData = documentsData;

      // Persisti i cambiamenti localmente e su Supabase
      persistPasses();
      if (isSupabaseConfigured()) {
        await upsertPass(pass);
      }

      res.json({ success: true, pass });
    } catch (err: any) {
      console.error('Error saving guest documents:', err);
      res.status(500).json({ success: false, error: err.message || 'Errore durante il salvataggio dei documenti.' });
    }
  });

  apiRouter.post('/guest/ocr-scan', async (req, res) => {
    try {
      const { dataUrl, docType } = req.body;
      if (!dataUrl) {
        res.status(400).json({ success: false, error: 'Dati immagine mancanti.' });
        return;
      }

      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (typeof dataUrl === 'string' && (dataUrl.startsWith('http://') || dataUrl.startsWith('https://'))) {
        // È un URL pubblico (es. caricato su Supabase Storage)
        try {
          const fetchRes = await fetch(dataUrl);
          if (!fetchRes.ok) {
            throw new Error(`Status HTTP ${fetchRes.status}`);
          }
          const arrayBuffer = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          base64Data = buffer.toString('base64');
          
          const contentType = fetchRes.headers.get('content-type');
          if (contentType) {
            mimeType = contentType;
          }
        } catch (fetchErr: any) {
          console.error('[OCR-SCAN] Errore durante il download dell\'immagine da Storage:', fetchErr);
          res.status(400).json({ success: false, error: `Impossibile recuperare la foto da Storage: ${fetchErr.message}` });
          return;
        }
      } else {
        // Le funzioni serverless di Vercel rifiutano richieste sopra i 4.5MB con un 413
        // prima ancora che questo codice venga eseguito. Controlliamo comunque qui la
        // dimensione per dare un errore chiaro nei casi in cui il body arrivi comunque
        // (es. altri hosting) o quando il client non ha potuto comprimere l'immagine.
        if (typeof dataUrl === 'string' && dataUrl.length > 4 * 1024 * 1024) {
          res.status(413).json({ success: false, error: 'Immagine troppo pesante. Riprova con più luce o inquadrando solo il documento.' });
          return;
        }

        // Parse base64 Data URL
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        base64Data = dataUrl;
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else if (dataUrl.includes(';base64,')) {
          const parts = dataUrl.split(';base64,');
          base64Data = parts[1];
          if (parts[0].startsWith('data:')) {
            mimeType = parts[0].substring(5);
          }
        }
      }

      let parsedData: any = {};

      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Analizza l'immagine di questo documento di identità (${docType || 'documento'}) e scansiona/estrai i seguenti dati dell'ospite in formato JSON strutturato con le seguenti chiavi esatte:
{
  "name": "Nome in maiuscolo (es. MARIO)",
  "surname": "Cognome in maiuscolo (es. ROSSI)",
  "gender": "M o F",
  "birthDate": "Data di nascita nel formato YYYY-MM-DD (es. 1985-05-15)",
  "birthPlace": "Luogo o comune di nascita (es. MILANO o BERLIN)",
  "citizenship": "Nazionalità/Cittadinanza in italiano maiuscolo (es. ITALIANA, TEDESCA, FRANCESE, SVIZZERA)",
  "documentNumber": "Numero del documento (es. CA12345XX)",
  "issuePlace": "Luogo o ente di rilascio (es. COMUNE DI MILANO o QUESTURA DI SONDRIO)",
  "issueDate": "Data di rilascio nel formato YYYY-MM-DD (es. 2020-10-12)"
}

Ritorna SOLO ed ESCLUSIVAMENTE l'oggetto JSON. Non includere blocchi di codice markdown o spiegazioni. Se un campo non è rilevabile dal documento, lascialo vuoto (""). Assicurati di convertire le date nel formato YYYY-MM-DD.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { data: base64Data, mimeType: mimeType } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });

        const responseText = response.text?.trim();
        if (!responseText) {
          throw new Error('Gemini non ha restituito una risposta valida.');
        }

        try {
          parsedData = JSON.parse(responseText);
        } catch (parseErr) {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            throw parseErr;
          }
        }
      } else {
        // Fallback to local Tesseract OCR
        console.warn('[OCR] GEMINI_API_KEY non configurata: uso il fallback Tesseract (estrazione grezza, qualità inferiore). Imposta GEMINI_API_KEY nel file .env per un OCR affidabile.');
        const buffer = Buffer.from(base64Data, 'base64');
        const { data: { text } } = await Tesseract.recognize(buffer, 'ita');
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        
        // Basic naive extraction
        parsedData = {
          name: '',
          surname: '',
          gender: 'M',
          birthDate: '',
          birthPlace: '',
          citizenship: 'ITALIANA',
          documentNumber: '',
          issuePlace: '',
          issueDate: ''
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toUpperCase();
          if (line.includes('COGNOME') && lines[i+1]) {
            parsedData.surname = lines[i+1].replace(/[^A-Z\s]/g, '').trim();
          } else if (line.includes('NOME') && lines[i+1]) {
            parsedData.name = lines[i+1].replace(/[^A-Z\s]/g, '').trim();
          } else if (line.includes('DATA DI NASCITA')) {
            const dateMatch = (lines[i] + ' ' + (lines[i+1]||'')).match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/);
            if (dateMatch) parsedData.birthDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
          }
        }
        
        // Try to find any typical document number
        const docNumMatch = text.match(/\b([A-Z]{2}\d{5}[A-Z]{2}|[A-Z0-9]{9})\b/i);
        if (docNumMatch) parsedData.documentNumber = docNumMatch[1].toUpperCase();
      }

      res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('OCR scan failed:', err?.message || err, err?.stack || '');
      res.status(502).json({ success: false, error: 'Scansione intelligente fallita. Riprova o compila manualmente.' });
    }
  });


  apiRouter.post('/aurora-ai/chat', async (req, res) => {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    const rawImage = typeof req.body?.image === 'string' ? req.body.image : '';
    const imageMimeType = typeof req.body?.imageMimeType === 'string' ? req.body.imageMimeType : '';
    const hasImage = Boolean(rawImage && /^image\/(png|jpe?g|webp|heic|heif)$/i.test(imageMimeType));

    if ((!question && !hasImage) || question.length > 1000) {
      res.status(400).json({ success: false, error: 'Inserisci una domanda valida, fino a 1000 caratteri, oppure allega una foto.' });
      return;
    }
    // Base64 images are ~33% larger than the source file; cap around 6MB source (~8MB encoded).
    if (hasImage && rawImage.length > 8 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'La foto e troppo grande. Allega un immagine sotto i 6MB.' });
      return;
    }
    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({ success: false, error: 'Aurora AI non e ancora configurata. Contatta Nino per assistenza.' });
      return;
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .filter((message: unknown): message is { role: 'user' | 'model'; text: string } => {
            if (!message || typeof message !== 'object') return false;
            const item = message as { role?: unknown; text?: unknown };
            return (item.role === 'user' || item.role === 'model') && typeof item.text === 'string' && item.text.length <= 1000;
          })
          .slice(-10)
      : [];

    const guestToken = req.get('x-guest-token') || req.body?.guestToken;
    const guestPass = findValidGuestPass(guestToken);
    const personalizedInstructions = guestPass
      ? `${auroraAiInstructions}\n\nDATI DEL SOGGIORNO DI QUESTO OSPITE:\n${JSON.stringify({
          guestName: guestPass.guestName,
          checkInDate: guestPass.checkInDate,
          checkInTime: guestPass.checkInTime,
          checkOutDate: guestPass.checkOutDate,
          checkOutTime: guestPass.checkOutTime,
          guestsCount: guestPass.guestsCount
        })}`
      : auroraAiInstructions;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const userParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];
      if (question) userParts.push({ text: question });
      if (hasImage) {
        const base64Data = rawImage.includes(',') ? rawImage.split(',')[1] : rawImage;
        userParts.push({ inlineData: { data: base64Data, mimeType: imageMimeType } });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
          ...history.map((message: { role: 'user' | 'model'; text: string }) => ({
            role: message.role,
            parts: [{ text: message.text }]
          })),
          { role: 'user', parts: userParts }
        ],
        config: {
          systemInstruction: personalizedInstructions
        }
      });
      const answer = response.text?.trim();
      if (!answer) throw new Error('Gemini non ha restituito una risposta.');
      res.json({ success: true, answer });
    } catch (error) {
      console.error('Aurora AI request failed:', error);
      res.status(502).json({ success: false, error: 'Aurora AI non e disponibile al momento. Riprova tra poco o contatta Nino.' });
    }
  });

  // Health check
  apiRouter.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Aurora Valtellina Home Assistant Door Opener Engine',
      hassStatus: hassDoorState.status,
      hassDevice: hassDoorState.device
    });
  });

  // Keypad & Home Assistant Switch Status
  apiRouter.get('/keypad/status', (_req, res) => {
    res.json({
      status: hassDoorState.status,
      device: hassDoorState.device,
      currentActivePin: hassDoorState.currentActivePin,
      lastTriggeredAt: hassDoorState.lastTriggeredAt,
      guestName: hassDoorState.guestName,
      logs: hassDoorState.logs
    });
  });

  // Persistent Digital Key Access Logs (requires host authorization)
  apiRouter.get('/digital-key/logs', (req, res) => {
    res.json({
      success: true,
      logs: serverLogs
    });
  });

  // Real-time Lock physical status
  apiRouter.get('/lock/status', (_req, res) => {
    res.json({
      success: true,
      lockStatus: lockPhysicalState
    });
  });

  // Webhook for receiving real-time lock status from Home Assistant or Local Gateway
  apiRouter.post('/webhook/lock-status', (req, res) => {
    try {
      const { state, battery, signal } = req.body || {};
      
      let resolvedState: 'closed' | 'open' | 'offline' = 'closed';
      const inputState = state ? String(state).toLowerCase().trim() : '';
      
      if (['closed', 'locked', 'secure', 'chiusa', 'chiuso'].includes(inputState)) {
        resolvedState = 'closed';
      } else if (['open', 'unlocked', 'ajar', 'opened', 'aperta', 'aperto', 'socchiusa'].includes(inputState)) {
        resolvedState = 'open';
      } else if (['offline', 'unreachable', 'disconnected', 'non raggiungibile'].includes(inputState)) {
        resolvedState = 'offline';
      } else {
        resolvedState = lockPhysicalState.state;
      }
      
      lockPhysicalState.state = resolvedState;
      lockPhysicalState.lastUpdatedAt = new Date().toISOString();
      if (typeof battery === 'number') {
        lockPhysicalState.battery = battery;
      }
      if (typeof signal === 'number') {
        lockPhysicalState.signalStrength = signal;
      }
      
      const stateLabels = {
        closed: 'CHIUSA',
        open: 'APERTA/SOCCHIUSA',
        offline: 'OFFLINE'
      };
      
      hassDoorState.logs.unshift({
        timestamp: new Date().toISOString(),
        guest: 'Home Assistant Gateway',
        detail: `Stato serratura aggiornato via Webhook a: ${stateLabels[resolvedState]} (Batt: ${lockPhysicalState.battery}%, Segnale: ${lockPhysicalState.signalStrength}dBm)`
      });
      
      if (hassDoorState.logs.length > 25) {
        hassDoorState.logs.pop();
      }
      
      res.json({
        success: true,
        message: `Stato serratura aggiornato con successo a: ${stateLabels[resolvedState]}`,
        lockStatus: lockPhysicalState
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Door Unlock Handler
  const handleDoorUnlock = async (req: express.Request, res: express.Response) => {
    try {
      const { guestName, guest, source, latitude, longitude, accuracy, coords } = req.body || {};
      const config = getHomeAssistantConfig();
      const guestCoords: Coordinates | undefined = (coords || (typeof latitude === 'number' && typeof longitude === 'number'))
        ? { latitude: coords?.latitude ?? latitude, longitude: coords?.longitude ?? longitude, accuracy: coords?.accuracy ?? accuracy }
        : undefined;

      const proximity = verifyGuestProximity(req, config, guestCoords);
      const clientIp = proximity.clientIp;
      
      const guestToken = req.get('x-guest-token') || req.body?.guestToken;
      const pass = findValidGuestPass(guestToken);
      
      const actualGuest = pass ? `${pass.guestName} ${pass.guestSurname}`.trim() : (guestName || guest || 'Ospite Aurora');
      const actualSource = source || (pass 
        ? `Pulsante Ospite VIP (${proximity.method === 'gps' ? `GPS Verificato a ${proximity.distanceMeters}m` : 'Wi-Fi Verificato'})` 
        : 'Pannello Host');

      if (pass && !pass.checkInConfirmed) {
        const errorMsg = 'Accesso negato: il check-in deve essere prima confermato dall’host.';
        const logEntry = {
          timestamp: new Date().toISOString(),
          guestPassId: pass.id,
          guestName: actualGuest,
          success: false,
          errorMessage: errorMsg,
          source: actualSource,
          ipAddress: clientIp
        };
        serverLogs.unshift(logEntry);
        persistLogs();
        if (isSupabaseConfigured()) {
          await logDigitalKeyAccess(logEntry);
        }
        res.status(403).json({
          success: false,
          checkInNotConfirmed: true,
          error: errorMsg
        });
        return;
      }
      
      if (!proximity.verified) {
        const errorMsg = proximity.reason;
        const logEntry = {
          timestamp: new Date().toISOString(),
          guestPassId: pass ? pass.id : null,
          guestName: actualGuest,
          success: false,
          errorMessage: errorMsg,
          source: actualSource,
          ipAddress: clientIp
        };
        
        serverLogs.unshift(logEntry);
        persistLogs();
        if (isSupabaseConfigured()) {
          await logDigitalKeyAccess(logEntry);
        }
        
        res.status(403).json({
          success: false,
          wifiBlocked: true,
          proximityBlocked: true,
          error: errorMsg,
          proximity
        });
        return;
      }
      
      const lockProvider = getSmartLockProvider({
        provider: (config as any).provider || 'home_assistant',
        ...config
      });

      const result = await lockProvider.unlock({
        guestName: actualGuest,
        source: actualSource,
        guestPassId: pass ? pass.id : null,
        verifiedProximity: proximity.verified
      });

      const logEntry = {
        timestamp: new Date().toISOString(),
        guestPassId: pass ? pass.id : null,
        guestName: actualGuest,
        success: result.success,
        errorMessage: result.success ? undefined : (result.error || 'Errore di connessione o sblocco'),
        source: actualSource,
        ipAddress: clientIp
      };
      
      serverLogs.unshift(logEntry);
      persistLogs();
      if (isSupabaseConfigured()) {
        await logDigitalKeyAccess(logEntry);
      }

      if (result.success) {
        if (pass && !pass.firstUsedAt) {
          pass.firstUsedAt = logEntry.timestamp;
          
          persistPasses();
          if (isSupabaseConfigured()) {
            await upsertPass(pass);
          }
          
          const arrivalMessage = `🔔 *Conferma Arrivo Ospite* 🔔\n\nL'ospite *${actualGuest}* ha effettuato il suo *primo ingresso* assoluto sbloccando il portone digitale!\n\nMetodo verifica: ${proximity.method === 'gps' ? `📍 GPS Prossimità (${proximity.distanceMeters}m)` : '📶 Rete Wi-Fi'}\n📅 Data: ${new Date(logEntry.timestamp).toLocaleDateString('it-IT')}\n⏰ Ora: ${new Date(logEntry.timestamp).toLocaleTimeString('it-IT')}\n🔑 Codice PIN dell'ospite: ${pass.pinCode || 'N/A'}`;
          
          await sendHostNotification(arrivalMessage);
        }

        res.json({
          success: true,
          message: result.message || 'Portone sbloccato. Spingi la porta per entrare.',
          timestamp: logEntry.timestamp,
          proximityMethod: proximity.method
        });
      } else {
        const isWifiBlocked = (result as any).wifiBlocked;
        res.status(isWifiBlocked ? 403 : 500).json({
          success: false,
          error: result.error || 'Impossibile completare lo sblocco',
          wifiBlocked: isWifiBlocked
        });
      }
    } catch (err: any) {
      console.error('Error handling door unlock:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Errore interno del server'
      });
    }
  };

  apiRouter.post('/hass/unlock', handleDoorUnlock);
  apiRouter.post('/ewelink/unlock', handleDoorUnlock);

  // Home Assistant / Smart Lock Checkout Scenario
  apiRouter.post('/hass/checkout', async (req, res) => {
    try {
      const guestToken = req.get('x-guest-token') || req.body?.guestToken;
      const pass = findValidGuestPass(guestToken);
      const guestName = pass ? `${pass.guestName} ${pass.guestSurname}`.trim() : 'Host';
      
      const config = getHomeAssistantConfig();
      const lockProvider = getSmartLockProvider({
        provider: (config as any).provider || 'home_assistant',
        ...config
      });

      const result = lockProvider.checkout 
        ? await lockProvider.checkout(guestName)
        : await triggerHomeAssistantCheckout(guestName);
      
      hassDoorState.logs.unshift({
        timestamp: new Date().toISOString(),
        guest: guestName,
        detail: result.success 
          ? `Scenario Check-out attivato con successo: ${result.message || ''}` 
          : `Errore scenario Check-out: ${result.error || ''}`
      });
      if (hassDoorState.logs.length > 25) {
        hassDoorState.logs.pop();
      }

      if (result.success) {
        res.json({ success: true, message: result.message, provider: result.provider });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (err: any) {
      console.error('Error handling checkout trigger:', err);
      res.status(500).json({ success: false, error: err.message || 'Errore interno del server' });
    }
  });

  // Wi-Fi Status
  apiRouter.get('/wifi/status', async (req, res) => {
    await hydrateHomeAssistantConfig();
    const config = getHomeAssistantConfig();
    const { verified, isMatchIp, isLocal, clientIp, homePublicIp } = verifyWifiConnection(req, config);

    res.json({
      configuredSsid: config.wifiSsidRequired || 'Casa_Aurora',
      clientIp,
      homePublicIp: homePublicIp || 'Non configurato',
      isLocalLan: isLocal,
      isHomePublicIp: isMatchIp,
      verified
    });
  });

  // Proximity & Geofencing Verification Endpoint
  apiRouter.post('/proximity/verify', async (req, res) => {
    await hydrateHomeAssistantConfig();
    await hydratePropertyConfig();
    const config = getHomeAssistantConfig();
    const { latitude, longitude, accuracy } = req.body || {};
    const coords: Coordinates | undefined = (typeof latitude === 'number' && typeof longitude === 'number')
      ? { latitude, longitude, accuracy }
      : undefined;

    const proximity = verifyGuestProximity(req, config, coords);
    res.json({
      success: true,
      ...proximity
    });
  });

  // Wi-Fi Verify (with automatic GPS fallback if coordinates are provided)
  apiRouter.post('/wifi/verify', async (req, res) => {
    await hydrateHomeAssistantConfig();
    await hydratePropertyConfig();
    const config = getHomeAssistantConfig();
    const { latitude, longitude, accuracy } = req.body || {};
    const coords: Coordinates | undefined = (typeof latitude === 'number' && typeof longitude === 'number')
      ? { latitude, longitude, accuracy }
      : undefined;

    const proximity = verifyGuestProximity(req, config, coords);

    res.json({
      verified: proximity.verified,
      method: proximity.method,
      clientIp: proximity.clientIp,
      homePublicIp: proximity.homePublicIp,
      distanceMeters: proximity.distanceMeters,
      geofenceRadiusMeters: proximity.geofenceRadiusMeters,
      reason: proximity.reason,
      details: {
        ssidExpected: config.wifiSsidRequired || 'Casa_Aurora',
        matchedByPublicIp: proximity.isMatchIp,
        isLocalLan: proximity.isLocalLan
      }
    });
  });

  // Set Home IP
  apiRouter.post('/wifi/set-home-ip', async (req, res) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '';
    const { ip } = req.body || {};
    const targetIp = ip || clientIp;

    if (!targetIp) {
      res.status(400).json({ success: false, error: 'Impossibile rilevare indirizzo IP' });
      return;
    }

    await updateHomeAssistantConfigAsync({ homePublicIp: targetIp });
    res.json({
      success: true,
      message: `IP pubblico di Casa_Aurora impostato a: ${targetIp}`,
      homePublicIp: targetIp
    });
  });

  // Property Configuration Endpoints (Multi-Host / SaaS Ready)
  apiRouter.get('/property/config', async (req, res) => {
    await hydratePropertyConfig();
    const config = getPropertyConfig();
    res.json({ success: true, config });
  });

  apiRouter.put('/property/config', async (req, res) => {
    try {
      const updated = await updatePropertyConfig(req.body);
      res.json({
        success: true,
        message: 'Configurazione struttura salvata con successo.',
        config: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // CMS Endpoints
  apiRouter.get('/cms/content', async (_req, res) => {
    try {
      const data = await getCmsDataAsync();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/save', async (req, res) => {
    try {
      const data = req.body.data || req.body.content || req.body;
      if (!data || typeof data !== 'object') {
        res.status(400).json({ success: false, error: 'Dati mancanti' });
        return;
      }
      await saveCmsDataAsync(data);
      res.json({ success: true, message: 'Dati CMS salvati con successo', data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/translate', async (req, res) => {
    try {
      const { text, sourceLang } = req.body;
      if (!text || !sourceLang) {
        res.status(400).json({ success: false, error: 'Campi obbligatori mancanti: text, sourceLang' });
        return;
      }
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({ success: false, error: 'Configurazione Gemini assente sul server.' });
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const targetLangs = ['it', 'en', 'de', 'fr', 'es'].filter(l => l !== sourceLang);
      const prompt = `Traduci il seguente testo dalla lingua '${sourceLang}' alle seguenti lingue di destinazione: ${targetLangs.join(', ')}. Mantieni lo stile, il formato (ad esempio se ci sono numeri o emoji) ed il tono del testo originale. Non aggiungere commenti personali, traduci solo il testo in modo naturale.
Testo originale:
"${text}"

Ritorna una risposta in formato JSON strutturato con le chiavi delle lingue destinazione:
{
  ${targetLangs.map(l => `"${l}": "traduzione in ${l}"`).join(',\n  ')}
}

Ritorna SOLO ed ESCLUSIVAMENTE l'oggetto JSON. Non includere blocchi di codice markdown o spiegazioni.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error('Gemini non ha restituito una risposta valida.');
      }

      let parsedTranslations: any = {};
      try {
        parsedTranslations = JSON.parse(responseText);
      } catch (parseErr) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedTranslations = JSON.parse(jsonMatch[0]);
        } else {
          throw parseErr;
        }
      }

      res.json({ success: true, translations: parsedTranslations });
    } catch (err: any) {
      console.error('Translation with Gemini failed:', err);
      res.status(502).json({ success: false, error: 'Traduzione automatica fallita. Riprova più tardi.' });
    }
  });


  apiRouter.post('/cms/section', async (req, res) => {
    try {
      const { language, section, content } = req.body;
      if (!language || !section || !content) {
        res.status(400).json({ success: false, error: 'Campi obbligatori mancanti: language, section, content' });
        return;
      }
      const current: any = await getCmsDataAsync();
      if (!current[language]) current[language] = {};
      current[language][section] = { ...(current[language][section] || {}), ...content };
      await saveCmsDataAsync(current);
      const updated = current;
      res.json({ success: true, message: `Sezione ${section} aggiornata`, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/reset', async (_req, res) => {
    try {
      const defaults = resetCmsData();
      await saveCmsDataAsync(defaults);
      res.json({ success: true, message: 'CMS ripristinato ai valori predefiniti', data: defaults });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.get('/cms/media', async (_req, res) => {
    try {
      const media = await getCmsMediaAsync();
      res.json({ success: true, media });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/upload-photo', async (req, res) => {
    try {
      const photoKey = req.body.photoKey || req.body.key;
      const base64DataUrl = req.body.base64DataUrl || req.body.fileBase64 || req.body.dataUrl;
      const filename = req.body.filename || `${photoKey}.jpg`;

      if (!photoKey || !base64DataUrl) {
        res.status(400).json({ success: false, error: 'photoKey e base64DataUrl sono obbligatori' });
        return;
      }
      const result = saveUploadedPhoto(photoKey, filename, base64DataUrl);
      if (result.success) {
        if (result.media) await saveCmsMediaAsync(result.media);
        res.json({ success: true, url: result.url, media: result.media });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/save-media-url', async (req, res) => {
    try {
      const photoKey = req.body.photoKey || req.body.key;
      const url = req.body.url;
      if (!photoKey || !url) {
        res.status(400).json({ success: false, error: 'photoKey e url sono obbligatori' });
        return;
      }
      const media = await getCmsMediaAsync();
      media[photoKey] = url;
      await saveCmsMediaAsync(media);
      res.json({ success: true, media });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/reset-photo', async (req, res) => {
    try {
      const photoKey = req.body.photoKey || req.body.key;
      if (!photoKey) {
        res.status(400).json({ success: false, error: 'photoKey obbligatoria' });
        return;
      }
      const result = resetCmsPhoto(photoKey);
      await saveCmsMediaAsync(result);
      res.json({ success: true, media: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Parser & Config Endpoints
  apiRouter.post('/parse-booking', (req, res) => {
    const rawText = req.body?.rawText || req.body?.text || req.body?.body || '';
    if (!rawText || typeof rawText !== 'string') {
      res.status(400).json({ success: false, error: 'Nessun testo fornito' });
      return;
    }
    const parsed = parseBedAndBreakfastBooking(rawText);
    res.json({ success: true, parsed });
  });

  apiRouter.get('/hass/config', async (req, res) => {
    await hydrateHomeAssistantConfig();
    const config = getHomeAssistantConfig();
    const token = config.accessToken;
    const maskedToken = token ? `${token.slice(0, 4)}••••••••${token.slice(-4)}` : '';
    res.json({
      mode: config.mode,
      webhookUrl: config.webhookUrl,
      haUrl: config.haUrl,
      accessToken: maskedToken,
      hasToken: Boolean(token),
      entityId: config.entityId,
      service: config.service,
      deviceName: config.deviceName,
      wifiSsidRequired: config.wifiSsidRequired,
      homePublicIp: config.homePublicIp,
      lanGatewayIp: config.lanGatewayIp,
      localWebhookUrl: config.localWebhookUrl,
      enabled: config.enabled,
      status: hassDoorState.status
    });
  });

  apiRouter.get('/ewelink/config', (_req, res) => {
    const config = getHomeAssistantConfig();
    res.json({
      webhookUrl: config.webhookUrl,
      haUrl: config.haUrl,
      entityId: config.entityId,
      deviceName: config.deviceName,
      enabled: config.enabled,
      status: hassDoorState.status
    });
  });

  apiRouter.post('/hass/config', async (req, res) => {
    const { mode, webhookUrl, haUrl, accessToken, entityId, service, deviceName, wifiSsidRequired, homePublicIp, lanGatewayIp, localWebhookUrl, enabled } = req.body;
    const currentConfig = getHomeAssistantConfig();
    
    let resolvedToken = currentConfig.accessToken;
    if (accessToken && !accessToken.includes('••••')) {
      resolvedToken = accessToken.trim();
    }

    const updated = await updateHomeAssistantConfigAsync({
      ...(mode && { mode }),
      ...(webhookUrl !== undefined && { webhookUrl }),
      ...(haUrl !== undefined && { haUrl }),
      ...(resolvedToken !== undefined && { accessToken: resolvedToken }),
      ...(entityId && { entityId }),
      ...(service && { service }),
      ...(deviceName && { deviceName }),
      ...(wifiSsidRequired !== undefined && { wifiSsidRequired }),
      ...(homePublicIp !== undefined && { homePublicIp }),
      ...(lanGatewayIp !== undefined && { lanGatewayIp }),
      ...(localWebhookUrl !== undefined && { localWebhookUrl }),
      ...(enabled !== undefined && { enabled })
    });

    hassDoorState.status = 'ready';
    hassDoorState.device = updated.deviceName || 'Home Assistant (Pulsante Portone)';

    res.json({
      success: true,
      message: 'Configurazione Home Assistant aggiornata con successo',
      config: {
        mode: updated.mode,
        webhookUrl: updated.webhookUrl,
        haUrl: updated.haUrl,
        hasToken: Boolean(updated.accessToken),
        entityId: updated.entityId,
        service: updated.service,
        deviceName: updated.deviceName,
        wifiSsidRequired: updated.wifiSsidRequired,
        homePublicIp: updated.homePublicIp,
        lanGatewayIp: updated.lanGatewayIp,
        localWebhookUrl: updated.localWebhookUrl,
        enabled: updated.enabled
      }
    });
  });

  apiRouter.post('/ewelink/config', async (req, res) => {
    const { webhookUrl, entityId, deviceName, enabled } = req.body;
    const updated = await updateHomeAssistantConfigAsync({
      ...(webhookUrl !== undefined && { webhookUrl }),
      ...(entityId && { entityId }),
      ...(deviceName && { deviceName }),
      ...(enabled !== undefined && { enabled })
    });

    hassDoorState.status = 'ready';
    hassDoorState.device = updated.deviceName || 'Home Assistant (Pulsante Portone)';

    res.json({
      success: true,
      message: 'Configurazione aggiornata',
      config: updated
    });
  });

  apiRouter.post('/hass/test', async (req, res) => {
    try {
      const result = await sendHomeAssistantOnInput('Test Configurazione', 'Test Manuale Portale Host');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/ewelink/test', async (req, res) => {
    try {
      const result = await sendHomeAssistantOnInput('Test Configurazione', 'Test Compatibilità EWeLink');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Email & IMAP Config and Log endpoints
  apiRouter.get('/email/config', (req, res) => {
    res.json({
      success: true,
      config: getImapConfig()
    });
  });

  apiRouter.post('/email/config', async (req, res) => {
    try {
      const { host, port, secure, user, pass, enabled, intervalMs } = req.body;
      await updateImapConfigAsync({
        ...(host !== undefined && { host: String(host) }),
        ...(port !== undefined && { port: Number(port) }),
        ...(secure !== undefined && { secure: Boolean(secure) }),
        ...(user !== undefined && { user: String(user) }),
        ...(pass !== undefined && { pass: String(pass) }),
        ...(enabled !== undefined && { enabled: Boolean(enabled) }),
        ...(intervalMs !== undefined && { intervalMs: Number(intervalMs) })
      });
      res.json({
        success: true,
        message: 'Configurazione Email (IMAP) aggiornata con successo',
        config: getImapConfig()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

    apiRouter.post('/email/sync-now', async (_req, res) => {
    try {
      // sync-now uses forceAll=true which bypasses the isPolling check
      // and clears processed UIDs for a full backfill
      await checkNewEmailsAndGeneratePasses(serverPasses, true);
      persistPasses();
      res.json({
        success: true,
        message: 'Sincronizzazione email iReservation avviata con successo! Elaborati fino a 500 messaggi in questo ciclo. Se ne rimangono, riprova o attendi il prossimo polling.',
        totalPasses: serverPasses.length
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Errore durante la sincronizzazione email' });
    }
  });

  apiRouter.get('/email/logs', async (_req, res) => {
    try {
      const logs = await getEmailLogs();
      res.json({
        success: true,
        logs
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Errore durante il recupero dei log' });
    }
  });

  // Backward compatibility alias for deprecated iCal endpoints mapping to Email Sync
  apiRouter.get('/ical/config', (req, res) => {
    res.json({
      success: true,
      config: getImapConfig()
    });
  });

  apiRouter.post('/ical/config', async (req, res) => {
    try {
      const { enabled, intervalMs } = req.body;
      await updateImapConfigAsync({
        ...(enabled !== undefined && { enabled: Boolean(enabled) }),
        ...(intervalMs !== undefined && { intervalMs: Number(intervalMs) })
      });
      res.json({
        success: true,
        message: 'Configurazione aggiornata',
        config: getImapConfig()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/ical/sync-now', async (_req, res) => {
    try {
      await syncReservationsFromIcal(serverPasses);
      persistPasses();
      res.json({
        success: true,
        message: 'Sincronizzazione iCal completata con successo!',
        totalPasses: serverPasses.length
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Errore durante la sincronizzazione iCal' });
    }
  });

  // Webhook Booking Receiver
  apiRouter.post('/webhook/booking', async (req, res) => {
    try {
      const payload = req.body;
      const isStructuredPayload = payload && typeof payload === 'object' && !Array.isArray(payload);
      const rawText = typeof payload === 'string'
        ? payload
        : (payload.text || payload.body || payload.message || '');
      
      const parsed = isStructuredPayload && !rawText
        ? { guestName: '', guestSurname: '', checkInDate: '', checkOutDate: '', phone: '', bookingRef: '', guestsCount: 2, bookingSource: '' }
        : parseBedAndBreakfastBooking(rawText);

      const guestName = (isStructuredPayload ? payload.guestName || payload.name : parsed.guestName) || '';
      const guestSurname = (isStructuredPayload ? payload.guestSurname || payload.surname : parsed.guestSurname) || '';
      const checkInDate = (isStructuredPayload ? payload.checkInDate || payload.checkIn : parsed.checkInDate) || '';
      const checkOutDate = (isStructuredPayload ? payload.checkOutDate || payload.checkOut : parsed.checkOutDate) || '';
      const phone = (isStructuredPayload ? payload.phone || payload.tel : parsed.phone) || '';
      const bookingRef = (isStructuredPayload ? payload.bookingRef || payload.ref : parsed.bookingRef) || `BB-${Math.floor(10000 + Math.random() * 90000)}`;
      const guestsCount = (isStructuredPayload ? payload.guestsCount : parsed.guestsCount) || 2;
      const bookingSource = (isStructuredPayload ? payload.bookingSource : parsed.bookingSource) || 'bed-and-breakfast.it (webhook)';
      const pinCode = generateRandomPin();

      if (!guestName || !checkInDate || !checkOutDate) {
        res.status(400).json({
          success: false,
          error: 'Prenotazione incompleta: servono nome ospite, data check-in e data check-out.'
        });
        return;
      }

      const newPass: GuestPass = {
        id: `pass-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        guestName,
        guestSurname,
        checkInDate,
        checkInTime: '14:00',
        checkOutDate,
        checkOutTime: '10:00',
        phone,
        pinCode,
        bookingRef,
        guestsCount,
        bookingSource,
        notes: (parsed as any).notes || `Ricevuto autonomamente via webhook`,
        createdAt: new Date().toISOString(),
        active: true,
        checkInConfirmed: false,
        token: ''
      };

      const token = crypto.randomBytes(32).toString('base64url');
      newPass.token = token;

      // If this bookingRef was in deletedBookingRefs, remove it so it is active again
      if (bookingRef && deletedBookingRefs.includes(bookingRef)) {
        const delIdx = deletedBookingRefs.indexOf(bookingRef);
        if (delIdx !== -1) {
          deletedBookingRefs.splice(delIdx, 1);
          safeWriteFileSync(DELETED_REFS_REL_PATH, JSON.stringify(deletedBookingRefs, null, 2));
          if (isSupabaseConfigured()) {
            try {
              await saveDocument('deleted_booking_refs', deletedBookingRefs);
            } catch (error) {
              console.error('Failed to save deleted booking refs to Supabase:', error);
            }
          }
          void hydrateDeletedRefsFromSupabase(true);
        }
      }

      serverPasses.unshift(newPass);
      persistPasses();
      await upsertPass(newPass);

      const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
      const guestUrl = `${origin}/?pass=${token}`;

      // Schedule the welcome message (which sends immediately) + pre-checkin + checkout messages!
      await scheduleBookingMessages(newPass, origin);

      // Get the message status to return to the webhook client
      const allScheduled = getScheduledMessages();
      const welcomeMsg = allScheduled.find(m => m.passId === newPass.id && m.triggerType === 'welcome');
      const messageSent = welcomeMsg ? (welcomeMsg.status === 'sent' || welcomeMsg.status === 'sending') : false;
      const messageChannel = welcomeMsg?.channel || 'whatsapp';
      const whatsappMessage = welcomeMsg?.messageText || formatInvitationMessage(newPass, guestUrl);
      const whatsappUrl = phone ? `https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : null;

      res.status(201).json({
        success: true,
        message: 'Pass VIP generato autonomamente con successo!',
        pass: newPass,
        token,
        link: guestUrl,
        guestUrl,
        whatsappUrl,
        whatsappMessage,
        messageSent,
        messageChannel,
        links: {
          guestDirectUrl: guestUrl,
          whatsappInvitationText: whatsappMessage,
          whatsappDirectLink: whatsappUrl
        }
      });
    } catch (err: any) {
      console.error('Webhook error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.get('/webhook/booking', (req, res) => {
    res.json({
      status: 'active',
      description: 'Webhook autonomo per ricevere notifiche di prenotazione da Bed-and-Breakfast.it, Zapier o Make',
      method: 'POST',
      acceptedFormats: ['application/json', 'application/x-www-form-urlencoded', 'text/plain'],
      expectedFields: {
        rawText: 'Testo dell\'email o della notifica di prenotazione (es. Ospite: Mario Rossi, Check-in: 15/09/2026, ...)',
        guestName: 'Opzionale (se già estratto)',
        guestSurname: 'Opzionale',
        checkInDate: 'Opzionale (YYYY-MM-DD)',
        checkOutDate: 'Opzionale (YYYY-MM-DD)',
        phone: 'Opzionale (+39...)',
        bookingRef: 'Opzionale (Es. BB-12345)'
      },
      exampleCurl: `curl -X POST https://${req.get('host')}/api/webhook/booking -H "Content-Type: application/json" -d '{"rawText": "Nuova prenotazione per Mario Rossi dal 15/09/2026 al 18/09/2026 tel: +39 340 1234567"}'`
    });
  });

  // Webhook iReservation Email Receiver
  apiRouter.post('/webhook/ireservation', async (req, res) => {
    try {
      let rawText = '', html = '', emailSubject = '', emailSender = '';
      const contentType = req.get('content-type') || '';
      if (contentType.includes('message/rfc822') || (contentType.includes('text/plain') && typeof req.body === 'string' && !req.body.startsWith('{'))) {
        try {
          const parsedMime = await simpleParser(req.body);
          rawText = parsedMime.text || '';
          html = parsedMime.html || '';
          emailSubject = parsedMime.subject || '';
          emailSender = parsedMime.from?.value[0]?.address || '';
        } catch (mimeErr) {
          rawText = req.body;
        }
      } else {
        const payload = req.body || {};
        rawText = payload.text || payload.rawText || payload.body || payload.message || '';
        html = payload.html || '';
        emailSubject = payload.subject || '';
        emailSender = payload.from || payload.sender || payload.email || '';
        if (payload.rawEmail && typeof payload.rawEmail === 'string') {
          try {
            const parsedMime = await simpleParser(payload.rawEmail);
            rawText = parsedMime.text || rawText;
            html = parsedMime.html || html;
            emailSubject = parsedMime.subject || emailSubject;
            emailSender = parsedMime.from?.value[0]?.address || emailSender;
          } catch {}
        }
      }
      console.log(`[iReservation] Payload. Sender: "${emailSender}", Subject: "${emailSubject}", Text: ${rawText.length}`);

      // Filtro di sicurezza: Accetta SOLO email provenienti da noreply@bed-and-breakfast.it
      const isFromNoreplyBB = emailSender.toLowerCase() === 'noreply@bed-and-breakfast.it';
      if (!isFromNoreplyBB) {
        console.log(`[iReservation Webhook] Email ignorata (mittente non è noreply@bed-and-breakfast.it). Sender: "${emailSender}", Subject: "${emailSubject}"`);
        res.json({ success: false, message: 'Email ignorata: sorgente non autorizzata.' });
        return;
      }

      const subjectLower = emailSubject.toLowerCase();
      const isBookingEmail = subjectLower.includes('ireservation');
      const isCancellation = 
        /cancellata|cancellazione|annullat[ao]|annullamento|cancelled|cancel/i.test(emailSubject) ||
        /prenotazione\s*e\s*stata\s*cancellata|prenotazione\s*cancellata|prenotazione\s*annullata|booking\s*cancelled|status\s*[:=]\s*(?:cancellata|annullata|cancelled|deleted)/i.test(rawText.replace(/[\s\r\n\t]+/g, ' '));

      if (!isBookingEmail && !isCancellation) {
        console.log(`[iReservation Webhook] Email ignorata (non è iReservation e non è un annullamento). Sender: "${emailSender}", Subject: "${emailSubject}"`);
        res.json({ success: false, message: 'Email ignorata: non è una mail di prenotazione iReservation né di annullamento.' });
        return;
      }

      console.log(`[iReservation Webhook] Elaborazione webhook email. Sender: "${emailSender}", Subject: "${emailSubject}", Cancellazione: ${isCancellation}`);

      // Parsiamo l'email usando l'API di Gemini per ottenere dati super accurati
      let parsed = await parseEmailWithGemini(html || rawText, isCancellation);

      // Fallback al parser regex locale se Gemini fallisce o non è configurato
      if (!parsed) {
        console.log('[iReservation Webhook] Gemini non disponibile o errore, uso il parser regex locale di fallback.');
        const localParsed = parseIReservationEmail(rawText, html);
        parsed = {
          bookingRef: localParsed.bookingRef,
          bookingSource: localParsed.bookingSource,
          guestName: localParsed.guestName,
          guestSurname: localParsed.guestSurname,
          guestEmail: localParsed.guestEmail,
          phone: localParsed.phone,
          apartmentName: localParsed.apartmentName,
          checkInDate: localParsed.checkInDate,
          checkOutDate: localParsed.checkOutDate,
          nightsCount: localParsed.nightsCount,
          guestsCount: localParsed.guestsCount,
          amount: localParsed.amount
        };
      }

      const bookingRef = parsed.bookingRef;

      // Se si tratta di una mail di test da Bed-and-Breakfast, completiamo i dati mancanti per far sì che crei comunque il pass!
      const isTestEmail = /\btest\b/i.test(emailSubject) || /\btest\b/i.test(rawText) || /\btest\b/i.test(html || '');
      if (bookingRef && isTestEmail) {
        if (!parsed.guestName) parsed.guestName = 'Ospite Test';
        if (!parsed.guestSurname) parsed.guestSurname = 'BB';
        if (!parsed.checkInDate) parsed.checkInDate = new Date().toISOString().split('T')[0];
        if (!parsed.checkOutDate) parsed.checkOutDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      }

      if (isCancellation) {
        console.log(`[iReservation Webhook] Rilevata notifica di CANCELLAZIONE per ID "${bookingRef}"`);
        if (!bookingRef) {
          await addEmailLog({
            sender: emailSender,
            subject: emailSubject,
            status: 'error',
            message: `Ricevuto webhook di cancellazione ma impossibile estrarre l'ID prenotazione`,
            details: { emailSubject, snippet: rawText.substring(0, 300) }
          });
          res.status(400).json({ success: false, error: 'Cancellazione ignorata: ID Prenotazione non identificato.' });
          return;
        }

        const existingIdx = serverPasses.findIndex(p => p.bookingRef === bookingRef || p.id === `ires-${bookingRef}`);
        if (existingIdx !== -1) {
          const targetPass = serverPasses[existingIdx];
          targetPass.active = false;
          targetPass.notes = `DISATTIVATO via Email di Cancellazione iReservation il ${new Date().toISOString()}.\n${targetPass.notes || ''}`;
          
          persistPasses();
          await upsertPass(targetPass);
          const cancelledCount = await cancelAllMessagesForPass(targetPass.id);
          
          console.log(`[iReservation Webhook] Soggiorno disattivato per ID "${bookingRef}". Cancellati ${cancelledCount} messaggi programmati.`);
          
          await addEmailLog({
            sender: emailSender,
            subject: emailSubject,
            status: 'success',
            message: `Annullata prenotazione per ${targetPass.guestName} ${targetPass.guestSurname} (ID: ${bookingRef}) via Webhook`,
            details: { bookingRef, parsed }
          });

          res.status(200).json({ success: true, message: 'Prenotazione disattivata e messaggi in coda rimossi.', pass: targetPass });
          return;
        } else {
          console.warn(`[iReservation Webhook] Cancellazione ricevuta per ID "${bookingRef}" ma nessun pass corrisponde.`);
          
          await addEmailLog({
            sender: emailSender,
            subject: emailSubject,
            status: 'warning',
            message: `Annullamento Webhook ricevuto per ID ${bookingRef} ma nessun pass corrispondente trovato`,
            details: { bookingRef, parsed }
          });

          res.status(200).json({ success: true, message: 'Ricevuto annullamento per prenotazione non esistente.' });
          return;
        }
      }

      console.log('[iReservation Webhook] Parsed:', parsed);

      if (!bookingRef || !parsed.guestName || !parsed.checkInDate || !parsed.checkOutDate) {
        const errM = `Dati incompleti. ID: "${bookingRef}", Ospite: "${parsed.guestName}", Check-in: "${parsed.checkInDate}", Check-out: "${parsed.checkOutDate}"`;
        console.error(`[iReservation Webhook] ${errM}`);
        
        await addEmailLog({
          sender: emailSender,
          subject: emailSubject,
          status: 'warning',
          message: `Webhook iReservation ignorato per dati incompleti. ID: "${bookingRef || 'Mancante'}", Ospite: "${parsed.guestName || 'Mancante'}", Check-in: "${parsed.checkInDate || 'Mancante'}", Check-out: "${parsed.checkOutDate || 'Mancante'}"`,
          details: { bookingRef, parsed, snippet: rawText.substring(0, 300) }
        });

        res.status(400).json({ success: false, error: errM, parsed });
        return;
      }

      const { bookingSource, guestName, guestSurname, guestEmail, phone, apartmentName, checkInDate, checkOutDate, nightsCount, guestsCount, amount } = parsed;
      const existingIdx = serverPasses.findIndex(p => p.bookingRef === bookingRef || p.id === `ires-${bookingRef}`);
      let targetPass: GuestPass;

      if (existingIdx !== -1) {
        const existingPass = serverPasses[existingIdx];
        targetPass = {
          ...existingPass, guestName, guestSurname, phone: phone || existingPass.phone, guestEmail: guestEmail || existingPass.guestEmail,
          checkInDate, checkOutDate, guestsCount, bookingSource, amount, apartmentName, nightsCount, active: true,
          notes: `Aggiornato da Email iReservation il ${new Date().toISOString()}.\nOriginale: ${existingPass.notes || ''}`
        };
        serverPasses[existingIdx] = targetPass;

        await addEmailLog({
          sender: emailSender,
          subject: emailSubject,
          status: 'success',
          message: `Aggiornato pass ospite per ${parsed.guestName} ${parsed.guestSurname} (ID: ${bookingRef}) via Webhook`,
          details: { bookingRef, parsed }
        });
      } else {
        const pinCode = generateRandomPin();
        const token = crypto.randomBytes(32).toString('base64url');
        targetPass = {
          id: `ires-${bookingRef}`, guestName, guestSurname, phone, guestEmail, checkInDate, checkInTime: '14:00',
          checkOutDate, checkOutTime: '10:00', pinCode, bookingRef, guestsCount, bookingSource, amount,
          apartmentName, nightsCount, notes: `Generato da Email iReservation il ${new Date().toISOString()}`,
          createdAt: new Date().toISOString(), active: true, checkInConfirmed: false, token
        };
        serverPasses.unshift(targetPass);
      }

      persistPasses();
      await upsertPass(targetPass);

      const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
      const guestUrl = `${origin}/?pass=${targetPass.token}`;

      await scheduleBookingMessages(targetPass, origin);

      const allScheduled = getScheduledMessages();
      const welcomeMsg = allScheduled.find(m => m.passId === targetPass.id && m.triggerType === 'welcome');
      const messageSent = welcomeMsg ? (welcomeMsg.status === 'sent' || welcomeMsg.status === 'sending') : false;
      const messageChannel = welcomeMsg?.channel || 'whatsapp';
      const welcomeMessageText = welcomeMsg?.messageText || formatInvitationMessage(targetPass, guestUrl);

      res.status(existingIdx !== -1 ? 200 : 201).json({
        success: true, message: existingIdx !== -1 ? 'Prenotazione aggiornata!' : 'Prenotazione creata!',
        pass: targetPass, token: targetPass.token, link: guestUrl, guestUrl, messageSent, messageChannel, welcomeMessageText
      });
    } catch (err: any) {
      console.error('[iReservation] Errore:', err);
      if (isSupabaseConfigured()) {
        try {
          const currentLogs = (await loadDocument<any[]>('ireservation_fallback_logs')) || [];
          currentLogs.unshift({ timestamp: new Date().toISOString(), error: err.message || 'Errore', stack: err.stack });
          await saveDocument('ireservation_fallback_logs', currentLogs.slice(0, 100));
        } catch {}
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET endpoint for iReservation status/metadata
  apiRouter.get('/webhook/ireservation', (req, res) => {
    res.json({
      status: 'active',
      description: 'Elaborazione automatica delle email di conferma inviate da iReservation',
      method: 'POST',
      acceptedFormats: ['application/json', 'application/x-www-form-urlencoded', 'message/rfc822', 'text/plain'],
      expectedFields: {
        rawEmail: 'Testo dell\'email MIME originale intera',
        html: 'Opzionale (HTML email iReservation)',
        text: 'Opzionale (Text email iReservation)'
      }
    });
  });

  // Generate Link
  apiRouter.all('/generate-link', async (req, res) => {
    try {
      const data = req.method === 'POST' ? req.body : req.query;
      const {
        guestName,
        guestSurname = '',
        checkInDate,
        checkInTime = '14:00',
        checkOutDate,
        checkOutTime = '10:00',
        phone = '',
        pinCode = generateRandomPin(),
        bookingRef = `DIR-${Math.floor(1000 + Math.random() * 9000)}`,
        guestsCount = 2,
        bookingSource = 'Pannello Host'
      } = data;

      if (!guestName || !checkInDate || !checkOutDate) {
        res.status(400).json({
          error: 'Campi obbligatori mancanti: guestName, checkInDate, checkOutDate'
        });
        return;
      }

      const newPass: GuestPass = {
        id: `pass-${Date.now()}`,
        guestName,
        guestSurname,
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime,
        phone,
        pinCode,
        bookingRef,
        guestsCount: Number(guestsCount) || 2,
        bookingSource,
        createdAt: new Date().toISOString(),
        active: true,
        checkInConfirmed: false,
        token: ''
      };

      const token = crypto.randomBytes(32).toString('base64url');
      newPass.token = token;

      // If this bookingRef was in deletedBookingRefs, remove it so it is active again
      if (bookingRef && deletedBookingRefs.includes(bookingRef)) {
        const delIdx = deletedBookingRefs.indexOf(bookingRef);
        if (delIdx !== -1) {
          deletedBookingRefs.splice(delIdx, 1);
          safeWriteFileSync(DELETED_REFS_REL_PATH, JSON.stringify(deletedBookingRefs, null, 2));
          if (isSupabaseConfigured()) {
            try {
              await saveDocument('deleted_booking_refs', deletedBookingRefs);
            } catch (error) {
              console.error('Failed to save deleted booking refs to Supabase:', error);
            }
          }
          void hydrateDeletedRefsFromSupabase(true);
        }
      }

      serverPasses.unshift(newPass);
      persistPasses();
      await upsertPass(newPass);

      const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
      const guestUrl = `${origin}/?pass=${token}`;

      // Schedule automatic messages (Welcome, Pre-checkin, Checkout)
      await scheduleBookingMessages(newPass, origin);

      const allScheduled = getScheduledMessages();
      const welcomeMsg = allScheduled.find(m => m.passId === newPass.id && m.triggerType === 'welcome');
      const whatsappMessage = welcomeMsg?.messageText || formatInvitationMessage(newPass, guestUrl);
      const whatsappLink = phone ? `https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : null;

      res.json({
        success: true,
        pass: newPass,
        token,
        link: guestUrl,
        guestUrl,
        whatsappUrl: whatsappLink,
        whatsappMessage,
        whatsappLink
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Passes List & Delete
  apiRouter.get('/passes', (_req, res) => {
    res.json({
      success: true,
      passes: sortGuestPasses(serverPasses)
    });
  });

  // Scheduled Messages Management
  apiRouter.get('/scheduled-messages', (_req, res) => {
    res.json({
      success: true,
      messages: getScheduledMessages()
    });
  });

  apiRouter.post('/scheduled-messages/:id/send', async (req, res) => {
    const id = req.params.id;
    const success = await retryScheduledMessage(id);
    if (success) {
      res.json({ success: true, message: 'Messaggio inviato con successo!' });
    } else {
      res.status(500).json({ success: false, error: 'Impossibile inviare il messaggio' });
    }
  });

  apiRouter.delete('/scheduled-messages/:id', async (req, res) => {
    const id = req.params.id;
    const success = await cancelScheduledMessage(id);
    if (success) {
      res.json({ success: true, message: 'Messaggio programmato cancellato con successo' });
    } else {
      res.status(404).json({ success: false, error: 'Messaggio programmato non trovato' });
    }
  });

  apiRouter.post('/passes/:id/documents', async (req, res) => {
    try {
      const id = req.params.id;
      const { documentsData } = req.body;
      const pass = serverPasses.find(p => p.id === id);
      if (!pass) {
        res.status(404).json({ success: false, error: 'Pass non trovato.' });
        return;
      }
      pass.documentsData = documentsData;
      pass.documentsUploaded = Array.isArray(documentsData) && documentsData.length > 0;
      persistPasses();
      if (isSupabaseConfigured()) {
        await upsertPass(pass);
      }
      res.json({ success: true, pass });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/passes/:id/confirm-checkin', async (req, res) => {
    try {
      const id = req.params.id;
      const { confirmed } = req.body;
      const pass = serverPasses.find(p => p.id === id);
      if (!pass) {
        res.status(404).json({ success: false, error: 'Pass non trovato.' });
        return;
      }
      pass.checkInConfirmed = Boolean(confirmed);
      persistPasses();
      if (isSupabaseConfigured()) {
        await upsertPass(pass);
      }
      res.json({ success: true, pass });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });


  apiRouter.delete('/passes/:id', async (req, res) => {
    const id = req.params.id;
    const index = serverPasses.findIndex(p => p.id === id);
    if (index !== -1) {
      const removed = serverPasses.splice(index, 1)[0];
      persistPasses();
      await deleteSupabasePass(id);

      // Add bookingRef to deleted booking refs if it exists
      if (removed.bookingRef) {
        if (!deletedBookingRefs.includes(removed.bookingRef)) {
          deletedBookingRefs.push(removed.bookingRef);
          safeWriteFileSync(DELETED_REFS_REL_PATH, JSON.stringify(deletedBookingRefs, null, 2));
          if (isSupabaseConfigured()) {
            try {
              await saveDocument('deleted_booking_refs', deletedBookingRefs);
            } catch (error) {
              console.error('Failed to save deleted booking refs to Supabase:', error);
            }
          }
        }
      }
      
      // Force immediate reload of deleted refs on this instance
      void hydrateDeletedRefsFromSupabase(true);

      hassDoorState.logs.unshift({
        timestamp: new Date().toISOString(),
        guest: `${removed.guestName} ${removed.guestSurname}`.trim(),
        detail: `Pass revocato ed eliminato dal sistema`
      });
      res.json({ success: true, message: 'Pass eliminato con successo' });
    } else {
      res.status(404).json({ success: false, error: 'Pass non trovato' });
    }
  });

  // Download Standalone Host Portal .ZIP
  apiRouter.get('/download-host-portal-zip', async (_req, res) => {
    try {
      const zip = new JSZip();
      const portalDir = path.join(process.cwd(), 'standalone-host-portal');

      if (fs.existsSync(portalDir)) {
        const files = fs.readdirSync(portalDir);
        for (const file of files) {
          const filePath = path.join(portalDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            const content = fs.readFileSync(filePath);
            zip.file(file, content);
          }
        }
      }

      const zipBuffer = await zip.generateAsync({ 
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="aurora-host-portal.zip"');
      res.send(zipBuffer);
    } catch (err: any) {
      console.error('Error creating host portal zip:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mount API router on /api
  app.use('/api', apiRouter);

  return app;
}

const app = createApp();
export default app;
