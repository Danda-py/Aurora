import React, { useState, useRef, useCallback } from 'react';

interface InlineTimePickerProps {
  /** Initial time in HH:mm format (24-hour) */
  value: string;
  /** Called when the time changes (while picking) */
  onChange: (time: string) => void;
  /** Called when editing is submitted (blurred or Enter). Can be async to save to DB. */
  onSubmit?: (time: string) => Promise<void> | void;
  /** Placeholder shown when empty and not editing */
  placeholder?: string;
  /** Debounce time in ms for onSubmit (default 500) */
  debounceMs?: number;
}

/**
 * A reusable component for inline time editing.
 * Clicking on the time turns it into a popup with hour and minute selects.
 * On blur or pressing Enter, the value is submitted via onSubmit (if provided) or onChange.
 * The onSubmit function can be used to persist to a database with debouncing.
 */
export const InlineTimePicker: React.FC<InlineTimePickerProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  debounceMs = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse hours and minutes from HH:mm
  const [hours, minutes] = value.split(':').map(part => parseInt(part, 10));
  const [editHours, setEditHours] = useState(isNaN(hours) ? 0 : hours);
  const [editMinutes, setEditMinutes] = useState(isNaN(minutes) ? 0 : minutes);

  const startEditing = () => {
    setEditValue(value);
    setEditHours(isNaN(hours) ? 0 : hours);
    setEditMinutes(isNaN(minutes) ? 0 : minutes);
    setIsEditing(true);
  };

  const stopEditing = (submit: boolean = true) => {
    if (!isEditing) return;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setIsEditing(false);
    const newTime = `${String(editHours).padStart(2, '0')}:${String(editMinutes).padStart(2, '0')}`;
    if (submit) {
      // Update the parent's value immediately (optimistic)
      onChange(newTime);
      // Then optionally persist with debounce
      if (onSubmit) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onSubmit(newTime).catch(err => {
            console.error('Failed to submit inline time:', err);
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

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditHours(parseInt(e.target.value, 10));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditMinutes(parseInt(e.target.value, 10));
  };

  const handleBlur = () => {
    stopEditing(true);
  };

  if (!isEditing) {
    return (
      <span
        ref={wrapperRef}
        onClick={startEditing}
        style={{
          cursor: 'pointer',
          textDecoration: value ? 'underline' : 'none',
          borderBottom: value ? '1px dotted' : 'none',
        }}
      >
        {value || placeholder || '--:--'}
      </span>
    );
  }

  // Position the popup relative to the wrapper
  const popupStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 1000,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    minWidth: '120px',
  };

  return (
    <>
      <div ref={wrapperRef} style={{ display: 'inline-block', position: 'relative' }}>
        {isEditing ? (
          <>
            <div style={popupStyle}>
              <div style={{ marginBottom: '6px' }}>
                <label>Ora</label>
                <select
                  value={editHours}
                  onChange={handleHourChange}
                  style={{ width: '60px', marginLeft: '4px' }}
                >
                  {[...Array(24).keys()].map(h => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Minuti</label>
                <select
                  value={editMinutes}
                  onChange={handleMinuteChange}
                  style={{ width: '60px', marginLeft: '4px' }}
                >
                  {[0, 15, 30, 45].map(m => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {/* Optionally allow any minute? We'll keep to 15 min steps for simplicity */}
              </div>
            </div>
          </>
        ) : (
          <span
            onClick={startEditing}
            style={{
              cursor: 'pointer',
              textDecoration: value ? 'underline' : 'none',
              borderBottom: value ? '1px dotted' : 'none',
            }}
          >
            {value || placeholder || '--:--'}
          </span>
        )}
      </div>
    </>
  );
};