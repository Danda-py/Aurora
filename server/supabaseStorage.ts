import 'dotenv/config';
import type { GuestPass } from '../src/types';

const baseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(baseUrl && serviceRoleKey);
}

async function request<T>(table: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}/rest/v1/${table}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {})
    }
  });
  if (!response.ok) throw new Error(`Supabase ${table}: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function loadPasses(): Promise<GuestPass[] | null> {
  if (!isSupabaseConfigured()) return null;
  const rows = await request<Array<{ id: string; pass: GuestPass }>>('guest_passes?select=id,pass&order=created_at.desc');
  return rows.map(row => row.pass);
}

export async function upsertPass(pass: GuestPass): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request('guest_passes?on_conflict=id', {
    method: 'POST',
    body: JSON.stringify({ id: pass.id, token: pass.token, active: pass.active, check_in_date: pass.checkInDate, check_out_date: pass.checkOutDate, pass })
  });
}

export async function deletePass(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request(`guest_passes?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function loadDocument<T>(key: string): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  const rows = await request<Array<{ value: T }>>(`app_documents?select=value&key=eq.${encodeURIComponent(key)}&limit=1`);
  return rows[0]?.value ?? null;
}

export async function saveDocument<T>(key: string, value: T): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await request('app_documents?on_conflict=key', {
    method: 'POST',
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
  });
}
