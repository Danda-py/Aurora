import { GuestPass, SmartLockConfig } from '../types';

const STORAGE_KEY_PASSES = 'aurora_host_passes_v1';
const STORAGE_KEY_ACTIVE_PASS = 'aurora_current_vip_pass_v1';
const STORAGE_KEY_SMART_LOCK = 'aurora_smart_lock_config_v1';

const toBase64 = (str: string) => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'binary').toString('base64');
  }
  return btoa(str);
};

const fromBase64 = (b64: string) => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('binary');
  }
  return atob(b64);
};

/**
 * Generate a cryptographically random, user-friendly 4-digit PIN (e.g. 2741)
 */
export function generateRandomPin(): string {
  const pinNum = Math.floor(1000 + Math.random() * 9000);
  return String(pinNum);
}

/**
 * Encode a GuestPass into an URL-safe base64 string
 */
export function encodePassToToken(pass: Omit<GuestPass, 'token'>): string {
  const payload = {
    id: pass.id,
    n: pass.guestName,
    s: pass.guestSurname,
    p: pass.phone || '',
    ci: pass.checkInDate,
    cit: pass.checkInTime || '15:00',
    co: pass.checkOutDate,
    cot: pass.checkOutTime || '10:00',
    pin: pass.pinCode,
    src: pass.bookingSource || 'bed-and-breakfast.it',
    ref: pass.bookingRef || '',
    gc: pass.guestsCount || 2,
    nt: pass.notes || '',
    v: 1
  };

  try {
    const jsonStr = JSON.stringify(payload);
    // encode UTF8 safe to base64
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64 = toBase64(binary);
    // make url-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Error encoding pass token:', err);
    return pass.id;
  }
}

/**
 * Decode a URL-safe token back to GuestPass
 */
export function decodeTokenToPass(token: string): GuestPass | null {
  if (!token) return null;
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = fromBase64(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const p = JSON.parse(jsonStr);

    return {
      id: p.id || `pass-${Date.now()}`,
      guestName: p.n || 'Ospite',
      guestSurname: p.s || '',
      phone: p.p || '',
      checkInDate: p.ci,
      checkInTime: p.cit || '15:00',
      checkOutDate: p.co,
      checkOutTime: p.cot || '10:00',
      pinCode: p.pin || '2741',
      bookingSource: p.src || 'bed-and-breakfast.it',
      bookingRef: p.ref || '',
      guestsCount: p.gc || 2,
      notes: p.nt || '',
      token: token,
      createdAt: new Date().toISOString(),
      active: true
    };
  } catch (err) {
    console.warn('Failed to decode guest token:', err);
    return null;
  }
}

/**
 * Parse booking text from bed-and-breakfast.it (or email confirmations)
 */
