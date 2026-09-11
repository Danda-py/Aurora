import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Info, Trash2, Landmark, Fuel, Pill, Building } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const InformazioniPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsInfo = getPageData('info') || {};
  const inf = { ...BOOK_DATA[language].info, ...cmsInfo };

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
          category="Servizi del Territorio"
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Services List */}
        <div className="space-y-3">
          <div>
            <p className="aurora-eyebrow">Punti Utili</p>
            <h3 className="text-base font-bold text-white tracking-tight">Servizi essenziali a Morbegno</h3>
          </div>

          {inf.services.map((s, idx) => (
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
                <span>Maps</span>
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
          <span className="aurora-eyebrow">Codici Identificativi di Legge</span>
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
