/**
 * Aurora in Valtellina - Standalone Host Portal Application
 * Apple HIG-inspired Minimalist & Robust Experience
 */

// Configuration & State
const DEFAULT_API_BASE = window.location.origin;
let API_BASE_URL = localStorage.getItem('AURORA_API_BASE_URL') || DEFAULT_API_BASE;

// Intercept all fetch calls to always include session cookies (credentials) for authorization
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  // If no credentials option is explicitly provided, set it to 'include'
  if (!options.credentials) {
    options.credentials = 'include';
  }
  return originalFetch(url, options);
};

let activePasses = [];
let allScheduledMessages = [];
let cmsContentData = {};
let currentCmsLang = 'it';
let currentCmsSection = 'welcome';
let cmsMediaData = {};
let lockStatusIntervalId = null;

// Fallback SVG Icons Map (guarantees icons never fail to display)
const SVG_ICONS = {
  'key-round': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  'settings': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  'unlock': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
  'power': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg>',
  'users': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  'chevron-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  'calendar-range': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M17 14h-6"/><path d="M13 18H7"/><path d="M7 14h.01"/><path d="M17 18h.01"/></svg>',
  'plus-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
  'clipboard-list': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
  'calendar': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  'home': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  'layout-template': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>',
  'image': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
  'sparkles': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
  'clipboard-paste': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2"/><path d="M11 14h10"/><path d="m17 10 4 4-4 4"/></svg>',
  'key': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>',
  'check': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  'copy': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  'external-link': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  'message-square': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  'send': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  'search': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  'refresh-cw': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
  'save': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>',
  'x': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  'wifi': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10 10 0 0 1 14 0"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/></svg>',
  'rotate-ccw': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  'trash-2': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
  'clock': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  'upload': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>'
};

// Render icons robustly
function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      window.lucide.createIcons();
    } catch (e) {
      console.warn('Lucide createIcons warning:', e);
    }
  }

  // Fallback for any unrendered data-lucide icons
  document.querySelectorAll('i[data-lucide]').forEach(el => {
    const iconName = el.getAttribute('data-lucide');
    if (SVG_ICONS[iconName] && el.innerHTML.trim() === '') {
      el.innerHTML = SVG_ICONS[iconName];
      const svg = el.querySelector('svg');
      if (svg) {
        svg.setAttribute('class', el.getAttribute('class') || 'w-4 h-4');
      }
    }
  });
}

// Media Catalog (18 Photos & Covers)
const MEDIA_CATALOG = [
  { key: 'hostAvatar', title: 'Foto Profilo Host Nino', desc: 'Visualizzata nella pagina Contatti e nell\'accoglienza.', aspectRatio: '1:1' },
  { key: 'heroLiving', title: 'Copertina Benvenuto & Living', desc: 'Foto principale del soggiorno per la copertina di Benvenuto.', aspectRatio: '16:9' },
  { key: 'checkInCover', title: 'Copertina Check-in & Smart Lock', desc: 'Foto per la procedura di accesso e chiave smart.', aspectRatio: '16:9' },
  { key: 'locationCover', title: 'Copertina Come Arrivare & Mappa', desc: 'Foto per orientamento, GPS e arrivo a Morbegno.', aspectRatio: '16:9' },
  { key: 'servicesCover', title: 'Copertina Servizi Casa & Comfort', desc: 'Dotazioni, riscaldamento ed elettrodomestici.', aspectRatio: '16:9' },
  { key: 'rulesCover', title: 'Copertina Regole della Casa', desc: 'Orari di quiete e norme di rispetto del condominio.', aspectRatio: '16:9' },
  { key: 'restaurantsCover', title: 'Copertina Crotti & Ristoranti', desc: 'Scheda enogastronomia tipica e pizzoccheri.', aspectRatio: '16:9' },
  { key: 'barsCover', title: 'Copertina Bar & Colazioni', desc: 'Caffetterie, pasticcerie e aperitivi serali a Morbegno.', aspectRatio: '16:9' },
  { key: 'shoppingCover', title: 'Copertina Botteghe del Bitto & Spesa', desc: 'Formaggi DOP della Valtellina e negozi alimentari.', aspectRatio: '16:9' },
  { key: 'activitiesCover', title: 'Copertina Escursioni & Sentieri', desc: 'Trekking alpino, Val di Mello e Ponte nel Cielo.', aspectRatio: '16:9' },
  { key: 'transportCover', title: 'Copertina Mezzi di Trasporto & Bici', desc: 'Treni FS per Milano/Tirano e noleggio biciclette.', aspectRatio: '16:9' },
  { key: 'infoCover', title: 'Copertina Informazioni Utili', desc: 'Farmacie di turno, bancomat e raccolta differenziata.', aspectRatio: '16:9' },
  { key: 'emergencyCover', title: 'Copertina Emergenze & Soccorso', desc: 'Numero unico 112 e guardia medica territoriale.', aspectRatio: '16:9' },
  { key: 'checkOutCover', title: 'Copertina Check-out & Partenza', desc: 'Checklist di partenza e rilascio chiavi.', aspectRatio: '16:9' },
  { key: 'bedroom', title: 'Camera da Letto Matrimoniale', desc: 'Foto della camera padronale con letto matrimoniale.', aspectRatio: '16:9' },
  { key: 'kitchen', title: 'Cucina Attrezzata Moderna', desc: 'Cucina a induzione, macchina caffè e dotazioni.', aspectRatio: '16:9' },
  { key: 'bathroom', title: 'Bagno & Doccia Cromoterapia', desc: 'Bagno con cabina doccia relax a led cromoterapici.', aspectRatio: '16:9' },
  { key: 'wifiQr', title: 'Codice QR Wi-Fi Casa_Aurora', desc: 'Codice QR per rapida connessione senza digitare password.', aspectRatio: '1:1' }
];

// Apple Toast Notification Manager
let toastTimeout = null;
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.getElementById('appleToast');
  const dot = document.getElementById('toastDot');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl || !dot) return;

  clearTimeout(toastTimeout);

  msgEl.textContent = message;

  // Dot color styling
  dot.className = 'w-2 h-2 rounded-full shrink-0 animate-pulse';
  if (type === 'success') {
    dot.classList.add('bg-[#30d158]');
  } else if (type === 'error') {
    dot.classList.add('bg-[#ff453a]');
  } else if (type === 'info') {
    dot.classList.add('bg-[#0071e3]');
  } else if (type === 'loading') {
    dot.classList.add('bg-[#ff9f0a]');
  }

  toast.classList.remove('toast-hidden');
  toast.classList.add('toast-visible');

  if (duration > 0) {
    toastTimeout = setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-hidden');
    }, duration);
  }
}

function hideToast() {
  const toast = document.getElementById('appleToast');
  if (toast) {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hidden');
  }
}

// Authentication gate. The first account can only be created once; after that
// the server permanently closes registration and accepts login only.
async function ensureHostSession() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
    const data = res.ok ? await res.json() : { authenticated: false, registrationOpen: false };
    if (data.authenticated) {
      document.getElementById('hostAuthScreen')?.classList.add('hidden');
      document.getElementById('hostPortalContent')?.classList.remove('hidden');
      return true;
    }
    setupAuthForm(Boolean(data.registrationOpen));
    return false;
  } catch (err) {
    setupAuthForm(false, 'Impossibile verificare la sessione. Riprova tra poco.');
    return false;
  }
}

function setupAuthForm(registrationOpen, initialError = '') {
  const form = document.getElementById('hostAuthForm');
  if (!form || form.dataset.ready === 'true') return;
  form.dataset.ready = 'true';
  const title = document.getElementById('authTitle');
  const description = document.getElementById('authDescription');
  const submit = document.getElementById('authSubmit');
  const password = document.getElementById('authPassword');
  const confirmWrap = document.getElementById('authConfirmWrap');
  const confirm = document.getElementById('authConfirmPassword');
  const bootstrapSecretWrap = document.getElementById('authBootstrapSecretWrap');
  const bootstrapSecret = document.getElementById('authBootstrapSecret');
  const feedback = document.getElementById('authFeedback');
  const setFeedback = message => {
    feedback.textContent = message;
    feedback.classList.toggle('hidden', !message);
  };
  if (registrationOpen) {
    title.textContent = 'Crea il primo account host';
    description.textContent = 'La registrazione è disponibile una sola volta. Dopo la creazione, l’accesso sarà riservato a questo account.';
    submit.textContent = 'Crea account e accedi';
    password.autocomplete = 'new-password';
    confirmWrap.classList.remove('hidden');
    confirm.required = true;
    bootstrapSecretWrap.classList.remove('hidden');
    bootstrapSecret.required = true;
  }
  setFeedback(initialError);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    setFeedback('');
    if (registrationOpen && password.value !== confirm.value) {
      setFeedback('Le password non coincidono.');
      return;
    }
    submit.disabled = true;
    submit.textContent = registrationOpen ? 'Creazione in corso…' : 'Accesso in corso…';
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/${registrationOpen ? 'bootstrap' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          email: document.getElementById('authEmail').value,
          password: password.value,
          ...(registrationOpen && { bootstrapSecret: bootstrapSecret.value })
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Operazione non riuscita.');
      document.getElementById('hostAuthScreen').classList.add('hidden');
      document.getElementById('hostPortalContent').classList.remove('hidden');
      await startHostPortal();
    } catch (error) {
      setFeedback(error.message || 'Operazione non riuscita.');
      submit.disabled = false;
      submit.textContent = registrationOpen ? 'Crea account e accedi' : 'Accedi';
    }
  });
}

// Copy Helper with Apple-style clipboard feedback
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fallback
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(el);
    return successful;
  } catch (err) {
    return false;
  }
}

// Add Log Entry to Home Assistant tab
function addHassLog(message, isSuccess = true) {
  const container = document.getElementById('hassLogsContainer');
  if (!container) return;

  if (container.children.length === 1 && container.children[0].tagName === 'P') {
    container.innerHTML = '';
  }

  const now = new Date().toLocaleTimeString('it-IT', { hour12: false });
  const row = document.createElement('div');
  row.className = `flex items-center justify-between p-2 rounded-lg bg-black/40 border ${isSuccess ? 'border-[#30d158]/20 text-[#30d158]' : 'border-[#ff453a]/20 text-[#ff453a]'}`;
  row.innerHTML = `
    <span class="truncate">${message}</span>
    <span class="text-[10px] text-[#86868b] font-mono shrink-0 ml-2">${now}</span>
  `;
  container.prepend(row);

  // keep max 8 logs
  while (container.children.length > 8) {
    container.removeChild(container.lastChild);
  }
}

// ============================================================
// MAIN INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  if (!await ensureHostSession()) return;
  await startHostPortal();
});

async function startHostPortal() {

  // Populate default dates (Check-in = today, Check-out = +3 days)
  const today = new Date();
  const next3 = new Date(today);
  next3.setDate(today.getDate() + 3);

  const formatDate = (d) => d.toISOString().split('T')[0];
  const checkInEl = document.getElementById('fieldCheckInDate');
  const checkOutEl = document.getElementById('fieldCheckOutDate');
  if (checkInEl) checkInEl.value = formatDate(today);
  if (checkOutEl) checkOutEl.value = formatDate(next3);

  // Setup tab navigation
  setupTabs();

  // Setup core event listeners
  setupEventListeners();

  // Setup Sub-Modules
  setupCms();
  setupMedia();

  // Health and data bootstrap
  await checkHealthAndBootstrap();

  // Render icons
  renderIcons();
}

// Tab Navigation
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });

      // Clear lock polling if leaving the hass tab
      if (lockStatusIntervalId) {
        clearInterval(lockStatusIntervalId);
        lockStatusIntervalId = null;
      }

      // Lazy loads
      if (targetTab === 'passes') {
        fetchPasses();
      } else if (targetTab === 'ical') {
        fetchEmailConfig();
        fetchEmailLogs();
      } else if (targetTab === 'hass') {
        fetchSonoffConfig();
        fetchLockStatus();
        lockStatusIntervalId = setInterval(fetchLockStatus, 3000);
      } else if (targetTab === 'cms') {
        loadCmsData();
      } else if (targetTab === 'media') {
        loadMediaData();
      } else if (targetTab === 'messages') {
        fetchAndRenderScheduledMessages();
      } else if (targetTab === 'alloggiati') {
        renderAlloggiatiTab();
      }

      renderIcons();
    });
  });
}

