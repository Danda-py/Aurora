import nodeIcal from 'node-ical';
import crypto from 'crypto';
import path from 'path';
import { GuestPass } from '../src/types.js';
import { safeReadJsonSync, safeWriteFileSync } from './storageUtils.js';
import { isSupabaseConfigured, loadDocument, saveDocument, upsertPass } from './supabaseStorage.js';

export interface ChannelFeed {
  id: string;
  name: string; // e.g. "Airbnb", "Booking.com", "Bed-and-Breakfast.it", "Vrbo"
  channelType: 'airbnb' | 'booking' | 'bed_and_breakfast' | 'vrbo' | 'custom';
  url: string;
  enabled: boolean;
  lastSync?: string;
  lastStatus?: 'success' | 'error' | 'pending';
  lastError?: string;
  importedReservationsCount?: number;
}

export interface ChannelManagerConfig {
  enabled: boolean;
  autoSyncIntervalMinutes: number; // default: 15
  channels: ChannelFeed[];
  lastGlobalSync?: string;
}

const CONFIG_PATH = path.join('data', 'channel_manager_config.json');
const SUPABASE_DOC_KEY = 'channel_manager_config';

const DEFAULT_CONFIG: ChannelManagerConfig = {
  enabled: true,
  autoSyncIntervalMinutes: 15,
  channels: [
    {
      id: 'bed_and_breakfast_default',
      name: 'Bed-and-Breakfast.it',
      channelType: 'bed_and_breakfast',
      url: process.env.ICAL_SYNC_URL || '',
      enabled: Boolean(process.env.ICAL_SYNC_URL),
      importedReservationsCount: 0
    }
  ]
};

let currentConfig: ChannelManagerConfig = safeReadJsonSync<ChannelManagerConfig>(CONFIG_PATH, DEFAULT_CONFIG);
let syncTimer: NodeJS.Timeout | null = null;
let isSyncing = false;

// Reference to in-memory global passes passed by server/app.ts
let globalPassesRef: GuestPass[] = [];

export function setGlobalPassesReference(passes: GuestPass[]) {
  globalPassesRef = passes;
}

export async function hydrateChannelManagerConfig(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const remote = await loadDocument<Partial<ChannelManagerConfig>>(SUPABASE_DOC_KEY);
      if (remote) {
        currentConfig = {
          ...currentConfig,
          ...remote,
          channels: Array.isArray(remote.channels) ? remote.channels : currentConfig.channels
        };
      }
    } catch (err) {
      console.warn('[ChannelManager] Impossibile caricare configurazione da Supabase:', err);
    }
  }

  // Ensure at least empty channels array
  if (!Array.isArray(currentConfig.channels)) {
    currentConfig.channels = [];
  }

  // Start background auto sync if enabled
  startChannelAutoSync();
}

export function getChannelManagerConfig(): ChannelManagerConfig {
  return JSON.parse(JSON.stringify(currentConfig));
}

export async function updateChannelManagerConfig(newConfig: Partial<ChannelManagerConfig>): Promise<ChannelManagerConfig> {
  currentConfig = {
    ...currentConfig,
    ...newConfig,
    channels: Array.isArray(newConfig.channels) ? newConfig.channels : currentConfig.channels
  };

  safeWriteFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2));

  if (isSupabaseConfigured()) {
    try {
      await saveDocument(SUPABASE_DOC_KEY, currentConfig);
    } catch (err) {
      console.error('[ChannelManager] Errore salvataggio su Supabase:', err);
    }
  }

  // Restart timer with new interval if changed
  startChannelAutoSync();
  return getChannelManagerConfig();
}

function generateRandomPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function parseIcalDate(dateVal: any): string {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Extracts clean guest name and surname from iCal event summary or description
 */
function extractGuestDetails(summary: string, description: string, channelName: string): { guestName: string; guestSurname: string; bookingRef: string } {
  const sum = (summary || '').trim();
  const desc = (description || '').trim();

  let guestName = 'Ospite';
  let guestSurname = channelName;
  let bookingRef = '';

  // Case 1: Airbnb format e.g. "Airbnb (HM12345678)" or "Reserved - Mario Rossi"
  const airbnbMatch = sum.match(/Airbnb\s*\(([^)]+)\)/i);
  if (airbnbMatch) {
    bookingRef = airbnbMatch[1].trim();
    guestSurname = `Airbnb (${bookingRef.substring(0, 6)})`;
  }

  // Case 2: "Reserved - Mario Rossi" or "Prenotazione - Mario Rossi"
  const reservedMatch = sum.match(/(?:Reserved|Prenotazione|Booking|Ospite)\s*[-:]\s*([A-Za-zÀ-ÿ\s]+)/i);
  if (reservedMatch) {
    const parts = reservedMatch[1].trim().split(/\s+/);
    if (parts.length >= 2) {
      guestName = parts[0];
      guestSurname = parts.slice(1).join(' ');
    } else if (parts.length === 1 && parts[0]) {
      guestName = parts[0];
      guestSurname = channelName;
    }
  } else if (!airbnbMatch) {
    // If summary is just names e.g. "Mario Rossi"
    const words = sum.split(/\s+/).filter(w => !w.toLowerCase().includes('not') && !w.toLowerCase().includes('available') && !w.toLowerCase().includes('bloccato'));
    if (words.length >= 2 && words[0].length > 1) {
      guestName = words[0];
      guestSurname = words.slice(1).join(' ');
    } else if (words.length === 1 && words[0]) {
      guestName = words[0];
      guestSurname = channelName;
    }
  }

  // Check description for phone or reservation code
  if (desc) {
    const codeMatch = desc.match(/(?:Codice|Rif|Prenotazione|Code|ID|Reservation)\s*[:#]?\s*([A-Za-z0-9_-]{4,20})/i);
    if (codeMatch && !bookingRef) {
      bookingRef = codeMatch[1];
    }
  }

  return { guestName, guestSurname, bookingRef };
}

/**
 * Synchronize a single channel feed
 */
export async function syncSingleChannel(channelId: string, passes: GuestPass[] = globalPassesRef): Promise<{ success: boolean; imported: number; error?: string }> {
  const channel = currentConfig.channels.find(c => c.id === channelId);
  if (!channel) {
    return { success: false, imported: 0, error: 'Canale non trovato' };
  }

  if (!channel.url || !channel.url.startsWith('http')) {
    channel.lastStatus = 'error';
    channel.lastError = 'URL iCal non valido o mancante';
    channel.lastSync = new Date().toISOString();
    return { success: false, imported: 0, error: channel.lastError };
  }

  try {
    console.log(`[ChannelManager] Sincronizzazione in corso per canale: ${channel.name} (${channel.url})`);
    const events = await nodeIcal.async.fromURL(channel.url);
    let imported = 0;

    for (const k in events) {
      const ev = events[k];
      if (!ev || ev.type !== 'VEVENT') continue;

      const startDate = parseIcalDate(ev.start);
      const endDate = parseIcalDate(ev.end);

      if (!startDate || !endDate) continue;

      // Ignore past events ending more than 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (new Date(endDate) < thirtyDaysAgo) continue;

      const summary = ev.summary ? String(ev.summary) : '';
      const description = ev.description ? String(ev.description) : '';
      const uid = ev.uid ? String(ev.uid) : `ical-${startDate}-${endDate}`;

      // Ignore blocked calendar dates or maintenance (e.g. "Not available", "Blocked", "Airbnb (Not available)")
      if (/not\s*available|bloccato|indisponibile|manutenzione|closed/i.test(summary)) {
        continue;
      }

      const { guestName, guestSurname, bookingRef } = extractGuestDetails(summary, description, channel.name);
      const finalBookingRef = bookingRef || uid;

      // Check if pass already exists for this bookingRef or dates from this channel
      const existing = passes.find(p => 
        (p.bookingRef && p.bookingRef === finalBookingRef) ||
        (p.checkInDate === startDate && p.checkOutDate === endDate && p.channelSource === channel.name)
      );

      if (!existing) {
        const newPass: GuestPass = {
          id: crypto.randomUUID(),
          token: crypto.randomBytes(16).toString('hex'),
          pinCode: generateRandomPin(),
          guestName,
          guestSurname,
          checkInDate: startDate,
          checkOutDate: endDate,
          checkInConfirmed: true, // pre-authorized for the booking stay
          active: true,
          bookingRef: finalBookingRef,
          channelSource: channel.name,
          createdAt: new Date().toISOString()
        };

        passes.unshift(newPass);
        if (isSupabaseConfigured()) {
          await upsertPass(newPass).catch(e => console.warn('[ChannelManager] Upsert pass err:', e));
        }
        imported++;
      } else {
        // Update dates if modified in the calendar
        if (existing.checkInDate !== startDate || existing.checkOutDate !== endDate) {
          existing.checkInDate = startDate;
          existing.checkOutDate = endDate;
          if (isSupabaseConfigured()) {
            await upsertPass(existing).catch(e => console.warn('[ChannelManager] Update pass err:', e));
          }
        }
      }
    }

    channel.lastStatus = 'success';
    channel.lastError = undefined;
    channel.lastSync = new Date().toISOString();
    channel.importedReservationsCount = (channel.importedReservationsCount || 0) + imported;

    await updateChannelManagerConfig({ channels: currentConfig.channels });
    console.log(`[ChannelManager] Canale ${channel.name} sincronizzato: ${imported} nuove prenotazioni importate.`);
    return { success: true, imported };
  } catch (err: any) {
    console.error(`[ChannelManager] Errore sincronizzazione canale ${channel.name}:`, err);
    channel.lastStatus = 'error';
    channel.lastError = err.message || 'Errore durante il download iCal';
    channel.lastSync = new Date().toISOString();
    await updateChannelManagerConfig({ channels: currentConfig.channels });
    return { success: false, imported: 0, error: channel.lastError };
  }
}

/**
 * Synchronize all active channels
 */
export async function syncAllChannels(passes: GuestPass[] = globalPassesRef): Promise<{ totalImported: number; results: Array<{ id: string; name: string; success: boolean; imported: number; error?: string }> }> {
  if (isSyncing) {
    return { totalImported: 0, results: [] };
  }

  isSyncing = true;
  let totalImported = 0;
  const results: Array<{ id: string; name: string; success: boolean; imported: number; error?: string }> = [];

  try {
    for (const ch of currentConfig.channels) {
      if (!ch.enabled) continue;
      const res = await syncSingleChannel(ch.id, passes);
      results.push({
        id: ch.id,
        name: ch.name,
        success: res.success,
        imported: res.imported,
        error: res.error
      });
      totalImported += res.imported;
    }

    currentConfig.lastGlobalSync = new Date().toISOString();
    safeWriteFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2));
    if (isSupabaseConfigured()) {
      await saveDocument(SUPABASE_DOC_KEY, currentConfig).catch(() => {});
    }
  } finally {
    isSyncing = false;
  }

  return { totalImported, results };
}

/**
 * Start periodic background auto-sync
 */
export function startChannelAutoSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }

  if (!currentConfig.enabled) {
    return;
  }

  const intervalMinutes = Math.max(5, currentConfig.autoSyncIntervalMinutes || 15);
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`[ChannelManager] Avviato timer auto-sync canali ogni ${intervalMinutes} minuti.`);
  syncTimer = setInterval(() => {
    void syncAllChannels().catch(err => {
      console.warn('[ChannelManager] Errore in auto-sync periodico:', err);
    });
  }, intervalMs);
}
