import React, { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Smile,
  Trash2,
  ChevronDown,
  X,
} from 'lucide-react';
import { useCMS, TextRole, TextAlign } from './CMSContext';

interface SelectionInfo {
  key: string;
  node: HTMLElement;
  rect: { top: number; left: number; width: number };
}

const FONT_FAMILIES = [
  { label: 'System UI', value: 'system-ui, sans-serif' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
];

const FONT_ROLES: { label: string; value: TextRole }[] = [
  { label: 'Titolo', value: 'title' },
  { label: 'Intestazione', value: 'heading' },
  { label: 'Sottotitolo', value: 'subtitle' },
  { label: 'Testo normale', value: 'body' },
];

const FONT_SIZES = [10, 12, 13, 15, 17, 20, 22, 26, 32];

const EMOJIS = ['✨', '🏠', '🔑', '📶', '📍', '🍽️', '⭐', '🚪', '🧹', '☎️', '🅿️', '🗑️'];

/**
 * Toolbar di formattazione fluttuante stile Google Sites.
 * Appare sopra il testo selezionato dentro l'iPhone e agisce sul blocco CMS attivo.
 */
export const FloatingTextToolbar: React.FC<{ containerRef: React.RefObject<HTMLDivElement | null> }> = ({
  containerRef,
}) => {
  const { state, updateTextStyle, selectBlock } = useCMS();
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Ascolta la selezione dei blocchi editabili.
  useEffect(() => {
    const handler = (e: Event) => {
      const { key, node } = (e as CustomEvent).detail;
      const nodeRect = node.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      const top = containerRect ? nodeRect.top - containerRect.top : nodeRect.top;
      const left = containerRect ? nodeRect.left - containerRect.left : nodeRect.left;
      setSelection({ key, node, rect: { top, left, width: nodeRect.width } });
    };
    window.addEventListener('visual-cms:select-node', handler);
    return () => window.removeEventListener('visual-cms:select-node', handler);
  }, [containerRef]);

  // Chiudi su click fuori dal toolbar o su ESC.
  useEffect(() => {
    if (!selection) return;
    const onPointerDown = (e: PointerEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setSelection(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelection(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [selection]);

  if (!selection || state.previewMode) return null;

  const block = state.blocks[selection.key];
  if (!block) return null;

  const style = block.style;
  const patch = (p: Parameters<typeof updateTextStyle>[1]) => updateTextStyle(selection.key, p);

  const applyLink = () => {
    if (!linkUrl.trim()) {
      setLinkMode(false);
      return;
    }
    // Inserisce un anchor come testo "[label](url)" compatibile con innerText
    const sel = window.getSelection();
    const label = sel && !sel.isCollapsed ? sel.toString() : linkUrl.replace(/^https?:\/\//, '');
    selection.node.dataset.link = linkUrl;
    patch({});
    setLinkMode(false);
    setLinkUrl('');
  };

  const insertEmoji = (emoji: string) => {
    selection.node.append(emoji);
    setShowEmoji(false);
  };

  const toolbarTop = Math.max(8, selection.rect.top - 52);
  const toolbarLeft = Math.max(8, selection.rect.left + selection.rect.width / 2);

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 -translate-x-1/2"
      style={{ top: toolbarTop, left: toolbarLeft }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-0.5 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 text-white">
        {/* Tipo di testo */}
        <div className="relative">
          <select
            value={style.role}
            onChange={(e) => patch({ role: e.target.value as TextRole })}
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
          className="appearance-none bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1.5 text-[11px] cursor-pointer outline-none max-w-[86px]"
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
          className="appearance-none bg-white/5 hover:bg-white/10 rounded-lg px-1.5 py-1.5 text-[11px] cursor-pointer outline-none"
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
        <label className="relative w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-center" title="Colore testo">
          <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: style.color }} />
          <input
            type="color"
            value={style.color}
            onChange={(e) => patch({ color: e.target.value })}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        <Divider />

        {/* Allineamento */}
        <Toggle active={style.align === 'left'} onClick={() => patch({ align: 'left' as TextAlign })} title="Allinea a sinistra">
          <AlignLeft className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle active={style.align === 'center'} onClick={() => patch({ align: 'center' as TextAlign })} title="Centra">
          <AlignCenter className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle active={style.align === 'right'} onClick={() => patch({ align: 'right' as TextAlign })} title="Allinea a destra">
          <AlignRight className="w-3.5 h-3.5" />
        </Toggle>

        <Divider />

        {/* Link */}
        {linkMode ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyLink()}
              placeholder="https://…"
              className="w-28 bg-white/5 rounded-lg px-2 py-1 text-[11px] outline-none placeholder:text-white/30"
            />
            <button onClick={applyLink} className="px-1.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold cursor-pointer">
              OK
            </button>
            <button onClick={() => setLinkMode(false)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <Toggle active={false} onClick={() => setLinkMode(true)} title="Inserisci link">
            <Link2 className="w-3.5 h-3.5" />
          </Toggle>
        )}

        {/* Emoji */}
        <div className="relative">
          <Toggle active={showEmoji} onClick={() => setShowEmoji((v) => !v)} title="Emoji">
            <Smile className="w-3.5 h-3.5" />
          </Toggle>
          {showEmoji && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 rounded-xl p-2 grid grid-cols-6 gap-1 shadow-2xl">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => insertEmoji(em)}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 text-base cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Elimina */}
        <Toggle
          active={false}
          danger
          title="Elimina blocco"
          onClick={() => {
            selectBlock(null);
            setSelection(null);
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Toggle>
      </div>

      {/* Freccia verso l'elemento */}
      <div className="w-2.5 h-2.5 bg-zinc-900 border-r border-b border-white/10 rotate-45 mx-auto -mt-[7px]" />
    </div>
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