// Health & Connection
async function checkHealthAndBootstrap() {
  const badge = document.getElementById('connectionBadge');
  const text = document.getElementById('connectionText');

  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (res.ok) {
      if (badge) badge.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 text-[#30d158] text-xs font-medium';
      if (text) text.textContent = 'Connesso';

      // Bootstrap initial lists in background
      Promise.all([
        fetchPasses(),
        fetchSonoffConfig(),
        fetchEmailConfig(),
        loadCmsData()
      ]).catch(console.warn);
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    if (badge) badge.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs font-medium';
    if (text) text.textContent = 'Offline';
  }
}

// Event Listeners setup
function setupEventListeners() {
  // Toast close
  const btnCloseToast = document.getElementById('btnCloseToast');
  if (btnCloseToast) btnCloseToast.addEventListener('click', hideToast);

  // Quick Door Open in Header
  const btnForceDoorOpen = document.getElementById('btnForceDoorOpen');
  if (btnForceDoorOpen) {
    btnForceDoorOpen.addEventListener('click', () => triggerDoorUnlock('Header Quick'));
  }

  // API Config Modal
  const btnOpenApiConfig = document.getElementById('btnOpenApiConfig');
  const btnCloseApiConfig = document.getElementById('btnCloseApiConfig');
  const apiConfigModal = document.getElementById('apiConfigModal');
  const inputApiBaseUrl = document.getElementById('inputApiBaseUrl');
  const btnSaveApiConfig = document.getElementById('btnSaveApiConfig');

  if (btnOpenApiConfig && apiConfigModal) {
    btnOpenApiConfig.addEventListener('click', () => {
      if (inputApiBaseUrl) inputApiBaseUrl.value = API_BASE_URL;
      apiConfigModal.classList.remove('hidden');
    });
  }
  if (btnCloseApiConfig && apiConfigModal) {
    btnCloseApiConfig.addEventListener('click', () => apiConfigModal.classList.add('hidden'));
  }
  if (btnSaveApiConfig && inputApiBaseUrl) {
    btnSaveApiConfig.addEventListener('click', () => {
      let val = inputApiBaseUrl.value.trim();
      if (!val) val = DEFAULT_API_BASE;
      API_BASE_URL = val;
      localStorage.setItem('AURORA_API_BASE_URL', API_BASE_URL);
      if (apiConfigModal) apiConfigModal.classList.add('hidden');
      showToast('Endpoint API aggiornato. Riconnessione...', 'info');
      checkHealthAndBootstrap();
    });
  }

  // Smart Parser
  const btnParseText = document.getElementById('btnParseText');
  if (btnParseText) {
    btnParseText.addEventListener('click', handleParseBookingText);
  }

  // Create Pass Form
  const formCreatePass = document.getElementById('formCreatePass');
  if (formCreatePass) {
    formCreatePass.addEventListener('submit', handleCreatePass);
  }

  // Copy Result Link
  const btnCopyLink = document.getElementById('btnCopyLink');
  const resultLinkInput = document.getElementById('resultLinkInput');
  const copyLinkText = document.getElementById('copyLinkText');
  if (btnCopyLink && resultLinkInput) {
    btnCopyLink.addEventListener('click', async () => {
      const url = resultLinkInput.value;
      if (!url) return;
      const success = await copyToClipboard(url);
      if (success) {
        if (copyLinkText) copyLinkText.textContent = 'Copiato!';
        showToast('Link copiato negli appunti!', 'success');
        setTimeout(() => { if (copyLinkText) copyLinkText.textContent = 'Copia Link'; }, 2000);
      } else {
        showToast('Impossibile copiare il link', 'error');
      }
    });
  }

  // Passes Live Filter
  const inputFilterPasses = document.getElementById('inputFilterPasses');
  if (inputFilterPasses) {
    inputFilterPasses.addEventListener('input', (e) => {
      filterAndRenderPasses(e.target.value);
    });
  }

  // Real-time Lock State Simulation Buttons
  const btnSimulateClosed = document.getElementById('btnSimulateClosed');
  const btnSimulateOpen = document.getElementById('btnSimulateOpen');
  const btnSimulateOffline = document.getElementById('btnSimulateOffline');

  if (btnSimulateClosed) {
    btnSimulateClosed.addEventListener('click', () => handleStandaloneSimulateLockState('closed'));
  }
  if (btnSimulateOpen) {
    btnSimulateOpen.addEventListener('click', () => handleStandaloneSimulateLockState('open'));
  }
  if (btnSimulateOffline) {
    btnSimulateOffline.addEventListener('click', () => handleStandaloneSimulateLockState('offline'));
  }

  // Refresh Passes Button
  const btnRefreshPasses = document.getElementById('btnRefreshPasses');
  if (btnRefreshPasses) {
    btnRefreshPasses.addEventListener('click', async () => {
      const icon = btnRefreshPasses.querySelector('i, svg');
      if (icon) icon.classList.add('animate-spin');
      await fetchPasses();
      setTimeout(() => {
        if (icon) icon.classList.remove('animate-spin');
        showToast('Lista pass aggiornata', 'success');
      }, 400);
    });
  }

  // Email Config Form Submit
  const formEmailConfig = document.getElementById('formEmailConfig');
  if (formEmailConfig) {
    formEmailConfig.addEventListener('submit', handleSaveEmailConfig);
  }

  // Email Force Sync Button
  const btnForceEmailSync = document.getElementById('btnForceEmailSync');
  if (btnForceEmailSync) {
    btnForceEmailSync.addEventListener('click', handleForceEmailSync);
  }

  // Refresh Email Logs Button
  const btnRefreshEmailLogs = document.getElementById('btnRefreshEmailLogs');
  if (btnRefreshEmailLogs) {
    btnRefreshEmailLogs.addEventListener('click', fetchEmailLogs);
  }

  // Home Assistant Trigger Buttons
  const btnTestSonoffPulse = document.getElementById('btnTestSonoffPulse');
  if (btnTestSonoffPulse) {
    btnTestSonoffPulse.addEventListener('click', () => triggerDoorUnlock('Pannello Primario'));
  }

  const btnTestSonoffPulseConfig = document.getElementById('btnTestSonoffPulseConfig');
  if (btnTestSonoffPulseConfig) {
    btnTestSonoffPulseConfig.addEventListener('click', () => triggerDoorUnlock('Test Config'));
  }

  // Home Assistant Mode Switcher (Webhook vs REST)
  const btnModeWebhook = document.getElementById('btnModeWebhook');
  const btnModeRest = document.getElementById('btnModeRest');
  const sectionHassWebhook = document.getElementById('sectionHassWebhook');
  const sectionHassRest = document.getElementById('sectionHassRest');

  if (btnModeWebhook && btnModeRest && sectionHassWebhook && sectionHassRest) {
    btnModeWebhook.addEventListener('click', () => {
      btnModeWebhook.className = 'px-3 py-1 rounded-lg bg-white text-black font-semibold transition cursor-pointer';
      btnModeRest.className = 'px-3 py-1 rounded-lg text-[#86868b] hover:text-white font-medium transition cursor-pointer';
      sectionHassWebhook.classList.remove('hidden');
      sectionHassRest.classList.add('hidden');
    });

    btnModeRest.addEventListener('click', () => {
      btnModeRest.className = 'px-3 py-1 rounded-lg bg-white text-black font-semibold transition cursor-pointer';
      btnModeWebhook.className = 'px-3 py-1 rounded-lg text-[#86868b] hover:text-white font-medium transition cursor-pointer';
      sectionHassRest.classList.remove('hidden');
      sectionHassWebhook.classList.add('hidden');
    });
  }

  // Home Assistant Save Config
  const btnSaveSonoffConfig = document.getElementById('btnSaveSonoffConfig');
  if (btnSaveSonoffConfig) {
    btnSaveSonoffConfig.addEventListener('click', handleSaveSonoffConfig);
  }

  // Detect Home IP Button
  const btnDetectHomeIp = document.getElementById('btnDetectHomeIp');
  if (btnDetectHomeIp) {
    btnDetectHomeIp.addEventListener('click', handleDetectHomeIp);
  }
}

// ============================================================
// SMART PARSER (BOOKING TEXT)
// ============================================================
async function handleParseBookingText() {
  const input = document.getElementById('inputRawText');
  const feedback = document.getElementById('parseFeedback');
  const text = input ? input.value.trim() : '';

  if (!text) {
    showToast('Incolla prima il testo di notifica prenotazione', 'info');
    return;
  }

  showToast('Analisi testo prenotazione...', 'loading');

  try {
    // Try backend API first
    const res = await fetch(`${API_BASE_URL}/api/parse-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: text })
    });

    let data = null;
    if (res.ok) {
      data = await res.json();
    }

    // Client-side regex fallbacks if needed
    let guestName = data?.guestName || '';
    let guestSurname = data?.guestSurname || '';
    let phone = data?.phone || '';
    let checkIn = data?.checkInDate || '';
    let checkOut = data?.checkOutDate || '';
    let source = data?.source || 'bed-and-breakfast.it';
    let bookingRef = data?.bookingRef || '';
    let guestsCount = data?.guestsCount || 2;

    if (!guestName) {
      const nameMatch = text.match(/(?:prenotazione da|ospite|per)\s+([A-Z][a-zàèéìòù]+)(?:\s+([A-Z][a-zàèéìòù]+))?/i);
      if (nameMatch) {
        guestName = nameMatch[1];
        if (nameMatch[2]) guestSurname = nameMatch[2];
      }
    }

    if (!phone) {
      const phoneMatch = text.match(/(?:\+39|3\d{2})[\s.-]?\d{3}[\s.-]?\d{4}/);
      if (phoneMatch) phone = phoneMatch[0];
    }

    // Populate Fields
    const fieldGuestName = document.getElementById('fieldGuestName');
    const fieldGuestSurname = document.getElementById('fieldGuestSurname');
    const fieldPhone = document.getElementById('fieldPhone');
    const fieldCheckInDate = document.getElementById('fieldCheckInDate');
    const fieldCheckOutDate = document.getElementById('fieldCheckOutDate');
    const fieldSource = document.getElementById('fieldSource');
    const fieldBookingRef = document.getElementById('fieldBookingRef');
    const fieldGuestsCount = document.getElementById('fieldGuestsCount');

    if (fieldGuestName && guestName) fieldGuestName.value = guestName;
    if (fieldGuestSurname && guestSurname) fieldGuestSurname.value = guestSurname;
    if (fieldPhone && phone) fieldPhone.value = phone;
    if (fieldCheckInDate && checkIn) fieldCheckInDate.value = checkIn;
    if (fieldCheckOutDate && checkOut) fieldCheckOutDate.value = checkOut;
    if (fieldSource && source) fieldSource.value = source;
    if (fieldBookingRef && bookingRef) fieldBookingRef.value = bookingRef;
    if (fieldGuestsCount && guestsCount) fieldGuestsCount.value = guestsCount;

    showToast('Campi compilati automaticamente!', 'success');
    if (feedback) {
      feedback.className = 'text-xs py-1.5 px-3 rounded-xl bg-[#30d158]/10 text-[#30d158] font-medium';
      feedback.textContent = `Identificato: ${guestName} ${guestSurname}`;
      feedback.classList.remove('hidden');
    }
  } catch (err) {
    showToast('Errore durante l\'analisi del testo', 'error');
  }
}

// ============================================================
// CREATE PASS LOGIC
// ============================================================
async function handleCreatePass(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('fieldGuestName')?.value.trim();
  const surname = document.getElementById('fieldGuestSurname')?.value.trim() || '';
  const phone = document.getElementById('fieldPhone')?.value.trim() || '';
  const checkIn = document.getElementById('fieldCheckInDate')?.value;
  const checkOut = document.getElementById('fieldCheckOutDate')?.value;
  const source = document.getElementById('fieldSource')?.value || 'bed-and-breakfast.it';
  const bookingRef = document.getElementById('fieldBookingRef')?.value.trim() || '';
  const guests = parseInt(document.getElementById('fieldGuestsCount')?.value || '2', 10);

  if (!name || !checkIn || !checkOut) {
    showToast('Compila almeno nome ospite, check-in e check-out', 'error');
    return;
  }

  showToast('Generazione pass e chiave digitale...', 'loading');

  const payload = {
    guestName: surname ? `${name} ${surname}` : name,
    phone,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    source,
    bookingRef,
    guestsCount: guests
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/webhook/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.success && (data.link || data.directUrl || data.pass)) {
      const generatedUrl = data.directUrl || data.link || `${window.location.origin}/guest/${data.pass?.token || ''}`;
      
      // Show Result Box
      const resultBox = document.getElementById('resultBox');
      const resultLinkInput = document.getElementById('resultLinkInput');
      const btnTestOpenLink = document.getElementById('btnTestOpenLink');
      const btnSendWhatsApp = document.getElementById('btnSendWhatsApp');
      const btnSendSms = document.getElementById('btnSendSms');
      const resultExpiryText = document.getElementById('resultExpiryText');

      if (resultLinkInput) resultLinkInput.value = generatedUrl;
      if (btnTestOpenLink) btnTestOpenLink.href = generatedUrl;
      if (resultExpiryText) resultExpiryText.textContent = `Validità: fino al ${checkOut}`;

      // WhatsApp link preparation
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const waText = encodeURIComponent(
        `Ciao ${name}! Benvenuto a Morbegno.\nEcco la tua guida interattiva e la chiave digitale per l'Appartamento Aurora:\n${generatedUrl}\n\nBuon soggiorno in Valtellina!`
      );
      if (btnSendWhatsApp) {
        btnSendWhatsApp.href = cleanPhone ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${waText}` : `https://wa.me/?text=${waText}`;
      }

      // SMS direct link preparation
      const smsText = encodeURIComponent(
        `Ciao ${name}! Ecco la tua guida e chiave digitale per l'Appartamento Aurora a Morbegno: ${generatedUrl}`
      );
      if (btnSendSms) {
        btnSendSms.href = cleanPhone ? `sms:${cleanPhone}?body=${smsText}` : `sms:?body=${smsText}`;
      }

      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.scrollIntoView({ behavior: 'smooth' });
      }

      showToast('Pass generato con successo!', 'success');

      // Refresh passes list
      fetchPasses();
    } else {
      throw new Error(data.error || 'Risposta del server non valida');
    }
  } catch (err) {
    showToast(`Errore: ${err.message}`, 'error');
  }
}

