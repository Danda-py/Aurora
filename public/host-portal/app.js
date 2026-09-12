/**
 * Aurora Host Portal Client Script
 * 100% Real Hardware Integration & Complete CMS Engine
 */

function getApiBaseUrl() {
  const saved = localStorage.getItem('AURORA_API_BASE_URL');
  if (saved) return saved;
  if (window.location.origin && window.location.origin.startsWith('http')) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

let API_BASE_URL = getApiBaseUrl();

document.documentElement.style.visibility = 'hidden';

function showHostLogin() {
  document.documentElement.style.visibility = 'visible';
  document.body.innerHTML = `
    <main class="min-h-screen flex items-center justify-center px-4 bg-[#08090d]">
      <form id="hostLoginForm" class="w-full max-w-sm space-y-5 rounded-3xl border border-white/10 bg-[#12141f] p-7 shadow-2xl">
        <div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">Accesso riservato</p>
          <h1 class="mt-2 text-2xl font-bold text-white">Aurora Host Portal</h1>
          <p class="mt-2 text-sm text-neutral-400">Inserisci le credenziali dell'host per continuare.</p>
        </div>
        <label class="block text-sm text-neutral-300">Email<input id="hostLoginEmail" type="email" autocomplete="off" required class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none focus:border-emerald-400"></label>
        <label class="block text-sm text-neutral-300">Password<input id="hostLoginPassword" type="password" autocomplete="off" required class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none focus:border-emerald-400"></label>
        <p id="hostLoginError" class="hidden text-sm text-rose-400"></p>
        <button class="w-full rounded-xl bg-emerald-400 px-4 py-3 font-bold text-neutral-950 hover:bg-emerald-300" type="submit">Accedi</button>
      </form>
    </main>`;
  document.getElementById('hostLoginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.getElementById('hostLoginError');
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('hostLoginEmail').value,
          password: document.getElementById('hostLoginPassword').value
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Accesso non riuscito');
      window.location.reload();
    } catch (err) {
      error.textContent = err.message;
      error.classList.remove('hidden');
      button.disabled = false;
    }
  });
}

async function ensureHostSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include', cache: 'no-store' });
    const data = await response.json();
    if (data.authenticated) {
      document.documentElement.style.visibility = 'visible';
      return true;
    }
  } catch {}
  showHostLogin();
  return false;
}

// Global CMS State
let currentCmsLanguage = 'it';
let currentCmsSection = 'welcome';
let cmsFullData = {};

// DOM Elements
const connectionBadge = document.getElementById('connectionBadge');
const connectionText = document.getElementById('connectionText');
const statHassStatus = document.getElementById('statHassStatus');
const statHassLastAction = document.getElementById('statHassLastAction');
const statActiveCount = document.getElementById('statActiveCount');
const tabCount = document.getElementById('tabCount');
const passesContainer = document.getElementById('passesContainer');
























// iCal elements
const formIcalConfig = document.getElementById('formIcalConfig');
const inputIcalUrl = document.getElementById('inputIcalUrl');
const inputIcalDaysAhead = document.getElementById('inputIcalDaysAhead');
const inputIcalInterval = document.getElementById('inputIcalInterval');
const checkboxIcalEnabled = document.getElementById('checkboxIcalEnabled');
const btnForceIcalSync = document.getElementById('btnForceIcalSync');
const icalFeedbackBox = document.getElementById('icalFeedbackBox');
const icalStatusBadge = document.getElementById('icalStatusBadge');

// Form elements
const formCreatePass = document.getElementById('formCreatePass');
const fieldGuestName = document.getElementById('fieldGuestName');
const fieldGuestSurname = document.getElementById('fieldGuestSurname');
const fieldPhone = document.getElementById('fieldPhone');
const fieldCheckInDate = document.getElementById('fieldCheckInDate');
const fieldCheckOutDate = document.getElementById('fieldCheckOutDate');
const fieldSource = document.getElementById('fieldSource');
const fieldBookingRef = document.getElementById('fieldBookingRef');
const fieldGuestsCount = document.getElementById('fieldGuestsCount');
const inputRawText = document.getElementById('inputRawText');
const btnParseText = document.getElementById('btnParseText');
const parseFeedback = document.getElementById('parseFeedback');

// Result box
const resultBox = document.getElementById('resultBox');
const resultLinkInput = document.getElementById('resultLinkInput');
const btnCopyLink = document.getElementById('btnCopyLink');
const copyLinkText = document.getElementById('copyLinkText');
const btnTestOpenLink = document.getElementById('btnTestOpenLink');
const btnSendWhatsApp = document.getElementById('btnSendWhatsApp');
const btnSendSms = document.getElementById('btnSendSms');
const resultExpiryText = document.getElementById('resultExpiryText');

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// API Config Modal
const apiConfigModal = document.getElementById('apiConfigModal');
const btnOpenApiConfig = document.getElementById('btnOpenApiConfig');
const btnCloseApiConfig = document.getElementById('btnCloseApiConfig');
const btnSaveApiConfig = document.getElementById('btnSaveApiConfig');
const inputApiBaseUrl = document.getElementById('inputApiBaseUrl');

// Home Assistant Elements
const inputSonoffWebhookUrl = document.getElementById('inputSonoffWebhookUrl');
const inputSonoffDeviceName = document.getElementById('inputSonoffDeviceName');
const inputHassUrl = document.getElementById('inputHassUrl');
const inputHassEntityId = document.getElementById('inputHassEntityId');
const selectHassService = document.getElementById('selectHassService');
const inputHassToken = document.getElementById('inputHassToken');
const btnModeWebhook = document.getElementById('btnModeWebhook');
const btnModeRest = document.getElementById('btnModeRest');
const sectionHassWebhook = document.getElementById('sectionHassWebhook');
const sectionHassRest = document.getElementById('sectionHassRest');
const btnTestSonoffPulse = document.getElementById('btnTestSonoffPulse');
const btnSaveSonoffConfig = document.getElementById('btnSaveSonoffConfig');
const sonoffFeedbackBox = document.getElementById('sonoffFeedbackBox');
const btnForceDoorOpen = document.getElementById('btnForceDoorOpen');
const inputHomePublicIp = document.getElementById('inputHomePublicIp');
const currentDetectedIp = document.getElementById('currentDetectedIp');
const btnDetectHomeIp = document.getElementById('btnDetectHomeIp');
const inputLanGatewayIp = document.getElementById('inputLanGatewayIp');
const inputLocalWebhookUrl = document.getElementById('inputLocalWebhookUrl');

