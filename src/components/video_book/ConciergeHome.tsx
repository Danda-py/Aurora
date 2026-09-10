import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BedDouble,
  CarFront,
  ChevronRight,
  Clock3,
  Coffee,
  Copy,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Sparkles,
  Utensils,
  Wifi,
  X
} from 'lucide-react';
import { Language, WelcomePage, GuestPass } from '../../types';
import { APARTMENT_INFO } from '../../data/apartmentData';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { FlagIcon } from './FlagIcon';

interface Props {
  language: Language;
  onSelectLanguage: (language: Language) => void;
  onNavigate: (page: WelcomePage) => void;
  pass: GuestPass;
  onOpenSmartLock: () => void;
}

type Sheet = 'wifi' | 'schedule' | 'luggage' | 'map' | 'food' | null;

const localStories = [
  { title: 'Sentiero Valtellina', meta: '7 min a piedi', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80' },
  { title: 'Centro storico', meta: '9 min a piedi', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80' },
  { title: 'Costiera dei Cech', meta: '18 min in auto', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80' }
];

export const ConciergeHome: React.FC<Props> = ({ language, onSelectLanguage, onNavigate, pass, onOpenSmartLock }) => {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const t = VIDEO_TRANSLATIONS[language];
  const firstName = pass.guestName || 'Ospite';
  const languages: Language[] = ['it', 'en', 'de', 'fr', 'es'];

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = Math.max(-12, Math.min(12, event.beta || 0));
      const gamma = Math.max(-12, Math.min(12, event.gamma || 0));
      setTilt({ x: gamma / 2, y: beta / 2 });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const openDoor = () => {
    if ('vibrate' in navigator) navigator.vibrate([18, 35, 18]);
    onOpenSmartLock();
  };

  const copyWifi = async () => {
    await navigator.clipboard?.writeText(APARTMENT_INFO.wifiPassword);
    setSheet('wifi');
  };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <header className="aurora-topbar">
        <div className="aurora-shell flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="aurora-mark"><Sparkles className="h-4 w-4" /></div>
            <div className="min-w-0">
              <p className="aurora-eyebrow">Aurora / Morbegno</p>
              <p className="truncate text-sm font-semibold text-white">La tua casa in Valtellina</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PWAInstallButton language={language} compact />
            <div className="aurora-languages">
              {languages.map((item) => <button key={item} onClick={() => onSelectLanguage(item)} className={language === item ? 'active' : ''} title={item.toUpperCase()}><FlagIcon language={item} className="h-full w-full object-cover" /></button>)}
            </div>
          </div>
        </div>
      </header>

      <main className="aurora-shell space-y-5 pb-12 pt-6">
        <section className="aurora-welcome flex items-end justify-between gap-4">
          <div>
            <p className="aurora-eyebrow text-emerald-300">Benvenuto, {firstName}</p>
            <h1>Fai come fossi a casa.</h1>
            <p className="mt-2 max-w-md text-sm text-slate-400">Tutto il soggiorno, in un solo gesto. Apri, esplora, rilassati.</p>
          </div>
          <div className="hidden text-right sm:block"><p className="aurora-eyebrow">Oggi</p><p className="text-sm font-medium text-white">{pass.checkInDate} — {pass.checkOutDate}</p></div>
        </section>

        <section className="glass-pass" style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` } as React.CSSProperties}>
          <div className="glass-pass-shine" />
          <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="aurora-eyebrow text-white/60">AURORA IN VALTELLINA</p><p className="mt-1 text-lg font-semibold tracking-tight">Guest Glass Pass</p></div>
              <div className="glass-chip"><BedDouble className="h-4 w-4" /><span>APT. AURORA</span></div>
            </div>
            <div className="mt-10 grid grid-cols-[1fr_auto] items-end gap-4">
              <div><p className="text-2xl font-semibold tracking-tight sm:text-3xl">{pass.guestName} {pass.guestSurname}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60"><span>CHECK-IN <strong className="ml-1 text-white">{pass.checkInDate}</strong></span><span>CHECK-OUT <strong className="ml-1 text-white">{pass.checkOutDate}</strong></span></div></div>
              <div className="h-14 w-14 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-lg"><div className="h-full w-full rounded-xl border border-dashed border-white/50" /></div>
            </div>
            <button className="glass-key-button mt-5" onClick={openDoor}><span className="flex items-center gap-2"><Navigation className="h-4 w-4" /> Premi per aprire</span><ArrowUpRight className="h-4 w-4" /></button>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between"><div><p className="aurora-eyebrow">A portata di mano</p><h2>Azioni rapide</h2></div><span className="status-dot">Soggiorno attivo</span></div>
          <div className="quick-actions-grid">
            <button onClick={copyWifi}><Wifi /><span>Wi-Fi rapido</span><small>Copia password</small></button>
            <a href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(`Ciao Nino, sono ${firstName}.`)}`} target="_blank" rel="noreferrer"><MessageCircle /><span>Contatta host</span><small>WhatsApp diretto</small></a>
            <button onClick={() => setSheet('schedule')}><Clock3 /><span>Orari & regole</span><small>Check-out {APARTMENT_INFO.checkOutLimit}</small></button>
            <button onClick={() => setSheet('luggage')}><CarFront /><span>Bagagli</span><small>Prima o dopo il soggiorno</small></button>
          </div>
        </section>

        <section className="space-y-3"><div className="flex items-end justify-between"><div><p className="aurora-eyebrow">Scopri la zona</p><h2>Intorno a te</h2></div><button onClick={() => setSheet('map')} className="text-xs font-semibold text-emerald-300">Apri mappa <ChevronRight className="inline h-3.5 w-3.5" /></button></div>
          <button onClick={() => setSheet('map')} className="map-card"><div className="map-grid" /><span className="map-pin pin-one"><MapPin /></span><span className="map-pin pin-two"><Coffee /></span><span className="map-pin pin-three"><Utensils /></span><div className="map-label"><MapPin className="h-4 w-4 text-emerald-300" /><span>Morbegno, Valtellina</span><ArrowUpRight className="ml-auto h-4 w-4" /></div></button>
        </section>

        <section className="space-y-3"><div className="flex items-end justify-between"><div><p className="aurora-eyebrow">Idee per oggi</p><h2>Esperienze vicine</h2></div><button onClick={() => onNavigate('attivita')} className="text-xs font-semibold text-emerald-300">Vedi tutto <ChevronRight className="inline h-3.5 w-3.5" /></button></div><div className="story-scroller">{localStories.map((story) => <button key={story.title} onClick={() => onNavigate('attivita')} className="story-card"><img src={story.image} alt="" /><span><strong>{story.title}</strong><small>{story.meta}</small></span></button>)}</div></section>

        <section className="feature-grid"><button onClick={() => setSheet('food')} className="feature-card feature-food"><div><p className="aurora-eyebrow text-white/70">Taste of Valtellina</p><h3>Locali consigliati</h3><p>Tre indirizzi scelti per una cena senza pensieri.</p></div><ArrowUpRight /></button><button onClick={() => onNavigate('wifi')} className="feature-card feature-home"><div><p className="aurora-eyebrow text-emerald-200">Casa Aurora</p><h3>La tua guida</h3><p>Wi-Fi, servizi, check-in e ogni dettaglio utile.</p></div><ArrowUpRight /></button></section>
      </main>

      {sheet && <div className="sheet-backdrop" onClick={() => setSheet(null)}><section className="aurora-sheet" onClick={(event) => event.stopPropagation()}><button className="sheet-close" onClick={() => setSheet(null)}><X className="h-4 w-4" /></button>{sheet === 'wifi' && <><p className="aurora-eyebrow">Connessione</p><h2>Wi-Fi Casa_Aurora</h2><p className="mt-2 text-sm text-slate-400">Password copiata negli appunti.</p><div className="sheet-value">{APARTMENT_INFO.wifiPassword}<Copy className="h-4 w-4 text-emerald-300" /></div></>}{sheet === 'schedule' && <><p className="aurora-eyebrow">Ritmo del soggiorno</p><h2>Orari & regole essenziali</h2><div className="sheet-list"><span>Check-in <b>{APARTMENT_INFO.checkInStart} — {APARTMENT_INFO.checkInEnd}</b></span><span>Check-out <b>entro le {APARTMENT_INFO.checkOutLimit}</b></span><span>Casa <b>silenzio e rispetto del vicinato</b></span></div></>}{sheet === 'luggage' && <><p className="aurora-eyebrow">Flessibilità</p><h2>Deposito bagagli</h2><p className="mt-2 text-sm leading-6 text-slate-400">Scrivi all’host per concordare il deposito prima del check-in o dopo il check-out.</p><a className="sheet-action" href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}`} target="_blank" rel="noreferrer">Chiedi a Nino <ArrowUpRight className="h-4 w-4" /></a></>}{sheet === 'map' && <><p className="aurora-eyebrow">Mappa & luoghi</p><h2>Morbegno, a un passo</h2><p className="mt-2 text-sm leading-6 text-slate-400">Ristoranti, farmacia e centro storico sono tutti raccolti intorno ad Aurora.</p><a className="sheet-action" href={APARTMENT_INFO.googleMapsUrl} target="_blank" rel="noreferrer">Apri in Google Maps <ExternalLink className="h-4 w-4" /></a></>}{sheet === 'food' && <><p className="aurora-eyebrow">Sapori locali</p><h2>Una tavola fatta bene</h2><p className="mt-2 text-sm leading-6 text-slate-400">Scopri crotti, pizzoccheri e colazioni locali nella guida di Aurora.</p><button className="sheet-action" onClick={() => { setSheet(null); onNavigate('ristoranti'); }}>Esplora ristoranti <ArrowUpRight className="h-4 w-4" /></button></>}</section></div>}
    </div>
  );
};
