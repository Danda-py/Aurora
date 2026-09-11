import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Navigation, Copy, Check, Train, Car, Plane } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const PosizionePage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsLocation = getPageData('location') || {};
  const loc = { ...BOOK_DATA[language].location, ...cmsLocation };
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(APARTMENT_INFO.fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#080b10] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={loc.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Map Interactive View */}
      <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden shadow-sm border border-white/[0.1] backdrop-blur-xl">
        <iframe
          title="Mappa Morbegno"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src="https://maps.google.com/maps?q=Via+Serta+188D+Morbegno+SO&t=&z=15&ie=UTF8&iwloc=&output=embed"
          className="w-full h-full grayscale-[40%] contrast-[1.15] invert-[90%] hue-rotate-180"
        />
        <div className="absolute top-2.5 right-2.5">
          <a
            href={APARTMENT_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-sm border border-white/20 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#62e6bd]" />
            <span>Apri Maps</span>
          </a>
        </div>
      </div>

      {/* Address Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-[#62e6bd] shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm text-white">
                {APARTMENT_INFO.name}
              </h4>
              <p className="font-mono text-xs text-slate-400 truncate mt-0.5">
                {APARTMENT_INFO.fullAddress}
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyAddress}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1.5 transition shrink-0 border border-white/10 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#62e6bd]" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? 'Copiato!' : 'Copia'}</span>
          </button>
        </div>

        <a
          href={APARTMENT_INFO.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl bg-[#62e6bd] hover:bg-[#93f4d4] text-[#07110d] font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-[#07110d]" />
          <span>Avvia Navigatore GPS</span>
        </a>
      </div>

      {/* How to arrive directions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm space-y-3">
        <h4 className="font-semibold text-xs sm:text-sm text-white uppercase tracking-wider">
          {loc.howToArrive}
        </h4>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/25 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
              <Train className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block">{loc.byTrain}</strong>
              <span className="text-slate-400 leading-relaxed">{loc.byTrainDesc}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
              <Car className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block">{loc.byCar}</strong>
              <span className="text-slate-400 leading-relaxed">{loc.byCarDesc}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
              <Plane className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white block">{loc.byPlane}</strong>
              <span className="text-slate-400 leading-relaxed">{loc.byPlaneDesc}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
