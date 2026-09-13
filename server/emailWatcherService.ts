import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import crypto from 'crypto';
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
      let pastBB: number[] = [];
      let pastBB2: number[] = [];
      let pastBB3: number[] = [];
      let pastBB4: number[] = [];
      
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
      
      try {
        pastBB = (await client.search({ from: 'bed-and-breakfast.it' }, { uid: true })) || [];
      } catch (err) {
        console.warn('[IMAP] Search pastBB failed:', err);
      }
      
      try {
        pastBB2 = (await client.search({ from: 'ireservation' }, { uid: true })) || [];
      } catch (err) {
        console.warn('[IMAP] Search pastBB2 failed:', err);
      }
      
      try {
        pastBB3 = (await client.search({ subject: 'ireservation' }, { uid: true })) || [];
      } catch (err) {
        console.warn('[IMAP] Search pastBB3 failed:', err);
      }
      
      try {
        pastBB4 = (await client.search({ subject: 'prenotazione' }, { uid: true })) || [];
      } catch (err) {
        console.warn('[IMAP] Search pastBB4 failed:', err);
      }
      
      // Slicing the last 1000 UIDs (ascending order by default)
      const recentUids = allUids.slice(-1000);
      
      const uids = Array.from(new Set([
        ...unseen,
        ...recentUids,
        ...pastBB,
        ...pastBB2,
        ...pastBB3,
        ...pastBB4
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

        const TARGET_EMAIL_PATTERN = /bed[- ]?and[- ]?breakfast\.it|b&b\.it|ireservation|booking\.com|airbnb|vrbo|expedia/i;
        const isTargetEmail = 
          TARGET_EMAIL_PATTERN.test(sender) || 
          TARGET_EMAIL_PATTERN.test(subject) ||
          TARGET_EMAIL_PATTERN.test(textContent);

        if (!isTargetEmail) {
          // Non marchiamo questa email come "Seen": non è una prenotazione, quindi non
          // dobbiamo alterare lo stato di lettura della normale posta dell'host.
          // La logghiamo comunque come "ignorata" così resta visibile nel pannello.
          await addEmailLog({
            sender,
            subject,
            status: 'ignored',
            message: 'Email ignorata: non riconosciuta come prenotazione (mittente/oggetto/testo non corrispondono a nessuna piattaforma supportata)',
            details: { snippet: textContent.substring(0, 300) }
          });
          continue;
        }

        const isCancellation = 
          /cancellata|cancellazione|annullat[ao]|annullamento|cancelled|cancel/i.test(subject) ||
          /prenotazione\s*e\s*stata\s*cancellata|prenotazione\s*cancellata|prenotazione\s*annullata|booking\s*cancelled/i.test(textContent.replace(/[\s\r\n\t]+/g, ' '));

        if (isCancellation) {
          const parsed = parseIReservationEmail(textContent, htmlContent);
          const bookingRef = parsed.bookingRef;
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

        const isIReservation = /ireservation/i.test(sender) || /ireservation/i.test(subject) || /ireservation/i.test(textContent);
        const parsed = isIReservation ? parseIReservationEmail(textContent, htmlContent) : parseBedAndBreakfastBooking(textContent);
        const bookingRef = parsed.bookingRef;

        // Se si tratta di una mail di test da Bed-and-Breakfast, completiamo i dati mancanti per far sì che crei comunque il pass!
        const isTestEmail = /test/i.test(subject) || /test/i.test(textContent) || /test/i.test(htmlContent);
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
              phone: parsed.phone || existingPass.phone, guestEmail: (parsed as any).guestEmail || existingPass.guestEmail,
              checkInDate: parsed.checkInDate, checkOutDate: parsed.checkOutDate, guestsCount: parsed.guestsCount,
              bookingSource: parsed.bookingSource || existingPass.bookingSource, amount: (parsed as any).amount || existingPass.amount,
              apartmentName: (parsed as any).apartmentName || existingPass.apartmentName, nightsCount: (parsed as any).nightsCount || existingPass.nightsCount,
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
              guestEmail: (parsed as any).guestEmail, checkInDate: parsed.checkInDate, checkInTime: '14:00',
              checkOutDate: parsed.checkOutDate, checkOutTime: '10:00', pinCode, bookingRef, guestsCount: parsed.guestsCount,
              bookingSource: parsed.bookingSource || 'other', amount: (parsed as any).amount, apartmentName: (parsed as any).apartmentName,
              nightsCount: (parsed as any).nightsCount, notes: `${isTestEmail ? 'Pass di Test generato' : 'Generato'} automaticamente via IMAP il ${new Date().toISOString()}`,
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
