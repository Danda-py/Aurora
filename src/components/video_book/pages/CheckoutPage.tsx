import React, { useState } from 'react';
import { Language, GuestPass } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { useCms } from '../../../context/CmsContext';
import { APARTMENT_INFO } from '../../../data/apartmentData';
import { Clock, CheckSquare, Square, Heart, Star, LogOut, CheckCircle } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
  pass?: GuestPass | null;
}

const CHECKOUT_BUTTON_TRANSLATIONS: Record<Language, {
  buttonText: string;
  loadingText: string;
  successText: string;
  errorText: string;
  subText: string;
}> = {
  it: {
    buttonText: "Esegui Check-out",
    loadingText: "Attivazione scenario...",
    successText: "Check-out effettuato!",
    errorText: "Errore durante il check-out",
    subText: "Cliccando qui confermerai la tua partenza e attiverai l'automazione domotica dello scenario di spegnimento (luci, elettrodomestici in standby, riscaldamento in modalità antigelo)."
  },
  en: {
    buttonText: "Perform Check-out",
    loadingText: "Activating scenario...",
    successText: "Check-out completed!",
    errorText: "Error during check-out",
    subText: "By clicking here you will confirm your departure and trigger the home automation scenario to turn off all lights, standby appliances, and set climate to frost protection."
  },
  de: {
    buttonText: "Check-out durchführen",
    loadingText: "Szenario wird aktiviert...",
    successText: "Check-out abgeschlossen!",
    errorText: "Fehler beim Check-out",
    subText: "Mit dem Klick bestätigen Sie Ihre Abreise und aktivieren das Smart-Home-Szenario zum Ausschalten aller Lichter, Standby-Geräte und Einstellen der Heizung auf Frostschutz."
  },
  fr: {
    buttonText: "Effectuer le départ",
    loadingText: "Activation du scénario...",
    successText: "Départ effectué !",
    errorText: "Erreur lors du départ",
    subText: "En cliquant ici, vous confirmerez votre départ et activerez le scénario domotique d'extinction (lumières, appareils en veille, chauffage en mode hors-gel)."
  },
  es: {
    buttonText: "Realizar Check-out",
    loadingText: "Activando escenario...",
    successText: "¡Check-out completado!",
    errorText: "Error durante el check-out",
    subText: "Al hacer clic aquí confirmarás tu salida y activarás el escenario domótico de apagado (luces, electrodomésticos en standby, calefacción en modo antihielo)."
  }
};