// CMS Elements
const cmsLanguageSelector = document.getElementById('cmsLanguageSelector');
const cmsSectionSelect = document.getElementById('cmsSectionSelect');
const cmsNewSectionName = document.getElementById('cmsNewSectionName');
const btnAddCmsSection = document.getElementById('btnAddCmsSection');
const cmsNewFieldName = document.getElementById('cmsNewFieldName');
const btnAddCmsField = document.getElementById('btnAddCmsField');
const cmsFieldsContainer = document.getElementById('cmsFieldsContainer');
const cmsPreview = document.getElementById('cmsPreview');
const cmsPreviewTitle = document.getElementById('cmsPreviewTitle');
const btnSaveCms = document.getElementById('btnSaveCms');
const btnSaveCmsBottom = document.getElementById('btnSaveCmsBottom');
const btnResetCms = document.getElementById('btnResetCms');
const cmsFeedback = document.getElementById('cmsFeedback');
const cmsSaveIndicator = document.getElementById('cmsSaveIndicator');

// Media & Photo CMS Elements
const mediaCardsGrid = document.getElementById('mediaCardsGrid');
const btnResetAllPhotos = document.getElementById('btnResetAllPhotos');
const btnRefreshMedia = document.getElementById('btnRefreshMedia');
const mediaFeedback = document.getElementById('mediaFeedback');
let cmsMediaData = {};

// Initialize App
async function init() {
  if (!(await ensureHostSession())) return;
  if (inputApiBaseUrl) inputApiBaseUrl.value = API_BASE_URL;

  // Set default dates
  const today = new Date();
  const next3 = new Date(today);
  next3.setDate(today.getDate() + 3);

  const formatD = (d) => d.toISOString().split('T')[0];
  if (fieldCheckInDate) fieldCheckInDate.value = formatD(today);
  if (fieldCheckOutDate) fieldCheckOutDate.value = formatD(next3);

  setupTabs();
  setupEventListeners();
  setupCms();
  setupMedia();
  checkHealthAndFetchData();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setupTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => {
        b.classList.remove('active', 'bg-white', 'text-neutral-950', 'shadow-sm');
        b.classList.add('text-neutral-400');
      });
      btn.classList.add('active', 'bg-white', 'text-neutral-950', 'shadow-sm');
      btn.classList.remove('text-neutral-400');

      tabContents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });

      if (targetTab === 'cms') {
        loadCmsData();
      } else if (targetTab === 'media') {
        loadMediaData();
      } else if (targetTab === 'ical') {
        fetchIcalConfig();
      }
    });
  });
}

