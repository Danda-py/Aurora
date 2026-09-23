import React, { useState, useRef, useCallback } from 'react';

interface InlineTimePickerProps {
  value: string; // HH:mm format
  onChange: (value: string) => void;
  placeholder?: string;
  debounceDelay?: number;
}

const InlineTimePicker: React.FC<InlineTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Click to set time',
  debounceDelay = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize hour and minute from value when editing starts
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return { hour: h || 0, minute: m || 0 };
  };

  const formatTime = (h: number, m: number) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const save = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onChange(formatTime(hour, minute));
    setIsEditing(false);
  }, [hour, minute, onChange]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(save, debounceDelay);
  }, [save, debounceDelay]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHour(parseInt(e.target.value, 10));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinute(parseInt(e.target.value, 10));
  };

  const handleBlur = () => {
    debouncedSave();
  };

  if (isEditing) {
    const hourOptions = Array.from({ length: 24 }, (_, i) => i);
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

    return (
      <div className="inline-time-picker">
        <div className="inline-time-picker-controls">
          <select value={hour} onChange={handleHourChange} className="inline-time-picker-select">
            {hourOptions.map(h => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}
              </option>
            ))}
          </select>
          <span className="inline-time-picker-separator">:</span>
          <select value={minute} onChange={handleMinuteChange} className="inline-time-picker-select">
            {minuteOptions.map(m => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <div className="inline-time-picker-actions">
          <button onClick={debouncedSave} className="inline-time-picker-save">
            Save
          </button>
          <button onClick={() => {
            const { hour: h, minute: m } = parseTime(value);
            setHour(h);
            setMinute(m);
            setIsEditing(false);
          }} className="inline-time-picker-cancel">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-time-picker" onClick={() => setIsEditing(true)}>
      {value ? (
        <span className="inline-time-picker-display">{value}</span>
      ) : (
        <span className="inline-time-picker-placeholder">{placeholder}</span>
      )}
    </div>
  );
};

export default InlineTimePicker;