import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Info, Trash2, Landmark, Fuel, Pill, Building } from 'lucide-react';
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
  const t = VIDEO_TRANSLATIONS[language];
  const labels = VIDEO_PAGE_LABELS[language];
  const pharmacyUrl = 'https://web.pharmaround.it/farmacie/morbegno?onlyOpen=true&distance=5';
  const pharmacyService = {
    it: { title: 'FARMACIA DI TURNO', desc: 'Consulta disponibilità, orari e indicazioni aggiornati in tempo reale' },
    en: { title: 'ON-DUTY PHARMACY', desc: 'Check live availability, opening hours, and directions' },
    de: { title: 'NOTDIENST-APOTHEKE', desc: 'Live-Verfügbarkeit, Öffnungszeiten und Wegbeschreibung prüfen' },
    fr: { title: 'PHARMACIE DE GARDE', desc: 'Consultez la disponibilité, les horaires et l’itinéraire en direct' },
    es: { title: 'FARMACIA DE GUARDIA', desc: 'Consulta disponibilidad, horarios e indicaciones en tiempo real' }
  }[language];
  const services = inf.services.map((service, index) => index === 0
    ? { ...service, ...pharmacyService, mapsUrl: pharmacyUrl }
    : service
  );

  const infoIcons = [
    <Pill key="pill" className="w-5 h-5 text-[#62e6bd]" />,
    <Landmark key="bank" className="w-5 h-5 text-[#62e6bd]" />,
    <Fuel key="fuel" className="w-5 h-5 text-[#62e6bd]" />,
    <Building key="post" className="w-5 h-5 text-[#62e6bd]" />,
    <Info key="info" className="w-5 h-5 text-[#62e6bd]" />
  ];

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
                {infoIcons[idx % infoIcons.length]}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-white truncate">
                  {s.title}
                </h4>
                <p className="text-xs text-white/60 truncate mt-0.5">
                  {s.desc}
                </p>
              </div>

              <a
                href={s.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="aurora-action-pill"
              >
                <MapPin className="w-3.5 h-3.5 text-[#07110d]" />
                <span>{t.actions.googleMaps}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Waste recycling card */}
        <div className="aurora-glass-card space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="aurora-icon-box">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="aurora-eyebrow">Raccolta Differenziata</span>
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
