import React, { useState, useRef, useCallback } from 'react';

interface InlineEditableTextProps {
  /** Initial text value */
  value: string;
  /** Callback when text is saved */
  onSave: (value: string) => void;
  /** Optional: placeholder when empty */
  placeholder?: string;
  /** Optional: debounce delay in ms for auto-save (default 1000) */
  debounceDelay?: number;
  /** Optional: CSS class for the editable element */
  className?: string;
  /** Optional: disable editing */
  disabled?: boolean;
}

export const InlineEditableText = ({
  value,
  onSave,
  placeholder = '',
  debounceDelay = 1000,
  className = '',
  disabled = false
}: InlineEditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleSave = useCallback(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    onSave(editValue);
    setIsEditing(false);
  }, [editValue, onSave, saveTimeout]);

  const handleStartEditing = useCallback(() => {
    if (disabled) return;
    setIsEditing(true);
    // Focus the element after a short delay to ensure it's rendered
    setTimeout(() => {
      ref.current?.focus();
      // Select all text
      const selection = window.getSelection();
      if (selection && ref.current) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 100);
  }, [disabled]);

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  }, [value, handleSave]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || '';
    setEditValue(newValue);

    // Debounce auto-save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    const timeout = setTimeout(() => {
      handleSave();
    }, debounceDelay);
    setSaveTimeout(timeout);
  }, [handleSave, debounceDelay]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      handleSave();
    }
  }, [handleSave]);

  // Click outside to save
  // Note: In a real app, you might want to use a portal or global event listener
  // For simplicity, we'll rely on blur and Enter/Esc keys

  if (!isEditing) {
    return (
      <div
        ref={ref}
        className={`inline-editable ${className} cursor-pointer px-2 py-1 rounded hover:bg-gray-50`}
        onClick={handleStartEditing}
        role="textbox"
        aria-placeholder={placeholder}
        aria-label="Modifica testo"
      >
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`${className} p-2 border border-dashed border-gray-300 rounded bg-white`}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={handleChange}
      autoFocus
      spellCheck={false}
      role="textbox"
      aria-placeholder={placeholder}
      aria-label="Modifica testo"
      aria-multiline="false"
    >
      {editValue || <span className="text-gray-400 italic">{placeholder}</span>}
    </div>
  );
};