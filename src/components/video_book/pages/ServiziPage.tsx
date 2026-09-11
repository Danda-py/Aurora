import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { CheckCircle2, Info } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const ServiziPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsAmenities = getPageData('amenities') || {};
  const am = { ...BOOK_DATA[language].amenities, ...cmsAmenities };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={am.title}
          category="Dotazioni Casa"
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <div className="aurora-hero-banner">
          <img
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
            alt="Servizi e Comfort Appartamento"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              Comfort & Tecnologia
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Servizi Inclusi nel Soggiorno
            </h1>
          </div>
        </div>

        {/* Grid of amenities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {am.items.map((item, idx) => (
            <div
              key={idx}
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
          ))}
        </div>

        {/* Safety / energy notice */}
        <div className="aurora-glass-card p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#62e6bd] shrink-0 mt-0.5" />
          <span className="text-xs text-white/70 leading-relaxed">{am.notice}</span>
        </div>

      </div>
    </div>
  );
};
