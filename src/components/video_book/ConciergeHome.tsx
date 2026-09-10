import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Compass, Home, KeyRound, MapPin, MessageCircle, Sparkles, Utensils, Wifi, X } from 'lucide-react';
import { GuestPass, Language, WelcomePage } from '../../types';
import { APARTMENT_INFO } from '../../data/apartmentData';

interface Props {
  language: Language;
  pass: GuestPass;
  onNavigate: (page: WelcomePage) => void;
  onOpenSmartLock: () => void;
}

type ConciergeCard = {
  page: WelcomePage;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  icon: React.ReactNode;
  tone: string;
};

const copy = {
  it: {
    greeting: 'Il tuo soggiorno, curato',
    start: 'Inizia il percorso',
    membership: 'Digital membership pass',
    active: 'Accesso attivo',
    cardLabel: 'Selezione concierge',
    open: 'Apri il dettaglio',
    next: 'Prossima',
    back: 'Indietro',
    code: 'Codice personale',
    stay: 'Soggiorno',
    contact: 'Contatta Nino',
    location: 'Morbegno, Valtellina',
    done: 'Torna al percorso'
  },
  en: {
    greeting: 'Your stay, considered', start: 'Start the journey', membership: 'Digital membership pass', active: 'Access active', cardLabel: 'Concierge selection', open: 'Open details', next: 'Next', back: 'Back', code: 'Personal code', stay: 'Stay', contact: 'Contact Nino', location: 'Morbegno, Valtellina', done: 'Back to journey'
  },
  de: {
    greeting: 'Ihr Aufenthalt, kuratiert', start: 'Rundgang starten', membership: 'Digital membership pass', active: 'Zugang aktiv', cardLabel: 'Concierge-Auswahl', open: 'Details öffnen', next: 'Weiter', back: 'Zurück', code: 'Persönlicher Code', stay: 'Aufenthalt', contact: 'Nino kontaktieren', location: 'Morbegno, Veltlin', done: 'Zurück zur Auswahl'
  },
  fr: {
    greeting: 'Votre séjour, pensé pour vous', start: 'Commencer', membership: 'Digital membership pass', active: 'Accès actif', cardLabel: 'Sélection concierge', open: 'Voir le détail', next: 'Suivant', back: 'Retour', code: 'Code personnel', stay: 'Séjour', contact: 'Contacter Nino', location: 'Morbegno, Valteline', done: 'Retour au parcours'
  },
  es: {
    greeting: 'Tu estancia, cuidada', start: 'Comenzar recorrido', membership: 'Digital membership pass', active: 'Acceso activo', cardLabel: 'Selección concierge', open: 'Abrir detalle', next: 'Siguiente', back: 'Atrás', code: 'Código personal', stay: 'Estancia', contact: 'Contactar con Nino', location: 'Morbegno, Valtellina', done: 'Volver al recorrido'
  }
};

