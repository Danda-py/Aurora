import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { Phone, ShieldAlert, HeartPulse, MapPin } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const EmergenzaPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsEmergency = getPageData('emergency') || {};
  const em = { ...BOOK_DATA[language].emergency, ...cmsEmergency };

  const emergencyHots = [
    { num: '112', label: 'Numero Unico Europeo (112)' },
    { num: '118', label: 'Soccorso Sanitario / Ambulanza' },
    { num: '115', label: 'Vigili del Fuoco' },
    { num: '113', label: 'Polizia di Stato' }
  ];

  return (
    <div className="bg-[#0b0e14] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={em.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Red Highlight 112 Banner */}
      <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-white shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span className="font-semibold text-xs uppercase tracking-wider text-rose-200">
              {em.nationalNumbersTitle}
            </span>
          </div>
          <span className="text-[10px] font-bold bg-rose-500/25 border border-rose-500/40 text-rose-200 px-2 py-0.5 rounded-md">
            {em.freeBadge}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {emergencyHots.map((e) => (
            <a
              key={e.num}
              href={`tel:${e.num}`}
              className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-between transition cursor-pointer"
            >
              <div className="min-w-0 pr-1">
                <span className="text-[10px] text-slate-300 truncate block">{e.label}</span>
                <span className="font-mono text-base font-extrabold text-rose-300">{e.num}</span>
              </div>
              <Phone className="w-4 h-4 text-white shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Local emergency locations */}
      <div className="space-y-2.5">
        {em.items.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-[#141824] border border-white/[0.08] shadow-sm space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 mt-0.5 text-rose-300">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {item.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.mapsUrl && (
                  <a
                    href={item.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition border border-white/10 cursor-pointer"
                    title="Mappa"
                  >
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                )}
                <a
                  href={`tel:${item.phone.replace(/\s+/g, '')}`}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Phone className="w-3 h-3 text-white" />
                  <span>Chiama</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
