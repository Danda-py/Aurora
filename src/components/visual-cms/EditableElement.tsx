import React, { useCallback, useRef, useState } from 'react';
import { useEditMode } from './EditModeContext';

interface EditableElementProps {
  /** Identificatore semantico dell'elemento, es. "home.guest-card". */
  id: string;
  /** Etichetta mostrata nel badge di hover (opzionale). */
  label?: string;
  children: React.ReactNode;
  className?: string;
}

/** Mappa una patch di stile su proprietà CSS inline del nodo. */
function applyStyleToNode(
  node: HTMLElement,
  style: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    align?: string;
  },
) {
  if (style.bold !== undefined) node.style.fontWeight = style.bold ? '700' : '';
  if (style.italic !== undefined) node.style.fontStyle = style.italic ? 'italic' : '';
  if (style.underline !== undefined) node.style.textDecoration = style.underline ? 'underline' : '';
  if (style.color) node.style.color = style.color;
  if (style.fontSize !== undefined) node.style.fontSize = `${style.fontSize}px`;
  if (style.fontFamily) node.style.fontFamily = style.fontFamily;
  if (style.align) node.style.textAlign = style.align;
}

/**
 * Trova ricorsivamente i nodi testo "utili" dentro un wrapper:
 * elementi tipografici (h1..h6, p, span, strong, em, small, label, a)
 * che contengono testo diretto. Scarta i contenitori puri e i decorativi.
 */
function collectTextNodes(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  const results: HTMLElement[] = [];
  const TEXTY = /^(H[1-6]|P|SPAN|STRONG|EM|SMALL|LABEL|A)$/i;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const el = node as HTMLElement;
      if (!TEXTY.test(el.tagName)) return NodeFilter.FILTER_REJECT;
      const hasDirectText = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
      );
      return hasDirectText ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  let current = walker.nextNode();
  while (current) {
    results.push(current as HTMLElement);
    current = walker.nextNode();
  }
  return results;
}

/**
 * Wrapper per gli elementi reali della PWA in modalità editing:
 * - hover: outline blu soft
 * - click: bounding box con maniglie + selezione (per la FloatingTextToolbar)
 * - quando selezionato, i nodi testo interni diventano contentEditable
 *   (digitabili in-place) e ricevono lo stile patchato dal context.
 * Fuori dalla modalità editing non rende nessun markup aggiuntivo.
 */
export const EditableElement: React.FC<EditableElementProps> = ({ id, label, children, className = '' }) => {
  const {
    isEditMode,
    selectedElementId,
    selectElement,
    styles,
    texts,
    updateText,
    currentLanguage,
  } = useEditMode();
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const editedNodesRef = useRef<Set<HTMLElement>>(new Set());

  const isSelected = selectedElementId === id;
  const style = styles[id];
  const textOverride = texts[id]?.[currentLanguage];

  // Quando l'elemento è selezionato: rende i nodi testo editabili in-place,
  // applica lo stile corrente e ripristina eventuali override di testo.
  React.useEffect(() => {
    if (!isEditMode || !isSelected) return;
    const nodes = collectTextNodes(wrapRef.current);
    nodes.forEach((node) => {
      if (style) applyStyleToNode(node, style);

      if (!editedNodesRef.current.has(node)) {
        node.contentEditable = 'true';
        node.spellcheck = false;
        node.style.outline = 'none';
        node.style.cursor = 'text';
        editedNodesRef.current.add(node);
        node.addEventListener('input', () => {
          updateText(id, currentLanguage, node.innerText);
        });
        // Impedisce che INVIO/spazio attivino bottoni o link della PWA.
        node.addEventListener('keydown', (e) => e.stopPropagation());
        node.addEventListener('click', (e) => e.stopPropagation());
      }

      if (textOverride !== undefined && node.innerText !== textOverride) {
        if (document.activeElement !== node) {
          node.innerText = textOverride;
        }
      }
    });
  }, [isEditMode, isSelected, style, textOverride, currentLanguage, id, updateText]);

  const handleSelection = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      selectElement(isSelected ? null : id);
    },
    [id, isSelected, selectElement],
  );

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      ref={wrapRef}
      data-editable-id={id}
      className={`relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleSelection}
    >
      {children}

      {/* Outline al passaggio del mouse */}
      {hovered && !isSelected && (
        <div className="absolute inset-0 pointer-events-none ring-2 ring-sky-400/70 rounded-[inherit] z-30" />
      )}

      {/* Bounding box di selezione con maniglie */}
      {isSelected && (
        <>
          <div className="absolute inset-0 pointer-events-none ring-2 ring-sky-500 rounded-[inherit] z-30 shadow-[0_0_0_4px_rgba(14,165,233,0.15)]" />
          {(
            [
              '-top-[5px] -left-[5px]',
              '-top-[5px] -right-[5px]',
              '-bottom-[5px] -left-[5px]',
              '-bottom-[5px] -right-[5px]',
            ] as const
          ).map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} w-2.5 h-2.5 bg-white border-2 border-sky-500 rounded-[3px] z-40 shadow-sm`}
            />
          ))}
          {label && (
            <span className="absolute -top-2 left-2 -translate-y-full bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-40 shadow-md">
              {label}
            </span>
          )}
        </>
      )}
    </div>
  );
};
