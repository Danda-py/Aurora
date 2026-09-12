import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // adjust path if needed

export const GuestRedirect: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPass = async () => {
      if (!token) {
        setError("Token mancante");
        return;
      }

      try {
        const { data, error: sbError } = await supabase
          .from('guest_passes')
          .select('*')
          .eq('token', token)
          .single();

        if (sbError || !data) {
          console.error("Pass not found or error", sbError);
          // Redirect to base app or show error
          window.location.href = '/'; 
          return;
        }

        const checkInDate = new Date(data.check_in_date + "T00:00:00");
        const checkOutDate = new Date(data.check_out_date + "T23:59:59");
        const today = new Date();

        if (today < checkInDate) {
          // Future booking
          // They can only see the base site for now, or maybe a "wait" page.
          // Let's redirect to base but save something to storage or just redirect.
          window.location.href = '/';
        } else if (today > checkOutDate) {
          // Expired
          setError("Pass scaduto.");
        } else {
          // Active
          // Save pass info to local storage so the PWA can pick it up
          localStorage.setItem('aurora_guest_pass', JSON.stringify(data));
          // Redirect to main PWA view
          navigate('/'); 
        }
      } catch (err) {
        console.error("Err", err);
        setError("Errore nel recupero del pass");
      }
    };

    checkPass();
  }, [token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-bold">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-white text-black rounded-xl font-bold text-sm"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-pulse text-sm font-mono text-emerald-400">Verifica del pass in corso...</div>
    </div>
  );
};
