import nodeIcal from 'node-ical';
import crypto from 'crypto';
import { generateRandomPin, formatInvitationMessage } from '../src/services/guestPassService.js';
import { upsertPass, isSupabaseConfigured, loadDocument, saveDocument } from './supabaseStorage.js';
import { sendGuestNotification } from './notificationService.js';
import { GuestPass } from '../src/types.js';
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
  enabled: process.env.ICAL_SYNC_ENABLED === 'true',
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
  if (!icalConfig.icalUrl || !icalConfig.enabled) {
    console.log('[iCal Engine] Sincronizzazione iCal disattivata o URL vuoto.');
    return;
  }

  if (isIcalPolling) {
    console.log('[iCal Engine] Polling già in esecuzione.');
    return;
  }

  isIcalPolling = true;
  console.log('[iCal Engine] Avvio download calendario iCal da Bed-and-Breakfast.it...');

  try {
    // Scarica e analizza il file .ics
    const webEvents = await nodeIcal.fromURL(icalConfig.icalUrl);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const k in webEvents) {
      if (!Object.prototype.hasOwnProperty.call(webEvents, k)) continue;
      const event = webEvents[k];
      
      if (event.type !== 'VEVENT') continue;

      const checkInDateObj = parseIcalDate(event.start);
      const checkOutDateObj = parseIcalDate(event.end);

      if (isNaN(checkInDateObj.getTime()) || isNaN(checkOutDateObj.getTime())) continue;

      // Formatta in stringhe YYYY-MM-DD
      const checkInStr = checkInDateObj.toISOString().split('T')[0];
      const checkOutStr = checkOutDateObj.toISOString().split('T')[0];

      // Ignoriamo le prenotazioni vecchie (concluse) per ottimizzare
      if (checkOutDateObj < today) continue;

      // iCal di Bed-and-Breakfast.it di solito mette i dettagli dell'ospite nel campo "SUMMARY" o "DESCRIPTION"
      // es. SUMMARY: Mario Rossi - BB-12345
      // es. DESCRIPTION: Telefono: +393401234567\nNote: Arrivo pomeriggio...
      const rawSummary = event.summary;
      const summary: string = (typeof rawSummary === 'string' ? rawSummary : (rawSummary as any)?.val || '') || 'Ospite Bed-and-Breakfast.it';
      const rawDesc = event.description;
      const description: string = (typeof rawDesc === 'string' ? rawDesc : (rawDesc as any)?.val || '');

      // Tenta di decifrare nome, cognome e prenotazione dal SUMMARY
      let guestName = 'Ospite';
      let guestSurname = '';
      let bookingRef = event.uid || `BB-ICAL-${Math.floor(10000 + Math.random() * 90000)}`;

      // Pulisce l'UID/riferimento da domini tipo @bed-and-breakfast.it
      if (bookingRef.includes('@')) {
        bookingRef = bookingRef.split('@')[0];
      }

      // Estrai il nome dal summary: es. "Mario Rossi (BB-12345)" o "Mario Rossi"
      const nameParts = summary.replace(/\(.*\)/g, '').trim().split(/\s+/);
      if (nameParts.length >= 2) {
        guestName = nameParts[0];
        guestSurname = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1 && nameParts[0] !== '') {
        guestName = nameParts[0];
      }

      // Estrai il numero di telefono dalla descrizione
      let phone = '';
      const phoneMatch = description.match(/(?:tel(?:efono)?|cell(?:ulare)?|phone|mobile|whatsapp)[:\s]*([+\d\s\-\.()]{8,22})/i);
      if (phoneMatch) {
        phone = phoneMatch[1].replace(/[\s\-\.()]/g, '');
      } else {
        // Fallback: cerca sequenza numerica simile a telefono nella descrizione
        const rawPhoneMatch = description.match(/(?:\+39|0039)?[\s\-\.]*3\d{2}[\s\-\.]*\d{6,7}/);
        if (rawPhoneMatch) {
          phone = rawPhoneMatch[0].replace(/[\s\-\.()]/g, '');
        }
      }

      // 1. Verifica se abbiamo già generato un pass per questa specifica prenotazione (UID/Ref)
      let existingPass = serverPasses.find(p => p.bookingRef === bookingRef);
      let newlyCreated = false;

      if (!existingPass) {
        console.log(`[iCal Engine] Rilevata NUOVA prenotazione da iCal: ${guestName} ${guestSurname} (${checkInStr} -> ${checkOutStr})`);

        // Genera pass
        const pinCode = generateRandomPin();
        const token = crypto.randomBytes(32).toString('base64url');

        existingPass = {
          id: `pass-ical-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          guestName,
          guestSurname,
          checkInDate: checkInStr,
          checkInTime: '14:00',
          checkOutDate: checkOutStr,
          checkOutTime: '10:00',
          phone,
          pinCode,
          bookingRef,
          guestsCount: 2,
          bookingSource: 'bed-and-breakfast.it',
          notes: `Importato automaticamente via iCal. Descrizione originale: ${description}`,
          createdAt: new Date().toISOString(),
          active: true,
          token
        };

        // Salva in memoria e su Supabase
        serverPasses.unshift(existingPass);
        await upsertPass(existingPass);
        newlyCreated = true;
        console.log(`[iCal Engine] Pass VIP creato per ${guestName}. Token generato.`);
      }

      // 2. Controllo TEMPO di invio: Invia il giorno stesso della prenotazione (ovvero non appena viene rilevata e creata!)
      const alreadySent = existingPass.notes && existingPass.notes.includes('[NOTIFICA_INVIATA]');

      if (!alreadySent) {
        console.log(`[iCal Engine] Procedo all'invio istantaneo della notifica per ${guestName}.`);

        const appUrl = (process.env.APP_URL || 'https://aurora-valtellina.app').replace(/\/$/, '');
        const guestUrl = `${appUrl}/?pass=${existingPass.token}`;
        const whatsappMessage = formatInvitationMessage(existingPass, guestUrl);

        let success = false;
        if (existingPass.phone) {
          const sendResult = await sendGuestNotification(existingPass.phone, whatsappMessage, 'whatsapp');
          success = sendResult.sent;
        } else {
          console.warn(`[iCal Engine] Impossibile inviare notifica a ${guestName}: Telefono mancante nell'iCal.`);
        }

        // Segna come inviato nelle note del pass per evitare doppi invii successivi
        existingPass.notes = `${existingPass.notes || ''}\n[NOTIFICA_INVIATA] Notificato istantaneamente il ${new Date().toISOString()}.`.trim();
        await upsertPass(existingPass);
      } else {
        console.log(`[iCal Engine] Notifica per ${guestName} già inviata in precedenza.`);
      }
    }

  } catch (error) {
    console.error('[iCal Engine] Errore critico durante la sincronizzazione iCal:', error);
  } finally {
    isIcalPolling = false;
    console.log('[iCal Engine] Sincronizzazione iCal completata.');
  }
}

/**
 * Avvia il timer di background per il controllo automatico del calendario iCal
 */
export function startIcalWatcher() {
  if (icalPollingInterval) {
    clearInterval(icalPollingInterval);
  }

  if (!icalConfig.enabled) {
    console.log('[iCal Engine] Background iCal Watcher disattivato.');
    return;
  }

  const interval = icalConfig.intervalMs || 1800000; // default 30 min
  console.log(`[iCal Engine] Avvio polling iCal ogni ${interval / 60000} minuti.`);

  icalPollingInterval = setInterval(() => {
    const globalServerPasses = (global as any).serverPassesRef || [];
    void syncReservationsFromIcal(globalServerPasses);
  }, interval);

  // Esegui un controllo immediato all'avvio
  setTimeout(() => {
    const globalServerPasses = (global as any).serverPassesRef || [];
    void syncReservationsFromIcal(globalServerPasses);
  }, 5000);
}

