import React from 'react';
import { Language } from '../../types';
import { FlagIcon } from './FlagIcon';
import { Sparkles, ChevronRight, ShieldCheck, Mountain } from 'lucide-react';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';

interface Props {
  onSelectLanguage: (lang: Language) => void;
}

export const LanguageSelectScreen: React.FC<Props> = ({ onSelectLanguage }) => {
  const t = VIDEO_TRANSLATIONS.it;
  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'it', label: 'ITALIANO', native: 'Seleziona lingua' },
    { code: 'en', label: 'ENGLISH', native: 'Select language' },
    { code: 'de', label: 'DEUTSCH', native: 'Sprache auswählen' },
    { code: 'fr', label: 'FRANÇAIS', native: 'Sélectionner la langue' },
    { code: 'es', label: 'ESPAÑOL', native: 'Seleccionar idioma' }
  ];

  return (
    <div className="aurora-concierge min-h-screen text-white flex flex-col justify-between p-5 sm:p-8 select-none">
      
      {/* Top bar location marker */}
      <div className="aurora-shell flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[#62e6bd] text-xs font-semibold backdrop-blur-md">
          <Mountain className="w-3.5 h-3.5 text-[#62e6bd]" />
          <span>Morbegno • Valtellina</span>
        </div>
      </div>

      {/* Top Branding: Aurora in Valtellina */}
      <div className="aurora-shell text-center py-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.06] text-[#9ef2d3] text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-white/[0.1] shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-[#62e6bd]" /> {t.langSelect.badge}
        </div>
        
        <div className="py-2">
          <h1 className="text-white drop-shadow-xl">
            <span className="font-aurora text-6xl sm:text-7xl text-[#62e6bd] tracking-wide block font-normal leading-tight">
              Aurora
            </span>
            <span className="font-serif-luxury tracking-[0.32em] text-xs sm:text-sm font-bold uppercase text-white/90 block -mt-1">
              IN VALTELLINA
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-light italic tracking-wide max-w-xs mx-auto mt-2">
            {t.langSelect.subtitle}
          </p>
        </div>
      </div>

      {/* 5 Language Pill Buttons */}
      <div className="aurora-shell w-full max-w-sm mx-auto space-y-3 pb-6 sm:pb-10">
        <div className="text-center pb-1">
          <span className="aurora-eyebrow text-[#62e6bd]">
            {t.selectLanguage}
          </span>
        </div>

        {languages.map((item) => (
          <button
            key={item.code}
            onClick={() => onSelectLanguage(item.code)}
            id={`lang-btn-${item.code}`}
            className="w-full h-14 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-[0.98] border border-white/[0.1] hover:border-[#62e6bd]/50 shadow-lg shadow-black/30 flex items-center justify-between transition-all duration-200 cursor-pointer group backdrop-blur-xl"
          >
            {/* Round Flag Icon */}
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-md ring-1 ring-white/20 group-hover:ring-[#62e6bd] group-hover:scale-105 transition">
              <FlagIcon language={item.code} className="w-full h-full object-cover" />
            </div>

            {/* Label in clean all-caps */}
            <div className="flex-1 text-center pl-2 pr-2">
              <span className="block font-bold text-xs sm:text-sm tracking-wider text-white uppercase group-hover:text-[#62e6bd] transition-colors">
                {item.label}
              </span>
              <span className="block text-[10px] text-white/50 group-hover:text-white/80 transition-colors">
                {item.native}
              </span>
            </div>

            {/* Subtle Right Arrow */}
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#62e6bd] group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}

        <div className="pt-2 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#62e6bd]" />
            <span>{t.langSelect.secureAccess}</span>
          </span>
        </div>
      </div>

    </div>
  );
};