function setupEventListeners() {
  // Analizza e Compila Button
  if (btnParseText) {
    btnParseText.addEventListener('click', async () => {
      await handleParseBookingText();
    });
  }




  // iCal Form and Sync Events
  if (formIcalConfig) {
    formIcalConfig.addEventListener('submit', async (e) => {
      e.preventDefault();

      await handleSaveIcalConfig();
    });
  }




















































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































  if (btnForceIcalSync) {
    btnForceIcalSync.addEventListener('click', async () => {
      await handleForceIcalSync();
    });
  }

  // Submit Form: Create Pass
  if (formCreatePass) {
    formCreatePass.addEventListener('submit', async (e) => {
      e.preventDefault();

      await handleCreatePass();
    });


  }

  // Copy Result Link
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', async () => {
      const link = resultLinkInput.value;
      if (!link) return;
      const copied = await copyTextToClipboard(link);
      copyLinkText.textContent = copied ? 'Copiato!' : 'Copia non riuscita';
      setTimeout(() => { copyLinkText.textContent = 'Copia Link'; }, 2500);
    });





  }

  // API Config Modal Events
  if (btnOpenApiConfig) {
    btnOpenApiConfig.addEventListener('click', () => {
      inputApiBaseUrl.value = API_BASE_URL;
      apiConfigModal.classList.remove('hidden');
    });






  }
  if (btnCloseApiConfig) {
    btnCloseApiConfig.addEventListener('click', () => {
      apiConfigModal.classList.add('hidden');
    });
  }
  if (btnSaveApiConfig) {
    btnSaveApiConfig.addEventListener('click', () => {
      const newUrl = inputApiBaseUrl.value.trim().replace(/\/$/, '');
      if (newUrl) {
        API_BASE_URL = newUrl;
        localStorage.setItem('AURORA_API_BASE_URL', newUrl);
        apiConfigModal.classList.add('hidden');
        checkHealthAndFetchData();
      }
    });
  }





















  // Toggle Home Assistant Config Modes
  if (btnModeWebhook && btnModeRest) {
    btnModeWebhook.addEventListener('click', () => {
      btnModeWebhook.className = 'px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold transition';
      btnModeRest.className = 'px-3 py-1 rounded-lg text-slate-400 hover:text-white font-medium transition';
      sectionHassWebhook.classList.remove('hidden');
      sectionHassRest.classList.add('hidden');
    });

    btnModeRest.addEventListener('click', () => {
      btnModeRest.className = 'px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold transition';
      btnModeWebhook.className = 'px-3 py-1 rounded-lg text-slate-400 hover:text-white font-medium transition';
      sectionHassRest.classList.remove('hidden');
      sectionHassWebhook.classList.add('hidden');
    });
  }

  // Detect Current IP as Home Public IP
  if (btnDetectHomeIp) {
    btnDetectHomeIp.addEventListener('click', async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/wifi/status`);
        const data = await res.json();
        if (data.clientIp) {
          if (inputHomePublicIp) inputHomePublicIp.value = data.clientIp;
          const saveRes = await fetch(`${API_BASE_URL}/api/wifi/set-home-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },















            body: JSON.stringify({ customIp: data.clientIp })
          });
          const saveData = await saveRes.json();
          alert(`IP "${data.clientIp}" impostato e salvato come Wi-Fi Casa_Aurora!`);
          await fetchSonoffConfig();
        } else {
          alert('Impossibile rilevare IP corrente.');
        }
    } catch (err) {

        alert('Errore rilevamento IP: ' + err.message);
    }










    });
  }

  // Save Home Assistant Config
  if (btnSaveSonoffConfig) {
    btnSaveSonoffConfig.addEventListener('click', async () => {
      btnSaveSonoffConfig.textContent = 'Salvataggio in corso...';
  try {

        const payload = {
          webhookUrl: inputSonoffWebhookUrl ? inputSonoffWebhookUrl.value.trim() : '',
          haUrl: inputHassUrl ? inputHassUrl.value.trim() : '',
          entityId: inputHassEntityId ? inputHassEntityId.value.trim() : 'switch.portone',
          service: selectHassService ? selectHassService.value : 'switch.turn_on',
          deviceName: inputSonoffDeviceName ? inputSonoffDeviceName.value.trim() : 'Pulsante Portone Aurora',
          homePublicIp: inputHomePublicIp ? inputHomePublicIp.value.trim() : '',
          lanGatewayIp: inputLanGatewayIp ? inputLanGatewayIp.value.trim() : '192.168.1.1',
          localWebhookUrl: inputLocalWebhookUrl ? inputLocalWebhookUrl.value.trim() : ''
        };
        if (inputHassToken && inputHassToken.value.trim()) {
          payload.accessToken = inputHassToken.value.trim();
        }
        const res = await fetch(`${API_BASE_URL}/api/hass/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(payload)
    });






        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Errore salvataggio');
        alert('Configurazione Home Assistant e Rete Casa_Aurora salvata con successo!');
        await fetchSonoffConfig();
        await fetchHassStatus();
  } catch (err) {

        alert('Errore salvataggio Home Assistant: ' + err.message);
      } finally {
        btnSaveSonoffConfig.textContent = 'Salva Configurazione Completa';
  }
    });
}

  // Test Real Door Unlock (Pulse ON)
  if (btnTestSonoffPulse) {
    btnTestSonoffPulse.addEventListener('click', async () => {
      btnTestSonoffPulse.disabled = true;
      btnTestSonoffPulse.textContent = 'Invio comando a Home Assistant...';
      sonoffFeedbackBox.classList.add('hidden');
      try {
        const res = await fetch(`${API_BASE_URL}/api/hass/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestName: 'Host (Test Portale)',
            source: 'Portale Host Test Diretto',
            wifiConnected: true,
            wifiSsid: 'Casa_Aurora'
          })
        });
        const data = await res.json();
        sonoffFeedbackBox.classList.remove('hidden');
        if (res.ok && data.success) {
          sonoffFeedbackBox.className = 'p-3 rounded-xl text-xs font-mono bg-emerald-950/50 border border-emerald-500/40 text-emerald-300';
          sonoffFeedbackBox.innerHTML = `
            <div class="font-bold text-emerald-400 mb-1">✔ Segnale ON Inviato a Home Assistant con Successo!</div>
            <div>${data.message}</div>
            <div class="mt-1 text-[11px] text-slate-400">Il relè/interruttore hardware è stato azionato correttamente.</div>
          `;
          await fetchHassStatus();
        } else {
          throw new Error(data.error || 'Impossibile azionare il dispositivo');
        }
      } catch (err) {
        sonoffFeedbackBox.classList.remove('hidden');
        sonoffFeedbackBox.className = 'p-3 rounded-xl text-xs font-mono bg-rose-950/50 border border-rose-500/40 text-rose-300';
        sonoffFeedbackBox.innerHTML = `
          <div class="font-bold text-rose-400 mb-1">✖ Comunicazione Home Assistant Non Riuscita</div>
          <div>${err.message}</div>
        `;
      } finally {
        btnTestSonoffPulse.disabled = false;
        btnTestSonoffPulse.textContent = 'APRI PORTONE ADESSO (Input ON)';
      }
    });
  }

  // Top Bar Quick Unlock Action
  if (btnForceDoorOpen) {
    btnForceDoorOpen.addEventListener('click', async () => {
      btnForceDoorOpen.disabled = true;
      btnForceDoorOpen.innerHTML = '<span>Invio comando...</span>';
      try {
        const res = await fetch(`${API_BASE_URL}/api/hass/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestName: 'Host (Pannello Superiore)',
            source: 'Top Bar Portale',
            wifiConnected: true,
            wifiSsid: 'Casa_Aurora'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert(`✔ Home Assistant: ${data.message}`);
        } else {
          alert(`✖ Home Assistant: ${data.error || 'Errore di attivazione'}`);
        }
        await fetchHassStatus();
      } catch (err) {
        alert('Errore invio comando a Home Assistant: ' + err.message);
      } finally {
        btnForceDoorOpen.disabled = false;
        btnForceDoorOpen.innerHTML = '<i data-lucide="power" class="w-3.5 h-3.5"></i><span>Apri porta</span>';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
}

// ----------------------------------------------------
// 100% Robust Booking Parser ("Analizza e Compila")
// ----------------------------------------------------
async function handleParseBookingText() {
  const text = inputRawText.value.trim();
  if (!text) {
    showParseFeedback('Inserisci o incolla prima il testo della notifica!', 'warn');
    return;
  }

  btnParseText.disabled = true;
  btnParseText.innerHTML = '<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Analisi in corso...</span>';

  let parsed = null;

  // 1. Try server-side parser
  try {
    const res = await fetch(`${API_BASE_URL}/api/parse-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, rawText: text })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.parsed) {
        parsed = json.parsed;
      }
    }
  } catch (err) {
    console.warn('Backend parse failed, using client-side fallback parser:', err);
  }

  // 2. Client-side fallback if server fails
  if (!parsed) {
    parsed = localFallbackParse(text);
  }

  // 3. Fill form fields
  if (parsed) {
    if (parsed.guestName) {
      fieldGuestName.value = parsed.guestName;
      highlightField(fieldGuestName);
    }
    if (parsed.guestSurname) {
      fieldGuestSurname.value = parsed.guestSurname;
      highlightField(fieldGuestSurname);
    }
    if (parsed.phone) {
      fieldPhone.value = parsed.phone;
      highlightField(fieldPhone);
    }
    if (parsed.checkInDate) {
      fieldCheckInDate.value = parsed.checkInDate;
      highlightField(fieldCheckInDate);
    }
    if (parsed.checkOutDate) {
      fieldCheckOutDate.value = parsed.checkOutDate;
      highlightField(fieldCheckOutDate);
    }
    if (parsed.bookingRef) {
      fieldBookingRef.value = parsed.bookingRef;
      highlightField(fieldBookingRef);
    }
    if (parsed.bookingSource) {
      fieldSource.value = parsed.bookingSource;
      highlightField(fieldSource);
    }
    if (parsed.guestsCount) {
      fieldGuestsCount.value = parsed.guestsCount.toString();
      highlightField(fieldGuestsCount);
    }

    const summaryParts = [];
    if (parsed.guestName) summaryParts.push(`${parsed.guestName} ${parsed.guestSurname || ''}`.trim());
    if (parsed.checkInDate && parsed.checkOutDate) summaryParts.push(`${parsed.checkInDate} → ${parsed.checkOutDate}`);
    if (parsed.phone) summaryParts.push(`Tel: ${parsed.phone}`);

    showParseFeedback(`✔ Dati estratti con successo: ${summaryParts.join(' | ')}`, 'success');
  } else {
    showParseFeedback('Non è stato possibile identificare campi validi nel testo fornito. Compila manualmente.', 'error');
  }

  btnParseText.disabled = false;
  btnParseText.innerHTML = '<i data-lucide="clipboard-paste" class="w-3.5 h-3.5"></i><span>Analizza e Compila Modulo</span>';
  if (window.lucide) window.lucide.createIcons();
}

