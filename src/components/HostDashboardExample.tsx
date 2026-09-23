import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { InlineEditableText } from './InlineEditableText';
import { InlineTimePicker } from './InlineTimePicker';

/**
 * Example component showing how to use InlineEditableText and InlineTimePicker
 * in a host dashboard for editing guide content.
 * This is a simplified example; in a real app you would integrate with your
 * existing state management (e.g., React Query, Zustand, or the existing cmsService).
 */
export const HostDashboardExample: React.FC = () => {
  // Local state for the guide content we are editing
  const [guide, setGuide] = useState({
    checkInTime: '15:00',
    checkInInstructions: 'Il check-in è self-service. Troverai la chiave nella lockbox vicino alla porta.',
    address: 'Via Roma 123, Morbegno',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data from Supabase (example)
  useEffect(() => {
    const fetchGuide = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch the guide for the current host
        // const { data, error } = await supabase
        //   .from('host_guides')
        //   .select('*')
        //   .eq('host_id', currentHostId)
        //   .single();
        // For this example, we'll just use the initial state
        // Simulate a delay
        await new Promise(res => setTimeout(res, 500));
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load guide data');
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchGuide();
  }, []);

  // Debounced save function using useCallback with a ref for timeout
  // We'll create a simple debounce hook-like mechanism
  const saveGuideDebounced = React.useCallback(async (updates: Partial<typeof guide>) => {
    // In a real implementation, you would debounce the save calls
    // For simplicity, we'll just save directly but show how you could debounce
    // You could use lodash.debounce or a custom hook
    setIsLoading(true);
    try {
      // Example: update the host_guides table
      // const { error } = await supabase
      //   .from('host_guides')
      //   .update(updates)
      //   .eq('host_id', currentHostId);
      // For now, we'll just update local state and pretend to save
      await new Promise(res => setTimeout(res, 800)); // Simulate network delay
      setGuide(prev => ({ ...prev, ...updates }));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to save changes');
      setIsLoading(false);
      console.error(err);
    }
  }, []);

  // Handler for checkInTime change
  const handleCheckInTimeChange = async (newTime: string) => {
    // Update the time in state
    setGuide(prev => ({ ...prev, checkInTime: newTime }));
    // Also update any dependent strings? In this example, the instructions
    // are separate, but you could have a computed string that uses the time.
    // For demonstration, we'll just save the time.
    await saveGuideDebounced({ checkInTime: newTime });
  };

  // Handler for checkInInstructions change
  const handleCheckInInstructionsChange = async (newInstructions: string) => {
    await saveGuideDebounced({ checkInInstructions: newInstructions });
  };

  // Handler for address change
  const handleAddressChange = async (newAddress: string) => {
    await saveGuideDebounced({ address: newAddress });
  };

  if (isLoading) return <div>Caricamento...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Dashboard Host - Modifica Guida Ospiti</h1>
      <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
        <h2>Anteprima Guida</h2>
        <div style={{ lineHeight: '1.6' }}>
          <p>
            <strong>Orario di check-in:</strong>
            <InlineTimePicker
              value={guide.checkInTime}
              onChange={handleCheckInTimeChange}
              placeholder("Orario non impostato")
            />
          </p>
          <p>
            <strong>Istruzioni di check-in:</strong><br />
            <InlineEditableText
              value={guide.checkInInstructions}
              onChange={handleCheckInInstructionsChange}
              multiline
              placeholder("Aggiungi le istruzioni di check-in...")
            />
          </p>
          <p>
            <strong>Indirizzo:</strong><br />
            <InlineEditableText
              value={guide.address}
              onChange={handleAddressChange}
              placeholder("Aggiungi l'indirizzo della struttura...")
            />
          </p>
        </div>
      </div>
      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        <p>
          Le modifiche vengono salvate automaticamente con un breve ritardo
          (debounce) per evitare troppe chiamate al database.
        </p>
        <p>
          L'orario del check-in è modificabile tramite un selettore contestuale
          che appare al clic.
        </p>
      </div>
    </div>
  );
};