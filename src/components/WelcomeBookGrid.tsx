import React, { useState } from 'react';
import { 
  Home, 
  Key, 
  Wifi, 
  ClipboardList, 
  MapPin, 
  Bus, 
  BellRing, 
  Compass, 
  Utensils, 
  Wine, 
  ShoppingBag, 
  Info, 
  AlertCircle, 
  LogOut, 
  Phone,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Navigation,
  MessageCircle,
  Clock,
  Car,
  Tv,
  Thermometer,
  Trash2,
  Coffee,
  ShieldCheck,
  X
} from 'lucide-react';
import { Language } from '../types';
import { APARTMENT_INFO, NEARBY_PLACES, EXPERIENCES, APPLIANCES, WASTE_GUIDE } from '../data/apartmentData';
import { translations } from '../data/translations';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenWiFi: () => void;
  onOpenCheckin: () => void;
  onOpenEmergency: () => void;
  onOpenSpecs: () => void;
}

export type TileKey = 
  | 'benvenuto'
  | 'checkIn'
  | 'wifi'
  | 'regole'
  | 'posizione'
  | 'trasporti'
  | 'servizi'
  | 'attivita'
  | 'ristoranti'
  | 'bar'
  | 'shopping'
  | 'informazioni'
  | 'emergenza'
  | 'checkOut'
  | 'contatti';

