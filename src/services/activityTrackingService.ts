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
  | 'document_upload'
  | 'button_click';

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

/**
 * Best-effort human-readable label for whatever element was clicked, used by the
 * global click tracker below. Prefers an explicit `data-track-label`, then
 * standard accessible names, then falls back to the element's visible text.
 */
function getClickLabel(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;

  const explicit = target.closest('[data-track-label]') as HTMLElement | null;
  if (explicit?.dataset.trackLabel) return explicit.dataset.trackLabel.trim().slice(0, 80);

  const interactive = target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]') as HTMLElement | null;
  if (!interactive) return null;

  const aria = interactive.getAttribute('aria-label');
  if (aria && aria.trim()) return aria.trim().slice(0, 80);

  const title = interactive.getAttribute('title');
  if (title && title.trim()) return title.trim().slice(0, 80);

  const text = interactive.textContent?.replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 80);

  const tag = interactive.tagName.toLowerCase();
  return `elemento ${tag}`;
}

/**
 * Attaches a single document-wide click listener that logs EVERY click on a
 * button, link or button-like element, regardless of whether that specific
 * control has its own dedicated trackActivity() call elsewhere. This guarantees
 * the host's activity card shows a complete trail of "whatever button was
 * clicked", even for controls that aren't individually instrumented.
 *
 * Returns a cleanup function to remove the listener (call from a useEffect).
 */
export function attachGlobalClickTracking(
  pass: Pick<GuestPass, 'id' | 'token' | 'guestName' | 'guestSurname'> | null | undefined,
  getCurrentPage: () => string
): () => void {
  if (typeof document === 'undefined') return () => {};

  const handleClick = (event: MouseEvent) => {
    if (!pass) return;
    const label = getClickLabel(event.target);
    if (!label) return;
    const page = getCurrentPage();
    trackActivity(pass, 'button_click', page ? `[${page}] ${label}` : label);
  };

  // Capture phase so this fires even if a specific handler stops propagation.
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
