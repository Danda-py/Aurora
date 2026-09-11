import React, { useState, useEffect } from 'react';
import { Language, GuestPass } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
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
  const { getPageData } = useCms();
  const cmsCheckIn = getPageData('checkIn') || {};
  const c = { ...BOOK_DATA[language].checkIn, ...cmsCheckIn };

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
      setWifiMessage('Non sei connesso alla rete Wi-Fi Casa_Aurora.');
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

  const wifiMessages = {
    it: {
      requiredNotice: 'Rete richiesta: Casa_Aurora',
      explain: "L'apriporta funziona esclusivamente quando sei collegato al Wi-Fi dell'appartamento.",
      notConnectedError: "Accesso negato: Devi essere connesso alla rete Wi-Fi di casa (Casa_Aurora) per azionare l'apriporta.",
      copyPwd: 'Copia password Wi-Fi',
      verifying: 'Verifica Wi-Fi Casa_Aurora in corso...',
      verifiedLabel: 'Wi-Fi Casa_Aurora Rilevato',
      rescanBtn: 'Riprova Rilevamento',
      openBtn: 'APRI PORTA',
      wifiRequiredBtn: 'Connettiti a Casa_Aurora per Aprire'
    },
    en: {
      requiredNotice: 'Required Network: Casa_Aurora',
      explain: 'Door opener works exclusively when connected to the apartment Wi-Fi.',
      notConnectedError: 'Access denied: You must be connected to the home Wi-Fi network (Casa_Aurora) to open the door.',
      copyPwd: 'Copy Wi-Fi password',
      verifying: 'Checking Casa_Aurora Wi-Fi connection...',
      verifiedLabel: 'Casa_Aurora Wi-Fi Verified',
      rescanBtn: 'Retry Scan',
      openBtn: 'OPEN DOOR',
      wifiRequiredBtn: 'Connect to Casa_Aurora to Open'
    },
    de: {
      requiredNotice: 'Erforderliches Netzwerk: Casa_Aurora',
      explain: 'Der Türöffner funktioniert ausschließlich, wenn Sie mit dem Wohnungs-WLAN verbunden sind.',
      notConnectedError: 'Zugriff verweigert: Sie müssen mit dem Haus-WLAN (Casa_Aurora) verbunden sein, um die Tür zu öffnen.',
      copyPwd: 'WLAN-Passwort kopieren',
      verifying: 'Überprüfung des Casa_Aurora WLANs...',
      verifiedLabel: 'Casa_Aurora WLAN Bestätigt',
      rescanBtn: 'Erneut prüfen',
      openBtn: 'TÜR ÖFFNEN',
      wifiRequiredBtn: 'Mit Casa_Aurora verbinden zum Öffnen'
    },
    fr: {
      requiredNotice: 'Réseau requis : Casa_Aurora',
      explain: "L'ouverture de porte fonctionne exclusivement lorsque vous êtes connecté au Wi-Fi de l'appartement.",
      notConnectedError: "Accès refusé : Vous devez être connecté au réseau Wi-Fi de la maison (Casa_Aurora) pour ouvrir la porte.",
      copyPwd: 'Copier mot de passe Wi-Fi',
      verifying: 'Vérification du Wi-Fi Casa_Aurora...',
      verifiedLabel: 'Wi-Fi Casa_Aurora Vérifié',
      rescanBtn: 'Réessayer',
      openBtn: 'OUVRIR LA PORTE',
      wifiRequiredBtn: 'Connectez-vous à Casa_Aurora pour ouvrir'
    },
    es: {
      requiredNotice: 'Red requerida: Casa_Aurora',
      explain: 'La apertura de la puerta funciona exclusivamente conectado al Wi-Fi del apartamento.',
      notConnectedError: 'Acceso denegado: Debes estar conectado a la red Wi-Fi de casa (Casa_Aurora) para abrir la puerta.',
      copyPwd: 'Copiar contraseña Wi-Fi',
      verifying: 'Verificando red Wi-Fi Casa_Aurora...',
      verifiedLabel: 'Wi-Fi Casa_Aurora Verificado',
      rescanBtn: 'Reintentar',
      openBtn: 'ABRIR PUERTA',
      wifiRequiredBtn: 'Conéctate a Casa_Aurora para abrir'
    }
  }[language] || {
    requiredNotice: 'Rete richiesta: Casa_Aurora',
    explain: "L'apriporta funziona esclusivamente quando sei collegato al Wi-Fi dell'appartamento.",
    notConnectedError: "Accesso negato: Devi essere connesso alla rete Wi-Fi di casa (Casa_Aurora) per azionare l'apriporta.",
    copyPwd: 'Copia password Wi-Fi',
    verifying: 'Verifica Wi-Fi Casa_Aurora in corso...',
    verifiedLabel: 'Wi-Fi Casa_Aurora Rilevato',
    rescanBtn: 'Riprova Rilevamento',
    openBtn: 'APRI PORTA',
    wifiRequiredBtn: 'Connettiti a Casa_Aurora per Aprire'
  };

  const handleOpenDoor = async () => {
    const wifiCheck = await checkCasaAuroraWifi();
    setWifiVerified(wifiCheck.verified);
    setWifiMessage(wifiCheck.message);

    if (!wifiCheck.verified) {
      setOpeningState('error');
      setStatusMessage(wifiMessages.notConnectedError);
      return;
    }

    setOpeningState('opening');
    setStatusMessage(language === 'it' ? 'Invio comando di sblocco a Home Assistant...' : 'Sending unlock command to Home Assistant...');

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
        setStatusMessage(data.message || (language === 'it' ? 'Portone sbloccato! Spingi la porta per entrare.' : 'Door unlocked! Push the door to enter.'));
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

  const whatsappArrivalMessage = {
    it: `Ciao Nino, siamo in viaggio verso Aurora in Valtellina! Il nostro arrivo stimato è per le ore...`,
    en: `Hello Nino, we are on our way to Aurora in Valtellina! Our estimated arrival time is...`,
    fr: `Bonjour Nino, nous sommes en route vers Aurora in Valtellina ! Heure estimée d'arrivée...`,
    es: `¡Hola Nino, estamos de camino a Aurora in Valtellina! Nuestra hora estimada de llegada es...`,
    de: `Hallo Nino, wir sind auf dem Weg zu Aurora in Valtellina! Voraussichtliche Ankunft um...`
  }[language];

  const cleanBadge = (c.badge || '').replace(/:+/g, '').trim();

  const arrivalButtonLabel = {
    it: "Comunica Orario di Arrivo su WhatsApp",
    en: "Share Arrival Time on WhatsApp",
    fr: "Indiquer l'Heure d'Arrivée sur WhatsApp",
    es: "Compartir Hora de Llegada por WhatsApp",
    de: "Ankunftszeit per WhatsApp Senden"
  }[language];

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Sleek Apple-inspired Navigation Header */}
        <PageHeader
          title={c.title}
          category="Accesso Casa"
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

        {/* HERO COMPONENT: Apple Home Key / Action Card */}
        <div className="aurora-glass-card p-5 sm:p-7 space-y-5">
          
          {/* Ambient Mint Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#62e6bd]/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 space-y-5">
            {/* Card Eyebrow & Status Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="aurora-eyebrow">
                  Accesso Smart Home
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Portoncino d'Ingresso
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
                  {openingState === 'opening' ? 'Connessione...' : openingState === 'success' ? 'Aperto' : 'Pronto'}
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
                        ? 'Verifica Connessione' 
                        : wifiVerified 
                        ? 'Wi-Fi Casa_Aurora Verificato' 
                        : wifiMessages.requiredNotice}
                    </span>
                    <p className="text-xs font-semibold truncate text-white">
                      {wifiChecking 
                        ? wifiMessages.verifying 
                        : wifiVerified 
                        ? 'Rete autorizzata per apertura sicura' 
                        : 'Collegati alla rete "Casa_Aurora"'}
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
                  title="Rileva nuovamente la connessione Wi-Fi"
                >
                  {wifiChecking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifica...</span>
                    </>
                  ) : wifiVerified ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Connesso</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{wifiMessages.rescanBtn}</span>
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
                    Password Wi-Fi: <span className="font-mono text-white font-bold">{APARTMENT_INFO.wifiPassword}</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyWifiPassword}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedWifiPass ? 'Copiata!' : wifiMessages.copyPwd}</span>
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
                    <span className="text-base font-semibold text-white">Apertura in corso...</span>
                  </>
                ) : openingState === 'success' ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-[#07110d]" />
                    <span className="text-base font-bold text-[#07110d] tracking-tight">Porta Sbloccata!</span>
                  </>
                ) : openingState === 'error' ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-white" />
                    <span className="text-base font-bold text-white">Riprova Apertura</span>
                  </>
                ) : wifiChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                    <span className="text-base font-semibold text-white/50">Verifica Wi-Fi...</span>
                  </>
                ) : wifiVerified ? (
                  <>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#07110d]/10 text-[#07110d] group-hover:scale-110 transition-transform duration-200">
                      <Unlock className="w-4 h-4" />
                    </div>
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#07110d]">
                      {wifiMessages.openBtn}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/30">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold tracking-tight text-white/40">
                      {wifiMessages.wifiRequiredBtn}
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
                    Tocca il pulsante per azionare l'elettroserratura all'arrivo
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: In-Person Welcome & Keys */}
        <div className="aurora-glass-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="aurora-icon-box">
              <HandHeart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
                {c.houseAccessTitle}
              </h4>
              <p className="text-xs text-white/60">
                Accoglienza calorosa di persona dal vostro host
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
                Consegna chiavi tradizionali e breve introduzione alla casa.
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
              href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(whatsappArrivalMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14] text-white font-bold text-xs flex items-center justify-between border border-white/[0.08] transition shadow-sm"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#62e6bd]" />
                <span className="tracking-tight">{arrivalButtonLabel}</span>
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
                Posto auto riservato in cortile
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

