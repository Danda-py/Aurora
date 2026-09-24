import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

interface InlineTimePickerProps {
  /** Valore corrente in formato "HH:mm". */
  value: string;
  onChange: (value: string) => void;
  /** Classi aggiuntive per l'elemento trigger. */
  className?: string;
  /** Posizione del popover rispetto al trigger. */
  position?: 'top' | 'bottom';
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

/**
 * Popover contestuale stile iOS per orari: cliccando sull'orario mostrato
 * (es. "13:00" del check-in) si apre un picker compatto con griglia di
 * ore e minuti che aggiorna il dato collegato.
 */
export const InlineTimePicker: React.FC<InlineTimePickerProps> = ({
  value,
  onChange,
  className = '',
  position = 'bottom',
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const [hour, minute] = (value || '00:00').split(':');
  const pick = (h: string, m: string) => onChange(`${h}:${m}`);

  return (
    <span ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 cursor-pointer transition ${className}`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span className="font-mono font-bold">{value || '--:--'}</span>
      </button>

      {open && (
        <div
          className={`absolute z-50 left-1/2 -translate-x-1/2 ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 w-[228px]`}
        >
          {/* Anteprima orario */}
          <div className="text-center font-mono text-2xl font-bold text-white mb-2 tracking-widest">
            {hour}:{minute}
          </div>

          {/* Ore */}
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">Ore</p>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => pick(h, minute)}
                className={`h-6 rounded-md text-[11px] font-mono cursor-pointer transition ${
                  h === hour ? 'bg-emerald-400 text-black font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Minuti */}
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">Minuti</p>
          <div className="grid grid-cols-6 gap-1">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => pick(hour, m)}
                className={`h-6 rounded-md text-[11px] font-mono cursor-pointer transition ${
                  m === minute ? 'bg-emerald-400 text-black font-bold' : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  );
};
