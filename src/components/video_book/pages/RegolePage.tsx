import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { CigaretteOff, HeartHandshake, Volume2, UserX, Lock, PhoneCall } from 'lucide-react';
import { PageEditable, EditableHeroBanner } from '../cmsPageHelpers';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const RegolePage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  
  const r = BOOK_DATA[language].rules;
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const labels = VIDEO_PAGE_LABELS[language] || VIDEO_PAGE_LABELS.it;

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
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={r.title}
          category={t.tiles.regole}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <EditableHeroBanner
          page="regole"
          img="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
          alt="Regole e Quiete della Casa"
          eyebrow={
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              {labels.harmony}
            </span>
          }
          title={r.title}
        />

        {/* Rules List */}
        <div className="space-y-3">
          {rulesList.map((item) => (
            <PageEditable key={item.num} id={`page.regole.rule-${item.num}`} label={`Regola ${item.num}`}>
              <div
                className="aurora-item-card items-start"
              >
              {/* Rule icon pill */}
              <div className="aurora-icon-box mt-0.5">
                {item.icon}
              </div>

              {/* Content */}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="aurora-eyebrow text-[#62e6bd] font-mono">
                    {t.rulesPage.ruleLabel}{item.num}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              </div>
            </PageEditable>
          ))}
        </div>

      </div>
    </div>
  );
};
