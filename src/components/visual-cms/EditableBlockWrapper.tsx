import React, { useRef, useState } from 'react';
import { Image, Layout, Palette, Upload, X } from 'lucide-react';
import { useCMS, BlockStyle } from './CMSContext';

interface EditableBlockWrapperProps {
  /** Chiave semantica del blocco CMS (condivisa con InlineEditableText). */
  blockKey: string;
  children: React.ReactNode;
  className?: string;
  /** Layout interno corrente della card (default registrato se assente). */
  defaultContainer?: Partial<BlockStyle>;
}

/**
 * Wrapper di sezione/card stile Google Sites:
 * - cornice di selezione blu con maniglie quando il blocco è attivo;
 * - barra controlli contestuale in basso a sinistra: Immagine (upload/drag&drop),
 *   Layout, Stile/Colore.
 */
export const EditableBlockWrapper: React.FC<EditableBlockWrapperProps> = ({
  blockKey,
  children,
  className = '',
  defaultContainer,
}) => {
  const { state, selectBlock, updateContainer, registerBlock } = useCMS();
  const isEditing = state.isEditMode && !state.previewMode;
  const selected = state.selectedId === blockKey;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [panel, setPanel] = useState<'none' | 'layout' | 'style'>('none');

  React.useEffect(() => {
    if (defaultContainer) registerBlock(blockKey, { container: defaultContainer });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey]);

  const block = state.blocks[blockKey];
  const container = block?.container ?? { ...{ layout: 'stacked', glassOpacity: 0.6, borderRadius: 20 }, ...defaultContainer };

  if (!isEditing) {
    return <div className={className}>{children}</div>;
  }

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => updateContainer(blockKey, { backgroundImage: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const containerStyle: React.CSSProperties = {
    backgroundImage: container.backgroundImage
      ? `linear-gradient(rgba(0,0,0,${container.backgroundOverlay ?? 0.45}), rgba(0,0,0,${container.backgroundOverlay ?? 0.45})), url(${container.backgroundImage})`
      : undefined,
    backgroundColor: container.backgroundColor,
    borderRadius: container.borderRadius,
    flexDirection: container.layout === 'stacked' ? 'column' : container.layout,
  };

  return (
    <div
      className={`relative transition-shadow ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(blockKey);
        setPanel('none');
      }}
      onDragOver={(e) => {
        if (selected) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (selected) {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }
      }}
      style={containerStyle}
    >
      {children}

      {/* Cornice di selezione blu con maniglie */}
      {selected && (
        <>
          <div className="absolute inset-0 pointer-events-none ring-2 ring-sky-500 rounded-[inherit]" />
          {(['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'] as const).map((pos) => (
            <span key={pos} className={`absolute ${pos} w-2.5 h-2.5 bg-white border-2 border-sky-500 rounded-sm z-20`} />
          ))}
          {dragOver && (
            <div className="absolute inset-0 z-20 bg-sky-500/20 border-2 border-dashed border-sky-400 rounded-[inherit] flex items-center justify-center text-sky-100 text-xs font-bold pointer-events-none">
              Rilascia l'immagine qui
            </div>
          )}
        </>
      )}

      {/* Barra controlli contestuale di sezione */}
      {selected && (
        <div
          className="absolute bottom-2 left-2 z-30 flex items-center gap-0.5 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Immagine */}
          <SectionButton title="Immagine di sfondo" onClick={() => fileInputRef.current?.click()} active={Boolean(container.backgroundImage)}>
            <Image className="w-3.5 h-3.5" />
          </SectionButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Layout */}
          <SectionButton title="Layout" onClick={() => setPanel(panel === 'layout' ? 'none' : 'layout')} active={panel === 'layout'}>
            <Layout className="w-3.5 h-3.5" />
          </SectionButton>

          {/* Stile / Colore */}
          <SectionButton title="Stile / Colore" onClick={() => setPanel(panel === 'style' ? 'none' : 'style')} active={panel === 'style'}>
            <Palette className="w-3.5 h-3.5" />
          </SectionButton>

          {container.backgroundImage && (
            <SectionButton
              title="Rimuovi immagine"
              danger
              onClick={() => updateContainer(blockKey, { backgroundImage: undefined })}
            >
              <X className="w-3.5 h-3.5" />
            </SectionButton>
          )}
        </div>
      )}

      {/* Popover Layout */}
      {selected && panel === 'layout' && (
        <Popover position="bottom-left">
          <p className="label">Disposizione contenuti</p>
          <div className="grid grid-cols-3 gap-1">
            {(['stacked', 'row', 'row-reverse'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => updateContainer(blockKey, { layout: l })}
                className={`h-12 rounded-lg border cursor-pointer flex items-center justify-center ${
                  container.layout === l ? 'border-sky-500 bg-sky-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <MiniLayout layout={l} />
              </button>
            ))}
          </div>
          <p className="hint">Verticale, orizzontale o invertito</p>
        </Popover>
      )}

      {/* Popover Stile / Colore */}
      {selected && panel === 'style' && (
        <Popover position="bottom-left">
          <p className="label">Sfondo</p>
          <div className="flex items-center gap-2 mb-2">
            <label className="relative w-7 h-7 rounded-lg bg-white/10 cursor-pointer flex items-center justify-center shrink-0">
              <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: container.backgroundColor ?? '#181d2a' }} />
              <input
                type="color"
                value={container.backgroundColor ?? '#181d2a'}
                onChange={(e) => updateContainer(blockKey, { backgroundColor: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <span className="text-[11px] text-white/60">Colore card</span>
          </div>

          <p className="label">Accento</p>
          <div className="flex items-center gap-2 mb-2">
            <label className="relative w-7 h-7 rounded-lg bg-white/10 cursor-pointer flex items-center justify-center shrink-0">
              <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: container.accentColor ?? '#62e6bd' }} />
              <input
                type="color"
                value={container.accentColor ?? '#62e6bd'}
                onChange={(e) => updateContainer(blockKey, { accentColor: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <span className="text-[11px] text-white/60">Colore pill / icone</span>
          </div>

          <p className="label">Effetto glassmorphism</p>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((container.glassOpacity ?? 0.6) * 100)}
            onChange={(e) => updateContainer(blockKey, { glassOpacity: Number(e.target.value) / 100 })}
            className="w-full accent-emerald-400 cursor-pointer"
          />

          <p className="label">Angoli</p>
          <input
            type="range"
            min={0}
            max={36}
            value={container.borderRadius ?? 20}
            onChange={(e) => updateContainer(blockKey, { borderRadius: Number(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />

          {container.backgroundImage && (
            <>
              <p className="label">Oscuramento immagine</p>
              <input
                type="range"
                min={0}
                max={90}
                value={Math.round((container.backgroundOverlay ?? 0.45) * 100)}
                onChange={(e) => updateContainer(blockKey, { backgroundOverlay: Number(e.target.value) / 100 })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </>
          )}
        </Popover>
      )}
    </div>
  );
};

const SectionButton: React.FC<{
  title: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, active, danger, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition ${
      danger
        ? 'text-rose-400 hover:bg-rose-500/15'
        : active
        ? 'bg-sky-500 text-white'
        : 'text-white/80 hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

const Popover: React.FC<{ position: 'bottom-left'; children: React.ReactNode }> = ({ children }) => (
  <div
    className="absolute z-40 bottom-full left-0 mb-2 w-52 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 [&_.label]:block [&_.label]:text-[9px] [&_.label]:uppercase [&_.label]:tracking-widest [&_.label]:text-white/40 [&_.label]:font-bold [&_.label]:mb-1 [&_.hint]:text-[10px] [&_.hint]:text-white/40 [&_.hint]:mt-1"
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

const MiniLayout: React.FC<{ layout: 'stacked' | 'row' | 'row-reverse' }> = ({ layout }) => (
  <span className={`flex gap-0.5 ${layout === 'stacked' ? 'flex-col' : layout === 'row' ? 'flex-row' : 'flex-row-reverse'}`}>
    <span className="w-4 h-2 rounded-sm bg-current opacity-90" />
    <span className="w-2 h-2 rounded-sm bg-current opacity-50" />
  </span>
);
