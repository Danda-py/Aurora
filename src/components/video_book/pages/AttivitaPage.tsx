import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Bike, Mountain, Wine, Compass, Sparkles } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const AttivitaPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData, media } = useCms();
  const cmsActivities = getPageData('activities') || {};
  const act = { ...BOOK_DATA[language].activities, ...cmsActivities };
  const t = VIDEO_TRANSLATIONS[language];

  const categoryIcons = [
    <Bike key="bike" className="w-5 h-5 text-[#62e6bd] shrink-0" />,
    <Wine key="wine" className="w-5 h-5 text-[#62e6bd] shrink-0" />,
    <Mountain key="mountain" className="w-5 h-5 text-[#62e6bd] shrink-0" />,
    <Compass key="compass" className="w-5 h-5 text-[#62e6bd] shrink-0" />
  ];

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={act.title}
          category={t.tiles.attivita}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Top Banner Image with Overlay */}
        <div className="aurora-hero-banner">
          <img
            src={media?.activitiesCover || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"}
            alt="Valtellina Panorama"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {act.title}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {act.bannerText}
            </h1>
          </div>
        </div>

        {/* Highlights List */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">Itinerari Imperdibili</p>
            <h3 className="text-base font-bold text-white tracking-tight">Le migliori esperienze vicino a casa</h3>
          </div>

          {act.highlights.map((item, index) => (
            <div
              key={index}
              className="aurora-glass-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="aurora-eyebrow text-[#62e6bd] font-mono">
                    {item.tag}
                  </span>
                  <h4 className="font-bold text-base text-white tracking-tight mt-0.5">
                    {item.title}
                  </h4>
                </div>
                <a
                  href={item.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aurora-action-pill"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#07110d]" />
                  <span>Maps</span>
                </a>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Additional categories grid */}
        <div className="aurora-glass-card space-y-4">
          <div className="text-center">
            <span className="aurora-eyebrow">Per Ogni Passione</span>
            <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
              {act.categoryTitle}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {act.categories.map((cat, idx) => (
              <div key={idx} className="aurora-item-card items-center">
                <div className="aurora-icon-box">
                  {categoryIcons[idx % categoryIcons.length]}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-white text-xs sm:text-sm font-bold tracking-tight">{cat.title}</strong>
                  <span className="text-xs text-white/60 leading-snug block mt-0.5">{cat.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
