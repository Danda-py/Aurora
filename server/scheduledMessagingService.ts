import 'dotenv/config';
import crypto from 'crypto';
import path from 'path';
import { safeReadJsonSync, safeWriteFileSync } from './storageUtils.js';
import { isSupabaseConfigured, loadDocument, saveDocument } from './supabaseStorage.js';
import { sendGuestNotification } from './notificationService.js';
import { GuestPass } from '../src/types.js';
import { formatInvitationMessage } from '../src/services/guestPassService.js';

export interface ScheduledMessage {
  id: string;
  bookingRef: string;
  passId: string;
  guestName: string;
  phone: string;
  messageText: string;
  triggerType: 'welcome' | 'pre_checkin' | 'courtesy' | 'checkout' | 'custom';
  scheduledAt: string; // ISO string
  sentAt?: string; // ISO string
  status: 'pending' | 'sending' | 'sent' | 'failed';
  error?: string;
  channel: 'whatsapp' | 'sms';
}

const MESSAGES_REL_PATH = path.join('data', 'scheduled_messages.json');
const MESSAGES_DOCUMENT_KEY = 'scheduled_messages';

const defaultMessages: ScheduledMessage[] = [];
const serverScheduledMessages: ScheduledMessage[] = safeReadJsonSync<ScheduledMessage[]>(MESSAGES_REL_PATH, defaultMessages);

let messagingHydration: Promise<void> | null = null;
let lastMessagingHydrationTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds cache TTL
let scheduledMessagingInterval: NodeJS.Timeout | null = null;

/**
 * Hydrate scheduled messages list from Supabase
 */
export async function hydrateScheduledMessages(force = false): Promise<void> {
  const now = Date.now();
  if (!force && messagingHydration && (now - lastMessagingHydrationTime < CACHE_TTL_MS)) {
    return messagingHydration;
  }
  messagingHydration = (async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const remoteMessages = await loadDocument<ScheduledMessage[]>(MESSAGES_DOCUMENT_KEY);
      if (remoteMessages && Array.isArray(remoteMessages)) {
        serverScheduledMessages.splice(0, serverScheduledMessages.length, ...remoteMessages);
        lastMessagingHydrationTime = Date.now();
        console.log(`[Scheduled Messages] Hydrated ${remoteMessages.length} messages from Supabase.`);
      }
    } catch (error) {
      messagingHydration = null;
      console.error('[Scheduled Messages] Load failed; keeping local fallback:', error);
    }
  })();
  return messagingHydration;
}

/**
 * Persist scheduled messages both locally and to Supabase
 */
export async function persistScheduledMessages(): Promise<void> {
  // Save locally
  safeWriteFileSync(MESSAGES_REL_PATH, JSON.stringify(serverScheduledMessages, null, 2));

  // Save to Supabase
  if (isSupabaseConfigured()) {
    try {
      await saveDocument(MESSAGES_DOCUMENT_KEY, serverScheduledMessages);
      void hydrateScheduledMessages(true);
    } catch (error) {
      console.error('[Scheduled Messages] Supabase save failed:', error);
    }
  }
}

/**
 * Get all scheduled messages
 */
export function getScheduledMessages(): ScheduledMessage[] {
  return [...serverScheduledMessages];
}

/**
 * Automatically schedule automatic messages for a given GuestPass
 */