export const WelcomeBookGrid: React.FC<Props> = ({
  language,
  onLanguageChange,
  onOpenWiFi,
  onOpenCheckin,
  onOpenEmergency,
  onOpenSpecs,
}) => {
  const [activeTileModal, setActiveTileModal] = useState<TileKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const t = translations[language];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const LANGUAGES: { code: Language; flag: string; label: string }[] = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'it', flag: '🇮🇹', label: 'Italiano' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  ];

  // The 15 tiles exactly as shown in the images (3 columns x 5 rows)
  const TILES = [
    // Row 1
    {
      id: 'benvenuto' as TileKey,
      label: {
        it: 'Benvenuto',
        en: 'Welcome',
        de: 'Willkommen',
        fr: 'Bienvenue',
        es: 'Bienvenida',
      },
      icon: Home,
      action: () => setActiveTileModal('benvenuto'),
    },
    {
      id: 'checkIn' as TileKey,
      label: {
        it: 'Check-in',
        en: 'Check-in',
        de: 'Check-in',
        fr: 'Arrivée',
        es: 'Check-in',
      },
      icon: Key,
      action: onOpenCheckin,
    },
    {
      id: 'wifi' as TileKey,
      label: {
        it: 'Wifi',
        en: 'Wifi',
        de: 'WLAN',
        fr: 'Wifi',
        es: 'Wifi',
      },
      icon: Wifi,
      action: onOpenWiFi,
    },
    // Row 2
    {
      id: 'regole' as TileKey,
      label: {
        it: 'Regole',
        en: 'Rules',
        de: 'Regeln',
        fr: 'Règles',
        es: 'Normas',
      },
      icon: ClipboardList,
      action: () => setActiveTileModal('regole'),
    },
    {
      id: 'posizione' as TileKey,
      label: {
        it: 'Posizione',
        en: 'Location',
        de: 'Standort',
        fr: 'Position',
        es: 'Ubicación',
      },
      icon: MapPin,
      action: () => setActiveTileModal('posizione'),
    },
    {
      id: 'trasporti' as TileKey,
      label: {
        it: 'Trasporti',
        en: 'Transport',
        de: 'Verkehr',
        fr: 'Transports',
        es: 'Transporte',
      },
      icon: Bus,
      action: () => setActiveTileModal('trasporti'),
    },
    // Row 3
    {
      id: 'servizi' as TileKey,
      label: {
        it: 'Servizi',
        en: 'Amenities',
        de: 'Ausstattung',
        fr: 'Services',
        es: 'Servicios',
      },
      icon: BellRing,
      action: () => setActiveTileModal('servizi'),
    },
    {
      id: 'attivita' as TileKey,
      label: {
        it: 'Attività',
        en: 'Activities',
        de: 'Aktivitäten',
        fr: 'Activités',
        es: 'Actividades',
      },
      icon: Compass,
      action: () => setActiveTileModal('attivita'),
    },
    {
      id: 'ristoranti' as TileKey,
      label: {
        it: 'Ristoranti',
        en: 'Dining',
        de: 'Restaurants',
        fr: 'Restaurants',
        es: 'Restaurantes',
      },
      icon: Utensils,
      action: () => setActiveTileModal('ristoranti'),
    },
    // Row 4
    {
      id: 'bar' as TileKey,
      label: {
        it: 'Bar',
        en: 'Cafes & Bar',
        de: 'Bars & Cafés',
        fr: 'Bars & Cafés',
        es: 'Bares y Café',
      },
      icon: Wine,
      action: () => setActiveTileModal('bar'),
    },
    {
      id: 'shopping' as TileKey,
      label: {
        it: 'Shopping',
        en: 'Shopping',
        de: 'Einkaufen',
        fr: 'Commerces',
        es: 'Compras',
      },
      icon: ShoppingBag,
      action: () => setActiveTileModal('shopping'),
    },
    {
      id: 'informazioni' as TileKey,
      label: {
        it: 'Informazioni',
        en: 'Information',
        de: 'Information',
        fr: 'Informations',
        es: 'Información',
      },
      icon: Info,
      action: () => setActiveTileModal('informazioni'),
    },
    // Row 5
    {
      id: 'emergenza' as TileKey,
      label: {
        it: 'Emergenza',
        en: 'Emergency',
        de: 'Notfall',
        fr: 'Urgences',
        es: 'Emergencia',
      },
      icon: AlertCircle,
      action: onOpenEmergency,
    },
    {
      id: 'checkOut' as TileKey,
      label: {
        it: 'Check-out',
        en: 'Check-out',
        de: 'Abreise',
        fr: 'Départ',
        es: 'Salida',
      },
      icon: LogOut,
      action: () => setActiveTileModal('checkOut'),
    },
    {
      id: 'contatti' as TileKey,
      label: {
        it: 'Contatti',
        en: 'Contacts',
        de: 'Kontakt',
        fr: 'Contacts',
        es: 'Contacto',
      },
      icon: Phone,
      action: () => setActiveTileModal('contatti'),
    },
  ];

  const getWelcomeTitle = () => {
    switch (language) {
      case 'it': return 'Libro di Benvenuto';
      case 'en': return 'Welcome Book';
      case 'fr': return "Livret d'Accueil";
      case 'es': return 'Libro de Bienvenida';
      case 'de': return 'Willkommensbuch';
      default: return 'Libro di Benvenuto';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#faf7f2] rounded-3xl p-5 sm:p-7 border border-[#e8dfcf] shadow-xl text-slate-800 relative">
      
      {/* Top Welcome Title in Cursive Calligraphy */}
      <div className="text-center pt-2 pb-1">
        <h1 className="font-script text-4xl sm:text-5xl text-slate-800 tracking-wide select-none drop-shadow-xs">
          {getWelcomeTitle()}
        </h1>
        <p className="text-[11px] font-serif font-semibold text-amber-900/70 tracking-wider uppercase mt-1">
          {APARTMENT_INFO.name} • Morbegno (Valtellina)
        </p>
      </div>

      {/* 5 Languages Flag Pills Row (as in the video) */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-4">
        {LANGUAGES.map((item) => (
          <button
            key={item.code}
            onClick={() => onLanguageChange(item.code)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-xs transition-all duration-200 cursor-pointer ${
              language === item.code
                ? 'bg-white ring-2 ring-amber-600/70 scale-110 shadow-md -translate-y-0.5'
                : 'bg-white/70 hover:bg-white hover:scale-105 opacity-80 hover:opacity-100 border border-[#e3d8c5]'
            }`}
            title={item.label}
            aria-label={`Switch to ${item.label}`}
          >
            <span>{item.flag}</span>
          </button>
        ))}
      </div>

      {/* 15-Grid Layout: 3 Columns x 5 Rows */}
      <div className="grid grid-cols-3 gap-3 sm:gap-3.5 mt-2">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={tile.action}
              id={`tile-${tile.id}`}
              className="group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white/80 hover:bg-white border border-[#e8dfcf] hover:border-amber-300 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-slate-700 group-hover:text-amber-800 group-hover:scale-110 transition-all duration-200">
                <Icon className="w-6 h-6 stroke-[1.4]" />
              </div>
              <span className="text-xs sm:text-[13px] font-medium text-slate-800 group-hover:text-slate-950 mt-1 text-center tracking-tight line-clamp-1">
                {tile.label[language]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Host direct WhatsApp quick link pill on bottom */}
      <div className="mt-5 pt-4 border-t border-[#e8dfcf]/80 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Host Nino disponibile 7/7
        </span>
        <a
          href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=Ciao%20Nino!`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      </div>

      {/* Interactive Detail Modal for Tiles that don't have dedicated global modals */}
      {activeTileModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setActiveTileModal(null)}
        >
          <div 
            className="bg-[#faf7f2] rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#e8dfcf] shadow-2xl text-slate-900 space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e8dfcf] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  {activeTileModal === 'benvenuto' && <Home className="w-5 h-5" />}
                  {activeTileModal === 'regole' && <ClipboardList className="w-5 h-5" />}
                  {activeTileModal === 'posizione' && <MapPin className="w-5 h-5" />}
                  {activeTileModal === 'trasporti' && <Bus className="w-5 h-5" />}
                  {activeTileModal === 'servizi' && <BellRing className="w-5 h-5" />}
                  {activeTileModal === 'attivita' && <Compass className="w-5 h-5" />}
                  {activeTileModal === 'ristoranti' && <Utensils className="w-5 h-5" />}
                  {activeTileModal === 'bar' && <Wine className="w-5 h-5" />}
                  {activeTileModal === 'shopping' && <ShoppingBag className="w-5 h-5" />}
                  {activeTileModal === 'informazioni' && <Info className="w-5 h-5" />}
                  {activeTileModal === 'checkOut' && <LogOut className="w-5 h-5" />}
                  {activeTileModal === 'contatti' && <Phone className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
                    {TILES.find(t => t.id === activeTileModal)?.label[language]}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {APARTMENT_INFO.name} • {APARTMENT_INFO.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTileModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content depending on Tile */}
            
            {/* 1. Benvenuto */}
            {activeTileModal === 'benvenuto' && (
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="p-4 rounded-2xl bg-white border border-[#e8dfcf] space-y-2">
                  <h4 className="font-bold font-serif text-slate-900 text-sm">
                    {language === 'it' && 'Benvenuti all’Appartamento Aurora!'}
                    {language === 'en' && 'Welcome to Aurora Apartment!'}
                    {language === 'de' && 'Willkommen im Appartamento Aurora!'}
                    {language === 'fr' && 'Bienvenue à l’Appartement Aurora !'}
                    {language === 'es' && '¡Bienvenidos al Apartamento Aurora!'}
                  </h4>
                  <p>
                    {language === 'it' && 'Siamo felici di ospitarvi a Morbegno. Questa guida digitale vi accompagnerà durante tutto il vostro soggiorno in Valtellina.'}
                    {language === 'en' && 'We are thrilled to host you in Morbegno. This digital guide contains everything you need for a wonderful stay in Valtellina.'}
                    {language === 'de' && 'Wir freuen uns sehr, Sie in Morbegno zu begrüßen. Dieser Reiseführer begleitet Sie während Ihres gesamten Aufenthalts.'}
                    {language === 'fr' && 'Nous sommes ravis de vous accueillir à Morbegno. Ce livret digital vous guidera tout au long de votre séjour.'}
                    {language === 'es' && 'Estamos encantados de hospedaros en Morbegno. Esta guía digital os acompañará durante toda vuestra estancia.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#e8dfcf]">
                    <span className="font-bold text-slate-900 block mb-0.5">Check-in</span>
                    <span className="text-slate-600">Dalle 14:00 (2 PM)</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#e8dfcf]">
                    <span className="font-bold text-slate-900 block mb-0.5">Check-out</span>
                    <span className="text-slate-600">Entro le 10:00</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <strong>Indirizzo:</strong> {APARTMENT_INFO.fullAddress}
                </div>
              </div>
            )}

            {/* 4. Regole */}
            {activeTileModal === 'regole' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Orari del Silenzio</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Dalle 22:00 alle 08:00 nel rispetto degli altri residenti della corte.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="text-rose-600 font-bold">🚭</span>
                    <span>Divieto di Fumo</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    È severamente vietato fumare all'interno dell'appartamento. È consentito fumare all'esterno all'aperto.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Trash2 className="w-4 h-4 text-teal-700" />
                    <span>Raccolta Differenziata</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Separare accuratamente organico (marrone), carta (giallo/bianco), plastica e metalli (giallo), vetro (verde) e indifferenziato.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Posizione */}
            {activeTileModal === 'posizione' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-4 bg-white rounded-2xl border border-[#e8dfcf] space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Indirizzo & Parcheggio</h4>
                  <p className="text-xs text-slate-600">
                    <strong>{APARTMENT_INFO.fullAddress}</strong><br />
                    Parcheggio privato gratuito: <strong>Posto auto riservato n. 4</strong> all'interno del cortile.
                  </p>
                  <a
                    href={APARTMENT_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Apri in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* 6. Trasporti */}
            {activeTileModal === 'trasporti' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">🚆 Stazione Ferroviaria di Morbegno</h4>
                  <p className="text-xs text-slate-600">
                    A circa 600 metri (7 minuti a piedi). Treni diretti per Milano Centrale (circa 1h 35m), Sondrio e Tirano (capolinea del famoso <em>Bernina Express</em> UNESCO).
                  </p>
                </div>
              </div>
            )}

            {/* 7. Servizi */}
            {activeTileModal === 'servizi' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 max-h-96 overflow-y-auto pr-1">
                <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Thermometer className="w-4 h-4 text-orange-600" />
                    <span>Riscaldamento & Termostato</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Il termostato a parete in corridoio mantiene una temperatura ideale di 20°C. Si prega di non superare i 21°C e di chiudere le finestre quando il riscaldamento è attivo.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Coffee className="w-4 h-4 text-amber-800" />
                    <span>Macchina Caffè Espresso</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Macchina a capsule pronta all'uso. Capsule di benvenuto e zucchero a disposizione sul ripiano della cucina.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Tv className="w-4 h-4 text-blue-600" />
                    <span>Smart TV & Streaming</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Smart TV con accesso a Netflix, Prime Video e YouTube. Ricordarsi di effettuare il logout dai propri account personali prima del check-out.
                  </p>
                </div>
              </div>
            )}

            {/* 8. Attività */}
            {activeTileModal === 'attivita' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 max-h-96 overflow-y-auto pr-1">
                {EXPERIENCES.slice(0, 3).map((exp) => (
                  <div key={exp.id} className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">{exp.title[language]}</h4>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                        {exp.driveTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{exp.description[language]}</p>
                    <a
                      href={exp.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-teal-800 hover:underline inline-flex items-center gap-1"
                    >
                      Indicazioni Mappa →
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* 9. Ristoranti */}
            {activeTileModal === 'ristoranti' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 max-h-96 overflow-y-auto pr-1">
                {NEARBY_PLACES.filter(p => p.category === 'restaurant').map((place) => (
                  <div key={place.id} className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">{place.name}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{place.description[language]}</p>
                    <div className="flex items-center gap-3 pt-1">
                      {place.phone && (
                        <a href={`tel:${place.phone}`} className="text-xs font-bold text-teal-800 hover:underline">
                          Chiama {place.phone}
                        </a>
                      )}
                      <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-800 hover:underline">
                        Mappa →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 10. Bar */}
            {activeTileModal === 'bar' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 max-h-96 overflow-y-auto pr-1">
                {NEARBY_PLACES.filter(p => p.category === 'bar').map((place) => (
                  <div key={place.id} className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">{place.name}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{place.description[language]}</p>
                    <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-800 hover:underline inline-block pt-1">
                      Vedi su Google Maps →
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* 11. Shopping */}
            {activeTileModal === 'shopping' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 max-h-96 overflow-y-auto pr-1">
                {NEARBY_PLACES.filter(p => p.category === 'grocery').map((place) => (
                  <div key={place.id} className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">{place.name}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{place.description[language]}</p>
                    <a href={place.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal-800 hover:underline inline-block pt-1">
                      Vedi su Google Maps →
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* 12. Informazioni */}
            {activeTileModal === 'informazioni' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs font-serif">Scheda Appartamento Aurora</h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li>• <strong>Superficie:</strong> {APARTMENT_INFO.surface}</li>
                    <li>• <strong>Ospiti:</strong> Fino a {APARTMENT_INFO.maxGuests} persone</li>
                    <li>• <strong>Piano:</strong> {APARTMENT_INFO.floor}</li>
                    <li>• <strong>Codice CIR:</strong> {APARTMENT_INFO.cirCode}</li>
                    <li>• <strong>Codice CIN:</strong> {APARTMENT_INFO.cinCode}</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setActiveTileModal(null);
                    onOpenSpecs();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition cursor-pointer"
                >
                  Visualizza Scheda Dettagliata Completa
                </button>
              </div>
            )}

            {/* 14. Check-out */}
            {activeTileModal === 'checkOut' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-4 bg-white rounded-2xl border border-[#e8dfcf] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Orario Check-out: entro le 10:00</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <li>✓ Lasciare le chiavi sul tavolo del soggiorno.</li>
                    <li>✓ Spegnere riscaldamento / condizionatore e luci.</li>
                    <li>✓ Chiudere tutte le finestre e la porta d'ingresso.</li>
                    <li>✓ Smaltire i rifiuti negli appositi sacchetti della differenziata.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 15. Contatti */}
            {activeTileModal === 'contatti' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-4 bg-white rounded-2xl border border-[#e8dfcf] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-500/30 shadow-xs shrink-0 bg-slate-100">
                      <img
                        src="/uploads/host.jpg"
                        alt="Nino"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-serif">{APARTMENT_INFO.hostName} - Host</h4>
                      <p className="text-xs text-slate-500">Disponibile tutti i giorni per assistenza a Morbegno</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <a
                      href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=Ciao%20Nino!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Scrivi su WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${APARTMENT_INFO.hostPhone}`}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Phone className="w-4 h-4 text-slate-600" />
                      <span>Chiama: {APARTMENT_INFO.hostPhoneDisplay}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Close modal button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTileModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                {t.pwa.close}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
