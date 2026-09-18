import React, { useState, useEffect, useRef } from 'react';
import { GuestPass, Language } from '../../types';
import { X, CheckCircle2, Unlock, Loader2, AlertCircle, Wifi, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import { checkCasaAuroraWifi } from '../../services/wifiDetectionService';
import { isDigitalKeyActive } from '../../services/guestPassService';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pass: GuestPass | null;
  language?: Language;
}

export const SmartLockModal: React.FC<Props> = ({ isOpen, onClose, pass, language = 'it' }) => {
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const s = t.smartLock;
  // Keys require BOTH documents submitted AND host confirmation - not confirmation alone.
  const keysReady = isDigitalKeyActive(pass);

  const [openingState, setOpeningState] = useState<'idle' | 'opening' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [wifiChecking, setWifiChecking] = useState<boolean>(true);
  const [wifiVerified, setWifiVerified] = useState<boolean>(false);
  const [wifiMessage, setWifiMessage] = useState<string>('');
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartedAt = useRef(0);

  const runWifiCheck = async () => {
    setWifiChecking(true);
    try {
      const res = await checkCasaAuroraWifi();
      setWifiVerified(res.verified);
      setWifiMessage(res.message);
    } catch {
      setWifiVerified(false);
      setWifiMessage(t.checkInPage.wifi.notConnectedError);
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
    const wifiCheck = await checkCasaAuroraWifi();
    setWifiVerified(wifiCheck.verified);
    setWifiMessage(wifiCheck.message);

    setOpeningState('opening');
    if ('vibrate' in navigator) navigator.vibrate([18, 35, 18]);
    if (!wifiCheck.verified) {
      setStatusMessage(language === 'it' ? "Wi-Fi non rilevato. Invio tramite rete mobile..." : "Wi-Fi not detected. Unlocking via mobile network fallback...");
    } else {
      setStatusMessage(t.concierge.doorMessage.sending);
    }

    try {
      const res = await fetch('/api/hass/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest: guestFullName,
          source: wifiCheck.verified 
            ? (wifiCheck.method === 'gps' ? `Pulsante Ospite VIP (GPS ${wifiCheck.distanceMeters}m)` : 'Pulsante Ospite VIP (Wi-Fi Verificato)') 
            : 'Pulsante Ospite VIP (Rete Mobile Backup)',
          wifiConnected: wifiCheck.verified,
          wifiSsid: 'Casa_Aurora',
          guestToken: pass?.token,
          coords: wifiCheck.coords,
          latitude: wifiCheck.coords?.latitude,
          longitude: wifiCheck.coords?.longitude,
          accuracy: wifiCheck.coords?.accuracy
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if ('vibrate' in navigator) navigator.vibrate([45, 35, 45, 35, 120]);
        triggerHaptic();
        setOpeningState('success');
        setStatusMessage(data.message || t.concierge.doorMessage.unlocked);
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

  const cancelHold = (event?: React.PointerEvent<HTMLButtonElement>) => {
    if (event && event.currentTarget && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
    holdStartedAt.current = 0;
    setHoldProgress(0);
  };

  const startHold = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (openingState !== 'idle' || wifiChecking) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    holdStartedAt.current = Date.now();
    holdTimer.current = setInterval(() => {
      const progress = Math.min(1, (Date.now() - holdStartedAt.current) / 1500);
      setHoldProgress(progress);
      if (progress >= 1) {
        cancelHold();
        void handleOpenDoor();
      }
    }, 30);
  };

  useEffect(() => cancelHold, []);

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
                {s.title}
              </h3>
              <p className="text-[11px] text-neutral-400 font-normal">
                {s.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-neutral-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-white/[0.06]"
            aria-label={t.concierge.close}
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
                {s.registeredGuest}
              </span>
              <span className="text-sm font-semibold text-white tracking-tight">
                {guestFullName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-neutral-300 text-[11px] font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${
                pass && !keysReady 
                  ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse' 
                  : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
              }`} />
              <span>{pass && !keysReady ? t.checkInPage.pendingHostConfirmation : s.activeStatus}</span>
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
                  {wifiChecking ? s.checkingWifi : wifiVerified ? s.casaAuroraNetwork : s.requiredNetwork}
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {wifiChecking ? s.checkingInProgress : wifiVerified ? s.connectedToCasaAurora : s.connectToCasaAurora}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={runWifiCheck}
              disabled={wifiChecking}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
              title={s.rescanTitle}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${wifiChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Apple Action Button Card */}
          <div className="pt-2 pb-2">
            <button
              onPointerDown={pass && !keysReady ? undefined : startHold}
              onPointerUp={pass && !keysReady ? undefined : cancelHold}
              onPointerCancel={pass && !keysReady ? undefined : cancelHold}
              onPointerLeave={pass && !keysReady ? undefined : cancelHold}
              onPointerMove={(event) => {
                if (pass && !keysReady) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const inside =
                  event.clientX >= rect.left &&
                  event.clientX <= rect.right &&
                  event.clientY >= rect.top &&
                  event.clientY <= rect.bottom;
                if (!inside) cancelHold(event);
              }}
              disabled={openingState === 'opening' || wifiChecking || (pass !== null && !keysReady)}
              className={`group relative w-full py-5 px-5 rounded-2xl font-bold tracking-tight transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 select-none active:scale-[0.98] ${
                pass && !keysReady
                  ? 'bg-white/[0.04] text-white/30 border border-white/5 cursor-not-allowed'
                  : openingState === 'opening'
                  ? 'bg-neutral-800 text-neutral-300 border border-white/10 cursor-wait shadow-inner'
                  : openingState === 'success'
                  ? 'bg-[#30d158] text-neutral-950 shadow-[0_8px_25px_rgba(48,209,88,0.4)]'
                  : openingState === 'error'
                  ? 'bg-rose-500 text-white shadow-[0_8px_25px_rgba(244,63,94,0.3)]'
                  : !wifiChecking
                  ? 'bg-white text-neutral-950 hover:bg-neutral-100 shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_35px_rgba(255,255,255,0.22)]'
                  : 'bg-neutral-800/80 text-neutral-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              {pass && !keysReady ? (
                <>
                  <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-white/5 text-neutral-500">
                    <Lock className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-base font-bold tracking-tight text-white/40 uppercase">
                    {t.checkInPage.pendingHostConfirmation}
                  </span>
                  <span className="text-[11px] font-normal tracking-tight text-neutral-400 text-center px-4 leading-normal">
                    {t.checkInPage.pendingHostConfirmationDesc}
                  </span>
                </>
              ) : (
                <>
                  {openingState === 'opening' && (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                      <span className="text-sm font-semibold text-neutral-300">{s.openingInProgress}</span>
                    </>
                  )}

                  {openingState === 'success' && (
                    <>
                      <CheckCircle2 className="w-7 h-7 text-neutral-950 animate-scale-up" />
                      <span className="text-base font-bold text-neutral-950 tracking-tight">{s.doorUnlocked}</span>
                      <span className="text-xs font-normal text-neutral-900">{s.pushDoorToEnter}</span>
                    </>
                  )}

                  {openingState === 'error' && (
                    <>
                      <AlertCircle className="w-6 h-6 text-white" />
                      <span className="text-sm font-semibold text-white">{s.connectionError}</span>
                      <span className="text-xs text-white/90">{s.tapToRetry}</span>
                    </>
                  )}

                  {openingState === 'idle' && (
                    <>
                      <div className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 ${
                        wifiVerified ? 'bg-neutral-950/10 text-neutral-950 group-hover:scale-110' : 'bg-white/5 text-neutral-500'
                      }`}>
                        <span className="absolute inset-[-5px] rounded-full border-2 border-emerald-300/70" style={{ clipPath: `inset(${100 - holdProgress * 100}% 0 0 0)` }} />
                        {wifiVerified ? <Unlock className="w-5 h-5 text-neutral-950" /> : <Lock className="w-5 h-5" />}
                      </div>
                      <span className={`text-lg font-bold tracking-tight ${wifiVerified ? 'text-neutral-950' : 'text-neutral-400'}`}>
                        {wifiChecking ? t.checkInPage.wifi.checkingConnection.toUpperCase() : s.pressToOpen}
                      </span>
                      <span className={`text-[11px] font-normal tracking-tight ${wifiVerified ? 'text-neutral-700' : 'text-neutral-500'}`}>
                        {wifiChecking ? s.waitAMoment : s.verifiedByServer}
                      </span>
                    </>
                  )}
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
              {s.physicalKeyNotice}
            </span>
          </div>

        </div>

        {/* Apple Footer Button */}
        <div className="px-6 py-3.5 bg-neutral-950/40 border-t border-white/[0.06] text-center">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white transition-colors font-medium cursor-pointer"
          >
            {s.closeWindow}
          </button>
        </div>

      </div>
    </div>
  );
};
