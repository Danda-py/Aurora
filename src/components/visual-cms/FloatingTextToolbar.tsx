import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  ChevronDown,
  X,
  Link2,
} from 'lucide-react';
import { useEditMode } from './EditModeContext';
import { TextStyle, TextRole } from './CMSContext';

interface SelectionInfo {
  key: string;
  node: HTMLElement;
  /** Posizione assoluta nel viewport (per il portal fixed). */
  top: number;
  left: number;
  width: number;
  /** true se l'elemento contiene anchor/link da modificare. */
  hasAnchor: boolean;
  /** href corrente (override o originale) da mostrare nel campo URL. */
  currentLink: string;
}

/** Aggiunge lo scheme ai domini scritti senza protocollo (es. "mysite.com"). */
function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (/^(https?:|mailto:|tel:|sms:|whatsapp:)/i.test(value)) return value;
  // numeri di telefono scritti a mano senza scheme
  if (/^\+?[\d\s.-]{6,}$/.test(value)) return `tel:${value.replace(/[\s.-]/g, '')}`;
  if (value.includes('.') || value.startsWith('localhost')) return `https://${value}`;
  return value;
}

const FONT_FAMILIES = [
  { label: 'System UI', value: 'system-ui, sans-serif' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
];

const FONT_ROLES: { label: string; value: TextRole; size: number }[] = [
  { label: 'Titolo', value: 'title', size: 22 },
  { label: 'Intestazione', value: 'heading', size: 17 },
  { label: 'Sottotitolo', value: 'subtitle', size: 13 },
  { label: 'Testo normale', value: 'body', size: 12 },
];

const FONT_SIZES = [10, 12, 13, 15, 17, 20, 22, 26, 32];

const TEXT_COLORS = [
  '#ffffff', '#cbd5e1', '#62e6bd', '#30d158', '#fbbf24',
  '#f87171', '#60a5fa', '#c084fc', '#0b0f14', '#111827',
];

/**
 * Toolbar fluttuante stile Google Sites per l'elemento PWA selezionato.
 * Tutti gli hook sono dichiarati PRIMA di ogni early-return (regola dei
 * React Hooks): la visibilità è gestita da `selection === null`.
 * Oltre a tipografia e colore, per gli elementi con link (bottoni, card con
 * URL, azioni rapide) mostra il campo "URL di destinazione".
 */
export const FloatingTextToolbar: React.FC<{ containerRef: React.RefObject<HTMLDivElement | null> }> = ({
  containerRef,
}) => {
  const {
    isEditMode,
    selectedElementId,
    selectElement,
    styles,
    updateStyle,
    resetStyle,
    links,
    updateLink,
  } = useEditMode();
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [showColors, setShowColors] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');

  // Trova il nodo selezionato nel DOM e calcola la posizione della toolbar.
  useEffect(() => {
    if (!isEditMode || !selectedElementId) {
      setSelection(null);
      return;
    }
    const node = (containerRef.current?.querySelector(`[data-editable-id="${selectedElementId}"]`) as HTMLElement | null) ?? null;
    if (!node) {
      setSelection(null);
      return;
    }
    const measure = () => {
      // Coordinate ASSOLUTE nel viewport: la toolbar è renderizzata in un
      // portal a document.body con position:fixed, così nessun contenitore
      // con overflow hidden/transform può tagliarla o comprimerla.
      const nodeRect = node.getBoundingClientRect();
      const anchor = node.querySelector('a');
      setSelection({
        key: selectedElementId,
        node,
        top: nodeRect.top,
        left: nodeRect.left,
        width: nodeRect.width,
        hasAnchor: Boolean(anchor),
        currentLink: anchor?.getAttribute('href') ?? '',
      });
    };
    measure();
    // Ricalcola su scroll/resize dello schermo dell'iPhone.
    const scroller = containerRef.current?.querySelector('.overflow-y-auto') ?? containerRef.current;
    scroller?.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      scroller?.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [isEditMode, selectedElementId, containerRef]);

  // Allinea la bozza del campo URL a ogni cambio elemento selezionato.
  useEffect(() => {
    setLinkDraft(selection?.currentLink ?? '');
    setShowColors(false);
  }, [selection?.key, selection?.currentLink]);

  // Chiudi con ESC (la deselezione al click-fuori è gestita dal builder).
  useEffect(() => {
    if (!selection) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectElement(null);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [selection, selectElement]);

  if (!selection) return null;

  const style: TextStyle = styles[selection.key] ?? {
    role: 'body',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 14,
    bold: false,
    italic: false,
    underline: false,
    color: '',
    align: 'left',
  };

  const patch = (p: Partial<TextStyle>) => updateStyle(selection.key, p);

  const toolbarTop = Math.max(8, selection.top - 52);
  const toolbarLeft = selection.left + selection.width / 2;

  return createPortal(
    <div
      data-floating-toolbar
      className="fixed z-[9999]"
      style={{
        top: toolbarTop,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100vw - 16px)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-0.5 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 text-white flex-wrap justify-center">
        {/* Tipo di testo */}
        <div className="relative shrink-0">
          <select
            value={style.role}
            onChange={(e) => {
              const role = FONT_ROLES.find((r) => r.value === e.target.value);
              if (role) patch({ role: role.value, fontSize: role.size, bold: role.value === 'title' || role.value === 'heading' });
            }}
            className="appearance-none bg-white/5 hover:bg-white/10 rounded-lg pl-2.5 pr-6 py-1.5 text-[11px] font-semibold cursor-pointer outline-none"
          >
            {FONT_ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-zinc-900">
                {r.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
        </div>

        <Divider />

        {/* Font family */}
        <select
          value={style.fontFamily}
          onChange={(e) => patch({ fontFamily: e.target.value })}
          className="appearance-none bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1.5 text-[11px] cursor-pointer outline-none max-w-[86px] shrink-0"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value} className="bg-zinc-900">
              {f.label}
            </option>
          ))}
        </select>

        {/* Dimensione */}
        <select
          value={style.fontSize}
          onChange={(e) => patch({ fontSize: Number(e.target.value) })}
          className="appearance-none bg-white/5 hover:bg-white/10 rounded-lg px-1.5 py-1.5 text-[11px] cursor-pointer outline-none shrink-0"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s} className="bg-zinc-900">
              {s}px
            </option>
          ))}
        </select>

        <Divider />

        {/* B I U */}
        <Toggle active={style.bold} onClick={() => patch({ bold: !style.bold })} title="Grassetto">
          <Bold className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle active={style.italic} onClick={() => patch({ italic: !style.italic })} title="Corsivo">
          <Italic className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle active={style.underline} onClick={() => patch({ underline: !style.underline })} title="Sottolineato">
          <Underline className="w-3.5 h-3.5" />
        </Toggle>

        {/* Colore testo */}
        <div className="relative shrink-0">
          <Toggle active={showColors} onClick={() => setShowColors((v) => !v)} title="Colore testo">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/40"
              style={{ backgroundColor: style.color || '#ffffff' }}
            />
          </Toggle>
          {showColors && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 rounded-xl p-2 grid grid-cols-5 gap-1.5 shadow-2xl">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    patch({ color: c });
                    setShowColors(false);
                  }}
                  className="w-6 h-6 rounded-full border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <label className="col-span-5 flex items-center gap-1.5 pt-1 cursor-pointer">
                <input
                  type="color"
                  value={style.color || '#ffffff'}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="w-full h-6 rounded cursor-pointer bg-transparent"
                />
                <span className="text-[9px] text-white/50">custom</span>
              </label>
            </div>
          )}
        </div>

        <Divider />

        {/* Allineamento */}
        <Toggle active={style.align === 'left'} onClick={() => patch({ align: 'left' })} title="Allinea a sinistra">
          <AlignLeft className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle active={style.align === 'center'} onClick={() => patch({ align: 'center' })} title="Centra">
          <AlignCenter className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle active={style.align === 'right'} onClick={() => patch({ align: 'right' })} title="Allinea a destra">
          <AlignRight className="w-3.5 h-3.5" />
        </Toggle>

        <Divider />

        {/* Reset stile */}
        <Toggle
          active={false}
          danger
          title="Ripristina stile originale"
          onClick={() => {
            resetStyle(selection.key);
            setShowColors(false);
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Toggle>

        {/* Chiudi (deseleziona) */}
        <Toggle active={false} title="Chiudi" onClick={() => selectElement(null)}>
          <X className="w-3.5 h-3.5" />
        </Toggle>
      </div>

      {/* Riga link: visibile solo per elementi con URL di destinazione */}
      {selection.hasAnchor && (
        <div className="mt-1.5 flex items-center gap-1 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl px-2 py-1.5 shadow-2xl">
          <Link2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <input
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') updateLink(selection.key, normalizeUrl(linkDraft));
            }}
            onBlur={() => updateLink(selection.key, normalizeUrl(linkDraft))}
            placeholder="https://… (URL di destinazione)"
            className="flex-1 min-w-[160px] bg-white/5 rounded-lg px-2 py-1 text-[11px] text-white outline-none placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={() => updateLink(selection.key, normalizeUrl(linkDraft))}
            className="px-2 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-bold cursor-pointer transition shrink-0"
          >
            Applica
          </button>
          {links[selection.key] && (
            <button
              type="button"
              title="Ripristina link originale"
              onClick={() => {
                updateLink(selection.key, '');
                setLinkDraft(selection.currentLink);
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-rose-400 cursor-pointer transition shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Freccia verso l'elemento */}
      <div className="w-2.5 h-2.5 bg-zinc-900 border-r border-b border-white/10 rotate-45 mx-auto -mt-[7px]" />
    </div>,
    document.body,
  );
};

const Divider: React.FC = () => <span className="w-px h-5 bg-white/10 mx-0.5" />;

const Toggle: React.FC<{
  active: boolean;
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ active, onClick, title, danger, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition shrink-0 ${
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
