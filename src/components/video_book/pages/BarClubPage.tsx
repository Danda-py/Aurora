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
  const { getPageData } = useCms();
  const cmsBars = getPageData('bars') || {};
  const bars = { ...BOOK_DATA[language].bars, ...cmsBars };

  return (
    <div className="bg-[#0b0e14] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={bars.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Banner */}
      <div className="relative h-40 sm:h-48 w-full rounded-2xl overflow-hidden shadow-md border border-white/[0.08]">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
          alt="Café & Wine Bar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-black/40 to-transparent flex items-end p-4">
          <span className="text-white text-sm sm:text-base font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-neutral-400" />
            {bars.bannerText}
          </span>
        </div>
      </div>

      {/* Recommended bars list */}
      <div className="space-y-2.5">
        {bars.recommended.map((b, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  {b.time}
                </span>
                <h4 className="font-semibold text-xs sm:text-sm text-white">
                  {b.name}
                </h4>
                <span className="text-[11px] text-slate-400 block">
                  {b.address}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${b.phone}`}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition border border-white/10 cursor-pointer"
                  title="Chiama"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </a>
                <a
                  href={b.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-[10px] flex items-center gap-1 border border-white/10 transition cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span>Maps</span>
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {b.desc}
            </p>
          </div>
        ))}
      </div>

      {/* In-house coffee note */}
      <div className="p-4 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-neutral-200 flex items-center justify-center shrink-0">
          <Coffee className="w-5 h-5" />
        </div>
        <div>
          <strong className="block text-xs font-semibold text-white">{bars.coffeeTitle}</strong>
          <span className="text-[11px] text-slate-400 leading-snug block">{bars.coffeeDesc}</span>
        </div>
      </div>

    </div>
  );
};
