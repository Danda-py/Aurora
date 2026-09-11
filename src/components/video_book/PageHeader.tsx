import React from 'react';
import { Language } from '../../types';
import { FlagIcon } from './FlagIcon';
import { ChevronLeft } from 'lucide-react';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';

interface Props {
  title: string;
  category?: string;
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const PageHeader: React.FC<Props> = ({ title, category, language, onBackToMenu, onSelectLanguage }) => {
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const languagesList: Language[] = ['it', 'en', 'de', 'fr', 'es'];

  // Cycle language when clicking the top right flag
  const cycleLanguage = () => {
    const currentIndex = languagesList.indexOf(language);
    const nextIndex = (currentIndex + 1) % languagesList.length;
    onSelectLanguage(languagesList[nextIndex]);
  };

  return (
    <header className="sticky top-3 z-40 flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-[#080b10]/85 backdrop-blur-2xl rounded-2xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.36)] text-white">
      
      {/* Apple-style Back Button */}
      <button
        onClick={onBackToMenu}
        id="btn-back-to-grid"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-white text-xs font-bold tracking-tight border border-white/[0.1] active:scale-[0.96] transition-all cursor-pointer group shadow-sm"
      >
        <ChevronLeft className="w-4 h-4 text-[#62e6bd] group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">{t.actions?.backToMenu || 'Tutto Aurora'}</span>
        <span className="sm:hidden">Guida</span>
      </button>

      {/* Center Title Indicator */}
      <div className="flex flex-col items-center justify-center px-2 min-w-0 max-w-[200px] sm:max-w-xs">
        {category && (
          <span className="text-[9px] font-bold tracking-widest text-[#62e6bd] uppercase truncate font-mono">
            {category}
          </span>
        )}
        <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight uppercase truncate">
          {title}
        </h2>
      </div>

      {/* Active Language Flag Trigger */}
      <button
        onClick={cycleLanguage}
        id="btn-cycle-lang"
        className="w-8 h-8 rounded-full overflow-hidden shadow-md ring-1 ring-white/20 hover:ring-[#62e6bd] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 border border-white/10"
        title="Cambia lingua"
        aria-label="Cambia lingua"
      >
        <FlagIcon language={language} className="w-full h-full object-cover" />
      </button>

    </header>
  );
};
