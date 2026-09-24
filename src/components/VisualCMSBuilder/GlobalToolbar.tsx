import React, { useState } from 'react';
import { useCMS } from './CMSContext';

interface GlobalToolbarProps {
  className?: string;
}

export const GlobalToolbar = ({ className = '' }: GlobalToolbarProps) => {
  const { state, dispatch } = useCMS();
  const [isSaving, setIsSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('IT');

  const languages = [
    { code: 'IT', name: 'Italiano' },
    { code: 'EN', name: 'English' },
    { code: 'DE', name: 'Deutsch' },
    { code: 'FR', name: 'Français' },
    { code: 'ES', name: 'Español' },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLanguage(e.target.value);
    // In a real app, we would update the CMS state or trigger a translation
    console.log(`Language changed to ${e.target.value}`);
  };

  const handleTranslateWithAI = async () => {
    // Placeholder for AI translation
    console.log('Translating with AI...');
    // You would call your translation service here
    // For now, just simulate
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      console.log('Translation complete');
    }, 1500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Placeholder for saving to database
    console.log('Saving layout to database...');
    // You would call your save function here
    setTimeout(() => {
      setIsSaving(false);
      console.log('Save complete');
    }, 1000);
  };

  const handlePreview = () => {
    // Toggle preview mode (disable editing)
    dispatch({ type: 'SET_EDIT_MODE', payload: false });
    console.log('Preview mode enabled');
  };

  const handleEdit = () => {
    // Enable edit mode
    dispatch({ type: 'SET_EDIT_MODE', payload: true });
    console.log('Edit mode enabled');
  };

  return (
    <div className={`${className} flex flex-wrap items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm rounded-[20px] mb-4`}>
      {/* Left side: Language and Translate */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Lingua:</span>
          <select
            value={currentLanguage}
            onChange={handleLanguageChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleTranslateWithAI}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9h0m9.018 2.24a8.001 8.001 0 01-3.473 6.472A8.001 8.001 0 007.582 21h4.958A8.001 8.001 0 0017.582 9a8.005 8.005 0 014.415-1.415m-1.415-5.582a8.005 8.005 0 00-4.415 1.415m5.657 2.745a4.776 4.776 0 01-1.71 5.926A4.782 4.782 0 0110.947 19a4.776 4.776 0 01-4.46 1.43A4.782 4.782 0 014.87 14.518A4.776 4.776 0 017.74 8.761a4.782 4.782 0 011.07-3.292A4.776 4.776 0 0012.332 4a4.776 4.776 0 01-2.541 1.06M15.75 6a3 3 0 11-5.657 4.243M15.75 6A3 3 0 0015.75 6z" />
              </svg>
              <span>Traduzione in corso...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h3m8 9v-9M8 7l5 5 5-5" />
              </svg>
              <span>Traduci con IA</span>
            </>
          )}
        </button>
      </div>

      {/* Center: Status */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-gray-600">{isSaving ? 'Salvataggio in corso...' : 'Salvato'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-gray-600">{state.isEditMode ? 'Modalità modifica' : 'Modalità anteprima'}</span>
        </div>
      </div>

      {/* Right side: Preview/Edit buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={state.isEditMode ? handlePreview : handleEdit}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md
            ${state.isEditMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}
          `}
        >
          {state.isEditMode ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                {/* Eye slash for preview */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 1a3 3 0 010 5.73M5.713 9.28a9 9 0 1111.718-2.28M13.532 14.016A9.001 9.001 0 003.543 18.018A9 9 0 0113.532 14.016z" />
              </svg>
              <span>Anteprima</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 006 0z" />
                {/* Edit icon (pencil) */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3 3-3" />
              </svg>
              <span>Modifica</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};