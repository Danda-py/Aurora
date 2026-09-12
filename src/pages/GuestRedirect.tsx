import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { validateGuestPassToken } from '../services/guestPassService';

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
        let checkInDateStr: string | null = null;
        let checkOutDateStr: string | null = null;
        let passPayload: any = null;

        if (supabase) {
          try {
            const { data, error: sbError } = await supabase
              .from('guest_passes')
              .select('*')
              .eq('token', token)
              .single();

            if (!sbError && data) {
              checkInDateStr = data.check_in_date;
              checkOutDateStr = data.check_out_date;
              passPayload = data;
            }
          } catch (sbEx) {
            console.warn("Supabase query failed, falling back to API:", sbEx);
          }
        }

        // Fallback to internal API / guestPassService
        if (!passPayload) {
          const apiPass = await validateGuestPassToken(token);
          if (apiPass) {
            checkInDateStr = apiPass.checkInDate;
            checkOutDateStr = apiPass.checkOutDate;
            passPayload = apiPass;
          }
        }

        if (!passPayload || !checkInDateStr || !checkOutDateStr) {
          console.warn("Pass not found or invalid token");
          navigate('/');
          return;
        }

        const checkInDate = new Date(checkInDateStr + "T00:00:00");
        const checkOutDate = new Date(checkOutDateStr + "T23:59:59");
        const today = new Date();

        if (today < checkInDate) {
          // Future booking
          navigate(`/?pass=${encodeURIComponent(token)}`);
        } else if (today > checkOutDate) {
          // Expired
          setError("Pass scaduto.");
        } else {
          // Active
          localStorage.setItem('aurora_guest_pass', JSON.stringify(passPayload));
          navigate(`/?pass=${encodeURIComponent(token)}`);
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
