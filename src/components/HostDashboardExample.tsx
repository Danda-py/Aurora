import React, { useState } from 'react';
import InlineEditableText from './InlineEditableText';
import InlineTimePicker from './InlineTimePicker';

// Mock supabase save function - replace with actual Supabase call
const saveToDatabase = async (field: string, value: string) => {
  // Simulate API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(`Saved ${field}: ${value}`);
      resolve();
    }, 500);
  });
};

const HostDashboardExample: React.FC = () => {
  // Local state for the host's guide fields
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [address, setAddress] = useState('Via Example, 123');
  const [instructions, setInstructions] = useState('Welcome! Please make yourself at home.');

  // Handler for saving a field to the database
  const handleSave = async (field: string, value: string) => {
    try {
      await saveToDatabase(field, value);
      // Optionally show a toast or update UI to indicate success
    } catch (error) {
      console.error('Failed to save:', error);
      // Handle error, e.g., show notification
    }
  };

  return (
    <div className="host-dashboard">
      <h2>Host Guide Editor</h2>

      <div className="field">
        <label>Check-in Time:</label>
        <InlineTimePicker
          value={checkInTime}
          onChange={(value) => {
            setCheckInTime(value);
            handleSave('checkInTime', value);
          }}
          placeholder="Set check-in time"
        />
      </div>

      <div className="field">
        <label>Address:</label>
        <InlineEditableText
          value={address}
          onChange={(value) => {
            setAddress(value);
            handleSave('address', value);
          }}
          placeholder="Click to add address"
        />
      </div>

      <div className="field">
        <label>Instructions:</label>
        <InlineEditableText
          value={instructions}
          onChange={(value) => {
            setInstructions(value);
            handleSave('instructions', value);
          }}
          multiline
          placeholder="Add instructions for guests"
        />
      </div>
    </div>
  );
};

export default HostDashboardExample;