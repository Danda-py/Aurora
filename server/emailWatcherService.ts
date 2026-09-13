import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { parseBedAndBreakfastBooking, formatInvitationMessage, generateRandomPin, parseIReservationEmail } from '../src/services/guestPassService.js';
import { upsertPass, isSupabaseConfigured, loadDocument, saveDocument } from './supabaseStorage.js';
import { GuestPass } from '../src/types.js';
import { scheduleBookingMessages, cancelAllMessagesForPass } from './scheduledMessagingService.js';
import { safeReadJsonSync, safeWriteFileSync } from './storageUtils.js';

// Path for persisting processed email UIDs across server restarts
const PROCESSED_EMAILS_PATH = 'data/processed_email_uids.json';

// Limit emails processed per polling cycle to avoid blocking for too long
// The polling interval (every 2 min) should finish well before the next cycle
const MAX_EMAILS_PER_CYCLE = 100;
// Higher limit for forced sync (sync-now button) to backfill more emails at once
const MAX_EMAILS_FORCED_CYCLE = 500;

let isPolling = false;
let pollingInterval: NodeJS.Timeout | null = null;

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  enabled: boolean;
  intervalMs?: number; // default: 5 minutes (300000ms)
}

export interface EmailLog {
  id: string;
  timestamp: string;
  sender: string;
  subject: string;
  status: 'success' | 'warning' | 'error' | 'ignored';
  message: string;
  details?: any;
}

// Persist processed UIDs across server restarts so we don't reprocess the entire inbox
const processedUids = new Set<number>(safeReadJsonSync<number[]>(PROCESSED_EMAILS_PATH, []));

// Simple in-memory config for testing (normally populated via environment variables or host config)
let imapConfig: ImapConfig = {
  host: process.env.IMAP_HOST || '',
  port: Number(process.env.IMAP_PORT) || 993,
  secure: process.env.IMAP_SECURE !== 'false',
  user: process.env.IMAP_USER || '',
  pass: process.env.IMAP_PASS || '',
  enabled: process.env.IMAP_ENABLED === 'true',
  intervalMs: Number(process.env.IMAP_INTERVAL_MS) || 120000 // default 2 mins
};

// In-memory fallback logs if Supabase is not working
let inMemoryLogs: EmailLog[] = [];

/**
 * Ordina i pass ospite sul server:
 * 1. ATTIVI (in corso oggi) sempre in cima!
 * 2. FUTURI (in arrivo) in ordine cronologico crescente di check-in (il più vicino per primo)
 * 3. PASSATI (scaduti) in ordine decrescente (il più recente per primo)
 * 4. CANCELLATI (active === false) in fondo
 */
export function sortGuestPassesInPlace(passes: GuestPass[]) {
  const todayStr = new Date().toISOString().split('T')[0];
  passes.sort((a, b) => {
    const aCancelled = a.active === false;
    const bCancelled = b.active === false;
    if (aCancelled !== bCancelled) {
      return aCancelled ? 1 : -1;
    }

    const aActive = Boolean(a.checkInDate && a.checkOutDate && a.checkInDate <= todayStr && a.checkOutDate >= todayStr);
    const bActive = Boolean(b.checkInDate && b.checkOutDate && b.checkInDate <= todayStr && b.checkOutDate >= todayStr);

    if (aActive !== bActive) {
      return aActive ? -1 : 1;
    }

    if (aActive && bActive) {
      const cmpOut = (a.checkOutDate || '').localeCompare(b.checkOutDate || '');
      if (cmpOut !== 0) return cmpOut;
      return (a.checkInDate || '').localeCompare(b.checkInDate || '');
    }

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

    const cmpPast = (b.checkOutDate || '').localeCompare(a.checkOutDate || '');
    if (cmpPast !== 0) return cmpPast;
    return (b.checkInDate || '').localeCompare(a.checkInDate || '');
  });
}