export function parseBedAndBreakfastBooking(rawText: string): {
  guestName: string;
  guestSurname: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  bookingRef: string;
  bookingSource?: string;
} {
  const text = rawText || '';
  let guestName = '';
  let guestSurname = '';
  let phone = '';
  let checkInDate = '';
  let checkOutDate = '';
  let guestsCount = 2;
  let bookingRef = '';
  let bookingSource = 'bed-and-breakfast.it';

  if (/booking\.com/i.test(text)) bookingSource = 'booking.com';
  else if (/airbnb/i.test(text)) bookingSource = 'airbnb';
  else if (/vrbo|expedia/i.test(text)) bookingSource = 'expedia';
  else if (/bed-and-breakfast\.it|b&b\.it/i.test(text)) bookingSource = 'bed-and-breakfast.it';

  // Month dictionary for written date parsing
  const monthsMap: Record<string, string> = {
    gennaio: '01', gennaio_: '01', gen: '01', jan: '01', january: '01',
    febbraio: '02', feb: '02', february: '02',
    marzo: '03', mar: '03', march: '03',
    aprile: '04', apr: '04', april: '04',
    maggio: '05', mag: '05', may: '05',
    giugno: '06', giu: '06', jun: '06', june: '06',
    luglio: '07', lug: '07', jul: '07', july: '07',
    agosto: '08', ago: '08', aug: '08', august: '08',
    settembre: '09', set: '09', sept: '09', september: '09',
    ottobre: '10', ott: '10', oct: '10', october: '10',
    novembre: '11', nov: '11', november: '11',
    dicembre: '12', dic: '12', dec: '12', december: '12'
  };

  // Helper to parse date string into YYYY-MM-DD
  const parseAnyDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Check written month: e.g. 15 settembre 2026 or 15 set 2026
    const writtenMatch = dateStr.match(/(\d{1,2})\s+([a-zA-ZÀ-ÿ]+)\s+(\d{2,4})/);
    if (writtenMatch) {
      const day = writtenMatch[1].padStart(2, '0');
      const mName = writtenMatch[2].toLowerCase();
      const month = monthsMap[mName] || '01';
      let year = writtenMatch[3];
      if (year.length === 2) year = `20${year}`;
      return `${year}-${month}-${day}`;
    }

    // Check numeric: dd/mm/yyyy or yyyy-mm-dd
    const numMatch = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (numMatch) {
      const day = numMatch[1].padStart(2, '0');
      const month = numMatch[2].padStart(2, '0');
      let year = numMatch[3];
      if (year.length === 2) year = `20${year}`;
      return `${year}-${month}-${day}`;
    }

    const isoMatch = dateStr.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return '';
  };

  // Extract Booking Reference / Numero prenotazione with multi-pattern precision
  const stopWords = new Set([
    'da', 'di', 'del', 'della', 'per', 'a', 'in', 'su', 'il', 'la', 'un', 'una', 
    'nuova', 'nuovo', 'bed', 'breakfast', 'airbnb', 'booking', 'com', 'it', 
    'confermata', 'ricevuta', 'accettata', 'saluti', 'grazie', 'notifica'
  ]);

  const refPatterns = [
    // 1. Explicit full labels (e.g. "Numero prenotazione: BB-67807", "Codice di prenotazione: 39482")
    /(?:codice\s*(?:di\s*)?prenotazione|numero\s*(?:di\s*)?prenotazione|n(?:umero|\.|\s*#)?\s*prenotazione|prenotazione\s*n(?:umero|\.|\s*#)?|riferimento\s*(?:di\s*)?prenotazione|rif\.?\s*prenotazione|id\s*prenotazione)\s*[:=–-]?\s*#?\s*([A-Za-z0-9\-_]{3,30})/i,
    // 2. Booking.com / Airbnb / OTA specific patterns
    /(?:booking\s*(?:number|ref|reference|id|code)|confirmation\s*code|reservation\s*(?:id|number|code)|pin\s*code)\s*[:=–-]?\s*#?\s*([A-Za-z0-9\-_]{3,30})/i,
    // 2b. Common notification formats such as "Prenotazione #67807" or "Booking ID 67807"
    /(?:prenotazione|booking|reservation)\s*(?:n(?:umero|\.)?|id|code|ref(?:erence)?)?\s*#\s*([A-Za-z0-9\-_]{3,30})/i,
    /(?:id|codice|numero|ref|rif)\s*(?:di\s*)?(?:prenotazione|booking|reservation)?\s*[:=#-]\s*([A-Za-z0-9\-_]{3,30})/i,
    // 3. Shorter labels requiring strict colon/equals/hash delimiter (to avoid matching "prenotazione da...")
    /(?:codice|numero|ref|rif|booking\s?id)\s*[:=#]\s*([A-Za-z0-9\-_]{3,30})/i,
    // 4. Standalone BB-XXXXX format typical of bed-and-breakfast.it
    /\b(BB-\d{4,8})\b/i,
    // 5. Strict "Prenotazione: XYZ" requiring colon
    /(?:prenotazione)\s*[:=]\s*#?\s*([A-Za-z0-9\-_]{3,30})/i
  ];

  for (const pattern of refPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!stopWords.has(candidate.toLowerCase()) && candidate.length >= 3 && !/^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}$/.test(candidate)) {
        bookingRef = candidate;
        break;
      }
    }
  }

  // Extract Guest Name
  const nameMatch = text.match(/(?:nome\s*e\s*cognome|ospite|cliente|guest|richiedente|prenotazione\s*(?:di|per|a\s*nome\s*di))[:\s]+([^\n\r,\.]+)/i);
  if (nameMatch) {
    let full = nameMatch[1].trim();
    full = full.replace(/^(?:sig\.|sig\.ra|dott\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
    const parts = full.split(/\s+/);
    if (parts.length >= 2) {
      guestName = parts[0];
      guestSurname = parts.slice(1).join(' ');
    } else {
      guestName = full;
    }
  } else {
    // Try lines starting with Nome: ...
    const lines = text.split('\n');
    for (const line of lines) {
      if (/^\s*nome\s*[:=]/i.test(line)) {
        guestName = line.replace(/^\s*nome\s*[:=]\s*/i, '').trim();
      } else if (/^\s*cognome\s*[:=]/i.test(line)) {
        guestSurname = line.replace(/^\s*cognome\s*[:=]\s*/i, '').trim();
      }
    }
  }

  // Extract Phone Number
  const phoneMatch = text.match(/(?:tel(?:efono)?|cell(?:ulare)?|phone|mobile|whatsapp)[:\s]*([+\d\s\-\.()]{8,22})/i);
  if (phoneMatch) {
    phone = phoneMatch[1].trim();
  } else {
    // Look for raw international or national telephone number e.g. +39 340 1234567 or 340 1234567
    const rawPhoneMatch = text.match(/(?:\+39|0039)?[\s\-\.]*3\d{2}[\s\-\.]*\d{6,7}/);
    if (rawPhoneMatch) {
      phone = rawPhoneMatch[0].trim();
    }
  }

  // Find check-in date
  const checkInMatch = text.match(/(?:check[- ]?in|arrivo|dal|data arrivo|arrival|check in)[:\s]*([0-9a-zA-Z\/\-\.\s]{5,20})/i);
  if (checkInMatch) {
    checkInDate = parseAnyDate(checkInMatch[1]);
  }

  // Find check-out date
  const checkOutMatch = text.match(/(?:check[- ]?out|partenza|al|data partenza|departure|check out)[:\s]*([0-9a-zA-Z\/\-\.\s]{5,20})/i);
  if (checkOutMatch) {
    checkOutDate = parseAnyDate(checkOutMatch[1]);
  }

  // Fallback: search any consecutive dates in text if not found yet
  if (!checkInDate || !checkOutDate) {
    const allNumericMatches = [...text.matchAll(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g)];
    if (allNumericMatches.length >= 2) {
      if (!checkInDate) checkInDate = parseAnyDate(allNumericMatches[0][1]);
      if (!checkOutDate) checkOutDate = parseAnyDate(allNumericMatches[1][1]);
    }
  }

  // Guests count
  const guestCountMatch = text.match(/(?:persone|ospiti|adulti|guests|pax)[:\s]*(\d+)/i);
  if (guestCountMatch) {
    guestsCount = parseInt(guestCountMatch[1], 10) || 2;
  }

  return {
    guestName,
    guestSurname,
    phone,
    checkInDate,
    checkOutDate,
    guestsCount,
    bookingRef,
    bookingSource
  };
}

export type StayStatus = 'upcoming' | 'active' | 'expired';

export interface StayTiming {
  status: StayStatus;
  totalNights: number;
  currentDay: number; // 1 to totalNights
  daysUntilCheckIn: number;
  hoursUntilCheckIn: number;
  hoursRemaining: number;
  isExpired: boolean;
  isActive: boolean;
  isUpcoming: boolean;
  formattedCountdown: string;
}

/**
 * Calculate precise stay countdown and validity
 */
export function getStayTiming(pass: GuestPass, now: Date = new Date()): StayTiming {
  if (!pass.checkInDate || !pass.checkOutDate) {
    return {
      status: 'active',
      totalNights: 1,
      currentDay: 1,
      daysUntilCheckIn: 0,
      hoursUntilCheckIn: 0,
      hoursRemaining: 24,
      isExpired: false,
      isActive: true,
      isUpcoming: false,
      formattedCountdown: 'Soggiorno Attivo'
    };
  }

  const [inY, inM, inD] = pass.checkInDate.split('-').map(Number);
  const [outY, outM, outD] = pass.checkOutDate.split('-').map(Number);
  
  const [inH, inMin] = (pass.checkInTime || '15:00').split(':').map(Number);
  const [outH, outMin] = (pass.checkOutTime || '10:00').split(':').map(Number);

  // Check-in timestamp (e.g. 15:00 on checkInDate)
  const checkInDateTime = new Date(inY, inM - 1, inD, inH || 15, inMin || 0, 0);
  // Check-out timestamp (e.g. 10:00 on checkOutDate, with 2-hour grace margin up to 12:00)
  const checkOutDateTime = new Date(outY, outM - 1, outD, outH || 10, outMin || 0, 0);
  // Total night duration in ms
  const oneDayMs = 24 * 60 * 60 * 1000;
  const totalNights = Math.max(1, Math.round((new Date(outY, outM - 1, outD).getTime() - new Date(inY, inM - 1, inD).getTime()) / oneDayMs));

  const nowMs = now.getTime();
  const checkInMs = checkInDateTime.getTime();
  const checkOutMs = checkOutDateTime.getTime();

  if (nowMs < checkInMs) {
    // Upcoming stay
    const diffMs = checkInMs - nowMs;
    const daysUntil = Math.floor(diffMs / oneDayMs);
    const hoursUntil = Math.floor((diffMs % oneDayMs) / (60 * 60 * 1000));
    const minsUntil = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    let countdown = '';
    if (daysUntil > 0) {
      countdown = `Mancano ${daysUntil} ${daysUntil === 1 ? 'giorno' : 'giorni'} e ${hoursUntil} ore`;
    } else {
      countdown = `Arrivo oggi: mancano ${hoursUntil} ore e ${minsUntil} min`;
    }

    return {
      status: 'upcoming',
      totalNights,
      currentDay: 0,
      daysUntilCheckIn: daysUntil,
      hoursUntilCheckIn: Math.floor(diffMs / (60 * 60 * 1000)),
      hoursRemaining: Math.floor((checkOutMs - nowMs) / (60 * 60 * 1000)),
      isExpired: false,
      isActive: false,
      isUpcoming: true,
      formattedCountdown: countdown
    };
  } else if (nowMs <= checkOutMs) {
    // Currently active stay
    const elapsedMs = nowMs - checkInMs;
    const currentDay = Math.min(totalNights, Math.floor(elapsedMs / oneDayMs) + 1);
    const diffMs = checkOutMs - nowMs;
    const daysLeft = Math.floor(diffMs / oneDayMs);
    const hoursLeft = Math.floor((diffMs % oneDayMs) / (60 * 60 * 1000));

    let countdown = '';
    if (daysLeft > 0) {
      countdown = `Giorno ${currentDay} di ${totalNights} • Restano ${daysLeft} ${daysLeft === 1 ? 'notte' : 'notti'}`;
    } else {
      countdown = `Ultimo giorno • Check-out entro le ore ${pass.checkOutTime || '10:00'}`;
    }

    return {
      status: 'active',
      totalNights,
      currentDay,
      daysUntilCheckIn: 0,
      hoursUntilCheckIn: 0,
      hoursRemaining: Math.floor(diffMs / (60 * 60 * 1000)),
      isExpired: false,
      isActive: true,
      isUpcoming: false,
      formattedCountdown: countdown
    };
  } else {
    // Expired stay
    return {
      status: 'expired',
      totalNights,
      currentDay: totalNights,
      daysUntilCheckIn: 0,
      hoursUntilCheckIn: 0,
      hoursRemaining: 0,
      isExpired: true,
      isActive: false,
      isUpcoming: false,
      formattedCountdown: 'Soggiorno Concluso'
    };
  }
}

/**
 * Build shareable link for a pass
 */
export function buildPassUrl(token: string): string {
  if (typeof window === 'undefined') return `https://aurora-valtellina.app/?pass=${token}`;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?pass=${token}`;
}

/**
 * Format warm, thoughtful WhatsApp / SMS welcome message
 */
export function formatInvitationMessage(pass: GuestPass, fullUrl: string): string {
  const firstName = pass.guestName || 'Gentile Ospite';
  const surname = pass.guestSurname ? ` ${pass.guestSurname}` : '';
  const fullName = `${firstName}${surname}`.trim();

  return (
`🌿 *APPARTAMENTO AURORA • MORBEGNO*
Ciao ${fullName}, ti diamo un caloroso benvenuto!

Abbiamo preparato tutto con cura per farti sentire coccolato e rilassato durante il tuo soggiorno ad Aurora:

📅 *Arrivo:* ${pass.checkInDate} (accesso autonomo dalle ore ${pass.checkInTime || '15:00'})
📅 *Partenza:* ${pass.checkOutDate} (entro le ore ${pass.checkOutTime || '10:00'})
🚪 *Apertura Portone:* 1-tap dal tuo link personale (Pulsante Smart Sonoff)
🚗 *Parcheggio:* Posto auto riservato gratuito nel cortile privato

📲 *La tua Guida Personale della Casa & di Morbegno:*
${fullUrl}

Nella guida trovi la connessione 1-tap al Wi-Fi, il funzionamento degli elettrodomestici, la macchina del caffè con le capsule di benvenuto e i nostri consigli sinceri sui migliori crotti dove mangiare i veri pizzoccheri fatti a mano.

Per qualsiasi consiglio o informazione prima e durante il viaggio, scrivimi pure qui.
A presto e buon viaggio!
*Antonino (Nino)* - Host Aurora
📞 +39 391 778 4042`
  );
}

/**
 * Autonomous Guest Pass Creator
 * Can be called by Webhooks, API endpoints, or URL query parameters
 */
export function createAutonomousGuestPass(params: {
  guestName: string;
  guestSurname?: string;
  phone?: string;
  checkInDate: string;
  checkInTime?: string;
  checkOutDate: string;
  checkOutTime?: string;
  pinCode?: string;
  bookingRef?: string;
  guestsCount?: number;
  bookingSource?: 'bed-and-breakfast.it' | 'direct' | 'booking.com' | 'airbnb' | 'other';
  notes?: string;
  originUrl?: string;
}): {
  pass: GuestPass;
  token: string;
  fullUrl: string;
  pinCode: string;
  invitationMessage: string;
} {
  const pinCode = params.pinCode && /^\d{4}$/.test(params.pinCode) 
    ? params.pinCode 
    : generateRandomPin();

  const id = `pass-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  const rawPass: Omit<GuestPass, 'token'> = {
    id,
    guestName: (params.guestName || 'Ospite').trim(),
    guestSurname: (params.guestSurname || '').trim(),
    phone: (params.phone || '').trim(),
    checkInDate: params.checkInDate,
    checkInTime: params.checkInTime || '15:00',
    checkOutDate: params.checkOutDate,
    checkOutTime: params.checkOutTime || '10:00',
    pinCode,
    bookingRef: params.bookingRef || `AUTO-${Date.now().toString().slice(-5)}`,
    guestsCount: params.guestsCount || 2,
    bookingSource: params.bookingSource || 'bed-and-breakfast.it',
    notes: params.notes || 'Generato automaticamente via Webhook/API',
    createdAt: new Date().toISOString(),
    active: true
  };

  const token = encodePassToToken(rawPass);
  const fullPass: GuestPass = { ...rawPass, token };

  // Save to host storage if client-side
  saveHostPass(fullPass);

  const baseOrigin = params.originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://aurora-valtellina.app');
  const fullUrl = `${baseOrigin}/?pass=${token}`;
  const invitationMessage = formatInvitationMessage(fullPass, fullUrl);

  return {
    pass: fullPass,
    token,
    fullUrl,
    pinCode,
    invitationMessage
  };
}

/**
 * Local Storage Persistence for Host
 */
export function getSavedHostPasses(): GuestPass[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PASSES);
    if (!raw) return getInitialDemoPasses();
    return JSON.parse(raw);
  } catch {
    return getInitialDemoPasses();
  }
}

