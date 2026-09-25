import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { CheckCircle2, Info } from 'lucide-react';
import { PageEditable, EditableHeroBanner } from '../cmsPageHelpers';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const ServiziPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  
  const am = BOOK_DATA[language].amenities;
  const t = VIDEO_TRANSLATIONS[language];
  const labels = VIDEO_PAGE_LABELS[language];

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={am.title}
          category={t.tiles.servizi}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <EditableHeroBanner
          page="servizi"
          img="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
          alt="Servizi e Comfort Appartamento"
          eyebrow={
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              {labels.comfort}
            </span>
          }
          title={am.title}
        />

        {/* Grid of amenities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {am.items.map((item, idx) => (
            <PageEditable key={idx} id={`page.servizi.item-${idx}`} label={item.title}>
              <div
                className="aurora-item-card items-center"
              >
                <div className="aurora-icon-box">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-xs sm:text-sm font-bold text-white tracking-tight">
                    {item.title}
                  </strong>
                  <span className="text-xs text-white/60 leading-relaxed block mt-0.5">
                    {item.desc}
                  </span>
                </div>
              </div>
            </PageEditable>
          ))}
        </div>

        {/* Safety / energy notice */}
        <PageEditable id="page.servizi.notice" label="Avviso sicurezza">
          <div className="aurora-glass-card p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#62e6bd] shrink-0 mt-0.5" />
            <span className="text-xs text-white/70 leading-relaxed">{am.notice}</span>
          </div>
        </PageEditable>

      </div>
    </div>
  );
};