/**
 * Add a persistent log entry for email processing or webhooks
 */
export async function addEmailLog(logEntry: Omit<EmailLog, 'id' | 'timestamp'>) {
  try {
    const timestamp = new Date().toISOString();
    const entry: EmailLog = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp,
      ...logEntry
    };

    if (isSupabaseConfigured()) {
      const logs = (await loadDocument<EmailLog[]>('email_sync_logs')) || [];
      logs.unshift(entry);
      await saveDocument('email_sync_logs', logs.slice(0, 150));
    } else {
      inMemoryLogs.unshift(entry);
      inMemoryLogs = inMemoryLogs.slice(0, 150);
    }
    console.log(`[Email Log] [${logEntry.status.toUpperCase()}] ${logEntry.message}`);
  } catch (error) {
    console.error('[Email Log] Errore salvataggio log email:', error);
  }
}

/**
 * Retrieve all email logs
 */
export async function getEmailLogs(): Promise<EmailLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const logs = await loadDocument<EmailLog[]>('email_sync_logs');
      return Array.isArray(logs) ? logs : [];
    } catch {
      return inMemoryLogs;
    }
  }
  return inMemoryLogs;
}

/**
 * Hydrate IMAP configuration from Supabase
 */
export async function hydrateImapConfig(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const remoteConfig = await loadDocument<Partial<ImapConfig>>('imap_config');
    if (remoteConfig) {
      imapConfig = { ...imapConfig, ...remoteConfig };
      console.log('[IMAP] Configurazione caricata da Supabase. Enabled:', imapConfig.enabled);
      // If enabled and credentials exist, ensure watcher is started!
      if (imapConfig.enabled && imapConfig.user && imapConfig.pass && imapConfig.host) {
        startEmailWatcher();
      }
    }

    // Also hydrate processed email UIDs so they survive container redeployments
    const remoteUids = await loadDocument<number[]>('processed_email_uids');
    if (Array.isArray(remoteUids) && remoteUids.length > 0) {
      for (const u of remoteUids) {
        processedUids.add(u);
      }
      console.log(`[IMAP] Caricati ${remoteUids.length} UID email già elaborate da Supabase.`);
    }
  } catch (error) {
    console.error('[IMAP] Errore caricamento configurazione da Supabase:', error);
  }
}

/**
 * Configure IMAP engine dynamically
 */
export async function updateImapConfigAsync(newConfig: Partial<ImapConfig>) {
  // If the pass contains the bullets, preserve the existing password
  if (newConfig.pass === '••••••••' || !newConfig.pass) {
    delete newConfig.pass;
  }
  imapConfig = { ...imapConfig, ...newConfig };
  
  if (isSupabaseConfigured()) {
    try {
      await saveDocument('imap_config', imapConfig);
    } catch (error) {
      console.error('[IMAP] Errore salvataggio configurazione su Supabase:', error);
    }
  }

  // Restart polling if config changed and is enabled
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  if (imapConfig.enabled && imapConfig.user && imapConfig.pass && imapConfig.host) {
    startEmailWatcher();
  }
}

export function updateImapConfig(newConfig: Partial<ImapConfig>) {
  void updateImapConfigAsync(newConfig);
}

export function getImapConfig() {
  return {
    ...imapConfig,
    pass: imapConfig.pass ? '••••••••' : ''
  };
}

/**
 * Persist the processed email UIDs to disk and Supabase so they survive server restarts.
 * This prevents reprocessing of the entire inbox on every restart.
 */
export async function persistProcessedUids() {
  const arr = Array.from(processedUids);
  safeWriteFileSync(PROCESSED_EMAILS_PATH, JSON.stringify(arr));
  if (isSupabaseConfigured()) {
    try {
      await saveDocument('processed_email_uids', arr.slice(-1000));
    } catch (err) {
      console.warn('[IMAP] Failed to save processed UIDs to Supabase:', err);
    }
  }
}

