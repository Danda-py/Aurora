import React, { useEffect, useState } from 'react';
import { ArrowUpRight, BedDouble, Check, CarFront, ChevronRight, Clock3, Coffee, Copy, ExternalLink, Home, MapPin, MessageCircle, Navigation, Utensils, Wifi, X } from 'lucide-react';
import { Language, WelcomePage, GuestPass } from '../../types';
import { APARTMENT_INFO } from '../../data/apartmentData';
import { FlagIcon } from './FlagIcon';

interface Props {
  language: Language;
  onSelectLanguage: (language: Language) => void;
  onNavigate: (page: WelcomePage) => void;
  pass: GuestPass;
  onOpenSmartLock: () => void;
}

type Sheet = 'wifi' | 'schedule' | 'luggage' | 'map' | 'food' | null;

const languages: { id: Language; label: string }[] = [
  { id: 'it', label: 'Italiano' },
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
  { id: 'fr', label: 'Francais' },
  { id: 'es', label: 'Espanol' }
];

const localStories = [
  { title: 'Sentiero Valtellina', meta: '7 min a piedi', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80' },
  { title: 'Centro storico', meta: '9 min a piedi', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80' },
  { title: 'Costiera dei Cech', meta: '18 min in auto', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80' }
];

const mapFilters = [
  { id: 'all', label: 'Tutto' },
  { id: 'coffee', label: 'Colazione' },
  { id: 'food', label: 'Cena' },
  { id: 'pharmacy', label: 'Farmacie' },
  { id: 'shop', label: 'Spesa' }
];

const nearbyPlaces = [
  { type: 'coffee', name: 'Bar storico di Morbegno', meta: 'Colazione - 5 min a piedi', benefit: 'Colazione inclusa', url: 'https://maps.google.com/?q=Morbegno+bar' },
  { type: 'food', name: 'Crotto da Gusto', meta: 'Cena valtellinese - 8 min', benefit: '10% mostrando Aurora', url: 'https://maps.google.com/?q=ristorante+Morbegno' },
  { type: 'pharmacy', name: 'Farmacia di turno', meta: 'Essenziali - 6 min a piedi', benefit: '', url: 'https://maps.google.com/?q=farmacia+Morbegno' }
];

const uiCopy: Record<Language, { home: string; subtitle: string; quick: string; wifi: string; host: string; rules: string; bags: string; nearby: string; map: string; experiences: string; all: string; chooseLanguage: string }> = {
  it: { home: 'Fai come fossi a casa.', subtitle: 'Tutto il soggiorno, in un solo gesto. Apri, esplora, rilassati.', quick: 'Azioni rapide', wifi: 'Wi-Fi rapido', host: 'Contatta host', rules: 'Orari & regole', bags: 'Bagagli', nearby: 'Intorno a te', map: 'Apri mappa', experiences: 'Esperienze vicine', all: 'Vedi tutto', chooseLanguage: 'Scegli la tua lingua' },
  en: { home: 'Feel at home.', subtitle: 'Your whole stay, in one gesture. Open, explore, relax.', quick: 'Quick actions', wifi: 'Quick Wi-Fi', host: 'Contact host', rules: 'Hours & rules', bags: 'Luggage', nearby: 'Around you', map: 'Open map', experiences: 'Nearby experiences', all: 'See all', chooseLanguage: 'Choose your language' },
  de: { home: 'Fühl dich wie zu Hause.', subtitle: 'Der ganze Aufenthalt in einer Geste. Öffnen, entdecken, entspannen.', quick: 'Schnellzugriff', wifi: 'WLAN', host: 'Gastgeber kontaktieren', rules: 'Zeiten & Regeln', bags: 'Gepäck', nearby: 'In deiner Nähe', map: 'Karte öffnen', experiences: 'Erlebnisse in der Nähe', all: 'Alle ansehen', chooseLanguage: 'Sprache wählen' },
  fr: { home: 'Comme chez vous.', subtitle: 'Tout le séjour en un geste. Ouvrez, explorez, profitez.', quick: 'Accès rapides', wifi: 'Wi-Fi rapide', host: "Contacter l'hôte", rules: 'Horaires & règles', bags: 'Bagages', nearby: 'Autour de vous', map: 'Ouvrir la carte', experiences: 'Expériences proches', all: 'Tout voir', chooseLanguage: 'Choisir la langue' },
  es: { home: 'Siéntete como en casa.', subtitle: 'Toda tu estancia en un gesto. Abre, descubre y relájate.', quick: 'Acciones rápidas', wifi: 'Wi-Fi rápido', host: 'Contactar al anfitrión', rules: 'Horarios y normas', bags: 'Equipaje', nearby: 'A tu alrededor', map: 'Abrir mapa', experiences: 'Experiencias cercanas', all: 'Ver todo', chooseLanguage: 'Elegir idioma' }
};

export const ConciergeHome: React.FC<Props> = ({ language, onSelectLanguage, onNavigate, pass, onOpenSmartLock }) => {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);
  const [showWifiQr, setShowWifiQr] = useState(false);
  const [mapFilter, setMapFilter] = useState('all');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const firstName = pass.guestName || 'Ospite';
  const copy = uiCopy[language];
  const isNight = new Date().getHours() >= 22 || new Date().getHours() < 7;
  const isCheckoutDay = new Date().toISOString().slice(0, 10) === pass.checkOutDate;

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = Math.max(-12, Math.min(12, event.beta || 0));
      const gamma = Math.max(-12, Math.min(12, event.gamma || 0));
      setTilt({ x: gamma / 2, y: beta / 2 });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const copyWifi = async () => {
    await navigator.clipboard?.writeText(APARTMENT_INFO.wifiPassword);
    setWifiCopied(true);
    setShowWifiQr(false);
    setSheet('wifi');
    window.setTimeout(() => setWifiCopied(false), 2200);
  };

  const openDoor = () => {
    if ('vibrate' in navigator) navigator.vibrate([18, 35, 18]);
    onOpenSmartLock();
  };

  return (
    <div className={`aurora-concierge min-h-screen text-white ${isNight ? 'aurora-night' : ''}`}>
      <button className="aurora-floating-language" onClick={() => setLanguageOpen(true)} aria-label="Cambia lingua">
        <FlagIcon language={language} className="h-full w-full object-cover" />
      </button>

      <main className="aurora-shell space-y-5 pb-12 pt-6">
        <section className="aurora-brand-space" aria-label="Aurora in Valtellina">
          <div className="aurora-house-logo"><Home className="h-5 w-5" /></div>
          <div><p className="aurora-eyebrow">Aurora in Valtellina</p><p className="aurora-brand-name">{firstName}, benvenuto.</p></div>
        </section>

        {isCheckoutDay && <button className="stay-nudge" onClick={() => setSheet('luggage')}><Clock3 className="h-4 w-4 text-amber-300" /><span><strong>Check-out entro le {APARTMENT_INFO.checkOutLimit}.</strong><small>Vuoi lasciare i bagagli o prenotare un taxi?</small></span><ChevronRight className="ml-auto h-4 w-4" /></button>}

        <section className="glass-pass" style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` } as React.CSSProperties}>
          <div className="glass-pass-shine" />
          <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="aurora-eyebrow text-white/60">AURORA IN VALTELLINA</p><p className="mt-1 text-lg font-semibold tracking-tight">Guest Glass Pass</p></div><div className="glass-chip"><BedDouble className="h-4 w-4" /><span>APT. AURORA</span></div></div>
            <div className="mt-10 grid grid-cols-[1fr_auto] items-end gap-4"><div><p className="text-2xl font-semibold tracking-tight sm:text-3xl">{pass.guestName} {pass.guestSurname}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60"><span>CHECK-IN <strong className="ml-1 text-white">{pass.checkInDate}</strong></span><span>CHECK-OUT <strong className="ml-1 text-white">{pass.checkOutDate}</strong></span></div></div><div className="h-14 w-14 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-lg"><div className="h-full w-full rounded-xl border border-dashed border-white/50" /></div></div>
            <button className="glass-key-button mt-5" onClick={openDoor}><span className="flex items-center gap-2"><Navigation className="h-4 w-4" /> Tieni premuto per aprire</span><ArrowUpRight className="h-4 w-4" /></button>
          </div>
        </section>

        <section><div className="mb-3 flex items-center justify-between"><div><p className="aurora-eyebrow">A portata di mano</p><h2>{copy.quick}</h2></div><span className="status-dot">Soggiorno attivo</span></div><div className="quick-actions-grid"><button onClick={copyWifi}><Wifi /><span>{copy.wifi}</span><small>{wifiCopied ? 'Password copiata!' : 'Copia password'}</small></button><a href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(`Ciao Nino, sono ${firstName}.`)}`} target="_blank" rel="noreferrer"><MessageCircle /><span>{copy.host}</span><small>WhatsApp diretto</small></a><button onClick={() => setSheet('schedule')}><Clock3 /><span>{copy.rules}</span><small>Check-out {APARTMENT_INFO.checkOutLimit}</small></button><button onClick={() => setSheet('luggage')}><CarFront /><span>{copy.bags}</span><small>Prima o dopo il soggiorno</small></button></div></section>

        <section className="space-y-3"><div className="flex items-end justify-between"><div><p className="aurora-eyebrow">Scopri la zona</p><h2>{copy.nearby}</h2></div><button onClick={() => setSheet('map')} className="text-xs font-semibold text-emerald-300">{copy.map} <ChevronRight className="inline h-3.5 w-3.5" /></button></div><button onClick={() => setSheet('map')} className="map-card"><div className="map-grid" /><span className="map-pin pin-one"><MapPin /></span><span className="map-pin pin-two"><Coffee /></span><span className="map-pin pin-three"><Utensils /></span><div className="map-label"><MapPin className="h-4 w-4 text-emerald-300" /><span>Morbegno, Valtellina</span><ArrowUpRight className="ml-auto h-4 w-4" /></div></button><div className="map-filter-row">{mapFilters.map((filter) => <button key={filter.id} className={mapFilter === filter.id ? 'active' : ''} onClick={() => setMapFilter(filter.id)}>{filter.label}</button>)}</div><div className="place-list">{nearbyPlaces.filter((place) => mapFilter === 'all' || place.type === mapFilter).map((place) => <article key={place.name} className="place-card"><div><strong>{place.name}</strong><small>{place.meta}</small>{place.benefit && <em>{place.benefit}</em>}</div><a href={place.url} target="_blank" rel="noreferrer" aria-label={`Apri ${place.name} nelle mappe`}><Navigation className="h-4 w-4" /></a></article>)}</div></section>

        <section className="space-y-3"><div className="flex items-end justify-between"><div><p className="aurora-eyebrow">Idee per oggi</p><h2>{copy.experiences}</h2></div><button onClick={() => onNavigate('attivita')} className="text-xs font-semibold text-emerald-300">{copy.all} <ChevronRight className="inline h-3.5 w-3.5" /></button></div><div className="story-scroller">{localStories.map((story) => <button key={story.title} onClick={() => onNavigate('attivita')} className="story-card"><img src={story.image} alt="" /><span><strong>{story.title}</strong><small>{story.meta}</small></span></button>)}</div></section>

      </main>

      {languageOpen && <div className="sheet-backdrop" onClick={() => setLanguageOpen(false)}><section className="aurora-sheet language-sheet" onClick={(event) => event.stopPropagation()}><button className="sheet-close" onClick={() => setLanguageOpen(false)}><X className="h-4 w-4" /></button><p className="aurora-eyebrow">Preferenza lingua</p><h2>{copy.chooseLanguage}</h2><div className="language-options">{languages.map((item) => <button key={item.id} className={language === item.id ? 'active' : ''} onClick={() => { onSelectLanguage(item.id); setLanguageOpen(false); }}><FlagIcon language={item.id} /><span>{item.label}</span>{language === item.id && <Check className="ml-auto h-4 w-4" />}</button>)}</div></section></div>}
      {sheet && <div className="sheet-backdrop" onClick={() => setSheet(null)}><section className="aurora-sheet" onClick={(event) => event.stopPropagation()}><button className="sheet-close" onClick={() => setSheet(null)}><X className="h-4 w-4" /></button>{sheet === 'wifi' && <><p className="aurora-eyebrow">Connessione</p><h2>Wi-Fi Casa_Aurora</h2><p className="mt-2 text-sm text-slate-400">{wifiCopied ? 'Password copiata negli appunti.' : 'Scansiona il QR o copia la password.'}</p>{showWifiQr ? <img className="wifi-qr" alt="QR Wi-Fi Casa Aurora" src={`https://quickchart.io/qr?size=220&text=${encodeURIComponent(`WIFI:T:WPA;S:${APARTMENT_INFO.wifiSSID};P:${APARTMENT_INFO.wifiPassword};;`)}`} /> : <div className="sheet-value">{APARTMENT_INFO.wifiPassword}<Copy className="h-4 w-4 text-emerald-300" /></div>}<button className="sheet-action mt-3" onClick={() => setShowWifiQr(!showWifiQr)}>{showWifiQr ? 'Copia password' : 'Mostra QR Wi-Fi'} <Wifi className="h-4 w-4" /></button></>}{sheet === 'schedule' && <><p className="aurora-eyebrow">Ritmo del soggiorno</p><h2>Orari & regole essenziali</h2><div className="sheet-list"><span>Check-in <b>{APARTMENT_INFO.checkInStart} - {APARTMENT_INFO.checkInEnd}</b></span><span>Check-out <b>entro le {APARTMENT_INFO.checkOutLimit}</b></span><span>Casa <b>silenzio e rispetto del vicinato</b></span></div></>}{sheet === 'luggage' && <><p className="aurora-eyebrow">Flessibilita</p><h2>Deposito bagagli</h2><p className="mt-2 text-sm leading-6 text-slate-400">Scrivi all'host per concordare il deposito prima del check-in o dopo il check-out.</p><a className="sheet-action" href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}`} target="_blank" rel="noreferrer">Chiedi a Nino <ArrowUpRight className="h-4 w-4" /></a></>}{sheet === 'map' && <><p className="aurora-eyebrow">Mappa & luoghi</p><h2>Morbegno, a un passo</h2><p className="mt-2 text-sm leading-6 text-slate-400">Ristoranti, farmacia e centro storico sono tutti raccolti intorno ad Aurora.</p><a className="sheet-action" href={APARTMENT_INFO.googleMapsUrl} target="_blank" rel="noreferrer">Apri nelle mappe <ExternalLink className="h-4 w-4" /></a></>}{sheet === 'food' && <><p className="aurora-eyebrow">Sapori locali</p><h2>Una tavola fatta bene</h2><p className="mt-2 text-sm leading-6 text-slate-400">Scopri crotti, pizzoccheri e colazioni locali nella guida di Aurora.</p><button className="sheet-action" onClick={() => { setSheet(null); onNavigate('ristoranti'); }}>Esplora ristoranti <ArrowUpRight className="h-4 w-4" /></button></>}</section></div>}
    </div>
  );
};
