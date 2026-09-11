import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Phone, Bike, Sparkles } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const RistorantiPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData, media } = useCms();
  const cmsRestaurants = getPageData('restaurants') || {};
  const res = { ...BOOK_DATA[language].restaurants, ...cmsRestaurants };
  const t = VIDEO_TRANSLATIONS[language];

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={res.title}
          category={t.tiles.ristoranti}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <div className="aurora-hero-banner">
          <img
            src={media?.restaurantsCover || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"}
            alt="Valtellina Food & Wine"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {res.title}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {res.bannerText}
            </h1>
          </div>
        </div>

        {/* Recommended Restaurants List */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">I Nostri Consigliati</p>
            <h3 className="text-base font-bold text-white tracking-tight">Ristoranti e Crotti Selezionati</h3>
          </div>

          {res.recommended.map((r, idx) => (
            <div
              key={idx}
              className="aurora-glass-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="aurora-eyebrow text-[#62e6bd] font-mono">
                    CONSIGLIATO
                  </span>
                  <h4 className="font-bold text-base text-white tracking-tight mt-0.5">
                    {r.name}
                  </h4>
                  <span className="text-xs text-white/60 block mt-0.5">
                    {r.address}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${r.phone}`}
                    className="aurora-secondary-pill"
                    title={t.actions.call}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#62e6bd]" />
                  </a>
                  <a
                    href={r.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aurora-action-pill"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#07110d]" />
                    <span>{t.actions.googleMaps}</span>
                  </a>
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Delivery takeout section */}
        <div className="aurora-glass-card space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="aurora-icon-box">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="aurora-eyebrow">A Domicilio</span>
              <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
                {res.deliveryTitle}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {res.deliveries.filter((del) => !/poletti/i.test(del.name)).map((del, i) => (
              <div key={i} className="aurora-item-card items-center">
                <div className="min-w-0 flex-1">
                  <strong className="block text-white text-xs sm:text-sm font-bold">{del.name}</strong>
                  <span className="text-xs text-white/60 block mt-0.5">{del.type}</span>
                </div>
                <a
                  href={`tel:${del.phone}`}
                  className="aurora-action-pill"
                >
                  <Phone className="w-3 h-3 text-[#07110d]" />
                  <span>{t.actions.call}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
