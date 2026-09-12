import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Info, Trash2, Landmark, Fuel, Pill, Building, Droplet, Church } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const InformazioniPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData, media } = useCms();
  const cmsInfo = getPageData('info') || {};
  const inf = { ...BOOK_DATA[language].info, ...cmsInfo };
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const labels = VIDEO_PAGE_LABELS[language] || VIDEO_PAGE_LABELS.it;
  const pharmacyUrl = 'https://web.pharmaround.it/farmacie/morbegno?onlyOpen=true&distance=5';
  const pharmacyService = t.infoPage.pharmacyService;

  const services = inf.services.map((service) => /farmacia|pharmacy|apotheke|pharmacie/i.test(service.title)
    ? { ...service, ...pharmacyService, mapsUrl: pharmacyUrl }
    : service
  );

  const getServiceIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('acqua') || lower.includes('water') || lower.includes('wasser') || lower.includes('eau')) {
      return <Droplet className="w-5 h-5 text-[#62e6bd]" />;
    }
    if (lower.includes('farmacia') || lower.includes('pharmacy') || lower.includes('apotheke') || lower.includes('pharmacie')) {
      return <Pill className="w-5 h-5 text-[#62e6bd]" />;
    }
    if (lower.includes('banc') || lower.includes('bank') || lower.includes('atm')) {
      return <Landmark className="w-5 h-5 text-[#62e6bd]" />;
    }
    if (lower.includes('carburante') || lower.includes('fuel') || lower.includes('ev') || lower.includes('gas') || lower.includes('ricarica') || lower.includes('tankstelle') || lower.includes('station')) {
      return <Fuel className="w-5 h-5 text-[#62e6bd]" />;
    }
    if (lower.includes('post') || lower.includes('poste') || lower.includes('correos')) {
      return <Building className="w-5 h-5 text-[#62e6bd]" />;
    }
    if (lower.includes('chiesa') || lower.includes('monument') || lower.includes('church') || lower.includes('kirche') || lower.includes('eglise') || lower.includes('iglesia')) {
      return <Church className="w-5 h-5 text-[#62e6bd]" />;
    }
    return <Info className="w-5 h-5 text-[#62e6bd]" />;
  };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={inf.title}
          category={t.tiles.informazioni}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <div className="aurora-hero-banner">
          <img
            src={media?.infoCover || "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80"}
            alt="Morbegno e Servizi Utili"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-[#62e6bd] flex items-center gap-1.5">
              {labels.practical}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {inf.title}
            </h1>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">{labels.useful}</p>
            <h3 className="text-base font-bold text-white tracking-tight">{labels.essential}</h3>
          </div>

          {services.map((s, idx) => (
            <div
              key={idx}
              className="aurora-item-card items-center"
            >
              <div className="aurora-icon-box">
                {getServiceIcon(s.title)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-white truncate">
                  {s.title}
                </h4>
                <p className="text-xs text-white/60 truncate mt-0.5">
                  {s.desc}
                </p>
              </div>

              {s.mapsUrl && s.mapsUrl.trim() !== '' && (
                <a
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aurora-action-pill shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#07110d]" />
                  <span>{t.actions.googleMaps}</span>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Waste recycling card */}
        <div className="aurora-glass-card space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="aurora-icon-box">
              <Trash2 className="w-5 h-5 text-[#62e6bd]" />
            </div>
            <div>
              <span className="aurora-eyebrow">{t.infoPage.wasteRecycling}</span>
              <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
                {inf.wasteTitle}
              </h4>
            </div>
          </div>
          <p className="text-xs text-white/70 leading-relaxed pl-13">
            {inf.wasteDesc}
          </p>
        </div>

        {/* Legal CIR/CIN Card */}
        <div className="aurora-glass-card space-y-2 text-xs">
          <span className="aurora-eyebrow">{labels.legal}</span>
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
            <span className="text-white/60 font-medium">{inf.cirLabel}</span>
            <span className="font-mono font-bold text-[#62e6bd]">{APARTMENT_INFO.cirCode}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.08]">
            <span className="text-white/60 font-medium">{inf.cinLabel}</span>
            <span className="font-mono font-bold text-[#62e6bd]">{APARTMENT_INFO.cinCode}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
