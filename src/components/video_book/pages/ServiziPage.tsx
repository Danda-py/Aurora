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
    <div className="bg-[#0b0e14] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={am.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Grid of amenities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {am.items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <strong className="block text-xs font-semibold text-white tracking-wide">
                {item.title}
              </strong>
              <span className="text-[11px] text-slate-400 truncate block">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Safety / energy notice */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{am.notice}</span>
      </div>

    </div>
  );
};