// ============================================================
// PASSES MANAGEMENT
// ============================================================
async function fetchPasses() {
  try {
    const [resPasses, resMessages] = await Promise.all([
      fetch(`${API_BASE_URL}/api/passes`),
      fetch(`${API_BASE_URL}/api/scheduled-messages`).catch(err => {
        console.warn('Errore precaricamento messaggi:', err);
        return null;
      })
    ]);

    if (!resPasses.ok) throw new Error(`HTTP ${resPasses.status}`);
    const dataPasses = await resPasses.json();
    activePasses = Array.isArray(dataPasses) ? dataPasses : (dataPasses.passes || []);

    if (resMessages && resMessages.ok) {
      const dataMessages = await resMessages.json();
      if (dataMessages.success && Array.isArray(dataMessages.messages)) {
        allScheduledMessages = dataMessages.messages;
      }
    }

    // Update counts
    const countEl = document.getElementById('statActiveCount');
    const tabCountEl = document.getElementById('tabCount');
    if (countEl) countEl.textContent = activePasses.length;
    if (tabCountEl) tabCountEl.textContent = activePasses.length;

    filterAndRenderPasses('');
  } catch (err) {
    const container = document.getElementById('passesContainer');
    if (container) {
      container.innerHTML = `<div class="apple-card p-6 text-center text-xs text-[#86868b]">Impossibile caricare i pass (${err.message}).</div>`;
    }
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function filterAndRenderPasses(filterQuery) {
  const container = document.getElementById('passesContainer');
  if (!container) return;

  const list = activePasses.filter(p => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (p.guestName && p.guestName.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.bookingRef && p.bookingRef.toLowerCase().includes(q))
    );
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div class="apple-card p-10 text-center space-y-2">
        <p class="text-sm font-semibold text-white">Nessun pass trovato</p>
        <p class="text-xs text-[#86868b]">Non sono presenti pass per i criteri specificati. Usa la scheda "Crea Pass" o "iCal" per aggiungerne.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((pass, index) => {
    const guestLink = `${window.location.origin}/guest/${pass.token}`;
    const cleanPhone = (pass.phone || '').replace(/[^0-9+]/g, '');
    const isExpired = new Date(pass.checkOutDate) < new Date(new Date().toDateString());
    const guestName = escapeHtml(pass.guestName || 'Ospite');
    const guestInitial = escapeHtml((pass.guestName || 'O')[0].toUpperCase());
    const bookingSource = escapeHtml(pass.source || pass.bookingSource || 'bed-and-breakfast.it');
    const checkInDate = escapeHtml(pass.checkInDate || '');
    const checkOutDate = escapeHtml(pass.checkOutDate || '');
    const phone = escapeHtml(pass.phone || '');
    const bookingRef = escapeHtml(pass.bookingRef || '');
    const safeGuestLink = escapeHtml(guestLink);

    // Calculate per-pass message status progress
    const passMessages = allScheduledMessages.filter(m => m.passId === pass.id);
    let msgProgressHtml = '';
    if (passMessages.length > 0) {
      const welcomeMsg = passMessages.find(m => m.triggerType === 'welcome');
      const preCheckinMsg = passMessages.find(m => m.triggerType === 'pre_checkin');
      const courtesyMsg = passMessages.find(m => m.triggerType === 'courtesy');
      const checkoutMsg = passMessages.find(m => m.triggerType === 'checkout');

      const getIcon = (msg) => {
        if (!msg) return '<i data-lucide="minus-circle" class="w-3 h-3 opacity-30" title="Non programmato"></i>';
        if (msg.status === 'sent') return '<i data-lucide="check-circle" class="w-3 h-3 text-[#30d158]" title="Inviato con successo"></i>';
        if (msg.status === 'failed') return '<i data-lucide="alert-circle" class="w-3 h-3 text-[#ff453a]" title="Errore invio"></i>';
        if (msg.status === 'sending') return '<i data-lucide="refresh-cw" class="w-3 h-3 text-[#ff9f0a] animate-spin" title="Invio in corso"></i>';
        return '<i data-lucide="clock" class="w-3 h-3 text-[#86868b]" title="In coda"></i>';
      };

      const getLabelClass = (msg) => {
        if (!msg) return 'opacity-30';
        if (msg.status === 'sent') return 'text-[#30d158] font-semibold';
        if (msg.status === 'failed') return 'text-[#ff453a] font-semibold';
        return 'text-[#86868b]';
      };

      msgProgressHtml = `
        <div class="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center gap-3.5 flex-wrap text-[10px]">
          <span class="text-[#86868b] font-medium uppercase tracking-wider text-[9px]">Messaggi automatici:</span>
          <span class="flex items-center gap-1 ${getLabelClass(welcomeMsg)}">
            ${getIcon(welcomeMsg)} Benvenuto
          </span>
          <span class="flex items-center gap-1 ${getLabelClass(preCheckinMsg)}">
            ${getIcon(preCheckinMsg)} Check-in (3gg prima)
          </span>
          <span class="flex items-center gap-1 ${getLabelClass(courtesyMsg)}">
            ${getIcon(courtesyMsg)} Cortesia
          </span>
          <span class="flex items-center gap-1 ${getLabelClass(checkoutMsg)}">
            ${getIcon(checkoutMsg)} Check-out (sera prima)
          </span>
        </div>
      `;
    }

    return `
      <div class="apple-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Guest Details -->
        <div class="flex items-start gap-3.5 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/10 text-white font-semibold flex items-center justify-center shrink-0 text-sm">
            ${guestInitial}
          </div>
          <div class="min-w-0 space-y-1 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-semibold text-sm text-white tracking-tight">${guestName}</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono ${isExpired ? 'bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20' : 'bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20'}">
                ${isExpired ? 'Scaduto' : 'Attivo'}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#86868b] text-[10px] border border-white/[0.08]">
                ${bookingSource}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs text-[#86868b] flex-wrap">
              <span>Dal <strong>${checkInDate}</strong> al <strong>${checkOutDate}</strong></span>
              ${pass.phone ? `<span>• Tel: <strong class="text-white font-mono">${phone}</strong></span>` : ''}
              ${pass.bookingRef ? `<span>• Ref: <code class="font-mono text-white">${bookingRef}</code></span>` : ''}
            </div>
            ${msgProgressHtml}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-wrap shrink-0">
          <!-- Toggle Check-in Confirmation -->
          <button type="button" data-pass-action="confirm" data-pass-index="${index}" class="btn-apple-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${pass.checkInConfirmed ? 'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20' : 'bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]/20'}" title="Toggle conferma check-in ospite">
            <i data-lucide="${pass.checkInConfirmed ? 'check-circle' : 'circle'}" class="w-3.5 h-3.5"></i>
            <span>${pass.checkInConfirmed ? 'Confermato' : 'Conferma Check-in'}</span>
          </button>

          <!-- Unlock Door Button with this pass -->
          <button type="button" data-pass-action="unlock" data-pass-index="${index}" class="btn-apple-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer" title="Test apertura portone per questo pass">
            <i data-lucide="unlock" class="w-3.5 h-3.5 text-[#30d158]"></i>
            <span>Apri Porta</span>
          </button>

          <!-- Copy Link -->
          <button type="button" data-pass-action="copy" data-pass-index="${index}" class="btn-apple-secondary px-3 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copia</span>
          </button>

          <!-- Open Guide -->
          <a href="${safeGuestLink}" target="_blank" rel="noopener noreferrer" class="btn-apple-secondary px-3 py-2 text-xs font-medium flex items-center gap-1.5" title="Apri guida ospite">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            <span>Guida</span>
          </a>

          ${cleanPhone ? `
            <!-- WhatsApp button -->
            <a href="https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Ciao ${pass.guestName}! Ecco il tuo link per l'Appartamento Aurora: ${guestLink}`)}" target="_blank" class="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 transition" title="Invia su WhatsApp">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
            </a>
          ` : ''}

          <!-- Delete Pass -->
          <button type="button" data-pass-action="delete" data-pass-index="${index}" class="p-2 rounded-xl bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] border border-[#ff453a]/20 transition cursor-pointer" title="Revoca e cancella questo pass">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-pass-action]').forEach(button => {
    button.addEventListener('click', () => {
      const pass = list[Number(button.dataset.passIndex)];
      if (!pass) return;
      const guestLink = `${window.location.origin}/guest/${pass.token}`;
      if (button.dataset.passAction === 'unlock') triggerDoorUnlock(pass.guestName || 'Host', pass.token);
      if (button.dataset.passAction === 'copy') copyPassLink(guestLink, button);
      if (button.dataset.passAction === 'delete') deletePass(pass.id, pass.guestName || 'questo ospite');
      if (button.dataset.passAction === 'confirm') toggleCheckinConfirmation(pass);
    });
  });

  renderIcons();
}

window.copyPassLink = async function(link, btn) {
  const success = await copyToClipboard(link);
  if (success) {
    const orig = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-[#30d158]"></i><span>Copiato!</span>`;
    renderIcons();
    showToast('Link ospite copiato!', 'success');
    setTimeout(() => {
      btn.innerHTML = orig;
      renderIcons();
    }, 2000);
  } else {
    showToast('Impossibile copiare il link', 'error');
  }
};

window.deletePass = async function(id, guestName) {
  if (!confirm(`Sei sicuro di voler revocare ed eliminare il pass di ${guestName}? L'ospite non potrà più accedere.`)) {
    return;
  }

  showToast(`Revoca pass di ${guestName}...`, 'loading');

  try {
    const res = await fetch(`${API_BASE_URL}/api/passes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(`Pass di ${guestName} revocato con successo`, 'success');
      activePasses = activePasses.filter(p => p.id !== id);
      filterAndRenderPasses('');
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    showToast(`Errore durante la revoca: ${err.message}`, 'error');
  }
};

window.toggleCheckinConfirmation = async function(pass) {
  const newStatus = !pass.checkInConfirmed;
  showToast(newStatus ? 'Conferma check-in...' : 'Annullamento conferma...', 'loading');
  try {
    const res = await fetch(`${API_BASE_URL}/api/passes/${pass.id}/confirm-checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: newStatus })
    });
    if (res.ok) {
      showToast(newStatus ? 'Check-in confermato!' : 'Conferma annullata!', 'success');
      pass.checkInConfirmed = newStatus;
      filterAndRenderPasses('');
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    showToast(`Errore: ${err.message}`, 'error');
  }
};

// ============================================================
// EMAIL SYNCHRONIZATION & IMAP CONFIG
// ============================================================
async function fetchEmailConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/email/config`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.config) {
      const cfg = data.config;
      const inputImapHost = document.getElementById('inputImapHost');
      const inputImapPort = document.getElementById('inputImapPort');
      const inputImapUser = document.getElementById('inputImapUser');
      const inputImapPass = document.getElementById('inputImapPass');
      const inputImapInterval = document.getElementById('inputImapInterval');
      const checkboxImapSecure = document.getElementById('checkboxImapSecure');
      const checkboxImapEnabled = document.getElementById('checkboxImapEnabled');
      
      const emailOverviewStatus = document.getElementById('emailOverviewStatus');
      const emailStatusBadge = document.getElementById('emailStatusBadge');

      if (inputImapHost && cfg.host) inputImapHost.value = cfg.host;
      if (inputImapPort && cfg.port) inputImapPort.value = cfg.port;
      if (inputImapUser && cfg.user) inputImapUser.value = cfg.user;
      if (inputImapPass && cfg.pass) inputImapPass.value = cfg.pass;
      if (inputImapInterval && cfg.intervalMs) inputImapInterval.value = Math.round(cfg.intervalMs / 60000);
      if (checkboxImapSecure) checkboxImapSecure.checked = Boolean(cfg.secure);
      if (checkboxImapEnabled) checkboxImapEnabled.checked = Boolean(cfg.enabled);

      if (emailOverviewStatus) {
        emailOverviewStatus.textContent = cfg.enabled ? '● Sincronizzazione Attiva' : '● In Attesa';
        emailOverviewStatus.className = cfg.enabled ? 'text-[11px] text-[#30d158] block truncate font-mono' : 'text-[11px] text-[#86868b] block truncate font-mono';
      }
      if (emailStatusBadge) {
        emailStatusBadge.textContent = cfg.enabled ? 'Sincronizzazione Attiva' : 'Configurazione Pronta';
        emailStatusBadge.className = cfg.enabled 
          ? 'self-start sm:self-auto px-3 py-1 rounded-full text-xs font-mono bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/25'
          : 'self-start sm:self-auto px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-[#86868b] border border-white/10';
      }
    }
  } catch (err) {
    console.warn('Email config fetch notice:', err);
  }
}

async function handleSaveEmailConfig(e) {
  if (e) e.preventDefault();

  const host = document.getElementById('inputImapHost')?.value.trim();
  const port = parseInt(document.getElementById('inputImapPort')?.value || '993', 10);
  const user = document.getElementById('inputImapUser')?.value.trim();
  const pass = document.getElementById('inputImapPass')?.value;
  const intervalMins = parseInt(document.getElementById('inputImapInterval')?.value || '2', 10);
  const secure = document.getElementById('checkboxImapSecure')?.checked || false;
  const enabled = document.getElementById('checkboxImapEnabled')?.checked || false;

  showToast('Salvataggio configurazione email...', 'loading');

  try {
    const res = await fetch(`${API_BASE_URL}/api/email/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host,
        port,
        user,
        pass,
        intervalMs: intervalMins * 60 * 1000,
        secure,
        enabled
      })
    });

    if (res.ok) {
      showToast('Configurazione Email (IMAP) salvata con successo!', 'success');
      fetchEmailConfig();
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    showToast(`Errore: ${err.message}`, 'error');
  }
}

async function handleForceEmailSync() {
  const btn = document.getElementById('btnForceEmailSync');
  const feedback = document.getElementById('emailFeedbackBox');
  
  showToast('Sincronizzazione email in corso...', 'loading');
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE_URL}/api/email/sync-now`, { method: 'POST' });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Sincronizzazione completata con successo!', 'success');
      if (feedback) {
        feedback.className = 'p-3.5 rounded-xl text-xs font-mono bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 block';
        feedback.textContent = `${data.message} (Totale pass attivi: ${data.totalPasses || activePasses.length})`;
      }
      fetchPasses();
      fetchEmailLogs();
    } else {
      throw new Error(data.error || 'Errore durante la sincronizzazione');
    }
  } catch (err) {
    showToast(`Errore sincronizzazione: ${err.message}`, 'error');
    if (feedback) {
      feedback.className = 'p-3.5 rounded-xl text-xs font-mono bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20 block';
      feedback.textContent = `Errore: ${err.message}`;
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function fetchEmailLogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/email/logs`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && Array.isArray(data.logs)) {
      const tbody = document.getElementById('emailLogsTableBody');
      if (!tbody) return;
      
      if (data.logs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-8 text-center text-[#86868b]">Nessun log registrato nel sistema. Invia una mail di prova dal provider per testare l'integrazione.</td>
          </tr>
        `;
        return;
      }
      
      tbody.innerHTML = data.logs.map(log => {
        const date = new Date(log.timestamp).toLocaleString('it-IT', { hour12: false });
        let statusBadge = '';
        if (log.status === 'success') {
          statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20">Successo</span>';
        } else if (log.status === 'warning') {
          statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/20">Avviso</span>';
        } else if (log.status === 'error') {
          statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20">Errore</span>';
        } else {
          statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#86868b]/10 text-[#86868b] border border-[#86868b]/20">Ignorato</span>';
        }
        
        const detailsJson = log.details ? JSON.stringify(log.details, null, 2).replace(/"/g, '&quot;') : '';
        const detailsButton = log.details 
          ? `<button class="p-1 text-[#0071e3] hover:text-[#0077ed] transition" onclick="toggleLogDetails('${log.id}')" title="Vedi dati grezzi"><i data-lucide="eye" class="w-3.5 h-3.5"></i></button>`
          : '-';
          
        return `
          <tr class="hover:bg-white/[0.02] transition font-sans">
            <td class="py-3 font-mono text-[#86868b]">${date}</td>
            <td class="py-3">${statusBadge}</td>
            <td class="py-3 font-medium text-white truncate max-w-[220px]" title="${log.sender}\n${log.subject}">
              <div class="truncate text-[11px] text-[#86868b] font-mono">${log.sender}</div>
              <div class="truncate text-[10px] text-white">${log.subject}</div>
            </td>
            <td class="py-3 text-white pr-2 font-sans">${log.message}</td>
            <td class="py-3 text-right">${detailsButton}</td>
          </tr>
          ${log.details ? `
          <tr id="details-${log.id}" class="hidden bg-black/20">
            <td colspan="5" class="p-4">
              <pre class="text-[10px] text-[#86868b] font-mono bg-white/[0.02] p-3 rounded-xl overflow-x-auto border border-white/5 max-w-full whitespace-pre-wrap text-left">${detailsJson}</pre>
            </td>
          </tr>
          ` : ''}
        `;
      }).join('');
      
      renderIcons();
    }
  } catch (err) {
    console.error('Errore recupero log email:', err);
  }
}

// Global helper to toggle logs collapse
window.toggleLogDetails = function(logId) {
  const row = document.getElementById(`details-${logId}`);
  if (row) {
    row.classList.toggle('hidden');
  }
};

// ============================================================
// HOME ASSISTANT INTEGRATION
// ============================================================
async function fetchSonoffConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hass/config`);
    if (!res.ok) return;
    const data = await res.json();
    {
      const cfg = data.config || data;
      if (cfg.webhookUrl) document.getElementById('inputSonoffWebhookUrl').value = cfg.webhookUrl;
      if (cfg.haUrl) document.getElementById('inputHassUrl').value = cfg.haUrl;
      if (cfg.entityId) document.getElementById('inputHassEntityId').value = cfg.entityId;
      if (cfg.service) document.getElementById('selectHassService').value = cfg.service;
      if (cfg.deviceName) document.getElementById('inputSonoffDeviceName').value = cfg.deviceName;
      if (cfg.homePublicIp) document.getElementById('inputHomePublicIp').value = cfg.homePublicIp;
      if (cfg.lanGatewayIp) document.getElementById('inputLanGatewayIp').value = cfg.lanGatewayIp;
      if (cfg.localWebhookUrl) document.getElementById('inputLocalWebhookUrl').value = cfg.localWebhookUrl;
    }

    // Fetch client IP for Wi-Fi Casa_Aurora check
    const wifiRes = await fetch(`${API_BASE_URL}/api/wifi/status`);
    if (wifiRes.ok) {
      const wifiData = await wifiRes.json();
      const ipEl = document.getElementById('currentDetectedIp');
      if (ipEl && wifiData.clientIp) {
        ipEl.textContent = wifiData.clientIp;
      }
    }
  } catch (err) {
    console.warn('HA config load notice:', err);
  }
}

