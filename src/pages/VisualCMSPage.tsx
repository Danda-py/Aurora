import React from 'react';
import { VisualCMSBuilder } from '../components/visual-cms';

/**
 * Pagina dedicata al Visual CMS Builder, aperta:
 * - dalla voce di menu "Guida & Media" del portale host standalone;
 * - dalla scheda omonima dell'HostPortalModal React;
 * - dalla route diretta /visual-cms.
 */
export const VisualCMSPage: React.FC = () => {
  return (
    <div className="min-h-[100dvh] w-full bg-[#0b0f14] flex flex-col items-center justify-start py-6 px-3 select-none">
      <header className="w-full max-w-2xl flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-300">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Visual CMS Builder</h1>
            <p className="text-[11px] text-white/40 font-mono">Aurora in Valtellina · Editor Guida Ospiti</p>
          </div>
        </div>
        <a
          href="/host-portal/"
          className="text-[11px] font-semibold text-white/60 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition cursor-pointer"
        >
          ← Portale Host
        </a>
      </header>

      <VisualCMSBuilder className="w-full" />
    </div>
  );
};

const SparklesIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
  </svg>
);
