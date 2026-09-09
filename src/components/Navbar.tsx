import React, { useState } from 'react';
import { Home, Sparkles, Wifi, Globe, MapPin, Camera, Landmark, BookOpen, Utensils, Compass, MessageSquare, Phone, ChevronDown } from 'lucide-react';
import { Language, ActiveTab } from '../types';
import { translations } from '../data/translations';
import { APARTMENT_INFO } from '../data/apartmentData';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenWiFi: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'it', label: 'IT', flag: '🇮🇹' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
];

export const Navbar: React.FC<Props> = ({
  language,
  onLanguageChange,
  onOpenWiFi,
  activeTab,
  onSelectTab,
}) => {
  const t = translations[language];
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Brand Logo & Name */}
          <button 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-teal-700 via-teal-800 to-amber-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <span className="font-serif font-black text-lg tracking-wider text-amber-200">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-teal-800 transition-colors">
                  {APARTMENT_INFO.name}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                  <MapPin className="w-2.5 h-2.5 text-amber-700" />
                  Morbegno
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Valtellina • Via Serta 188D
              </p>
            </div>
          </button>

          {/* Right Action Controls: Wi-Fi, Language Selector, PWA Install */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wi-Fi Quick Access Pill */}
            <button
              id="nav-wifi-btn"
              onClick={onOpenWiFi}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50/90 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-colors cursor-pointer"
              title="Wi-Fi Info"
            >
              <Wifi className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden md:inline font-mono">Wi-Fi</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              {/* Desktop inline pill switcher */}
              <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => onLanguageChange(item.code)}
                    className={`px-2 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      language === item.code
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    aria-label={`Switch to ${item.code.toUpperCase()}`}
                  >
                    {item.flag} {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile / Tablet dropdown toggle */}
              <div className="lg:hidden relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-700" />
                  <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
                  <span className="uppercase">{language}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in">
                    {LANGUAGES.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          onLanguageChange(item.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center gap-2 hover:bg-slate-50 cursor-pointer ${
                          language === item.code ? 'text-teal-800 bg-teal-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* In-App PWA Install Button */}
            <PWAInstallButton language={language} variant="header" />
          </div>
        </div>

        {/* Desktop / Tablet Navigation Row */}
        <nav className="hidden sm:flex items-center gap-1 border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'home'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => onSelectTab('house')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'house'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.nav.house}
          </button>
          <button
            onClick={() => onSelectTab('restaurants')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'restaurants'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.nav.places}
          </button>
          <button
            onClick={() => onSelectTab('experiences')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'experiences'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.nav.experiences}
          </button>
          <button
            onClick={() => onSelectTab('monuments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'monuments'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.nav.monuments}
          </button>
          <button
            onClick={() => onSelectTab('gallery')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.nav.gallery}
          </button>
          <button
            onClick={() => onSelectTab('guestbook')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'guestbook'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.nav.guestbook}
          </button>
          <button
            onClick={() => onSelectTab('contacts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.nav.contacts}
          </button>
        </nav>
      </div>
    </header>
  );
};
