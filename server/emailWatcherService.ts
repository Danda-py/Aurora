import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import crypto from 'crypto';
import { parseBedAndBreakfastBooking, formatInvitationMessage, generateRandomPin, parseIReservationEmail } from '../src/services/guestPassService.js';
import { upsertPass } from './supabaseStorage.js';
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

/**
 * Configure IMAP engine dynamically
 */
export function updateImapConfig(newConfig: Partial<ImapConfig>) {
  imapConfig = { ...imapConfig, ...newConfig };
  
  // Restart polling if config changed and is enabled
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  if (imapConfig.enabled && imapConfig.user && imapConfig.pass && imapConfig.host) {
    startEmailWatcher();
  }
}

export function getImapConfig() {
  return {
    ...imapConfig,
    pass: imapConfig.pass ? '••••••••' : ''
  };
}

/**
 * Connect to IMAP, read unread messages from bed-and-breakfast.it, parse them, 
 * generate pass and eventually flag them as read.
 */
export async function checkNewEmailsAndGeneratePasses(serverPasses: GuestPass[]) {
  if (!imapConfig.host || !imapConfig.user || !imapConfig.pass) {
    console.log('[IMAP] Engine not fully configured yet. Skipping email check.');
    return;
  }

  if (isPolling) {
    console.log('[IMAP] Check already in progress, skipping.');
    return;
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
    logger: false
  });

  try {
    await client.connect();
    
    // Select INBOX
    const lock = await client.getMailboxLock('INBOX');
    try {
      console.log('[IMAP] Avvio sincronizzazione vecchie e nuove email...');
      const unseen = (await client.search({ seen: false })) || [];
      const pastBB = (await client.search({ header: { field: 'subject', value: 'ireservation' } })) || [];
      const pastBB2 = (await client.search({ header: { field: 'subject', value: 'prenotazione' } })) || [];
      const uids = Array.from(new Set([...unseen, ...pastBB, ...pastBB2]));

      if (uids.length === 0) return;
      console.log(`[IMAP] Trovate ${uids.length} email da esaminare.`);
      const todayStr = new Date().toISOString().split('T')[0];

      for (const uid of uids) {
        const messageStream = await client.fetchOne(String(uid), { source: true });
        if (!messageStream || !messageStream.source) continue;
        const parsedEmail = await simpleParser(messageStream.source);
        
        const subject = parsedEmail.subject || '';
        const textContent = parsedEmail.text || parsedEmail.html || '';
        const htmlContent = parsedEmail.html || '';
        const sender = parsedEmail.from?.value[0]?.address || '';

        const isTargetEmail = 
          /bed[- ]?and[- ]?breakfast\.it|b&b\.it|ireservation/i.test(sender) || 
          /bed[- ]?and[- ]?breakfast\.it|b&b\.it|ireservation/i.test(subject) ||
          /bed[- ]?and[- ]?breakfast\.it|b&b\.it|ireservation/i.test(textContent);

        if (!isTargetEmail) continue;

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
              }
            }
          }
          await client.messageFlagsAdd(String(uid), ['\\Seen']);
          continue;
        }

        const isIReservation = /ireservation/i.test(sender) || /ireservation/i.test(subject) || /ireservation/i.test(textContent);
        const parsed = isIReservation ? parseIReservationEmail(textContent, htmlContent) : parseBedAndBreakfastBooking(textContent);
        const bookingRef = parsed.bookingRef;

        if (parsed.guestName && parsed.checkInDate && parsed.checkOutDate && bookingRef) {
          const existingIdx = serverPasses.findIndex(p => p.bookingRef === bookingRef || p.id === `ires-${bookingRef}`);
          if ((global as any).deletedBookingRefsRef?.includes(bookingRef)) continue;

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
          } else {
            const pinCode = generateRandomPin();
            const token = crypto.randomBytes(32).toString('base64url');
            targetPass = {
              id: `ires-${bookingRef}`, guestName: parsed.guestName, guestSurname: parsed.guestSurname, phone: parsed.phone,
              guestEmail: (parsed as any).guestEmail, checkInDate: parsed.checkInDate, checkInTime: '14:00',
              checkOutDate: parsed.checkOutDate, checkOutTime: '10:00', pinCode, bookingRef, guestsCount: parsed.guestsCount,
              bookingSource: parsed.bookingSource || 'other', amount: (parsed as any).amount, apartmentName: (parsed as any).apartmentName,
              nightsCount: (parsed as any).nightsCount, notes: `Generato automaticamente via IMAP il ${new Date().toISOString()}`,
              createdAt: new Date().toISOString(), active: true, token
            };
            serverPasses.unshift(targetPass);
          }

          await upsertPass(targetPass);
          if (targetPass.checkOutDate >= todayStr) {
            await scheduleBookingMessages(targetPass);
          }
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
