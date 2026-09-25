import React, { useCallback, useEffect, useRef, useState } from 'react';
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

/** Rimuove ogni proprietà inline settata dall'editing. */
const EDIT_CSS_PROPS = ['fontWeight', 'fontStyle', 'textDecoration', 'color', 'fontSize', 'fontFamily', 'textAlign'] as const;
function clearStyleOnNode(node: HTMLElement) {
  EDIT_CSS_PROPS.forEach((p) => {
    node.style.removeProperty(p.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`));
  });
}

/**
 * Trova ricorsivamente i nodi testo "utili" dentro un wrapper:
 * elementi tipografici (h1..h6, p, span, strong, em, small, label, a)
 * che contengono testo diretto. Scarta i contenitori puri, i decorativi
 * e i controlli CMS (picker orari, upload immagini).
 */
function collectTextNodes(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  const results: HTMLElement[] = [];
  const TEXTY = /^(H[1-6]|P|SPAN|STRONG|EM|SMALL|LABEL|A)$/i;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const el = node as HTMLElement;
      if (el.closest('[data-cms-control]')) return NodeFilter.FILTER_REJECT;
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
 * Wrapper per gli elementi reali della PWA.
 *
 * Due percorsi:
 * - PRODUZIONE (isEditMode false): nessun wrapper DOM (via CSS display:contents
 *   il div scompare); gli override salvati dall'host (testi, stili, immagini,
 *   orari, link) vengono applicati ai nodi reali così gli ospiti vedono i
 *   contenuti personalizzati.
 * - EDITING (Visual CMS Builder): wrapper interattivo con hover outline,
 *   bounding box di selezione, nodi testo contentEditable e stile live.
 *   Il PRIMO click seleziona l'elemento (l'azione PWA è bloccata dal listener
 *   in capture del EditModeContext); il SECONDO click sull'elemento già
 *   selezionato esegue l'azione reale (test/anteprima).
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
    links,
  } = useEditMode();
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Nodi resi contentEditable, con il loro listener 'input' (chiave = id#idx).
  const editedNodesRef = useRef<Map<HTMLElement, string>>(new Map());

  const isSelected = selectedElementId === id;
  const style = styles[id];

  // ------------------------------------------------------------------
  // OVERRIDE LINK: applicato a tutti gli anchor interni (anche annidati).
  // Con override vuoto ('') si ripristina l'href originale salvato.
  // In editing l'apertura dei link resta comunque bloccata dal listener
  // in capture del context; in produzione l'href override è quello usato.
  // ------------------------------------------------------------------
  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const anchors = root.querySelectorAll<HTMLAnchorElement>('a[href]');
    anchors.forEach((a) => {
      if (!a.dataset.cmsOriginalHref) {
        a.dataset.cmsOriginalHref = a.getAttribute('href') ?? '';
      }
      const original = a.dataset.cmsOriginalHref;
      const linkOverride = links[id];
      const nextHref =
        linkOverride !== undefined && linkOverride !== '' ? linkOverride : original;
      if (nextHref && a.getAttribute('href') !== nextHref) {
        a.setAttribute('href', nextHref);
      }
    });
  }, [links, id, children, isEditMode]);

  // ------------------------------------------------------------------
  // PERCORSO RUNTIME (ospiti): applica testi e stili salvati senza
  // aggiungere wrapper interattivi. Le chiavi testo sono per-nodo
  // (id#idx) e quindi stabili tra builder e produzione; per compatibilità
  // con i dati salvati in passato, un override con la chiave id esatta
  // viene applicato al primo nodo testo.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isEditMode) return;
    const nodes = collectTextNodes(wrapRef.current);
    const elStyle = styles[id];
    nodes.forEach((node, idx) => {
      const exactKey = texts[id]?.[currentLanguage];
      const override =
        idx === 0 && exactKey !== undefined
          ? exactKey
          : texts[`${id}#${idx}`]?.[currentLanguage];
      if (override !== undefined && node.innerText !== override) {
        node.innerText = override;
      }
      if (elStyle) {
        applyStyleToNode(node, elStyle);
      } else {
        clearStyleOnNode(node);
      }
    });
  }, [isEditMode, id, styles, texts, currentLanguage, children]);

  // ------------------------------------------------------------------
  // PERCORSO EDITING (builder)
  // ------------------------------------------------------------------
  const textOverride = isEditMode ? texts[id]?.[currentLanguage] : undefined;

  useEffect(() => {
    if (!isEditMode) return;
    const root = wrapRef.current;
    if (!root) return;
    const nodes = collectTextNodes(root);
    const editingActive = isSelected;
    nodes.forEach((node, idx) => {
      const textKey = `${id}#${idx}`;
      if (editingActive) {
        if (style) applyStyleToNode(node, style);
        if (!editedNodesRef.current.has(node)) {
          node.contentEditable = 'true';
          node.spellcheck = false;
          node.style.outline = 'none';
          node.style.cursor = 'text';
          // Riattiva i pointer-events anche dentro overlay decorativi con
          // pointer-events:none (es. testi delle tile sopra le foto), così
          // il testo selezionato è cliccabile e digitabile in-place.
          node.style.pointerEvents = 'auto';
          editedNodesRef.current.set(node, textKey);
          node.addEventListener('input', () => {
            // Chiave per-nodo: ogni riga/label mantiene il suo testo.
            const key = editedNodesRef.current.get(node);
            if (key) updateText(key, currentLanguage, node.innerText);
          });
          // Impedisce che INVIO/spazio attivino bottoni o link della PWA.
          node.addEventListener('keydown', (e) => e.stopPropagation());
          node.addEventListener('click', (e) => e.stopPropagation());
        }

        // Compatibilità: un vecchio override con chiave id esatta va al
        // primo nodo; quelli per-nodo restano sulla loro riga.
        const exactOverride = idx === 0 ? textOverride : undefined;
        const nodeOverride =
          exactOverride !== undefined
            ? exactOverride
            : texts[textKey]?.[currentLanguage];
        if (nodeOverride !== undefined && node.innerText !== nodeOverride) {
          if (document.activeElement !== node) {
            node.innerText = nodeOverride;
          }
        }
      } else if (editedNodesRef.current.has(node)) {
        // Deselezione: esci dal contentEditable mantenendo le modifiche.
        node.contentEditable = 'false';
        const key = editedNodesRef.current.get(node);
        if (key) updateText(key, currentLanguage, node.innerText);
        editedNodesRef.current.delete(node);
        node.style.cursor = '';
        node.style.pointerEvents = '';
      }
    });
  }, [isEditMode, isSelected, style, textOverride, currentLanguage, id, updateText, texts]);

  // ------------------------------------------------------------------
  // SELEZIONE / ESECUZIONE: primo click seleziona (la PWA è bloccata dal
  // listener in capture del context), secondo click sull'elemento già
  // selezionato esegue l'azione reale (test/anteprima).
  // ------------------------------------------------------------------
  const handleSelection = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelected) return; // il primo click è già gestito in capture dal context
      const target = e.target as HTMLElement | null;
      // Click su un controllo CMS (upload immagini/icone, picker orari) o su
      // un testo contentEditable: mantieni la selezione e lascia interagire.
      if (target?.closest?.('[data-cms-control], [contenteditable="true"]')) return;
      // Secondo click sull'elemento già selezionato: l'azione reale della PWA
      // è già partita via propagazione naturale (il listener in capture non
      // blocca il secondo click); qui solo rilasciamo la selezione.
      selectElement(null);
      // Per gli anchor garantiamo l'apertura in nuova scheda (niente navigazione
      // della pagina editor) e raccogliamo l'href con l'override applicato.
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href') || '';
        if (href) window.open(href, '_blank', 'noopener,noreferrer');
      }
    },
    [isSelected, selectElement],
  );

  if (!isEditMode) {
    // display:contents: il div non genera box, gli elementi figli della PWA
    // restano nel flusso esattamente come prima dell'introduzione del CMS.
    return (
      <div ref={wrapRef} data-cms-id={id} style={{ display: 'contents' }}>
        {children}
      </div>
    );
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
              className={`absolute ${pos} w-2.5 h-2.5 bg-white border-2 border-sky-500 rounded-[3px] z-40 shadow-sm pointer-events-none`}
            />
          ))}
          {label && (
            <span className="absolute -top-2 left-2 -translate-y-full bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-40 shadow-md pointer-events-none">
              {label}
            </span>
          )}
        </>
      )}
    </div>
  );
};
