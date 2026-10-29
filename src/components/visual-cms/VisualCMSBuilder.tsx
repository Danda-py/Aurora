import React, { useEffect, useRef, useState } from 'react';
import { CMSProvider, useCMS } from './CMSContext';
import { EditModeProvider, useEditMode } from './EditModeContext';
import { IPhone18Frame } from './iPhone18Frame';
import { BuilderTopToolbar } from './BuilderTopToolbar';
import { CMSSidePanel } from './CMSSidePanel';
import { VideoWelcomeBook } from '../video_book/VideoWelcomeBook';

/**
 * Visual CMS Builder con layout a due colonne:
 * - A sinistra: CMSSidePanel strutturato (Pagine, Sezioni Home, Sottosezioni e Blocchi, Ispettore Elemento)
 * - A destra: Anteprima iPhone 18 interattiva in tempo reale con la PWA reale.
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

const LanguageSync: React.FC = () => {
  const { state } = useCMS();
  const { setLanguage } = useEditMode();
  React.useEffect(() => {
    setLanguage(state.language);
  }, [state.language, setLanguage]);
  return null;
};

const BuilderShell: React.FC<{ className: string }> = ({ className }) => {
  const { setLanguage } = useCMS();
  const { previewVariant, selectedElementId, selectElement } = useEditMode();
  const screenRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [phoneScale, setPhoneScale] = useState(0.78);

  useEffect(() => {
    const updateScale = () => {
      setPhoneScale(Math.min(0.78, Math.max(0.58, (window.innerWidth - 40) / 424)));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (selectedElementId) setMobileView('editor');
  }, [selectedElementId]);

  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (screenRef.current?.contains(target)) return;
      if (target?.closest?.('[data-floating-toolbar], [data-cms-sidepanel]')) return;
      selectElement(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [selectElement]);

  return (
    <div className={`flex flex-col items-center gap-5 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 ${className}`}>
      <BuilderTopToolbar className="w-full" />

      <div className="grid w-full grid-cols-2 gap-1.5 rounded-2xl border border-white/10 bg-zinc-900/80 p-1.5 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          aria-pressed={mobileView === 'editor'}
          className={`min-h-11 rounded-xl px-3 text-xs font-bold transition ${mobileView === 'editor' ? 'bg-emerald-400 text-zinc-950' : 'text-white/65 hover:bg-white/5'}`}
        >
          Modifica contenuti
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          aria-pressed={mobileView === 'preview'}
          className={`min-h-11 rounded-xl px-3 text-xs font-bold transition ${mobileView === 'preview' ? 'bg-emerald-400 text-zinc-950' : 'text-white/65 hover:bg-white/5'}`}
        >
          Anteprima ospite
        </button>
      </div>

      {/* Layout affiancato: Pannello di controllo a sinistra + Anteprima iPhone a destra */}
      <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-3 sm:gap-6 lg:gap-8">
        <div className={`${mobileView === 'editor' ? 'block' : 'hidden'} w-full lg:block`}>
        <CMSSidePanel containerRef={screenRef} />
        </div>

        <div className={`${mobileView === 'preview' ? 'flex' : 'hidden'} flex-1 w-full flex-col items-center justify-start py-4 sm:py-6 lg:flex lg:py-8 bg-zinc-900/35 border border-white/10 rounded-2xl sm:rounded-3xl`}>
          <div className="mb-2 text-[11px] font-mono text-white/45 text-center px-4">
            Anteprima Live · Clicca qualsiasi elemento nell'iPhone per modificarlo o usa il pannello a sinistra
          </div>
          <IPhone18Frame scale={phoneScale}>
            <div ref={screenRef} className="relative w-full h-full overflow-hidden bg-black">
              <div className="w-full h-full overflow-y-auto overflow-x-hidden">
                <VideoWelcomeBook
                  key={previewVariant}
                  initialLanguage="it"
                  isEditMode
                  editorPass={previewVariant === 'pass' ? 'mock' : 'none'}
                />
              </div>
            </div>
          </IPhone18Frame>
        </div>
      </div>

      <BuilderLanguageBridge onLanguageChange={setLanguage} />
    </div>
  );
};

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
