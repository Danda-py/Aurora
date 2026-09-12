import React, { useState } from 'react';
import { GuestPass } from '../../types';
import { getStayTiming } from '../../services/guestPassService';
import { 
  Unlock, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Wifi, 
  Car, 
  Sun, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';
import { APARTMENT_INFO } from '../../data/apartmentData';

interface Props {
  pass: GuestPass;
  onOpenSmartLock: () => void;
  onOpenWifi?: () => void;
  onNavigate?: (page: any) => void;
}

export const VIPBoardingPassCard: React.FC<Props> = ({
  pass,
  onOpenSmartLock,
  onOpenWifi,
  onNavigate
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const timing = getStayTiming(pass);

  const guestFullName = `${pass.guestName} ${pass.guestSurname}`.trim();

  // Format dates for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const whatsappMessage = `Ciao Nino! Sono ${guestFullName}, ospite dell'Appartamento Aurora (Prenotazione: ${pass.bookingRef || 'VIP Pass'}).`;

  return (
    <div className="w-full relative z-20 px-3 sm:px-4 py-2 animate-fade-in">
      
      {/* Luxury Cruise-Style Boarding Pass Container */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#18181b]/95 via-[#27272a]/95 to-[#1c1917]/95 border border-amber-400/40 shadow-2xl backdrop-blur-md overflow-hidden text-white transition-all">
        
        {/* Subtle decorative gold top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600" />

        {/* Top Header of the Boarding Card */}
        <div className="px-4 py-3 sm:px-5 flex items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-amber-300 block">
                VIP BOARDING PASS • MSC SUITE EXPERIENCE
              </span>
              <span className="text-xs font-serif text-slate-300 block -mt-0.5">
                Aurora in Valtellina • Morbegno
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Chip */}
            <div
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider border flex items-center gap-1 ${
                timing.isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : timing.isUpcoming
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-zinc-700/50 text-zinc-300 border-zinc-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              <span>{timing.isActive ? 'ATTIVO' : timing.isUpcoming ? 'CONFERMATO' : 'CONCLUSO'}</span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={isExpanded ? 'Riduci scheda' : 'Espandi scheda'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Passenger & Stay Info */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Guest Name & Suite */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                Nome Ospite / Guest
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide text-shadow-sm">
                {guestFullName}
              </h3>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                Alloggio Riservato
              </span>
              <span className="text-xs font-mono font-bold text-amber-200">
                Suite Aurora • 70 m² con Parcheggio
              </span>
            </div>
          </div>

          {/* Dynamic Stay Countdown Banner (Cruise-style MSC countdown) */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-teal-500/15 to-amber-500/20 border border-amber-400/30 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300 font-bold block">
                  {timing.isUpcoming ? 'COUNTDOWN ALL\'ARRIVO' : 'TEMPO DI SOGGIORNO'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {timing.formattedCountdown}
                </span>
              </div>
            </div>

            {/* Valtellina Weather Mini Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-amber-200 shrink-0">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Morbegno 21°C</span>
            </div>
          </div>

          {/* Collapsible Details: Checkin/Checkout dates & Smart Lock Card */}
          {isExpanded && (
            <div className="space-y-3 pt-1 animate-fade-in">
              
              {/* Dates Row: Check-in and Check-out */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-mono uppercase font-bold mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>CHECK-IN</span>
                  </div>
                  <div className="font-bold text-sm text-white">
                    {formatDateDisplay(pass.checkInDate)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    dalle {pass.checkInTime && pass.checkInTime !== '15:00' ? pass.checkInTime : '14:00'} (2 PM)
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-mono uppercase font-bold mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>CHECK-OUT</span>
                  </div>
                  <div className="font-bold text-sm text-white">
                    {formatDateDisplay(pass.checkOutDate)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    entro le {pass.checkOutTime || '10:00'}
                  </div>
                </div>
              </div>

              {/* Smart Lock Key Card Ribbon */}
              <div 
                onClick={onOpenSmartLock}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 shadow-md cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 font-bold">
                          INGRESSO CON SMART LOCK
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Apertura porta con 1 tocco
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSmartLock();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>APRI PORTA</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* VIP Perks Quick Bar */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Free Reserved Parking */}
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                  <Car className="w-4 h-4 text-amber-300 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-300 block leading-tight font-medium">
                    Parcheggio Privato
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono">
                    Riservato 24/7
                  </span>
                </div>

                {/* High-speed WiFi */}
                <button
                  onClick={onOpenWifi}
                  className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-center transition cursor-pointer"
                >
                  <Wifi className="w-4 h-4 text-teal-300 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-300 block leading-tight font-medium">
                    Wi-Fi Fibra
                  </span>
                  <span className="text-[9px] text-teal-400 font-mono">
                    Connetti Rapido
                  </span>
                </button>

                {/* Direct Host WhatsApp */}
                <a
                  href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-center transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[10px] font-mono text-slate-300 block leading-tight font-medium">
                    Concierge Nino
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono">
                    Chat WhatsApp
                  </span>
                </a>
              </div>

            </div>
          )}

        </div>

        {/* Boarding Pass Barcode styling decoration */}
        <div className="px-5 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>ID: {pass.bookingRef || pass.id.slice(0, 10).toUpperCase()}</span>
          </div>
          <div className="tracking-widest uppercase text-slate-400 font-serif">
            VIA SERTA 188D • MORBEGNO
          </div>
        </div>

      </div>
    </div>
  );
};
