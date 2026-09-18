import 'dotenv/config';
import type { GuestPass, DigitalKeyLog, GuestActivityLog } from '../src/types.js';

const baseUrl = (
  process.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  ''
).trim().replace(/\/$/, '');

const serviceRoleKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(baseUrl && serviceRoleKey);
}

async function request<T>(table: string, init: RequestInit = {}): Promise<T> {
  const preferHeader = init.method === 'POST' && table.includes('on_conflict=')
    ? 'resolution=merge-duplicates,return=representation'
    : 'return=representation';

  const response = await fetch(`${baseUrl}/rest/v1/${table}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: preferHeader,
      ...(init.headers || {})
    }
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Supabase ${table}: HTTP ${response.status} - ${errorText}`);
  }
  if (response.status === 204) {
    return [] as unknown as T;
  }
  const text = await response.text();
  if (!text) {
    return [] as unknown as T;
  }
  return JSON.parse(text) as T;
}

export async function loadPasses(): Promise<GuestPass[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const rows = await request<Array<{ id: string; pass: GuestPass }>>('guest_passes?select=id,pass&order=created_at.desc');
    return Array.isArray(rows) ? rows.map(row => row.pass) : [];
  } catch (error) {
    console.error('Error loading passes from Supabase:', error);
    return null;
  }
}

export async function upsertPass(pass: GuestPass): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await request('guest_passes?on_conflict=id', {
      method: 'POST',
      body: JSON.stringify({ id: pass.id, token: pass.token, active: pass.active, check_in_date: pass.checkInDate, check_out_date: pass.checkOutDate, pass })
    });
  } catch (error) {
    console.error(`Error upserting pass "${pass.id}" to Supabase:`, error);
  }
}

export async function deletePass(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await request(`guest_passes?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    console.error(`Error deleting pass "${id}" from Supabase:`, error);
  }
}

export async function loadDocument<T>(key: string): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const rows = await request<Array<{ value: T }>>(`app_documents?select=value&key=eq.${encodeURIComponent(key)}&limit=1`);
    return Array.isArray(rows) && rows.length > 0 ? (rows[0]?.value ?? null) : null;
  } catch (error) {
    console.error(`Error loading document "${key}" from Supabase:`, error);
    return null;
  }
}

export async function saveDocument<T>(key: string, value: T): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const rows = await request<Array<{ key: string }>>('app_documents?on_conflict=key', {
      method: 'POST',
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
    });
    // PostgREST might return 204 or representation. If representation is returned, validate.
    if (Array.isArray(rows) && rows.length > 0 && !rows.some(row => row.key === key)) {
      throw new Error(`Supabase non ha confermato il salvataggio del documento "${key}".`);
    }
  } catch (error: any) {
    console.error(`Error saving document "${key}" to Supabase:`, error);
    throw error;
  }
}

export async function logDigitalKeyAccess(log: Omit<DigitalKeyLog, 'id'>): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await request('digital_key_logs', {
      method: 'POST',
      body: JSON.stringify({
        guest_pass_id: log.guestPassId,
        guest_name: log.guestName,
        success: log.success,
        error_message: log.errorMessage,
        source: log.source,
        ip_address: log.ipAddress,
        timestamp: log.timestamp
      })
    });
  } catch (error) {
    console.error('Error saving digital key access log to Supabase:', error);
  }
}

export async function loadDigitalKeyLogs(): Promise<DigitalKeyLog[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const rows = await request<any[]>('digital_key_logs?select=*&order=timestamp.desc');
    if (!Array.isArray(rows)) return [];
    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      guestPassId: row.guest_pass_id,
      guestName: row.guest_name,
      success: row.success,
      errorMessage: row.error_message,
      source: row.source,
      ipAddress: row.ip_address
    }));
  } catch (error) {
    console.error('Error loading digital key logs from Supabase:', error);
    return null;
  }
}

export async function logGuestActivity(log: Omit<GuestActivityLog, 'id'>): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await request('guest_activity_logs', {
      method: 'POST',
      body: JSON.stringify({
        guest_pass_id: log.guestPassId,
        guest_name: log.guestName,
        action_type: log.actionType,
        details: log.details,
        ip_address: log.ipAddress,
        timestamp: log.timestamp
      })
    });
  } catch (error) {
    console.error('Error saving guest activity log to Supabase:', error);
  }
}

export async function loadGuestActivityLogs(): Promise<GuestActivityLog[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const rows = await request<any[]>('guest_activity_logs?select=*&order=timestamp.desc');
    if (!Array.isArray(rows)) return [];
    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      guestPassId: row.guest_pass_id,
      guestName: row.guest_name,
      actionType: row.action_type,
      details: row.details,
      ipAddress: row.ip_address
    }));
  } catch (error) {
    console.error('Error loading guest activity logs from Supabase:', error);
    return null;
  }
}
