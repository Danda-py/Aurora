import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateGuestPassToken } from '../services/guestPassService';
import { supabase } from '../services/supabaseClient';

export const GuestRedirect: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPass = async () => {
      if (!token) {
        navigate('/');
        return;
      }

      try {
        // 1. First validate against the server API
        let passPayload = await validateGuestPassToken(token);

        // 2. Secondary fallback to Supabase if configured
        if (!passPayload && supabase) {
          try {
            const { data, error: sbError } = await supabase
              .from('guest_passes')
              .select('*')
              .eq('token', token)
              .single();

            if (!sbError && data) {
              passPayload = {
                id: data.id,
                guestName: data.guest_name,
                guestSurname: data.guest_surname || '',
                checkInDate: data.check_in_date,
                checkInTime: data.check_in_time || '14:00',
                checkOutDate: data.check_out_date,
                checkOutTime: data.check_out_time || '10:00',
                phone: data.phone || '',
                pinCode: data.pin_code || '',
                token: data.token,
                bookingRef: data.booking_ref || '',
                guestsCount: data.guests_count || 2,
                bookingSource: data.booking_source || 'direct',
                active: data.active !== false,
                checkInConfirmed: data.check_in_confirmed || false,
                createdAt: data.created_at || new Date().toISOString()
              };
            }
          } catch (sbEx) {
            console.warn('Supabase query fallback:', sbEx);
          }
        }

        if (passPayload) {
          localStorage.setItem('aurora_active_pass', JSON.stringify(passPayload));
          localStorage.setItem('aurora_guest_pass', JSON.stringify(passPayload));
        }

        // Navigate to the main Welcome Book with the token in query params
        navigate(`/?pass=${encodeURIComponent(token)}`, { replace: true });
      } catch (err) {
        console.error('Error redirecting guest pass:', err);
        // Fallback: still navigate to home so guest can view the guide
        navigate(`/?pass=${encodeURIComponent(token)}`, { replace: true });
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
            className="px-4 py-2 bg-white text-black rounded-xl font-bold text-sm cursor-pointer"
          >
            Accedi alla Guida
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#30d158] border-t-transparent"></div>
        <div className="text-xs font-mono text-[#86868b]">Caricamento Pass Ospite Aurora...</div>
      </div>
    </div>
  );
};