/**
 * Clear all processed UIDs (used by sync-now with full backfill).
 */
export async function clearProcessedUids() {
  processedUids.clear();
  safeWriteFileSync(PROCESSED_EMAILS_PATH, JSON.stringify([]));
  if (isSupabaseConfigured()) {
    try {
      await saveDocument('processed_email_uids', []);
    } catch (err) {
      console.warn('[IMAP] Failed to clear processed UIDs in Supabase:', err);
    }
  }
}

/**
 * Parsifica un'email in formato HTML usando l'API di Gemini per estrarre in modo strutturato i dati della prenotazione.
 */
export async function parseEmailWithGemini(htmlContent: string, isCancellation: boolean): Promise<{
  bookingRef: string;
  bookingSource: string;
  guestName: string;
  guestSurname: string;
  guestEmail: string;
  phone: string;
  apartmentName: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  guestsCount: number;
  amount: string;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini Parser] GEMINI_API_KEY non configurata. Impossibile usare Gemini.');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = isCancellation
      ? `Analizza il codice HTML di questa email di CANCELLAZIONE di una prenotazione ed estrai i dati nel formato JSON specificato.
Email HTML:
"""
${htmlContent}
"""

Restituisci esclusivamente un oggetto JSON valido con le seguenti chiavi (se un dato non è presente, usa stringa vuota o valori appropriati):
{
  "bookingRef": "Codice/ID della prenotazione da annullare (obbligatorio, stringa)",
  "bookingSource": "Il portale da cui proviene la prenotazione originale (es. booking.com, airbnb, bed-and-breakfast.it, expedia, direct, o 'other')",
  "guestName": "Nome dell'ospite",
  "guestSurname": "Cognome dell'ospite",
  "guestEmail": "Email dell'ospite",
  "phone": "Numero di telefono completo dell'ospite",
  "apartmentName": "Nome dell'appartamento/struttura",
  "checkInDate": "Data di check-in in formato YYYY-MM-DD",
  "checkOutDate": "Data di check-out in formato YYYY-MM-DD",
  "nightsCount": 1,
  "guestsCount": 2,
  "amount": "Importo totale/prezzo della prenotazione"
}`
      : `Analizza il codice HTML di questa email di conferma prenotazione (iReservation / Bed-and-Breakfast.it) ed estrai i dati richiesti nel formato JSON specificato.
Email HTML:
"""
${htmlContent}
"""

Dovrai mappare ed estrarre i seguenti dati:
1. "bookingRef": il codice o ID della prenotazione (es. numeri lunghi o codici del portale).
2. "bookingSource": il portale o canale dal quale è stata effettuata la prenotazione (es. booking.com, airbnb, bed-and-breakfast.it, expedia, o direct).
3. "guestName": il nome proprio dell'ospite.
4. "guestSurname": il cognome dell'ospite.
5. "guestEmail": l'indirizzo email dell'ospite.
6. "phone": il numero di telefono completo dell'ospite (includi prefisso internazionale come +39 se presente).
7. "apartmentName": il nome della struttura o appartamento (es. Aurora).
8. "checkInDate": la data di check-in (formato YYYY-MM-DD).
9. "checkOutDate": la data di check-out (formato YYYY-MM-DD).
10. "nightsCount": il numero di notti del soggiorno (intero).
11. "guestsCount": il numero totale di ospiti (intero).
12. "amount": l'importo totale o prezzo della prenotazione (stringa).

Restituisci esclusivamente un oggetto JSON valido con le chiavi esatte qui indicate:
{
  "bookingRef": "Codice prenotazione",
  "bookingSource": "booking.com | airbnb | bed-and-breakfast.it | expedia | direct | other",
  "guestName": "Nome dell'ospite",
  "guestSurname": "Cognome dell'ospite",
  "guestEmail": "Email dell'ospite",
  "phone": "Numero di telefono",
  "apartmentName": "Nome appartamento",
  "checkInDate": "YYYY-MM-DD",
  "checkOutDate": "YYYY-MM-DD",
  "nightsCount": 1,
  "guestsCount": 2,
  "amount": "Importo"
}`;

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
      throw new Error('Gemini ha restituito una risposta vuota.');
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw e;
      }
    }

    return {
      bookingRef: String(parsed.bookingRef || '').trim(),
      bookingSource: String(parsed.bookingSource || 'other').toLowerCase().trim(),
      guestName: String(parsed.guestName || '').trim(),
      guestSurname: String(parsed.guestSurname || '').trim(),
      guestEmail: String(parsed.guestEmail || '').trim(),
      phone: String(parsed.phone || '').trim(),
      apartmentName: String(parsed.apartmentName || '').trim(),
      checkInDate: String(parsed.checkInDate || '').trim(),
      checkOutDate: String(parsed.checkOutDate || '').trim(),
      nightsCount: Number(parsed.nightsCount) || 1,
      guestsCount: Number(parsed.guestsCount) || 2,
      amount: String(parsed.amount || '').trim()
    };
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn('[Gemini Parser] Quota rate limit raggiunto (15 req/min). Verrà utilizzato il parser locale.');
    } else {
      console.error('[Gemini Parser] Errore durante l\'estrazione con Gemini:', error?.message || error);
    }
    return null;
  }
}

