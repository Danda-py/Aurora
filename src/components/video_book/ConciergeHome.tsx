import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  BedDouble, 
  Check, 
  ChevronRight, 
  Clock3, 
  Copy, 
  Home, 
  Hand,
  MapPin, 
  MessageCircle, 
  Utensils, 
  Wifi, 
  X, 
  ShieldAlert, 
  Train, 
  Wrench, 
  LogOut, 
  Phone, 
  ShoppingBag,
  KeyRound,
  Info
} from 'lucide-react';
import { Language, WelcomePage, GuestPass } from '../../types';
import { APARTMENT_INFO } from '../../data/apartmentData';
import { FlagIcon } from './FlagIcon';
import { useCms } from '../../context/CmsContext';
import { checkCasaAuroraWifi } from '../../services/wifiDetectionService';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';
import { getStayTiming } from '../../services/guestPassService';

interface Props {
  language: Language;
  onSelectLanguage: (language: Language) => void;
  onNavigate: (page: WelcomePage) => void;
  pass?: GuestPass | null;
  onOpenSmartLock: () => void;
}

type Sheet = 'wifi' | 'schedule' | 'luggage' | null;

const languages: { id: Language; label: string }[] = [
  { id: 'it', label: 'Italiano' },
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Español' }
];

interface GuideTileItem {
  page: WelcomePage;
  label: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
  bgImage: string;
}

interface ScrollableTileRowProps {
  children: React.ReactNode;
  hintLabel: string;
}

