import React from 'react';
import { Check, Loader2, AlertCircle, Save, Ticket, Lock, Globe } from 'lucide-react';
import { useCMS } from './CMSContext';
import { useEditMode } from './EditModeContext';

/**
 * Barra globale sopra l'iPhone.
 * L'host modifica i contenuti SOLO in Italiano: non esiste selettore lingua.
 * Le traduzioni (EN/DE/FR/ES) saranno gestite automaticamente a livello globale.
 */
export const BuilderTopToolbar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { setLanguage } = useCMS();
  const {
    saveStatus: editSaveStatus,
    saveNow,
    setLanguage: setEditLanguage,
    previewVariant,
    setPreviewVariant,
  } = useEditMode();

  // Lingua bloccata su IT, applicata una volta al montaggio.
  React.useEffect(() => {
    setLanguage('it');
    setEditLanguage('it');
  }, [setLanguage, setEditLanguage]);

  return (
    <div
      className={`flex items-center justify-between gap-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 shadow-xl flex-wrap ${className}`}
    >
      {/* Indicatore lingua sorgente (non è un selettore) */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-[11px] font-bold text-white/70">
        <Globe className="w-3.5 h-3.5 text-white/50" />
        <span>Modifica in Italiano</span>
      </div>

      {/* Toggle vista Con Pass / Senza Pass */}
      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0">
        <button
          type="button"
          onClick={() => setPreviewVariant('pass')}
          title="Anteprima con pass ospite attivo (Tessera Ospite, apriporta)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
            previewVariant === 'pass' ? 'bg-emerald-400 text-black' : 'text-white/60 hover:text-white'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Con Pass</span>
        </button>
        <button
          type="button"
          onClick={() => setPreviewVariant('no-pass')}
          title="Anteprima senza pass (visitatore che non ha ancora effettuato il check-in)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
            previewVariant === 'no-pass' ? 'bg-zinc-600 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Senza Pass</span>
        </button>
      </div>

      {/* Stato di salvataggio + pulsante manuale (usa lo stato reale dell'editing) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {editSaveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Salvato
            </span>
          )}
          {editSaveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-sky-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvataggio in corso…
            </span>
          )}
          {editSaveStatus === 'error' && (
            <span className="flex items-center gap-1 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" /> Errore salvataggio
            </span>
          )}
        </div>

        <button
          type="button"
          title="Salva ora"
          onClick={() => void saveNow()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-bold cursor-pointer transition hover:bg-white/10"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Salva</span>
        </button>
      </div>
    </div>
  );
};