export async function scheduleBookingMessages(pass: GuestPass, origin?: string): Promise<void> {
  await hydrateScheduledMessages();

  // Prevent scheduling duplicate messages for the same pass
  const hasExistingWelcome = serverScheduledMessages.some(
    m => m.passId === pass.id && m.triggerType === 'welcome'
  );

  if (hasExistingWelcome) {
    console.log(`[Scheduled Messages] Welcome message already scheduled/sent for pass ID: ${pass.id}. Skipping.`);
    return;
  }

  const appUrl = (process.env.APP_URL || origin || 'https://aurora-valtellina.app').replace(/\/$/, '');
  const guestUrl = `${appUrl}/?pass=${pass.token}`;

  // 1. WELCOME message (scheduled for immediately)
  const welcomeText = formatInvitationMessage(pass, guestUrl);
  const welcomeMsg: ScheduledMessage = {
    id: `msg-${Date.now()}-welcome`,
    bookingRef: pass.bookingRef || '',
    passId: pass.id,
    guestName: `${pass.guestName} ${pass.guestSurname}`.trim(),
    phone: pass.phone || '',
    messageText: welcomeText,
    triggerType: 'welcome',
    scheduledAt: pass.createdAt || new Date().toISOString(),
    status: 'pending',
    channel: 'whatsapp' // Whatsapp is default, fallback to sms in twilio config if configured
  };
  serverScheduledMessages.unshift(welcomeMsg);

  // 2. PRE-CHECKIN message (detailed check-in instructions, scheduled for 3 days before check-in date, at 10:00 AM)
  if (pass.checkInDate) {
    try {
      const checkInDate = new Date(pass.checkInDate);
      const preCheckInDate = new Date(checkInDate.getTime() - 3 * 24 * 60 * 60 * 1000);
      preCheckInDate.setHours(10, 0, 0, 0);

      const preCheckInText = `🌿 *APPARTAMENTO AURORA • MORBEGNO*\n\nCiao ${pass.guestName}, mancano 3 giorni al tuo arrivo! Di seguito trovi i dettagli importanti per il tuo check-in.\n\n📍 Indirizzo: Via San Rocco 16, Morbegno (SO)\n🚪 Ingresso automatico con Smart Lock\n🕒 Orario check-in: dalle ore ${pass.checkInTime || '14:00'} in poi\n\nPuoi trovare tutte le istruzioni dettagliate, foto per l'accesso e l'apertura intelligente della porta sul tuo link personale:\n📲 ${guestUrl}\n\nNino, Host Aurora\n📞 +39 391 778 4042`;

      const preCheckInMsg: ScheduledMessage = {
        id: `msg-${Date.now()}-pre-checkin`,
        bookingRef: pass.bookingRef || '',
        passId: pass.id,
        guestName: `${pass.guestName} ${pass.guestSurname}`.trim(),
        phone: pass.phone || '',
        messageText: preCheckInText,
        triggerType: 'pre_checkin',
        scheduledAt: preCheckInDate.toISOString(),
        status: 'pending',
        channel: 'whatsapp'
      };
      serverScheduledMessages.push(preCheckInMsg);
    } catch (e) {
      console.error('[Scheduled Messages] Error calculating pre-checkin date:', e);
    }
  }

  // 3. COURTESY message (courtesy check, scheduled for 1 day after check-in, at 11:00 AM)
  if (pass.checkInDate) {
    try {
      const checkInDate = new Date(pass.checkInDate);
      const courtesyDate = new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);
      courtesyDate.setHours(11, 0, 0, 0);

      const courtesyText = `🌿 *APPARTAMENTO AURORA • MORBEGNO*\n\nCiao ${pass.guestName}, spero che la tua prima notte ad Aurora sia stata piacevole e rigenerante!\n\nVolevo solo assicurarmi che sia tutto okay e che l'appartamento risponda alle tue aspettative. Se hai qualsiasi domanda o necessità, non esitare a contattarmi.\n\nTi ricordo che puoi consultare le istruzioni della casa e i consigli sui dintorni in qualsiasi momento tramite il tuo link:\n📲 ${guestUrl}\n\nBuon soggiorno!\nNino, Host Aurora\n📞 +39 391 778 4042`;

      const courtesyMsg: ScheduledMessage = {
        id: `msg-${Date.now()}-courtesy`,
        bookingRef: pass.bookingRef || '',
        passId: pass.id,
        guestName: `${pass.guestName} ${pass.guestSurname}`.trim(),
        phone: pass.phone || '',
        messageText: courtesyText,
        triggerType: 'courtesy',
        scheduledAt: courtesyDate.toISOString(),
        status: 'pending',
        channel: 'whatsapp'
      };
      serverScheduledMessages.push(courtesyMsg);
    } catch (e) {
      console.error('[Scheduled Messages] Error calculating courtesy date:', e);
    }
  }

  // 4. CHECKOUT message (checkout instructions, scheduled for the night before departure, at 8:00 PM)
  if (pass.checkOutDate) {
    try {
      const checkOutDate = new Date(pass.checkOutDate);
      const checkoutInstructionsDate = new Date(checkOutDate.getTime() - 24 * 60 * 60 * 1000);
      checkoutInstructionsDate.setHours(20, 0, 0, 0);

      const checkoutText = `🌿 *APPARTAMENTO AURORA • MORBEGNO*\n\nCiao ${pass.guestName}, speriamo che il tuo soggiorno sia stato meraviglioso e rilassante!\n\nTi ricordiamo che domani è il giorno della partenza e il check-out è previsto entro le ore ${pass.checkOutTime || '10:00'}.\n\nEcco alcune semplici istruzioni per il rilascio dell'appartamento:\n🔑 Lascia le chiavi sul tavolo ed esci accostando la porta\n♻️ Ti chiediamo gentilmente di buttare i rifiuti negli appositi cassonetti\n📲 Puoi completare la procedura di check-out online in un click:\n📲 ${guestUrl}\n\nGrazie di cuore per essere stato nostro ospite! Buon viaggio e a presto!\n\nNino, Host Aurora\n📞 +39 391 778 4042`;

      const checkoutMsg: ScheduledMessage = {
        id: `msg-${Date.now()}-checkout`,
        bookingRef: pass.bookingRef || '',
        passId: pass.id,
        guestName: `${pass.guestName} ${pass.guestSurname}`.trim(),
        phone: pass.phone || '',
        messageText: checkoutText,
        triggerType: 'checkout',
        scheduledAt: checkoutInstructionsDate.toISOString(),
        status: 'pending',
        channel: 'whatsapp'
      };
      serverScheduledMessages.push(checkoutMsg);
    } catch (e) {
      console.error('[Scheduled Messages] Error calculating checkout date:', e);
    }
  }

  await persistScheduledMessages();
  console.log(`[Scheduled Messages] Successfully scheduled messages for GuestPass ID ${pass.id} (${pass.guestName})`);

  // Run queue processor immediately to dispatch any message scheduled for now (like the welcome message)
  void processScheduledMessages();
}