async function handleSaveSonoffConfig() {
  showToast('Salvataggio configurazione Home Assistant...', 'loading');

  const payload = {
    webhookUrl: document.getElementById('inputSonoffWebhookUrl')?.value.trim() || '',
    haUrl: document.getElementById('inputHassUrl')?.value.trim() || '',
    entityId: document.getElementById('inputHassEntityId')?.value.trim() || 'switch.portone',
    service: document.getElementById('selectHassService')?.value || 'switch.turn_on',
    deviceName: document.getElementById('inputSonoffDeviceName')?.value.trim() || 'Pulsante Portone Aurora',
    accessToken: document.getElementById('inputHassToken')?.value.trim() || '',
    homePublicIp: document.getElementById('inputHomePublicIp')?.value.trim() || '',
    lanGatewayIp: document.getElementById('inputLanGatewayIp')?.value.trim() || '192.168.0.1',
    localWebhookUrl: document.getElementById('inputLocalWebhookUrl')?.value.trim() || ''
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/hass/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('Configurazione salvata con successo!', 'success');
      const box = document.getElementById('sonoffFeedbackBoxConfig');
      if (box) {
        box.className = 'p-3 rounded-xl text-xs font-mono bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 block';
        box.textContent = 'Configurazione memorizzata sul server';
      }
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    showToast(`Errore salvataggio: ${err.message}`, 'error');
  }
}

async function handleDetectHomeIp() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/wifi/status`);
    if (!res.ok) throw new Error('API Wi-Fi non raggiungibile');
    const data = await res.json();
    if (data.clientIp) {
      const input = document.getElementById('inputHomePublicIp');
      if (input) input.value = data.clientIp;

      // Save to server
      await fetch(`${API_BASE_URL}/api/wifi/set-home-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: data.clientIp })
      });

      showToast(`IP ${data.clientIp} impostato come modem di casa!`, 'success');
    }
  } catch (err) {
    showToast(`Errore rilevamento IP: ${err.message}`, 'error');
  }
}

// Master Door Unlock Function
window.triggerDoorUnlock = async function(callerLabel = 'Manuale', token = null) {
  showToast('Invio impulso sblocco porta...', 'loading', 0);

  const payload = {
    method: 'webhook',
    source: 'host-portal',
    caller: callerLabel,
    ...(token && { token })
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/hass/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('PORTA APERTA! Impulso inviato con successo.', 'success', 3500);
      addHassLog(`Apertura eseguita da ${callerLabel}: Successo`, true);
      
      const statAction = document.getElementById('statHassLastAction');
      if (statAction) {
        statAction.textContent = `● Ultima apertura: ${new Date().toLocaleTimeString()}`;
      }

      const box = document.getElementById('sonoffFeedbackBox');
      if (box) {
        box.className = 'p-3 rounded-xl text-xs font-mono bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 block';
        box.textContent = `Risposta HA: ${data.message || 'Impulso ON accettato'}`;
      }
    } else {
      throw new Error(data.error || 'Home Assistant ha rifiutato la richiesta');
    }
  } catch (err) {
    showToast(`Errore apertura: ${err.message}`, 'error', 4000);
    addHassLog(`Tentativo apertura da ${callerLabel}: Fallito (${err.message})`, false);

    const box = document.getElementById('sonoffFeedbackBox');
    if (box) {
      box.className = 'p-3 rounded-xl text-xs font-mono bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20 block';
      box.textContent = `Errore: ${err.message}`;
    }
  }
};

// ============================================================
// CMS GESTIONE TESTI E SCHEDE
// ============================================================
function setupCms() {
  // Language buttons
  const langButtons = document.querySelectorAll('.cms-lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-cms-lang');
      currentCmsLang = lang;

      langButtons.forEach(b => {
        b.className = 'cms-lang-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] text-[#86868b] hover:text-white transition cursor-pointer';
      });
      btn.className = 'cms-lang-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-[#ff9f0a] text-black shadow-sm transition cursor-pointer';

      renderCmsFields();
    });
  });

  // Section select dropdown
  const sectionSelect = document.getElementById('cmsSectionSelect');
  if (sectionSelect) {
    sectionSelect.addEventListener('change', (e) => {
      currentCmsSection = e.target.value;
      renderCmsFields();
    });
  }

  // Save buttons (Top & Bottom)
  const btnSaveCms = document.getElementById('btnSaveCms');
  const btnSaveCmsBottom = document.getElementById('btnSaveCmsBottom');
  if (btnSaveCms) btnSaveCms.addEventListener('click', handleSaveCms);
  if (btnSaveCmsBottom) btnSaveCmsBottom.addEventListener('click', handleSaveCms);

  // Reset button
  const btnResetCms = document.getElementById('btnResetCms');
  if (btnResetCms) btnResetCms.addEventListener('click', handleResetCms);

  // Search filter for CMS fields
  const filterInput = document.getElementById('inputFilterCmsFields');
  const btnClearFilter = document.getElementById('btnClearCmsFilter');
  
  if (filterInput) {
    filterInput.addEventListener('input', () => {
      const q = filterInput.value.toLowerCase().trim();
      if (q.length > 0) {
        renderGlobalCmsSearch(q);
      } else {
        renderCmsFields();
      }
    });
  }
  
  if (btnClearFilter && filterInput) {
    btnClearFilter.addEventListener('click', () => {
      filterInput.value = '';
      renderCmsFields();
    });
  }
}

async function loadCmsData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/content`);
    if (res.ok) {
      const json = await res.json();
      cmsContentData = json.data || json.content || json || {};
      renderCmsFields();
    }
  } catch (err) {
    console.warn('CMS content load notice:', err);
  }
}

function getActiveSectionData() {
  const langData = cmsContentData[currentCmsLang] || {};
  let targetKey = currentCmsSection;
  if (!langData[targetKey]) {
    if (targetKey === 'services' && langData.amenities) targetKey = 'amenities';
    else if (targetKey === 'amenities' && langData.services) targetKey = 'services';
    else if (targetKey === 'contact' && langData.contacts) targetKey = 'contacts';
    else if (targetKey === 'contacts' && langData.contact) targetKey = 'contact';
  }
  return { sectionKey: targetKey, data: langData[targetKey] || {} };
}

function setDeepValue(obj, path, val) {
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (curr[p] === undefined || curr[p] === null) {
      curr[p] = isNaN(Number(parts[i + 1])) ? {} : [];
    }
    curr = curr[p];
  }
  curr[parts[parts.length - 1]] = val;
}

function getDeepValue(obj, path) {
  if (!obj) return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[p];
  }
  return curr;
}

function renderCmsFields() {
  const container = document.getElementById('cmsFieldsContainer');
  const preview = document.getElementById('cmsPreview');
  const previewTitle = document.getElementById('cmsPreviewTitle');
  if (!container) return;

  const filterInput = document.getElementById('inputFilterCmsFields');
  if (filterInput && filterInput.value.trim().length > 0) {
    renderGlobalCmsSearch(filterInput.value);
    return;
  }

  const { sectionKey, data: sectionData } = getActiveSectionData();

  if (previewTitle) {
    previewTitle.textContent = `${sectionKey.toUpperCase()} (${currentCmsLang.toUpperCase()})`;
  }

  const keys = Object.keys(sectionData);
  if (keys.length === 0) {
    container.innerHTML = `
      <div class="apple-card p-6 text-center text-xs text-[#86868b]">
        Nessun campo personalizzato presente per questa lingua e sezione.
      </div>
    `;
    if (preview) preview.innerHTML = '<p class="text-xs text-[#86868b]">Nessun contenuto da visualizzare.</p>';
    return;
  }

  const fieldItems = [];

  function walkFields(prefix, obj) {
    for (const [k, v] of Object.entries(obj)) {
      const pathKey = prefix ? `${prefix}.${k}` : k;
      if (v === null || v === undefined) continue;

      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        const strVal = String(v);
        const isMultiline = strVal.length > 55 || strVal.includes('\n');
        const showTranslate = typeof v === 'string' && strVal.trim().length > 2 && !pathKey.toLowerCase().includes('phone') && !pathKey.toLowerCase().includes('url') && !pathKey.toLowerCase().includes('email') && !pathKey.toLowerCase().includes('color') && !pathKey.toLowerCase().includes('font');
        fieldItems.push(`
          <div class="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <label class="block text-xs font-mono text-[#ff9f0a] font-semibold">${pathKey}</label>
              ${showTranslate ? `
                <button type="button" data-translate-path="${pathKey}" class="btn-cms-translate text-[10px] px-2 py-1 rounded bg-[#30d158]/10 text-[#30d158] hover:bg-[#30d158]/20 border border-[#30d158]/20 transition flex items-center gap-1 cursor-pointer">
                  ✨ Traduci con IA
                </button>
              ` : ''}
            </div>
            ${isMultiline ? `
              <textarea data-field-path="${pathKey}" rows="3" class="cms-field-input w-full text-xs p-2.5 rounded-xl resize-y bg-[#1c1c1e] text-white border border-white/10">${strVal}</textarea>
            ` : `
              <input type="text" data-field-path="${pathKey}" value="${strVal.replace(/"/g, '&quot;')}" class="cms-field-input w-full text-xs p-2.5 rounded-xl bg-[#1c1c1e] text-white border border-white/10" />
            `}
          </div>
        `);
      } else if (Array.isArray(v)) {
        fieldItems.push(`
          <div class="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-3">
            <div class="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span class="text-xs font-mono text-[#30d158] font-bold uppercase tracking-wider">${pathKey} (${v.length} elementi)</span>
            </div>
            <div class="space-y-3">
              ${v.map((item, idx) => {
                if (typeof item === 'object' && item !== null) {
                  const subFields = Object.entries(item).map(([subK, subV]) => {
                    const strVal = String(subV || '');
                    const isTextarea = strVal.length > 55 || subK.toLowerCase().includes('desc') || subK.toLowerCase().includes('text') || subK.toLowerCase().includes('message') || subK.toLowerCase().includes('note');
                    const fullSubPath = `${pathKey}.${idx}.${subK}`;
                    const showTranslate = typeof subV === 'string' && strVal.trim().length > 2 && !subK.toLowerCase().includes('phone') && !subK.toLowerCase().includes('url') && !subK.toLowerCase().includes('hours') && !subK.toLowerCase().includes('time') && !subK.toLowerCase().includes('address') && !subK.toLowerCase().includes('tagcolor');
                    return `
                    <div>
                      <div class="flex items-center justify-between gap-1.5">
                        <label class="block text-[11px] font-mono text-[#86868b]">${subK}</label>
                        ${showTranslate ? `
                          <button type="button" data-translate-path="${fullSubPath}" class="btn-cms-translate text-[9px] px-1.5 py-0.5 rounded bg-[#30d158]/10 text-[#30d158] hover:bg-[#30d158]/20 border border-[#30d158]/15 transition flex items-center gap-0.5 cursor-pointer">
                            ✨ Traduci
                          </button>
                        ` : ''}
                      </div>
                      ${isTextarea ? `
                        <textarea data-field-path="${fullSubPath}" rows="3" class="cms-field-input w-full text-xs p-2 rounded-lg resize-y bg-[#1c1c1e] text-white border border-white/10 mt-0.5">${strVal}</textarea>
                      ` : `
                        <input type="text" data-field-path="${fullSubPath}" value="${strVal.replace(/"/g, '&quot;')}" class="cms-field-input w-full text-xs p-2 rounded-lg bg-[#1c1c1e] text-white border border-white/10 mt-0.5" />
                      `}
                    </div>
                    `;
                  }).join('');
                  return `
                    <div class="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <span class="text-[10px] font-mono text-[#ff9f0a] font-semibold">Elemento #${idx + 1}</span>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        ${subFields}
                      </div>
                    </div>
                  `;
                } else {
                  const strVal = String(item || '');
                  const fullSubPath = `${pathKey}.${idx}`;
                  return `
                    <div class="p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg flex items-center gap-2 mt-1">
                      <input type="text" data-field-path="${fullSubPath}" value="${strVal.replace(/"/g, '&quot;')}" class="cms-field-input w-full text-xs p-2 rounded-lg bg-[#1c1c1e] text-white border border-white/10" />
                      <button type="button" data-translate-path="${fullSubPath}" class="btn-cms-translate text-[9px] px-2 py-2 rounded bg-[#30d158]/10 text-[#30d158] hover:bg-[#30d158]/20 border border-[#30d158]/15 transition shrink-0 cursor-pointer">✨ Traduci</button>
                    </div>
                  `;
                }
              }).join('')}
            </div>
          </div>
        `);
      } else if (typeof v === 'object') {
        walkFields(pathKey, v);
      }
    }
  }

  walkFields('', sectionData);
  container.innerHTML = fieldItems.join('');

  // Attach live input listeners for real-time preview
  container.querySelectorAll('.cms-field-input').forEach(input => {
    input.addEventListener('input', () => {
      const fieldPath = input.getAttribute('data-field-path');
      if (!cmsContentData[currentCmsLang]) cmsContentData[currentCmsLang] = {};
      if (!cmsContentData[currentCmsLang][sectionKey]) cmsContentData[currentCmsLang][sectionKey] = {};
      setDeepValue(cmsContentData[currentCmsLang][sectionKey], fieldPath, input.value);
      updateCmsPreview();
    });
  });

  // Attach translation buttons listeners
  container.querySelectorAll('.btn-cms-translate').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const fieldPath = btn.getAttribute('data-translate-path');
      const text = getDeepValue(cmsContentData[currentCmsLang]?.[sectionKey], fieldPath);
      
      if (!text || String(text).trim().length < 2) {
        showToast('Inserisci del testo prima di richiedere la traduzione.', 'error');
        return;
      }

      btn.disabled = true;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '⚡ Traduzione...';

      showToast('Traduzione in corso con Google AI...', 'loading');

      try {
        const res = await fetch(`${API_BASE_URL}/api/cms/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: String(text), sourceLang: currentCmsLang })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        if (!json.success || !json.translations) {
          throw new Error(json.error || 'Errore risposta traduzione.');
        }

        const translationsDict = json.translations;
        for (const [lang, translatedText] of Object.entries(translationsDict)) {
          if (!cmsContentData[lang]) cmsContentData[lang] = {};
          if (!cmsContentData[lang][sectionKey]) cmsContentData[lang][sectionKey] = {};
          setDeepValue(cmsContentData[lang][sectionKey], fieldPath, translatedText);
        }

        showToast('Tradotto in tutte le lingue! Salva per confermare.', 'success');
      } catch (err) {
        console.error(err);
        showToast('Errore durante la traduzione automatica.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
        renderCmsFields();
      }
    });
  });

  updateCmsPreview();
}

