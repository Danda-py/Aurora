import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
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
  const t = VIDEO_TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(APARTMENT_INFO.fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={loc.title}
          category={t.tiles.posizione}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Map Interactive View */}
        <div className="relative h-52 sm:h-64 w-full rounded-3xl overflow-hidden shadow-lg border border-white/[0.1] backdrop-blur-xl">
          <iframe
            title="Mappa Morbegno"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src="https://maps.google.com/maps?q=Via+Serta+188D+Morbegno+SO&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full grayscale-[30%] contrast-[1.1] invert-[90%] hue-rotate-180"
          />
          <div className="absolute top-3 right-3">
            <a
              href={APARTMENT_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#080b10]/90 hover:bg-[#080b10] text-white text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md border border-white/20 cursor-pointer transition"
            >
              <Navigation className="w-3.5 h-3.5 text-[#62e6bd]" />
              <span>{t.actions.googleMaps}</span>
            </a>
          </div>
        </div>

        {/* Address Card */}
        <div className="aurora-glass-card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="aurora-icon-box">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="aurora-eyebrow">Indirizzo Ufficiale</span>
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight mt-0.5">
                  {APARTMENT_INFO.name}
                </h3>
                <p className="font-mono text-xs text-white/70 truncate mt-0.5">
                  {APARTMENT_INFO.fullAddress}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyAddress}
              className="aurora-secondary-pill"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#62e6bd]" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
              <span>{copied ? 'Copiato!' : 'Copia'}</span>
            </button>
          </div>

          <a
            href={APARTMENT_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-action-pill w-full py-3.5"
          >
            <Navigation className="w-4 h-4 text-[#07110d]" />
            <span>Avvia Navigatore GPS</span>
          </a>
        </div>

        {/* How to arrive directions */}
        <div className="aurora-glass-card space-y-3">
          <div>
            <p className="aurora-eyebrow">{loc.howToArrive}</p>
            <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
              {loc.howToArrive}
            </h4>
          </div>

          <div className="space-y-3 text-xs text-white/80">
            <div className="aurora-item-card">
              <div className="aurora-icon-box">
                <Train className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-white text-xs sm:text-sm font-bold block">{loc.byTrain}</strong>
                <span className="text-xs text-white/65 leading-relaxed block mt-0.5">{loc.byTrainDesc}</span>
              </div>
            </div>

            <div className="aurora-item-card">
              <div className="aurora-icon-box">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-white text-xs sm:text-sm font-bold block">{loc.byCar}</strong>
                <span className="text-xs text-white/65 leading-relaxed block mt-0.5">{loc.byCarDesc}</span>
              </div>
            </div>

            <div className="aurora-item-card">
              <div className="aurora-icon-box">
                <Plane className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-white text-xs sm:text-sm font-bold block">{loc.byPlane}</strong>
                <span className="text-xs text-white/65 leading-relaxed block mt-0.5">{loc.byPlaneDesc}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
