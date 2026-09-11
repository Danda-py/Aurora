import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { useCms } from '../../../context/CmsContext';
import { APARTMENT_INFO } from '../../../data/apartmentData';
import { Clock, CheckSquare, Square, Heart, Star } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const CheckoutPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData, media } = useCms();
  const cmsCheckOut = getPageData('checkOut') || {};
  const co = { ...BOOK_DATA[language].checkOut, ...cmsCheckOut };
  const reviewCopy = BOOK_DATA[language].contacts;
  const t = VIDEO_TRANSLATIONS[language];
  const labels = VIDEO_PAGE_LABELS[language];
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={co.title}
          category={t.tiles.checkOut}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <div className="aurora-hero-banner">
          <img
            src={media?.checkOutCover || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"}
            alt="Check-out e Fine Soggiorno"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              {co.title}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {co.title}
            </h1>
          </div>
        </div>

        {/* Checkout Time Banner */}
        <div className="text-center py-2 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-xs font-mono font-bold text-xs tracking-wider">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>{co.badge}</span>
          </div>
          <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
            {co.lateNote}
          </p>
        </div>

        {/* Interactive Checkpoints */}
        <div className="aurora-glass-card space-y-4">
          <div>
            <span className="aurora-eyebrow">{labels.departure}</span>
            <h4 className="font-bold text-base text-white tracking-tight mt-0.5">
              {co.checklistTitle}
            </h4>
          </div>

          <div className="space-y-2.5">
            {co.checklist.map((item, idx) => {
              const isDone = !!checkedItems[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleCheck(idx)}
                  className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-start gap-3.5 cursor-pointer select-none ${
                    isDone 
                      ? 'bg-[#62e6bd]/15 border-[#62e6bd]/40 text-white' 
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-white/80'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-[#62e6bd]" />
                    ) : (
                      <Square className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`block text-xs sm:text-sm font-bold tracking-tight ${isDone ? 'line-through text-white/50' : 'text-white'}`}>
                      {item.title}
                    </span>
                    <span className="text-xs text-white/60 leading-relaxed block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thank you note */}
        <div className="aurora-glass-card text-center space-y-2 p-6">
          <Heart className="w-6 h-6 text-rose-400 mx-auto fill-rose-400/20" />
          <p className="text-xs sm:text-sm italic text-white/80 leading-relaxed max-w-md mx-auto">
            "{co.thankYou}"
          </p>
        </div>

        {/* Leave a review invite */}
        <a
          href={APARTMENT_INFO.reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="aurora-glass-card flex items-center gap-4 hover:border-[#62e6bd]/40 transition group cursor-pointer"
        >
          <div className="aurora-icon-box bg-[#62e6bd] text-[#07110d] group-hover:scale-105 transition-transform">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm sm:text-base text-white font-bold tracking-tight">{labels.reviewTitle}</strong>
            <span className="text-xs text-white/60 leading-snug block mt-0.5">{labels.reviewDescription}</span>
          </div>
        </a>

        <div className="aurora-glass-card text-center space-y-3 p-6">
          <div className="flex items-center justify-center gap-1 text-[#62e6bd]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-xs text-white/75 leading-relaxed max-w-sm mx-auto">
            {reviewCopy.reviewPrompt}
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={APARTMENT_INFO.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-secondary-pill py-3"
            >
              <span>{reviewCopy.rateGoogle}</span>
            </a>
            <a
              href={APARTMENT_INFO.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-action-pill py-3"
            >
              <span>{reviewCopy.rateWebsite}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
