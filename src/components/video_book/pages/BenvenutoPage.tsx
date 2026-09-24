import React from 'react';
import { Language, GuestPass } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { Sparkles, Bed, Utensils, Tv, Mountain, Heart, Key, ShieldCheck, Info } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
  pass?: GuestPass | null;
}

export const BenvenutoPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage, pass }) => {
  const w = BOOK_DATA[language].welcome;
  const guestFullName = pass ? `${pass.guestName} ${pass.guestSurname}`.trim() : null;
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const labels = VIDEO_PAGE_LABELS[language] || VIDEO_PAGE_LABELS.it;

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
            src="/uploads/living.jpg"
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
                {w.greeting} {guestFullName}
              </h2>
              <span className="text-[11px] font-bold text-[#07110d] bg-[#62e6bd] px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" />
                <span>{labels.activeStay}</span>
              </span>
            </div>
          ) : (
            <h2 className="text-lg font-bold text-white tracking-tight">
              {w.greeting}
            </h2>
          )}
          <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-normal">
            {w.message}
          </p>
        </div>

        {/* Room Spaces Grid */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">{labels.spaces}</p>
            <h3 className="text-base font-bold text-white tracking-tight">{w.roomsTitle}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="aurora-item-card overflow-hidden p-0 flex flex-col">
              <div className="h-32 w-full overflow-hidden relative">
                <img 
                  src="/uploads/living.jpg" 
                  alt={w.livingTitle} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="aurora-icon-box shrink-0 mt-0.5">
                  <Tv className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs sm:text-sm font-bold text-white">{w.livingTitle}</strong>
                  <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{w.livingDesc}</span>
                </div>
              </div>
            </div>

            <div className="aurora-item-card overflow-hidden p-0 flex flex-col">
              <div className="h-32 w-full overflow-hidden relative">
                <img 
                  src="/uploads/bedroom.jpg" 
                  alt={w.bedroomTitle} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="aurora-icon-box shrink-0 mt-0.5">
                  <Bed className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs sm:text-sm font-bold text-white">{w.bedroomTitle}</strong>
                  <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{w.bedroomDesc}</span>
                </div>
              </div>
            </div>

            <div className="aurora-item-card overflow-hidden p-0 flex flex-col">
              <div className="h-32 w-full overflow-hidden relative">
                <img 
                  src="/uploads/kitchen.jpg" 
                  alt={w.kitchenTitle} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="aurora-icon-box shrink-0 mt-0.5">
                  <Utensils className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs sm:text-sm font-bold text-white">{w.kitchenTitle}</strong>
                  <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{w.kitchenDesc}</span>
                </div>
              </div>
            </div>

            <div className="aurora-item-card overflow-hidden p-0 flex flex-col">
              <div className="h-32 w-full overflow-hidden relative">
                <img 
                  src="/uploads/view.jpg" 
                  alt={w.viewTitle} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="aurora-icon-box shrink-0 mt-0.5">
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

        {/* Additional Sections Grid (Check-in, Services, Info) */}
        <div className="space-y-3 pt-2">
          <div>
            <p className="aurora-eyebrow">{labels.practical}</p>
            <h3 className="text-base font-bold text-white tracking-tight">{labels.useful}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Check In & Smart Lock */}
            <div className="aurora-item-card overflow-hidden p-0 flex flex-col">
              <div className="h-32 w-full overflow-hidden relative">
                <img 
                  src="/uploads/lock.jpg" 
                  alt={t.tiles.checkIn} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="aurora-icon-box shrink-0 mt-0.5">
                  <Key className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs sm:text-sm font-bold text-white">{t.tiles.checkIn}</strong>
                  <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{t.gridMenu.descriptions.check_in}</span>
                </div>
              </div>
            </div>

            {/* Servizi Casa & Comfort */}
            <div className="aurora-item-card overflow-hidden p-0 flex flex-col">
              <div className="h-32 w-full overflow-hidden relative">
                <img 
                  src="/uploads/services.jpg" 
                  alt={t.tiles.servizi} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="aurora-icon-box shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs sm:text-sm font-bold text-white">{t.tiles.servizi}</strong>
                  <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{t.gridMenu.descriptions.servizi}</span>
                </div>
              </div>
            </div>

            {/* Informazioni e Servizi */}
            <div className="aurora-item-card overflow-hidden p-0 flex flex-col">
              <div className="h-32 w-full overflow-hidden relative">
                <img 
                  src="/uploads/info.jpg" 
                  alt={t.tiles.informazioni} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="aurora-icon-box shrink-0 mt-0.5">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs sm:text-sm font-bold text-white">{t.tiles.informazioni}</strong>
                  <span className="text-xs text-white/60 leading-relaxed block mt-0.5">{t.gridMenu.descriptions.informazioni}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};