let lastPollStartTime = 0;

/**
 * Connect to IMAP, read messages, parse them, 
 * generate pass and eventually flag them as read.
 */
export async function checkNewEmailsAndGeneratePasses(serverPasses: GuestPass[], forceAll: boolean = false) {
  if (!imapConfig.host || !imapConfig.user || !imapConfig.pass) {
    console.log('[IMAP] Engine not fully configured yet. Skipping email check.');
    return;
  }

  // Safety watchdog: if isPolling was stuck for > 2 minutes (e.g. dropped socket), reset it
  if (isPolling && Date.now() - lastPollStartTime > 120000) {
    console.warn('[IMAP] Previous polling cycle exceeded 2 minutes. Resetting isPolling lock.');
    isPolling = false;
  }

  // For forced sync (sync-now button), always proceed regardless of isPolling.
  // For normal polling, skip if another check is already running to avoid
  // concurrent IMAP connections and race conditions.
  if (!forceAll && isPolling) {
    console.log('[IMAP] Check already in progress, skipping.');
    return;
  }

  if (forceAll) {
    console.log('[IMAP] Sincronizzazione forzata: pulizia dei messaggi già elaborati.');
    processedUids.clear();
    await clearProcessedUids();
  }

  isPolling = true;
  lastPollStartTime = Date.now();
  console.log(`[IMAP] Checking email inbox ${imapConfig.user}...`);

  const client = new ImapFlow({
    host: imapConfig.host,
    port: imapConfig.port,
    secure: imapConfig.secure,
    auth: {
      user: imapConfig.user,
      pass: imapConfig.pass
    },
    logger: false,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000
  });

  try {
    await client.connect();
    
    // Select INBOX
    const lock = await client.getMailboxLock('INBOX');
    try {
      console.log('[IMAP] Avvio sincronizzazione email Bed-and-Breakfast & iReservation...');
      
      let bbUids: number[] = [];

      try {
        // Cerca specificamente le email con mittente noreply@bed-and-breakfast.it e oggetto contenente iReservation
        bbUids = (await client.search({ from: 'noreply@bed-and-breakfast.it', subject: 'iReservation' }, { uid: true })) || [];
      } catch (err) {
        console.warn('[IMAP] Search combinata {from, subject} non supportata dal server IMAP, fallback con ricerca separata:', err);
        try {
          const fromUids = (await client.search({ from: 'noreply@bed-and-breakfast.it' }, { uid: true })) || [];
          const subjUids = (await client.search({ subject: 'iReservation' }, { uid: true })) || [];
          const subjSet = new Set(subjUids);
          bbUids = fromUids.filter(id => subjSet.has(id));
        } catch (err2) {
          console.warn('[IMAP] Fallback search failed:', err2);
        }
      }

      // Ordiniamo dal più recente al più vecchio (b - a) per processare immediatamente le nuove email!
      const allRelevantUids = Array.from(new Set(bbUids)).sort((a, b) => b - a);

      if (allRelevantUids.length === 0) {
        console.log('[IMAP] Nessuna email rilevata con i criteri di ricerca (noreply@bed-and-breakfast.it e iReservation).');
        return;
      }
      
      const toProcess = forceAll
        ? allRelevantUids
        : allRelevantUids.filter(uid => !processedUids.has(uid));
      
      const maxPerCycle = forceAll ? MAX_EMAILS_FORCED_CYCLE : MAX_EMAILS_PER_CYCLE;
      const toProcessLimited = toProcess.slice(0, maxPerCycle);
      
      if (toProcess.length > maxPerCycle) {
        console.log(`[IMAP] Limitando l'elaborazione a ${maxPerCycle} email di ${toProcess.length} da elaborare. Il resto sarà elaborato nei prossimi cicli.`);
      }
      console.log(`[IMAP] Trovate ${allRelevantUids.length} email rilevanti, di cui ${toProcess.length} da elaborare (${toProcessLimited.length} in questo ciclo).`);
      
      const todayStr = new Date().toISOString().split('T')[0];

      for (const uid of toProcessLimited) {
        processedUids.add(uid);
        const messageStream = await client.fetchOne(String(uid), { source: true }, { uid: true });
        if (!messageStream || !messageStream.source) continue;
        const parsedEmail = await simpleParser(messageStream.source);
        
        const subject = parsedEmail.subject || '';
        const textContent = parsedEmail.text || parsedEmail.html || '';
        const htmlContent = parsedEmail.html || '';
        const sender = parsedEmail.from?.value[0]?.address || '';
        const senderLower = sender.toLowerCase();

        // REQUISITO TASSATIVO: ESCLUSIVAMENTE mittente noreply@bed-and-breakfast.it e oggetto contenente "iReservation"
        const isExactSender = senderLower === 'noreply@bed-and-breakfast.it' || senderLower.includes('noreply@bed-and-breakfast.it');
        const hasIReservationSubject = /ireservation/i.test(subject);

        if (!isExactSender || !hasIReservationSubject) {
          continue;
        }

        const isCancellation = 
          /cancellat|annullat|cancelled|cancel/i.test(subject) ||
          /prenotazione\s*(?:e\s*stata\s*)?(?:cancellata|annullata)|booking\s*cancelled/i.test(textContent.replace(/[\s\r\n\t]+/g, ' '));

        const isBookingEmail = !isCancellation;

        console.log(`[IMAP] Elaborazione email selezionata. Sender: "${sender}", Subject: "${subject}", Cancellazione: ${isCancellation}`);

        // Eseguiamo prima il parser regex locale ultra-rapido
        const localParsed = parseIReservationEmail(`${subject}\n${textContent}`, htmlContent);
        let parsed = { ...localParsed };

        // Se mancano campi essenziali e non è una cancellazione, tentiamo il fallback con Gemini
        if ((!parsed.bookingRef || (!isCancellation && (!parsed.checkInDate || !parsed.checkOutDate))) && process.env.GEMINI_API_KEY) {
          const safeHtmlContent = (htmlContent || textContent).slice(0, 25000);
          const geminiParsed = await parseEmailWithGemini(safeHtmlContent, isCancellation);
          if (geminiParsed && geminiParsed.bookingRef) {
            parsed = {
              bookingRef: geminiParsed.bookingRef || parsed.bookingRef,
              bookingSource: geminiParsed.bookingSource || parsed.bookingSource,
              guestName: geminiParsed.guestName || parsed.guestName,
              guestSurname: geminiParsed.guestSurname || parsed.guestSurname,
              guestEmail: geminiParsed.guestEmail || parsed.guestEmail,
              phone: geminiParsed.phone || parsed.phone,
              apartmentName: geminiParsed.apartmentName || parsed.apartmentName,
              checkInDate: geminiParsed.checkInDate || parsed.checkInDate,
              checkOutDate: geminiParsed.checkOutDate || parsed.checkOutDate,
              nightsCount: geminiParsed.nightsCount || parsed.nightsCount,
              guestsCount: geminiParsed.guestsCount || parsed.guestsCount,
              amount: geminiParsed.amount || parsed.amount
            };
          }
        }

        // Se ancora manca il nome ospite o le date, controlliamo se sono presenti nell'oggetto
        if (!parsed.guestName) {
          const nameFromSubj = subject.match(/prenotazione\s+(?:da|per)\s+([a-zA-ZÀ-ÿ\s]+?)\s+dal\b/i) ||
                               subject.match(/prenotazione\s+cancellata\s*-\s*([a-zA-ZÀ-ÿ\s]+?)\s*-/i);
          if (nameFromSubj && nameFromSubj[1]) {
            const parts = nameFromSubj[1].trim().split(/\s+/);
            parsed.guestName = parts[0] || '';
            if (parts.length > 1 && !parsed.guestSurname) {
              parsed.guestSurname = parts.slice(1).join(' ');
            }
          }
        }

        if (!parsed.checkInDate || !parsed.checkOutDate) {
          const datesFromSubj = subject.match(/dal\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s+al\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
          if (datesFromSubj) {
            const monthsMap: Record<string, string> = { gen: '01', feb: '02', mar: '03', apr: '04', mag: '05', giu: '06', lug: '07', ago: '08', set: '09', ott: '10', nov: '11', dic: '12' };
            const parseSubjDate = (dStr: string) => {
              const m = dStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
              if (m) {
                let yr = m[3].length === 2 ? '20' + m[3] : m[3];
                return `${yr}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
              }
              return '';
            };
            if (!parsed.checkInDate) parsed.checkInDate = parseSubjDate(datesFromSubj[1]);
            if (!parsed.checkOutDate) parsed.checkOutDate = parseSubjDate(datesFromSubj[2]);
          }
        }

        const bookingRef = parsed.bookingRef;

        if (isCancellation) {
          if (bookingRef) {
            const existingIdx = serverPasses.findIndex(p => p.bookingRef === bookingRef || p.id === `ires-${bookingRef}`);
            if (existingIdx !== -1) {
              const targetPass = serverPasses[existingIdx];
              if (targetPass.active) {
                targetPass.active = false;
                targetPass.notes = `DISATTIVATO via IMAP Cancellazione il ${new Date().toISOString()}.\n${targetPass.notes || ''}`;
                await upsertPass(targetPass);
                if (typeof (global as any).persistPassesRef === 'function') {
                  (global as any).persistPassesRef();
                }
                await cancelAllMessagesForPass(targetPass.id);
                console.log(`[IMAP] Soggiorno CANCELLATO per ID "${bookingRef}".`);

                await addEmailLog({
                  sender,
                  subject,
                  status: 'success',
                  message: `Annullata prenotazione per ${targetPass.guestName} ${targetPass.guestSurname} (ID: ${bookingRef}) via email`,
                  details: { bookingRef, parsed }
                });
              } else {
                await addEmailLog({
                  sender,
                  subject,
                  status: 'ignored',
                  message: `Annullamento ricevuto per ID ${bookingRef} ma il pass era già disattivo`,
                  details: { bookingRef, parsed }
                });
              }
            } else {
              await addEmailLog({
                sender,
                subject,
                status: 'warning',
                message: `Annullamento ricevuto per ID ${bookingRef} ma nessun pass corrispondente trovato nel sistema`,
                details: { bookingRef, parsed }
              });
            }
          } else {
            await addEmailLog({
              sender,
              subject,
              status: 'error',
              message: `Ricevuta email di cancellazione ma impossibile estrarre l'ID prenotazione`,
              details: { subject, snippet: textContent.substring(0, 300) }
            });
          }
          await client.messageFlagsAdd(String(uid), ['\\Seen']);
          continue;
        }

        // Rilevamento sicuro dei test con limiti di parola per evitare falsi positivi (es. "testo", "intestatario")
        const isTestEmail = /\btest\b/i.test(subject) || /\btest\b/i.test(textContent) || /\btest\b/i.test(htmlContent);
        if (bookingRef && isTestEmail) {
          if (!parsed.guestName) parsed.guestName = 'Ospite Test';
          if (!parsed.guestSurname) parsed.guestSurname = 'BB';
          if (!parsed.checkInDate) parsed.checkInDate = todayStr;
          if (!parsed.checkOutDate) parsed.checkOutDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        }

        if (parsed.guestName && parsed.checkInDate && parsed.checkOutDate && bookingRef) {
          const existingIdx = serverPasses.findIndex(p => p.bookingRef === bookingRef || p.id === `ires-${bookingRef}`);
          if ((global as any).deletedBookingRefsRef?.includes(bookingRef)) {
            await addEmailLog({
              sender,
              subject,
              status: 'ignored',
              message: `Ignorata email per ID ${bookingRef} perché precedentemente eliminato dall'host`,
              details: { bookingRef, parsed }
            });
            continue;
          }

          let targetPass: GuestPass;
          if (existingIdx !== -1) {
            const existingPass = serverPasses[existingIdx];
            targetPass = {
              ...existingPass,
              guestName: parsed.guestName,
              guestSurname: parsed.guestSurname || existingPass.guestSurname,
              phone: parsed.phone || existingPass.phone,
              guestEmail: parsed.guestEmail || existingPass.guestEmail,
              checkInDate: parsed.checkInDate,
              checkOutDate: parsed.checkOutDate,
              guestsCount: parsed.guestsCount || existingPass.guestsCount,
              bookingSource: parsed.bookingSource || existingPass.bookingSource,
              amount: parsed.amount || existingPass.amount,
              apartmentName: parsed.apartmentName || existingPass.apartmentName,
              nightsCount: parsed.nightsCount || existingPass.nightsCount,
              notes: `Sincronizzato da Email IMAP il ${new Date().toISOString()}.\n${existingPass.notes || ''}`
            };
            serverPasses[existingIdx] = targetPass;

            await addEmailLog({
              sender,
              subject,
              status: 'success',
              message: `Aggiornato pass ospite per ${parsed.guestName} ${parsed.guestSurname} (ID: ${bookingRef})`,
              details: { bookingRef, parsed }
            });
          } else {
            const pinCode = generateRandomPin();
            const token = crypto.randomBytes(32).toString('base64url');
            targetPass = {
              id: `ires-${bookingRef}`,
              guestName: parsed.guestName,
              guestSurname: parsed.guestSurname,
              phone: parsed.phone,
              guestEmail: parsed.guestEmail,
              checkInDate: parsed.checkInDate,
              checkInTime: '14:00',
              checkOutDate: parsed.checkOutDate,
              checkOutTime: '10:00',
              pinCode,
              bookingRef,
              guestsCount: parsed.guestsCount || 2,
              bookingSource: parsed.bookingSource || 'bed-and-breakfast.it',
              amount: parsed.amount,
              apartmentName: parsed.apartmentName || 'Appartamento Aurora in Valtellina',
              nightsCount: parsed.nightsCount || 1,
              notes: `${isTestEmail ? 'Pass di Test generato' : 'Generato'} automaticamente via IMAP il ${new Date().toISOString()}`,
              createdAt: new Date().toISOString(),
              active: true,
              checkInConfirmed: false,
              token
            };
            serverPasses.unshift(targetPass);

            await addEmailLog({
              sender,
              subject,
              status: 'success',
              message: `${isTestEmail ? 'Creato pass di TEST' : 'Creato pass ospite'} con successo per ${parsed.guestName} ${parsed.guestSurname} (ID: ${bookingRef})`,
              details: { bookingRef, parsed }
            });
          }

          await upsertPass(targetPass);
          if (typeof (global as any).persistPassesRef === 'function') {
            (global as any).persistPassesRef();
          }
          if (targetPass.checkOutDate >= todayStr) {
            await scheduleBookingMessages(targetPass);
          }
        } else {
          await addEmailLog({
            sender,
            subject,
            status: 'warning',
            message: `Email ignorata per dati incompleti. ID: "${bookingRef || 'Mancante'}", Ospite: "${parsed.guestName || 'Mancante'}", Check-in: "${parsed.checkInDate || 'Mancante'}", Check-out: "${parsed.checkOutDate || 'Mancante'}"`,
            details: { bookingRef, parsed, subject, snippet: textContent.substring(0, 300) }
          });
        }
        await client.messageFlagsAdd(String(uid), ['\\Seen']);
      }
      // Mantiene i pass ordinati cronologicamente con gli attivi sempre in cima
      sortGuestPassesInPlace(serverPasses);
    } finally {
      lock.release();
    }
    
    await client.logout();
  } catch (error) {
    console.error('[IMAP] Error during checkNewEmailsAndGeneratePasses:', error);
  } finally {
    // Persist processed UIDs so they survive server restarts
    await persistProcessedUids();
    isPolling = false;
  }
}

/**
 * Automatically send SMS using Twilio (direct node integration) or other services
 */
async function sendDirectSmsOrWhatsapp(phone: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER; // SMS number or 'whatsapp:+14155238886' for sandbox

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[Notification Engine] Twilio credentials missing. Unable to send SMS automatically.`);
    console.log(`[Notification Engine] Dump of message that would have been sent to ${phone}:\n${message}`);
    return false;
  }

  // Sanitize phone number (remove spaces, etc. ensure +)
  let cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = `+39${cleanPhone}`; // Fallback to Italy country code if not specified
  }

  try {
    const isWhatsapp = fromNumber.startsWith('whatsapp:');
    const to = isWhatsapp ? `whatsapp:${cleanPhone}` : cleanPhone;
    
    console.log(`[Notification Engine] Dispatching SMS via Twilio to ${to}...`);
    
    // Simple fetch payload to Twilio API without requiring heavy SDK
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', fromNumber);
    params.append('Body', message);

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (res.ok) {
      console.log(`[Notification Engine] Message successfully delivered to ${cleanPhone}!`);
      return true;
    } else {
      const errBody = await res.json();
      console.error(`[Notification Engine] Twilio API Error:`, errBody);
      return false;
    }
  } catch (err) {
    console.error(`[Notification Engine] Failed to dispatch SMS to ${cleanPhone}:`, err);
    return false;
  }
}

/**
 * Start background email polling watcher
 */
export function startEmailWatcher() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  if (!imapConfig.enabled) {
    console.log('[IMAP] Polling email watcher is disabled.');
    return;
  }

  const interval = imapConfig.intervalMs || 300000;
  console.log(`[IMAP] Starting background email polling watcher every ${interval / 1000} seconds.`);
  
  // Set up the interval
  pollingInterval = setInterval(() => {
    // We dynamically import app to get the shared array reference or fetch it
    // For safety, let's run it against the singleton serverPasses in server app
    const globalServerPasses = (global as any).serverPassesRef || [];
    void checkNewEmailsAndGeneratePasses(globalServerPasses);
  }, interval);

  // Trigger once at startup
  setTimeout(() => {
    const globalServerPasses = (global as any).serverPassesRef || [];
    void checkNewEmailsAndGeneratePasses(globalServerPasses);
  }, 10000);
}