function renderGlobalCmsSearch(query) {
  const container = document.getElementById('cmsFieldsContainer');
  if (!container) return;

  const q = query.toLowerCase().trim();
  const matchedFields = [];

  // Loop through ALL sections of the active language
  const langData = cmsContentData[currentCmsLang] || {};
  for (const [sectionKey, sectionData] of Object.entries(langData)) {
    if (typeof sectionData !== 'object' || sectionData === null) continue;

    function searchFields(prefix, obj) {
      for (const [k, v] of Object.entries(obj)) {
        const pathKey = prefix ? `${prefix}.${k}` : k;
        if (v === null || v === undefined) continue;

        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          const strVal = String(v);
          if (pathKey.toLowerCase().includes(q) || strVal.toLowerCase().includes(q)) {
            matchedFields.push({ sectionKey, pathKey, value: strVal, type: 'simple' });
          }
        } else if (Array.isArray(v)) {
          v.forEach((item, idx) => {
            if (typeof item === 'object' && item !== null) {
              for (const [subK, subV] of Object.entries(item)) {
                const strVal = String(subV || '');
                const fullPath = `${pathKey}.${idx}.${subK}`;
                if (fullPath.toLowerCase().includes(q) || strVal.toLowerCase().includes(q)) {
                  matchedFields.push({ sectionKey, pathKey: fullPath, value: strVal, type: 'array-object', subK, idx, arrayKey: pathKey });
                }
              }
            } else {
              const strVal = String(item || '');
              const fullPath = `${pathKey}.${idx}`;
              if (fullPath.toLowerCase().includes(q) || strVal.toLowerCase().includes(q)) {
                matchedFields.push({ sectionKey, pathKey: fullPath, value: strVal, type: 'array-simple', idx, arrayKey: pathKey });
              }
            }
          });
        } else if (typeof v === 'object') {
          searchFields(pathKey, v);
        }
      }
    }

    searchFields('', sectionData);
  }

  if (matchedFields.length === 0) {
    container.innerHTML = `
      <div class="apple-card p-6 text-center text-xs text-[#86868b]">
        Nessun campo trovato corrispondente alla ricerca "${query}" nella lingua corrente.
      </div>
    `;
    return;
  }

  const fieldItems = [];
  fieldItems.push(`
    <div class="p-3 rounded-xl bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 text-[#ff9f0a] text-xs font-semibold mb-3">
      🔍 Trovati ${matchedFields.length} risultati globali per "${query}"
    </div>
  `);

  matchedFields.forEach(item => {
    const isMultiline = item.value.length > 55 || item.value.includes('\n');
    const isSubKDesc = item.subK && (item.subK.toLowerCase().includes('desc') || item.subK.toLowerCase().includes('text') || item.subK.toLowerCase().includes('message') || item.subK.toLowerCase().includes('note'));
    const isTextarea = isMultiline || isSubKDesc;
    const showTranslate = !item.pathKey.toLowerCase().includes('phone') && !item.pathKey.toLowerCase().includes('url') && !item.pathKey.toLowerCase().includes('email') && !item.pathKey.toLowerCase().includes('color') && !item.pathKey.toLowerCase().includes('font');

    fieldItems.push(`
      <div class="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5" data-global-section="${item.sectionKey}">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded-full bg-white/[0.08] text-white text-[10px] font-mono border border-white/[0.1]">${item.sectionKey.toUpperCase()}</span>
            <label class="block text-xs font-mono text-[#ff9f0a] font-semibold">${item.pathKey}</label>
          </div>
          ${showTranslate ? `
            <button type="button" data-global-section="${item.sectionKey}" data-translate-path="${item.pathKey}" class="btn-cms-translate text-[9px] px-2 py-0.5 rounded bg-[#30d158]/10 text-[#30d158] hover:bg-[#30d158]/20 border border-[#30d158]/25 transition flex items-center gap-0.5 cursor-pointer">
              ✨ Traduci
            </button>
          ` : ''}
        </div>
        ${isTextarea ? `
          <textarea data-global-section="${item.sectionKey}" data-field-path="${item.pathKey}" rows="3" class="cms-field-input w-full text-xs p-2.5 rounded-xl resize-y bg-[#1c1c1e] text-white border border-white/10">${item.value}</textarea>
        ` : `
          <input type="text" data-global-section="${item.sectionKey}" data-field-path="${item.pathKey}" value="${item.value.replace(/"/g, '&quot;')}" class="cms-field-input w-full text-xs p-2.5 rounded-xl bg-[#1c1c1e] text-white border border-white/10" />
        `}
      </div>
    `);
  });

  container.innerHTML = fieldItems.join('');

  // Attach live input listeners for real-time preview (and updating global state)
  container.querySelectorAll('.cms-field-input').forEach(input => {
    input.addEventListener('input', () => {
      const fieldPath = input.getAttribute('data-field-path');
      const sKey = input.getAttribute('data-global-section');
      if (!cmsContentData[currentCmsLang]) cmsContentData[currentCmsLang] = {};
      if (!cmsContentData[currentCmsLang][sKey]) cmsContentData[currentCmsLang][sKey] = {};
      setDeepValue(cmsContentData[currentCmsLang][sKey], fieldPath, input.value);
      updateCmsPreview();
    });
  });

  // Attach translation buttons listeners for global search results
  container.querySelectorAll('.btn-cms-translate').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const fieldPath = btn.getAttribute('data-translate-path');
      const sKey = btn.getAttribute('data-global-section');
      const text = getDeepValue(cmsContentData[currentCmsLang]?.[sKey], fieldPath);
      
      if (!text || String(text).trim().length < 2) {
        showToast('Inserisci del testo prima di richiedere la traduzione.', 'error');
        return;
      }

      btn.disabled = true;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '⚡ Traduzione...';

      showToast('Traduzione in corso con Google AI...', 'loading');

      try {
        const res = await fetch(`${API_BASE_URL}/api/cms/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: String(text), sourceLang: currentCmsLang })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        if (!json.success || !json.translations) {
          throw new Error(json.error || 'Errore risposta traduzione.');
        }

        const translationsDict = json.translations;
        for (const [lang, translatedText] of Object.entries(translationsDict)) {
          if (!cmsContentData[lang]) cmsContentData[lang] = {};
          if (!cmsContentData[lang][sKey]) cmsContentData[lang][sKey] = {};
          setDeepValue(cmsContentData[lang][sKey], fieldPath, translatedText);
        }

        showToast('Tradotto in tutte le lingue! Salva per confermare.', 'success');
      } catch (err) {
        console.error(err);
        showToast('Errore durante la traduzione automatica.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
        renderGlobalCmsSearch(query); // re-render search results to show update
      }
    });
  });
}


function updateCmsPreview() {
  const preview = document.getElementById('cmsPreview');
  if (!preview) return;

  const { data: sectionData } = getActiveSectionData();
  const entries = Object.entries(sectionData);

  if (entries.length === 0) {
    preview.innerHTML = '<p class="text-xs text-[#86868b]">Nessun contenuto presente.</p>';
    return;
  }

  preview.innerHTML = entries.map(([k, v]) => {
    let displayVal = '';
    if (typeof v === 'string' || typeof v === 'number') {
      displayVal = `<p class="text-xs text-white mt-0.5 whitespace-pre-wrap">${v || '<em class="text-[#86868b]">Vuoto</em>'}</p>`;
    } else if (Array.isArray(v)) {
      displayVal = `
        <div class="space-y-1.5 mt-1">
          ${v.slice(0, 4).map((it, i) => {
            const label = it && typeof it === 'object' ? (it.title || it.name || JSON.stringify(it)) : String(it);
            return `<div class="text-[11px] text-white/90 p-1.5 rounded bg-white/[0.03] border border-white/[0.04]">• ${label}</div>`;
          }).join('')}
          ${v.length > 4 ? `<span class="text-[10px] text-[#86868b]">+ altri ${v.length - 4} elementi...</span>` : ''}
        </div>
      `;
    } else if (typeof v === 'object' && v !== null) {
      displayVal = `<div class="text-[11px] text-[#86868b] mt-0.5 font-mono">${Object.keys(v).length} proprietà configurate</div>`;
    }
    return `
      <div class="border-b border-white/[0.06] pb-2 last:border-0">
        <span class="text-[10px] uppercase font-mono text-[#ff9f0a] tracking-wider block">${k}</span>
        ${displayVal}
      </div>
    `;
  }).join('');
}

async function handleSaveCms() {
  showToast('Salvataggio modifiche testi CMS...', 'loading');

  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: cmsContentData, content: cmsContentData })
    });

    if (res.ok) {
      showToast('Modifiche CMS salvate e visibili agli ospiti!', 'success');
      const indicator = document.getElementById('cmsSaveIndicator');
      if (indicator) indicator.textContent = `Ultimo salvataggio: ${new Date().toLocaleTimeString()}`;
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    showToast(`Errore salvataggio CMS: ${err.message}`, 'error');
  }
}

async function handleResetCms() {
  if (!confirm('Sei sicuro di voler ripristinare tutti i testi alle impostazioni originali di fabbrica? Le modifiche personalizzate andranno perse.')) {
    return;
  }

  showToast('Ripristino testi originali in corso...', 'loading');

  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/reset`, { method: 'POST' });
    if (res.ok) {
      showToast('Testi di fabbrica ripristinati!', 'success');
      loadCmsData();
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    showToast(`Errore ripristino: ${err.message}`, 'error');
  }
}

// ============================================================
// MEDIA & PHOTO GALLERY MANAGER
// ============================================================
function setupMedia() {
  const btnRefreshMedia = document.getElementById('btnRefreshMedia');
  if (btnRefreshMedia) {
    btnRefreshMedia.addEventListener('click', () => {
      showToast('Ricarica galleria foto...', 'info');
      loadMediaData();
    });
  }

  const btnResetAllPhotos = document.getElementById('btnResetAllPhotos');
  if (btnResetAllPhotos) {
    btnResetAllPhotos.addEventListener('click', handleResetAllPhotos);
  }
}

async function loadMediaData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/media`);
    if (res.ok) {
      const json = await res.json();
      cmsMediaData = json.media || json.data || json || {};
    }
    renderMediaCatalog();
  } catch (err) {
    console.warn('Media fetch error:', err);
    renderMediaCatalog();
  }
}

function getDefaultPhotoUrl(key) {
  const defaults = {
    hostAvatar: '/uploads/host.jpg',
    heroLiving: '/uploads/living.jpg',
    checkInCover: '/uploads/lock.jpg',
    locationCover: '/uploads/location.jpg',
    servicesCover: '/uploads/services.jpg',
    rulesCover: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    restaurantsCover: '/uploads/restaurant.jpg',
    barsCover: '/uploads/bars.jpg',
    shoppingCover: '/uploads/bottega.jpg',
    activitiesCover: '/uploads/activities.jpg',
    transportCover: '/uploads/train.jpg',
    infoCover: '/uploads/info.jpg',
    emergencyCover: '/uploads/emergency.jpg',
    checkOutCover: 'https://media.istockphoto.com/id/2219309082/it/foto/persona-che-esce-di-casa-con-la-valigia-porta-esistente-del-viaggiatore-con-bagagli.webp?a=1&b=1&s=612x612&w=0&k=20&c=dzLdna5DxchqxEUdEZApP6xKCVUfsBbhVQfEI5u0nB8=',
    bedroom: '/uploads/bedroom.jpg',
    kitchen: '/uploads/kitchen.jpg',
    bathroom: '/uploads/bathroom.jpg',
    balcony: '/uploads/lock.jpg',
    view: '/uploads/view.jpg',
    wifiQr: '/uploads/qrcode.png'
  };
  return defaults[key] || '/uploads/living.jpg';
}

function renderMediaCatalog() {
  const container = document.getElementById('mediaCardsGrid');
  if (!container) return;

  container.innerHTML = MEDIA_CATALOG.map(item => {
    const currentUrl = (cmsMediaData && cmsMediaData[item.key]) || getDefaultPhotoUrl(item.key);
    const fallbackUrl = getDefaultPhotoUrl(item.key);

    return `
      <div class="apple-card p-4 space-y-3 flex flex-col justify-between" id="media-card-${item.key}">
        <div>
          <!-- Thumbnail & Preview -->
          <div class="relative w-full h-36 rounded-xl overflow-hidden bg-black/60 border border-white/[0.08] mb-3 group">
            <img 
              src="${currentUrl}" 
              alt="${item.title}" 
              id="img-preview-${item.key}" 
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              onerror="if (this.src !== '${fallbackUrl}') { this.src = '${fallbackUrl}'; } else { this.onerror=null; this.src = '/uploads/living.jpg'; }"
            />
            <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/70 border border-white/10">
              ${item.aspectRatio}
            </span>
          </div>

          <h4 class="font-semibold text-xs text-white tracking-tight">${item.title}</h4>
          <p class="text-[11px] text-[#86868b] mt-0.5 line-clamp-2">${item.desc}</p>
        </div>

        <!-- Actions -->
        <div class="space-y-2 pt-2 border-t border-white/[0.06]">
          <div class="flex items-center gap-2">
            <!-- Upload Button (Hidden Input) -->
            <input type="file" id="file-${item.key}" accept="image/*" class="hidden" onchange="handlePhotoUpload('${item.key}', this)" />
            
            <button type="button" onclick="document.getElementById('file-${item.key}').click()" class="btn-apple-secondary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
              <i data-lucide="upload" class="w-3.5 h-3.5 text-[#30d158]"></i>
              <span>Carica Foto</span>
            </button>

            <!-- Reset Photo Button -->
            <button type="button" onclick="handleResetSinglePhoto('${item.key}')" class="p-2 rounded-xl bg-white/[0.06] hover:bg-[#ff453a]/15 text-[#86868b] hover:text-[#ff453a] border border-white/[0.08] transition cursor-pointer" title="Ripristina default">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  renderIcons();
}

