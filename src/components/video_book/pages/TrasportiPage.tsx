import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Phone, Train, Bus, Car, Plane } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const TrasportiPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsTransport = getPageData('transport') || {};
  const tr = { ...BOOK_DATA[language].transport, ...cmsTransport };

  const transportIcons = [
    <Train key="train" className="w-4 h-4 text-teal-300" />,
    <Bus key="bus" className="w-4 h-4 text-blue-300" />,
    <Car key="car" className="w-4 h-4 text-neutral-300" />,
    <Plane key="plane" className="w-4 h-4 text-indigo-300" />
  ];

  return (
    <div className="bg-[#080b10] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={tr.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Transport options list */}
      <div className="space-y-2.5">
        {tr.items.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {transportIcons[idx % transportIcons.length]}
                </div>
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {item.subtitle} • <strong className="text-white">{item.time}</strong>
                  </span>
                </div>
              </div>

              {item.mapsUrl && (
                <a
                  href={item.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-xl bg-[#62e6bd] hover:bg-[#93f4d4] text-[#07110d] font-bold text-xs flex items-center gap-1 transition border border-transparent shrink-0 cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-[#07110d]" />
                  <span>Mappa</span>
                </a>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {item.desc}
            </p>

            {item.phone && (
              <div className="pt-1">
                <a
                  href={`tel:${item.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#62e6bd]/20 text-[#9ef2d3] hover:bg-[#62e6bd]/30 font-mono text-xs border border-[#62e6bd]/30 transition cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>{item.phone}</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
