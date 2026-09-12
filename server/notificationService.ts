// Shared Twilio sender used by both the iCal watcher and the manual/webhook pass creation flow.
export type MessageChannel = 'whatsapp' | 'sms';

export interface NotificationResult {
  sent: boolean;
  channel: MessageChannel;
  error?: string;
}

function normalizePhone(phone: string): string {
  let cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = `+39${cleanPhone.replace(/^0/, '')}`;
  }
  return cleanPhone;
}

/**
 * Sends a guest notification (WhatsApp or SMS) via Twilio.
 * Falls back to a console log (no-op) if Twilio env vars are missing.
 */
export async function sendGuestNotification(
  phone: string,
  message: string,
  channel: MessageChannel = 'whatsapp'
): Promise<NotificationResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsapp = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_FROM_NUMBER;
  const fromSms = process.env.TWILIO_SMS_FROM || process.env.TWILIO_FROM_NUMBER?.replace(/^whatsapp:/, '');
  const fromNumber = channel === 'sms' ? fromSms : fromWhatsapp;

  if (!phone) {
    return { sent: false, channel, error: 'Numero di telefono mancante' };
  }

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[Notifiche] Configurazione Twilio assente. Messaggio teorico (${channel}) per ${phone}:\n${message}`);
    return { sent: false, channel, error: 'Twilio non configurato' };
  }

  const cleanPhone = normalizePhone(phone);
  const to = channel === 'whatsapp' ? `whatsapp:${cleanPhone}` : cleanPhone;
  const from = channel === 'whatsapp' && !fromNumber.startsWith('whatsapp:') ? `whatsapp:${fromNumber}` : fromNumber;

  try {
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams({ To: to, From: from, Body: message });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (res.ok) {
      console.log(`[Notifiche] Messaggio ${channel} inviato con successo a ${cleanPhone}.`);
      return { sent: true, channel };
    }

    const errBody = await res.json().catch(() => ({} as any));
    console.error('[Notifiche] Errore Twilio API:', errBody);
    return { sent: false, channel, error: errBody?.message || `HTTP ${res.status}` };
  } catch (err: any) {
    console.error(`[Notifiche] Errore invio notifica a ${cleanPhone}:`, err);
    return { sent: false, channel, error: err?.message || 'Errore sconosciuto' };
  }
}
