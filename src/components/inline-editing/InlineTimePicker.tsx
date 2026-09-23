import React, { useState, useRef } from 'react';

interface InlineTimePickerProps {
  value: string; // Expected format: HH:mm (24-hour) or empty string
  onSave: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  saveOnBlur?: boolean;
  debounceMs?: number;
}

const InlineTimePicker: React.FC<InlineTimePickerProps> = ({
  value,
  onSave,
  onCancel,
  placeholder,
  saveOnBlur = true,
  debounceMs = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value === '' ? '00:00' : value);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setIsEditing(true);
    // If the current value is empty, we start with 00:00 in the picker
    setEditValue(value === '' ? '00:00' : value);
    // Focus the time input after a short delay
    setTimeout(() => {
      timeInputRef.current?.focus();
    }, 50);
  };

  const stopEditing = (save: boolean) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
    setIsEditing(false);
    if (save) {
      // If we were adding (original value empty) and the user saved 00:00 without changing,
      // we might want to treat that as unset? We'll leave that to the parent.
      onSave(editValue);
    } else if (onCancel) {
      onCancel();
    }
    // If no onCancel, we do nothing on cancel (value remains unchanged)
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);

    // Debounce the onSave call while typing (optional)
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const newTimeout = setTimeout(() => {
      onSave(newValue);
    }, debounceMs);
    setDebounceTimeout(newTimeout);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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

  // Format the display value: if empty, show placeholder or '--:--'
  const displayValue = value || placeholder || '--:--';

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
        {displayValue}
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-block', minWidth: '100px' }}>
      <input
        ref={timeInputRef}
        type="time"
        value={editValue}
        onChange={handleTimeChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
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

export default InlineTimePicker;