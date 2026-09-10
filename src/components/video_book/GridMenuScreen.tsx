import React, { useState } from 'react';
import { Language, WelcomePage, GuestPass } from '../../types';
import { FlagIcon } from './FlagIcon';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { StaySummaryPill } from '../vip/StaySummaryPill';
import { 
  Home, 
  Key, 
  Wifi, 
  ClipboardList, 
  MapPin, 
  Bus, 
  Armchair, 
  Camera, 
  UtensilsCrossed, 
  Wine, 
  ShoppingBag, 
  Info, 
  PlusCircle, 
  LogOut, 
  Headphones,
  Coffee,
  Heart,
  Car,
  MessageSquare,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  Sparkles,
  Mountain
} from 'lucide-react';
import { APARTMENT_INFO } from '../../data/apartmentData';

interface Props {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onNavigate: (page: WelcomePage) => void;
  pass?: GuestPass | null;
  onOpenSmartLock?: () => void;
}

export const GridMenuScreen: React.FC<Props> = ({ 
  language, 
  onSelectLanguage, 
  onNavigate,
  pass,
  onOpenSmartLock
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const t = VIDEO_TRANSLATIONS[language];
  const languagesList: Language[] = ['it', 'en', 'de', 'fr', 'es'];

  // Multilingual categories & descriptions
  const localizedCategories = {
    home: {
      it: 'La Casa & Servizi',
      en: 'The Apartment & Services',
      de: 'Die Wohnung & Services',
      fr: 'Le Logement & Services',
      es: 'La Casa y Servicios'
    }[language],
    food: {
      it: 'Sapori di Valtellina',
      en: 'Flavors of Valtellina',
      de: 'Geschmäcker des Veltlins',
      fr: 'Saveurs de la Valteline',
      es: 'Sabores de Valtelina'
    }[language],
    explore: {
      it: 'Esplorare & Utilità',
      en: 'Explore & Utilities',
      de: 'Erkunden & Nützliches',
      fr: 'Explorer & Utilitaires',
      es: 'Explorar y Utilidades'
    }[language]
  };

  const localizedDescriptions = {
    benvenuto: {
      it: 'La tua casa a Morbegno e la nostra accoglienza',
      en: 'Your home in Morbegno and our warm hospitality',
      de: 'Ihr Zuhause in Morbegno und unser herzlicher Empfang',
      fr: 'Votre maison à Morbegno et notre accueil chaleureux',
      es: 'Tu hogar en Morbegno y nuestra cálida bienvenida'
    }[language],
    check_in: {
      it: 'Accesso con smart lock e consegna chiavi',
      en: 'Smart lock access and key handover',
      de: 'Smart-Lock-Zugang und Schlüsselübergabe',
      fr: 'Accès smart lock et remise des clés',
      es: 'Acceso con smart lock y entrega de llaves'
    }[language],
    wifi: {
      it: 'Fibra ad alta velocità e codice rapido',
      en: 'High-speed fiber and instant Wi-Fi copy',
      de: 'Highspeed-Glasfaser und schneller WLAN-Code',
      fr: 'Fibre ultra-rapide et code Wi-Fi rapide',
      es: 'Fibra de alta velocidad y código rápido'
    }[language],
    servizi: {
      it: 'Elettrodomestici, riscaldamento e raccolta differenziata',
      en: 'Appliances, heating and waste recycling',
      de: 'Haushaltsgeräte, Heizung und Mülltrennung',
      fr: 'Appareils ménagers, chauffage et tri sélectif',
      es: 'Electrodomésticos, calefacción y reciclaje'
    }[language],
    regole: {
      it: 'Poche e semplici attenzioni per il massimo relax',
      en: 'Simple house rules for maximum relaxation',
      de: 'Einfache Hausregeln für maximale Entspannung',
      fr: 'Règles simples pour une détente maximale',
      es: 'Normas sencillas para el máximo relax'
    }[language],
    check_out: {
      it: 'Partenza serena entro le ore 10:00',
      en: 'Smooth check-out before 10:00 AM',
      de: 'Entspannte Abreise bis 10:00 Uhr',
      fr: 'Départ serein avant 10h00',
      es: 'Salida tranquila antes de las 10:00'
    }[language],
    ristoranti: {
      it: 'I veri crotti tipici e i pizzoccheri fatti a mano',
      en: 'Authentic local crotti and handmade pizzoccheri',
      de: 'Traditionelle Crotti und hausgemachte Pizzoccheri',
      fr: 'Crotti typiques et pizzoccheri faits maison',
      es: 'Crotti típicos y pizzoccheri caseros'
    }[language],
    bar_club: {
      it: 'Colazioni con brioches fresche, aperitivi e vini locali',
      en: 'Fresh breakfast, aperitivo and local wines',
      de: 'Frühstück mit frischen Croissants, Aperitifs und Weine',
      fr: 'Petits-déjeuners frais, apéritifs et vins locaux',
      es: 'Desayunos frescos, aperitivos y vinos locales'
    }[language],
    shopping: {
      it: 'Botteghe storiche del Bitto, bresaola e botteghe di Morbegno',
      en: 'Historic Bitto cheese and artisan bresaola shops',
      de: 'Historische Bitto- und Bresaola-Feinkostläden',
      fr: 'Boutiques artisanales de Bitto et bresaola',
      es: 'Tiendas tradicionales de queso Bitto y bresaola'
    }[language],
    attivita: {
      it: 'Sentiero Valtellina, Val Gerola e passeggiate panoramiche',
      en: 'Sentiero Valtellina, Val Gerola and scenic trails',
      de: 'Sentiero Valtellina, Val Gerola und Panoramawanderungen',
      fr: 'Sentiero Valtellina, Val Gerola et sentiers panoramiques',
      es: 'Sentiero Valtellina, Val Gerola y rutas panorámicas'
    }[language],
    posizione: {
      it: 'Via Serta 188D e posto auto privato',
      en: 'Via Serta 188D and private parking space',
      de: 'Via Serta 188D und privater Parkplatz',
      fr: 'Via Serta 188D et place de parking privée',
      es: 'Via Serta 188D y aparcamiento privado'
    }[language],
    trasporti: {
      it: 'Stazione ferroviaria di Morbegno, bus e noleggio bici',
      en: 'Morbegno train station, local buses and bike rental',
      de: 'Bahnhof Morbegno, Busse und Fahrradverleih',
      fr: 'Gare de Morbegno, bus et location de vélos',
      es: 'Estación de tren de Morbegno, autobuses y alquiler de bicis'
    }[language],
    informazioni: {
      it: 'Cosa sapere su Morbegno e orari utili',
      en: 'Key facts about Morbegno and local services',
      de: 'Wichtiges über Morbegno und Öffnungszeiten',
      fr: 'Ce qu’il faut savoir sur Morbegno et horaires',
      es: 'Información sobre Morbegno y horarios útiles'
    }[language],
    emergenza: {
      it: 'Farmacie di turno, guardia medica e numeri rapidi',
      en: 'On-duty pharmacies, urgent care and emergency numbers',
      de: 'Notapotheken, ärztlicher Notdienst und Notrufnummern',
      fr: 'Pharmacies de garde, urgences et numéros utiles',
      es: 'Farmacias de guardia, urgencias y teléfonos de emergencia'
    }[language],
    contatti: {
      it: 'Parla direttamente con Nino per ogni esigenza',
      en: 'Direct contact with Nino for any needs',
      de: 'Direkter Kontakt zu Nino für alle Anliegen',
      fr: 'Contact direct avec Nino pour toute demande',
      es: 'Contacto directo con Nino para cualquier consulta'
    }[language]
  };

  // Categorized items with dark & emerald theme
  const menuSections = [
    {
      category: localizedCategories.home,
      items: [
        {
          page: 'benvenuto' as WelcomePage,
          label: t.tiles.benvenuto,
          desc: localizedDescriptions.benvenuto,
          icon: <Home className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'check_in' as WelcomePage,
          label: t.tiles.checkIn,
          desc: localizedDescriptions.check_in,
          icon: <Key className="w-5 h-5 text-emerald-300" />,
          bg: 'bg-emerald-500/15 border-emerald-500/35',
          highlight: true
        },
        {
          page: 'wifi' as WelcomePage,
          label: t.tiles.wifi,
          desc: localizedDescriptions.wifi,
          icon: <Wifi className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'servizi' as WelcomePage,
          label: t.tiles.servizi,
          desc: localizedDescriptions.servizi,
          icon: <Armchair className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'regole' as WelcomePage,
          label: t.tiles.regole,
          desc: localizedDescriptions.regole,
          icon: <ClipboardList className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'check_out' as WelcomePage,
          label: t.tiles.checkOut,
          desc: localizedDescriptions.check_out,
          icon: <LogOut className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        }
      ]
    },
    {
      category: localizedCategories.food,
      items: [
        {
          page: 'ristoranti' as WelcomePage,
          label: t.tiles.ristoranti,
          desc: localizedDescriptions.ristoranti,
          icon: <UtensilsCrossed className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'bar_club' as WelcomePage,
          label: t.tiles.barClub,
          desc: localizedDescriptions.bar_club,
          icon: <Wine className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'shopping' as WelcomePage,
          label: t.tiles.shopping,
          desc: localizedDescriptions.shopping,
          icon: <ShoppingBag className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        }
      ]
    },
    {
      category: localizedCategories.explore,
      items: [
        {
          page: 'attivita' as WelcomePage,
          label: t.tiles.attivita,
          desc: localizedDescriptions.attivita,
          icon: <Camera className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'posizione' as WelcomePage,
          label: t.tiles.posizione,
          desc: localizedDescriptions.posizione,
          icon: <MapPin className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'trasporti' as WelcomePage,
          label: t.tiles.trasporti,
          desc: localizedDescriptions.trasporti,
          icon: <Bus className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'informazioni' as WelcomePage,
          label: t.tiles.informazioni,
          desc: localizedDescriptions.informazioni,
          icon: <Info className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'emergenza' as WelcomePage,
          label: t.tiles.emergenza,
          desc: localizedDescriptions.emergenza,
          icon: <PlusCircle className="w-5 h-5 text-rose-400" />,
          bg: 'bg-rose-500/10 border-rose-500/25'
        },
        {
          page: 'contatti' as WelcomePage,
          label: t.tiles.contatti,
          desc: localizedDescriptions.contatti,
          icon: <Headphones className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-transparent text-slate-100 flex flex-col justify-between select-none pb-28 relative selection:bg-emerald-500/25 selection:text-emerald-200">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[34rem] h-64 bg-emerald-600/5 rounded-full blur-3xl" />
        <div className="absolute top-96 right-0 w-64 h-64 bg-emerald-800/5 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-3 z-20 mx-3 aurora-liquid-card rounded-2xl px-3.5 sm:px-5 py-2.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          
          {/* Location pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e151e] border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Morbegno, Valtellina</span>
          </div>

          {/* Right: PWA & Language pills */}
          <div className="flex items-center gap-2">
            <PWAInstallButton language={language} compact />
            
            {/* Language dropdown / pill */}
            <div className="flex items-center gap-1 bg-[#0e151e] p-0.5 rounded-full border border-emerald-500/20">
              {languagesList.map((lang) => {
                const isActive = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => onSelectLanguage(lang)}
                    id={`grid-flag-${lang}`}
                    className={`w-6 h-6 rounded-full overflow-hidden transition cursor-pointer ${
                      isActive ? 'ring-2 ring-emerald-400 scale-110 shadow-xs' : 'opacity-65 hover:opacity-100'
                    }`}
                    title={lang.toUpperCase()}
                  >
                    <FlagIcon language={lang} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex-1 px-3.5 sm:px-4 pt-3 space-y-3.5">
        
        {/* Title Section */}
        <div className="px-1 pt-1 pb-0.5">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="uppercase tracking-widest text-[10px] font-semibold">Benvenuti</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Appartamento Aurora
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
            La tua sosta serena a Morbegno • Tutto ciò che ti serve a portata di mano
          </p>
        </div>

        {/* GUEST PASS PILL */}
        {pass && (
          <StaySummaryPill
            pass={pass}
            onOpenSmartLock={onOpenSmartLock}
          />
        )}

        {/* PAMPERING CARD */}
        <div className="relative aurora-liquid-card rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">
                  Piccole attenzioni per il tuo soggiorno
                </h3>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  Tutto preparato con cura per farti rilassare
                </span>
              </div>
            </div>
            <span className="text-[10px] font-medium text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
              <span>Pronto per te</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-0.5">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#131b25] border border-emerald-500/10">
              <Coffee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Caffè & tisane in omaggio</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#131b25] border border-emerald-500/10">
              <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Posto auto riservato</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#131b25] border border-emerald-500/10">
              <Key className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Accesso con Tastierino</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#131b25] border border-emerald-500/10">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Wi-Fi Fibra 1 Gbit</span>
            </div>
          </div>
        </div>

        {/* Flow navigation: key actions stay one tap away. */}
        <div className="aurora-flow-pill fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5">
          {/* Wi-Fi Quick */}
          <button
            onClick={() => onNavigate('wifi')}
            className="aurora-liquid-button flex flex-col items-center justify-center p-2.5 rounded-full transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Wifi className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-100">Wi-Fi</span>
            <span className="text-[9px] text-emerald-400/80 font-mono">Password</span>
          </button>

          {/* Accesso Porta */}
          <button
            onClick={() => onNavigate('check_in')}
            className="aurora-liquid-button flex flex-col items-center justify-center p-2.5 rounded-full transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-100">Chiavi</span>
            <span className="text-[9px] text-emerald-400/80 font-mono">Accesso diretto</span>
          </button>

          {/* Parcheggio */}
          <button
            onClick={() => onNavigate('posizione')}
            className="aurora-liquid-button flex flex-col items-center justify-center p-2.5 rounded-full transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-100">Auto</span>
            <span className="text-[9px] text-slate-400">Posto Auto</span>
          </button>

          {/* Assistenza Nino WhatsApp */}
          <a
            href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(
              pass ? `Ciao Nino! Sono ${pass.guestName}, ti scrivo dall'Appartamento Aurora.` : 'Ciao Nino!'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-liquid-button flex flex-col items-center justify-center p-2.5 rounded-full text-white transition cursor-pointer group text-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <span className="text-[11px] font-bold text-white">Nino</span>
            <span className="text-[9px] text-emerald-100 font-medium">WhatsApp</span>
          </a>
        </div>

        {/* View Switcher: Grid vs List */}
        <div className="flex items-center justify-between pt-1 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 font-mono">
            Guida della Casa & Territorio
          </span>
          <div className="flex items-center bg-[#0e151e] p-0.5 rounded-xl border border-emerald-500/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizzazione Griglia"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'list' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizzazione Lista"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sections Content */}
        {viewMode === 'grid' ? (
          /* Dark Emerald Grid */
          <div className="space-y-4">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider px-1">
                  {section.category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {section.items.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => onNavigate(item.page)}
                      id={`tile-${item.page}`}
                      className={`p-3.5 rounded-2xl bg-[#0e151e] border border-emerald-500/15 hover:border-emerald-400/50 hover:bg-[#131d27] shadow-sm text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer group ${
                        (item as any).highlight ? 'ring-1 ring-emerald-400/40 bg-[#111c25]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.bg} group-hover:scale-105 transition-transform`}>
                          {item.icon}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-100 block group-hover:text-emerald-300 transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1 block mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Dark TableView List Style */
          <div className="space-y-4">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider px-1">
                  {section.category}
                </h3>
                <div className="rounded-2xl bg-[#0e151e] border border-emerald-500/20 shadow-sm divide-y divide-white/[0.06] overflow-hidden">
                  {section.items.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => onNavigate(item.page)}
                      id={`list-${item.page}`}
                      className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-[#131d27] active:bg-[#16222e] transition cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${item.bg}`}>
                          {item.icon}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-100 block group-hover:text-emerald-300 transition-colors">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Clean Dark Footer - No Host Area button */}
      <footer className="w-full max-w-lg mx-auto px-4 pt-6 text-center text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span>Via Serta 188D, Morbegno (SO)</span>
          <span>•</span>
          <span>Valtellina</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Aurora in Valtellina • Accoglienza serena e sincera
        </p>
      </footer>

    </div>
  );
};
