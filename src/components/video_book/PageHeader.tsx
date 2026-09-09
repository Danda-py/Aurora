import React from 'react';
import { Language } from '../../types';
import { FlagIcon } from './FlagIcon';
import { ChevronLeft } from 'lucide-react';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';

interface Props {
  title: string;
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const PageHeader: React.FC<Props> = ({ title, language, onBackToMenu, onSelectLanguage }) => {
  const t = VIDEO_TRANSLATIONS[language];
  const languagesList: Language[] = ['en', 'fr', 'es', 'it', 'de'];

  // Cycle language when clicking the top right flag
  const cycleLanguage = () => {
    const currentIndex = languagesList.indexOf(language);
    const nextIndex = (currentIndex + 1) % languagesList.length;
    onSelectLanguage(languagesList[nextIndex]);
  };

  return (
    <header className="sticky top-2 z-30 flex items-center justify-between px-3 sm:px-4 py-2 mb-3.5 bg-neutral-900/75 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/[0.08] shadow-sm text-neutral-100">
      
      {/* Apple iOS Back Button */}
      <button
        onClick={onBackToMenu}
        id="btn-back-to-grid"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] text-neutral-200 hover:text-white font-medium text-xs tracking-tight border border-white/[0.06] active:scale-[0.96] transition-all cursor-pointer group"
      >
        <ChevronLeft className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">{t.actions.backToMenu}</span>
        <span className="sm:hidden">Menu</span>
      </button>

      {/* Title */}
      <h2 className="text-xs sm:text-sm font-semibold text-white tracking-tight uppercase text-center px-2 truncate max-w-[200px] sm:max-w-xs">
        {title}
      </h2>

      {/* Active Language Flag */}
      <button
        onClick={cycleLanguage}
        id="btn-cycle-lang"
        className="w-7 h-7 rounded-full overflow-hidden shadow-xs ring-1 ring-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
        title="Cambia lingua"
      >
        <FlagIcon language={language} className="w-full h-full object-cover" />
      </button>

    </header>
  );
};


