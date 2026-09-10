import React, { useState } from 'react';
import { GuestPass } from '../../types';
import { getStayTiming } from '../../services/guestPassService';
import { Unlock, ChevronRight, User } from 'lucide-react';
import { StayDetailsModal } from './StayDetailsModal';

interface Props {
  pass: GuestPass;
  onOpenSmartLock?: () => void;
}

export const StaySummaryPill: React.FC<Props> = ({ pass, onOpenSmartLock }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const timing = getStayTiming(pass);
  const guestFirstName = pass.guestName || 'Ospite';

  return (
    <>
      <div className="w-full px-3 sm:px-4 py-1.5 animate-fade-in">
        <div
          onClick={() => setIsDetailsOpen(true)}
          className="w-full rounded-full bg-neutral-950/85 border border-white/[0.12] hover:border-white/[0.2] shadow-[0_8px_30px_rgb(0,0,0,0.4)] px-3.5 py-2 flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 active:scale-[0.99] group backdrop-blur-2xl"
        >
          {/* Left: Apple Dynamic Island user greeting & live status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/[0.08] text-white flex items-center justify-center shrink-0 border border-white/10">
              <User className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white tracking-tight truncate">
                  {guestFirstName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] shrink-0 shadow-[0_0_6px_rgba(48,209,88,0.8)]" />
              </div>
              <p className="text-[10px] text-neutral-400 truncate -mt-0.5 tracking-tight font-normal">
                {timing.isActive 
                  ? `Soggiorno attivo • ${timing.formattedCountdown}`
                  : timing.isUpcoming
                  ? `Arrivo: ${pass.checkInDate}`
                  : 'Soggiorno completato'}
              </p>
            </div>
          </div>

          {/* Right: Apple Action Pill & Chevron */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenSmartLock && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSmartLock();
                }}
                className="px-3 py-1.5 rounded-full bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-neutral-950" />
                <span className="tracking-tight">APRI PORTA</span>
              </button>
            )}

            <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Stay Details Sheet Modal */}
      <StayDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        pass={pass}
        onOpenSmartLock={onOpenSmartLock}
      />
    </>
  );
};