/**
 * Core processor for dispatching scheduled messages whose time is due
 */
export async function processScheduledMessages(): Promise<void> {
  const now = new Date().toISOString();
  const pendingToProcess = serverScheduledMessages.filter(
    m => m.status === 'pending' && m.scheduledAt <= now
  );

  if (pendingToProcess.length === 0) {
    return;
  }

  console.log(`[Scheduled Messages] Processing ${pendingToProcess.length} pending scheduled messages...`);

  for (const msg of pendingToProcess) {
    msg.status = 'sending';
    await persistScheduledMessages();

    if (!msg.phone) {
      msg.status = 'failed';
      msg.error = 'Numero di telefono mancante';
      msg.sentAt = new Date().toISOString();
      console.warn(`[Scheduled Messages] Message ${msg.id} failed: missing phone number.`);
      continue;
    }

    try {
      console.log(`[Scheduled Messages] Dispatching ${msg.triggerType} message to ${msg.phone} via ${msg.channel}...`);
      const result = await sendGuestNotification(msg.phone, msg.messageText, msg.channel);

      if (result.sent) {
        msg.status = 'sent';
        msg.error = undefined;
        msg.sentAt = new Date().toISOString();
        console.log(`[Scheduled Messages] Message ${msg.id} successfully sent to ${msg.phone}.`);
      } else {
        msg.status = 'failed';
        msg.error = result.error || 'Errore sconosciuto';
        msg.sentAt = new Date().toISOString();
        console.error(`[Scheduled Messages] Message ${msg.id} failed: ${msg.error}`);
      }
    } catch (err: any) {
      msg.status = 'failed';
      msg.error = err?.message || 'Errore interno';
      msg.sentAt = new Date().toISOString();
      console.error(`[Scheduled Messages] Message ${msg.id} failed with exception:`, err);
    }
  }

  await persistScheduledMessages();
}

/**
 * Cancel/delete a scheduled message
 */
export async function cancelScheduledMessage(id: string): Promise<boolean> {
  await hydrateScheduledMessages();
  const idx = serverScheduledMessages.findIndex(m => m.id === id);
  if (idx !== -1) {
    serverScheduledMessages.splice(idx, 1);
    await persistScheduledMessages();
    return true;
  }
  return false;
}

/**
 * Cancel/delete all scheduled messages for a specific GuestPass ID
 */
export async function cancelAllMessagesForPass(passId: string): Promise<number> {
  await hydrateScheduledMessages();
  let count = 0;
  for (let i = serverScheduledMessages.length - 1; i >= 0; i--) {
    if (serverScheduledMessages[i].passId === passId && serverScheduledMessages[i].status === 'pending') {
      serverScheduledMessages.splice(i, 1);
      count++;
    }
  }
  if (count > 0) {
    await persistScheduledMessages();
  }
  return count;
}

/**
 * Manually trigger / retry sending a scheduled message immediately
 */
export async function retryScheduledMessage(id: string): Promise<boolean> {
  await hydrateScheduledMessages();
  const msg = serverScheduledMessages.find(m => m.id === id);
  if (!msg) return false;

  msg.status = 'pending';
  msg.scheduledAt = new Date().toISOString(); // force run immediately
  await persistScheduledMessages();

  // Run processor immediately
  await processScheduledMessages();
  return (msg.status as string) === 'sent';
}

/**
 * Start background Scheduled Messaging Engine Watcher
 */
export function startScheduledMessagingWatcher() {
  if (scheduledMessagingInterval) {
    clearInterval(scheduledMessagingInterval);
  }

  console.log('[Scheduled Messages] Starting background scheduled messaging engine polling every 60 seconds.');

  scheduledMessagingInterval = setInterval(() => {
    void processScheduledMessages();
  }, 60000); // Poll every minute

  // Initial trigger after startup
  setTimeout(() => {
    void hydrateScheduledMessages().then(() => {
      void processScheduledMessages();
    });
  }, 5000);
}
