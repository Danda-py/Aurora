import React, { useCallback, useEffect, useRef } from 'react';
import { useCMS, TextRole, TextAlign } from './CMSContext';

interface InlineEditableTextProps {
  /** Chiave semantica del blocco, es. "rules.title" */
  blockKey: string;
  role?: TextRole;
  /** Classi Tailwind applicate quando il CMS non è in edit mode. */
  className?: string;
  /** Stile inline della pagina (usato in anteprima o per default esterni). */
  style?: React.CSSProperties;
  multiline?: boolean;
  /** Testo iniziale di fallback (dai dati statici della guida). */
  fallback: string;
}

/**
 * Testo editabile inline in stile WYSIWYG: in edit mode il testo diventa
 * contentEditable, la selezione notifica il CMS (per la FloatingTextToolbar)
 * e ogni modifica viene salvata automaticamente per la lingua corrente.
 */
export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  blockKey,
  role = 'body',
  className = '',
  style,
  multiline = false,
  fallback,
}) => {
  const { state, selectBlock, updateText, updateTextStyle, registerBlock } = useCMS();
  const ref = useRef<HTMLDivElement | HTMLSpanElement>(null);
  const isEditing = state.isEditMode && !state.previewMode;

  // Registra il blocco con i default del ruolo alla prima render.
  useEffect(() => {
    registerBlock(blockKey, { style: { role: role as TextRole } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey]);

  const block = state.blocks[blockKey];
  const text = block?.content?.text?.[state.language] ?? fallback;

  const applyRoleDefaults = useCallback(
    (nextRole: TextRole) => {
      if (!block) return;
      const { role: _ignored, ...rest } = block.style;
      void _ignored;
      updateTextStyle(blockKey, { ...rest, role: nextRole });
    },
    [block, blockKey, updateTextStyle],
  );

  // Aggiorna il DOM solo quando il valore cambia esternamente (es. traduzione IA),
  // evitando di sovrascrivere il contenuto mentre l'utente sta digitando.
  useEffect(() => {
    if (ref.current && ref.current.innerText !== text && document.activeElement !== ref.current) {
      ref.current.innerText = text;
    }
  }, [text]);

  const handleSelect = useCallback(() => {
    if (!isEditing) return;
    selectBlock(blockKey);
    // Passa il nodo attivo al CMS per la FloatingTextToolbar.
    window.dispatchEvent(
      new CustomEvent('visual-cms:select-node', { detail: { key: blockKey, node: ref.current } }),
    );
  }, [blockKey, isEditing, selectBlock]);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    updateText(blockKey, state.language, ref.current.innerText);
  }, [blockKey, state.language, updateText]);

  const editableProps = isEditing
    ? {
        contentEditable: true as const,
        suppressContentEditableWarning: true as const,
        onClick: handleSelect,
        onInput: handleInput,
        onFocus: handleSelect,
        'data-cms-key': blockKey,
      }
    : {};

  const computedStyle: React.CSSProperties = block
    ? {
        fontFamily: block.style.fontFamily,
        fontSize: `${block.style.fontSize}px`,
        fontWeight: block.style.bold ? 700 : 400,
        fontStyle: block.style.italic ? 'italic' : 'normal',
        textDecoration: block.style.underline ? 'underline' : 'none',
        color: block.style.color,
        textAlign: block.style.align,
        outline: 'none',
        ...style,
      }
    : (style ?? {});

  const Tag: any = multiline ? 'div' : 'span';

  return (
    <Tag
      ref={ref as any}
      className={`${className} ${isEditing ? 'cursor-text' : ''}`}
      style={computedStyle}
      {...editableProps}
    >
      {text}
    </Tag>
  );
};

// Espone l'helper di cambio ruolo riutilizzabile dalla toolbar.
