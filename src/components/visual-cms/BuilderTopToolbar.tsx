import React, { useState } from 'react';
import { Languages, Sparkles, Check, Loader2, AlertCircle, Eye, PencilLine } from 'lucide-react';
import { Language } from '../../types';
import { useCMS } from './CMSContext';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
];

/**
 * Barra di controllo globale sopra l'iPhone: lingua, traduzione IA,
 * stato di salvataggio automatico e Anteprima Finale (Guest Mode).
 */
export const BuilderTopToolbar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state, setLanguage, setPreviewMode } = useCMS();
  const [translating, setTranslating] = useState(false);
  const [translateNotice, setTranslateNotice] = useState<string | null>(null);

  const handleTranslate = async () => {
    setTranslating(true);
    setTranslateNotice(null);
    try {
      // L'endpoint server recupera i testi correnti dal client (payload layout)
      // e restituisce le traduzioni generate via Gemini per le altre lingue.
      const res = await fetch('/api/aurora-ai/translate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceLanguage: state.language, blocks: state.blocks }),
      });
      if (res.ok) {
        setTranslateNotice('Traduzione completata');
      } else {
        setTranslateNotice('Servizio di traduzione non disponibile');
      }
    } catch {
      setTranslateNotice('Servizio di traduzione non disponibile');
    } finally {
      setTranslating(false);
      setTimeout(() => setTranslateNotice(null), 4000);
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 shadow-xl ${className}`}
    >
      {/* Lingue */}
      <div className="flex items-center gap-1">
        <Languages className="w-4 h-4 text-white/50 mr-1" />
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
              state.language === l.code
                ? 'bg-emerald-400 text-black'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Traduzione IA */}
      <button
        type="button"
        onClick={handleTranslate}
        disabled={translating}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[11px] font-bold cursor-pointer transition hover:brightness-110 disabled:opacity-60"
      >
        {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        <span>{translating ? 'Traduzione…' : 'Traduci con IA'}</span>
      </button>

      {/* Salvataggio automatico */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono min-w-[130px] justify-center">
        {state.saveStatus === 'saved' && (
          <span className="flex items-center gap-1 text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Salvato
          </span>
        )}
        {state.saveStatus === 'saving' && (
          <span className="flex items-center gap-1 text-sky-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvataggio in corso…
          </span>
        )}
        {state.saveStatus === 'error' && (
          <span className="flex items-center gap-1 text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" /> Errore salvataggio
          </span>
        )}
        {translateNotice && <span className="text-white/50">{translateNotice}</span>}
      </div>

      {/* Anteprima / Editing */}
      <button
        type="button"
        onClick={() => setPreviewMode(!state.previewMode)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition border ${
          state.previewMode
            ? 'bg-emerald-400 border-emerald-300 text-black'
            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
        }`}
      >
        {state.previewMode ? <PencilLine className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        <span>{state.previewMode ? 'Torna a Modifica' : 'Anteprima Finale'}</span>
      </button>
    </div>
  );
};
