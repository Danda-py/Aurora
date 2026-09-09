import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Bike, Mountain, Wine, Compass, Sparkles } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const AttivitaPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsActivities = getPageData('activities') || {};
  const act = { ...BOOK_DATA[language].activities, ...cmsActivities };

  const categoryIcons = [
    <Bike key="bike" className="w-4 h-4 text-teal-300 shrink-0" />,
    <Wine key="wine" className="w-4 h-4 text-rose-300 shrink-0" />,
    <Mountain key="mountain" className="w-4 h-4 text-blue-300 shrink-0" />,
    <Compass key="compass" className="w-4 h-4 text-neutral-300 shrink-0" />
  ];

  return (
    <div className="bg-[#0b0e14] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={act.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Top Banner Image with Overlay */}
      <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden shadow-md border border-white/[0.08]">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          alt="Valtellina Panorama"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-black/40 to-transparent flex items-end p-4">
          <div className="space-y-1">
            <span className="text-neutral-300 text-[11px] font-semibold tracking-wider flex items-center gap-1.5 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" /> Valtellina & Alpi
            </span>
            <h3 className="text-white text-base sm:text-lg font-bold leading-tight">
              {act.bannerText}
            </h3>
          </div>
        </div>
      </div>

      {/* Highlights List */}
      <div className="space-y-2.5">
        {act.highlights.map((item, index) => (
          <div
            key={index}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 bg-white/[0.08] border border-white/[0.1] text-neutral-200">
                  {item.tag}
                </span>
                <h4 className="font-semibold text-xs sm:text-sm text-white">
                  {item.title}
                </h4>
              </div>
              <a
                href={item.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1 transition border border-white/10 shrink-0 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-neutral-400" />
                <span>Maps</span>
              </a>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Additional categories grid */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm space-y-3">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider text-center">
          {act.categoryTitle}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {act.categories.map((cat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#1b2030] flex items-center gap-3 border border-white/[0.06]">
              {categoryIcons[idx % categoryIcons.length]}
              <div>
                <strong className="block text-white text-xs font-semibold">{cat.title}</strong>
                <span className="text-[11px] text-slate-400 leading-snug block">{cat.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
