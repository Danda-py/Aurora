import React, { useState } from 'react';
import { Language } from '../../types';
import { FlagIcon } from './FlagIcon';
import { Check, ChevronLeft } from 'lucide-react';
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
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  return (
    <nav className="sticky top-2 z-40 flex items-center justify-between gap-3 w-full py-1">
      
      {/* Apple Circular Frosted Glass Back Button */}
      <button
        onClick={onBackToMenu}
        id="btn-back-to-grid"
        className="flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-full bg-[#080b10]/80 hover:bg-[#080b10] active:bg-black/90 backdrop-blur-2xl border border-white/15 text-white text-xs font-bold tracking-tight shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all active:scale-95 cursor-pointer group"
        aria-label="Torna alla guida principale"
      >
        <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#62e6bd] group-hover:text-[#07110d] flex items-center justify-center transition-colors">
          <ChevronLeft className="w-4 h-4 text-white group-hover:text-[#07110d] group-hover:-translate-x-0.5 transition-all" />
        </div>
        <span>{t.actions?.backToMenu || 'Tutto Aurora'}</span>
      </button>

      {/* Floating Center Breadcrumb Badge */}
      {category && (
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#080b10]/70 backdrop-blur-2xl border border-white/10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#62e6bd]" />
          <span className="text-[11px] font-bold text-white/80 tracking-wide uppercase font-mono">
            {category}
          </span>
        </div>
      )}

      {/* Apple Circular Frosted Glass Language Trigger */}
      <button
        onClick={() => setIsLanguageMenuOpen((isOpen) => !isOpen)}
        id="btn-cycle-lang"
        className="w-10 h-10 rounded-full p-1 bg-[#080b10]/80 hover:bg-[#080b10] active:bg-black/90 backdrop-blur-2xl border border-white/15 shadow-[0_8px_25px_rgba(0,0,0,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
        title="Cambia lingua"
        aria-label="Cambia lingua"
      >
        <div className="w-full h-full rounded-full overflow-hidden ring-1 ring-white/20">
          <FlagIcon language={language} className="w-full h-full object-cover" />
        </div>
      </button>

      {isLanguageMenuOpen && (
        <div className="subpage-language-menu" role="menu" aria-label="Seleziona lingua">
          {languagesList.map((item) => (
            <button
              key={item}
              type="button"
              className={item === language ? 'active' : ''}
              onClick={() => {
                onSelectLanguage(item);
                setIsLanguageMenuOpen(false);
              }}
              role="menuitemradio"
              aria-checked={item === language}
            >
              <FlagIcon language={item} className="h-5 w-5" />
              <span>{item.toUpperCase()}</span>
              {item === language && <Check className="ml-auto h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}

    </nav>
  );
};
