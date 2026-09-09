import React from 'react';
import { Language } from '../../types';
import { FlagIcon } from './FlagIcon';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { Sparkles, ChevronRight, ShieldCheck, Mountain } from 'lucide-react';

interface Props {
  onSelectLanguage: (lang: Language) => void;
}

export const LanguageSelectScreen: React.FC<Props> = ({ onSelectLanguage }) => {
  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'it', label: 'ITALIANO', native: 'Seleziona lingua' },
    { code: 'en', label: 'ENGLISH', native: 'Select language' },
    { code: 'de', label: 'DEUTSCH', native: 'Sprache auswählen' },
    { code: 'fr', label: 'FRANÇAIS', native: 'Sélectionner la langue' },
    { code: 'es', label: 'ESPAÑOL', native: 'Seleccionar idioma' }
  ];

  return (
    <div className="relative min-h-[100dvh] sm:min-h-[720px] h-full w-full flex flex-col justify-between p-5 sm:p-8 overflow-hidden bg-[#070a0e] text-slate-100 select-none">
      
      {/* Deep Dark Atmosphere with subtle Emerald Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-0 w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl" />
        {/* Subtle dark mountain vignette backdrop */}
        <div 
          className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-luminosity"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070a0e] via-[#070a0e]/90 to-[#070a0e]" />
      </div>

      {/* Top Bar with PWA install pill */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-medium">
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          <span>Morbegno • Valtellina</span>
        </div>
        <PWAInstallButton language="it" compact />
      </div>

      {/* Top Branding: Aurora in Valtellina */}
      <div className="relative z-10 text-center pt-2 sm:pt-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 text-emerald-300 text-xs font-serif tracking-widest uppercase backdrop-blur-md border border-emerald-500/30 shadow-inner">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Guida Digitale & Concierge
        </div>
        
        <div className="py-1">
          <h1 className="text-white drop-shadow-lg">
            <span className="font-aurora text-6xl sm:text-7xl text-emerald-300 tracking-wide block font-normal leading-tight">
              Aurora
            </span>
            <span className="font-serif-luxury tracking-[0.32em] text-xs sm:text-sm font-semibold uppercase text-slate-200 block -mt-1">
              IN VALTELLINA
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light italic tracking-wide max-w-xs mx-auto mt-2">
            Il tuo rifugio accogliente tra lago di Como e le vette alpine
          </p>
        </div>
      </div>

      {/* 5 Language Pill Buttons - Dark style with Emerald Accents */}
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-2.5 pb-4 sm:pb-8">
        <div className="text-center pb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/90 font-mono">
            Scegli la tua lingua
          </span>
        </div>

        {languages.map((item) => (
          <button
            key={item.code}
            onClick={() => onSelectLanguage(item.code)}
            id={`lang-btn-${item.code}`}
            className="w-full h-13 sm:h-14 px-4 rounded-2xl bg-[#0e151e]/90 hover:bg-[#131d27] active:scale-[0.98] border border-emerald-500/20 hover:border-emerald-400/60 shadow-lg shadow-black/40 flex items-center justify-between transition-all duration-200 cursor-pointer group backdrop-blur-md"
          >
            {/* Round Flag Icon */}
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm ring-1 ring-emerald-500/30 group-hover:ring-emerald-400/70 group-hover:scale-105 transition">
              <FlagIcon language={item.code} className="w-full h-full object-cover" />
            </div>

            {/* Label in clean all-caps */}
            <div className="flex-1 text-center pl-2 pr-2">
              <span className="block font-bold text-xs sm:text-sm tracking-wider text-white uppercase group-hover:text-emerald-300 transition-colors">
                {item.label}
              </span>
              <span className="block text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">
                {item.native}
              </span>
            </div>

            {/* Subtle Right Arrow */}
            <ChevronRight className="w-4 h-4 text-emerald-500/60 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}

        <div className="pt-2 text-center">
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Accesso ospiti protetto e sicuro</span>
          </span>
        </div>
      </div>

    </div>
  );
};