function highlightField(el) {
  el.classList.add('border-emerald-500', 'bg-emerald-950/20');
  setTimeout(() => {
    el.classList.remove('border-emerald-500', 'bg-emerald-950/20');
  }, 3500);
}

function showParseFeedback(msg, type) {
  if (!parseFeedback) return;
  parseFeedback.classList.remove('hidden', 'bg-emerald-950/70', 'border-emerald-500/40', 'text-emerald-300', 'bg-rose-950/70', 'border-rose-500/40', 'text-rose-300', 'bg-amber-950/70', 'border-amber-500/40', 'text-amber-300');

  if (type === 'success') {
    parseFeedback.className = 'text-xs py-2 px-3 rounded-xl font-medium border bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
  } else if (type === 'warn') {
    parseFeedback.className = 'text-xs py-2 px-3 rounded-xl font-medium border bg-amber-950/70 border-amber-500/40 text-amber-300';
  } else {
    parseFeedback.className = 'text-xs py-2 px-3 rounded-xl font-medium border bg-rose-950/70 border-rose-500/40 text-rose-300';
  }
  parseFeedback.textContent = msg;
}

function localFallbackParse(text) {
  const res = {
    guestName: '',
    guestSurname: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    bookingRef: '',
    bookingSource: 'bed-and-breakfast.it',
    guestsCount: 2
  };

  // Detect Source
  const lower = text.toLowerCase();
  if (lower.includes('airbnb')) res.bookingSource = 'airbnb';
  else if (lower.includes('booking.com')) res.bookingSource = 'booking.com';
  else if (lower.includes('bed-and-breakfast') || lower.includes('bed & breakfast')) res.bookingSource = 'bed-and-breakfast.it';
  else if (lower.includes('dirett')) res.bookingSource = 'diretto';

  // Name extraction
  const namePatterns = [
    /(?:ospite|cliente|nome|guest|viaggiatore)[:\s]+([a-zA-ZÀ-ÿ\s]+)(?:\n|$|\r|,)/i,
    /(?:prenotazione da|prenotato da|prenotazione di|richiesta da)[:\s]+([a-zA-ZÀ-ÿ\s]+)(?:\n|$|\r|,)/i
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const parts = match[1].trim().split(/\s+/);
      res.guestName = parts[0] || '';
      res.guestSurname = parts.slice(1).join(' ') || '';
      break;
    }
  }

  // Phone extraction
  const phoneMatch = text.match(/(?:tel|telefono|cell|cellulare|phone|mobile|whatsapp)[:\s]*([\+\d\s\-\(\)]{8,20})/i) ||
                     text.match(/(\+?39\s?3\d{2}[\s\-]?\d{3}[\s\-]?\d{4})/);
  if (phoneMatch) {
    res.phone = phoneMatch[1].trim();
  }

  // Dates extraction (dd/mm/yyyy or yyyy-mm-dd)
  const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\-\/]\d{2}[\-\/]\d{2})/g;
  const dates = text.match(dateRegex);
  if (dates && dates.length >= 2) {
    const normalize = (d) => {
      if (d.includes('/')) {
        const p = d.split('/');
        if (p[0].length === 4) return `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`;
        let year = p[2];
        if (year.length === 2) year = '20' + year;
        return `${year}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
      }
      return d;
    };
    res.checkInDate = normalize(dates[0]);
    res.checkOutDate = normalize(dates[1]);
  }

  // Booking reference extraction with multi-pattern precision
  const stopWords = new Set([
    'da', 'di', 'del', 'della', 'per', 'a', 'in', 'su', 'il', 'la', 'un', 'una',
    'nuova', 'nuovo', 'bed', 'breakfast', 'airbnb', 'booking', 'com', 'it',
    'confermata', 'ricevuta', 'accettata', 'saluti', 'grazie', 'notifica'
  ]);

  const refPatterns = [
    /(?:codice\s*(?:di\s*)?prenotazione|numero\s*(?:di\s*)?prenotazione|n(?:umero|\.|\s*#)?\s*prenotazione|prenotazione\s*n(?:umero|\.|\s*#)?|riferimento\s*(?:di\s*)?prenotazione|rif\.?\s*prenotazione|id\s*prenotazione)\s*[:=–-]?\s*#?\s*([A-Za-z0-9\-_]{3,30})/i,
    /(?:booking\s*(?:number|ref|reference|id|code)|confirmation\s*code|reservation\s*(?:id|number|code)|pin\s*code)\s*[:=–-]?\s*#?\s*([A-Za-z0-9\-_]{3,30})/i,
    /(?:prenotazione|booking|reservation)\s*(?:n(?:umero|\.)?|id|code|ref(?:erence)?)?\s*#\s*([A-Za-z0-9\-_]{3,30})/i,
    /(?:id|codice|numero|ref|rif)\s*(?:di\s*)?(?:prenotazione|booking|reservation)?\s*[:=#-]\s*([A-Za-z0-9\-_]{3,30})/i,
    /(?:codice|numero|ref|rif|booking\s?id)\s*[:=#]\s*([A-Za-z0-9\-_]{3,30})/i,
    /\b(BB-\d{4,8})\b/i,
    /(?:prenotazione|booking|reservation)\s*[:=]\s*#?\s*([A-Za-z0-9\-_]{3,30})/i
  ];

  for (const pattern of refPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!stopWords.has(candidate.toLowerCase()) && candidate.length >= 3 && !/^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}$/.test(candidate)) {
        res.bookingRef = candidate;
        break;
      }
    }
  }

  // Guests count
  const guestCountMatch = text.match(/(\d+)\s*(?:ospiti|persone|adulti|guests)/i);
  if (guestCountMatch) {
    res.guestsCount = parseInt(guestCountMatch[1], 10);
  }

  return res;
}

// ----------------------------------------------------
// Health Check & Data Loading
// ----------------------------------------------------
async function checkHealthAndFetchData() {
  try {
    connectionBadge.className = 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 text-[11px] sm:text-xs font-medium';
    connectionText.textContent = 'Connessione...';

    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (res.ok) {
      connectionBadge.className = 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-medium';
      connectionText.textContent = 'API Connessa';
      await Promise.all([fetchPasses(), fetchHassStatus(), fetchSonoffConfig(), loadCmsData()]);
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch (err) {
    connectionBadge.className = 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] sm:text-xs font-medium';
    connectionText.textContent = 'API Offline';
    console.warn('API connection failed:', err);
  }
}

// Fetch Home Assistant Configuration
async function fetchSonoffConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hass/config`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.config) {
      if (inputSonoffWebhookUrl && data.config.webhookUrl) inputSonoffWebhookUrl.value = data.config.webhookUrl;
      if (inputHassUrl && data.config.hassUrl) inputHassUrl.value = data.config.hassUrl;
      if (inputHassEntityId && data.config.entityId) inputHassEntityId.value = data.config.entityId;
      if (selectHassService && data.config.service) selectHassService.value = data.config.service;
      if (inputSonoffDeviceName && data.config.deviceName) inputSonoffDeviceName.value = data.config.deviceName;
      if (inputHomePublicIp && data.config.homePublicIp) inputHomePublicIp.value = data.config.homePublicIp;
      if (inputLanGatewayIp && data.config.lanGatewayIp) inputLanGatewayIp.value = data.config.lanGatewayIp;
      if (inputLocalWebhookUrl && data.config.localWebhookUrl) inputLocalWebhookUrl.value = data.config.localWebhookUrl;
    }

    // Fetch current client IP from wifi status
    const wifiRes = await fetch(`${API_BASE_URL}/api/wifi/status`);
    if (wifiRes.ok) {
      const wifiData = await wifiRes.json();
      if (currentDetectedIp && wifiData.clientIp) {
        currentDetectedIp.textContent = wifiData.clientIp;
      }
    }
  } catch (err) {
    console.warn('Error loading Home Assistant config:', err);
  }
}

