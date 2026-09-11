import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { useCms } from '../../../context/CmsContext';
import { Phone, ShieldAlert, HeartPulse, MapPin } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const EmergenzaPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData, media } = useCms();
  const cmsEmergency = getPageData('emergency') || {};
  const em = { ...BOOK_DATA[language].emergency, ...cmsEmergency };
  const t = VIDEO_TRANSLATIONS[language];
  const labels = VIDEO_PAGE_LABELS[language];

  const emergencyHots = [
    { num: '112', label: 'Numero Unico Europeo (112)' },
    { num: '118', label: 'Soccorso Sanitario / Ambulanza' },
    { num: '115', label: 'Vigili del Fuoco' },
    { num: '113', label: 'Polizia di Stato' }
  ];

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

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {emergencyHots.map((e) => (
              <a
                key={e.num}
                href={`tel:${e.num}`}
                className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-between transition cursor-pointer shadow-sm"
              >
                <div className="min-w-0 pr-1">
                  <span className="text-[10px] text-white/70 truncate block">{e.label}</span>
                  <span className="font-mono text-lg font-black text-rose-300">{e.num}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
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
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 text-rose-300 shadow-inner">
                    <HeartPulse className="w-5 h-5" />
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
                  <a
                    href={`tel:${item.phone.replace(/\s+/g, '')}`}
                    className="aurora-action-pill bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                  >
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>{t.actions.call}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
