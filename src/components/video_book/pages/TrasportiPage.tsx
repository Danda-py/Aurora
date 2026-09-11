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
    <Train key="train" className="w-5 h-5 text-[#62e6bd]" />,
    <Bus key="bus" className="w-5 h-5 text-[#62e6bd]" />,
    <Car key="car" className="w-5 h-5 text-[#62e6bd]" />,
    <Plane key="plane" className="w-5 h-5 text-[#62e6bd]" />
  ];

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={tr.title}
          category="Mobilità Locale"
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <div className="aurora-hero-banner">
          <img
            src="https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=1200&q=80"
            alt="Treni e Trasporti in Valtellina"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              Connessioni & Orari
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Come Muoversi a Morbegno
            </h1>
          </div>
        </div>

        {/* Transport options list */}
        <div className="space-y-3">
          {tr.items.map((item, idx) => (
            <div
              key={idx}
              className="aurora-glass-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="aurora-icon-box mt-0.5">
                    {transportIcons[idx % transportIcons.length]}
                  </div>
                  <div className="min-w-0">
                    <span className="aurora-eyebrow">{item.subtitle} • {item.time}</span>
                    <h3 className="font-bold text-sm sm:text-base text-white tracking-tight mt-0.5">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {item.mapsUrl && (
                  <a
                    href={item.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aurora-action-pill"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#07110d]" />
                    <span>Mappa</span>
                  </a>
                )}
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                {item.desc}
              </p>

              {item.phone && (
                <div className="pt-1">
                  <a
                    href={`tel:${item.phone}`}
                    className="aurora-secondary-pill"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#62e6bd]" />
                    <span>{item.phone}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
