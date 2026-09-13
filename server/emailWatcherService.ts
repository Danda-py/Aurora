import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { parseBedAndBreakfastBooking, formatInvitationMessage, generateRandomPin, parseIReservationEmail } from '../src/services/guestPassService.js';
import { upsertPass, isSupabaseConfigured, loadDocument, saveDocument } from './supabaseStorage.js';
import { GuestPass } from '../src/types.js';
import { scheduleBookingMessages, cancelAllMessagesForPass } from './scheduledMessagingService.js';

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

const processedUids = new Set<number>();

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
      console.log('[IMAP] Configurazione caricata da Supabase.');
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
  } catch (error) {
    console.error('[Gemini Parser] Errore durante l\'estrazione con Gemini:', error);
    return null;
  }
}

/**
 * Connect to IMAP, read messages, parse them, 
 * generate pass and eventually flag them as read.
 */
export async function checkNewEmailsAndGeneratePasses(serverPasses: GuestPass[], forceAll: boolean = false) {
  if (!imapConfig.host || !imapConfig.user || !imapConfig.pass) {
    console.log('[IMAP] Engine not fully configured yet. Skipping email check.');
    return;
  }

  if (isPolling) {
    console.log('[IMAP] Check already in progress, skipping.');
    return;
  }

  if (forceAll) {
    console.log('[IMAP] Sincronizzazione forzata: pulizia dei messaggi già elaborati.');
    processedUids.clear();
  }

  isPolling = true;
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
    }
  });

  try {
    await client.connect();
    
    // Select INBOX
    const lock = await client.getMailboxLock('INBOX');
    try {
      console.log('[IMAP] Avvio sincronizzazione vecchie e nuove email...');
      
      let unseen: number[] = [];
      let allUids: number[] = [];

      try {
        unseen = (await client.search({ seen: false }, { uid: true })) || [];
      } catch (err) {
        console.warn('[IMAP] Search unseen failed:', err);
      }
      
      try {
        allUids = (await client.search({ all: true }, { uid: true })) || [];
      } catch (err) {
        console.warn('[IMAP] Search all failed:', err);
      }

      // Ricerca mirata: solo ed esclusivamente le email provenienti da noreply@bed-and-breakfast.it
      let platformUids: number[] = [];
      try {
        const bySender = (await client.search({ from: 'noreply@bed-and-breakfast.it' }, { uid: true })) || [];
        platformUids.push(...bySender);
      } catch (err) {
        console.warn('[IMAP] Search from:"noreply@bed-and-breakfast.it" failed:', err);
      }

      // In sincronizzazione forzata (backfill manuale "Sincronizza ora") scansioniamo TUTTA
      // la mailbox, per recuperare anche gli ospiti passati/scaduti. Nel polling periodico
      // automatico invece ci limitiamo alle ultime 1000 email per non appesantire ogni ciclo.
      const recentUids = forceAll ? allUids : allUids.slice(-1000);
      
      const uids = Array.from(new Set([
        ...unseen,
        ...recentUids,
        ...platformUids
      ])).sort((a, b) => a - b);

      if (uids.length === 0) {
        console.log('[IMAP] Nessuna email rilevata con i criteri di ricerca.');
        return;
      }
      
      const toProcess = uids.filter(uid => !processedUids.has(uid));
      console.log(`[IMAP] Trovate ${uids.length} email, di cui ${toProcess.length} da elaborare.`);
      
      const todayStr = new Date().toISOString().split('T')[0];

      for (const uid of toProcess) {
        processedUids.add(uid);
        const messageStream = await client.fetchOne(String(uid), { source: true }, { uid: true });
        if (!messageStream || !messageStream.source) continue;
        const parsedEmail = await simpleParser(messageStream.source);
        
        const subject = parsedEmail.subject || '';
        const textContent = parsedEmail.text || parsedEmail.html || '';
        const htmlContent = parsedEmail.html || '';
        const sender = parsedEmail.from?.value[0]?.address || '';

        const isFromNoreplyBB = sender.toLowerCase() === 'noreply@bed-and-breakfast.it';
        if (!isFromNoreplyBB) {
          // Ignoriamo totalmente e senza loggare come errore/ignorata per non sporcare la lista log
          continue;
        }

        const subjectLower = subject.toLowerCase();
        const isBookingEmail = subjectLower.includes('ireservation');
        const isCancellation = 
          /cancellata|cancellazione|annullat[ao]|annullamento|cancelled|cancel/i.test(subject) ||
          /prenotazione\s*e\s*stata\s*cancellata|prenotazione\s*cancellata|prenotazione\s*annullata|booking\s*cancelled/i.test(textContent.replace(/[\s\r\n\t]+/g, ' '));

        if (!isBookingEmail && !isCancellation) {
          // Solo mail con oggetto iReservation o annullamento da questo mittente
          continue;
        }

        console.log(`[IMAP] Elaborazione email selezionata. Sender: "${sender}", Subject: "${subject}", Cancellazione: ${isCancellation}`);

        // Parsiamo l'email usando l'API di Gemini per ottenere dati super accurati
        let parsed = await parseEmailWithGemini(htmlContent || textContent, isCancellation);

        // Fallback al parser regex se Gemini non è configurato o fallisce
        if (!parsed) {
          console.log('[IMAP] Gemini non disponibile o errore, uso il parser regex locale di fallback.');
          const localParsed = parseIReservationEmail(textContent, htmlContent);
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

        if (isCancellation) {
          if (bookingRef) {
            const existingIdx = serverPasses.findIndex(p => p.bookingRef === bookingRef || p.id === `ires-${bookingRef}`);
            if (existingIdx !== -1) {
              const targetPass = serverPasses[existingIdx];
              if (targetPass.active) {
                targetPass.active = false;
                targetPass.notes = `DISATTIVATO via IMAP Cancellazione il ${new Date().toISOString()}.\n${targetPass.notes || ''}`;
                await upsertPass(targetPass);
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
              guestName: parsed.guestName, guestSurname: parsed.guestSurname,
              phone: parsed.phone || existingPass.phone, guestEmail: parsed.guestEmail || existingPass.guestEmail,
              checkInDate: parsed.checkInDate, checkOutDate: parsed.checkOutDate, guestsCount: parsed.guestsCount,
              bookingSource: parsed.bookingSource || existingPass.bookingSource, amount: parsed.amount || existingPass.amount,
              apartmentName: parsed.apartmentName || existingPass.apartmentName, nightsCount: parsed.nightsCount || existingPass.nightsCount,
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
              id: `ires-${bookingRef}`, guestName: parsed.guestName, guestSurname: parsed.guestSurname, phone: parsed.phone,
              guestEmail: parsed.guestEmail, checkInDate: parsed.checkInDate, checkInTime: '14:00',
              checkOutDate: parsed.checkOutDate, checkOutTime: '10:00', pinCode, bookingRef, guestsCount: parsed.guestsCount,
              bookingSource: parsed.bookingSource || 'other', amount: parsed.amount, apartmentName: parsed.apartmentName,
              nightsCount: parsed.nightsCount, notes: `${isTestEmail ? 'Pass di Test generato' : 'Generato'} automaticamente via IMAP il ${new Date().toISOString()}`,
              createdAt: new Date().toISOString(), active: true, checkInConfirmed: false, token
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
    } finally {
      lock.release();
    }
    
    await client.logout();
  } catch (error) {
    console.error('[IMAP] Error during checkNewEmailsAndGeneratePasses:', error);
  } finally {
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
