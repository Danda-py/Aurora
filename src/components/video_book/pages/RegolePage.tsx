import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { CigaretteOff, HeartHandshake, Volume2, UserX, Lock, PhoneCall } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const RegolePage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsRules = getPageData('rules') || {};
  const r = { ...BOOK_DATA[language].rules, ...cmsRules };

  const rulesList = [
    {
      num: 1,
      title: r.r1Title,
      desc: r.r1Desc,
      icon: <CigaretteOff className="w-4 h-4 text-rose-400" />,
      color: 'bg-rose-500/15 border-rose-500/25 text-rose-300'
    },
    {
      num: 2,
      title: r.r2Title,
      desc: r.r2Desc,
      icon: <HeartHandshake className="w-4 h-4 text-neutral-300" />,
      color: 'bg-white/[0.06] border-white/[0.1] text-neutral-200'
    },
    {
      num: 3,
      title: r.r3Title,
      desc: r.r3Desc,
      icon: <Volume2 className="w-4 h-4 text-indigo-400" />,
      color: 'bg-indigo-500/15 border-indigo-500/25 text-indigo-300'
    },
    {
      num: 4,
      title: r.r4Title,
      desc: r.r4Desc,
      icon: <UserX className="w-4 h-4 text-orange-400" />,
      color: 'bg-orange-500/15 border-orange-500/25 text-orange-300'
    },
    {
      num: 5,
      title: r.r5Title,
      desc: r.r5Desc,
      icon: <Lock className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300'
    },
    {
      num: 6,
      title: r.r6Title,
      desc: r.r6Desc,
      icon: <PhoneCall className="w-4 h-4 text-blue-400" />,
      color: 'bg-blue-500/15 border-blue-500/25 text-blue-300'
    }
  ];

  return (
    <div className="bg-[#080b10] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={r.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Rules List in modern dark cards */}
      <div className="space-y-2.5">
        {rulesList.map((item) => (
          <div
            key={item.num}
            className="p-3.5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-start gap-3.5"
          >
            {/* Rule icon pill */}
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}>
              {item.icon}
            </div>

            {/* Content */}
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#62e6bd]">
                  REGOLA #{item.num}
                </span>
                <span className="text-xs font-semibold text-white truncate">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
