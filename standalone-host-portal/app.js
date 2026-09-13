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
        fetchIcalConfig();
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
        fetchIcalConfig(),
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

  // iCal Config Form Submit
  const formIcalConfig = document.getElementById('formIcalConfig');
  if (formIcalConfig) {
    formIcalConfig.addEventListener('submit', handleSaveIcalConfig);
  }

  // iCal Force Sync Button
  const btnForceIcalSync = document.getElementById('btnForceIcalSync');
  if (btnForceIcalSync) {
    btnForceIcalSync.addEventListener('click', handleForceIcalSync);
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

// ============================================================
// iCal CONFIG & SYNCHRONIZATION
// ============================================================
async function fetchIcalConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ical/config`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.config) {
      const cfg = data.config;
      const inputIcalUrl = document.getElementById('inputIcalUrl');
      const inputIcalDaysAhead = document.getElementById('inputIcalDaysAhead');
      const inputIcalInterval = document.getElementById('inputIcalInterval');
      const checkboxIcalEnabled = document.getElementById('checkboxIcalEnabled');
      const icalOverviewStatus = document.getElementById('icalOverviewStatus');
      const icalStatusBadge = document.getElementById('icalStatusBadge');

      if (inputIcalUrl && cfg.icalUrl) inputIcalUrl.value = cfg.icalUrl;
      if (inputIcalDaysAhead && cfg.daysAheadToSend) inputIcalDaysAhead.value = cfg.daysAheadToSend;
      if (inputIcalInterval && cfg.intervalMs) inputIcalInterval.value = Math.round(cfg.intervalMs / 60000);
      if (checkboxIcalEnabled) checkboxIcalEnabled.checked = Boolean(cfg.enabled);

      if (icalOverviewStatus) {
        icalOverviewStatus.textContent = cfg.enabled ? '● Sincronizzazione Attiva' : '● In Attesa';
        icalOverviewStatus.className = cfg.enabled ? 'text-[11px] text-[#30d158] block truncate font-mono' : 'text-[11px] text-[#86868b] block truncate font-mono';
      }
      if (icalStatusBadge) {
        icalStatusBadge.textContent = cfg.enabled ? 'Sincronizzazione Attiva' : 'Configurazione Pronta';
      }
    }
  } catch (err) {
    console.warn('iCal config fetch notice:', err);
  }
}

async function handleSaveIcalConfig(e) {
  if (e) e.preventDefault();

  const url = document.getElementById('inputIcalUrl')?.value.trim();
  const daysAhead = parseInt(document.getElementById('inputIcalDaysAhead')?.value || '3', 10);
  const intervalMins = parseInt(document.getElementById('inputIcalInterval')?.value || '30', 10);
  const enabled = document.getElementById('checkboxIcalEnabled')?.checked || false;

  showToast('Salvataggio configurazione iCal...', 'loading');

  try {
    const res = await fetch(`${API_BASE_URL}/api/ical/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        icalUrl: url,
        daysAheadToSend: daysAhead,
        intervalMs: intervalMins * 60 * 1000,
        enabled: enabled
      })
    });

    if (res.ok) {
      showToast('Configurazione iCal salvata con successo!', 'success');
      fetchIcalConfig();
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    showToast(`Errore: ${err.message}`, 'error');
  }
}

async function handleForceIcalSync() {
  const btn = document.getElementById('btnForceIcalSync');
  const feedback = document.getElementById('icalFeedbackBox');
  
  showToast('Sincronizzazione iCal in corso...', 'loading');
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE_URL}/api/ical/sync-now`, { method: 'POST' });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Sincronizzazione completata con successo!', 'success');
      if (feedback) {
        feedback.className = 'p-3.5 rounded-xl text-xs font-mono bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 block';
        feedback.textContent = `${data.message} (Totale soggiorni memorizzati: ${data.totalPasses || activePasses.length})`;
      }
      fetchPasses();
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

function renderCmsFields() {
  const container = document.getElementById('cmsFieldsContainer');
  const preview = document.getElementById('cmsPreview');
  const previewTitle = document.getElementById('cmsPreviewTitle');
  if (!container) return;

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
        fieldItems.push(`
          <div class="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <label class="block text-xs font-mono text-[#ff9f0a] font-semibold">${pathKey}</label>
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
                  const subFields = Object.entries(item).map(([subK, subV]) => `
                    <div>
                      <label class="block text-[11px] font-mono text-[#86868b]">${subK}</label>
                      <input type="text" data-field-path="${pathKey}.${idx}.${subK}" value="${String(subV || '').replace(/"/g, '&quot;')}" class="cms-field-input w-full text-xs p-2 rounded-lg bg-[#1c1c1e] text-white border border-white/10 mt-0.5" />
                    </div>
                  `).join('');
                  return `
                    <div class="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <span class="text-[10px] font-mono text-[#ff9f0a] font-semibold">Elemento #${idx + 1}</span>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        ${subFields}
                      </div>
                    </div>
                  `;
                } else {
                  return `
                    <div>
                      <input type="text" data-field-path="${pathKey}.${idx}" value="${String(item || '').replace(/"/g, '&quot;')}" class="cms-field-input w-full text-xs p-2 rounded-lg bg-[#1c1c1e] text-white border border-white/10" />
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

  updateCmsPreview();
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
          ${!isSent ? `
            <button onclick="sendScheduledMessageNow('${msg.id}')" class="btn-apple-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="send" class="w-3.5 h-3.5 text-[#30d158]"></i>
              <span>${isFailed ? 'Riprova' : 'Invia Subito'}</span>
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
