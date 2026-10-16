import React, { useState, useEffect, useRef } from 'react';
import { GuestPass, Language } from '../../types';
import { X, CheckCircle2, Unlock, Loader2, AlertCircle, Wifi, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import { checkCasaAuroraWifi } from '../../services/wifiDetectionService';
import { isDigitalKeyActive } from '../../services/guestPassService';
import { trackActivity } from '../../services/activityTrackingService';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';
import { useEditMode } from '../visual-cms/EditModeContext';
import { resolveDoorBannerCopy } from '../video_book/cmsPageHelpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pass: GuestPass | null;
  language?: Language;
}

export const SmartLockModal: React.FC<Props> = ({ isOpen, onClose, pass, language = 'it' }) => {
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const s = t.smartLock;
  const { texts: cmsTexts } = useEditMode();
  // Keys require BOTH documents submitted AND host confirmation - not confirmation alone.
  const keysReady = isDigitalKeyActive(pass);

  const [openingState, setOpeningState] = useState<'idle' | 'opening' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [doorBanner, setDoorBanner] = useState<{
    type: 'success' | 'error' | 'not_connected' | 'too_far' | 'hint';
    title: string;
    detail: string;
  } | null>(null);
  const [wifiChecking, setWifiChecking] = useState<boolean>(true);
  const [wifiVerified, setWifiVerified] = useState<boolean>(false);
  const [wifiMessage, setWifiMessage] = useState<string>('');
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartedAt = useRef(0);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDoorFeedbackBanner = (
    type: 'success' | 'error' | 'not_connected' | 'too_far' | 'hint',
    title: string,
    detail: string,
    durationMs = 2000
  ) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    const resolved = resolveDoorBannerCopy(cmsTexts, language, type, title, detail);
    setDoorBanner({ type, ...resolved });
    bannerTimerRef.current = setTimeout(() => {
      setDoorBanner(null);
    }, durationMs);
  };

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
    setOpeningState('opening');
    setStatusMessage(t.concierge.doorMessage.sending);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([18, 35, 18]);

    let wifiCheck: Awaited<ReturnType<typeof checkCasaAuroraWifi>>;
    try {
      wifiCheck = await checkCasaAuroraWifi();
      setWifiVerified(wifiCheck.verified);
      setWifiMessage(wifiCheck.message);
    } catch {
      wifiCheck = {
        verified: false,
        status: 'error',
        ssid: 'Casa_Aurora',
        reason: 'proximity_check_failed',
        message: language === 'it' ? 'Verifica connessione/posizione non riuscita.' : 'Could not verify network or location.',
      };
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
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([45, 35, 45, 35, 120]);
        triggerHaptic();
        setOpeningState('success');
        setStatusMessage(language === 'it' ? 'Richiesta inviata a Home Assistant.' : 'Request sent to Home Assistant.');
        showDoorFeedbackBanner(
          'success',
          language === 'it' ? 'Comando inviato' : 'Unlock command sent',
          language === 'it' ? 'Home Assistant ha accettato la richiesta. Se la porta non scatta, riprova o contatta l’host.' : 'Home Assistant accepted the request. If the door did not unlock, retry or contact your host.',
          2000
        );
        trackActivity(pass, 'smart_lock_open_success');
        setTimeout(() => {
          setOpeningState('idle');
          setStatusMessage('');
        }, 2500);
      } else {
        const errText = data.error || 'Impossibile completare lo sblocco';
        const proximity = data.proximity;
        const isTooFar =
          (typeof proximity?.distanceMeters === 'number' &&
            proximity.distanceMeters > (proximity.geofenceRadiusMeters ?? 65)) ||
          /troppo lontano|a \d+ metri|distanza/i.test(errText);
        const isNotConnected = Boolean(
          data.wifiBlocked || data.proximityBlocked ||
          /wifi|wi-fi|conness|prossimit|gps|posizione/i.test(errText)
        );
        setOpeningState('error');
        setStatusMessage(errText);
        showDoorFeedbackBanner(
          isTooFar ? 'too_far' : isNotConnected ? 'not_connected' : 'error',
          isTooFar
            ? language === 'it' ? 'Troppo lontano' : 'Too far away'
            : isNotConnected
            ? language === 'it' ? 'Non connesso al Wi-Fi' : 'Not connected to Wi-Fi'
            : language === 'it' ? 'Errore apertura porta' : 'Door unlock error',
          errText,
          2200
        );
        trackActivity(pass, 'smart_lock_open_error', errText);
        setTimeout(() => {
          setOpeningState('idle');
          setStatusMessage('');
        }, 2500);
      }
    } catch (err: any) {
      setOpeningState('error');
      const errMsg = err.message || 'Errore di connessione. Riprova.';
      setStatusMessage(errMsg);
      showDoorFeedbackBanner(
        'error',
        language === 'it' ? 'Errore di connessione' : 'Connection error',
        errMsg,
        2200
      );
      trackActivity(pass, 'smart_lock_open_error', err?.message);
      setTimeout(() => {
        setOpeningState('idle');
        setStatusMessage('');
      }, 2500);
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

  const HOLD_DURATION_MS = 1200;

  const cancelHoldEarly = (event?: React.PointerEvent<HTMLButtonElement>) => {
    const elapsed = holdStartedAt.current > 0 ? Date.now() - holdStartedAt.current : 0;
    if (elapsed >= HOLD_DURATION_MS) {
      finishHold(event);
      return;
    }
    cancelHold(event);
    if (elapsed > 0 && openingState === 'idle') {
      showDoorFeedbackBanner(
        'hint',
        language === 'it' ? 'Pressione non completata' : 'Hold not completed',
        language === 'it' ? 'Tieni premuto per 1,2 secondi senza sollevare il dito.' : 'Keep holding for 1.2 seconds without lifting your finger.',
        1800
      );
    }
  };

  const finishHold = (event?: React.PointerEvent<HTMLButtonElement>) => {
    const elapsed = holdStartedAt.current > 0 ? Date.now() - holdStartedAt.current : 0;
    if (!elapsed) return;
    cancelHold(event);
    if (elapsed >= HOLD_DURATION_MS && openingState === 'idle') {
      void handleOpenDoor();
    } else if (openingState === 'idle') {
      showDoorFeedbackBanner(
        'hint',
        language === 'it' ? 'Pressione non completata' : 'Hold not completed',
        language === 'it' ? 'Tieni premuto per 1,2 secondi senza sollevare il dito.' : 'Keep holding for 1.2 seconds without lifting your finger.',
        1800
      );
    }
  };

  const startHold = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (openingState !== 'idle' || (pass !== null && !keysReady) || holdStartedAt.current > 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    holdStartedAt.current = Date.now();
    holdTimer.current = setInterval(() => {
      const progress = Math.min(1, (Date.now() - holdStartedAt.current) / HOLD_DURATION_MS);
      setHoldProgress(progress);
      if (progress >= 1) finishHold();
    }, 25);
  };

  useEffect(() => cancelHold, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fade-in font-sans">
      {doorBanner && (
        <div
          className={`fixed top-4 left-4 right-4 z-[90] mx-auto max-w-[420px] flex items-center gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200 ${
            doorBanner.type === 'success'
              ? 'border-emerald-400/60 bg-emerald-950/95 text-emerald-100'
              : doorBanner.type === 'too_far' || doorBanner.type === 'not_connected'
              ? 'border-amber-400/60 bg-amber-950/95 text-amber-100'
              : doorBanner.type === 'hint'
              ? 'border-sky-400/60 bg-sky-950/95 text-sky-100'
              : 'border-rose-400/60 bg-rose-950/95 text-rose-100'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              doorBanner.type === 'success'
                ? 'bg-emerald-500 text-black'
                : doorBanner.type === 'too_far' || doorBanner.type === 'not_connected'
                ? 'bg-amber-500 text-black'
                : doorBanner.type === 'hint'
                ? 'bg-sky-500 text-black'
                : 'bg-rose-500 text-white'
            }`}
          >
            {doorBanner.type === 'success' ? (                  <CheckCircle2 className="h-6 w-6" />
            ) : doorBanner.type === 'hint' ? (
              <span className="text-lg font-black">!</span>
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm font-extrabold tracking-tight">
              {doorBanner.title}
            </strong>
            <span className="block text-xs opacity-90 leading-snug mt-0.5">
              {doorBanner.detail}
            </span>
          </div>
        </div>
      )}
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
              onPointerUp={pass && !keysReady ? undefined : finishHold}
              onPointerCancel={pass && !keysReady ? undefined : cancelHold}
              onPointerLeave={pass && !keysReady ? undefined : cancelHoldEarly}
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
              disabled={openingState === 'opening' || (pass !== null && !keysReady)}
              className={`group relative w-full py-3 px-4 rounded-xl font-bold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-3 select-none active:scale-[0.98] ${
                pass && !keysReady
                  ? 'bg-white/[0.04] text-white/30 border border-white/5 cursor-not-allowed'
                  : openingState === 'opening'
                  ? 'bg-neutral-800 text-neutral-300 border border-white/10 cursor-wait shadow-inner justify-center'
                  :                  openingState === 'success'
                  ? 'bg-[#30d158] text-neutral-950 shadow-[0_8px_25px_rgba(48,209,88,0.4)]'
                  : openingState === 'error'
                  ? 'bg-rose-500 text-white shadow-[0_8px_25px_rgba(244,63,94,0.3)]'
                  : 'bg-white text-neutral-950 hover:bg-neutral-100 shadow-[0_6px_20px_rgba(255,255,255,0.12)]'
              }`}
            >
              {pass && !keysReady ? (
                <>
                  <div className="relative w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-neutral-500 shrink-0">
                    <Lock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-xs font-bold tracking-tight text-white/50 block truncate">
                      {t.checkInPage.pendingHostConfirmation}
                    </span>
                    <span className="text-[10px] font-normal text-neutral-400 block truncate">
                      {t.checkInPage.pendingHostConfirmationDesc}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {openingState === 'opening' && (
                    <div className="flex items-center justify-center gap-2 w-full py-0.5">
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                      <span className="text-xs font-semibold text-neutral-300">{s.openingInProgress}</span>
                    </div>
                  )}

                  {openingState === 'success' && (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-neutral-950 animate-scale-up shrink-0" />
                      <div className="text-left min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-bold text-neutral-950 tracking-tight block truncate">{language === 'it' ? 'Comando inviato' : 'Command sent'}</span>
                      <span className="text-[10px] font-normal text-neutral-900 block truncate">{language === 'it' ? 'Controlla che la porta si sia sbloccata.' : 'Check that the door unlocked.'}</span>
                      </div>
                    </>
                  )}

                  {openingState === 'error' && (
                    <>
                      <AlertCircle className="w-5 h-5 text-white shrink-0" />
                      <div className="text-left min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-semibold text-white block truncate">{s.connectionError}</span>
                        <span className="text-[10px] text-white/90 block truncate">{s.tapToRetry}</span>
                      </div>
                    </>
                  )}

                  {openingState === 'idle' && (
                    <>
                      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        wifiVerified ? 'bg-neutral-950/10 text-neutral-950 group-hover:scale-105' : 'bg-white/5 text-neutral-500'
                      }`}>
                        <span className="absolute inset-[-3px] rounded-full border-2 border-emerald-400/80" style={{ clipPath: `inset(${100 - holdProgress * 100}% 0 0 0)` }} />
                        {wifiVerified ? <Unlock className="w-4 h-4 text-neutral-950" /> : <Unlock className="w-4 h-4 text-neutral-950" />}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <span className={`text-xs sm:text-sm font-bold tracking-tight block truncate ${wifiVerified ? 'text-neutral-950' : 'text-neutral-400'}`}>
                          {holdProgress > 0
                            ? language === 'it' ? `Tieni premuto… ${Math.ceil(holdProgress * 100)}%` : `Hold… ${Math.ceil(holdProgress * 100)}%`
                            : language === 'it' ? 'Tieni premuto 1,2 sec per aprire' : 'Hold for 1.2 sec to unlock'}
                        </span>
                        <span className={`text-[10px] font-normal tracking-tight block truncate ${wifiVerified ? 'text-neutral-700' : 'text-neutral-500'}`}>
                          {wifiMessage || (language === 'it' ? 'La connessione viene verificata al rilascio.' : 'Connection is verified on release.')}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </button>

            {/* Status Feedback Output */}
            {statusMessage && (
              <p role="status" aria-live="polite" className="mt-3 text-center text-xs font-medium text-emerald-400 tracking-tight animate-fade-in">
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