export function saveHostPass(pass: GuestPass): void {
  if (typeof window === 'undefined') return;
  const current = getSavedHostPasses();
  const existingIdx = current.findIndex(p => p.id === pass.id);
  if (existingIdx >= 0) {
    current[existingIdx] = pass;
  } else {
    current.unshift(pass);
  }
  localStorage.setItem(STORAGE_KEY_PASSES, JSON.stringify(current));
}

export function deleteHostPass(id: string): void {
  if (typeof window === 'undefined') return;
  const current = getSavedHostPasses();
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PASSES, JSON.stringify(filtered));
}

/**
 * Active session Guest Pass
 */
export function getActiveGuestPass(): GuestPass | null {
  if (typeof window === 'undefined') return null;
  return null;
}

export async function validateGuestPassToken(token: string): Promise<GuestPass | null> {
  if (!token) return null;
  try {
    const response = await fetch(`/api/guest/pass?token=${encodeURIComponent(token)}`, {
      credentials: 'same-origin',
      cache: 'no-store'
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.success || !data.pass) return null;
    localStorage.setItem(STORAGE_KEY_ACTIVE_PASS, JSON.stringify(data.pass));
    return data.pass as GuestPass;
  } catch {
    return null;
  }
}

export function clearActiveGuestPass(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_ACTIVE_PASS);
  // remove pass from url without reload
  const url = new URL(window.location.href);
  url.searchParams.delete('pass');
  url.searchParams.delete('guest');
  url.searchParams.delete('ticket');
  window.history.replaceState({}, '', url.toString());
}

