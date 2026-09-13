import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import crypto from 'crypto';
import { parseBedAndBreakfastBooking, formatInvitationMessage, generateRandomPin } from '../src/services/guestPassService.js';
import { upsertPass } from './supabaseStorage.js';
import { GuestPass } from '../src/types.js';
import { scheduleBookingMessages } from './scheduledMessagingService.js';

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
      // Find unread messages from Bedandbreakfast.it or similar
      const messages = await client.search({ 
        seen: false
      });

      if (!messages || !Array.isArray(messages)) {
        console.log(`[IMAP] No unread emails found.`);
        return;
      }

      console.log(`[IMAP] Found ${messages.length} unread emails.`);

      for (const uid of messages) {
        // Fetch message source
        const messageStream = await client.fetchOne(String(uid), { source: true });
        if (!messageStream || !messageStream.source) continue;
        const parsedEmail = await simpleParser(messageStream.source);
        
        const subject = parsedEmail.subject || '';
        const textContent = parsedEmail.text || parsedEmail.html || '';
        const sender = parsedEmail.from?.value[0]?.address || '';

        console.log(`[IMAP] Processing Email UID: ${uid} | Sender: ${sender} | Subject: ${subject}`);

        // Check if it is a booking email from bed-and-breakfast.it, Bed & Breakfast, Airbnb, Booking.com or containing guest details
        const isBookingEmail = 
          /bed[- ]?and[- ]?breakfast\.it/i.test(sender) || 
          /bed[- ]?and[- ]?breakfast\.it/i.test(subject) ||
          /prenotazione/i.test(subject) || 
          /booking/i.test(subject) ||
          /nuova prenotazione/i.test(textContent) ||
          /BB-\d{4,8}/.test(textContent);

        if (isBookingEmail) {
          console.log(`[IMAP] Valid booking email found. Running AI/Regex parser...`);
          const parsed = parseBedAndBreakfastBooking(textContent);

          if (parsed.guestName && parsed.checkInDate && parsed.checkOutDate) {
            // Check if pass already exists (to avoid duplicate generations on same booking reference)
            const exists = serverPasses.some(p => p.bookingRef === parsed.bookingRef && parsed.bookingRef !== '');
            
            const globalDeletedRefs = (global as any).deletedBookingRefsRef || [];
            const isDeleted = parsed.bookingRef && globalDeletedRefs.includes(parsed.bookingRef);

            if (isDeleted) {
              console.log(`[IMAP] Booking reference ${parsed.bookingRef} was previously deleted/revoked by the host. Skipping.`);
            } else if (!exists) {
              const pinCode = generateRandomPin();
              const newPass: GuestPass = {
                id: `pass-imap-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                guestName: parsed.guestName,
                guestSurname: parsed.guestSurname,
                checkInDate: parsed.checkInDate,
                checkInTime: '14:00',
                checkOutDate: parsed.checkOutDate,
                checkOutTime: '10:00',
                phone: parsed.phone,
                pinCode,
                bookingRef: parsed.bookingRef || `BB-${Math.floor(10000 + Math.random() * 90000)}`,
                guestsCount: parsed.guestsCount,
                bookingSource: (parsed.bookingSource as any) || 'bed-and-breakfast.it',
                notes: `Generato automaticamente da Email IMAP. Soggetto: ${subject}`,
                createdAt: new Date().toISOString(),
                active: true,
                token: ''
              };

              const token = crypto.randomBytes(32).toString('base64url');
              newPass.token = token;

              // Save to list
              serverPasses.unshift(newPass);
              await upsertPass(newPass);
              
              const appUrl = (process.env.APP_URL || 'https://aurora-valtellina.app').replace(/\/$/, '');
              const guestUrl = `${appUrl}/?pass=${token}`;

              console.log(`[IMAP] SUCCESS! Generated VIP Pass for ${newPass.guestName} ${newPass.guestSurname}. Link: ${guestUrl}`);
              
              // Schedule automatic messages using the scheduled messaging service
              await scheduleBookingMessages(newPass, appUrl);
            } else {
              console.log(`[IMAP] Booking reference ${parsed.bookingRef} already processed. Skipping.`);
            }
          } else {
            console.log(`[IMAP] Email didn't contain complete guest data (Name, Check-In, Check-Out). Skipping pass generation.`);
          }
        }

        // Mark as read after processing (so we don't process it again)
        await client.messageFlagsAdd(String(uid), ['\\Seen']);
        console.log(`[IMAP] Marked email UID ${uid} as read.`);
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
