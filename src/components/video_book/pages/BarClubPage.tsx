import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { MapPin, Phone, Coffee, Sparkles } from 'lucide-react';
import { PageEditable, EditableHeroBanner } from '../cmsPageHelpers';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const BarClubPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  
  const bars = BOOK_DATA[language].bars;
  const t = VIDEO_TRANSLATIONS[language];
  const labels = VIDEO_PAGE_LABELS[language];

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={bars.title}
          category={t.tiles.barClub}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Banner */}
        <EditableHeroBanner
          page="bar_club"
          img="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
          alt="Café & Wine Bar"
          eyebrow={
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {bars.title}
            </span>
          }
          title={bars.bannerText}
        />

        {/* Recommended bars list */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">{labels.favorites}</p>
            <h3 className="text-base font-bold text-white tracking-tight">{labels.historicBars}</h3>
          </div>

          {bars.recommended.filter((bar) => !/poletti/i.test(bar.name)).map((b, idx) => (
            <PageEditable key={idx} id={`page.bar_club.bar-${idx}`} label={b.name}>
              <div
                className="aurora-glass-card space-y-3"
              >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
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
                    title={t.actions.call}
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
                    <span>{t.actions.googleMaps}</span>
                  </a>
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                {b.desc}
              </p>
              </div>
            </PageEditable>
          ))}
        </div>

        {/* In-house coffee note */}
        <PageEditable id="page.bar_club.coffee-note" label="Nota caffè">
          <div className="aurora-glass-card p-4 flex items-center gap-3.5">
            <div className="aurora-icon-box">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-bold text-white">{bars.coffeeTitle}</strong>
              <span className="text-xs text-white/60 leading-snug block mt-0.5">{bars.coffeeDesc}</span>
            </div>
          </div>
        </PageEditable>

      </div>
    </div>
  );
};
