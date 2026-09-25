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
  const { state, setLanguage } = useCMS();
  const { previewVariant, selectElement } = useEditMode();
  const screenRef = useRef<HTMLDivElement>(null);

  // Click fuori dallo schermo dell'iPhone e dalla toolbar fluttuante:
  // deseleziona l'elemento in editing. I click DENTRO lo schermo sono parte
  // dell'editing (selezione/esecuzione, vedi EditModeContext).
  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (screenRef.current?.contains(target)) return;
      if (target?.closest?.('[data-floating-toolbar]')) return;
      selectElement(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [selectElement]);

  return (
    <div className={`flex flex-col items-center gap-5 w-full px-4 sm:px-8 py-6 ${className}`}>
      <BuilderTopToolbar className="w-full max-w-3xl" />

      {/* Canvas con ampio padding: la toolbar fluttuante (in portal) non viene
          mai tagliata perché vive a livello di document.body, non qui. */}
      <div className="relative w-full flex justify-center py-14">
        <iPhone18Frame scale={0.78}>
          <div ref={screenRef} className="relative w-full h-full overflow-hidden bg-black">
            {/* PWA ospiti REALE dentro il frame, in modalità editing.
                Il pass mostrato dipende dal toggle: 'pass' = mock neutro,
                'no-pass' = nessun pass (visitatore senza check-in). */}
            <div className="w-full h-full overflow-y-auto overflow-x-hidden">
              <VideoWelcomeBook
                key={previewVariant}
                initialLanguage="it"
                isEditMode
                editorPass={previewVariant === 'pass' ? 'mock' : 'none'}
              />
            </div>
          </div>
        </iPhone18Frame>
      </div>

      {/* Toolbar di formattazione + campo URL dell'elemento selezionato
          (portal a document.body, mai tagliata dai contenitori). */}
      <FloatingTextToolbar containerRef={screenRef} />

      {/* La lingua è fissata su IT: l'host modifica solo l'italiano, le traduzioni
          sono gestite automaticamente a livello globale. */}
      <BuilderLanguageBridge onLanguageChange={setLanguage} />
    </div>
  );
};

/**
 * La lingua del builder è bloccata su IT: rimuove ?lang= dall'URL così la PWA
 * dentro l'iPhone non eredita lingue diverse (l'ospite nella sua sessione la
 * sceglierà liberamente; l'host modifica solo la sorgente italiana).
 */
const BuilderLanguageBridge: React.FC<{ onLanguageChange: (lang: any) => void }> = ({ onLanguageChange }) => {
  React.useEffect(() => {
    onLanguageChange('it');
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.delete('lang');
        window.history.replaceState({}, '', url);
      }
    } catch {
      // ignore
    }
  }, [onLanguageChange]);

  return null;
};