window.handlePhotoUpload = async function(key, inputEl) {
  const file = inputEl.files?.[0];
  if (!file) return;

  // Validate size (< 15MB)
  if (file.size > 15 * 1024 * 1024) {
    showToast('Immagine troppo pesante (massimo 15MB)', 'error');
    return;
  }

  showToast(`Caricamento immagine per ${key}...`, 'loading');

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result;

    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/upload-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoKey: key,
          key: key,
          base64DataUrl: base64,
          fileBase64: base64,
          filename: file.name
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Foto aggiornata con successo!', 'success');
        if (!cmsMediaData) cmsMediaData = {};
        cmsMediaData[key] = data.url;

        const img = document.getElementById(`img-preview-${key}`);
        if (img) img.src = `${data.url}?t=${Date.now()}`;
      } else {
        throw new Error(data.error || 'Errore di salvataggio foto');
      }
    } catch (err) {
      showToast(`Errore caricamento: ${err.message}`, 'error');
    }
  };
  reader.readAsDataURL(file);
};

window.handleResetSinglePhoto = async function(key) {
  showToast(`Ripristino foto ${key}...`, 'loading');

  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/reset-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoKey: key, key: key })
    });

    if (res.ok) {
      showToast('Foto ripristinata ai valori originali', 'success');
      if (cmsMediaData) delete cmsMediaData[key];
      const img = document.getElementById(`img-preview-${key}`);
      if (img) img.src = getDefaultPhotoUrl(key);
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    showToast(`Errore ripristino: ${err.message}`, 'error');
  }
};

async function handleResetAllPhotos() {
  if (!confirm('Sei sicuro di voler ripristinare tutte le 18 foto alle immagini originali di fabbrica?')) {
    return;
  }

  showToast('Ripristino galleria foto in corso...', 'loading');

  for (const item of MEDIA_CATALOG) {
    try {
      await fetch(`${API_BASE_URL}/api/cms/reset-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoKey: item.key, key: item.key })
      });
    } catch (e) {}
  }

  cmsMediaData = {};
  loadMediaData();
  showToast('Tutte le foto sono state ripristinate!', 'success');
}

// ============================================================
// REAL-TIME LOCK STATUS TRACKING (STANDALONE PORTAL)
// ============================================================
async function fetchLockStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/lock/status`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.lockStatus) {
      updateStandaloneLockUI(data.lockStatus);
    }
  } catch (err) {
    console.warn('Error fetching lock status:', err);
  }
}

function updateStandaloneLockUI(lockState) {
  const container = document.getElementById('standaloneLockIconContainer');
  const icon = document.getElementById('standaloneLockIcon');
  const dot = document.getElementById('standaloneLockDot');
  const text = document.getElementById('standaloneLockStateText');
  const desc = document.getElementById('standaloneLockDescText');
  const time = document.getElementById('standaloneLockTime');
  const metrics = document.getElementById('standaloneLockMetrics');
  const battery = document.getElementById('standaloneLockBatteryText');
  const signal = document.getElementById('standaloneLockSignalText');

  if (!text) return;

  if (lockState.state === 'closed') {
    if (container) container.className = 'w-12 h-12 rounded-xl flex items-center justify-center relative shrink-0 shadow-sm border border-[#30d158]/20 bg-[#30d158]/10 text-[#30d158]';
    if (icon) {
      icon.setAttribute('data-lucide', 'lock');
      icon.className = 'w-5 h-5 text-[#30d158]';
    }
    if (dot) dot.className = 'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1c1c1e] bg-[#30d158]';
    text.textContent = 'Chiusa';
    if (desc) desc.textContent = 'Tutti gli accessi sono protetti.';
  } else if (lockState.state === 'open') {
    if (container) container.className = 'w-12 h-12 rounded-xl flex items-center justify-center relative shrink-0 shadow-sm border border-[#ff9f0a]/20 bg-[#ff9f0a]/10 text-[#ff9f0a]';
    if (icon) {
      icon.setAttribute('data-lucide', 'unlock');
      icon.className = 'w-5 h-5 text-[#ff9f0a]';
    }
    if (dot) dot.className = 'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1c1c1e] bg-[#ff9f0a]';
    text.textContent = 'Aperta / Socchiusa';
    if (desc) desc.textContent = 'Attenzione: porta socchiusa.';
  } else {
    if (container) container.className = 'w-12 h-12 rounded-xl flex items-center justify-center relative shrink-0 shadow-sm border border-white/10 bg-white/[0.04] text-neutral-400';
    if (icon) {
      icon.setAttribute('data-lucide', 'wifi-off');
      icon.className = 'w-5 h-5 text-neutral-400';
    }
    if (dot) dot.className = 'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1c1c1e] bg-zinc-400';
    text.textContent = 'Offline';
    if (desc) desc.textContent = 'Modulo Wi-Fi non raggiungibile.';
  }

  if (lockState.lastUpdatedAt) {
    if (time) {
      time.classList.remove('hidden');
      time.textContent = `Aggiornato: ${new Date(lockState.lastUpdatedAt).toLocaleTimeString()}`;
    }
  }

  if (lockState.state !== 'offline') {
    if (metrics) metrics.classList.remove('hidden');
    if (battery) battery.textContent = `${lockState.battery ?? 100}%`;
    if (signal) signal.textContent = `${lockState.signalStrength ?? -50} dBm`;
  } else {
    if (metrics) metrics.classList.add('hidden');
  }

  renderIcons();
}

async function handleStandaloneSimulateLockState(simState) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/webhook/lock-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: simState,
        battery: simState === 'offline' ? undefined : Math.floor(75 + Math.random() * 20),
        signal: simState === 'offline' ? undefined : -Math.floor(55 + Math.random() * 20)
      })
    });
    const data = await res.json();
    if (data.success && data.lockStatus) {
      updateStandaloneLockUI(data.lockStatus);
      showToast(`Simulazione stato ${simState.toUpperCase()}`, 'success');
    }
  } catch (err) {
    console.warn('Error simulating lock status:', err);
  }
}