const ScrollableTileRow: React.FC<ScrollableTileRowProps> = ({ children, hintLabel }) => {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const updateScrollState = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setCanScroll(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 2);
  };

  useEffect(() => {
    updateScrollState();
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(scroller);
    return () => resizeObserver.disconnect();
  }, []);

  const scrollNext = () => {
    scrollerRef.current?.scrollBy({ left: scrollerRef.current.clientWidth * 0.78, behavior: 'smooth' });
  };

  return (
    <div className="aurora-photo-scroller-wrap">
      <div ref={scrollerRef} className="aurora-photo-scroller" onScroll={updateScrollState}>
        {children}
      </div>
      {canScroll && (
        <button className="aurora-scroll-hint" onClick={scrollNext} aria-label={hintLabel}>
          <Hand className="aurora-scroll-hand" aria-hidden="true" />
          <ChevronRight aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

const getLocalizedGuideSections = (lang: Language, media?: Record<string, string>, isPublic: boolean = false): {
  houseEssentials: { title: string; subtitle: string; items: GuideTileItem[] };
  exploreValtellina: { title: string; subtitle: string; items: GuideTileItem[] };
  supportSecurity: { title: string; subtitle: string; items: GuideTileItem[] };
  departure: { title: string; subtitle: string; items: GuideTileItem[] };
} => {
  const isIt = lang === 'it';
  const isEn = lang === 'en';
  const isDe = lang === 'de';
  const isFr = lang === 'fr';

  return {
    houseEssentials: {
      title: isIt ? 'Guida & Arrivo' : isEn ? 'Arrival & Home Guide' : isDe ? 'Anreise & Hausführer' : isFr ? 'Arrivée & Guide' : 'Llegada y Guía',
      subtitle: isIt ? 'Tutto per iniziare il soggiorno' : isEn ? 'Everything to start your stay' : isDe ? 'Alles für den Start' : isFr ? 'Tout pour commencer' : 'Todo para comenzar',
      items: [
        {
          page: 'posizione',
          label: isIt ? 'Come arrivare' : isEn ? 'How to Arrive' : isDe ? 'Anreise' : isFr ? 'Comment arriver' : 'Cómo llegar',
          tag: isIt ? 'Priorità Arrivo' : isEn ? 'Arrival Priority' : isDe ? 'Anreise-Info' : isFr ? 'Priorité Arrivée' : 'Prioridad Llegada',
          desc: isIt ? 'Indirizzo esatto, navigatore GPS, parcheggio e treni' : isEn ? 'Exact address, GPS navigation, parking & trains' : isDe ? 'Genaue Adresse, GPS, Parkplatz & Züge' : isFr ? 'Adresse exacte, GPS, parking et trains' : 'Dirección exacta, GPS, parking y trenes',
          icon: <MapPin className="h-5 w-5" />,
          bgImage: media?.locationCover || '/uploads/location.jpg'
        },
        {
          page: 'check_in',
          label: isIt 
            ? (isPublic ? 'Check-in & Arrivo' : 'Check-in & Smart Lock') 
            : isEn 
            ? (isPublic ? 'Check-in & Arrival' : 'Check-in & Smart Lock') 
            : isDe 
            ? (isPublic ? 'Check-in & Ankunft' : 'Check-in & Smart Lock') 
            : isFr 
            ? (isPublic ? 'Check-in & Arrivée' : 'Check-in & Smart Lock') 
            : (isPublic ? 'Check-in y Llegada' : 'Check-in & Smart Lock'),
          tag: isIt ? 'Accesso Casa' : isEn ? 'Home Access' : isDe ? 'Hauszugang' : isFr ? 'Accès Maison' : 'Acceso Casa',
          desc: isIt 
            ? (isPublic ? 'Orari di arrivo, accoglienza di persona e parcheggio' : 'Codice apriporta, keybox e ingresso autonomo') 
            : isEn 
            ? (isPublic ? 'Arrival times, in-person welcome and parking' : 'Door opener, keybox code & self check-in') 
            : isDe 
            ? (isPublic ? 'Anreise, persönlicher Empfang und Parkplatz' : 'Türöffner, Keybox & Self-Check-in') 
            : isFr 
            ? (isPublic ? 'Horaires d\'arrivée, accueil en personne et parking' : 'Ouvre-porte, boîte à clés & arrivée autonome') 
            : (isPublic ? 'Horarios de llegada, bienvenida en persona y parking' : 'Abrepuertas, keybox y llegada autónoma'),
          icon: <KeyRound className="h-5 w-5" />,
          bgImage: media?.checkInCover || '/uploads/lock.jpg'
        },
        {
          page: 'servizi',
          label: isIt ? 'Servizi casa & Comfort' : isEn ? 'Home Amenities' : isDe ? 'Ausstattung & Komfort' : isFr ? 'Équipements maison' : 'Servicios de la casa',
          tag: isIt ? 'Dotazioni' : isEn ? 'Amenities' : isDe ? 'Ausstattung' : isFr ? 'Équipements' : 'Equipamiento',
          desc: isIt ? 'Riscaldamento, elettrodomestici, cucina e comfort' : isEn ? 'Heating, appliances, kitchen and comforts' : isDe ? 'Heizung, Geräte, Küche & Komfort' : isFr ? 'Chauffage, appareils, cuisine et confort' : 'Calefacción, electrodomésticos y cocina',
          icon: <Wrench className="h-5 w-5" />,
          bgImage: media?.servicesCover || '/uploads/services.jpg'
        },
        {
          page: 'regole',
          label: isIt ? 'Regole della casa' : isEn ? 'House Rules' : isDe ? 'Hausregeln' : isFr ? 'Règles de la maison' : 'Normas de la casa',
          tag: isIt ? 'Orari & Quiete' : isEn ? 'Hours & Quiet' : isDe ? 'Ruhezeiten' : isFr ? 'Horaires & Calme' : 'Horarios y Silencio',
          desc: isIt ? 'Orari di rispetto, rifiuti e divieto di fumo' : isEn ? 'Quiet hours, waste sorting & no smoking' : isDe ? 'Ruhezeiten, Mülltrennung & Rauchverbot' : isFr ? 'Heures de calme, tri des déchets & non fumeur' : 'Horas de silencio y normas',
          icon: <ShieldAlert className="h-5 w-5" />,
          bgImage: media?.rulesCover || 'https://media.istockphoto.com/id/2235883229/it/vettoriale/regolamento-prenota.webp?a=1&b=1&s=612x612&w=0&k=20&c=qjJ-peYXP2tDDXUHH8pNKRx3JxtUvklW6HBjml8EIkg='
        }
      ]
    },
    exploreValtellina: {
      title: isIt ? 'Vivere la Valtellina' : isEn ? 'Explore Valtellina' : isDe ? 'Valtellina erleben' : isFr ? 'Explorer la Valteline' : 'Vivir la Valtelina',
      subtitle: isIt ? 'Gusto, tradizioni e trasporti locali' : isEn ? 'Taste, traditions and local transport' : isDe ? 'Genuss, Tradition & Mobilität' : isFr ? 'Saveurs, traditions et transports' : 'Sabores, tradiciones y transporte',
      items: [
        {
          page: 'ristoranti',
          label: isIt ? 'Dove mangiare & Crotto' : isEn ? 'Where to Eat & Crotti' : isDe ? 'Restaurants & Crotti' : isFr ? 'Où manger & Crotti' : 'Dónde comer y Crotti',
          tag: isIt ? 'Enogastronomia' : isEn ? 'Food & Wine' : isDe ? 'Kulinarik' : isFr ? 'Gastronomie' : 'Gastronomía',
          desc: isIt ? 'Crotto tipico, pizzoccheri, ristoranti e asporto' : isEn ? 'Local crotti, traditional food & delivery' : isDe ? 'Traditionelle Crotti, regionale Küche' : isFr ? 'Crotti typiques, spécialités locales' : 'Crotti típicos y restaurantes',
          icon: <Utensils className="h-5 w-5" />,
          bgImage: media?.restaurantsCover || '/uploads/restaurant.jpg'
        },
        {
          page: 'shopping',
          label: isIt ? 'Spesa e botteghe' : isEn ? 'Shopping & Local Food' : isDe ? 'Einkaufen & Botteghe' : isFr ? 'Courses & Boutiques' : 'Compras y tiendas',
          tag: isIt ? 'Prodotti Tipici' : isEn ? 'Local Products' : isDe ? 'Lokale Produkte' : isFr ? 'Produits locaux' : 'Productos locales',
          desc: isIt ? 'Botteghe storiche del Bitto, alimentari e market' : isEn ? 'Historic Bitto cheese shops & supermarkets' : isDe ? 'Historische Käseläden & Supermärkte' : isFr ? 'Boutiques de fromage Bitto & supermarchés' : 'Tiendas de queso Bitto y mercados',
          icon: <ShoppingBag className="h-5 w-5" />,
          bgImage: media?.shoppingCover || '/uploads/bottega.jpg'
        },
        {
          page: 'trasporti',
          label: isIt ? 'Come muoversi' : isEn ? 'Getting Around' : isDe ? 'Mobilität & Verkehr' : isFr ? 'Se déplacer' : 'Cómo moverse',
          tag: isIt ? 'Treni & Bus' : isEn ? 'Trains & Buses' : isDe ? 'Bahn & Bus' : isFr ? 'Trains & Bus' : 'Trenes y autobuses',
          desc: isIt ? 'Stazione FS Morbegno, orari bus e taxi' : isEn ? 'Morbegno train station, bus lines & taxis' : isDe ? 'Bahnhof Morbegno, Buslinien & Taxi' : isFr ? 'Gare de Morbegno, bus et taxis' : 'Estación de tren y autobuses',
          icon: <Train className="h-5 w-5" />,
          bgImage: media?.transportCover || '/uploads/train.jpg'
        },
        {
          page: 'informazioni',
          label: isIt ? 'Informazioni e servizi' : isEn ? 'Useful Information' : isDe ? 'Nützliche Infos' : isFr ? 'Informations utiles' : 'Información útil',
          tag: isIt ? 'Info Pratiche' : isEn ? 'Practical Info' : isDe ? 'Praktische Infos' : isFr ? 'Infos pratiques' : 'Información práctica',
          desc: isIt ? 'Farmacie, banche, raccolta rifiuti e CIR/CIN' : isEn ? 'Pharmacies, ATMs, recycling and legal CIR' : isDe ? 'Apotheken, Geldautomaten & Müllabfuhr' : isFr ? 'Pharmacies, banques, tri et codes légaux' : 'Farmacias, cajeros y recogida de basuras',
          icon: <Info className="h-5 w-5" />,
          bgImage: media?.infoCover || '/uploads/info.jpg'
        }
      ]
    },
    supportSecurity: {
      title: isIt ? 'Supporto & Sicurezza' : isEn ? 'Support & Safety' : isDe ? 'Support & Sicherheit' : isFr ? 'Support & Sécurité' : 'Soporte y Seguridad',
      subtitle: isIt ? 'Assistenza sempre a portata di mano' : isEn ? 'Assistance always within reach' : isDe ? 'Hilfe jederzeit griffbereit' : isFr ? 'Une assistance toujours à portée' : 'Asistencia siempre a tu alcance',
      items: [
        {
          page: 'contatti',
          label: isIt ? 'Contatta Nino' : isEn ? 'Contact Nino (Host)' : isDe ? 'Nino kontaktieren' : isFr ? 'Contacter Nino' : 'Contactar a Nino',
          tag: isIt ? 'Host Dedicato' : isEn ? 'Dedicated Host' : isDe ? 'Ihr Gastgeber' : isFr ? 'Hôte dédié' : 'Anfitrión dedicado',
          desc: isIt ? 'Assistenza diretta via WhatsApp e telefonica' : isEn ? 'Direct WhatsApp chat and phone assistance' : isDe ? 'Direkter WhatsApp- & Telefonkontakt' : isFr ? 'WhatsApp direct et assistance téléphonique' : 'WhatsApp directo y asistencia telefónica',
          icon: <Phone className="h-5 w-5" />,
          bgImage: media?.hostAvatar || '/uploads/host.jpg'
        },
        {
          page: 'emergenza',
          label: isIt ? 'Emergenze & Numeri utili' : isEn ? 'Emergencies & Numbers' : isDe ? 'Notfall & Notruf' : isFr ? 'Urgences & Numéros' : 'Emergencias y números',
          tag: isIt ? 'Soccorso 24/7' : isEn ? '24/7 Emergency' : isDe ? '24/7 Notdienst' : isFr ? 'Urgence 24/7' : 'Urgencias 24/7',
          desc: isIt ? 'Carabinieri, Ospedale Morbegno, farmacia di turno e 112' : isEn ? 'Carabinieri, Morbegno hospital, on-duty pharmacy & 112' : isDe ? 'Carabinieri, Krankenhaus, Notapotheke & 112' : isFr ? 'Carabinieri, hôpital, pharmacie de garde & 112' : 'Carabinieri, hospital, farmacia de guardia y 112',
          icon: <ShieldAlert className="h-5 w-5" />,
          bgImage: media?.emergencyCover || '/uploads/emergency.jpg'
        }
      ]
    },
    departure: {
      title: isIt ? 'Partenza & Check-out' : isEn ? 'Departure & Check-out' : isDe ? 'Abreise & Check-out' : isFr ? 'Départ & Check-out' : 'Salida y Check-out',
      subtitle: isIt ? 'Istruzioni per la conclusione del soggiorno' : isEn ? 'Instructions for concluding your stay' : isDe ? 'Hinweise zum Ende Ihres Aufenthalts' : isFr ? 'Instructions pour la fin de séjour' : 'Instrucciones para finalizar la estancia',
      items: [
        {
          page: 'check_out',
          label: isIt ? 'Checklist check-out' : isEn ? 'Check-out Checklist' : isDe ? 'Check-out Checkliste' : isFr ? 'Check-list de départ' : 'Checklist de check-out',
          tag: isIt ? `Entro le ${APARTMENT_INFO.checkOutLimit}` : isEn ? `By ${APARTMENT_INFO.checkOutLimit}` : isDe ? `Bis ${APARTMENT_INFO.checkOutLimit}` : isFr ? `Avant ${APARTMENT_INFO.checkOutLimit}` : `Antes de las ${APARTMENT_INFO.checkOutLimit}`,
          desc: isIt ? 'Riconsegna chiavi, orari e recensione del soggiorno' : isEn ? 'Key drop-off, hours and leaving a review' : isDe ? 'Schlüsselrückgabe, Zeiten & Bewertung' : isFr ? 'Remise des clés, horaires et avis' : 'Entrega de llaves y reseña del alojamiento',
          icon: <LogOut className="h-5 w-5" />,
          bgImage: media?.checkOutCover || 'https://media.istockphoto.com/id/2219309082/it/foto/persona-che-esce-di-casa-con-la-valigia-porta-esistente-del-viaggiatore-con-bagagli.webp?a=1&b=1&s=612x612&w=0&k=20&c=dzLdna5DxchqxEUdEZApP6xKCVUfsBbhVQfEI5u0nB8='
        }
      ]
    }
  };
};

const formatPassDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
};

export const ConciergeHome: React.FC<Props> = ({ language, onSelectLanguage, onNavigate, pass, onOpenSmartLock }) => {
  const { media } = useCms();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);
  const [showWifiQr, setShowWifiQr] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [doorState, setDoorState] = useState<'idle' | 'opening' | 'success' | 'error'>('idle');
  const [doorMessage, setDoorMessage] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartedAt = React.useRef(0);
  const isPublic = !pass;
  const firstName = pass?.guestName || 'Ospite';
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const guideSections = getLocalizedGuideSections(language, media, isPublic);
  const isNight = new Date().getHours() >= 22 || new Date().getHours() < 7;
  const isCheckoutDay = pass ? new Date().toISOString().slice(0, 10) === pass.checkOutDate : false;
  const timing = pass ? getStayTiming(pass) : null;
  const isStayActive = timing ? timing.isActive : false;

  const localStories = [
    { 
      title: 'Sentiero Valtellina', 
      meta: t.gridMenu.descriptions.attivita,
      image: '/uploads/sentiero.jpg',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sentiero+Valtellina+Morbegno'
    },
    { 
      title: 'Centro storico', 
      meta: 'Morbegno',
      image: '/uploads/centro.jpg',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Centro+storico+di+Morbegno'
    },
    { 
      title: 'Costiera dei Cèch', 
      meta: t.gridMenu.footerValtellina,
      image: '/uploads/costiera.jpg',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Costiera+dei+Cech+Morbegno'
    }
  ];

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = Math.max(-8, Math.min(8, event.beta || 0));
      const gamma = Math.max(-8, Math.min(8, event.gamma || 0));
      setTilt({ x: gamma / 3, y: beta / 3 });
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const copyWifi = async () => {
    if (!isStayActive) return;
    try {
      await navigator.clipboard?.writeText(APARTMENT_INFO.wifiPassword);
      setWifiCopied(true);
      setShowWifiQr(false);
      setSheet('wifi');
      window.setTimeout(() => setWifiCopied(false), 2200);
    } catch {
      setSheet('wifi');
    }
  };

  const cancelHold = (event?: React.PointerEvent<HTMLButtonElement>) => {
    if (event && event.currentTarget && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
    holdStartedAt.current = 0;
    setHoldProgress(0);
  };

  const runDoorOpen = async () => {
    if (!pass) return;
    const wifiCheck = await checkCasaAuroraWifi();
    if (!wifiCheck.verified) {
      setDoorState('error');
      setDoorMessage(wifiCheck.message);
      window.setTimeout(() => {
        setDoorState('idle');
        setDoorMessage('');
      }, 4500);
      return;
    }

    setDoorState('opening');
    setDoorMessage(t.concierge.doorMessage.sending);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([18, 35, 18]);
    try {
      const res = await fetch('/api/hass/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest: `${pass.guestName} ${pass.guestSurname}`.trim(),
          source: 'Aurora Glass Pass',
          wifiConnected: wifiCheck.verified,
          guestToken: pass.token
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([45, 35, 45, 35, 120]);
        setDoorState('success');
        setDoorMessage(t.concierge.doorMessage.unlocked);
      } else {
        throw new Error(data.error || 'Impossibile completare lo sblocco');
      }
    } catch (err: any) {
      setDoorState('error');
      setDoorMessage(err.message || 'Errore di connessione. Riprova.');
    } finally {
      window.setTimeout(() => {
        setDoorState('idle');
        setDoorMessage('');
      }, 4500);
    }
  };

  const startHold = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (doorState !== 'idle') return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    holdStartedAt.current = Date.now();
    holdTimer.current = setInterval(() => {
      const progress = Math.min(1, (Date.now() - holdStartedAt.current) / 1300);
      setHoldProgress(progress);
      if (progress >= 1) {
        cancelHold();
        void runDoorOpen();
      }
    }, 30);
  };

  useEffect(() => cancelHold, []);

  useEffect(() => {
    if (!sheet) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sheet]);

  const renderPhotoCard = (item: GuideTileItem) => (
    <button
      key={item.page}
      onClick={() => onNavigate(item.page)}
      className="aurora-photo-card group"
      aria-label={item.label}
    >
      <img 
        src={item.bgImage} 
        alt={item.label} 
        loading="lazy" 
        onError={(e) => {
          if (item.page === 'contatti') {
            e.currentTarget.src = '/uploads/host.jpg';
          }
        }}
      />
      <div className="aurora-photo-card-info">
        <span className="aurora-photo-tag">
          {item.tag}
        </span>
        <strong>
          {item.label}
        </strong>
        <small>
          {item.desc}
        </small>
      </div>
    </button>
  );

  return (
    <div className={`aurora-concierge min-h-screen text-white ${isNight ? 'aurora-night' : ''}`}>
      
      {/* Apple Floating Language Trigger */}
      <button 
        className="aurora-floating-language" 
        onClick={() => setLanguageOpen(true)} 
        aria-label={t.concierge.changeLanguage}
      >
        <FlagIcon language={language} className="h-full w-full object-cover" />
      </button>

      <main className="aurora-shell space-y-7 pb-16 pt-6">
        
        {/* Apple Brand Space & Guest Greeting */}
        <section className="aurora-brand-space" aria-label="Aurora in Valtellina">
          <div className="aurora-house-logo">
            <Home className="h-5 w-5 text-[#07110d]" />
          </div>
          <div>
            <p className="aurora-eyebrow">Aurora in Valtellina</p>
            <h1 className="aurora-brand-name">
              {pass 
                ? `${pass.guestName}, ${t.tiles.benvenuto.toLowerCase()}.` 
                : t.concierge.welcomeCity}
            </h1>
          </div>
        </section>

        {/* Departure Reminder Nudge (if today is checkout) */}
        {isCheckoutDay && (
          <button className="stay-nudge" onClick={() => setSheet('luggage')}>
            <Clock3 className="h-4 w-4 text-amber-300 shrink-0" />
            <span>
              <strong>{t.concierge.nudge.checkoutTitle} {APARTMENT_INFO.checkOutLimit}.</strong>
              <small>{t.concierge.nudge.checkoutSub}</small>
            </span>
            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-amber-200" />
          </button>
        )}

        {/* Apple Wallet-Style 3D Glass Pass (only for guests with a pass) */}
        {pass && (
          <section 
            className="glass-pass" 
            style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` } as React.CSSProperties}
          >
          <div className="glass-pass-shine" />
          <div className="relative z-10 flex h-full flex-col justify-between p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  {t.concierge.guestCount} <strong className="ml-1 text-sm text-white">{pass.guestsCount ?? 1}</strong>
                </p>
              </div>
              <div className="glass-chip">
                <BedDouble className="h-4 w-4 text-[#62e6bd]" />
                <span>APT. AURORA</span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-xl border border-white/20 bg-black/30 p-2 sm:p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#62e6bd]">Check-in</p>
                <p className="mt-0.5 text-base font-bold tracking-tight text-white sm:text-lg">
                  {formatPassDate(pass.checkInDate)}
                </p>
                <p className="text-[11px] font-medium text-white/70">{t.concierge.from} {pass.checkInTime && pass.checkInTime !== '15:00' ? pass.checkInTime : '14:00'} (2 PM)</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-black/30 p-2 sm:p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#62e6bd]">Check-out</p>
                <p className="mt-0.5 text-base font-bold tracking-tight text-white sm:text-lg">
                  {formatPassDate(pass.checkOutDate)}
                </p>
                <p className="text-[11px] font-medium text-white/70">{t.concierge.by} {pass.checkOutTime ?? '10:00'}</p>
              </div>
            </div>

            {!isStayActive ? (
              <div className="mt-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-slate-400 text-xs flex flex-col gap-1 items-center justify-center text-center">
                <ShieldAlert className="h-5 w-5 text-amber-500 animate-pulse" />
                <span className="font-bold text-white">Chiavi digitali non attive</span>
                <span>
                  {timing?.isUpcoming 
                    ? `Saranno disponibili dalle ore ${pass.checkInTime || '14:00'} del ${formatPassDate(pass.checkInDate)}`
                    : "Il tuo soggiorno si è concluso. Le chiavi sono state disattivate."}
                </span>
              </div>
            ) : (
              <>
                <button
                  className={`glass-key-button mt-2.5 ${doorState === 'success' ? 'is-success' : ''} ${doorState === 'error' ? 'is-error' : ''}`}
                  onPointerDown={startHold}
                  onPointerUp={cancelHold}
                  onPointerCancel={cancelHold}
                  onPointerLeave={cancelHold}
                  onPointerMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const inside =
                      event.clientX >= rect.left &&
                      event.clientX <= rect.right &&
                      event.clientY >= rect.top &&
                      event.clientY <= rect.bottom;
                    if (!inside) cancelHold(event);
                  }}
                  disabled={doorState === 'opening'}
                >
                  <span className="glass-key-progress" style={{ transform: `scaleX(${holdProgress})` }} />
                  <span className="flex items-center gap-2 relative z-10">
                    <KeyRound className="h-4 w-4" />
                    {t.concierge.doorOpeningState[doorState]}
                  </span>
                  <ArrowUpRight className="h-4 w-4 relative z-10" />
                </button>
                {doorMessage && (
                  <p className={`mt-1.5 text-center text-[11px] ${doorState === 'error' ? 'text-rose-300' : 'text-white/70'}`}>
                    {doorMessage}
                  </p>
                )}
              </>
            )}
          </div>
        </section>
        )}

        {/* Apple Quick Action Controls */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="aurora-eyebrow">{t.gridMenu.readyForYou}</p>
              <h2>{t.gridMenu.guideSectionTitle}</h2>
            </div>
          </div>
          
          <div className={`quick-actions-grid ${isPublic ? 'is-public' : ''}`}>
            {isPublic ? (
              <>
                <a 
                  href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent('Ciao Nino!')}`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <MessageCircle />
                  <span>{t.tiles.contatti}</span>
                  <small>WhatsApp</small>
                </a>

                <a
                  href={APARTMENT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin />
                  <span>{t.tiles.posizione}</span>
                  <small>GPS</small>
                </a>

                <button onClick={() => setSheet('schedule')}>
                  <Clock3 />
                  <span>{t.tiles.regole}</span>
                  <small>Check-out {APARTMENT_INFO.checkOutLimit}</small>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={isStayActive ? copyWifi : undefined}
                  className={!isStayActive ? "opacity-40 cursor-not-allowed" : ""}
                  title={!isStayActive ? "Disponibile solo durante il soggiorno" : ""}
                >
                  <Wifi />
                  <span>{t.tiles.wifi}</span>
                  <small>{!isStayActive ? "Non attivo" : (wifiCopied ? t.actions.copied : t.actions.copy)}</small>
                </button>
                
                <a 
                  href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(`Ciao Nino, sono ${firstName}.`)}`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <MessageCircle />
                  <span>{t.tiles.contatti}</span>
                  <small>WhatsApp</small>
                </a>
                
                <a
                  href={APARTMENT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin />
                  <span>{t.tiles.posizione}</span>
                  <small>GPS</small>
                </a>
                
                <button onClick={() => setSheet('schedule')}>
                  <Clock3 />
                  <span>{t.tiles.regole}</span>
                  <small>Check-out {APARTMENT_INFO.checkOutLimit}</small>
                </button>
              </>
            )}
          </div>
        </section>

        {/* SECTION 1: Guida & Arrivo */}
        <section className="space-y-3">
          <div>
            <p className="aurora-eyebrow">{t.gridMenu.guideSectionTitle}</p>
            <h2>{guideSections.houseEssentials.title}</h2>
            <p className="text-xs text-white/60 mt-0.5">{guideSections.houseEssentials.subtitle}</p>
          </div>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.houseEssentials.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

        {/* SECTION 2: Idee per oggi */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="aurora-eyebrow">{t.gridMenu.categories.explore}</p>
              <h2>{t.tiles.attivita}</h2>
            </div>
            <button 
              onClick={() => onNavigate('attivita')} 
              className="text-xs font-semibold text-[#62e6bd] hover:text-[#93f4d4] flex items-center gap-1 transition"
            >
              {t.actions.backToMenu === 'MENU' ? 'Vedi tutto' : 'See all'} <ChevronRight className="inline h-3.5 w-3.5" />
            </button>
          </div>
          
          <ScrollableTileRow hintLabel="Scorri per altro">
            {localStories.map((story) => (
              <a
                key={story.title} 
                className="aurora-photo-card group"
                href={story.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={story.image} alt={story.title} loading="lazy" />
                <div className="aurora-photo-card-info">
                  <span className="aurora-photo-tag">{t.tiles.attivita}</span>
                  <strong>{story.title}</strong>
                  <small>{story.meta}</small>
                </div>
              </a>
            ))}
          </ScrollableTileRow>
        </section>

        {/* SECTION 3: Vivere la Valtellina */}
        <section className="space-y-3">
          <div>
            <p className="aurora-eyebrow">{t.gridMenu.categories.food}</p>
            <h2>{guideSections.exploreValtellina.title}</h2>
            <p className="text-xs text-white/60 mt-0.5">{guideSections.exploreValtellina.subtitle}</p>
          </div>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.exploreValtellina.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

        {/* SECTION 4: Supporto & Sicurezza */}
        <section className="space-y-3">
          <div>
            <p className="aurora-eyebrow">{t.tiles.contatti}</p>
            <h2>{guideSections.supportSecurity.title}</h2>
            <p className="text-xs text-white/60 mt-0.5">{guideSections.supportSecurity.subtitle}</p>
          </div>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.supportSecurity.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

        {/* SECTION 5: Partenza & Check-out */}
        <section className="space-y-3">
          <div>
            <p className="aurora-eyebrow">{t.tiles.checkOut}</p>
            <h2>{guideSections.departure.title}</h2>
            <p className="text-xs text-white/60 mt-0.5">{guideSections.departure.subtitle}</p>
          </div>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.departure.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

      </main>

      {/* Language Selector Modal */}
      {languageOpen && (
        <>
          <div className="language-popover-backdrop" onClick={() => setLanguageOpen(false)} />
          <div className="language-popover">
            <button className="sheet-close" onClick={() => setLanguageOpen(false)} aria-label={t.concierge.close}>
              <X className="h-4 w-4" />
            </button>
            <p className="aurora-eyebrow">{t.concierge.changeLanguage}</p>
            <h2>{t.selectLanguage}</h2>
            <div className="language-options">
              {languages.map((item) => (
                <button 
                  key={item.id} 
                  className={language === item.id ? 'active' : ''} 
                  onClick={() => { 
                    onSelectLanguage(item.id); 
                    setLanguageOpen(false); 
                  }}
                >
                  <FlagIcon language={item.id} />
                  <span>{item.label}</span>
                  {language === item.id && <Check className="ml-auto h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Sheets (Wi-Fi, Schedule, Luggage) */}
      {sheet && (
        <div className="sheet-backdrop" onClick={() => setSheet(null)}>
          <section className="aurora-sheet" onClick={(event) => event.stopPropagation()}>
            <button className="sheet-close" onClick={() => setSheet(null)} aria-label={t.concierge.close}>
              <X className="h-4 w-4" />
            </button>
            
            {sheet === 'wifi' && (
              <>
                <p className="aurora-eyebrow">Wi-Fi</p>
                <h2>Wi-Fi Casa_Aurora</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {wifiCopied ? t.concierge.sheets.wifiCopiedNotice : t.concierge.sheets.wifiScanNotice}
                </p>
                {showWifiQr ? (
                  <img 
                    className="wifi-qr" 
                    alt="QR Wi-Fi Casa Aurora" 
                    src={`https://quickchart.io/qr?size=220&text=${encodeURIComponent(`WIFI:T:WPA;S:${APARTMENT_INFO.wifiSSID};P:${APARTMENT_INFO.wifiPassword};;`)}`} 
                  />
                ) : (
                  <div className="sheet-value">
                    {APARTMENT_INFO.wifiPassword}
                    <Copy className="h-4 w-4 text-emerald-300" />
                  </div>
                )}
                <button className="sheet-action mt-3" onClick={() => setShowWifiQr(!showWifiQr)}>
                  {showWifiQr ? t.concierge.sheets.copyPwd : t.concierge.sheets.showQr} <Wifi className="h-4 w-4" />
                </button>
              </>
            )}

            {sheet === 'schedule' && (
              <>
                <p className="aurora-eyebrow">{t.concierge.sheets.scheduleEyebrow}</p>
                <h2>{t.concierge.sheets.scheduleTitle}</h2>
                <div className="sheet-list">
                  <span>Check-in <b>{APARTMENT_INFO.checkInStart} - {APARTMENT_INFO.checkInEnd}</b></span>
                  <span>Check-out <b>{t.concierge.by} {APARTMENT_INFO.checkOutLimit}</b></span>
                  <span>{t.concierge.sheets.houseLabel} <b>{t.concierge.sheets.quietHours}</b></span>
                </div>
              </>
            )}

            {sheet === 'luggage' && (
              <>
                <p className="aurora-eyebrow">{t.concierge.sheets.luggageEyebrow}</p>
                <h2>{t.concierge.sheets.luggageTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {t.concierge.sheets.luggageDesc}
                </p>
                <a 
                  className="sheet-action" 
                  href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  {t.concierge.sheets.askNino} <ArrowUpRight className="h-4 w-4" />
                </a>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
