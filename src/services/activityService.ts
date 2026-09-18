import { GuestActivityLog } from '../types';

export async function logActivity(
  actionType: 'pwa_open' | 'page_view' | 'feature_use' | string,
  details: string,
  guestPassId?: string | null,
  guestName?: string
) {
  try {
    let resolvedPassId = guestPassId;
    let resolvedGuestName = guestName;
    
    if (!resolvedPassId || !resolvedGuestName) {
      const activePassRaw = localStorage.getItem('aurora_active_pass_v1') || localStorage.getItem('aurora_active_pass') || localStorage.getItem('aurora_guest_pass');
      if (activePassRaw) {
        try {
          const pass = JSON.parse(activePassRaw);
          if (pass) {
            if (!resolvedPassId) resolvedPassId = pass.id;
            if (!resolvedGuestName) resolvedGuestName = `${pass.guestName} ${pass.guestSurname || ''}`.trim();
          }
        } catch {}
      }
    }
    
    await fetch('/api/guest/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guestPassId: resolvedPassId || null,
        guestName: resolvedGuestName || 'Ospite Anonimo',
        actionType,
        details
      })
    });
  } catch (error) {
    console.warn('Failed to log guest activity:', error);
  }
}
