import React, { useState, useEffect } from 'react';
import { GuestPass } from '../../types';
import { ShieldCheck, X, CheckCircle2, Unlock, Loader2, AlertCircle, Wifi, Lock, RotateCcw } from 'lucide-react';
import { checkCasaAuroraWifi } from '../../services/wifiDetectionService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pass: GuestPass | null;
}

export const SmartLockModal: React.FC<Props> = ({ isOpen, onClose, pass }) => {
  const [openingState, setOpeningState] = useState<'idle' | 'opening' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [wifiChecking, setWifiChecking] = useState<boolean>(true);
  const [wifiVerified, setWifiVerified] = useState<boolean>(false);
  const [wifiMessage, setWifiMessage] = useState<string>('');

  const runWifiCheck = async () => {
    setWifiChecking(true);
    try {
      const res = await checkCasaAuroraWifi();
      setWifiVerified(res.verified);
      setWifiMessage(res.message);
    } catch {
      setWifiVerified(false);
      setWifiMessage('Non connesso al Wi-Fi Casa_Aurora');
    } finally {
      setWifiChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runWifiCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const guestFullName = pass ? `${pass.guestName} ${pass.guestSurname}`.trim() : 'Ospite Aurora';

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // Safe ignore
      }
    }
  };

  const handleOpenDoor = async () => {
    if (!wifiVerified) {
      setOpeningState('error');
      setStatusMessage('Accesso negato: Devi essere connesso al Wi-Fi di casa (Casa_Aurora).');
      return;
    }

    setOpeningState('opening');
    setStatusMessage('Invio comando a Home Assistant...');

    try {
      const res = await fetch('/api/hass/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest: guestFullName,
          source: 'Pulsante Ospite VIP (Wi-Fi Casa_Aurora Verificato)',
          wifiConnected: true,
          wifiSsid: 'Casa_Aurora',
          guestToken: pass?.token
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic();
        setOpeningState('success');
        setStatusMessage(data.message || 'Portone sbloccato. Spingi la porta per entrare.');
        setTimeout(() => {
          setOpeningState('idle');
          setStatusMessage('');
        }, 5000);
      } else {
        throw new Error(data.error || 'Impossibile completare lo sblocco');
      }
    } catch (err: any) {
      setOpeningState('error');
      setStatusMessage(err.message || 'Errore di connessione. Riprova.');
      setTimeout(() => {
        setOpeningState('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fade-in font-sans">
      <div className="relative w-full max-w-sm rounded-[2.25rem] bg-gradient-to-b from-[#1c1c1e] to-[#121214] border border-white/[0.1] text-neutral-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden">
        
        {/* Subtle Ambient Apple Light */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Apple Sheet Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] text-white flex items-center justify-center border border-white/10">
              <Unlock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white tracking-tight">
                Home Key Digitale
              </h3>
              <p className="text-[11px] text-neutral-400 font-normal">
                Appartamento Aurora • Morbegno
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-neutral-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-white/[0.06]"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* Guest Identity & System State */}
          <div className="flex justify-between items-center px-1">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-neutral-400 block font-mono">
                Ospite Registrato
              </span>
              <span className="text-sm font-semibold text-white tracking-tight">
                {guestFullName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-neutral-300 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>Attivo</span>
            </div>
          </div>

          {/* Wi-Fi Verification Badge */}
          <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
            wifiChecking 
              ? 'bg-neutral-800/40 border-white/10 text-neutral-300'
              : wifiVerified 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                wifiChecking
                  ? 'bg-white/10 text-neutral-300'
                  : wifiVerified 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {wifiChecking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wifi className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase font-bold block opacity-75">
                  {wifiChecking ? 'Verifica Wi-Fi...' : wifiVerified ? 'Rete Casa_Aurora' : 'Rete richiesta'}
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {wifiChecking ? 'Rilevamento in corso' : wifiVerified ? 'Connesso a Casa_Aurora' : 'Collegati a Casa_Aurora'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={runWifiCheck}
              disabled={wifiChecking}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
              title="Riprova rilevamento Wi-Fi"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${wifiChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Apple Action Button Card */}
          <div className="pt-2 pb-2">
            <button
              onClick={handleOpenDoor}
              disabled={openingState === 'opening' || wifiChecking || !wifiVerified}
              className={`group relative w-full py-5 px-5 rounded-2xl font-bold tracking-tight transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 select-none active:scale-[0.98] ${
                openingState === 'opening'
                  ? 'bg-neutral-800 text-neutral-300 border border-white/10 cursor-wait shadow-inner'
                  : openingState === 'success'
                  ? 'bg-[#30d158] text-neutral-950 shadow-[0_8px_25px_rgba(48,209,88,0.4)]'
                  : openingState === 'error'
                  ? 'bg-rose-500 text-white shadow-[0_8px_25px_rgba(244,63,94,0.3)]'
                  : wifiVerified
                  ? 'bg-white text-neutral-950 hover:bg-neutral-100 shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_35px_rgba(255,255,255,0.22)]'
                  : 'bg-neutral-800/80 text-neutral-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              {openingState === 'opening' && (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                  <span className="text-sm font-semibold text-neutral-300">Apertura in corso...</span>
                </>
              )}

              {openingState === 'success' && (
                <>
                  <CheckCircle2 className="w-7 h-7 text-neutral-950 animate-scale-up" />
                  <span className="text-base font-bold text-neutral-950 tracking-tight">Portone Aperto!</span>
                  <span className="text-xs font-normal text-neutral-900">Spingi la porta per entrare</span>
                </>
              )}

              {openingState === 'error' && (
                <>
                  <AlertCircle className="w-6 h-6 text-white" />
                  <span className="text-sm font-semibold text-white">Errore connessione</span>
                  <span className="text-xs text-white/90">Tocca per riprovare</span>
                </>
              )}

              {openingState === 'idle' && (
                <>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 ${
                    wifiVerified ? 'bg-neutral-950/10 text-neutral-950 group-hover:scale-110' : 'bg-white/5 text-neutral-500'
                  }`}>
                    {wifiVerified ? <Unlock className="w-5 h-5 text-neutral-950" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <span className={`text-lg font-bold tracking-tight ${wifiVerified ? 'text-neutral-950' : 'text-neutral-400'}`}>
                    {wifiVerified ? 'APRI PORTONE' : 'RICHIEDE WI-FI'}
                  </span>
                  <span className={`text-[11px] font-normal tracking-tight ${wifiVerified ? 'text-neutral-700' : 'text-neutral-500'}`}>
                    {wifiVerified ? 'Tocca per azionare la serratura' : 'Connettiti a Casa_Aurora'}
                  </span>
                </>
              )}
            </button>

            {/* Status Feedback Output */}
            {statusMessage && (
              <p className="mt-3 text-center text-xs font-medium text-emerald-400 tracking-tight animate-fade-in">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Minimalist Inset Note */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              All'interno troverai anche il mazzo di chiavi tradizionali.
            </span>
          </div>

        </div>

        {/* Apple Footer Button */}
        <div className="px-6 py-3.5 bg-neutral-950/40 border-t border-white/[0.06] text-center">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white transition-colors font-medium cursor-pointer"
          >
            Chiudi finestra
          </button>
        </div>

      </div>
    </div>
  );
};

