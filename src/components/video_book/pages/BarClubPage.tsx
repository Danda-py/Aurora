import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Phone, Coffee, Sparkles } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const BarClubPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData, media } = useCms();
  const cmsBars = getPageData('bars') || {};
  const bars = { ...BOOK_DATA[language].bars, ...cmsBars };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={bars.title}
          category="Caffè & Serate"
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Banner */}
        <div className="aurora-hero-banner">
          <img
            src={media?.barsCover || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"}
            alt="Café & Wine Bar"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Colazioni & Aperitivi
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {bars.bannerText}
            </h1>
          </div>
        </div>

        {/* Recommended bars list */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">I Nostri Bar Preferiti</p>
            <h3 className="text-base font-bold text-white tracking-tight">Bar storici ed enoteche a Morbegno</h3>
          </div>

          {bars.recommended.map((b, idx) => (
            <div
              key={idx}
              className="aurora-glass-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="aurora-eyebrow text-[#62e6bd] font-mono">
                    {b.time}
                  </span>
                  <h4 className="font-bold text-base text-white tracking-tight mt-0.5">
                    {b.name}
                  </h4>
                  <span className="text-xs text-white/60 block mt-0.5">
                    {b.address}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${b.phone}`}
                    className="aurora-secondary-pill"
                    title="Chiama"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#62e6bd]" />
                  </a>
                  <a
                    href={b.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aurora-action-pill"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#07110d]" />
                    <span>Maps</span>
                  </a>
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>

        {/* In-house coffee note */}
        <div className="aurora-glass-card p-4 flex items-center gap-3.5">
          <div className="aurora-icon-box">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-xs sm:text-sm font-bold text-white">{bars.coffeeTitle}</strong>
            <span className="text-xs text-white/60 leading-snug block mt-0.5">{bars.coffeeDesc}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
