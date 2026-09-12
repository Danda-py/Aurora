import React, { useState, useEffect } from 'react';
import { Language, GuestPass } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { useCms } from '../../../context/CmsContext';
import { 
  Unlock, 
  Car, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  HandHeart, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Wifi,
  Copy,
  Check,
  RotateCcw,
  Lock
} from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';
import { checkCasaAuroraWifi } from '../../../services/wifiDetectionService';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
  pass?: GuestPass | null;
  onOpenSmartLock?: () => void;
}

export const CheckinPage: React.FC<Props> = ({ 
  language, 
  onBackToMenu, 
  onSelectLanguage,
  pass
}) => {
  const { getPageData, media } = useCms();
  const cmsCheckIn = getPageData('checkIn') || {};
  const c = { ...BOOK_DATA[language].checkIn, ...cmsCheckIn };
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const wifiMsgs = t.checkInPage.wifi;

  const [openingState, setOpeningState] = useState<'idle' | 'opening' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Real Wi-Fi Network Detection State
  const [wifiChecking, setWifiChecking] = useState<boolean>(true);
  const [wifiVerified, setWifiVerified] = useState<boolean>(false);
  const [wifiMessage, setWifiMessage] = useState<string>('');
  const [copiedWifiPass, setCopiedWifiPass] = useState(false);

  const guestFullName = pass ? `${pass.guestName} ${pass.guestSurname}`.trim() : 'Ospite';

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // Safe ignore
      }
    }
  };

  const runWifiVerification = async () => {
    setWifiChecking(true);
    setStatusMessage('');
    try {
      const result = await checkCasaAuroraWifi();
      setWifiVerified(result.verified);
      setWifiMessage(result.message);
    } catch {
      setWifiVerified(false);
      setWifiMessage(wifiMsgs.notConnectedError);
    } finally {
      setWifiChecking(false);
    }
  };

  useEffect(() => {
    runWifiVerification();
  }, []);

  const copyWifiPassword = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(APARTMENT_INFO.wifiPassword);
      setCopiedWifiPass(true);
      setTimeout(() => setCopiedWifiPass(false), 2000);
    }
  };

  const handleOpenDoor = async () => {
    const wifiCheck = await checkCasaAuroraWifi();
    setWifiVerified(wifiCheck.verified);
    setWifiMessage(wifiCheck.message);

    if (!wifiCheck.verified) {
      setOpeningState('error');
      setStatusMessage(wifiMsgs.notConnectedError);
      return;
    }

    setOpeningState('opening');
    setStatusMessage(t.concierge.doorMessage.sending);

    try {
      const res = await fetch('/api/hass/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest: guestFullName,
          source: 'Check-in App (Wi-Fi Casa_Aurora Verificato)',
          wifiConnected: wifiCheck.verified,
          wifiSsid: 'Casa_Aurora',
          guestToken: pass?.token
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerHaptic();
        setOpeningState('success');
        setStatusMessage(t.concierge.doorMessage.unlocked);
        setTimeout(() => {
          setOpeningState('idle');
          setStatusMessage('');
        }, 6000);
      } else {
        throw new Error(data.error || 'Impossibile completare lo sblocco');
      }
    } catch (err: any) {
      setOpeningState('error');
      setStatusMessage(err.message || 'Errore di comunicazione. Verifica che Home Assistant sia online.');
      setTimeout(() => {
        setOpeningState('idle');
      }, 6000);
    }
  };

  const cleanBadge = (c.badge || '').replace(/:+/g, '').trim();

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Sleek Apple-inspired Navigation Header */}
        <PageHeader
          title={c.title}
          category={t.tiles.checkIn}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Checkin Time Capsule */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-xs text-xs text-white/80 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#62e6bd]" />
            <span className="font-bold text-white tracking-tight">{cleanBadge}</span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="text-white/60 text-xs leading-snug">{c.timingNotice}</span>
          </div>
        </div>

        {/* HERO COMPONENT: Apple Home Key / Action Card (only for guests with pass) */}
        {pass ? (
        <div className="aurora-glass-card p-5 sm:p-7 space-y-5">
          
          {/* Ambient Mint Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#62e6bd]/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 space-y-5">
            {/* Card Eyebrow & Status Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="aurora-eyebrow">
                  {t.checkInPage.smartHomeAccess}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {t.checkInPage.frontDoor}
                </h3>
              </div>

              {/* Apple Home-style live status capsule */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  openingState === 'opening'
                    ? 'bg-sky-400 animate-ping'
                    : openingState === 'success'
                    ? 'bg-[#62e6bd]'
                    : openingState === 'error'
                    ? 'bg-rose-500'
                    : 'bg-[#62e6bd] shadow-[0_0_8px_rgba(98,230,189,0.6)]'
                }`} />
                <span className="text-xs font-semibold text-white/80 tracking-tight">
                  {openingState === 'opening' ? t.concierge.doorOpeningState.opening : openingState === 'success' ? t.concierge.doorOpeningState.success : t.checkInPage.wifi.connected}
                </span>
              </div>
            </div>

            {/* Real Wi-Fi Security Verification Badge for Casa_Aurora */}
            <div className={`p-4 rounded-2xl border transition-all duration-200 ${
              wifiChecking
                ? 'bg-white/[0.04] border-white/10 text-white/80'
                : wifiVerified 
                ? 'bg-[#62e6bd]/10 border-[#62e6bd]/30 text-[#9ef2d3]' 
                : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    wifiChecking
                      ? 'bg-white/10 text-white'
                      : wifiVerified 
                      ? 'bg-[#62e6bd]/20 text-[#62e6bd]' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {wifiChecking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Wifi className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75 font-mono">
                      {wifiChecking 
                        ? wifiMsgs.checkingConnection 
                        : wifiVerified 
                        ? wifiMsgs.verifiedLabel 
                        : wifiMsgs.requiredNotice}
                    </span>
                    <p className="text-xs font-semibold truncate text-white">
                      {wifiChecking 
                        ? wifiMsgs.verifying 
                        : wifiVerified 
                        ? t.checkInPage.authorizedNetwork 
                        : t.checkInPage.connectToNetwork}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runWifiVerification}
                  disabled={wifiChecking}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    wifiChecking
                      ? 'bg-white/10 text-white/50 cursor-wait'
                      : wifiVerified
                      ? 'bg-[#62e6bd]/20 text-[#9ef2d3] hover:bg-[#62e6bd]/30 border border-[#62e6bd]/30'
                      : 'bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-sm'
                  }`}
                  title={wifiMsgs.rescanBtn}
                >
                  {wifiChecking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{wifiMsgs.checkingConnection}</span>
                    </>
                  ) : wifiVerified ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{wifiMsgs.connected}</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{wifiMsgs.rescanBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Diagnostic Message */}
              {wifiMessage && !wifiChecking && (
                <p className={`mt-2 text-xs leading-relaxed ${
                  wifiVerified ? 'text-[#9ef2d3]' : 'text-amber-300'
                }`}>
                  {wifiMessage}
                </p>
              )}

              {!wifiVerified && !wifiChecking && (
                <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-white/80">
                    {t.checkInPage.wifi.copyPwd}: <span className="font-mono text-white font-bold">{APARTMENT_INFO.wifiPassword}</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyWifiPassword}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedWifiPass ? wifiMsgs.copySuccess : wifiMsgs.copyPwd}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Apple-Grade Tactile Action Button */}
            <div>
              <button
                id="btn-open-door-checkin"
                type="button"
                onClick={handleOpenDoor}
                disabled={openingState === 'opening' || wifiChecking || !wifiVerified}
                className={`group relative w-full overflow-hidden rounded-2xl py-4 sm:py-5 px-6 font-bold tracking-tight transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 select-none active:scale-[0.98] ${
                  openingState === 'opening'
                    ? 'bg-neutral-800 text-neutral-300 border border-white/10 cursor-wait shadow-inner'
                    : openingState === 'success'
                    ? 'bg-[#62e6bd] text-[#07110d] shadow-[0_8px_25px_rgba(98,230,189,0.4)]'
                    : openingState === 'error'
                    ? 'bg-rose-500 text-white shadow-[0_8px_25px_rgba(244,63,94,0.3)]'
                    : wifiVerified
                    ? 'bg-[#62e6bd] hover:bg-[#93f4d4] text-[#07110d] shadow-[0_10px_30px_rgba(98,230,189,0.25)] hover:shadow-[0_12px_35px_rgba(98,230,189,0.35)]'
                    : 'bg-white/[0.06] text-white/30 border border-white/5 cursor-not-allowed'
                }`}
              >
                {openingState === 'opening' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="text-base font-semibold text-white">{t.concierge.doorOpeningState.opening}</span>
                  </>
                ) : openingState === 'success' ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-[#07110d]" />
                    <span className="text-base font-bold text-[#07110d] tracking-tight">{t.concierge.doorOpeningState.success}</span>
                  </>
                ) : openingState === 'error' ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-white" />
                    <span className="text-base font-bold text-white">{t.concierge.doorOpeningState.error}</span>
                  </>
                ) : wifiChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                    <span className="text-base font-semibold text-white/50">{wifiMsgs.verifying}</span>
                  </>
                ) : wifiVerified ? (
                  <>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#07110d]/10 text-[#07110d] group-hover:scale-110 transition-transform duration-200">
                      <Unlock className="w-4 h-4" />
                    </div>
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#07110d]">
                      {wifiMsgs.openBtn}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/30">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold tracking-tight text-white/40">
                      {wifiMsgs.wifiRequiredBtn}
                    </span>
                  </>
                )}
              </button>

              {/* Status Output */}
              <div className="mt-3 text-center min-h-[20px]">
                {statusMessage ? (
                  <p className="text-xs font-semibold text-[#62e6bd] tracking-tight">
                    {statusMessage}
                  </p>
                ) : (
                  <p className="text-xs text-white/50 font-normal tracking-tight">
                    {wifiMsgs.pressToUnlockNotice}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="aurora-glass-card p-5 sm:p-6 flex items-start gap-3.5 border border-white/10 bg-white/[0.03]">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 text-amber-300">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {t.checkInPage.publicNoticeTitle}
              </h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {t.checkInPage.publicNoticeDesc}
              </p>
            </div>
          </div>
        )}

        {/* SECTION 2: In-Person Welcome & Keys */}
        <div className="aurora-glass-card space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#62e6bd]/40 ring-2 ring-[#62e6bd]/15 shadow-md shrink-0 bg-white/10">
              <img 
                src={media?.hostAvatar || '/uploads/host.jpg'} 
                alt="Nino" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/uploads/host.jpg'; }}
              />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
                {c.houseAccessTitle}
              </h4>
              <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                <HandHeart className="w-3.5 h-3.5 text-[#62e6bd]" />
                {t.checkInPage.inPersonWelcome}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] text-[#62e6bd] border border-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white tracking-tight">
                {c.keyboxCodeLabel}
              </div>
              <div className="text-xs text-white/60 leading-snug truncate">
                {t.checkInPage.keyIntroDesc}
              </div>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#62e6bd]/20 text-[#62e6bd] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                1
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                {c.step1}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#62e6bd]/20 text-[#62e6bd] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                2
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                {c.step2}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#62e6bd]/20 text-[#62e6bd] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                3
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                {c.step3}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(t.checkInPage.whatsappArrivalMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14] text-white font-bold text-xs flex items-center justify-between border border-white/[0.08] transition shadow-sm"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#62e6bd]" />
                <span className="tracking-tight">{t.checkInPage.shareArrivalBtn}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </a>
          </div>
        </div>

        {/* SECTION 3: Parcheggio Privato */}
        <div className="aurora-glass-card space-y-3">
          <div className="flex items-center gap-3">
            <div className="aurora-icon-box">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
                {c.parkingTitle}
              </h4>
              <span className="text-xs text-white/60">
                {t.checkInPage.reservedCourtyardParking}
              </span>
            </div>
          </div>

          <p className="text-xs text-white/75 leading-relaxed">
            {c.parkingDesc}
          </p>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#62e6bd] shrink-0 mt-0.5" />
            <span className="text-xs text-white/75 leading-relaxed font-normal">
              {c.parkingNote}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