// ============================================================
// SCHEDULED AUTOMATED MESSAGING MANAGEMENT
// ============================================================
window.fetchAndRenderScheduledMessages = async function() {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  container.innerHTML = '<div class="text-center py-12 text-xs text-[#86868b]">Rilevamento messaggi programmati in corso...</div>';

  try {
    const res = await fetch(`${API_BASE_URL}/api/scheduled-messages`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (data.success && Array.isArray(data.messages)) {
      renderScheduledMessages(data.messages);
    } else {
      throw new Error('Formato risposta non valido');
    }
  } catch (err) {
    container.innerHTML = `
      <div class="p-4 rounded-xl bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20 text-xs font-mono text-center">
        Errore caricamento messaggi: ${err.message}
      </div>
    `;
  }
};

function renderScheduledMessages(messages) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  const statsContainer = document.getElementById('messagesStatsContainer');
  if (statsContainer) {
    if (messages.length === 0) {
      statsContainer.innerHTML = '';
    } else {
      const total = messages.length;
      const sent = messages.filter(m => m.status === 'sent').length;
      const pending = messages.filter(m => m.status === 'pending' || m.status === 'sending').length;
      const failed = messages.filter(m => m.status === 'failed').length;
      const progressPercent = total > 0 ? Math.round((sent / total) * 100) : 0;

      statsContainer.innerHTML = `
        <div class="apple-card p-4 flex flex-col justify-between">
          <span class="text-xs text-[#86868b] font-medium">Totale Messaggi</span>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-semibold text-white tracking-tight">${total}</span>
            <i data-lucide="message-square" class="w-5 h-5 text-[#86868b] opacity-60"></i>
          </div>
        </div>
        <div class="apple-card p-4 flex flex-col justify-between">
          <span class="text-xs text-[#86868b] font-medium">Spediti con Successo</span>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-semibold text-[#30d158] tracking-tight">${sent}</span>
            <i data-lucide="check-circle" class="w-5 h-5 text-[#30d158] opacity-80"></i>
          </div>
        </div>
        <div class="apple-card p-4 flex flex-col justify-between">
          <span class="text-xs text-[#86868b] font-medium">In Coda / Errore</span>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-semibold text-[#0a84ff] tracking-tight">${pending}</span>
            <span class="text-xs ${failed > 0 ? 'text-[#ff453a] font-bold' : 'text-[#86868b]'}">${failed} falliti</span>
          </div>
        </div>
        <div class="apple-card p-4 flex flex-col justify-between">
          <span class="text-xs text-[#86868b] font-medium">Avanzamento Inviati</span>
          <div class="mt-2">
            <div class="flex items-baseline justify-between mb-1.5">
              <span class="text-sm font-semibold text-white">${progressPercent}%</span>
              <span class="text-[10px] text-[#86868b]">${sent}/${total} inviati</span>
            </div>
            <div class="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <div class="bg-[#30d158] h-1.5 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-xs text-[#86868b] space-y-2">
        <i data-lucide="message-square" class="w-8 h-8 text-[#86868b] mx-auto opacity-50"></i>
        <p>Nessun messaggio automatico programmato o inviato nel sistema.</p>
        <p class="text-[10px]">I messaggi vengono generati automaticamente alla creazione di un nuovo Pass VIP.</p>
      </div>
    `;
    renderIcons();
    return;
  }

  container.innerHTML = messages.map((msg, index) => {
    const isSent = msg.status === 'sent';
    const isFailed = msg.status === 'failed';
    const isSending = msg.status === 'sending';
    const isPending = msg.status === 'pending';

    let statusPillClass = 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20';
    let statusLabel = 'In Coda';
    if (isSent) {
      statusPillClass = 'bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20';
      statusLabel = 'Inviato';
    } else if (isFailed) {
      statusPillClass = 'bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20';
      statusLabel = 'Fallito';
    } else if (isSending) {
      statusPillClass = 'bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/20 animate-pulse';
      statusLabel = 'Invio in corso...';
    }

    const typeLabels = {
      welcome: 'Benvenuto',
      pre_checkin: 'Check-in (3gg prima)',
      courtesy: 'Verifica Cortesia',
      checkout: 'Check-out (sera prima)',
      custom: 'Personalizzato'
    };

    const typeLabel = typeLabels[msg.triggerType] || msg.triggerType;
    const formattedDate = new Date(msg.scheduledAt).toLocaleString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const sentAtLabel = msg.sentAt ? `• Spedito il: ${new Date(msg.sentAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : '';

    return `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition">
        <div class="space-y-1.5 min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusPillClass}">${statusLabel}</span>
            <span class="px-2 py-0.5 rounded-full bg-white/[0.06] text-white text-[10px] font-mono border border-white/[0.08]">${typeLabel}</span>
            <span class="text-xs text-[#86868b]">${msg.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</span>
            <span class="text-xs text-[#86868b] font-mono">${formattedDate} ${sentAtLabel}</span>
          </div>

          <div class="space-y-1">
            <h4 class="font-bold text-sm text-white flex items-center gap-1.5">
              <span>Destinatario: ${msg.guestName}</span>
              <span class="font-mono text-xs text-[#86868b] font-normal">(${msg.phone})</span>
            </h4>
            <div class="text-xs text-[#86868b] bg-black/30 p-2.5 rounded-xl border border-white/[0.04] font-mono whitespace-pre-wrap max-h-[140px] overflow-y-auto no-scrollbar">${msg.messageText}</div>
            ${msg.error ? `<p class="text-[11px] text-[#ff453a] font-semibold">Errore riscontrato: ${msg.error}</p>` : ''}
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
          <a href="https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg.messageText)}" target="_blank" class="btn-apple-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-decoration-none text-[#30d158] hover:text-[#30d158]" style="text-decoration: none;">
            <i data-lucide="message-circle" class="w-3.5 h-3.5 text-[#30d158]"></i>
            <span>WhatsApp</span>
          </a>

          ${!isSent ? `
            <button onclick="sendScheduledMessageNow('${msg.id}')" class="btn-apple-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="send" class="w-3.5 h-3.5 text-[#30d158]"></i>
              <span>${isFailed ? 'Riprova API' : 'Invia API'}</span>
            </button>
          ` : ''}

          <button onclick="deleteScheduledMessage('${msg.id}')" class="p-2 rounded-xl bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] border border-[#ff453a]/20 transition cursor-pointer" title="Cancella messaggio programmato">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  renderIcons();
}

window.sendScheduledMessageNow = async function(id) {
  showToast('Inviando messaggio immediato...', 'loading');
  try {
    const res = await fetch(`${API_BASE_URL}/api/scheduled-messages/${id}/send`, { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Messaggio inviato con successo!', 'success');
      fetchAndRenderScheduledMessages();
    } else {
      throw new Error(data.error || 'Invio non riuscito');
    }
  } catch (err) {
    showToast(`Errore invio: ${err.message}`, 'error');
  }
};

window.deleteScheduledMessage = async function(id) {
  if (!confirm('Sei sicuro di voler cancellare questo messaggio programmato dalla coda?')) {
    return;
  }
  showToast('Cancellazione messaggio...', 'loading');
  try {
    const res = await fetch(`${API_BASE_URL}/api/scheduled-messages/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Messaggio programmato rimosso con successo', 'success');
      fetchAndRenderScheduledMessages();
    } else {
      throw new Error(data.error || 'Cancellazione fallita');
    }
  } catch (err) {
    showToast(`Errore: ${err.message}`, 'error');
  }
};


// ============================================================
// ALLOGGIATI WEB (QUESTURA DECLARATION GENERATION)
// ============================================================

const ALLOGGIATI_COMUNI = [
  { name: 'Morbegno (SO)', code: '101014045', province: 'SO' },
  { name: 'Sondrio (SO)', code: '101014061', province: 'SO' },
  { name: 'Cosio Valtellino (SO)', code: '101014024', province: 'SO' },
  { name: 'Talamona (SO)', code: '101014063', province: 'SO' },
  { name: 'Ardenno (SO)', code: '101014005', province: 'SO' },
  { name: 'Delebio (SO)', code: '101014026', province: 'SO' },
  { name: 'Colico (LC)', code: '101097023', province: 'LC' },
  { name: 'Chiavenna (SO)', code: '101014018', province: 'SO' },
  { name: 'Tirano (SO)', code: '101014066', province: 'SO' },
  { name: 'Bormio (SO)', code: '101014009', province: 'SO' },
  { name: 'Milano (MI)', code: '101015146', province: 'MI' },
  { name: 'Roma (RM)', code: '101058091', province: 'RM' },
  { name: 'Lecco (LC)', code: '101097042', province: 'LC' },
  { name: 'Bergamo (BG)', code: '101016024', province: 'BG' },
  { name: 'Monza (MB)', code: '101108055', province: 'MB' },
  { name: 'Como (CO)', code: '101013075', province: 'CO' },
];

const ALLOGGIATI_COUNTRIES = [
  { name: 'ITALIA', code: '100000100' },
  { name: 'GERMANIA', code: '100000216' },
  { name: 'SVIZZERA', code: '100000244' },
  { name: 'REGNO UNITO', code: '100000219' },
  { name: 'FRANCIA', code: '100000214' },
  { name: 'STATI UNITI (USA)', code: '100000311' },
  { name: 'PAESI BASSI', code: '100000231' },
  { name: 'SPAGNA', code: '100000242' },
  { name: 'BELGIO', code: '100000204' },
  { name: 'AUSTRIA', code: '100000203' },
  { name: 'POLONIA', code: '100000233' },
  { name: 'REPUBBLICA CECA', code: '100000248' },
  { name: 'CANADA', code: '100000302' },
  { name: 'AUSTRALIA', code: '100000501' },
  { name: 'CINA', code: '100000407' },
];

let selectedAlloggiatiPass = null;
let alloggiatiGuestsState = [];

function normalizeTextForAlloggiati(val) {
  if (!val) return '';
  return val
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .trim();
}

function convertDateToItalian(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function mapNatToAlloggiatiCode(natStr) {
  const norm = (natStr || '').trim().toUpperCase();
  if (!norm) return '100000100';
  if (norm.includes('ITA')) return '100000100';
  if (norm.includes('GERM') || norm.includes('DEU') || norm.includes('TED')) return '100000216';
  if (norm.includes('SVIZ') || norm.includes('SWIT') || norm.includes('CHE')) return '100000244';
  if (norm.includes('FRAN') || norm.includes('FRA')) return '100000214';
  if (norm.includes('REGN') || norm.includes('UNIT') || norm.includes('GBR') || norm.includes('UK')) return '100000219';
  if (norm.includes('SPAG') || norm.includes('SPAI') || norm.includes('ESP')) return '100000242';
  if (norm.includes('PAES') || norm.includes('OLAN') || norm.includes('NETH')) return '100000231';
  if (norm.includes('AUSTRI') || norm.includes('AUT')) return '100000203';
  if (norm.includes('BELG') || norm.includes('BEL')) return '100000204';
  if (norm.includes('STAT') || norm.includes('USA') || norm.includes('AMER')) return '100000311';
  return '100000100';
}


window.renderAlloggiatiTab = function() {
  const container = document.getElementById('alloggiati-passes-container');
  if (!container) return;

  if (activePasses.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-xs text-[#86868b]">
        Nessuna prenotazione o pass ospite presente in memoria.
      </div>
    `;
    return;
  }

  container.innerHTML = activePasses.map(pass => {
    const uploadedCount = pass.documentsData ? pass.documentsData.length : 0;
    const hasDocs = pass.documentsUploaded || uploadedCount > 0;
    const badgeHtml = hasDocs 
      ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-[#30d158] bg-[#30d158]/10 border border-[#30d158]/20 px-2.5 py-0.5 rounded-full">
           <i data-lucide="check" class="w-3 h-3"></i> Documenti (${uploadedCount})
         </span>`
      : `<span class="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868b] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
           <i data-lucide="info" class="w-3 h-3"></i> Da caricare
         </span>`;

    return `
      <div 
        onclick="selectAlloggiatiPass('${pass.id}')"
        class="apple-card p-4 hover:border-[#30d158]/40 hover:shadow-xs transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white group-hover:text-[#30d158] transition">
              ${pass.guestName} ${pass.guestSurname}
            </span>
            ${pass.bookingRef ? `
              <span class="text-[10px] font-mono bg-white/5 text-[#86868b] border border-white/10 px-1.5 py-0.5 rounded">
                ${pass.bookingRef}
              </span>
            ` : ''}
          </div>
          <div class="text-xs text-[#86868b] flex flex-wrap items-center gap-3 font-mono">
            <span>Check-in: ${convertDateToItalian(pass.checkInDate)}</span>
            <span>•</span>
            <span>Check-out: ${convertDateToItalian(pass.checkOutDate)}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          ${badgeHtml}
          <button class="py-1.5 px-3 rounded-lg bg-[#2c2c2e] group-hover:bg-[#30d158] group-hover:text-black text-white font-bold text-xs transition cursor-pointer">
            Seleziona
          </button>
        </div>
      </div>
    `;
  }).join('');

  renderIcons();
};

window.showAlloggiatiList = function() {
  document.getElementById('alloggiati-list-view').classList.remove('hidden');
  document.getElementById('alloggiati-detail-view').classList.add('hidden');
  window.renderAlloggiatiTab();
};

window.selectAlloggiatiPass = function(passId) {
  const pass = activePasses.find(p => p.id === passId);
  if (!pass) return;

  selectedAlloggiatiPass = pass;
  
  // Toggle Views
  document.getElementById('alloggiati-list-view').classList.add('hidden');
  document.getElementById('alloggiati-detail-view').classList.remove('hidden');
  document.getElementById('alloggiati-feedback').classList.add('hidden');

  // Fill booking header info
  document.getElementById('alloggiati-booking-ref').textContent = `Rif: ${pass.bookingRef || 'N/A'}`;
  document.getElementById('alloggiati-guest-title').textContent = `${pass.guestName} ${pass.guestSurname}`;
  document.getElementById('alloggiati-checkin-val').textContent = convertDateToItalian(pass.checkInDate);
  document.getElementById('alloggiati-checkout-val').textContent = convertDateToItalian(pass.checkOutDate);

  // Set default stay days
  let days = 1;
  if (pass.checkInDate && pass.checkOutDate) {
    const diff = new Date(pass.checkOutDate).getTime() - new Date(pass.checkInDate).getTime();
    days = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }
  document.getElementById('alloggiati-stay-days').value = days;

  // Map guests state
  if (pass.documentsData && pass.documentsData.length > 0) {
    alloggiatiGuestsState = pass.documentsData.map((d, index) => ({
      tipoAlloggiato: d.tipoAlloggiato || (index === 0 ? '16' : '17'),
      name: d.name || '',
      surname: d.surname || '',
      gender: d.gender || 'M',
      birthDate: d.birthDate || '',
      citizenshipCode: d.citizenshipCode || mapNatToAlloggiatiCode(d.nationality),
      birthPlaceCode: d.birthPlaceCode || (d.birthPlace && d.birthPlace.length === 9 ? d.birthPlace : '101014045'),
      birthPlaceProvince: d.birthPlaceProvince || 'SO',
      documentType: d.documentType === 'passaporto' ? 'PASSA' : d.documentType === 'patente' ? 'PATEN' : 'IDENT',
      documentNumber: d.documentNumber || '',
      documentIssuingPlace: d.documentIssuingPlace || '101014045',
    }));
  } else {
    alloggiatiGuestsState = [{
      tipoAlloggiato: '16',
      name: pass.guestName || '',
      surname: pass.guestSurname || '',
      gender: 'M',
      birthDate: '',
      citizenshipCode: '100000100',
      birthPlaceCode: '101014045',
      birthPlaceProvince: 'SO',
      documentType: 'IDENT',
      documentNumber: '',
      documentIssuingPlace: '101014045',
    }];

    const totalCount = pass.guestsCount || 1;
    for (let i = 1; i < totalCount; i++) {
      alloggiatiGuestsState.push({
        tipoAlloggiato: '17',
        name: '',
        surname: '',
        gender: 'M',
        birthDate: '',
        citizenshipCode: '100000100',
        birthPlaceCode: '101014045',
        birthPlaceProvince: 'SO',
        documentType: 'IDENT',
        documentNumber: '',
        documentIssuingPlace: '101014045',
      });
    }
  }

  renderAlloggiatiGuestsList();
};

window.renderAlloggiatiGuestsList = function() {
  const container = document.getElementById('alloggiati-guests-accordion-container');
  if (!container) return;

  if (alloggiatiGuestsState.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-[#86868b]">Nessun ospite inserito.</div>`;
    return;
  }

  container.innerHTML = alloggiatiGuestsState.map((g, idx) => {
    const isCapogruppo = g.tipoAlloggiato === '16';
    const fullName = (g.surname || g.name) 
      ? `${g.surname.toUpperCase()} ${g.name.toUpperCase()}` 
      : `Ospite #${idx + 1} (Da compilare)`;
    const typeLabel = isCapogruppo ? 'Capogruppo/Capofamiglia' : g.tipoAlloggiato === '17' ? 'Familiare' : 'Membro gruppo';
    
    const countryOptions = ALLOGGIATI_COUNTRIES.map(c => `
      <option value="${c.code}" ${g.citizenshipCode === c.code ? 'selected' : ''}>${c.name} (${c.code})</option>
    `).join('');

    const comuneOptions = ALLOGGIATI_COMUNI.map(c => `
      <option value="${c.code}" ${g.birthPlaceCode === c.code ? 'selected' : ''}>${c.name}</option>
    `).join('');

    const isCustomCountry = ALLOGGIATI_COUNTRIES.every(c => c.code !== g.citizenshipCode);
    const isCustomComune = ALLOGGIATI_COMUNI.every(c => c.code !== g.birthPlaceCode);
    const isPassport = g.documentType === 'PASSA';

    return `
      <div class="apple-card border border-white/[0.08] rounded-xl overflow-hidden" id="alloggiati-card-${idx}">
        <!-- Header -->
        <div 
          onclick="toggleAlloggiatiAccordion(${idx})"
          class="p-4 bg-white/[0.02] hover:bg-white/[0.04] transition flex items-center justify-between gap-3 cursor-pointer select-none"
        >
          <div class="flex items-center gap-3">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCapogruppo ? 'bg-[#30d158] text-black' : 'bg-[#2c2c2e] text-[#86868b]'}">
              ${idx + 1}
            </span>
            <div>
              <span class="font-bold text-white">${fullName}</span>
              <span class="text-[10px] font-mono text-[#86868b] ml-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                ${typeLabel}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${alloggiatiGuestsState.length > 1 ? `
              <button 
                type="button" 
                onclick="event.stopPropagation(); removeAlloggiatiGuest(${idx})" 
                class="p-1.5 rounded-lg text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 transition"
              >
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
            <i data-lucide="chevron-down" class="w-4 h-4 text-[#86868b] transform transition-transform" id="alloggiati-arrow-${idx}"></i>
          </div>
        </div>

        <!-- Body -->
        <div id="alloggiati-body-${idx}" class="hidden p-4 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- Tipo Alloggiato -->
          <div>
            <label class="block text-[#86868b] font-mono mb-1">Tipo Alloggiato *</label>
            <select
              onchange="updateAlloggiatiField(${idx}, 'tipoAlloggiato', this.value); renderAlloggiatiGuestsList();"
              class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none focus:ring-1 focus:ring-[#30d158]"
            >
              <option value="16" ${g.tipoAlloggiato === '16' ? 'selected' : ''}>Capofamiglia / Capogruppo / Ospite Singolo</option>
              <option value="17" ${g.tipoAlloggiato === '17' ? 'selected' : ''}>Familiare</option>
              <option value="18" ${g.tipoAlloggiato === '18' ? 'selected' : ''}>Membro del gruppo</option>
            </select>
          </div>

          <!-- Sesso -->
          <div>
            <label class="block text-[#86868b] font-mono mb-1">Sesso *</label>
            <select
              onchange="updateAlloggiatiField(${idx}, 'gender', this.value)"
              class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
            >
              <option value="M" ${g.gender === 'M' ? 'selected' : ''}>Maschio (M)</option>
              <option value="F" ${g.gender === 'F' ? 'selected' : ''}>Femmina (F)</option>
            </select>
          </div>

          <!-- Cognome -->
          <div>
            <label class="block text-[#86868b] font-mono mb-1">Cognome *</label>
            <input
              type="text"
              value="${g.surname}"
              oninput="updateAlloggiatiField(${idx}, 'surname', this.value.toUpperCase())"
              placeholder="ES. ROSSI"
              class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
            />
          </div>

          <!-- Nome -->
          <div>
            <label class="block text-[#86868b] font-mono mb-1">Nome *</label>
            <input
              type="text"
              value="${g.name}"
              oninput="updateAlloggiatiField(${idx}, 'name', this.value.toUpperCase())"
              placeholder="ES. MARIO"
              class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
            />
          </div>

          <!-- Data Nascita -->
          <div>
            <label class="block text-[#86868b] font-mono mb-1">Data di Nascita *</label>
            <input
              type="date"
              value="${g.birthDate}"
              onchange="updateAlloggiatiField(${idx}, 'birthDate', this.value)"
              class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
            />
          </div>

          <!-- Cittadinanza -->
          <div>
            <label class="block text-[#86868b] font-mono mb-1">Cittadinanza Stato *</label>
            <select
              onchange="updateAlloggiatiField(${idx}, 'citizenshipCode', this.value); renderAlloggiatiGuestsList();"
              class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
            >
              ${countryOptions}
              <option value="custom" ${isCustomCountry ? 'selected' : ''}>--- Inserisci codice manuale ---</option>
            </select>
            ${isCustomCountry ? `
              <input
                type="text"
                maxLength="9"
                value="${g.citizenshipCode === 'custom' ? '' : g.citizenshipCode}"
                oninput="updateAlloggiatiField(${idx}, 'citizenshipCode', this.value.replace(/[^0-9]/g, ''))"
                placeholder="Codice Paese (9 cifre)"
                class="w-full mt-1.5 bg-[#1c1c1e] text-white px-3 py-1.5 rounded-lg border border-white/10 font-mono text-center focus:outline-none"
              />
            ` : ''}
          </div>

          <!-- Luogo di Nascita -->
          <div>
            <label class="block text-[#86868b] font-mono mb-1">Luogo di Nascita *</label>
            ${g.citizenshipCode === '100000100' ? `
              <select
                onchange="updateAlloggiatiComune(${idx}, this.value)"
                class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
              >
                ${comuneOptions}
                <option value="custom" ${isCustomComune ? 'selected' : ''}>--- Inserisci codice manuale ---</option>
              </select>
              ${isCustomComune ? `
                <div class="grid grid-cols-2 gap-2 mt-1.5">
                  <input
                    type="text"
                    maxLength="9"
                    value="${g.birthPlaceCode === 'custom' ? '' : g.birthPlaceCode}"
                    oninput="updateAlloggiatiField(${idx}, 'birthPlaceCode', this.value.replace(/[^0-9]/g, ''))"
                    placeholder="Codice Comune (9 cifre)"
                    class="bg-[#1c1c1e] text-white px-3 py-1.5 rounded-lg border border-white/10 font-mono text-center focus:outline-none"
                  />
                  <input
                    type="text"
                    maxLength="2"
                    value="${g.birthPlaceProvince}"
                    oninput="updateAlloggiatiField(${idx}, 'birthPlaceProvince', this.value.toUpperCase().replace(/[^A-Z]/g, ''))"
                    placeholder="Provincia (ES. SO)"
                    class="bg-[#1c1c1e] text-white px-3 py-1.5 rounded-lg border border-white/10 font-bold text-center focus:outline-none"
                  />
                </div>
              ` : ''}
            ` : `
              <select
                onchange="updateAlloggiatiField(${idx}, 'birthPlaceCode', this.value); renderAlloggiatiGuestsList();"
                class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
              >
                ${countryOptions}
                <option value="custom" ${isCustomComune ? 'selected' : ''}>--- Inserisci codice manuale ---</option>
              </select>
              ${isCustomComune ? `
                <input
                  type="text"
                  maxLength="9"
                  value="${g.birthPlaceCode === 'custom' ? '' : g.birthPlaceCode}"
                  oninput="updateAlloggiatiField(${idx}, 'birthPlaceCode', this.value.replace(/[^0-9]/g, ''))"
                  placeholder="Codice Paese (9 cifre)"
                  class="w-full mt-1.5 bg-[#1c1c1e] text-white px-3 py-1.5 rounded-lg border border-white/10 font-mono text-center focus:outline-none"
                />
              ` : ''}
            `}
          </div>

          <!-- DOCUMENT DETAILS - ONLY REQUIRED FOR CAPOGRUPPO -->
          ${isCapogruppo ? `
            <div class="md:col-span-2 border-t border-white/[0.06] pt-4 mt-2 space-y-4">
              <h5 class="font-mono font-bold text-[11px] text-[#30d158] tracking-wider uppercase">
                Dettagli Documento Identità (Solo Capogruppo)
              </h5>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-[#86868b] font-mono mb-1">Tipo Documento *</label>
                  <select
                    onchange="updateAlloggiatiField(${idx}, 'documentType', this.value); renderAlloggiatiGuestsList();"
                    class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
                  >
                    <option value="IDENT" ${g.documentType === 'IDENT' ? 'selected' : ''}>Carta d'Identità (IDENT)</option>
                    <option value="PASSA" ${g.documentType === 'PASSA' ? 'selected' : ''}>Passaporto (PASSA)</option>
                    <option value="PATEN" ${g.documentType === 'PATEN' ? 'selected' : ''}>Patente di Guida (PATEN)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[#86868b] font-mono mb-1">Numero Documento *</label>
                  <input
                    type="text"
                    value="${g.documentNumber}"
                    oninput="updateAlloggiatiField(${idx}, 'documentNumber', this.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))"
                    placeholder="ES. CA12345AB"
                    class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label class="block text-[#86868b] font-mono mb-1">Luogo Rilascio Documento *</label>
                  ${isPassport ? `
                    <select
                      onchange="updateAlloggiatiField(${idx}, 'documentIssuingPlace', this.value); renderAlloggiatiGuestsList();"
                      class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
                    >
                      ${countryOptions}
                      <option value="custom" ${ALLOGGIATI_COUNTRIES.every(c => c.code !== g.documentIssuingPlace) ? 'selected' : ''}>--- Inserisci codice manuale ---</option>
                    </select>
                  ` : `
                    <select
                      onchange="updateAlloggiatiField(${idx}, 'documentIssuingPlace', this.value); renderAlloggiatiGuestsList();"
                      class="w-full bg-[#1c1c1e] text-white px-3 py-2 rounded-xl border border-white/10 font-bold focus:outline-none"
                    >
                      ${comuneOptions}
                      <option value="custom" ${ALLOGGIATI_COMUNI.every(c => c.code !== g.documentIssuingPlace) ? 'selected' : ''}>--- Inserisci codice manuale ---</option>
                    </select>
                  `}
                  ${(g.documentIssuingPlace === 'custom' || (isPassport ? ALLOGGIATI_COUNTRIES.every(c => c.code !== g.documentIssuingPlace) : ALLOGGIATI_COMUNI.every(c => c.code !== g.documentIssuingPlace))) ? `
                    <input
                      type="text"
                      maxLength="9"
                      value="${g.documentIssuingPlace === 'custom' ? '' : g.documentIssuingPlace}"
                      oninput="updateAlloggiatiField(${idx}, 'documentIssuingPlace', this.value.replace(/[^0-9]/g, ''))"
                      placeholder="Codice 9 cifre"
                      class="w-full mt-1.5 bg-[#1c1c1e] text-white px-3 py-1.5 rounded-lg border border-white/10 font-mono text-center focus:outline-none"
                    />
                  ` : ''}
                </div>
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  }).join('');

  if (expandedIndex !== null && expandedIndex < alloggiatiGuestsState.length) {
    toggleAlloggiatiAccordion(expandedIndex, true);
  }

  renderIcons();
};


window.toggleAlloggiatiAccordion = function(idx, forceExpand = false) {
  const body = document.getElementById(`alloggiati-body-${idx}`);
  const arrow = document.getElementById(`alloggiati-arrow-${idx}`);
  const card = document.getElementById(`alloggiati-card-${idx}`);
  if (!body || !arrow || !card) return;

  const isExpanded = forceExpand || body.classList.contains('hidden');

  // Collapse all bodies first
  alloggiatiGuestsState.forEach((_, i) => {
    const b = document.getElementById(`alloggiati-body-${i}`);
    const a = document.getElementById(`alloggiati-arrow-${i}`);
    const c = document.getElementById(`alloggiati-card-${i}`);
    if (b && a && c) {
      b.classList.add('hidden');
      a.classList.remove('rotate-180');
      c.classList.remove('border-[#30d158]/30', 'bg-white/[0.01]');
    }
  });

  if (isExpanded) {
    body.classList.remove('hidden');
    arrow.classList.add('rotate-180');
    card.classList.add('border-[#30d158]/30', 'bg-white/[0.01]');
    expandedIndex = idx;
  } else {
    expandedIndex = null;
  }
};

window.updateAlloggiatiField = function(idx, field, value) {
  if (idx >= 0 && idx < alloggiatiGuestsState.length) {
    alloggiatiGuestsState[idx][field] = value;
    
    // Smart Defaults
    if (field === 'citizenshipCode' && value !== '100000100') {
      alloggiatiGuestsState[idx].birthPlaceProvince = '';
      alloggiatiGuestsState[idx].birthPlaceCode = value;
    }
  }
};

window.updateAlloggiatiComune = function(idx, value) {
  if (idx >= 0 && idx < alloggiatiGuestsState.length) {
    alloggiatiGuestsState[idx].birthPlaceCode = value;
    const selected = ALLOGGIATI_COMUNI.find(c => c.code === value);
    if (selected) {
      alloggiatiGuestsState[idx].birthPlaceProvince = selected.province;
    }
    renderAlloggiatiGuestsList();
  }
};

window.addAlloggiatiGuestForm = function() {
  alloggiatiGuestsState.push({
    tipoAlloggiato: '17',
    name: '',
    surname: '',
    gender: 'M',
    birthDate: '',
    citizenshipCode: '100000100',
    birthPlaceCode: '101014045',
    birthPlaceProvince: 'SO',
    documentType: 'IDENT',
    documentNumber: '',
    documentIssuingPlace: '101014045',
  });
  expandedIndex = alloggiatiGuestsState.length - 1;
  renderAlloggiatiGuestsList();
};

window.removeAlloggiatiGuest = function(idx) {
  if (alloggiatiGuestsState.length <= 1) {
    showAlloggiatiFeedback('Deve esserci almeno un ospite (Capogruppo).', 'error');
    return;
  }
  alloggiatiGuestsState = alloggiatiGuestsState.filter((_, i) => i !== idx);
  expandedIndex = Math.max(0, idx - 1);
  renderAlloggiatiGuestsList();
};


function showAlloggiatiFeedback(msg, type) {
  const container = document.getElementById('alloggiati-feedback');
  if (!container) return;

  container.className = `p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 border leading-relaxed ${
    type === 'success' 
      ? 'bg-[#30d158]/10 border-[#30d158]/20 text-[#30d158]' 
      : type === 'error' 
      ? 'bg-[#ff453a]/10 border-[#ff453a]/20 text-[#ff453a]' 
      : 'bg-[#0a84ff]/10 border-[#0a84ff]/20 text-[#0a84ff]'
  }`;

  const iconClass = type === 'error' ? 'alert-triangle' : 'check';
  container.innerHTML = `
    <i data-lucide="${iconClass}" class="w-4 h-4 shrink-0 mt-0.5"></i>
    <span>${msg}</span>
  `;
  container.classList.remove('hidden');
  renderIcons();
}

window.saveAlloggiatiData = async function() {
  if (!selectedAlloggiatiPass) return;
  showAlloggiatiFeedback('Salvataggio in corso...', 'loading');

  const documentsDataToSave = alloggiatiGuestsState.map(g => ({
    documentType: g.documentType === 'PASSA' ? 'passaporto' : g.documentType === 'PATEN' ? 'patente' : 'identita',
    documentNumber: g.documentNumber,
    name: g.name,
    surname: g.surname,
    birthDate: g.birthDate,
    birthPlace: g.birthPlaceCode,
    nationality: g.citizenshipCode === '100000100' ? 'ITALIANA' : 'ESTERA',
    gender: g.gender,
    tipoAlloggiato: g.tipoAlloggiato,
    citizenshipCode: g.citizenshipCode,
    birthPlaceCode: g.birthPlaceCode,
    birthPlaceProvince: g.birthPlaceProvince,
    documentIssuingPlace: g.documentIssuingPlace
  }));

  try {
    const res = await fetch(`${API_BASE_URL}/api/passes/${selectedAlloggiatiPass.id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentsData: documentsDataToSave })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Errore di salvataggio.');
    }

    // Update in local activePasses array
    const idx = activePasses.findIndex(p => p.id === selectedAlloggiatiPass.id);
    if (idx !== -1) {
      activePasses[idx].documentsData = documentsDataToSave;
      activePasses[idx].documentsUploaded = true;
    }

    showAlloggiatiFeedback('Dati degli ospiti salvati con successo!', 'success');
  } catch (err) {
    showAlloggiatiFeedback(`Errore: ${err.message}`, 'error');
  }
};


window.exportAlloggiatiTxt = function() {
  if (!selectedAlloggiatiPass) return;

  const stayDays = parseInt(document.getElementById('alloggiati-stay-days').value) || 1;

  for (let i = 0; i < alloggiatiGuestsState.length; i++) {
    const g = alloggiatiGuestsState[i];
    if (!g.name.trim() || !g.surname.trim()) {
      showAlloggiatiFeedback(`Ospite #${i + 1}: Nome e Cognome sono obbligatori.`, 'error');
      window.toggleAlloggiatiAccordion(i, true);
      return;
    }
    if (!g.birthDate) {
      showAlloggiatiFeedback(`Ospite #${i + 1}: Data di nascita è obbligatoria.`, 'error');
      window.toggleAlloggiatiAccordion(i, true);
      return;
    }
    if (!g.citizenshipCode) {
      showAlloggiatiFeedback(`Ospite #${i + 1}: Codice cittadinanza obbligatorio.`, 'error');
      window.toggleAlloggiatiAccordion(i, true);
      return;
    }
    if (!g.birthPlaceCode) {
      showAlloggiatiFeedback(`Ospite #${i + 1}: Comune o Stato di nascita obbligatorio.`, 'error');
      window.toggleAlloggiatiAccordion(i, true);
      return;
    }
    if (g.citizenshipCode === '100000100' && !g.birthPlaceProvince.trim()) {
      showAlloggiatiFeedback(`Ospite #${i + 1}: Provincia di nascita obbligatoria per cittadini italiani.`, 'error');
      window.toggleAlloggiatiAccordion(i, true);
      return;
    }

    if (g.tipoAlloggiato === '16') {
      if (!g.documentNumber.trim()) {
        showAlloggiatiFeedback(`Ospite #${i + 1} (Capogruppo): Il numero di documento è obbligatorio.`, 'error');
        window.toggleAlloggiatiAccordion(i, true);
        return;
      }
      if (!g.documentIssuingPlace) {
        showAlloggiatiFeedback(`Ospite #${i + 1} (Capogruppo): Il luogo di rilascio del documento è obbligatorio.`, 'error');
        window.toggleAlloggiatiAccordion(i, true);
        return;
      }
    }
  }

  try {
    let fileContent = '';

    alloggiatiGuestsState.forEach(g => {
      const pTipo = g.tipoAlloggiato;
      const pDataArrivo = convertDateToItalian(selectedAlloggiatiPass.checkInDate);
      const pGiorni = String(stayDays).padStart(2, '0');
      
      const pCognome = normalizeTextForAlloggiati(g.surname).substring(0, 50).padEnd(50, ' ');
      const pNome = normalizeTextForAlloggiati(g.name).substring(0, 30).padEnd(30, ' ');
      const pSesso = (g.gender === 'F' ? 'F' : 'M') + ' ';
      
      const pDataNascita = convertDateToItalian(g.birthDate);
      const pComuneNascita = g.birthPlaceCode.padStart(9, ' ').substring(0, 9);
      const pProvNascita = (g.citizenshipCode === '100000100' ? g.birthPlaceProvince.toUpperCase().substring(0, 2) : '  ').padEnd(2, ' ');
      const pCittadinanza = g.citizenshipCode.padStart(9, ' ').substring(0, 9);

      let pDocTipo = '     ';
      let pDocNum = '                    ';
      let pDocRilascio = '         ';

      if (g.tipoAlloggiato === '16') {
        pDocTipo = g.documentType.padEnd(5, ' ').substring(0, 5);
        pDocNum = g.documentNumber.toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(20, ' ').substring(0, 20);
        pDocRilascio = g.documentIssuingPlace.padStart(9, ' ').substring(0, 9);
      }

      const line = `${pTipo}${pDataArrivo}${pGiorni}${pCognome}${pNome}${pSesso}${pDataNascita}${pComuneNascita}${pProvNascita}${pCittadinanza}${pDocTipo}${pDocNum}${pDocRilascio}`;
      
      if (line.length !== 160) {
        throw new Error(`Errore interno: riga generata di lunghezza ${line.length} anziché 160 caratteri.`);
      }

      fileContent += line + '\r\n';
    });

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanRef = selectedAlloggiatiPass.bookingRef ? selectedAlloggiatiPass.bookingRef.replace(/[^A-Za-z0-9_-]/g, '') : 'booking';
    a.href = url;
    a.download = `alloggiati_web_${selectedAlloggiatiPass.checkInDate}_${cleanRef}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlloggiatiFeedback('File .txt Alloggiati Web scaricato correttamente! Puoi ora importarlo nel portale della Polizia di Stato.', 'success');
  } catch (err) {
    showAlloggiatiFeedback(`Errore: ${err.message}`, 'error');
  }
};


