# Configurazione produzione

## Supabase

1. Crea un progetto su Supabase.
2. Apri **SQL Editor** e incolla `supabase/schema.sql`.
3. In **Project Settings -> API** copia:
   - Project URL in `SUPABASE_URL`
   - `service_role` key in `SUPABASE_SERVICE_ROLE_KEY`
4. Inserisci entrambe le variabili nel gestore segreti di Vercel o del provider di deploy.
5. Non usare mai `SUPABASE_SERVICE_ROLE_KEY` in variabili `VITE_*` o nel browser.
6. Esegui un nuovo deploy.

Quando le variabili sono presenti, pass e documenti CMS vengono letti e salvati in Supabase. Senza di esse il progetto usa il fallback JSON locale per lo sviluppo.

## Webhook prenotazioni

Configura nel provider che invia le prenotazioni:

- URL: `https://DOMINIO_PUBBLICO/api/webhook/booking`
- Metodo: `POST`
- Header: `X-Booking-Webhook-Secret: stesso-valore-di-BOOKING_WEBHOOK_SECRET`
- Content-Type: `application/json`

Payload minimo:

```json
{
  "guestName": "Mario",
  "guestSurname": "Rossi",
  "checkInDate": "2026-09-15",
  "checkOutDate": "2026-09-18",
  "phone": "+39 340 1234567",
  "bookingRef": "BB-12345",
  "guestsCount": 2
}
```

In alternativa puoi inviare il testo completo della notifica con `rawText`; il parser proverà a estrarre i campi.

Il webhook risponde `401` se manca il segreto e `400` se mancano nome o date. Genera il link guest usando `APP_URL`, salva il pass in Supabase e non aziona Home Assistant.

## Verifica

Dopo il deploy controlla:

```bash
curl -sS https://DOMINIO_PUBBLICO/api/health
```

Non inserire token, password o service-role key nei commit, nel frontend o nei payload guest.