/**
 * Smart Lock Configuration (Home Assistant / eWeLink)
 */
export function getSmartLockConfig(): SmartLockConfig {
  if (typeof window === 'undefined') {
    return {
      webhookUrl: '',
      apiBearerToken: '',
      deviceEntityId: 'lock.aurora_portone',
      enabled: false
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SMART_LOCK);
    if (raw) return JSON.parse(raw);
  } catch {}

  return {
    webhookUrl: '',
    apiBearerToken: '',
    deviceEntityId: 'lock.aurora_portone',
    enabled: false
  };
}

export function saveSmartLockConfig(cfg: SmartLockConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SMART_LOCK, JSON.stringify(cfg));
}

/**
 * Trigger Smart Lock action to Home Assistant / eWeLink
 */
export async function triggerSmartLockAPI(
  pin: string, 
  guestName: string, 
  action: 'unlock' | 'sync_pin' = 'unlock'
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/hass/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guest: guestName,
        source: `Pannello Host (${action === 'sync_pin' ? 'Sincronizzazione PIN' : 'Sblocco Porta'})`,
        wifiConnected: true
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || `Codice ${pin} convalidato! Porta sbloccata con successo.`
      };
    } else {
      return {
        success: false,
        message: data.error || 'Errore nella comunicazione con Home Assistant.'
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Errore connessione serratura: ${err.message || 'Verifica la connessione di rete.'}`
    };
  }
}

/**
 * Initial Demo passes for immediate evaluation
 */
function getInitialDemoPasses(): GuestPass[] {
  const today = new Date();
  const inDate = new Date(today);
  inDate.setDate(today.getDate() - 1);
  const outDate = new Date(today);
  outDate.setDate(today.getDate() + 2);

  const format = (d: Date) => d.toISOString().split('T')[0];

  const demoPass: Omit<GuestPass, 'token'> = {
    id: 'pass-demo-vip',
    guestName: 'Marco',
    guestSurname: 'Rossi',
    phone: '+39 340 123 4567',
    checkInDate: format(inDate),
    checkInTime: '15:00',
    checkOutDate: format(outDate),
    checkOutTime: '10:00',
    pinCode: '2741',
    bookingRef: 'BB-67807',
    guestsCount: 2,
    bookingSource: 'bed-and-breakfast.it',
    notes: 'Arrivo in treno da Milano Centrale',
    createdAt: new Date().toISOString(),
    active: true
  };

  const token = encodePassToToken(demoPass);
  return [{ ...demoPass, token }];
}
