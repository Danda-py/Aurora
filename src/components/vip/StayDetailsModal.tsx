import React from 'react';
import { GuestPass, Language } from '../../types';
import { getStayTiming } from '../../services/guestPassService';
import { 
  Calendar, 
  Clock, 
  Car, 
  X, 
  MessageSquare, 
  ShieldCheck, 
  MapPin,
  Unlock,
  Heart
} from 'lucide-react';
import { APARTMENT_INFO } from '../../data/apartmentData';
import { VIDEO_TRANSLATIONS } from '../../data/videoTranslations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pass: GuestPass | null;
  onOpenSmartLock?: () => void;
  language?: Language;
}

export const StayDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pass,
  onOpenSmartLock,
  language = 'it'
}) => {
  if (!isOpen || !pass) return null;

  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const timing = getStayTiming(pass);
  const fullName = `${pass.guestName} ${pass.guestSurname}`.trim();

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString(language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const whatsappMessage = `Ciao Nino! Sono ${fullName}, volevo farti una domanda riguardo al mio soggiorno ad Aurora.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#0e151e] rounded-3xl border border-emerald-500/25 text-slate-100 shadow-2xl overflow-hidden animate-scale-up"
      >
        
        {/* Modal Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-emerald-500/15 bg-[#090d13]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <Unlock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t.staySummary.stayTitle}
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                {t.staySummary.staySubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#131d27] hover:bg-[#182533] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-emerald-500/20"
            aria-label={t.concierge.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Guest Greeting Pill */}
          <div className="p-3.5 rounded-2xl bg-[#131d27] border border-emerald-500/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-400/90 tracking-wider block font-mono">
                {t.staySummary.guest}
              </span>
              <span className="text-base font-bold text-white">
                {fullName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-emerald-400/90 tracking-wider block font-mono">
                {t.staySummary.status}
              </span>
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/35 inline-block">
                {timing.isActive ? t.staySummary.inProgress : timing.isUpcoming ? t.staySummary.confirmed : t.staySummary.completed}
              </span>
            </div>
          </div>

          {/* Open Door Button Card */}
          <div className="p-4 rounded-2xl bg-[#070a0e] border border-emerald-500/30 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                {t.staySummary.mainDoorOpening}
              </span>
              <span className="text-[10px] text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
                {t.staySummary.active24h}
              </span>
            </div>

            {onOpenSmartLock && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSmartLock();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>{t.smartLock.openDoorBtn}</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 leading-snug text-center">
              {t.staySummary.openDoorInstructions}
            </p>
          </div>

          {/* Dates Card */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#131d27] border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.tiles.checkIn}</span>
              </div>
              <div className="font-bold text-sm text-white">
                {formatDate(pass.checkInDate)}
              </div>
              <div className="text-[11px] text-slate-400">
                {t.staySummary.checkInFrom} {pass.checkInTime && pass.checkInTime !== '15:00' ? pass.checkInTime : '14:00'} (2 PM)
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#131d27] border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.tiles.checkOut}</span>
              </div>
              <div className="font-bold text-sm text-white">
                {formatDate(pass.checkOutDate)}
              </div>
              <div className="text-[11px] text-slate-400">
                {t.staySummary.checkOutBy} {pass.checkOutTime || '10:00'}
              </div>
            </div>
          </div>

          {/* Amenities & Parking Note */}
          <div className="p-3.5 rounded-2xl bg-[#131d27] border border-emerald-500/20 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>{t.staySummary.reservedParkingTitle}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t.staySummary.reservedParkingDesc}
            </p>
          </div>

          {/* Pampering Note */}
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-slate-300">
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/30 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-white mb-0.5">{t.staySummary.needSomethingTitle}</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t.staySummary.needSomethingDesc}
              </p>
            </div>
          </div>

          {/* Contact Nino Button */}
          <a
            href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.staySummary.writeHostWhatsapp}</span>
          </a>

        </div>

      </div>
    </div>
  );
};
