import React, { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useEditMode } from './EditModeContext';

interface EditableImageOverlayProps {
  /** id dell'elemento CMS a cui associare l'immagine. */
  id: string;
  children: React.ReactNode;
  className?: string;
  /** Posizione del pulsante overlay. */
  buttonPosition?: 'top-right' | 'bottom-right' | 'center';
  /** Se true, l'overlay compare al semplice hover (per immagini piccole); altrimenti al click. */
  triggerOnHover?: boolean;
}

/**
 * Overlay di editing immagini: in modalità editor, al click (o hover per le
 * immagini piccole) sull'immagine compare il pulsante "Sostituisci immagine"
 * con apertura del selettore file; supporta anche il drag-and-drop.
 * Il risultato (dataURL) finisce nel context e viene auto-salvato.
 * L'immagine sostituita vale anche per gli ospiti (runtime).
 */
export const EditableImageOverlay: React.FC<EditableImageOverlayProps> = ({
  id,
  children,
  className = '',
  buttonPosition = 'top-right',
  triggerOnHover = false,
}) => {
  const { isEditMode, images, updateImage } = useEditMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isEditMode) return <>{children}</>;

  const hasOverride = Boolean(images[id]);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => updateImage(id, String(reader.result));
    reader.readAsDataURL(file);
  };

  const openPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  const buttonPos =
    buttonPosition === 'center'
      ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      : buttonPosition === 'bottom-right'
      ? 'bottom-2 right-2'
      : 'top-2 right-2';

  return (
    <div
      className={`relative ${className}`}
      onClick={(e) => {
        if (triggerOnHover) return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      {children}

      {/* Pulsante overlay: sempre visibile al hover del contenitore, oppure dopo click */}
      <div
        className={`absolute inset-0 z-40 transition-opacity ${
          triggerOnHover ? 'opacity-0 hover:opacity-100' : open ? 'opacity-100' : 'opacity-0 hover:opacity-100'
        } pointer-events-none`}
      >
        {/* Velatura leggera per far risaltare il pulsante */}
        <div className="absolute inset-0 bg-black/25 rounded-[inherit]" />

        <button
          type="button"
          onClick={openPicker}
          className={`pointer-events-auto absolute ${buttonPos} flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-bold shadow-lg cursor-pointer transition`}
          title="Carica o sostituisci l'immagine (o trascina un file qui)"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          <span>{hasOverride ? 'Sostituisci immagine' : 'Sostituisci immagine'}</span>
        </button>

        {hasOverride && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateImage(id, '');
            }}
            className={`pointer-events-auto absolute ${buttonPos} translate-x-[calc(100%+6px)] w-7 h-7 rounded-lg bg-zinc-900/90 hover:bg-rose-500/80 text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition`}
            title="Ripristina immagine originale"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {dragOver && (
        <div className="absolute inset-0 z-50 bg-sky-500/25 border-2 border-dashed border-sky-400 rounded-[inherit] flex items-center justify-center pointer-events-none">
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
    </div>
  );
};
