import React, { useState, useRef, useEffect } from 'react';

interface InlineTimePickerProps {
  /** Time value in HH:mm format (24-hour) */
  value: string;
  /** Callback when time is changed */
  onChange: (value: string) => void;
  /** Optional: CSS class for the trigger element */
  className?: string;
  /** Optional: disable the picker */
  disabled?: boolean;
}

export const InlineTimePicker = ({
  value,
  onChange,
  className = '',
  disabled = false
}: InlineTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState(() => {
    const [h] = value.split(':');
    return parseInt(h, 10) || 0;
  });
  const [minute, setMinute] = useState(() => {
    const [, m] = value.split(':');
    return parseInt(m, 10) || 0;
  });
  const ref = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHour(parseInt(e.target.value, 10));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinute(parseInt(e.target.value, 10));
  };

  const handleSave = () => {
    const hourString = String(hour).padStart(2, '0');
    const minuteString = String(minute).padStart(2, '0');
    const newValue = `${hourString}:${minuteString}`;
    onChange(newValue);
    setIsOpen(false);
  };

  // Generate hour options (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate minute options (0, 15, 30, 45) for simplicity, or 0-59 step 1
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const triggerClass = `
    inline-time-picker
    ${className}
    cursor-pointer
    px-2 py-1 rounded hover:bg-gray-100
    disabled:cursor-not-allowed disabled:opacity-50
  `;

  const popoverClass = `
    absolute z-50 mt-2 w-56 p-4 bg-white rounded-lg shadow-lg border border-gray-200
    ${isOpen ? 'block' : 'hidden'}
  `;

  return (
    <div ref={ref} className="relative">
      <div
        className={triggerClass}
        onClick={handleOpen}
        role="button"
        aria-label="Seleziona orario"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        {value || '--:--'}
      </div>

      {isOpen && (
        <div ref={popoverRef} className={popoverClass}>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Ora</span>
              <select
                value={hour}
                onChange={handleHourChange}
                className="w-20 p-1 border border-gray-300 rounded"
                aria-label="Ora"
              >
                {hours.map(h => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Minuti</span>
              <select
                value={minute}
                onChange={handleMinuteChange}
                className="w-20 p-1 border border-gray-300 rounded"
                aria-label="Minuti"
              >
                {minutes.map(m => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleClose}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={disabled}
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};