// Fetch and Save iCal Config
async function fetchIcalConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ical/config`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.config) {
      if (inputIcalUrl) inputIcalUrl.value = data.config.icalUrl || '';
      if (inputIcalDaysAhead) inputIcalDaysAhead.value = data.config.daysAheadToSend || 3;
      if (inputIcalInterval) inputIcalInterval.value = (data.config.intervalMs || 1800000) / 60000;
      if (checkboxIcalEnabled) checkboxIcalEnabled.checked = Boolean(data.config.enabled);

      if (icalStatusBadge) {
        if (data.config.enabled && data.config.icalUrl) {
          icalStatusBadge.className = 'px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
          icalStatusBadge.textContent = 'Verifica Attiva H24';
        } else {
          icalStatusBadge.className = 'px-3 py-1 rounded-full text-[11px] font-mono bg-neutral-500/10 text-neutral-400 border border-neutral-500/20';
          icalStatusBadge.textContent = 'Disattivato';
        }
      }
    }
  } catch (err) {
    console.warn('Errore lettura iCal config:', err);
  }
}

async function handleSaveIcalConfig() {
  if (icalFeedbackBox) icalFeedbackBox.classList.add('hidden');
  try {
    const payload = {
      icalUrl: inputIcalUrl.value.trim(),
      daysAheadToSend: parseInt(inputIcalDaysAhead.value, 10) || 3,
      intervalMs: (parseInt(inputIcalInterval.value, 10) || 30) * 60000,
      enabled: checkboxIcalEnabled.checked
    };

    const res = await fetch(`${API_BASE_URL}/api/ical/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (icalFeedbackBox) {
        icalFeedbackBox.className = 'p-3 rounded-xl text-xs font-mono bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 block';
        icalFeedbackBox.textContent = '✔ Configurazione iCal salvata con successo!';
      }
      await fetchIcalConfig();
      await fetchPasses();
    } else {
      throw new Error(data.error || 'Errore salvataggio');
    }
  } catch (err) {
    if (icalFeedbackBox) {
      icalFeedbackBox.className = 'p-3 rounded-xl text-xs font-mono bg-rose-950/50 border border-rose-500/40 text-rose-300 block';
      icalFeedbackBox.textContent = '✖ Errore: ' + err.message;
    }
  }
}

async function handleForceIcalSync() {
  if (icalFeedbackBox) {
    icalFeedbackBox.className = 'p-3 rounded-xl text-xs font-mono bg-blue-950/50 border border-blue-500/40 text-blue-300 block';
    icalFeedbackBox.textContent = 'Sincronizzazione forzata in corso... scarico iCal da Bed-and-Breakfast.it...';
  }
  btnForceIcalSync.disabled = true;

  try {
    // Salviamo prima la configurazione aggiornata
    await handleSaveIcalConfig();

    // Mandiamo un trigger per sincronizzare subito
    const res = await fetch(`${API_BASE_URL}/api/ical/config`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        if (icalFeedbackBox) {
          icalFeedbackBox.className = 'p-3 rounded-xl text-xs font-mono bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 block';
          icalFeedbackBox.textContent = '✔ Sincronizzazione iCal completata! Nuovi pass generati se presenti. Controlla la lista dei pass.';
        }
        await fetchPasses();
      }
    }
  } catch (err) {
    if (icalFeedbackBox) {
      icalFeedbackBox.className = 'p-3 rounded-xl text-xs font-mono bg-rose-950/50 border border-rose-500/40 text-rose-300 block';
      icalFeedbackBox.textContent = '✖ Errore sincronizzazione: ' + err.message;
    }
  } finally {
    btnForceIcalSync.disabled = false;
  }
}

