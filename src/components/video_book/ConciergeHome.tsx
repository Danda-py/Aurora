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
  Info,
  Calendar
} from 'lucide-react';
import { Language, WelcomePage, GuestPass } from '../../types';
import { APARTMENT_INFO } from '../../data/apartmentData';
import { FlagIcon } from './FlagIcon';
import { useCms } from '../../context/CmsContext';
import { checkCasaAuroraWifi } from '../../services/wifiDetectionService';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';
import { getStayTiming, isDigitalKeyActive } from '../../services/guestPassService';
import { trackActivity } from '../../services/activityTrackingService';

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
    scrollerRef.current?.scrollBy({ left: scrollerRef.current.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <div className="relative min-w-0">
      <div
        ref={scrollerRef}
        className="flex items-start gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 scroll-pl-4"
        onScroll={updateScrollState}
      >
        <div className="w-4 shrink-0" />
        {children}
        <div className="w-4 shrink-0" />
      </div>
      {canScroll && (
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900/80 border border-white/15 text-emerald-400 backdrop-blur-md shadow-lg transition active:scale-95 cursor-pointer"
          onClick={scrollNext}
          aria-label={hintLabel}
        >
          <ChevronRight className="w-4 h-4" />
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

// Fully localized copy for the mandatory document banners (was previously IT/EN only)
const getDocumentBannerCopy = (lang: Language) => {
  const isIt = lang === 'it';
  const isEn = lang === 'en';
  const isDe = lang === 'de';
  const isFr = lang === 'fr';

  return {
    requiredBadge: isIt ? 'Azione Obbligatoria' : isEn ? 'Required Action' : isDe ? 'Erforderliche Aktion' : isFr ? 'Action Obligatoire' : 'Acción Obligatoria',
    requiredTitle: isIt ? 'Registra i Documenti degli Ospiti' : isEn ? 'Register Guest Documents' : isDe ? 'Gästedokumente registrieren' : isFr ? 'Enregistrer les documents des invités' : 'Registrar los documentos de los huéspedes',
    requiredDesc: isIt
      ? 'La legge italiana richiede la registrazione dei documenti entro 24 ore dall\'arrivo. Registra tutti gli ospiti per abilitare l\'apertura della porta (Smart Lock) e il Wi-Fi fibra ad alta velocità!'
      : isEn
      ? 'Italian law requires registering all guests. Please submit documents for everyone to enable home access (Smart Lock) and high-speed Wi-Fi!'
      : isDe
      ? 'Das italienische Gesetz schreibt die Registrierung aller Gäste vor. Bitte reiche für alle die Dokumente ein, um den Hauszugang (Smart Lock) und das Highspeed-WLAN zu aktivieren!'
      : isFr
      ? 'La loi italienne exige l\'enregistrement de tous les invités. Merci de soumettre les documents de chacun pour activer l\'accès au logement (Smart Lock) et le Wi-Fi haut débit !'
      : 'La ley italiana exige registrar a todos los huéspedes. ¡Envía los documentos de todos para habilitar el acceso a la vivienda (cerradura inteligente) y el Wi-Fi de alta velocidad!',
    requiredCta: isIt ? 'Carica Documenti Ora' : isEn ? 'Upload Documents Now' : isDe ? 'Dokumente jetzt hochladen' : isFr ? 'Télécharger les documents' : 'Subir documentos ahora',
    reviewTitle: isIt ? 'Documenti in fase di verifica' : isEn ? 'Documents under review' : isDe ? 'Dokumente werden geprüft' : isFr ? 'Documents en cours de vérification' : 'Documentos en revisión',
    reviewDesc: isIt
      ? 'Hai caricato i documenti con successo! Il tuo host Nino li sta verificando per abilitare l\'apertura della porta e il Wi-Fi ad alta velocità.'
      : isEn
      ? 'You successfully submitted your documents! Your host Nino is reviewing them shortly to enable door unlocking and high-speed Wi-Fi.'
      : isDe
      ? 'Du hast deine Dokumente erfolgreich übermittelt! Dein Gastgeber Nino prüft sie in Kürze, um die Türöffnung und das Highspeed-WLAN zu aktivieren.'
      : isFr
      ? 'Vous avez envoyé vos documents avec succès ! Votre hôte Nino les vérifie sous peu pour activer l\'ouverture de la porte et le Wi-Fi haut débit.'
      : '¡Enviaste tus documentos correctamente! Tu anfitrión Nino los está revisando en breve para habilitar la apertura de la puerta y el Wi-Fi de alta velocidad.'
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

const mediaTitles: Record<string, { it: string; en: string }> = {
  heroLiving: { it: 'Soggiorno & Living Room', en: 'Living Room' },
  bedroom: { it: 'Camera da Letto', en: 'Master Bedroom' },
  kitchen: { it: 'Cucina Attrezzata', en: 'Fully Equipped Kitchen' },
  bathroom: { it: 'Bagno Moderno', en: 'Bathroom' },
  balcony: { it: 'Terrazzo & Balcone', en: 'Balcony & Outdoor' },
  view: { it: 'Vista & Panorama', en: 'Mountain View' },
  locationCover: { it: 'Valtellina & Morbegno', en: 'Morbegno & Valtellina' },
  checkInCover: { it: 'Ingresso & Smart Lock', en: 'Check-in & Entrance' },
  servicesCover: { it: 'Servizi & Comfort', en: 'Amenities & Comfort' },
  rulesCover: { it: 'Regole della Casa', en: 'House Rules' },
  restaurantsCover: { it: 'Ristoranti & Crotti', en: 'Where to Eat' },
  barsCover: { it: 'Bar & Colazioni', en: 'Cafés & Breakfast' },
  shoppingCover: { it: 'Botteghe & Spesa', en: 'Local Shops & Grocery' },
  activitiesCover: { it: 'Attività & Sentieri', en: 'Activities & Trekking' },
  transportCover: { it: 'Trasporti & Mezzi', en: 'Transport & Connections' },
  infoCover: { it: 'Informazioni Utili', en: 'Useful Info' },
  emergencyCover: { it: 'Emergenza & SOS', en: 'Emergency & Safety' },
  checkOutCover: { it: 'Check-out & Partenza', en: 'Check-out & Departure' }
};

const PhotoCarousel: React.FC<{ media: any; language: Language }> = ({ media, language }) => {
  // 1. Core fixed spaces keys (always included in the carousel, falling back to defaults if not customized)
  const coreKeys = ['heroLiving', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'view'];

  // 2. Extra keys uploaded by the host specifically for the carousel (keys starting with "carousel_img_")
  const extraKeys = Object.keys(media || {}).filter(key => key.startsWith('carousel_img_'));

  // 3. Merge all keys
  const carouselKeys = [...coreKeys, ...extraKeys];

  // 4. Map keys to image objects with localized titles
  const images = carouselKeys
    .map(key => {
      const url = media[key];
      if (!url) return null;

      const titles = mediaTitles[key] || { it: 'Foto Carosello Extra', en: 'Extra Carousel Photo' };
      return {
        url,
        title: language === 'it' ? titles.it : titles.en
      };
    })
    .filter((img): img is { url: string; title: string } => img !== null && Boolean(img.url));

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // If images.length > 1, clone first slide to end and last slide to start
  const slides = images.length > 1
    ? [images[images.length - 1], ...images, images[0]]
    : images;

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Set initial scroll to first real slide (index 1)
  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller && images.length > 1) {
      const setInitialScroll = () => {
        if (scroller.clientWidth > 0) {
          scroller.scrollLeft = scroller.clientWidth;
        } else {
          // If not ready yet, retry next frame
          requestAnimationFrame(setInitialScroll);
        }
      };
      setInitialScroll();
    }
  }, [images.length]);

  // Handle window resizing to keep the current slide aligned
  useEffect(() => {
    const handleResize = () => {
      const scroller = scrollRef.current;
      if (scroller && images.length > 1) {
        scroller.scrollLeft = (currentIndex + 1) * scroller.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, images.length]);

  const goNext = () => {
    const scroller = scrollRef.current;
    if (scroller && images.length > 1) {
      const width = scroller.clientWidth;
      if (width > 0) {
        scroller.scrollTo({
          left: (currentIndex + 2) * width,
          behavior: 'smooth'
        });
      }
    }
  };

  const goPrev = () => {
    const scroller = scrollRef.current;
    if (scroller && images.length > 1) {
      const width = scroller.clientWidth;
      if (width > 0) {
        scroller.scrollTo({
          left: currentIndex * width,
          behavior: 'smooth'
        });
      }
    }
  };

  // Auto-scroll every 4.5s
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      goNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [currentIndex, images.length]);

  // Track page on manual swipe and perform seamless instant resets on boundaries when scroll has settled
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scroller = e.currentTarget;
    const width = scroller.clientWidth;
    if (width > 0 && images.length > 1) {
      const scrollLeft = scroller.scrollLeft;
      
      // Calculate closest integer index
      const index = Math.round(scrollLeft / width);
      
      // Update indicators immediately during scrolling for responsiveness
      const originalIndex = index - 1;
      if (originalIndex >= 0 && originalIndex < images.length) {
        if (originalIndex !== currentIndex) {
          setCurrentIndex(originalIndex);
        }
      } else if (originalIndex === -1) {
        if (currentIndex !== images.length - 1) {
          setCurrentIndex(images.length - 1);
        }
      } else if (originalIndex === images.length) {
        if (currentIndex !== 0) {
          setCurrentIndex(0);
        }
      }

      // Debounce the boundary silent jump to ensure ongoing smooth scrolls do not conflict
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        const currentScrollLeft = scroller.scrollLeft;
        const currentWidth = scroller.clientWidth;
        if (currentWidth > 0) {
          const roundedIndex = Math.round(currentScrollLeft / currentWidth);
          
          // Left boundary: we settled at the clone of the last image (index 0)
          if (roundedIndex === 0) {
            scroller.scrollLeft = images.length * currentWidth;
          } 
          // Right boundary: we settled at the clone of the first image (index N + 1)
          else if (roundedIndex === images.length + 1) {
            scroller.scrollLeft = currentWidth;
          }
        }
      }, 100);
    }
  };

  const goToSlide = (idx: number) => {
    const scroller = scrollRef.current;
    if (scroller && images.length > 1) {
      scroller.scrollTo({
        left: (idx + 1) * scroller.clientWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(idx);
    }
  };

  if (images.length === 0) return null;

  return (
    <div className="relative w-full aspect-16/10 sm:aspect-16/9 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 group">
      {/* Slides (Touch Scrollable with Snap Points) */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
      >
        {slides.map((img, idx) => (
          <div
            key={idx}
            className="w-full h-full snap-start shrink-0 relative"
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Dark vignette to overlay title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 z-20 text-left">
              <span className="text-[10px] font-mono tracking-widest text-[#86868b] uppercase block">CASA AURORA</span>
              <h4 className="text-sm sm:text-base font-black text-white drop-shadow-md mt-0.5">
                {img.title}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Controls */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-white/10 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs border border-white/10 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Indicators */}
          {images.length <= 10 ? (
            /* Dots Indicator */
            <div className="absolute bottom-4 right-4 z-20 flex gap-1.5 bg-black/25 backdrop-blur-xs px-2 py-1.5 rounded-full border border-white/5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? 'bg-emerald-400 w-3' : 'bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          ) : (
            /* Numeric Indicator Badge (Fraction style like Apple Photos) */
            <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold font-mono text-emerald-400 shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const cardTranslations: Record<Language, { cardLabel: string; holder: string; booking: string; validity: string; in: string; out: string; to: string }> = {
  it: { cardLabel: "TESSERA OSPITE", holder: "TITOLARE", booking: "CODICE PRENOTAZIONE", validity: "PERIODO DI SOGGIORNO", in: "Check-in", out: "Check-out", to: "al" },
  en: { cardLabel: "GUEST PASS", holder: "GUEST HOLDER", booking: "BOOKING CODE", validity: "STAY PERIOD", in: "Check-in", out: "Check-out", to: "to" },
  de: { cardLabel: "GÄSTEKARTE", holder: "INHABER", booking: "BUCHUNGSCODE", validity: "AUFENTHALTSDAUER", in: "Check-in", out: "Check-out", to: "bis" },
  fr: { cardLabel: "CARTE D'INVITÉ", holder: "TITULAIRE", booking: "CODE DE RÉSERVATION", validity: "PÉRIODE DE SÉJOUR", in: "Arrivée", out: "Départ", to: "au" },
  es: { cardLabel: "TARJETA DE HUÉSPED", holder: "TITULAR", booking: "CÓDIGO DE RESERVA", validity: "PERÍODO DE ESTANCIA", in: "Entrada", out: "Salida", to: "al" }
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
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const holdTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartedAt = React.useRef(0);

  const handleDoorClick = () => {
    if (!isCheckinConfirmed) {
      const msg = {
        it: "L'apriporta digitale sarà abilitato non appena l'host Nino avrà verificato i tuoi documenti e confermato il check-in.",
        en: "The digital key will be enabled as soon as host Nino has verified your documents and confirmed the check-in.",
        de: "Der digitale Türöffner wird aktiviert, sobald Gastgeber Nino Ihre Dokumente überprüft und den Check-in bestätigt hat.",
        fr: "La clé digitale sera activée dès que l'hôte Nino aura vérifié vos documents et enregistré l'arrivée.",
        es: "La llave digital se habilitará tan pronto como el anfitrión Nino haya verificado sus documentos y confirmado el registro."
      }[language] || "Check-in non confermato dall'host.";
      setAlertMessage(msg);
      setTimeout(() => setAlertMessage(null), 5500);
    }
  };

  const handleWifiClick = () => {
    if (!isWifiActive) {
      const msg = {
        it: "La password del Wi-Fi fibra sarà visibile non appena l'host Nino avrà confermato il check-in.",
        en: "The high-speed Wi-Fi password will be visible as soon as host Nino confirms your check-in.",
        de: "Das Highspeed-WLAN-Passwort wird sichtbar, sobald Gastgeber Nino den Check-in bestätigt.",
        fr: "Le mot de passe du Wi-Fi haut débit sera visible dès que l'hôte Nino aura validé l'enregistrement.",
        es: "La contraseña del Wi-Fi de alta velocidad estará visible tan pronto como el anfitrión Nino confirme el registro."
      }[language] || "Check-in non confermato dall'host.";
      setAlertMessage(msg);
      setTimeout(() => setAlertMessage(null), 5500);
    } else {
      void copyWifi();
    }
  };
  const isPublic = !pass;
  const firstName = pass?.guestName || 'Ospite';
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const guideSections = getLocalizedGuideSections(language, media, isPublic);
  const isNight = new Date().getHours() >= 22 || new Date().getHours() < 7;
  const isCheckoutDay = pass ? new Date().toISOString().slice(0, 10) === pass.checkOutDate : false;
  const timing = pass ? getStayTiming(pass) : null;
  const isStayActive = timing ? timing.isActive : false;
  const isCheckinConfirmed = pass ? Boolean(pass.checkInConfirmed) : false;
  // Digital keys (Smart Lock / Wi-Fi) require BOTH the host's check-in confirmation
  // AND the guest's documents to be submitted - confirming check-in alone is not enough.
  const isKeysReady = pass ? isDigitalKeyActive(pass) : false;
  const isWifiActive = isStayActive && isKeysReady;
  // The mandatory "Required Action" banner should stay hidden until the check-in day itself.
  const isCheckinDayOrLater = pass ? new Date().toISOString().slice(0, 10) >= pass.checkInDate : false;
  const docBanner = getDocumentBannerCopy(language);

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
    if (!isWifiActive) return;
    try {
      await navigator.clipboard?.writeText(APARTMENT_INFO.wifiPassword);
      setWifiCopied(true);
      setShowWifiQr(false);
      setSheet('wifi');
      trackActivity(pass, 'wifi_copy');
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

    setDoorState('opening');
    if (!wifiCheck.verified) {
      setDoorMessage(language === 'it' ? "Wi-Fi non rilevato. Invio tramite rete mobile..." : "Wi-Fi not detected. Unlocking via mobile network fallback...");
    } else {
      setDoorMessage(t.concierge.doorMessage.sending);
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([18, 35, 18]);
    try {
      const res = await fetch('/api/hass/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest: `${pass.guestName} ${pass.guestSurname}`.trim(),
          source: wifiCheck.verified 
            ? (wifiCheck.method === 'gps' ? `Aurora Glass Pass (GPS ${wifiCheck.distanceMeters}m)` : 'Aurora Glass Pass (Wi-Fi Verificato)') 
            : 'Aurora Glass Pass (Rete Mobile Backup)',
          wifiConnected: wifiCheck.verified,
          guestToken: pass.token,
          coords: wifiCheck.coords,
          latitude: wifiCheck.coords?.latitude,
          longitude: wifiCheck.coords?.longitude,
          accuracy: wifiCheck.coords?.accuracy
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([45, 35, 45, 35, 120]);
        setDoorState('success');
        setDoorMessage(t.concierge.doorMessage.unlocked);
        trackActivity(pass, 'smart_lock_open_success');
      } else {
        throw new Error(data.error || 'Impossibile completare lo sblocco');
      }
    } catch (err: any) {
      setDoorState('error');
      setDoorMessage(err.message || 'Errore di connessione. Riprova.');
      trackActivity(pass, 'smart_lock_open_error', err?.message);
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
      className="relative flex-shrink-0 w-[240px] sm:w-[270px] aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 group cursor-pointer shadow-xl transition-all duration-300 active:scale-[0.96] text-left snap-start"
      aria-label={item.label}
    >
      <img 
        src={item.bgImage} 
        alt={item.label} 
        loading="lazy" 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          if (item.page === 'contatti') {
            e.currentTarget.src = '/uploads/host.jpg';
          }
        }}
      />
      {/* Dark gradient for text readability without obscuring photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1 z-10 pointer-events-none">
        <strong className="text-sm sm:text-base font-bold text-white tracking-tight truncate drop-shadow-md">
          {item.label}
        </strong>
        <p className="text-[11px] text-white/70 line-clamp-1 leading-snug">
          {item.desc}
        </p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-emerald-500/25 selection:text-emerald-200">
      
      {/* Floating Accessible Warning Notification Banner */}
      {alertMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top duration-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1 text-left">{alertMessage}</div>
          <button onClick={() => setAlertMessage(null)} className="p-1 rounded-full hover:bg-white/10 text-zinc-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Smartphone-first centered container with unified vertical rhythm */}
      <main className="w-full max-w-[440px] mx-auto px-4 pt-3 pb-24 space-y-6">
        
        {/* 1. Header: Frosted Glass Floating Bar */}
        <header className="sticky top-2 z-30 w-full backdrop-blur-md bg-zinc-900/70 border border-white/10 rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Home className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white tracking-tight truncate">
                {pass 
                  ? `${pass.guestName}, ${t.tiles.benvenuto.toLowerCase()}` 
                  : t.concierge.welcomeCity}
              </h1>
            </div>
          </div>

          <button 
            onClick={() => setLanguageOpen(true)} 
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition active:scale-95 shrink-0 ml-2"
            aria-label={t.concierge.changeLanguage}
          >
            <FlagIcon language={language} className="w-3.5 h-3.5 rounded-full object-cover" />
            <span className="text-[11px] font-semibold uppercase text-zinc-300">{language}</span>
          </button>
        </header>

        {/* Mandatory Check-in Document Banner */}
        {pass && isCheckinDayOrLater && !pass.documentsUploaded && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col gap-2.5 shadow-xl">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3 h-3" /> {docBanner.requiredBadge}
              </span>
              <h3 className="text-xs font-bold text-white tracking-tight">
                {docBanner.requiredTitle}
              </h3>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {docBanner.requiredDesc}
              </p>
            </div>
            <button 
              onClick={() => onNavigate('check_in')} 
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-98 shadow-md border-0"
            >
              <span>{docBanner.requiredCta}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {pass && pass.documentsUploaded && !isCheckinConfirmed && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 shadow-xl">
            <Clock3 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-white">
                {docBanner.reviewTitle}
              </h3>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {docBanner.reviewDesc}
              </p>
            </div>
          </div>
        )}

        {/* Departure Reminder Nudge */}
        {isCheckoutDay && (
          <button 
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-left transition active:scale-98"
            onClick={() => setSheet('luggage')}
          >
            <Clock3 className="h-4 w-4 text-amber-300 shrink-0" />
            <div className="flex-1 min-w-0">
              <strong className="block text-xs font-semibold text-white truncate">
                {t.concierge.nudge.checkoutTitle} {APARTMENT_INFO.checkOutLimit}
              </strong>
              <small className="block text-[11px] text-zinc-400 truncate">
                {t.concierge.nudge.checkoutSub}
              </small>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
          </button>
        )}

        {/* 2. Stay Info & Status Widget: Card utente con forma di tessera, alta trasparenza e apriporta integrato */}
        {pass && (
          <div 
            className="relative w-full aspect-[1.38/1] rounded-3xl border border-white/10 overflow-hidden p-5 sm:p-6 shadow-2xl flex flex-col justify-between bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-500"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(9, 13, 19, 0.62), rgba(9, 13, 19, 0.72)), url(${media.view || '/uploads/valtellina.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Sheen */}
            <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />

            {/* Top Row: General info */}
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-mono font-bold tracking-widest text-zinc-300/80 uppercase">
                {cardTranslations[language]?.cardLabel || "TESSERA OSPITE"}
              </span>
              <span className="text-xs font-black tracking-widest text-white/95 uppercase font-mono bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">APT. AURORA</span>
            </div>

            {/* Middle Row: Guest Name, Booking Code, and Dates Side-By-Side */}
            <div className="grid grid-cols-2 gap-3 z-10 py-1">
              {/* Left Side: Name and Ref */}
              <div className="space-y-1.5 text-left min-w-0">
                <div className="min-w-0">
                  <p className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                    {cardTranslations[language]?.holder || "TITOLARE"}
                  </p>
                  <div className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate drop-shadow-md">
                    {pass.guestName} {pass.guestSurname}
                  </div>
                </div>
                {pass.bookingRef && (
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                      {cardTranslations[language]?.booking || "PRENOTAZIONE"}
                    </p>
                    <div className="text-xs sm:text-sm font-mono font-black text-white/90 tracking-wider drop-shadow-md">
                      {pass.bookingRef}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Stay Dates */}
              <div className="space-y-1 text-right shrink-0">
                <p className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                  {cardTranslations[language]?.validity || "PERIODO DI SOGGIORNO"}
                </p>
                <div className="text-xs sm:text-sm font-bold text-white tracking-tight drop-shadow-md font-mono">
                  <div>{formatPassDate(pass.checkInDate)} ({pass.checkInTime && pass.checkInTime !== '15:00' ? pass.checkInTime : '14:00'})</div>
                  <div className="text-zinc-400 font-medium my-0.5">
                    {cardTranslations[language]?.to || "al"}
                  </div>
                  <div>{formatPassDate(pass.checkOutDate)} ({pass.checkOutTime ?? '10:00'})</div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Smart Lock Door Opener inside the card! */}
            <div className="z-10 pt-1.5 w-full">
              {!isStayActive ? (
                <div className="w-full flex items-center justify-center p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs sm:text-sm font-bold text-center">
                  <ShieldAlert className="w-4 h-4 shrink-0 mr-1.5 animate-pulse" />
                  <span>{t.concierge.keysNotActive}</span>
                </div>
              ) : (
                <>
                  <button
                    className={`relative flex w-full items-center justify-between px-3.5 py-3 overflow-hidden font-black rounded-xl transition active:scale-[0.98] cursor-pointer shadow-md ${
                      !isCheckinConfirmed
                        ? 'bg-zinc-800/80 text-zinc-400 border border-white/5 hover:bg-zinc-800'
                        : doorState === 'success'
                        ? 'bg-emerald-300 text-zinc-950 shadow-md shadow-emerald-500/20'
                        : doorState === 'error'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 hover:shadow-md hover:shadow-emerald-500/20'
                    }`}
                    onPointerDown={isCheckinConfirmed ? startHold : handleDoorClick}
                    onPointerUp={isCheckinConfirmed ? cancelHold : undefined}
                    onPointerCancel={isCheckinConfirmed ? cancelHold : undefined}
                    onPointerLeave={isCheckinConfirmed ? cancelHold : undefined}
                    onPointerMove={isCheckinConfirmed ? (event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      const inside =
                        event.clientX >= rect.left &&
                        event.clientX <= rect.right &&
                        event.clientY >= rect.top &&
                        event.clientY <= rect.bottom;
                      if (!inside) cancelHold(event);
                    } : undefined}
                    disabled={doorState === 'opening'}
                  >
                    <span 
                      className="absolute inset-0 bg-black/15 origin-left pointer-events-none transition-transform duration-75" 
                      style={{ transform: `scaleX(${holdProgress})` }} 
                    />
                    <span className="flex items-center gap-2.5 relative z-10 text-xs sm:text-sm font-black">
                      <KeyRound className="w-4 h-4" />
                      {!isCheckinConfirmed 
                        ? (language === 'it' ? 'In attesa di conferma check-in' : 'Check-in pending')
                        : t.concierge.doorOpeningState[doorState]}
                    </span>
                    <ArrowUpRight className="w-4 h-4 relative z-10" />
                  </button>
                  {doorMessage && (
                    <p className={`text-center text-[11px] font-bold pt-1 ${doorState === 'error' ? 'text-rose-400' : 'text-zinc-300'}`}>
                      {doorMessage}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 3. Quick Actions: 2x3 Grid layout for both pass and non-pass users */}
        <section className="space-y-2">
          <p className="text-[10px] font-mono tracking-widest text-[#86868b] uppercase pl-1">Azioni Rapide</p>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Wi-Fi Action (Row 1, Col 1) */}
            <button 
              onClick={isPublic ? undefined : handleWifiClick}
              disabled={isPublic}
              className={`flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:border-white/20 active:scale-95 transition-all text-left cursor-pointer ${isPublic ? "opacity-40 cursor-not-allowed" : ""}`}
              title={isPublic ? "Disabilitato senza pass" : "Copia password Wi-Fi"}
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight truncate">
                {isPublic ? t.tiles.wifi : (wifiCopied ? (language === 'it' ? 'Copiata!' : 'Copied!') : t.tiles.wifi)}
              </span>
            </button>

            {/* Prenotazioni (Row 1, Col 2) */}
            <a
              href="https://aurorainvaltellina.it"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:border-white/20 active:scale-95 transition-all cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight truncate">
                {t.tiles.prenota || (language === 'it' ? 'Prenotazioni' : 'Bookings')}
              </span>
            </a>

            {/* Contatti (Row 2, Col 1) */}
            <a 
              href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(isPublic ? 'Ciao Nino!' : `Ciao Nino, sono ${firstName}.`)}`} 
              target="_blank" 
              rel="noreferrer"
              onClick={() => { if (!isPublic) trackActivity(pass, 'whatsapp_contact'); }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:border-white/20 active:scale-95 transition-all cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight truncate">{t.tiles.contatti}</span>
            </a>

            {/* Regole (Row 2, Col 2) */}
            <button 
              onClick={() => { setSheet('schedule'); if (!isPublic) trackActivity(pass, 'house_rules_view'); }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:border-white/20 active:scale-95 transition-all cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#30d158] shrink-0">
                <Clock3 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight truncate">{t.tiles.regole}</span>
            </button>

            {/* Posizione (Row 3, Col 1) */}
            <a
              href={APARTMENT_INFO.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => { if (!isPublic) trackActivity(pass, 'maps_open'); }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:border-white/20 active:scale-95 transition-all cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight truncate">{t.tiles.posizione}</span>
            </a>

            {/* Emergenze (Row 3, Col 2 - RED) */}
            <button 
              onClick={() => { onNavigate('emergenza'); if (!isPublic) trackActivity(pass, 'button_click', '[QuickAction] Emergenze'); }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 hover:bg-rose-900/25 hover:border-rose-400 active:scale-95 transition-all cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-rose-300 tracking-tight truncate">
                {t.tiles.emergenza || (language === 'it' ? 'Emergenza' : 'Emergency')}
              </span>
            </button>
          </div>
        </section>

        {/* Photo Carousel (Moved below quick actions) */}
        <PhotoCarousel media={media} language={language} />



        {/* 4. Sezioni di Contenuto & Card Carousel */}
        {/* SECTION 1: Guida Casa */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {guideSections.houseEssentials.title}
          </h2>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.houseEssentials.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

        {/* SECTION 2: Idee per oggi */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t.tiles.attivita}
            </h2>
            <button 
              onClick={() => onNavigate('attivita')} 
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              {t.actions.backToMenu === 'MENU' ? 'Vedi tutto' : 'See all'} <ChevronRight className="inline h-3.5 w-3.5" />
            </button>
          </div>
          
          <ScrollableTileRow hintLabel="Scorri per altro">
            {localStories.map((story) => (
              <a
                key={story.title} 
                className="relative flex-shrink-0 w-[240px] sm:w-[270px] aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 group cursor-pointer shadow-xl transition-all duration-300 active:scale-[0.96] text-left snap-start block"
                href={story.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img 
                  src={story.image} 
                  alt={story.title} 
                  loading="lazy" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1 z-10 pointer-events-none">
                  <strong className="text-sm sm:text-base font-bold text-white tracking-tight truncate drop-shadow-md">
                    {story.title}
                  </strong>
                  <p className="text-[11px] text-white/70 line-clamp-1 leading-snug">
                    {story.meta}
                  </p>
                </div>
              </a>
            ))}
          </ScrollableTileRow>
        </section>

        {/* SECTION 3: Esplora Valtellina */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {guideSections.exploreValtellina.title}
          </h2>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.exploreValtellina.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

        {/* SECTION 4: Supporto & Sicurezza */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {guideSections.supportSecurity.title}
          </h2>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.supportSecurity.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

        {/* SECTION 5: Partenza & Check-out */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {guideSections.departure.title}
          </h2>
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
                  onClick={() => trackActivity(pass, 'whatsapp_contact')}
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
