import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { MapPin, ShoppingBag, Clock } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const ShoppingPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsShopping = getPageData('shopping') || {};
  const sh = { ...BOOK_DATA[language].shopping, ...cmsShopping };

  return (
    <div className="bg-[#080b10] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={sh.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Shopping List */}
      <div className="space-y-2.5">
        {sh.shops.map((shop, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0 mt-0.5 text-purple-300">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">
                    {shop.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {shop.time}
                  </span>
                </div>
              </div>

              <a
                href={shop.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-[#62e6bd] hover:bg-[#93f4d4] text-[#07110d] font-bold text-[10px] flex items-center gap-1 border border-transparent shrink-0 cursor-pointer transition"
              >
                <MapPin className="w-3 h-3 text-[#07110d]" />
                <span>Maps</span>
              </a>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium pl-10">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{shop.hours}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-10">
              {shop.desc}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
