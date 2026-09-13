import React, { useState } from 'react';
import { Language, WelcomePage, GuestPass } from '../../types';
import { FlagIcon } from './FlagIcon';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';
import { StaySummaryPill } from '../vip/StaySummaryPill';
import { getStayTiming } from '../../services/guestPassService';
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
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const timing = pass ? getStayTiming(pass) : null;
  const isStayActive = timing ? timing.isActive : false;
  const isCheckinConfirmed = pass ? Boolean(pass.checkInConfirmed) : false;
  const isWifiActive = isStayActive && isCheckinConfirmed;
  const languagesList: Language[] = ['it', 'en', 'de', 'fr', 'es'];

  // Categorized items with dark & emerald theme
  const menuSections = [
    {
      category: t.gridMenu.categories.home,
      items: [
        {
          page: 'benvenuto' as WelcomePage,
          label: t.tiles.benvenuto,
          desc: t.gridMenu.descriptions.benvenuto,
          icon: <Home className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'check_in' as WelcomePage,
          label: t.tiles.checkIn,
          desc: t.gridMenu.descriptions.check_in,
          icon: <Key className="w-5 h-5 text-emerald-300" />,
          bg: 'bg-emerald-500/15 border-emerald-500/35',
          highlight: true
        },
        {
          page: 'wifi' as WelcomePage,
          label: t.tiles.wifi,
          desc: t.gridMenu.descriptions.wifi,
          icon: <Wifi className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'servizi' as WelcomePage,
          label: t.tiles.servizi,
          desc: t.gridMenu.descriptions.servizi,
          icon: <Armchair className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'regole' as WelcomePage,
          label: t.tiles.regole,
          desc: t.gridMenu.descriptions.regole,
          icon: <ClipboardList className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'check_out' as WelcomePage,
          label: t.tiles.checkOut,
          desc: t.gridMenu.descriptions.check_out,
          icon: <LogOut className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        }
      ]
    },
    {
      category: t.gridMenu.categories.food,
      items: [
        {
          page: 'ristoranti' as WelcomePage,
          label: t.tiles.ristoranti,
          desc: t.gridMenu.descriptions.ristoranti,
          icon: <UtensilsCrossed className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'bar_club' as WelcomePage,
          label: t.tiles.barClub,
          desc: t.gridMenu.descriptions.bar_club,
          icon: <Wine className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'shopping' as WelcomePage,
          label: t.tiles.shopping,
          desc: t.gridMenu.descriptions.shopping,
          icon: <ShoppingBag className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        }
      ]
    },
    {
      category: t.gridMenu.categories.explore,
      items: [
        {
          page: 'attivita' as WelcomePage,
          label: t.tiles.attivita,
          desc: t.gridMenu.descriptions.attivita,
          icon: <Camera className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'posizione' as WelcomePage,
          label: t.tiles.posizione,
          desc: t.gridMenu.descriptions.posizione,
          icon: <MapPin className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'trasporti' as WelcomePage,
          label: t.tiles.trasporti,
          desc: t.gridMenu.descriptions.trasporti,
          icon: <Bus className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'informazioni' as WelcomePage,
          label: t.tiles.informazioni,
          desc: t.gridMenu.descriptions.informazioni,
          icon: <Info className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        },
        {
          page: 'emergenza' as WelcomePage,
          label: t.tiles.emergenza,
          desc: t.gridMenu.descriptions.emergenza,
          icon: <PlusCircle className="w-5 h-5 text-rose-400" />,
          bg: 'bg-rose-500/10 border-rose-500/25'
        },
        {
          page: 'contatti' as WelcomePage,
          label: t.tiles.contatti,
          desc: t.gridMenu.descriptions.contatti,
          icon: <Headphones className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/25'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#070a0e] text-slate-100 flex flex-col justify-between select-none pb-8 relative selection:bg-emerald-500/25 selection:text-emerald-200">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[34rem] h-64 bg-emerald-600/5 rounded-full blur-3xl" />
        <div className="absolute top-96 right-0 w-64 h-64 bg-emerald-800/5 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-[#090d13]/85 backdrop-blur-xl border-b border-emerald-500/15 px-3.5 sm:px-5 py-2.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          
          {/* Location pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e151e] border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Morbegno, Valtellina</span>
          </div>

          {/* Right: PWA & Language pills */}
          <div className="flex items-center gap-2">
            
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
            <span className="uppercase tracking-widest text-[10px] font-semibold">{t.gridMenu.welcomeTag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t.gridMenu.apartmentName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
            {t.gridMenu.apartmentSubtitle}
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
        <div className="rounded-2xl bg-[#0e151e] border border-emerald-500/20 p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">
                  {t.gridMenu.pamperingTitle}
                </h3>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  {t.gridMenu.pamperingSubtitle}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-medium text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
              <span>{t.gridMenu.readyForYou}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-0.5">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#131b25] border border-emerald-500/10">
              <Coffee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{t.gridMenu.freeCoffee}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#131b25] border border-emerald-500/10">
              <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{t.gridMenu.reservedParking}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#131b25] border border-emerald-500/10">
              <Key className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{t.gridMenu.smartAccess}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#131b25] border border-emerald-500/10">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{t.gridMenu.wifiGigabit}</span>
            </div>
          </div>
        </div>

        {/* 4 QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-4 gap-2">
          {/* Wi-Fi Quick */}
          <button
            onClick={isWifiActive ? () => onNavigate('wifi') : undefined}
            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0e151e] border border-emerald-500/20 active:scale-95 transition cursor-pointer group shadow-sm ${
              !isWifiActive ? 'opacity-40 cursor-not-allowed hover:border-emerald-500/20 hover:bg-[#0e151e]' : 'hover:border-emerald-400/50 hover:bg-[#131d27]'
            }`}
            title={!isStayActive ? "Disponibile solo durante il soggiorno" : (!isCheckinConfirmed ? t.checkInPage.pendingHostConfirmationDesc : "")}
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Wifi className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-100">Wi-Fi</span>
            <span className="text-[9px] text-emerald-400/80 font-mono">
              {!isWifiActive ? t.actions.notActive : t.gridMenu.password}
            </span>
          </button>

          {/* Accesso Porta */}
          <button
            onClick={() => onNavigate('check_in')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0e151e] border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-[#131d27] active:scale-95 transition cursor-pointer group shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-100">{t.gridMenu.keys}</span>
            <span className="text-[9px] text-emerald-400/80 font-mono">
              {!isCheckinConfirmed ? t.actions.notActive : t.gridMenu.smartAccessLabel}
            </span>
          </button>

          {/* Parcheggio */}
          <button
            onClick={() => onNavigate('posizione')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0e151e] border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-[#131d27] active:scale-95 transition cursor-pointer group shadow-sm"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-100">{t.gridMenu.car}</span>
            <span className="text-[9px] text-slate-400">{t.gridMenu.parking}</span>
          </button>

          {/* Assistenza Nino WhatsApp */}
          <a
            href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(
              pass ? `Ciao Nino! Sono ${pass.guestName}, ti scrivo dall'Appartamento Aurora.` : 'Ciao Nino!'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 active:scale-95 border border-emerald-400/40 text-white shadow-lg shadow-emerald-950/50 transition cursor-pointer group text-center"
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
            {t.gridMenu.guideSectionTitle}
          </span>
          <div className="flex items-center bg-[#0e151e] p-0.5 rounded-xl border border-emerald-500/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title={t.gridMenu.gridView}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'list' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title={t.gridMenu.listView}
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
                      onClick={item.page === 'wifi' && !isWifiActive ? undefined : () => onNavigate(item.page)}
                      id={`tile-${item.page}`}
                      className={`p-3.5 rounded-2xl bg-[#0e151e] border border-emerald-500/15 shadow-sm text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer group ${
                        (item as any).highlight ? 'ring-1 ring-emerald-400/40 bg-[#111c25]' : ''
                      } ${item.page === 'wifi' && !isWifiActive ? 'opacity-40 cursor-not-allowed hover:bg-[#0e151e] hover:border-emerald-500/15' : 'hover:border-emerald-400/50 hover:bg-[#131d27]'}`}
                      title={item.page === 'wifi' && !isWifiActive ? (!isStayActive ? "Disponibile solo durante il soggiorno" : (!isCheckinConfirmed ? t.checkInPage.pendingHostConfirmationDesc : "")) : ""}
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
                          {item.page === 'wifi' && !isWifiActive ? t.actions.notActive : item.desc}
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
                      onClick={item.page === 'wifi' && !isWifiActive ? undefined : () => onNavigate(item.page)}
                      id={`list-${item.page}`}
                      className={`w-full px-3.5 py-3 flex items-center justify-between transition text-left group ${
                        item.page === 'wifi' && !isWifiActive 
                          ? 'opacity-40 cursor-not-allowed bg-transparent' 
                          : 'hover:bg-[#131d27] active:bg-[#16222e] cursor-pointer'
                      }`}
                      title={item.page === 'wifi' && !isWifiActive ? (!isStayActive ? "Disponibile solo durante il soggiorno" : (!isCheckinConfirmed ? t.checkInPage.pendingHostConfirmationDesc : "")) : ""}
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
                            {item.page === 'wifi' && !isWifiActive ? t.actions.notActive : item.desc}
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

      {/* Clean Dark Footer */}
      <footer className="w-full max-w-lg mx-auto px-4 pt-6 text-center text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span>{t.gridMenu.footerAddress}</span>
          <span>•</span>
          <span>{t.gridMenu.footerValtellina}</span>
        </div>
        <p className="text-[10px] text-slate-400">
          {t.gridMenu.footerTagline}
        </p>
        <div className="pt-2">
          <a
            href="/host-portal/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10 text-[10px] transition"
          >
            <span>Area Riservata Host</span>
          </a>
        </div>
      </footer>

    </div>
  );
};
