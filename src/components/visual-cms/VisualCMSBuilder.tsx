import React, { useRef } from 'react';
import { CMSProvider, useCMS } from './CMSContext';
import { EditModeProvider, useEditMode } from './EditModeContext';
import { iPhone18Frame } from './iPhone18Frame';
import { BuilderTopToolbar } from './BuilderTopToolbar';
import { FloatingTextToolbar } from './FloatingTextToolbar';
import { VideoWelcomeBook } from '../video_book/VideoWelcomeBook';

/**
 * Visual CMS Builder - FASE 1: isolamento dell'interfaccia.
 *
 * Al centro il frame dell'iPhone 18 con dentro la PWA ospiti REALE
 * (VideoWelcomeBook), renderizzata in modalità standalone (senza pass).
 * Sopra l'iPhone, la barra globale con selettore lingua e stato salvataggio.
 * La logica di editing arriverà nelle fasi successive.
 */
export const VisualCMSBuilder: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <CMSProvider>
      <EditModeProvider isEditMode>
        <LanguageSync />
        <BuilderShell className={className} />
      </EditModeProvider>
    </CMSProvider>
  );
};

/** Sincronizza la lingua del selettore builder con quella dell'editing (per override per lingua). */
const LanguageSync: React.FC = () => {
  const { state } = useCMS();
  const { setLanguage } = useEditMode();
  React.useEffect(() => {
    setLanguage(state.language);
  }, [state.language, setLanguage]);
  return null;
};

const BuilderShell: React.FC<{ className: string }> = ({ className }) => {
  const { state, setLanguage, selectBlock } = useCMS();
  const screenRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`flex flex-col items-center gap-4 w-full ${className}`}>
      <BuilderTopToolbar className="w-full max-w-2xl" />

      <div className="relative">
        <iPhone18Frame scale={0.72}>
          <div ref={screenRef} className="relative w-full h-full overflow-hidden bg-black">
            {/* PWA ospiti REALE dentro il frame, in modalità editing */}
            <div className="w-full h-full overflow-y-auto overflow-x-hidden">
              <VideoWelcomeBook initialLanguage={state.language} isEditMode />
            </div>

            {/* Toolbar fluttuante (agganciata all'elemento selezionato) */}
            <FloatingTextToolbar containerRef={screenRef} />
          </div>
        </iPhone18Frame>
      </div>

      {/* La lingua scelta nella toolbar guida la PWA: il context resta la fonte di verità del builder. */}
      <BuilderLanguageBridge onLanguageChange={setLanguage} />
    </div>
  );
};

/**
 * Ponte lingua: VideoWelcomeBook legge ?lang= dall'URL e aggiorna l'URL quando
 * l'ospite cambia lingua dall'interno della PWA. Questo componente ascolta le
 * variazioni dell'URL e le riporta nel context del builder, così la toolbar in
 * alto resta sincronizzata con la lingua effettiva della PWA dentro l'iPhone.
 */
const BuilderLanguageBridge: React.FC<{ onLanguageChange: (lang: any) => void }> = ({ onLanguageChange }) => {
  React.useEffect(() => {
    const checkLang = () => {
      try {
        const lang = new URLSearchParams(window.location.search).get('lang');
        if (lang && ['it', 'en', 'de', 'fr', 'es'].includes(lang)) {
          onLanguageChange(lang);
        }
      } catch {
        // ignore
      }
    };
    checkLang();
    // patch history per intercettare replaceState fatto dalla PWA
    const original = window.history.replaceState.bind(window.history);
    window.history.replaceState = (...args: Parameters<typeof original>) => {
      original(...args);
      checkLang();
    };
    return () => {
      window.history.replaceState = original;
    };
  }, [onLanguageChange]);

  return null;
};
