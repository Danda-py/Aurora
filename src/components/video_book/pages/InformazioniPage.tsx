import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Info, Trash2, Landmark, Fuel, Pill, Building } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const InformazioniPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsInfo = getPageData('info') || {};
  const inf = { ...BOOK_DATA[language].info, ...cmsInfo };

  const infoIcons = [
    <Pill key="pill" className="w-4 h-4 text-rose-300" />,
    <Landmark key="bank" className="w-4 h-4 text-teal-300" />,
    <Fuel key="fuel" className="w-4 h-4 text-neutral-300" />,
    <Building key="post" className="w-4 h-4 text-blue-300" />,
    <Info key="info" className="w-4 h-4 text-indigo-300" />
  ];

  return (
    <div className="bg-[#0b0e14] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={inf.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Services List */}
      <div className="space-y-2.5">
        {inf.services.map((s, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                {infoIcons[idx % infoIcons.length]}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-xs text-white truncate">
                  {s.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {s.desc}
                </p>
              </div>
            </div>

            <a
              href={s.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-[10px] flex items-center gap-1 border border-white/10 shrink-0 cursor-pointer transition"
            >
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span>Maps</span>
            </a>
          </div>
        ))}
      </div>

      {/* Waste recycling card */}
      <div className="p-4 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-emerald-400" />
          <h4 className="font-semibold text-xs sm:text-sm text-white">
            {inf.wasteTitle}
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {inf.wasteDesc}
        </p>
      </div>

      {/* Legal CIR/CIN Card */}
      <div className="p-3.5 rounded-2xl bg-[#171c2a] border border-white/[0.08] space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">{inf.cirLabel}</span>
          <span className="font-mono font-bold text-white">{APARTMENT_INFO.cirCode}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-medium">{inf.cinLabel}</span>
          <span className="font-mono font-bold text-white">{APARTMENT_INFO.cinCode}</span>
        </div>
      </div>

    </div>
  );
};
