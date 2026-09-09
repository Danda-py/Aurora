import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { Clock, CheckSquare, Square, Heart } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const CheckoutPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsCheckOut = getPageData('checkOut') || {};
  const co = { ...BOOK_DATA[language].checkOut, ...cmsCheckOut };
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="bg-[#0b0e14] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={co.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Checkout Time Banner */}
      <div className="text-center py-2 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-xs font-mono font-bold text-xs tracking-wider">
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span>{co.badge}</span>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed pt-0.5">
          {co.lateNote}
        </p>
      </div>

      {/* Interactive Checkpoints */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm space-y-3">
        <h4 className="font-semibold text-xs sm:text-sm text-white uppercase tracking-wider">
          {co.checklistTitle}
        </h4>

        <div className="space-y-2">
          {co.checklist.map((item, idx) => {
            const isDone = !!checkedItems[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleCheck(idx)}
                className={`w-full p-3 rounded-xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                  isDone 
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-slate-200' 
                    : 'bg-[#1b2030] hover:bg-[#22283c] border-white/[0.06] text-slate-300'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`block text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-snug block">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thank you note */}
      <div className="p-4 rounded-2xl bg-[#141824] border border-white/[0.08] text-center space-y-1.5">
        <Heart className="w-5 h-5 text-rose-400 mx-auto fill-rose-400/20" />
        <p className="text-xs italic text-slate-300 leading-relaxed max-w-sm mx-auto">
          "{co.thankYou}"
        </p>
      </div>

    </div>
  );
};