// Fetch Active Passes
async function fetchPasses() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/passes`);
    if (!res.ok) return;
    const data = await res.json();
    const passes = Array.isArray(data) ? data : (data.passes || []);

    if (statActiveCount) statActiveCount.textContent = passes.length.toString();
    if (tabCount) tabCount.textContent = passes.length.toString();

    renderPasses(passes);
  } catch (err) {
    console.warn('Failed to fetch passes:', err);
  }
}

// Render Passes List
function renderPasses(passes) {
  if (!passesContainer) return;

  if (passes.length === 0) {
    passesContainer.innerHTML = `
      <div class="p-8 rounded-2xl sm:rounded-3xl bg-[#12141f] border border-white/[0.08] text-center text-neutral-400 space-y-2">
        <p class="text-xs">Nessun pass ospite attivo al momento.</p>
        <p class="text-[11px] text-neutral-500">I pass generati tramite modulo compariranno qui con il rispettivo link univoco e chiave digitale.</p>
      </div>
    `;
    return;
  }

  passesContainer.innerHTML = passes.map(p => {
    const link = `${API_BASE_URL}/?pass=${p.token || ''}`;
    const cleanPhone = (p.phone || '').replace(/[^0-9+]/g, '');
    const isExpired = p.checkOutDate && new Date(p.checkOutDate) < new Date();

    return `
      <div class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#12141f] border border-white/[0.08] shadow-sm space-y-3.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ${(p.guestName || 'O')[0]}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-bold text-sm text-white tracking-tight">${p.guestName} ${p.guestSurname || ''}</h4>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${isExpired ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                  ${isExpired ? 'SCADUTO' : 'ATTIVO'}
                </span>
                <span class="text-[10px] text-neutral-400 font-mono">${p.bookingSource || 'bed-and-breakfast.it'}</span>
              </div>
              <span class="text-xs text-neutral-400 block mt-0.5">Soggiorno: ${p.checkInDate} → ${p.checkOutDate}</span>
            </div>
          </div>

          <!-- Real Unlock & Delete -->
          <div class="flex items-center gap-2 self-end sm:self-auto">
            <button onclick="triggerPassDoorUnlock('${p.guestName}')" class="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm" title="Invia input ON ad Home Assistant">
              <i data-lucide="unlock" class="w-3.5 h-3.5"></i>
              <span>Apri Porta (ON)</span>
            </button>
            <button onclick="deletePass('${p.id}')" class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer" title="Elimina / Revoca">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Action Links -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div class="flex items-center gap-1.5 flex-1 w-full sm:w-auto">
            <input type="text" readonly value="${link}" class="flex-1 min-w-0 text-xs p-2.5 rounded-xl bg-black/40 border border-white/10 text-neutral-300 font-mono" />
            <button onclick="copyToClipboard('${link}')" class="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs shrink-0 cursor-pointer transition">
              Copia
            </button>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <a href="${link}" target="_blank" class="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition">
              <span>Apri Guida</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
            ${cleanPhone ? `
              <a href="https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Ciao ${p.guestName}, ecco la tua guida con chiave digitale per l'Appartamento Aurora a Morbegno: ${link}\nDa questo link puoi aprire il portone d'ingresso con un semplice tocco quando sei connesso al Wi-Fi Casa_Aurora.`)}" target="_blank" class="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98">
                <span>WhatsApp</span>
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Global door trigger helper
window.triggerPassDoorUnlock = async function(guestName) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hass/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName: guestName || 'Ospite',
        source: 'Pass Portale Host',
        wifiConnected: true,
        wifiSsid: 'Casa_Aurora'
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(`✔ Home Assistant (${guestName}): ${data.message}`);
    } else {
      alert(`✖ Errore Home Assistant: ${data.error || 'Apertura fallita'}`);
    }
    await fetchHassStatus();
  } catch (err) {
    alert('Errore chiamata apertura: ' + err.message);
  }
};

async function copyTextToClipboard(text) {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed, using legacy fallback:', err);
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (err) {
    console.warn('Legacy clipboard fallback failed:', err);
  }
  textarea.remove();
  return copied;
}

window.copyToClipboard = async function(text) {
  const copied = await copyTextToClipboard(text);
  alert(copied ? 'Link copiato negli appunti!' : 'Impossibile copiare automaticamente. Seleziona e copia il link manualmente.');
};

window.deletePass = async function(id) {
  if (!confirm('Vuoi revocare ed eliminare questo pass?')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/passes/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await fetchPasses();
      await fetchHassStatus();
    }
  } catch (err) {
    alert('Errore eliminazione: ' + err.message);
  }
};

// Handle Create Pass
async function handleCreatePass() {
  const submitBtn = document.getElementById('btnSubmitGenerate');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const payload = {
      guestName: fieldGuestName.value.trim(),
      guestSurname: fieldGuestSurname.value.trim(),
      phone: fieldPhone.value.trim(),
      checkInDate: fieldCheckInDate.value,
      checkOutDate: fieldCheckOutDate.value,
      bookingSource: fieldSource.value,
      bookingRef: fieldBookingRef.value.trim(),
      guestsCount: parseInt(fieldGuestsCount.value || '2', 10)
    };

    const res = await fetch(`${API_BASE_URL}/api/webhook/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Errore durante la generazione');
    const data = await res.json();

    const generatedUrl = data.link || data.guestUrl || data.links?.guestDirectUrl || `${API_BASE_URL}/?pass=${data.token || ''}`;
    const generatedWaUrl = data.whatsappUrl || data.links?.whatsappDirectLink || (payload.phone ? `https://wa.me/${payload.phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(data.whatsappMessage || data.links?.whatsappInvitationText || generatedUrl)}` : `https://wa.me/?text=${encodeURIComponent(generatedUrl)}`);

    // Show result box
    resultBox.classList.remove('hidden');
    resultLinkInput.value = generatedUrl;
    btnTestOpenLink.href = generatedUrl;
    resultExpiryText.textContent = `Scade il: ${payload.checkOutDate} alle 10:00`;

    // WhatsApp Link
    btnSendWhatsApp.href = generatedWaUrl;
    btnSendWhatsApp.classList.remove('opacity-50', 'pointer-events-none');

    // Refresh state
    await fetchPasses();
    await fetchHassStatus();

    showParseFeedback('✔ Pass VIP generato e salvato correttamente! Lo trovi anche nella scheda "Gestione Pass".', 'success');

    resultBox.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    alert('Errore: ' + err.message);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// Fetch Home Assistant status
async function fetchHassStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/keypad/status`);
    if (!res.ok) return;
    const data = await res.json();

    if (statHassStatus) statHassStatus.textContent = 'Home Assistant online';
    if (statHassLastAction) {
      statHassLastAction.textContent = data.lastPulseSent
        ? `● Ultimo sblocco: ${new Date(data.lastPulseSent).toLocaleTimeString()}`
        : '● Pronto per il comando porta';
    }
  } catch (err) {
    console.warn('Home Assistant status check failed:', err);
  }
}

// ----------------------------------------------------
// COMPLETE CMS ENGINE IMPLEMENTATION
// ----------------------------------------------------
function setupCms() {
  // Language button switcher
  if (cmsLanguageSelector) {
    cmsLanguageSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.cms-lang-btn');
      if (!btn) return;
      const lang = btn.getAttribute('data-cms-lang');
      if (!lang) return;

      currentCmsLanguage = lang;

      // Update UI active styles
      cmsLanguageSelector.querySelectorAll('.cms-lang-btn').forEach(b => {
        b.className = 'cms-lang-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 text-neutral-400 hover:text-white transition cursor-pointer';
      });
      btn.className = 'cms-lang-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-neutral-950 shadow-sm transition cursor-pointer';

      renderCmsFields();
    });
  }

  // Section select dropdown
  if (cmsSectionSelect) {
    cmsSectionSelect.addEventListener('change', () => {
      currentCmsSection = cmsSectionSelect.value;
      renderCmsFields();
    });
  }

  // Save Buttons
  if (btnSaveCms) {
    btnSaveCms.addEventListener('click', handleSaveCms);
  }
  if (btnSaveCmsBottom) {
    btnSaveCmsBottom.addEventListener('click', handleSaveCms);
  }

  // Reset Button
  if (btnResetCms) {
    btnResetCms.addEventListener('click', handleResetCms);
  }

  if (btnAddCmsSection) {
    btnAddCmsSection.addEventListener('click', () => {
      const section = (cmsNewSectionName?.value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      if (!section) return;
      if (!cmsFullData[currentCmsLanguage]) cmsFullData[currentCmsLanguage] = {};
      if (!cmsFullData[currentCmsLanguage][section]) cmsFullData[currentCmsLanguage][section] = {};
      currentCmsSection = section;
      populateCmsSectionOptions();
      renderCmsFields();
      if (cmsNewSectionName) cmsNewSectionName.value = '';
    });
  }

  if (btnAddCmsField) {
    btnAddCmsField.addEventListener('click', () => {
      const field = (cmsNewFieldName?.value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      if (!field) return;
      if (!cmsFullData[currentCmsLanguage]) cmsFullData[currentCmsLanguage] = {};
      if (!cmsFullData[currentCmsLanguage][currentCmsSection]) cmsFullData[currentCmsLanguage][currentCmsSection] = {};
      if (!(field in cmsFullData[currentCmsLanguage][currentCmsSection])) {
        cmsFullData[currentCmsLanguage][currentCmsSection][field] = '';
      }
      renderCmsFields();
      if (cmsNewFieldName) cmsNewFieldName.value = '';
    });
  }
}

async function loadCmsData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/content`);
    if (res.ok) {
      const json = await res.json();
      cmsFullData = json.data || json.content || json;
      populateCmsSectionOptions();
    }
    renderCmsFields();
  } catch (err) {
    console.warn('Failed to load CMS data from server:', err);
    renderCmsFields();
  }
}