export const ConciergeHome: React.FC<Props> = ({ language, pass, onNavigate, onOpenSmartLock }) => {
  const t = copy[language];
  const [step, setStep] = useState<'pass' | 'selection'>('pass');
  const [cardIndex, setCardIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const cards: ConciergeCard[] = [
    { page: 'check_in', eyebrow: '01 / ARRIVAL', title: language === 'it' ? 'L’arrivo, senza attrito' : 'A seamless arrival', description: language === 'it' ? 'Accesso, chiavi e il primo gesto per sentirti già a casa.' : 'Access, keys and the first gesture of feeling at home.', detail: language === 'it' ? 'Trova tutte le indicazioni per il check-in e apri il portone dal tuo pass.' : 'Find every check-in detail and open the door from your pass.', icon: <KeyRound />, tone: 'coral' },
    { page: 'wifi', eyebrow: '02 / CONNECT', title: language === 'it' ? 'Connessi al tuo ritmo' : 'Connected to your rhythm', description: language === 'it' ? 'La rete di casa, pronta quando arrivi.' : 'The house network, ready when you are.', detail: language === 'it' ? `Wi-Fi ${APARTMENT_INFO.wifiSSID} e accesso rapido al soggiorno.` : `Wi-Fi ${APARTMENT_INFO.wifiSSID} and a smoother stay.`, icon: <Wifi />, tone: 'ice' },
    { page: 'attivita', eyebrow: '03 / OUTSIDE', title: language === 'it' ? 'Valtellina, scelta bene' : 'Valtellina, well chosen', description: language === 'it' ? 'Percorsi, sapori e piccoli luoghi che meritano il viaggio.' : 'Trails, flavours and small places worth the journey.', detail: language === 'it' ? 'Una selezione locale per uscire con un’idea precisa, non con una lista infinita.' : 'A local edit for leaving with a clear idea, not an endless list.', icon: <Compass />, tone: 'gold' },
    { page: 'ristoranti', eyebrow: '04 / TASTE', title: language === 'it' ? 'Un tavolo in Valtellina' : 'A table in Valtellina', description: language === 'it' ? 'Crotti, pizzoccheri e indirizzi scelti con cura.' : 'Crotti, pizzoccheri and addresses chosen with care.', detail: language === 'it' ? 'Scopri dove andare stasera, dal pranzo lento all’aperitivo.' : 'Find where to go tonight, from a slow lunch to aperitivo.', icon: <Utensils />, tone: 'wine' }
  ];

  const activeCard = cards[cardIndex];

  useEffect(() => {
    const onOrientation = (event: DeviceOrientationEvent) => {
      setTilt({ x: Math.max(-8, Math.min(8, event.beta || 0)) / 2, y: Math.max(-8, Math.min(8, event.gamma || 0)) / 2 });
    };
    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, []);

  const moveCard = (direction: number) => {
    setCardIndex((current) => (current + direction + cards.length) % cards.length);
    setExpanded(false);
    if ('vibrate' in navigator) navigator.vibrate(12);
  };

  const displayName = `${pass.guestName} ${pass.guestSurname}`.trim();
  const dateLabel = `${pass.checkInDate.split('-').reverse().join('.')} — ${pass.checkOutDate.split('-').reverse().join('.')}`;

  return (
    <main className="concierge-shell" style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` } as React.CSSProperties}>
      <div className="concierge-noise" />
      <header className="concierge-header">
        <div className="brand-lockup"><span className="brand-mark">A</span><span>AURORA / MORBEGNO</span></div>
        <span className="live-dot">{t.active}</span>
      </header>

      {step === 'pass' ? (
        <section className="concierge-welcome concierge-enter">
          <div className="welcome-kicker"><Sparkles size={14} /> PRIVATE GUEST JOURNEY</div>
          <p className="welcome-overline">{t.greeting}</p>
          <h1>Benvenuto,<br /><em>{pass.guestName}</em></h1>
          <p className="welcome-copy">Un’esperienza essenziale per vivere Aurora in Valtellina con il tempo e l’attenzione che merita.</p>

          <div className="vip-pass" style={{ transform: `perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))` }}>
            <div className="pass-sheen" />
            <div className="pass-top"><span>AURORA</span><span className="pass-chip">N° {pass.id.slice(-5).toUpperCase()}</span></div>
            <div className="pass-avatar">{pass.guestName.charAt(0)}{pass.guestSurname.charAt(0)}</div>
            <div className="pass-person"><strong>{displayName}</strong><small>{t.membership}</small></div>
            <div className="pass-bottom"><span>{dateLabel}</span><span className="pass-level">PRIVATE / 01</span></div>
          </div>

          <div className="welcome-actions">
            <button className="liquid-button primary" onClick={() => { setStep('selection'); if ('vibrate' in navigator) navigator.vibrate(18); }}><span>{t.start}</span><ArrowUpRight size={18} /></button>
            <button className="text-button" onClick={onOpenSmartLock}><KeyRound size={15} /> {t.code}: <strong>{pass.pinCode}</strong></button>
          </div>
          <div className="location-line"><MapPin size={13} /> {t.location}</div>
        </section>
      ) : (
        <section className="concierge-selection concierge-enter">
          <div className="selection-topline"><button className="icon-button" onClick={() => setStep('pass')} aria-label={t.back}><ChevronLeft size={18} /></button><span>{t.cardLabel}</span><span className="selection-count">0{cardIndex + 1} / 0{cards.length}</span></div>
          <div className={`service-card tone-${activeCard.tone} ${expanded ? 'is-expanded' : ''}`} onClick={() => setExpanded((value) => !value)}>
            <div className="service-orb">{activeCard.icon}</div>
            <div className="service-index">{activeCard.eyebrow}</div>
            <h2>{activeCard.title}</h2>
            <p>{activeCard.description}</p>
            <div className="service-detail">{activeCard.detail}</div>
            <div className="service-footer"><span>{expanded ? t.done : t.open}</span><ArrowUpRight size={18} /></div>
          </div>
          <div className="card-controls"><button className="icon-button" onClick={(event) => { event.stopPropagation(); moveCard(-1); }} aria-label={t.back}><ChevronLeft size={20} /></button><div className="progress-track"><span style={{ width: `${((cardIndex + 1) / cards.length) * 100}%` }} /></div><button className="icon-button" onClick={(event) => { event.stopPropagation(); moveCard(1); }} aria-label={t.next}><ChevronRight size={20} /></button></div>
          {expanded && <button className="liquid-button primary detail-action" onClick={() => onNavigate(activeCard.page)}>{t.open}<ArrowUpRight size={18} /></button>}
          <div className="selection-quick"><button onClick={onOpenSmartLock}><KeyRound size={15} /> {t.code} <strong>{pass.pinCode}</strong></button><a href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> {t.contact}</a></div>
          <div className="selection-home"><Home size={14} /> {APARTMENT_INFO.name}</div>
        </section>
      )}
    </main>
  );
};
