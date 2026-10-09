import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckSquare,
  CheckCircle2,
  DoorOpen,
  Navigation,
  Square,
  UserRound,
  Users,
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
import { DEFAULT_MEDIA_MAP } from '../../data/defaultMediaMap';
import { checkCasaAuroraWifi } from '../../services/wifiDetectionService';
import { EditableElement } from '../visual-cms/EditableElement';
import { EditableImageOverlay } from '../visual-cms/EditableImageOverlay';
import { EditableIcon } from '../visual-cms/EditableIcon';
import { useEditMode } from '../visual-cms/EditModeContext';
import { InlineTimePicker } from '../visual-cms/InlineTimePicker';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';
import { BOOK_DATA } from '../../data/multilingualBookData';
import { getStayTiming, isDigitalKeyActive } from '../../services/guestPassService';
import { trackActivity } from '../../services/activityTrackingService';

interface Props {
  language: Language;
  onSelectLanguage: (language: Language) => void;
  onNavigate: (page: WelcomePage) => void;
  pass?: GuestPass | null;
  onOpenSmartLock: () => void;
  /** Modalità editor (Visual CMS): evidenzia gli elementi selezionabili. */
  isEditMode?: boolean;
}

type Sheet = 'wifi' | 'schedule' | 'luggage' | 'checkout' | 'guest' | null;

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
        <div className="w-4 self-stretch shrink-0" />
        {children}
        <div className="w-4 self-stretch shrink-0" />
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
          bgImage: '/uploads/map.jpg'
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
            <CarouselSlideImage slideKey={carouselKeys[idx - (images.length > 1 ? 1 : 0)] ?? `slide-${idx}`} fallback={img.url} alt={img.title} />
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