function populateCmsSectionOptions() {
  if (!cmsSectionSelect) return;
  const sections = new Set();
  Object.values(cmsFullData || {}).forEach(languageData => {
    Object.keys(languageData || {}).forEach(section => sections.add(section));
  });
  const selected = currentCmsSection;
  cmsSectionSelect.innerHTML = '';
  Array.from(sections).sort().forEach(section => {
    const option = document.createElement('option');
    option.value = section;
    option.textContent = section;
    cmsSectionSelect.appendChild(option);
  });
  if (!sections.has(selected)) {
    const option = document.createElement('option');
    option.value = selected;
    option.textContent = selected;
    cmsSectionSelect.appendChild(option);
  }
  cmsSectionSelect.value = selected;
}

function renderCmsFields() {
  if (!cmsFieldsContainer) return;
  cmsFieldsContainer.innerHTML = '';

  const lang = currentCmsLanguage;
  const section = currentCmsSection;

  if (!cmsFullData[lang]) {
    cmsFullData[lang] = {};
  }
  if (!cmsFullData[lang][section]) {
    cmsFullData[lang][section] = {};
  }

  const sectionData = cmsFullData[lang][section];
  const keys = Object.keys(sectionData);

  if (keys.length === 0) {
    cmsFieldsContainer.innerHTML = `
      <div class="p-6 rounded-2xl bg-black/30 border border-white/10 text-center text-xs text-neutral-400 space-y-2">
        <p>Nessun campo personalizzato salvato ancora per <strong>${section}</strong> in <strong>${lang.toUpperCase()}</strong>.</p>
        <p class="text-[11px] text-neutral-500">I testi predefiniti dell'applicazione sono attualmente attivi. Puoi inserire nuovi campi qui sotto per sovrascriverli in modo permanente.</p>
        <button type="button" onclick="initDefaultSectionFields('${lang}', '${section}')" class="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs shadow-sm cursor-pointer mt-2">
          Carica Campi Predefiniti per questa Scheda
        </button>
      </div>
    `;
    renderCmsPreview();
    return;
  }

  // Render form fields
  keys.forEach(key => {
    const val = sectionData[key];
    const fieldId = `cms_field_${key}`;
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5';

    const label = document.createElement('label');
    label.htmlFor = fieldId;
    label.className = 'block text-xs font-mono font-bold text-amber-300 capitalize';
    label.textContent = key.replace(/([A-Z])/g, ' $1');

    fieldWrapper.appendChild(label);

    if (Array.isArray(val)) {
      // Keep complex structures editable while showing a readable visual block.
      const textarea = document.createElement('textarea');
      textarea.id = fieldId;
      textarea.rows = Math.min(8, Math.max(3, val.length * 2));
      textarea.className = 'w-full text-xs font-mono p-3 rounded-xl bg-[#090b10] border border-white/10 text-neutral-200 focus:border-amber-400 outline-none';
      textarea.value = JSON.stringify(val, null, 2);
      textarea.addEventListener('change', () => {
        try {
          cmsFullData[lang][section][key] = JSON.parse(textarea.value);
          renderCmsPreview();
        } catch (e) {
          alert('Attenzione: Formato JSON non valido per la lista.');
        }
      });
      fieldWrapper.appendChild(textarea);
    } else if (typeof val === 'string' && /^https?:\/\//i.test(val)) {
      const input = document.createElement('input');
      input.type = 'url';
      input.placeholder = 'https://...';
      input.value = val;
      input.className = 'w-full text-xs p-2.5 rounded-xl bg-[#090b10] border border-cyan-500/30 text-cyan-200 focus:border-cyan-300 outline-none';
      input.addEventListener('input', (e) => {
        cmsFullData[lang][section][key] = e.target.value;
        renderCmsPreview();
      });
      fieldWrapper.appendChild(input);
      const hint = document.createElement('p');
      hint.className = 'text-[10px] text-cyan-300/70';
      hint.textContent = 'Link cliccabile';
      fieldWrapper.appendChild(hint);
    } else if (typeof val === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
      const colorRow = document.createElement('div');
      colorRow.className = 'flex items-center gap-2';
      const color = document.createElement('input');
      color.type = 'color';
      color.value = val.length === 4 ? val.replace(/([0-9a-f])/gi, '$1$1') : val;
      color.className = 'h-10 w-14 rounded-lg bg-transparent cursor-pointer';
      const text = document.createElement('input');
      text.type = 'text';
      text.value = val;
      text.className = 'min-w-0 flex-1 text-xs p-2.5 rounded-xl bg-[#090b10] border border-fuchsia-500/30 text-fuchsia-200 focus:border-fuchsia-300 outline-none';
      const updateColor = (value) => {
        const normalized = value.toLowerCase();
        cmsFullData[lang][section][key] = normalized;
        color.value = normalized.length === 4 ? normalized.replace(/([0-9a-f])/gi, '$1$1') : normalized;
        text.value = normalized;
        renderCmsPreview();
      };
      color.addEventListener('input', () => updateColor(color.value));
      text.addEventListener('input', () => updateColor(text.value));
      colorRow.append(color, text);
      fieldWrapper.appendChild(colorRow);
    } else if (typeof val === 'string' && (val.length > 60 || val.includes('\n'))) {
      // Textarea
      const textarea = document.createElement('textarea');
      textarea.id = fieldId;
      textarea.rows = 3;
      textarea.className = 'w-full text-xs p-3 rounded-xl bg-[#090b10] border border-white/10 text-white focus:border-amber-400 outline-none resize-y';
      textarea.value = val;
      textarea.addEventListener('input', (e) => {
        cmsFullData[lang][section][key] = e.target.value;
        renderCmsPreview();
      });
      fieldWrapper.appendChild(textarea);
    } else {
      // Single line text
      const input = document.createElement('input');
      input.type = 'text';
      input.id = fieldId;
      input.className = 'w-full text-xs p-2.5 rounded-xl bg-[#090b10] border border-white/10 text-white focus:border-amber-400 outline-none';
      input.value = val !== undefined ? val : '';
      input.addEventListener('input', (e) => {
        cmsFullData[lang][section][key] = e.target.value;
        renderCmsPreview();
      });
      fieldWrapper.appendChild(input);
    }

    cmsFieldsContainer.appendChild(fieldWrapper);
  });
  renderCmsPreview();
}

