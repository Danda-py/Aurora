import React, { useState, useCallback, useRef } from 'react';
import InlineEditableText from './InlineEditableText';
import InlineTimePicker from './InlineTimePicker';

// Mock Supabase save function (replace with actual Supabase call)
const saveToDatabase = async (field: string, value: any) => {
  // Simulate API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(`Saved ${field}:`, value);
      resolve();
    }, 500);
  });
};

const GuideEditorExample: React.FC = () => {
  // Local state for the guide being edited
  const [guide, setGuide] = useState({
    checkInTime: '15:00', // HH:mm
    addressDescription: 'Vicino alla stazione principale',
    selfCheckInSteps: ['Trova la chiave sotto lo zerbino', 'Codice WiFi: ABC123'],
  });

  // Refs to track if we have pending saves (for debouncing)
  const saveTimeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounced save function
  const debouncedSave = useCallback(async (field: string, value: any) => {
    // Clear any existing timeout for this field
    if (saveTimeoutRefs.current[field]) {
      clearTimeout(saveTimeoutRefs.current[field]);
    }

    // Set new timeout to save after 500ms of inactivity
    saveTimeoutRefs.current[field] = setTimeout(async () => {
      try {
        await saveToDatabase(field, value);
        // Optionally show a toast or update UI to indicate save success
      } catch (error) {
        console.error('Failed to save:', error);
        // Show error to user
      } finally {
        // Clean up timeout ref
        delete saveTimeoutRefs.current[field];
      }
    }, 500);
  }, []);

  // Handlers for saving individual fields
  const handleCheckInTimeSave = (time: string) => {
    setGuide(prev => ({ ...prev, checkInTime: time }));
    debouncedSave('checkInTime', time);
  };

  const handleAddressDescriptionSave = (description: string) => {
    setGuide(prev => ({ ...prev, addressDescription: description }));
    debouncedSave('addressDescription', description);
  };

  // For optional self-check-in steps, we might want to handle adding/removing steps
  // This example shows a simple list where each step is editable
  const handleStepSave = (index: number, step: string) => {
    const newSteps = [...guide.selfCheckInSteps];
    newSteps[index] = step;
    setGuide(prev => ({ ...prev, selfCheckInSteps: newSteps }));
    debouncedSave(`selfCheckInSteps[${index}]`, step);
  };

  const handleAddStep = () => {
    setGuide(prev => ({
      ...prev,
      selfCheckInSteps: [...prev.selfCheckInSteps, ''],
    }));
    // Focus the newly added empty step for editing
    // In a real implementation, you might need to ref the new element
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Editor Guida Host</h2>

      {/* Check-in Time Inline Editing */}
      <div style={{ marginBottom: '24px' }}>
        <h3>Orario Check-in</h3>
        <p>
          L'orario di check-in è{' '}
          <InlineTimePicker
            value={guide.checkInTime}
            onSave={handleCheckInTimeSave}
            placeholder="Imposta orario check-in"
          />
          . Questo orario verrà utilizzato nelle istruzioni automatiche.
        </p>
      </div>

      {/* Address Description Inline Editing (Multiline) */}
      <div style={{ marginBottom: '24px' }}>
        <h3>Descrizione Indirizzo</h3>
        <p>
          <InlineEditableText
            value={guide.addressDescription}
            onSave={handleAddressDescriptionSave}
            multiline
            placeholder="Descrivi come arrivare all'alloggio"
          />
        </p>
      </div>

      {/* Self Check-in Steps (Optional Fields with Placeholder & Add Button) */}
      <div>
        <h3>Passaggi Self Check-in</h3>
        {guide.selfCheckInSteps.map((step, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <InlineEditableText
              value={step}
              onSave={(newStep) => handleStepSave(index, newStep)}
              placeholder={`Passo ${index + 1} (opzionale)`}
              style={{ display: 'block', width: '100%' }}
            />
          </div>
        ))}
        <button
          onClick={handleAddStep}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          + Aggiungi passaggio
        </button>
      </div>
    </div>
  );
};

export default GuideEditorExample;