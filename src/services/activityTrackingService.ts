import { GuestPass } from '../types.js';

/**
 * Lightweight, fire-and-forget activity tracking for the guest app.
 * Every call is silent and never throws: tracking must never break the guest experience.
 * Events are stored server-side per guest pass and surfaced to the host in the
 * "Prenotazioni" section of the Host Portal as a per-guest activity card.
 */

export type ActivityAction =
  | 'app_open'
  | 'page_view'
  | 'language_change'
  | 'wifi_copy'
  | 'wifi_qr_view'
  | 'whatsapp_contact'
  | 'maps_open'
  | 'house_rules_view'
  | 'booking_link_open'
  | 'ai_chat_open'
  | 'smart_lock_open_attempt'
  | 'smart_lock_open_success'
  | 'smart_lock_open_error'
  | 'document_upload';

const SESSION_KEY = 'aurora_activity_session_id_v1';

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `sess-${Date.now()}`;
  }
}

/**
 * Track a single guest activity event (page view, feature usage, etc.)
 * Requires an active GuestPass - public/anonymous visitors are not tracked.
 */
export function trackActivity(
  pass: Pick<GuestPass, 'id' | 'token' | 'guestName' | 'guestSurname'> | null | undefined,
  action: ActivityAction,
  detail?: string
) {
  if (!pass || typeof window === 'undefined') return;

  try {
    const payload = JSON.stringify({
      passId: pass.id,
      token: pass.token,
      guestName: `${pass.guestName || ''} ${pass.guestSurname || ''}`.trim(),
      action,
      detail: detail || '',
      sessionId: getSessionId()
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/guest/activity', blob);
      return;
    }

    fetch('/api/guest/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {});
  } catch {
    // Tracking must never break the guest experience
  }
}