export const CheckoutPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage, pass }: Props) => {
  const { getPageData, media } = useCms();
  const cmsCheckOut = getPageData('checkOut') || {};
  const co = { ...BOOK_DATA[language].checkOut, ...cmsCheckOut };
  const reviewCopy = BOOK_DATA[language].contacts;
  const t = VIDEO_TRANSLATIONS[language];
  const labels = VIDEO_PAGE_LABELS[language];
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [checkoutMessage, setCheckoutMessage] = useState<string>('');

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev: Record<number, boolean>) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleCheckoutClick = async () => {
    setCheckoutStatus('loading');
    setCheckoutMessage('');
    try {
      const res = await fetch('/api/hass/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestToken: pass?.token })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckoutStatus('success');
        setCheckoutMessage(data.message || (language === 'it' ? 'Procedura di check-out completata con successo.' : 'Check-out completed successfully.'));
      } else {
        throw new Error(data.error || 'Errore di rete');
      }
    } catch (err: any) {
      setCheckoutStatus('error');
      setCheckoutMessage(err.message || (language === 'it' ? 'Errore imprevisto durante il check-out.' : 'Unexpected error during check-out.'));
    }
  };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={co.title}
          category={t.tiles.checkOut}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <div className="aurora-hero-banner">
          <img
            src={media?.checkOutCover || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"}
            alt="Check-out e Fine Soggiorno"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              {co.title}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {co.title}
            </h1>
          </div>
        </div>

        {/* Checkout Time Banner */}
        <div className="text-center py-2 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-xs font-mono font-bold text-xs tracking-wider">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>{co.badge}</span>
          </div>
          <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
            {co.lateNote}
          </p>
        </div>

        {/* Interactive Checkpoints */}
        <div className="aurora-glass-card space-y-4">
          <div>
            <span className="aurora-eyebrow">{labels.departure}</span>
            <h4 className="font-bold text-base text-white tracking-tight mt-0.5">
              {co.checklistTitle}
            </h4>
          </div>

          <div className="space-y-2">
            {(co.checklist as Array<{ title: string; desc: string }>).map((item: { title: string; desc: string }, idx: number) => {
              const isDone = !!checkedItems[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleCheck(idx)}
                  className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-start gap-2.5 cursor-pointer select-none ${
                    isDone 
                      ? 'bg-[#62e6bd]/15 border-[#62e6bd]/40 text-white' 
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-white/80'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-[#62e6bd]" />
                    ) : (
                      <Square className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`block text-xs font-semibold tracking-tight ${isDone ? 'line-through text-white/50' : 'text-white'}`}>
                      {item.title}
                    </span>
                    <span className="text-[11px] text-white/60 leading-relaxed block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Home Assistant Domotics Checkout Card */}
        <div className="aurora-glass-card p-4 space-y-3 border border-rose-500/25 bg-rose-500/5">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight">
                {language === 'it' && "Domotica di Fine Soggiorno"}
                {language === 'en' && "End-of-Stay Smart Home Automation"}
                {language === 'de' && "Smart-Home-Abreise-Automation"}
                {language === 'fr' && "Domotique de Fin de Séjour"}
                {language === 'es' && "Domótica de Fin de Estancia"}
              </h4>
              <p className="text-[11px] text-white/60 leading-relaxed mt-0.5">
                {CHECKOUT_BUTTON_TRANSLATIONS[language].subText}
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            disabled={checkoutStatus === 'loading' || checkoutStatus === 'success'}
            className={`w-full py-2.5 px-3.5 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              checkoutStatus === 'loading'
                ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                : checkoutStatus === 'success'
                ? 'bg-emerald-600 border border-emerald-500 text-white cursor-default'
                : checkoutStatus === 'error'
                ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)]'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)]'
            }`}
          >
            {checkoutStatus === 'loading' && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {checkoutStatus === 'success' && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            <span>
              {checkoutStatus === 'loading'
                ? CHECKOUT_BUTTON_TRANSLATIONS[language].loadingText
                : checkoutStatus === 'success'
                ? CHECKOUT_BUTTON_TRANSLATIONS[language].successText
                : checkoutStatus === 'error'
                ? CHECKOUT_BUTTON_TRANSLATIONS[language].errorText
                : CHECKOUT_BUTTON_TRANSLATIONS[language].buttonText}
            </span>
          </button>

          {checkoutMessage && (
            <p className={`text-xs text-center font-semibold ${checkoutStatus === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {checkoutMessage}
            </p>
          )}
        </div>

        {/* Thank you note */}
        <div className="aurora-glass-card text-center space-y-1.5 p-4">
          <Heart className="w-5 h-5 text-rose-400 mx-auto fill-rose-400/20" />
          <p className="text-xs italic text-white/80 leading-relaxed max-w-md mx-auto">
            "{co.thankYou}"
          </p>
        </div>

        {/* Leave a review invite */}
        <a
          href={APARTMENT_INFO.reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="aurora-glass-card p-3 flex items-center gap-3 hover:border-[#62e6bd]/40 transition group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#62e6bd] text-[#07110d] group-hover:scale-105 transition-transform shrink-0">
            <Star className="w-4 h-4 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block text-xs sm:text-sm text-white font-bold tracking-tight">{labels.reviewTitle}</strong>
            <span className="text-[11px] text-white/60 leading-snug block mt-0.5">{labels.reviewDescription}</span>
          </div>
        </a>

        <div className="aurora-glass-card text-center space-y-2.5 p-4">
          <div className="flex items-center justify-center gap-1 text-[#62e6bd]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-xs text-white/75 leading-relaxed max-w-sm mx-auto">
            {reviewCopy.reviewPrompt}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={APARTMENT_INFO.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold flex items-center justify-center border border-white/10 transition"
            >
              <span>{reviewCopy.rateGoogle}</span>
            </a>
            <a
              href={APARTMENT_INFO.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-[#62e6bd] hover:bg-[#93f4d4] text-[#07110d] text-xs font-bold flex items-center justify-center shadow-xs transition"
            >
              <span>{reviewCopy.rateWebsite}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
