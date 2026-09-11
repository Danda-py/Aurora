import React from 'react';
import { Language, GuestPass } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { Sparkles, Bed, Utensils, Tv, Mountain, Heart } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
  pass?: GuestPass | null;
}

export const BenvenutoPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage, pass }) => {
  const { getPageData, media } = useCms();
  const cmsWelcome = getPageData('welcome') || {};
  const w = { ...BOOK_DATA[language].welcome, ...cmsWelcome };
  const guestFullName = pass ? `${pass.guestName} ${pass.guestSurname}`.trim() : null;

  return (
    <div className="bg-[#080b10] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={w.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Hero Welcome Banner */}
      <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden shadow-md border border-white/[0.08]">
        <img
          src={media?.heroLiving || "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"}
          alt="Aurora in Valtellina Living"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-black/40 to-transparent flex items-end p-4">
          <div className="space-y-1">
            <span className="text-[#9ef2d3] text-[11px] font-semibold tracking-wider flex items-center gap-1.5 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#62e6bd]" /> {APARTMENT_INFO.city} • Valtellina
            </span>
            <h3 className="text-white text-base sm:text-lg font-bold leading-tight">
              {w.greeting}
            </h3>
          </div>
        </div>
      </div>

      {/* Host Welcome Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm space-y-3">
        {guestFullName ? (
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-white">
              Benvenuto, {guestFullName}
            </h4>
            <span className="text-[11px] font-medium text-[#9ef2d3] bg-[#62e6bd]/20 px-2.5 py-0.5 rounded-full border border-[#62e6bd]/30 flex items-center gap-1">
              <Heart className="w-3 h-3 text-[#62e6bd] fill-[#62e6bd]" />
              <span>Soggiorno Attivo</span>
            </span>
          </div>
        ) : (
          <h4 className="text-lg font-bold text-white">
            Cari Ospiti, benvenuti ad Aurora!
          </h4>
        )}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {w.message}
        </p>
      </div>

      {/* Room Spaces Grid */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          {w.roomsTitle}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/20">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs font-semibold text-white">{w.livingTitle}</strong>
              <span className="text-[11px] text-slate-400">{w.livingDesc}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-white flex items-center justify-center shrink-0 border border-white/10">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs font-semibold text-white">{w.bedroomTitle}</strong>
              <span className="text-[11px] text-slate-400">{w.bedroomDesc}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[#62e6bd] flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs font-semibold text-white">{w.kitchenTitle}</strong>
              <span className="text-[11px] text-slate-400">{w.kitchenDesc}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs font-semibold text-white">{w.viewTitle}</strong>
              <span className="text-[11px] text-slate-400">{w.viewDesc}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
