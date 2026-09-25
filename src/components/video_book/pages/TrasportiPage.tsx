import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { MapPin, Phone, Train, Bus, Car, Plane } from 'lucide-react';
import { PageEditable, EditableHeroBanner } from '../cmsPageHelpers';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const TrasportiPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const tr = BOOK_DATA[language].transport;
  const t = VIDEO_TRANSLATIONS[language];
  const labels = VIDEO_PAGE_LABELS[language];

  const getTransportIcon = (title: string, subtitle: string = '') => {
    const text = (title + ' ' + subtitle).toLowerCase();
    if (text.includes('stazione') || text.includes('treno') || text.includes('train') || text.includes('bahn') || text.includes('fs')) {
      return <Train className="w-5 h-5 text-[#62e6bd]" />;
    }
    if (text.includes('bus') || text.includes('autobus') || text.includes('fermata')) {
      return <Bus className="w-5 h-5 text-[#62e6bd]" />;
    }
    if (text.includes('aeroport') || text.includes('airport') || text.includes('flughafen')) {
      return <Plane className="w-5 h-5 text-[#62e6bd]" />;
    }
    return <Car className="w-5 h-5 text-[#62e6bd]" />;
  };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={tr.title}
          category={t.tiles.trasporti}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <EditableHeroBanner
          page="trasporti"
          img="https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=1200&q=80"
          alt="Treni e Trasporti in Valtellina"
          eyebrow={
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              {labels.connections}
            </span>
          }
          title={tr.title}
        />

        {/* Transport options list */}
        <div className="space-y-3">
          {tr.items.map((item, idx) => (
            <PageEditable key={idx} id={`page.trasporti.item-${idx}`} label={item.title}>
              <div
                className="aurora-glass-card space-y-3"
              >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="aurora-icon-box mt-0.5">
                    {getTransportIcon(item.title, item.subtitle)}
                  </div>
                  <div className="min-w-0">
                    <span className="aurora-eyebrow">{item.subtitle}</span>
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
                    <span>{t.actions.googleMaps}</span>
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
            </PageEditable>
          ))}
        </div>

      </div>
    </div>
  );
};
