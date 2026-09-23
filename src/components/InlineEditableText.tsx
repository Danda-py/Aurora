import React, { useState, useRef, useCallback } from 'react';

interface InlineEditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  debounceDelay?: number;
}

const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onChange,
  placeholder = 'Click to edit',
  multiline = false,
  debounceDelay = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onChange(editValue);
    setIsEditing(false);
  }, [editValue, onChange]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(save, debounceDelay);
  }, [save, debounceDelay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      debouncedSave();
    }
    // For multiline, we might want to allow Ctrl+Enter to save, but we'll keep it simple and rely on blur/button.
  };

  const handleBlur = () => {
    debouncedSave();
  };

  if (isEditing) {
    return (
      <div className="inline-editable">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="inline-editable-input"
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="inline-editable-input"
          />
        )}
        <div className="inline-editable-actions">
          <button onClick={debouncedSave} className="inline-editable-save">
            Save
          </button>
          <button onClick={() => {
            setEditValue(value);
            setIsEditing(false);
          }} className="inline-editable-cancel">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-editable" onClick={() => setIsEditing(true)}>
      {value ? (
        <span className="inline-editable-display">{value}</span>
      ) : (
        <span className="inline-editable-placeholder">{placeholder}</span>
      )}
    </div>
  );
};

export default InlineEditableText;