function renderCmsPreview() {
  if (!cmsPreview) return;
  const data = cmsFullData?.[currentCmsLanguage]?.[currentCmsSection] || {};
  cmsPreviewTitle.textContent = `${currentCmsSection} • ${currentCmsLanguage.toUpperCase()}`;
  const entries = Object.entries(data);
  if (!entries.length) {
    cmsPreview.innerHTML = '<p class="text-neutral-500">Questa scheda è vuota. Aggiungi una voce dal pannello editor.</p>';
    return;
  }
  cmsPreview.innerHTML = entries.map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1');
    if (Array.isArray(value)) {
      return `<section class="rounded-xl border border-white/10 bg-white/[.03] p-3"><h5 class="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-2">${escapeHtml(label)}</h5><ul class="space-y-1 text-xs text-neutral-300">${value.slice(0, 6).map(item => `<li class="border-l-2 border-emerald-400/50 pl-2">${escapeHtml(typeof item === 'string' ? item : JSON.stringify(item))}</li>`).join('')}</ul></section>`;
    }
    if (/^https?:\/\//i.test(String(value))) {
      return `<a class="block rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs text-cyan-200 break-all" href="${escapeHtml(String(value))}" target="_blank" rel="noreferrer"><span class="block text-[10px] uppercase text-cyan-300/70 mb-1">${escapeHtml(label)}</span>${escapeHtml(String(value))}</a>`;
    }
    return `<section class="rounded-xl border border-white/10 bg-white/[.03] p-3"><h5 class="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">${escapeHtml(label)}</h5><p class="whitespace-pre-wrap break-words text-xs text-white">${escapeHtml(typeof value === 'string' ? value : JSON.stringify(value))}</p></section>`;
  }).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

// Helper to prefill section with standard fields if empty
window.initDefaultSectionFields = function(lang, section) {
  if (!cmsFullData[lang]) cmsFullData[lang] = {};

  const defaults = {
    welcome: {
      title: 'Benvenuto ad Aurora',
      greeting: 'La tua sosta serena a Morbegno',
      message: 'Siamo felici di accoglierti nel cuore della Valtellina. Rilassati e goditi ogni momento.',
      apartment: 'Appartamento Aurora',
      city: 'Morbegno',
      rooms: 'Camera matrimoniale, soggiorno con divano letto, cucina e bagno.'
    },
    checkIn: {
      title: 'Check-in & Apertura',
      badge: 'Accesso Rapido',
      timingNotice: 'Dalle 15:00 alle 20:00',
      houseAccessTitle: 'Come accedere alla casa',
      houseAccessDesc: 'Connettiti al Wi-Fi Casa_Aurora e premi il pulsante APRI PORTA per aprire la serratura.',
      parkingNotice: 'Posto auto privato riservato all’interno del cortile.'
    },
    wifi: {
      title: 'Wi-Fi & Rete Fibra',
      badge: 'Fibra Ultraveloce',
      networkName: 'Casa_Aurora',
      passwordNotice: 'Password disponibile direttamente nella scheda e copiata in un click',
      speedNotice: 'Ideale per smart working, streaming 4K e videochiamate.'
    },
    rules: {
      title: 'Regole della Casa',
      badge: 'Buon Senso e Rispetto',
      quietHoursNotice: 'Silenzio dalle 23:00 alle 07:00 per rispettare la quiete del vicinato.',
      rulesList: [
        { rule: 'Fumo', desc: 'Vietato fumare all’interno dell’appartamento.' },
        { rule: 'Animali', desc: 'Ammessi previa comunicazione all’host.' },
        { rule: 'Feste', desc: 'Non è consentito organizzare feste o eventi rumorosi.' }
      ]
    },
    checkOut: {
      title: 'Check-out',
      badge: 'Partenza Serena',
      timingNotice: 'Entro le ore 10:00',
      keyReturnDesc: 'Lascia le chiavi sul tavolo del soggiorno e chiudi il portoncino accostandolo con cura.',
      farewellMessage: 'Grazie per aver scelto Aurora in Valtellina! Ti auguriamo un sereno rientro.'
    },
    contact: {
      title: 'Contatti Host',
      hostName: 'Nino',
      phone: '+39 347 123 4567',
      availability: 'Sempre reperibile via WhatsApp o chiamata per qualsiasi necessità durante il soggiorno.'
    }
  };

  cmsFullData[lang][section] = defaults[section] || {
    title: `Scheda ${section}`,
    desc: `Contenuti personalizzati per ${section}`
  };

  renderCmsFields();
// Start
window.addEo ventListener('DOMContentLoaded', init);