export const ConciergeHome: React.FC<Props> = ({ language, onSelectLanguage, onNavigate, pass, onOpenSmartLock, isEditMode = false }) => {
  const media = DEFAULT_MEDIA_MAP;
  // Override immagini CMS (es. foto delle storie locali sostituite dall'host).
  const { images: cmsImages } = useEditMode();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedGuestIndex, setSelectedGuestIndex] = useState(0);
  const [checkoutItems, setCheckoutItems] = useState<Record<string, boolean>>(() => {
    if (!pass || typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(`aurora_checkout_${pass.id}`) || '{}');
    } catch {
      return {};
    }
  });
  const [now, setNow] = useState(() => new Date());
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
  const timing = pass ? getStayTiming(pass, now) : null;
  const isStayActive = timing ? timing.isActive : false;
  const isCheckinConfirmed = pass ? Boolean(pass.checkInConfirmed) : false;
  // Digital keys (Smart Lock / Wi-Fi) require BOTH the host's check-in confirmation
  // AND the guest's documents to be submitted - confirming check-in alone is not enough.
  const isKeysReady = pass ? isDigitalKeyActive(pass) : false;
  const isWifiActive = isStayActive && isKeysReady;
  const docBanner = getDocumentBannerCopy(language);
  const isCheckinApproved = isCheckinConfirmed && Boolean(pass?.documentsUploaded);
  const stayGuests = pass?.documentsData || [];
  const selectedGuest = stayGuests[selectedGuestIndex] || stayGuests[0];
  const checkoutAt = pass ? (() => {
    const [year, month, day] = pass.checkOutDate.split('-').map(Number);
    const [hour, minute] = (pass.checkOutTime || APARTMENT_INFO.checkOutLimit).split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute || 0);
  })() : null;
  const checkoutMsRemaining = checkoutAt ? checkoutAt.getTime() - now.getTime() : Infinity;
  const showCheckoutReminder = Boolean(pass && pass.checkInConfirmed && checkoutMsRemaining >= 0 && checkoutMsRemaining <= 24 * 60 * 60 * 1000);
  const checkoutList = BOOK_DATA[language].checkOut.checklist;
  const checkoutDoneCount = checkoutList.filter((_, index) => checkoutItems[String(index)]).length;
  const checkoutMood = checkoutDoneCount === checkoutList.length ? '😄' : checkoutDoneCount >= checkoutList.length * 0.67 ? '🙂' : checkoutDoneCount >= checkoutList.length * 0.34 ? '😐' : checkoutDoneCount > 0 ? '🙁' : '😢';
  const checkoutHours = Math.max(0, Math.floor(checkoutMsRemaining / (60 * 60 * 1000)));
  const checkoutMinutes = Math.max(0, Math.floor((checkoutMsRemaining % (60 * 60 * 1000)) / (60 * 1000)));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!pass) {
      setCheckoutItems({});
      return;
    }
    try {
      setCheckoutItems(typeof window === 'undefined' ? {} : JSON.parse(localStorage.getItem(`aurora_checkout_${pass.id}`) || '{}'));
    } catch {
      setCheckoutItems({});
    }
  }, [pass?.id]);

  const toggleCheckoutItem = (index: number) => {
    setCheckoutItems(current => {
      const updated = { ...current, [String(index)]: !current[String(index)] };
      if (pass && typeof window !== 'undefined') localStorage.setItem(`aurora_checkout_${pass.id}`, JSON.stringify(updated));
      return updated;
    });
  };

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
    <EditableElement key={item.page} id={`home.tile-${item.page}`} label={item.label} className="rounded-3xl shrink-0 snap-start">
    <button
      onClick={() => onNavigate(item.page)}
      className="relative flex-shrink-0 w-[240px] sm:w-[270px] aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 group cursor-pointer shadow-xl transition-all duration-300 active:scale-[0.96] text-left snap-start"
      aria-label={item.label}
    >
      <TileImage page={item.page} fallback={item.bgImage} alt={item.label} />
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
    </EditableElement>
  );

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-emerald-500/25 selection:text-emerald-200">
      
      {/* Avviso stato azioni accessibili */}
      {alertMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-zinc-900/95 p-4 text-xs font-bold text-amber-100 shadow-2xl">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
          <div className="flex-1">{alertMessage}</div>
          <button onClick={() => setAlertMessage(null)} className="rounded-full p-1 text-zinc-400 hover:bg-white/10" aria-label={t.concierge.close}><X className="h-4 w-4" /></button>
        </div>
      )}

      <main className="mx-auto min-h-screen w-full max-w-[480px] space-y-5 px-4 pb-24 pt-4 text-white">
        {/* Area 1: saluto, icona anonima e lingua */}
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 shadow-xl">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-200">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Casa Aurora</span>
              <h1 className="truncate text-base font-bold text-white">{language === 'it' ? 'Benvenuto' : language === 'en' ? 'Welcome' : language === 'de' ? 'Willkommen' : language === 'fr' ? 'Bienvenue' : 'Bienvenido'}{pass ? ` ${pass.guestName}` : ''}</h1>
            </div>
          </div>
          {!isEditMode && (
            <button onClick={() => setLanguageOpen(true)} className="ml-2 flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 hover:bg-white/10" aria-label={t.concierge.changeLanguage}>
              <FlagIcon language={language} className="h-4 w-4 rounded-full object-cover" />
              <span className="text-[11px] font-bold uppercase text-zinc-300">{language}</span>
            </button>
          )}
        </header>

        {/* Area 2: banner check-in rosso → revisione arancione → confermato verde */}
        {pass && (() => {
          const status = isCheckinApproved ? 'approved' : pass.documentsUploaded ? 'review' : 'required';
          const daysRemaining = Math.max(0, Math.ceil((new Date(`${pass.checkInDate}T00:00:00`).getTime() - new Date(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00`).getTime()) / (24 * 60 * 60 * 1000)));
          const statusStyle = status === 'approved'
            ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-100'
            : status === 'review'
              ? 'border-amber-400/35 bg-amber-500/15 text-amber-100'
              : 'border-rose-400/35 bg-rose-500/15 text-rose-100';
          const statusTitle = status === 'approved'
            ? (language === 'it' ? 'Check-in confermato' : 'Check-in confirmed')
            : status === 'review'
              ? docBanner.reviewTitle
              : (language === 'it' ? 'Completa il check-in' : 'Complete your check-in');
          const statusDescription = status === 'approved'
            ? (language === 'it' ? 'I tuoi documenti sono stati verificati. Le informazioni del soggiorno sono qui sotto.' : 'Your documents have been verified. Stay details are below.')
            : status === 'review'
              ? docBanner.reviewDesc
              : `${language === 'it' ? 'Mancano' : 'In'} ${daysRemaining} ${language === 'it' ? (daysRemaining === 1 ? 'giorno' : 'giorni') : 'days'} ${language === 'it' ? 'al check-in.' : 'until check-in.'} ${docBanner.requiredDesc}`;
          return (
            <button type="button" onClick={() => onNavigate('check_in')} className={`w-full rounded-2xl border p-4 text-left shadow-lg transition active:scale-[0.99] ${statusStyle}`} aria-label={statusTitle}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/10">
                  {status === 'approved' ? <CheckCircle2 className="h-5 w-5" /> : status === 'review' ? <Clock3 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold">{statusTitle}</span>
                  <span className="mt-1 block text-xs leading-relaxed opacity-80">{statusDescription}</span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 opacity-70" />
              </div>
              {status === 'required' && <span className="mt-3 inline-flex rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white">{docBanner.requiredCta}</span>}
            </button>
          );
        })()}

        {/* Tessera soggiorno: visibile a ogni ospite con pass valido, anche prima
            dell'approvazione del check-in, così i dati personali (date, codice
            prenotazione, numero ospiti) restano privati e consultabili.
            Le quattro azioni (apri porta / Wi-Fi / documenti) restano invece bloccate
            fino a documenti inviati + conferma host (isCheckinApproved). */}
        {pass && !isCheckinApproved && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/75 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300">
                  <UserRound className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-300">{language === 'it' ? 'La tua prenotazione' : 'Your booking'}</span>
                  <h2 className="truncate text-lg font-bold">{`${pass.guestName} ${pass.guestSurname}`.trim()}</h2>
                  <span className="mt-0.5 block text-xs text-zinc-400">{pass.bookingRef || '—'} · {pass.guestsCount || 1} {language === 'it' ? ((pass.guestsCount || 1) === 1 ? 'ospite' : 'ospiti') : ((pass.guestsCount || 1) === 1 ? 'guest' : 'guests')}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <div><span className="block text-[10px] uppercase tracking-wider text-zinc-500">{language === 'it' ? 'Check-in' : 'Check-in'}</span><strong className="mt-1 block text-sm">{formatPassDate(pass.checkInDate)} · {pass.checkInTime || '14:00'}</strong></div>
                <div><span className="block text-[10px] uppercase tracking-wider text-zinc-500">{language === 'it' ? 'Check-out' : 'Check-out'}</span><strong className="mt-1 block text-sm">{formatPassDate(pass.checkOutDate)} · {pass.checkOutTime || APARTMENT_INFO.checkOutLimit}</strong></div>
              </div>
              <button type="button" onClick={() => onNavigate('check_in')} className="mt-3 w-full rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-black transition active:scale-[0.98]">
                {language === 'it' ? 'Completa il check-in per sbloccare porta e Wi-Fi' : 'Complete check-in to unlock door and Wi-Fi'}
              </button>
            </div>
          </section>
        )}

        {/* Soggiorno, ritratto e quattro azioni: disponibili dopo la conferma host */}
        {pass && (isCheckinApproved || (isEditMode && pass.documentsUploaded)) && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/75 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { if (stayGuests.length > 1) setSelectedGuestIndex((index) => (index + 1) % stayGuests.length); setSheet('guest'); }} className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-300/50 bg-white/5 text-zinc-200" aria-label={stayGuests.length > 1 ? 'Seleziona ospite e consulta documento' : 'Consulta dati documento'}>
                  {selectedGuest?.profileImage ? <img src={selectedGuest.profileImage} alt="Foto profilo documento" className="h-full w-full object-cover" /> : <UserRound className="h-6 w-6" />}
                </button>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-300">{language === 'it' ? 'Ospite della prenotazione' : 'Guest details'}</span>
                  <h2 className="truncate text-lg font-bold">{selectedGuest ? `${selectedGuest.name} ${selectedGuest.surname}` : `${pass.guestName} ${pass.guestSurname}`}</h2>
                  <button type="button" onClick={() => setSheet('guest')} className="mt-0.5 text-xs text-zinc-400 underline underline-offset-2">{stayGuests.length > 1 ? (language === 'it' ? 'Seleziona ospite · dati documento' : 'Select guest · document details') : (language === 'it' ? 'Consulta dati documento' : 'View document details')}</button>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-300"><Users className="h-4 w-4" />{pass.guestsCount || stayGuests.length || 1}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <div><span className="block text-[10px] uppercase tracking-wider text-zinc-500">{language === 'it' ? 'Check-in' : 'Check-in'}</span><strong className="mt-1 block text-sm">{formatPassDate(pass.checkInDate)} · {pass.checkInTime || '14:00'}</strong></div>
                <div><span className="block text-[10px] uppercase tracking-wider text-zinc-500">{language === 'it' ? 'Check-out' : 'Check-out'}</span><strong className="mt-1 block text-sm">{formatPassDate(pass.checkOutDate)} · {pass.checkOutTime || APARTMENT_INFO.checkOutLimit}</strong></div>
              </div>
            </div>

            {showCheckoutReminder && (
              <button type="button" onClick={() => setSheet('checkout')} className="flex w-full items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3.5 text-left shadow-lg transition active:scale-[0.99]">
                <span className="text-3xl" role="img" aria-label="Avanzamento checklist check-out">{checkoutMood}</span>
                <span className="min-w-0 flex-1"><strong className="block text-sm text-white">{language === 'it' ? 'Check-out tra' : 'Check-out in'} {checkoutHours}{language === 'it' ? ' ore' : ' hours'} {checkoutMinutes}{language === 'it' ? ' min' : ' min'}</strong><span className="mt-0.5 block text-[11px] text-zinc-300">{checkoutDoneCount}/{checkoutList.length} {language === 'it' ? 'attività completate · apri checklist' : 'tasks done · open checklist'}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-rose-200" />
              </button>
            )}

            <div className="grid grid-cols-4 gap-2">
              <a href={APARTMENT_INFO.googleMapsUrl} target="_blank" rel="noreferrer" onClick={() => trackActivity(pass, 'maps_open')} className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/75 p-3 text-center transition hover:border-emerald-400/40 hover:bg-zinc-800">
                <Navigation className="h-5 w-5 text-emerald-300" /><span className="text-[10px] font-semibold leading-tight">{language === 'it' ? 'Come arrivare' : 'Directions'}</span>
              </a>
              <button type="button" onClick={handleWifiClick} className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/75 p-3 text-center transition hover:border-emerald-400/40 hover:bg-zinc-800">
                <Wifi className="h-5 w-5 text-emerald-300" /><span className="text-[10px] font-semibold leading-tight">Wi-Fi</span>
              </button>
              <button type="button" onPointerDown={event => { if (!isCheckinConfirmed) handleDoorClick(); else startHold(event); }} onPointerUp={isCheckinConfirmed ? cancelHold : undefined} onPointerCancel={isCheckinConfirmed ? cancelHold : undefined} onPointerLeave={isCheckinConfirmed ? cancelHold : undefined} disabled={doorState === 'opening' || !isStayActive} className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/75 p-3 text-center transition hover:border-emerald-400/40 hover:bg-zinc-800 disabled:opacity-50" title={doorState === 'idle' ? (language === 'it' ? 'Tieni premuto per aprire' : 'Press and hold to unlock') : doorMessage}>
                <DoorOpen className="h-5 w-5 text-emerald-300" /><span className="text-[10px] font-semibold leading-tight">{doorState === 'opening' ? (language === 'it' ? 'Apro…' : 'Opening…') : doorState === 'success' ? (language === 'it' ? 'Aperta' : 'Opened') : (language === 'it' ? 'Apri Porta' : 'Open door')}</span>
              </button>
              <button type="button" onClick={() => { onNavigate('regole'); trackActivity(pass, 'house_rules_view'); }} className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/75 p-3 text-center transition hover:border-emerald-400/40 hover:bg-zinc-800">
                <BookOpen className="h-5 w-5 text-emerald-300" /><span className="text-[10px] font-semibold leading-tight">{language === 'it' ? 'Regole' : 'Rules'}</span>
              </button>
            </div>
            {doorMessage && <p className={`text-center text-xs ${doorState === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}>{doorMessage}</p>}
          </section>
        )}

        {/* Area 3: tile e informazioni utili; resta visibile anche prima del check-in */}
        {/* Photo Carousel temporarily hidden; keep component for easy reactivation. */}



        {/* Informazioni utili: casa, attività, ristoranti, spesa e servizi */}
        {/* SECTION 1: Guida Casa */}
        <section id="guest-guide-tiles" className="space-y-3">
          <EditableElement id="home.section-house" label="Titolo Guida Casa" className="rounded-lg">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {guideSections.houseEssentials.title}
            </h2>
          </EditableElement>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.houseEssentials.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

        {/* SECTION 2: Idee per oggi */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <EditableElement id="home.section-activities" label="Titolo Attività" className="rounded-lg">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.tiles.attivita}
              </h2>
            </EditableElement>
            <EditableElement id="home.link-vedi-tutto" label="Vedi tutte le attività" className="rounded-lg">
              <button 
                onClick={() => onNavigate('attivita')} 
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
              >
                {t.actions.backToMenu === 'MENU' ? 'Vedi tutto' : 'See all'} <ChevronRight className="inline h-3.5 w-3.5" />
              </button>
            </EditableElement>
          </div>
          
          <ScrollableTileRow hintLabel="Scorri per altro">
            {localStories.map((story, storyIdx) => (
              <EditableElement
                key={story.title}
                id={`home.story-${storyIdx}`}
                label={story.title}
                className="rounded-3xl shrink-0 snap-start"
              >
                <a
                  className="relative flex-shrink-0 w-[240px] sm:w-[270px] aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 group cursor-pointer shadow-xl transition-all duration-300 active:scale-[0.96] text-left snap-start block"
                  href={story.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <EditableImageOverlay
                    id={`home.story-${storyIdx}-img`}
                    buttonPosition="center"
                    triggerOnHover
                  >
                    <img 
                      src={cmsImages[`home.story-${storyIdx}-img`] || story.image} 
                      alt={story.title} 
                      loading="lazy" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </EditableImageOverlay>
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
              </EditableElement>
            ))}
          </ScrollableTileRow>
        </section>

        {/* SECTION 3: Esplora Valtellina */}
        <section className="space-y-3">
          <EditableElement id="home.section-explore" label="Titolo Esplora" className="rounded-lg">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {guideSections.exploreValtellina.title}
            </h2>
          </EditableElement>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.exploreValtellina.items.map(renderPhotoCard)}
          </ScrollableTileRow>
        </section>

        {/* SECTION 4: Supporto & Sicurezza */}
        <section className="space-y-3">
          <EditableElement id="home.section-support" label="Titolo Supporto" className="rounded-lg">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {guideSections.supportSecurity.title}
            </h2>
          </EditableElement>
          <ScrollableTileRow hintLabel="Scorri per altro">
            {guideSections.supportSecurity.items.map(renderPhotoCard)}
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

      {/* Scheda dettagli ospite, dati documento e checklist check-out */}
      {(sheet === 'guest' || sheet === 'checkout') && pass && (
        <div className="sheet-backdrop" onClick={() => setSheet(null)}>
          <section className="aurora-sheet max-h-[85vh] overflow-y-auto" onClick={event => event.stopPropagation()}>
            <button className="sheet-close" onClick={() => setSheet(null)} aria-label={t.concierge.close}><X className="h-4 w-4" /></button>
            {sheet === 'guest' && (
              <>
                <p className="aurora-eyebrow">{language === 'it' ? 'Dati ospiti' : 'Guest details'}</p>
                {stayGuests.length > 1 && (
                  <div className="my-3 flex flex-wrap gap-2">
                    {stayGuests.map((guest, index) => (
                      <button key={`${guest.name}-${index}`} type="button" onClick={() => setSelectedGuestIndex(index)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${selectedGuestIndex === index ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100' : 'border-white/10 bg-white/5 text-zinc-300'}`}>
                        {guest.name} {guest.surname}
                      </button>
                    ))}
                  </div>
                )}
                <h2>{selectedGuest ? `${selectedGuest.name} ${selectedGuest.surname}` : `${pass.guestName} ${pass.guestSurname}`}</h2>
                {selectedGuest?.profileImage && <img src={selectedGuest.profileImage} alt="Ritaglio profilo ospite" className="my-4 h-20 w-20 rounded-full border border-emerald-300/40 object-cover" />}
                {selectedGuest ? (
                  <div className="sheet-list mt-4">
                    <span>{language === 'it' ? 'Numero ospiti' : 'Guests'} <b>{pass.guestsCount || stayGuests.length}</b></span>
                    <span>{language === 'it' ? 'Data di nascita' : 'Date of birth'} <b>{selectedGuest.birthDate || '—'}</b></span>
                    <span>{language === 'it' ? 'Luogo di nascita' : 'Place of birth'} <b>{selectedGuest.birthPlace || '—'}</b></span>
                    <span>{language === 'it' ? 'Cittadinanza' : 'Citizenship'} <b>{selectedGuest.citizenship || selectedGuest.nationality || '—'}</b></span>
                    <span>{language === 'it' ? 'Tipo documento' : 'Document type'} <b>{selectedGuest.documentType || '—'}</b></span>
                    <span>{language === 'it' ? 'Numero documento' : 'Document number'} <b>{selectedGuest.documentNumber || '—'}</b></span>
                    <span>{language === 'it' ? 'Ente di rilascio' : 'Issuing authority'} <b>{selectedGuest.issuePlace || '—'}</b></span>
                    <span>{language === 'it' ? 'Scadenza' : 'Expiry date'} <b>{selectedGuest.expiryDate || '—'}</b></span>
                  </div>
                ) : <p className="mt-3 text-sm text-zinc-400">{language === 'it' ? 'I dati del documento non sono disponibili.' : 'Document details are not available.'}</p>}
              </>
            )}
            {sheet === 'checkout' && (
              <>
                <p className="aurora-eyebrow">{language === 'it' ? 'Prima di partire' : 'Before you leave'}</p>
                <h2>{language === 'it' ? 'Checklist check-out' : 'Check-out checklist'} <span role="img" aria-label="umore checklist">{checkoutMood}</span></h2>
                <p className="mt-1 text-xs text-zinc-400">{checkoutDoneCount}/{checkoutList.length} {language === 'it' ? 'attività completate' : 'tasks complete'}</p>
                <div className="mt-4 space-y-2">
                  {checkoutList.map((item, index) => {
                    const done = Boolean(checkoutItems[String(index)]);
                    return (
                      <button key={`${item.title}-${index}`} type="button" onClick={() => toggleCheckoutItem(index)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${done ? 'border-emerald-400/35 bg-emerald-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
                        {done ? <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> : <Square className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />}
                        <span><strong className={`block text-xs ${done ? 'text-zinc-400 line-through' : 'text-white'}`}>{item.title}</strong><span className="mt-1 block text-[11px] leading-relaxed text-zinc-400">{item.desc}</span></span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-3xl" role="img" aria-label="Progresso">{checkoutMood}</p>
              </>
            )}
          </section>
        </div>
      )}

      {/* Bottom Sheets (Wi-Fi, Schedule, Luggage) */}
      {sheet && sheet !== 'guest' && sheet !== 'checkout' && (
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

// ============================================================
// Visual CMS helpers (usati sopra nella home)
// ============================================================

/** Immagine di un tile con override CMS (upload host) e overlay di sostituzione. */
const TileImage: React.FC<{ page: string; fallback: string; alt: string }> = ({ page, fallback, alt }) => {
  const { images } = useEditMode();
  const override = images[`home.tile-${page}`];
  const cmsId = `home.tile-${page}`;
  return (
    <EditableImageOverlay id={cmsId} buttonPosition="center" triggerOnHover>
      <img
        src={override || fallback}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          if (page === 'contatti') {
            e.currentTarget.src = '/uploads/host.jpg';
          }
        }}
      />
    </EditableImageOverlay>
  );
};

/** Sfondo della Tessera Ospite con override CMS e overlay upload. */
const GuestCardBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // L'override viene applicato sia in editing sia in produzione (ospiti).
  const { images } = useEditMode();
  const override = images['home.guest-card'];
  if (!override) return <>{children}</>;
  // Applica l'override di sfondo al primo elemento figlio (la card) senza
  // toccare gli altri figli (es. l'overlay di upload): React.Children.only
  // crasherebbe perché il wrapper riceve più di un figlio.
  const items = React.Children.toArray(children);
  const cardIdx = items.findIndex(React.isValidElement);
  if (cardIdx === -1) return <>{children}</>;
  const card = items[cardIdx] as React.ReactElement<{ style?: React.CSSProperties }>;
  const styledCard = React.cloneElement(card, {
    style: {
      ...(card.props.style ?? {}),
      backgroundImage: `linear-gradient(135deg, rgba(9, 13, 19, 0.62), rgba(9, 13, 19, 0.72)), url(${override})`,
    },
  });
  return <>{items.map((item, i) => (i === cardIdx ? styledCard : item))}</>;
};

/**
 * Orario check-in della Tessera: in modalità editing mostra il Time Picker
 * contestuale; gli override vengono auto-salvati nel context.
 */
const CheckinTime: React.FC = () => {
  const { isEditMode, times, updateTime } = useEditMode();
  const value = times['home.checkin-time'] || '14:00';
  if (!isEditMode) {
    return <>{value}</>;
  }
  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <InlineTimePicker
        value={value}
        onChange={(v) => updateTime('home.checkin-time', v)}
        className="text-emerald-300 bg-emerald-400/10 rounded-md px-1.5 py-0.5"
      />
    </span>
  );
};

/**
 * Overlay di sostituzione dello sfondo della Tessera Ospite:
 * al hover sulla card compare il pulsante "Sostituisci immagine"
 * (upload file o drag-and-drop). L'override vale anche per gli ospiti.
 */
const GuestCardImageOverlay: React.FC = () => {
  const { isEditMode } = useEditMode();
  if (!isEditMode) return null;
  return (
    <div className="absolute top-2 right-2 z-30 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
      <EditableImageOverlay id="home.guest-card" buttonPosition="top-right" triggerOnHover>
        <span />
      </EditableImageOverlay>
    </div>
  );
};

/**
 * Slide del photo carousel con override CMS e overlay di sostituzione:
 * al hover compare "Sostituisci immagine" (upload o drag-drop).
 * L'override è persistito per chiave slide (heroLiving, bedroom, ...) e
 * vale anche per gli ospiti.
 */
const CarouselSlideImage: React.FC<{ slideKey: string; fallback: string; alt: string }> = ({ slideKey, fallback, alt }) => {
  const { images } = useEditMode();
  const override = images[`home.carousel-${slideKey}`];
  return (
    <EditableImageOverlay
      id={`home.carousel-${slideKey}`}
      buttonPosition="center"
      triggerOnHover
    >
      <img
        src={override || fallback}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </EditableImageOverlay>
  );
};
