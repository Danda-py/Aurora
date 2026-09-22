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
import { DocumentUploadForm } from '../../vip/DocumentUploadForm';
import { trackActivity } from '../../../services/activityTrackingService';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
  pass?: GuestPass | null;
  onOpenSmartLock?: () => void;
  onUpdatePass?: (pass: GuestPass) => void;
}

export const CheckinPage: React.FC<Props> = ({ 
  language, 
  onBackToMenu, 
  onSelectLanguage,
  pass,
  onUpdatePass
}) => {
  const [isEditingDocs, setIsEditingDocs] = useState(false);
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

    setOpeningState('opening');
    if (!wifiCheck.verified) {
      setStatusMessage(language === 'it' ? "Wi-Fi non rilevato. Invio comando tramite rete mobile..." : "Wi-Fi not detected. Unlocking via mobile network fallback...");
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
            ? (wifiCheck.method === 'gps' ? `Check-in App (GPS ${wifiCheck.distanceMeters}m)` : 'Check-in App (Wi-Fi Verificato)') 
            : 'Check-in App (Rete Mobile Backup)',
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
        triggerHaptic();
        setOpeningState('success');
        setStatusMessage(t.concierge.doorMessage.unlocked);
        trackActivity(pass, 'smart_lock_open_success');
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
      trackActivity(pass, 'smart_lock_open_error', err?.message);
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
          pass.documentsUploaded && !isEditingDocs ? (
            <div className="aurora-glass-card p-4 sm:p-5 space-y-3.5">
          
          {/* Ambient Mint or Amber Glow */}
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 blur-3xl pointer-events-none rounded-full ${
            pass.checkInConfirmed ? 'bg-[#62e6bd]/10' : 'bg-amber-500/10'
          }`} />

          <div className="relative z-10 space-y-3.5">
            {/* Card Eyebrow & Status Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="aurora-eyebrow">
                  {t.checkInPage.smartHomeAccess}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {t.checkInPage.frontDoor}
                </h3>
              </div>

              {/* Apple Home-style live status capsule */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-md">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  !pass.checkInConfirmed
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse'
                    : openingState === 'opening'
                    ? 'bg-sky-400 animate-ping'
                    : openingState === 'success'
                    ? 'bg-[#62e6bd]'
                    : openingState === 'error'
                    ? 'bg-rose-500'
                    : 'bg-[#62e6bd] shadow-[0_0_8px_rgba(98,230,189,0.6)]'
                }`} />
                <span className="text-[11px] font-semibold text-white/80 tracking-tight">
                  {!pass.checkInConfirmed
                    ? t.checkInPage.pendingHostConfirmation
                    : openingState === 'opening'
                    ? t.concierge.doorOpeningState.opening
                    : openingState === 'success'
                    ? t.concierge.doorOpeningState.success
                    : t.checkInPage.wifi.connected}
                </span>
              </div>
            </div>

            {!pass.checkInConfirmed ? (
              /* Pending Confirmation warning block */
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-amber-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      {t.checkInPage.pendingHostConfirmation}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsEditingDocs(true)} 
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-[11px] font-bold transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    {language === 'it' ? 'Modifica Documenti' : 'Edit Documents'}
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-white/80 font-normal">
                  {t.checkInPage.pendingHostConfirmationDesc}
                </p>
              </div>
            ) : (
              /* Real Wi-Fi Security Verification Badge for Casa_Aurora */
              <div className={`p-3 rounded-xl border transition-all duration-200 ${
                wifiChecking
                  ? 'bg-white/[0.04] border-white/10 text-white/80'
                  : wifiVerified 
                  ? 'bg-[#62e6bd]/10 border-[#62e6bd]/30 text-[#9ef2d3]' 
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              }`}>
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      wifiChecking
                        ? 'bg-white/10 text-white'
                        : wifiVerified 
                        ? 'bg-[#62e6bd]/20 text-[#62e6bd]' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {wifiChecking ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Wifi className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold tracking-wider block opacity-75 font-mono">
                        {wifiChecking 
                          ? wifiMsgs.checkingConnection 
                          : wifiVerified 
                          ? wifiMsgs.verifiedLabel 
                          : wifiMsgs.requiredNotice}
                      </span>
                      <p className="text-[11px] font-semibold truncate text-white">
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
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
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{wifiMsgs.checkingConnection}</span>
                      </>
                    ) : wifiVerified ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>{wifiMsgs.connected}</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        <span>{wifiMsgs.rescanBtn}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Diagnostic Message */}
                {wifiMessage && !wifiChecking && (
                  <p className={`mt-1.5 text-[11px] leading-relaxed ${
                    wifiVerified ? 'text-[#9ef2d3]' : 'text-amber-300'
                  }`}>
                    {wifiMessage}
                  </p>
                )}

                {!wifiVerified && !wifiChecking && (
                  <div className="mt-2 pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
                    <span className="text-white/80">
                      {t.checkInPage.wifi.copyPwd}: <span className="font-mono text-white font-bold">{APARTMENT_INFO.wifiPassword}</span>
                    </span>
                    <button
                      type="button"
                      onClick={copyWifiPassword}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedWifiPass ? wifiMsgs.copySuccess : wifiMsgs.copyPwd}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Apple-Grade Compact Horizontal Action Button */}
            <div>
              <button
                id="btn-open-door-checkin"
                type="button"
                onClick={handleOpenDoor}
                disabled={!pass.checkInConfirmed || openingState === 'opening' || wifiChecking || !wifiVerified}
                className={`group relative w-full overflow-hidden rounded-xl py-3 px-4 font-semibold tracking-tight transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 select-none active:scale-[0.98] ${
                  !pass.checkInConfirmed
                    ? 'bg-white/[0.04] text-white/30 border border-white/5 cursor-not-allowed'
                    : openingState === 'opening'
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
                {!pass.checkInConfirmed ? (
                  <>
                    <Lock className="w-4 h-4 text-white/30" />
                    <span className="text-xs sm:text-sm font-semibold text-white/40">{t.checkInPage.pendingHostConfirmation}</span>
                  </>
                ) : openingState === 'opening' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="text-xs sm:text-sm font-semibold text-white">{t.concierge.doorOpeningState.opening}</span>
                  </>
                ) : openingState === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#07110d]" />
                    <span className="text-xs sm:text-sm font-bold text-[#07110d] tracking-tight">{t.concierge.doorOpeningState.success}</span>
                  </>
                ) : openingState === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-white" />
                    <span className="text-xs sm:text-sm font-bold text-white">{t.concierge.doorOpeningState.error}</span>
                  </>
                ) : wifiChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                    <span className="text-xs sm:text-sm font-semibold text-white/50">{wifiMsgs.verifying}</span>
                  </>
                ) : wifiVerified ? (
                  <>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#07110d]/10 text-[#07110d] group-hover:scale-110 transition-transform duration-200">
                      <Unlock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-[#07110d]">
                      {wifiMsgs.openBtn}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 text-white/30">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold tracking-tight text-white/40">
                      {wifiMsgs.wifiRequiredBtn}
                    </span>
                  </>
                )}
              </button>

              {/* Status Output */}
              <div className="mt-2 text-center min-h-[16px]">
                {statusMessage ? (
                  <p className="text-[11px] font-semibold text-[#62e6bd] tracking-tight">
                    {statusMessage}
                  </p>
                ) : (
                  <p className="text-[11px] text-white/50 font-normal tracking-tight">
                    {!pass.checkInConfirmed ? t.checkInPage.pendingHostConfirmationDesc : wifiMsgs.pressToUnlockNotice}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
          ) : (
            <DocumentUploadForm
              pass={pass}
              language={language}
              onSaveSuccess={(updatedPass) => {
                setIsEditingDocs(false);
                if (onUpdatePass) {
                  onUpdatePass(updatedPass);
                }
              }}
              onCancel={() => setIsEditingDocs(false)}
            />
          )
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

          <div className="pt-1.5">
            <a
              href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(t.checkInPage.whatsappArrivalMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14] text-white font-medium text-xs flex items-center justify-between border border-white/[0.08] transition shadow-xs"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#62e6bd]" />
                <span className="tracking-tight">{t.checkInPage.shareArrivalBtn}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
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
