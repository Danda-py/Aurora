import nodeIcal from 'node-ical';
import crypto from 'crypto';
import { generateRandomPin, formatInvitationMessage } from '../src/services/guestPassService.js';
import { upsertPass, isSupabaseConfigured, loadDocument, saveDocument } from './supabaseStorage.js';
import { sendGuestNotification } from './notificationService.js';
import { GuestPass } from '../src/types.js';
import { scheduleBookingMessages } from './scheduledMessagingService.js';
let icalPollingInterval: NodeJS.Timeout | null = null;
let isIcalPolling = false;

export interface IcalSyncConfig {
  icalUrl: string;       // Link iCal di esportazione fornito dall'area riservata di Bed-and-Breakfast.it
  enabled: boolean;      // Attivo o Disattivato
  intervalMs?: number;   // Frequenza di polling in millisecondi (default: 30 minuti)
  daysAheadToSend?: number; // Quanti giorni prima del check-in inviare il link (non più usato per l'invio istantaneo ma mantenuto per compatibilità)
}

let icalConfig: IcalSyncConfig = {
  icalUrl: process.env.ICAL_SYNC_URL || '',
  enabled: false, // Disattivato in favore del parser email iReservation
  intervalMs: Number(process.env.ICAL_SYNC_INTERVAL_MS) || 1800000, // default 30 min
  daysAheadToSend: Number(process.env.ICAL_DAYS_AHEAD_SEND) || 3
};

const ICAL_CONFIG_DOCUMENT_KEY = 'ical_sync_config';

/**
 * Hydrate iCal configuration from Supabase
 */
export async function hydrateIcalConfig(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const remoteConfig = await loadDocument<Partial<IcalSyncConfig>>(ICAL_CONFIG_DOCUMENT_KEY);
    if (remoteConfig) {
      icalConfig = { ...icalConfig, ...remoteConfig };
    }
  } catch (error) {
    console.warn('[iCal Engine] Impossibile caricare la configurazione da Supabase:', error);
  }
}

/**
 * Aggiorna dinamicamente la configurazione dell'iCal Engine e la salva su Supabase
 */
export async function updateIcalConfigAsync(newConfig: Partial<IcalSyncConfig>) {
  icalConfig = { ...icalConfig, ...newConfig };
  
  if (isSupabaseConfigured()) {
    try {
      await saveDocument(ICAL_CONFIG_DOCUMENT_KEY, icalConfig);
    } catch (error) {
      console.error('[iCal Engine] Errore salvataggio configurazione su Supabase:', error);
    }
  }

  if (icalPollingInterval) {
    clearInterval(icalPollingInterval);
    icalPollingInterval = null;
  }
  
  if (icalConfig.enabled && icalConfig.icalUrl) {
    startIcalWatcher();
  }
}

// Deprecated, use updateIcalConfigAsync
export function updateIcalConfig(newConfig: Partial<IcalSyncConfig>) {
  void updateIcalConfigAsync(newConfig);
}

export function getIcalConfig() {
  return icalConfig;
}

/**
 * Converte date string in Date object
 */
function parseIcalDate(icalDate: any): Date {
  return new Date(icalDate);
}

// Twilio sending logic now lives in ./notificationService.ts (shared with manual pass creation).

/**
 * Esegue il fetch del calendario iCal da bed-and-breakfast.it,
 * estrae le prenotazioni, genera i link univoci e notifica IMMEDIATAMENTE
 */
export async function syncReservationsFromIcal(serverPasses: GuestPass[]) {
  console.log('[iCal Engine] Sincronizzazione iCal disattivata in favore dell\'elaborazione automatica delle email iReservation.');
  return;
}
export function startIcalWatcher() {
  console.log('[iCal Engine] Background iCal Watcher disattivato in favore dell\'elaborazione automatica delle email iReservation.');
}

