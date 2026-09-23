import React from 'react';

interface CMSToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onTranslateWithAI: () => Promise<void>;
  onSave: () => Promise<void>;
  isSaving: boolean;
  hasChanges: boolean;
}

export const CMSToolbar = ({
  language,
  onLanguageChange,
  onTranslateWithAI,
  onSave,
  isSaving,
  hasChanges
}: CMSToolbarProps) => {
  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Save failed:', error);
      // In a real implementation, you'd show a toast notification
      alert('Salvataggio fallito: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  const handleTranslateWithAI = async () => {
    try {
      await onTranslateWithAI();
    } catch (error) {
      console.error('AI translation failed:', error);
      alert('Traduzione AI fallita: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  // Language flags mapping
  const languageFlags: Record<string, string> = {
    it: '🇮🇹',
    en: '🇬🇧',
    de: '🇩🇪',
    fr: '🇫🇷',
    es: '🇪🇸'
  };

  const languageNames: Record<string, string> = {
    it: 'Italiano',
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español'
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-md border-b border-white/5">
      {/* Language Selector */}
      <div className="flex items-center gap-2">
        {['it', 'en', 'de', 'fr', 'es'].map(lang => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all 
              ${language === lang 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}
            `}
            aria-label={`Passa a ${languageNames[lang]} (${languageFlags[lang]})`}
          >
            <span className="mr-1">{languageFlags[lang]}</span>
            <span className="hidden ml-1">{languageNames[lang].substring(0, 3)}</span>
          </button>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleTranslateWithAI}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-500 text-white 
            hover:bg-indigo-600 transition-colors 
            ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-13.897-2m0 0a8.003 8.003 0 0013.897 2h5.582m9.414-3a1 1 0 10-1.414-1.414M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salvataggio...
            </>
          ) : (
            'Traduci con IA'
          )}
        </button>
        
        <button
          onClick={handleSave}
          className={`
            px-4 py-1.5 rounded-md text-sm font-medium 
            ${hasChanges ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white/10 text-white/50'}
            hover:bg-white/10
            transition-colors
            ${!hasChanges || isSaving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-13.897-2m0 0a8.003 8.003 0 0013.897 2h5.582m9.414-3a1 1 0 10-1.414-1.414M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salvataggio...
            </>
          ) : (
            hasChanges ? 'Salva Modifiche' : 'Nessuna modifica'
          )}
        </button>
      </div>
    </div>
  );
};
