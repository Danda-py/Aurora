import React from 'react';
import { GuestPass, Language } from '../../types';
import { clearActiveGuestPass } from '../../services/guestPassService';
import { Calendar, ShieldAlert, Sparkles, MessageSquare, Star, ArrowRight, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { APARTMENT_INFO } from '../../data/apartmentData';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';

interface Props {
  pass: GuestPass;
  onEnterAsPublicGuest: () => void;
  language?: Language;
}

export const ExpiredPassScreen: React.FC<Props> = ({
  pass,
  onEnterAsPublicGuest,
  language = 'it'
}) => {
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const guestFullName = `${pass.guestName} ${pass.guestSurname}`.trim();

  const handleResetPass = () => {
    clearActiveGuestPass();
    window.location.href = window.location.pathname;
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#070a0e] text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-fade-in relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-black pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="relative z-10 w-full max-w-md text-center pt-4 space-y-1">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-lg mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-serif font-bold text-2xl text-white tracking-wide">
          Aurora in Valtellina
        </h1>
        <p className="text-xs text-emerald-300/70 font-mono tracking-wider uppercase">
          {t.expiredPass.headerSub}
        </p>
      </div>

      {/* Main Expired Card */}
      <div className="relative z-10 w-full max-w-md my-auto py-6">
        <div className="rounded-3xl bg-[#0e151e]/95 border border-emerald-500/20 p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5 text-center">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131d27] border border-emerald-500/25 text-emerald-300 text-xs font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.expiredPass.badge}</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
              {t.expiredPass.title}, {guestFullName}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.expiredPass.message}{' '}
              <span className="font-bold text-emerald-300 font-mono">{pass.checkOutDate}</span>.
            </p>
          </div>

          {/* Soggiorno Details Summary */}
          <div className="p-3.5 rounded-2xl bg-[#131d27] border border-emerald-500/15 text-left text-xs space-y-1.5 font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">{t.staySummary.guest}:</span>
              <span className="font-bold text-white">{guestFullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t.expiredPass.stayDates}</span>
              <span className="text-emerald-200">{pass.checkInDate} ➔ {pass.checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t.expiredPass.linkStatus}</span>
              <span className="text-rose-400 font-bold">{t.expiredPass.disabledForSecurity}</span>
            </div>
          </div>

          {/* Actions: Re-book & WhatsApp */}
          <div className="space-y-2.5 pt-2">
            
            {/* Rebook on Bed-and-Breakfast.it */}
            <a
              href="https://beb.it/p.cfm?s=9-67807"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              <span>{t.expiredPass.rebookBtn}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Contact Nino on WhatsApp */}
            <a
              href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(`Ciao Nino! Sono ${guestFullName}, ho soggiornato ad Aurora in Valtellina. Volevo ringraziarti di persona!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-[#131d27] hover:bg-[#182533] text-emerald-300 border border-emerald-500/30 font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{t.staySummary.writeHostWhatsapp}</span>
            </a>

          </div>

          {/* Fallback actions */}
          <div className="pt-2 border-t border-emerald-500/15 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={onEnterAsPublicGuest}
              className="hover:text-emerald-300 transition cursor-pointer underline underline-offset-4"
            >
              {t.expiredPass.generalGuide}
            </button>
            <button
              onClick={handleResetPass}
              className="hover:text-white transition cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t.expiredPass.insertAnotherPass}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Discreet footer */}
      <div className="relative z-10 w-full max-w-md text-center pb-2 text-[11px] text-slate-400">
        <span>© Aurora in Valtellina • Morbegno</span>
      </div>

    </div>
  );
};
