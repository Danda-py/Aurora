import React from 'react';
import { Language, GuestPass } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { Sparkles, Bed, Utensils, Tv, Mountain, Heart } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
  pass?: GuestPass | null;
}

export const BenvenutoPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage, pass }) => {
  const { getPageData, media } = useCms();
  const cmsWelcome = getPageData('welcome') || {};
  const w = { ...BOOK_DATA[language].welcome, ...cmsWelcome };
  const guestFullName = pass ? `${pass.guestName} ${pass.guestSurname}`.trim() : null;

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={w.title}
          category="Aurora in Valtellina"
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Welcome Banner */}
        <div className="aurora-hero-banner">
          <img
            src={media?.heroLiving || "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"}
            alt="Aurora in Valtellina Living"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {APARTMENT_INFO.city} • Valtellina
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {w.greeting}
            </h1>
          </div>
        </div>

        {/* Host Welcome Note */}
        <div className="aurora-glass-card space-y-3">
          {guestFullName ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Benvenuto, {guestFullName}
              </h2>
              <span className="text-[11px] font-bold text-[#07110d] bg-[#62e6bd] px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" />
                <span>Soggiorno Attivo</span>
              </span>
            </div>
          ) : (
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cari Ospiti, benvenuti ad Aurora!
            </h2>
          )}
          <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-normal">
            {w.message}
          </p>
        </div>

        {/* Room Spaces Grid */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">Gli Ambienti</p>
            <h3 className="text-base font-bold text-white tracking-tight">{w.roomsTitle}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="aurora-item-card">
              <div className="aurora-icon-box">
                <Tv className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="block text-xs sm:text-sm font-bold text-white">{w.livingTitle}</strong>
                <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{w.livingDesc}</span>
              </div>
            </div>

            <div className="aurora-item-card">
              <div className="aurora-icon-box">
                <Bed className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="block text-xs sm:text-sm font-bold text-white">{w.bedroomTitle}</strong>
                <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{w.bedroomDesc}</span>
              </div>
            </div>

            <div className="aurora-item-card">
              <div className="aurora-icon-box">
                <Utensils className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="block text-xs sm:text-sm font-bold text-white">{w.kitchenTitle}</strong>
                <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{w.kitchenDesc}</span>
              </div>
            </div>

            <div className="aurora-item-card">
              <div className="aurora-icon-box">
                <Mountain className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="block text-xs sm:text-sm font-bold text-white">{w.viewTitle}</strong>
                <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{w.viewDesc}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
