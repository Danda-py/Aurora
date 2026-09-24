import React, { useRef, useState } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import { useEditMode } from './EditModeContext';

interface EditableImageOverlayProps {
  /** id dell'elemento CMS a cui associare l'immagine. */
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Overlay di editing immagini: quando l'elemento è selezionato mostra il
 * pulsante "Sostituisci foto" e accetta il drag-and-drop di un file.
 * Il risultato (dataURL) finisce nel context e viene auto-salvato.
 */
export const EditableImageOverlay: React.FC<EditableImageOverlayProps> = ({ id, children, className = '' }) => {
  const { isEditMode, selectedElementId, images, updateImage } = useEditMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isEditMode) return <>{children}</>;

  const isSelected = selectedElementId === id;
  const hasOverride = Boolean(images[id]);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => updateImage(id, String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`relative ${className ?? ''}`}
      onDragOver={(e) => {
        if (!isSelected) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (!isSelected) return;
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      {children}

      {isSelected && (
        <>
          {/* Pulsante sostituzione foto */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="absolute top-2 right-2 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-bold shadow-lg cursor-pointer transition"
            title="Carica o sostituisci la foto (o trascina un'immagine qui)"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>{hasOverride ? 'Sostituisci foto' : 'Carica foto'}</span>
          </button>

          {/* Rimuovi override */}
          {hasOverride && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateImage(id, '');
              }}
              className="absolute top-2 right-2 z-50 translate-x-[calc(100%+6px)] w-7 h-7 rounded-lg bg-zinc-900/90 hover:bg-rose-500/80 text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition"
              title="Ripristina foto originale"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {dragOver && (
            <div className="absolute inset-0 z-40 bg-sky-500/25 border-2 border-dashed border-sky-400 rounded-[inherit] flex items-center justify-center pointer-events-none">
              <span className="bg-zinc-900/90 text-sky-200 text-[11px] font-bold px-3 py-1.5 rounded-xl">
                Rilascia l'immagine qui
              </span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </>
      )}
    </div>
  );
};
