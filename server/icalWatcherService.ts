import nodeIcal from 'node-ical';
import crypto from 'crypto';
import { generateRandomPin, formatInvitationMessage } from '../src/services/guestPassService.js';
import { upsertPass } from './supabaseStorage.js';
import { GuestPass } from '../src/types.js';

let icalPollingInterval: NodeJS.Timeout | null = null;
let isIcalPolling = false;

export interface IcalSyncConfig {
  icalUrl: string;       // Link iCal di esportazione fornito dall'area riservata di Bed-and-Breakfast.it
  enabled: boolean;      // Attivo o Disattivato
  intervalMs?: number;   // Frequenza di polling in millisecondi (default: 30 minuti)
  daysAheadToSend?: number; // Quanti giorni prima del check-in inviare il link (default: 3)
}

let icalConfig: IcalSyncConfig = {
  icalUrl: process.env.ICAL_SYNC_URL || '',
  enabled: process.env.ICAL_SYNC_ENABLED === 'true',
  intervalMs: Number(process.env.ICAL_SYNC_INTERVAL_MS) || 1800000, // default 30 min
  daysAheadToSend: Number(process.env.ICAL_DAYS_AHEAD_SEND) || 3
};

/**
 * Aggiorna dinamicamente la configurazione dell'iCal Engine
 */
export function updateIcalConfig(newConfig: Partial<IcalSyncConfig>) {
  icalConfig = { ...icalConfig, ...newConfig };
  
  if (icalPollingInterval) {
    clearInterval(icalPollingInterval);
    icalPollingInterval = null;
  }
  
  if (icalConfig.enabled && icalConfig.icalUrl) {
    startIcalWatcher();
  }
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

/**
 * Invia l'SMS o WhatsApp automatico (via Twilio o gateway di notifica configurato)
 */
async function sendNotification(phone: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[iCal Engine] Configurazione Twilio assente. Messaggio teorico per ${phone}:\n${message}`);
    return false;
  }

  let cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = `+39${cleanPhone}`;
  }

  try {
    const isWhatsapp = fromNumber.startsWith('whatsapp:');
    const to = isWhatsapp ? `whatsapp:${cleanPhone}` : cleanPhone;
    
    console.log(`[iCal Engine] Invio in corso via Twilio a ${to}...`);
    
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
      console.log(`[iCal Engine] Notifica inviata con successo a ${cleanPhone}!`);
      return true;
    } else {
      const errBody = await res.json();
      console.error(`[iCal Engine] Errore Twilio API:`, errBody);
      return false;
    }
  } catch (err) {
    console.error(`[iCal Engine] Errore invio notifica a ${cleanPhone}:`, err);
    return false;
  }
}

/**
 * Esegue il fetch del calendario iCal da bed-and-breakfast.it,
 * estrae le prenotazioni, genera i link univoci e notifica se siamo a ridosso del check-in (es. <= 3 giorni prima)
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

    const daysAheadLimit = icalConfig.daysAheadToSend || 3;

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
      const summary = event.summary || 'Ospite Bed-and-Breakfast.it';
      const description = event.description || '';

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

      if (!existingPass) {
        console.log(`[iCal Engine] Rilevata NUOVA prenotazione da iCal: ${guestName} ${guestSurname} (${checkInStr} -> ${checkOutStr})`);
        
        // Genera pass ma impostalo come "in attesa di invio" o inseriscilo in lista
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
        console.log(`[iCal Engine] Pass VIP creato per ${guestName}. Token generato.`);
      }

      // 2. Controllo TEMPO di invio: Invia solo se mancano <= daysAheadLimit (es. 3) giorni dal check-in
      const msDiff = checkInDateObj.getTime() - today.getTime();
      const daysUntilCheckIn = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

      // Verifichiamo se abbiamo già inviato il messaggio per questo pass (salvato in una nota o campo custom)
      const alreadySent = existingPass.notes && existingPass.notes.includes('[NOTIFICA_INVIATA]');

      if (daysUntilCheckIn <= daysAheadLimit && daysUntilCheckIn >= 0 && !alreadySent) {
        console.log(`[iCal Engine] Siamo a ${daysUntilCheckIn} giorni dal check-in di ${guestName}. Procedo all'invio automatico.`);

        const appUrl = (process.env.APP_URL || 'https://aurora-valtellina.app').replace(/\/$/, '');
        const guestUrl = `${appUrl}/?pass=${existingPass.token}`;
        const whatsappMessage = formatInvitationMessage(existingPass, guestUrl);

        let success = false;
        if (existingPass.phone) {
          success = await sendNotification(existingPass.phone, whatsappMessage);
        } else {
          console.warn(`[iCal Engine] Impossibile inviare notifica a ${guestName}: Telefono mancante nell'iCal.`);
        }

        // Segna come inviato nelle note del pass per evitare doppi invii successivi
        existingPass.notes = `${existingPass.notes || ''}\n[NOTIFICA_INVIATA] Notificato il ${new Date().toISOString()} (mancavano ${daysUntilCheckIn} giorni al check-in).`.trim();
        await upsertPass(existingPass);
      } else if (alreadySent) {
        console.log(`[iCal Engine] Notifica per ${guestName} già inviata in precedenza.`);
      } else {
        console.log(`[iCal Engine] Prenotazione di ${guestName} troppo lontana (${daysUntilCheckIn} giorni al check-in). Invio rimandato.`);
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
