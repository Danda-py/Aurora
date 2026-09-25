import React, { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useEditMode } from './EditModeContext';

interface EditableIconProps {
  /** id dell'elemento CMS a cui associare l'icona. */
  id: string;
  /** Icona lucide originale mostrata di default. */
  children: React.ReactNode;
  /** Classi del contenitore (dimensioni dell'icona). */
  className?: string;
  /** Classi dell'immagine sostitutiva (stesse dimensioni dell'icona). */
  imageClassName?: string;
}

/**
 * Icona di un bottone/card sostituibile con un'immagine caricata dall'host:
 * - al hover compare il pulsante "Sostituisci immagine";
 * - cliccando direttamente l'icona quando la card è selezionata si apre
 *   subito il selettore file (upload con trigger immediato).
 * In produzione (o quando non c'è override) mostra l'icona originale.
 */
export const EditableIcon: React.FC<EditableIconProps> = ({
  id,
  children,
  className = '',
  imageClassName = '',
}) => {
  const { isEditMode, images, updateImage } = useEditMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  const override = images[id];

  if (!isEditMode) {
    return (
      <span className={className}>
        {override ? <img src={override} alt="" className={imageClassName} /> : children}
      </span>
    );
  }

  // Con una selezione attiva, il click diretto sull'icona apre l'upload
  // (l'azione PWA del contenitore è comunque bloccata in editing).
  const openPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  return (
    <span
      data-cms-control
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={openPicker}
    >
      {override ? (
        <img src={override} alt="" className={imageClassName} />
      ) : (
        children
      )}

      {/* Overlay sostituzione al hover */}
      {hovered && (
        <span className="absolute inset-0 z-40 flex items-center justify-center">
          <span className="absolute inset-0 bg-black/60 rounded-[inherit]" />
          <button
            type="button"
            onClick={openPicker}
            className="relative z-10 p-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white shadow-lg cursor-pointer transition"
            title="Sostituisci l'icona con un'immagine"
          >
            <ImagePlus className="w-3 h-3" />
          </button>
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file || !file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = () => updateImage(id, String(reader.result));
          reader.readAsDataURL(file);
        }}
      />
    </span>
  );
};
