import React, { useState } from 'react';

interface StyleEditorProps {
  /** Current theme settings */
  value: {
    primaryColor: string;
    accentColor: string;
    bgMode: 'dark' | 'warm' | 'slate';
    buttonStyle: 'pill' | 'rounded' | 'glow';
    siteTitle?: string;
  };
  /** Called when the theme changes (while editing) */
  onChange: (theme: typeof value) => void;
  /** Called when editing is submitted (blurred or Enter). Can be async to save to DB. */
  onSubmit?: (theme: typeof value) => Promise<void> | void;
  /** Debounce time in ms for onSubmit (default 500) */
  debounceMs?: number;
}

/**
 * A reusable component for editing theme styles (colors, etc.) in a popup or inline.
 * Clicking on a styled area opens a panel with color pickers and selects.
 */
export const StyleEditor: React.FC<StyleEditorProps> = ({
  value,
  onChange,
  onSubmit,
  debounceMs = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startEditing = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const stopEditing = (submit: boolean = true) => {
    if (!isEditing) return;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setIsEditing(false);
    if (submit) {
      onChange(editValue);
      if (onSubmit) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onSubmit(editValue).catch(err => {
            console.error('Failed to submit style changes:', err);
          });
        }, debounceMs);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const name = target.name;
    let value: string;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'color') {
      value = target.value;
    } else {
      value = target.value;
    }
    setEditValue(prev => ({ ...prev, [name]: value }));
  };

  if (!isEditing) {
    // Display a small preview of the current style
    return (
      <div
        onClick={startEditing}
        style={{
          cursor: 'pointer',
          display: 'inline-block',
          padding: '4px 8px',
          backgroundColor: value.primaryColor,
          color: '#fff',
          borderRadius: value.buttonStyle === 'pill' ? '9999px' : value.buttonStyle === 'rounded' ? '4px' : '0px',
          border: `2px solid ${value.accentColor}`,
          fontWeight: 'bold',
        }}
      >
        {value.siteTitle || 'Stile'}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 1000,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: '200px',
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Colore primario</label>
          <input
            type="color"
            name="primaryColor"
            value={editValue.primaryColor}
            onChange={handleChange}
            style={{ width: '100%', marginTop: '4px', height: '30px', padding: '0' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Colore di accento</label>
          <input
            type="color"
            name="accentColor"
            value={editValue.accentColor}
            onChange={handleChange}
            style={{ width: '100%', marginTop: '4px', height: '30px', padding: '0' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Modalità sfondo</label>
          <select
            name="bgMode"
            value={editValue.bgMode}
            onChange={handleChange}
            style={{ width: '100%', marginTop: '4px' }}
          >
            <option value="dark">Scuro</option>
            <option value="warm">Caldo</option>
            <option value="slate">Ardesia</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Stile pulsante</label>
          <select
            name="buttonStyle"
            value={editValue.buttonStyle}
            onChange={handleChange}
            style={{ width: '100%', marginTop: '4px' }}
          >
            <option value="pill">Pillola</option>
            <option value="rounded">Arrotondato</option>
            <option value="glow">Bagliore</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Titolo sito (opzionale)</label>
          <input
            type="text"
            name="siteTitle"
            value={editValue.siteTitle ?? ''}
            onChange={handleChange}
            style={{ width: '100%', marginTop: '4px', padding: '4px' }}
          />
        </div>
        <div style={{ textAlign: 'right', gap: '8px', display: 'flex' }}>
          <button
            onClick={() => stopEditing(false)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Annulla
          </button>
          <button
            onClick={() => stopEditing(true)}
            style={{
              marginLeft: '8px',
              padding: '6px 12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};