import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { useCms } from '../../../context/CmsContext';
import { Phone, ShieldAlert, HeartPulse, MapPin, Building2, Pill, Stethoscope, Shield, ExternalLink } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const EmergenzaPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData, media } = useCms();
  const cmsEmergency = getPageData('emergency') || {};
  const em = { ...BOOK_DATA[language].emergency, ...cmsEmergency };
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const labels = VIDEO_PAGE_LABELS[language] || VIDEO_PAGE_LABELS.it;

  const getEmergencyIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('ospedale') || lower.includes('hospital') || lower.includes('kh') || lower.includes('hopital')) {
      return <Building2 className="w-5 h-5" />;
    }
    if (lower.includes('farmacia') || lower.includes('pharmacy') || lower.includes('apotheke') || lower.includes('pharmacie')) {
      return <Pill className="w-5 h-5" />;
    }
    if (lower.includes('guardia') || lower.includes('medica') || lower.includes('doctor') || lower.includes('continuità')) {
      return <Stethoscope className="w-5 h-5" />;
    }
    if (lower.includes('carabinieri') || lower.includes('police') || lower.includes('polizia') || lower.includes('gendarmerie')) {
      return <Shield className="w-5 h-5" />;
    }
    return <HeartPulse className="w-5 h-5" />;
  };

  return (
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={em.title}
          category={t.tiles.emergenza}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Hero Banner */}
        <div className="aurora-hero-banner">
          <img
            src={media?.emergencyCover || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80"}
            alt="Soccorso e Sicurezza"
          />
          <div className="aurora-hero-banner-overlay">
            <span className="aurora-eyebrow text-rose-300 flex items-center gap-1.5">
              {labels.emergency}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {em.title}
            </h1>
          </div>
        </div>

        {/* Red Highlight 112 Banner */}
        <div className="aurora-glass-card border-rose-500/30 bg-gradient-to-br from-rose-950/40 to-black/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span className="aurora-eyebrow text-rose-200">
                {em.nationalNumbersTitle}
              </span>
            </div>
            <span className="text-[10px] font-bold bg-rose-500/25 border border-rose-500/40 text-rose-200 px-2.5 py-0.5 rounded-full">
              {em.freeBadge}
            </span>
          </div>

          <a
            href="tel:112"
            className="p-4 rounded-2xl bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/50 flex items-center justify-between transition cursor-pointer shadow-md"
          >
            <div className="min-w-0 pr-2">
              <span className="text-xs font-bold text-rose-200 uppercase tracking-wider block">{t.emergencyPage.singleEuNumberTitle}</span>
              <span className="font-mono text-2xl font-black text-white">112</span>
              <p className="text-[11px] text-rose-200/80 mt-0.5">{t.emergencyPage.singleEuNumberSubtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg">
              <Phone className="w-5 h-5" />
            </div>
          </a>
        </div>

        {/* Local emergency locations */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">{labels.hospitals}</p>
            <h3 className="text-base font-bold text-white tracking-tight">{labels.emergencyNearby}</h3>
          </div>

          {em.items.map((item, idx) => (
            <div
              key={idx}
              className="aurora-glass-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 text-rose-300 shadow-inner mt-0.5">
                    {getEmergencyIcon(item.title)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-white tracking-tight">
                      {item.title}
                    </h4>
                    <span className="text-xs text-white/60 block mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.mapsUrl && (
                    <a
                      href={item.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aurora-secondary-pill"
                      title={t.actions.googleMaps}
                    >
                      <MapPin className="w-3.5 h-3.5 text-white/70" />
                    </a>
                  )}
                  {item.phone && (
                    <a
                      href={`tel:${item.phone.replace(/\s+/g, '')}`}
                      className="aurora-action-pill bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                    >
                      <Phone className="w-3.5 h-3.5 text-white" />
                      <span>{t.actions.call}</span>
                    </a>
                  )}
                  {item.webUrl && (
                    <a
                      href={item.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aurora-action-pill bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                    >
                      <span>{item.webLabel || (language === 'it' ? 'Farmacie' : language === 'de' ? 'Apotheken' : language === 'fr' ? 'Pharmacies' : language === 'es' ? 'Farmacias' : 'Pharmacies')}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
