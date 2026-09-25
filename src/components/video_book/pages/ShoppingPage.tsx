import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { MapPin, ShoppingBag, Clock } from 'lucide-react';
import { PageEditable, EditableHeroBanner } from '../cmsPageHelpers';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const ShoppingPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  
  const sh = BOOK_DATA[language].shopping;
  const t = VIDEO_TRANSLATIONS[language];
  const labels = VIDEO_PAGE_LABELS[language];

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={sh.title}
          category={t.tiles.shopping}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <EditableHeroBanner
          page="shopping"
          img="https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1200&q=80"
          alt="Botteghe e Sapori Tipici"
          eyebrow={
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              {labels.artisan}
            </span>
          }
          title={sh.title}
        />

        {/* Shopping List */}
        <div className="space-y-3">
          {sh.shops.map((shop, idx) => (
            <PageEditable key={idx} id={`page.shopping.shop-${idx}`} label={shop.title}>
              <div
                className="aurora-glass-card space-y-3"
              >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="aurora-icon-box mt-0.5">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-base text-white tracking-tight mt-0.5">
                      {shop.title}
                    </h4>
                    {shop.time && (
                      <span className="text-xs text-white/60 block mt-0.5">
                        {shop.time}
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href={shop.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aurora-action-pill"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#07110d]" />
                  <span>{t.actions.googleMaps}</span>
                </a>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium pl-14">
                <Clock className="w-3.5 h-3.5 text-[#62e6bd]" />
                <span>{shop.hours}</span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed pl-14">
                {shop.desc}
              </p>
              </div>
            </PageEditable>
          ))}
        </div>

      </div>
    </div>
  );
};
