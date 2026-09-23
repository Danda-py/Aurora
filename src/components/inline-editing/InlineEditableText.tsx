import React, { useState, useRef, useEffect } from 'react';

interface InlineEditableTextProps {
  value: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  multiline?: boolean;
  placeholder?: string;
  saveOnBlur?: boolean;
  debounceMs?: number;
}

const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onSave,
  onCancel,
  multiline = false,
  placeholder,
  saveOnBlur = true,
  debounceMs = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Initialize editValue when value changes from outside
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(value);
    // Focus the input after a short delay to ensure it's mounted
    setTimeout(() => {
      inputRef.current?.focus();
      // Select all text if it's an input (not textarea)
      if (!multiline && inputRef.current && 'select' in inputRef.current) {
        inputRef.current.select();
      }
    }, 50);
  };

  const stopEditing = (save: boolean) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
    setIsEditing(false);
    if (save) {
      onSave(editValue);
    } else if (onCancel) {
      onCancel();
    } else {
      // If no onCancel provided, revert to original value on cancel
      setEditValue(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);

    // Debounce the onSave call while typing (optional feature)
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const newTimeout = setTimeout(() => {
      onSave(newValue);
    }, debounceMs);
    setDebounceTimeout(newTimeout);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if inside a form
      stopEditing(true);
    } else if (e.key === 'Escape') {
      stopEditing(false);
    }
  };

  const handleBlur = () => {
    if (isEditing && saveOnBlur) {
      stopEditing(true);
    }
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
    <div style={{ display: 'inline-block', minWidth: '100px' }}>
      {multiline ? (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
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
          type="text"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            padding: '8px',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      )}
      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => stopEditing(true)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Salva
        </button>
        <button
          onClick={() => stopEditing(false)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Annulla
        </button>
      </div>
    </div>
  );
};

export default InlineEditableText;