import React, { useState, useRef, useCallback } from 'react';

interface InlineEditableTextProps {
  /** Initial value */
  value: string;
  /** Called when the value changes (while editing) */
  onChange: (value: string) => void;
  /** Called when editing is submitted (blurred or Enter). Can be async to save to DB. */
  onSubmit?: (value: string) => Promise<void> | void;
  /** If true, renders a textarea; otherwise an input */
  multiline?: boolean;
  /** Placeholder shown when empty and not editing */
  placeholder?: string;
  /** Debounce time in ms for onSubmit (default 500) */
  debounceMs?: number;
}

/**
 * A reusable component for inline editing of text.
 * Clicking on the text turns it into an input/textarea.
 * On blur or Enter, the value is submitted via onSubmit (if provided) or onChange.
 * The onSubmit function can be used to persist to a database with debouncing.
 */
export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onChange,
  onSubmit,
  multiline = false,
  placeholder,
  debounceMs = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startEditing = () => {
    setEditValue(value);
    setIsEditing(true);
    // Request animation frame to focus after DOM update
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      // Select all text if it's an input (not textarea)
      if (!multiline && inputRef.current) {
        (inputRef.current as HTMLInputElement).select();
      }
    });
  };

  const stopEditing = (submit: boolean = true) => {
    if (!isEditing) return;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setIsEditing(false);
    if (submit) {
      // Update the parent's value immediately (optimistic)
      onChange(editValue);
      // Then optionally persist with debounce
      if (onSubmit) {
        // Debounce the submit call
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onSubmit(editValue).catch(err => {
            console.error('Failed to submit inline edit:', err);
            // Optionally revert or show error
          });
        }, debounceMs);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      stopEditing(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing(false); // discard changes
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  };

  const handleBlur = () => {
    stopEditing(true);
  };

  if (!isEditing) {
    return (
      <span
        onClick={startEditing}
        style={{
          cursor: 'pointer',
          textDecoration: value ? 'underline' : 'none',
          borderBottom: value ? '1px dotted' : 'none',
        }}
      >
        {value || placeholder || ''}
      </span>
    );
  }

  return (
    <>
      {multiline ? (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '8px',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      ) : (
        <input
          ref={inputRef}
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            padding: '4px 8px',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      )}
    </>
  );
};