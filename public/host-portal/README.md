# Aurora in Valtellina - Standalone Host Portal

Questo è il **sito web indipendente dedicato all'host** per la gestione autonoma degli accessi, prenotazioni Bed-and-Breakfast.it e relè/serratura **Sonoff (eWeLink)** di Aurora in Valtellina (Morbegno).

## Caratteristiche Principali

1. **Autonomo & Standalone**: Può essere aperto facendo doppio clic su `index.html` in qualsiasi browser, oppure caricato su qualsiasi web server / hosting.
2. **Integrazione Sonoff & eWeLink**:
   - Gestione nativa del relè apriporta Sonoff (Mini, Basic, SV, 4CH).
   - Supporto all'impulso di apertura "Inching" (1 secondo) per scatto elettroserratura portone.
   - Supporto a Webhook eWeLink Web / IFTTT / Home Assistant con pulsante di test apertura istantaneo.
   - Procedura guidata rapida per l'app ufficiale eWeLink (iOS / Android).
3. **Connessione REST API**: Si collega direttamente al backend di Aurora in Valtellina per:
   - Ricevere e visualizzare la lista dei pass generati (`GET /api/passes`)
   - Generare link univoci (`POST /api/webhook/booking`)
   - Revocare ed eliminare pass scaduti (`DELETE /api/passes/:id`)
4. **Simulatore & Webhook Bed-and-Breakfast.it**:
   - Fornisce l'endpoint per collegare Zapier, Make.com o notifica email
   - Compilazione automatica incollando il testo della notifica di prenotazione
5. **Condivisione Istantanea**:
   - Inviare il link univoco su WhatsApp con messaggio precompilato
   - Invio tramite SMS nativo

## Come configurare Sonoff & eWeLink

### Metodo 1: Tramite l'App Ufficiale eWeLink (Nessuna chiave API necessaria)
1. Apri l'app **eWeLink** sul tuo smartphone.
2. Tocca il dispositivo Sonoff della porta/cancello ➔ tocca `...` (Impostazioni).
3. Attiva la funzione **Inching (Abilitazione a impulsi)** e impostala su **1 secondo**. In questo modo ogni volta che il relè viene attivato, scatta per 1 secondo (come la pressione di un pulsante citofono) e si richiude da solo.
4. **Condivisione ospiti**: puoi toccare *Condividi* e inserire il numero o email dell'ospite con scadenza al momento del check-out.
5. L'ospite usa il link personale e il pulsante diretto per aprire il portone.

### Metodo 2: Tramite Webhook per Apertura Remota Automatica
1. Se hai l'account **eWeLink Web** (abbonamento Advanced) o un'integrazione con **IFTTT** / **Home Assistant**, copia il Webhook URL apriporta.
2. Incollalo nella scheda *Home Assistant* del Portale Host e clicca su *Salva Configurazione*.
3. Ora puoi testare l'apertura con il pulsante *Test Impulso Apertura (1 sec)* direttamente dal portale!

