import React from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { MapPin, Phone, Bike, Sparkles } from 'lucide-react';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const RistorantiPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsRestaurants = getPageData('restaurants') || {};
  const res = { ...BOOK_DATA[language].restaurants, ...cmsRestaurants };

  return (
    <div className="bg-[#080b10] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={res.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Banner */}
      <div className="relative h-40 sm:h-48 w-full rounded-2xl overflow-hidden shadow-md border border-white/[0.08]">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
          alt="Valtellina Food & Wine"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-black/40 to-transparent flex items-end p-4">
          <span className="text-white text-sm sm:text-base font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#62e6bd]" />
            {res.bannerText}
          </span>
        </div>
      </div>

      {/* Recommended Restaurants List */}
      <div className="space-y-2.5">
        {res.recommended.map((r, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-[#62e6bd] uppercase tracking-wider block">
                  CONSIGLIATO • {r.time}
                </span>
                <h4 className="font-semibold text-xs sm:text-sm text-white">
                  {r.name}
                </h4>
                <span className="text-[11px] text-slate-400 block">
                  {r.address}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${r.phone}`}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition border border-white/10 cursor-pointer"
                  title="Chiama"
                >
                  <Phone className="w-3.5 h-3.5 text-[#62e6bd]" />
                </a>
                <a
                  href={r.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-[#62e6bd] hover:bg-[#93f4d4] text-[#07110d] font-bold text-[10px] flex items-center gap-1 border border-transparent transition cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-[#07110d]" />
                  <span>Maps</span>
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Delivery takeout section */}
      <div className="p-4 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Bike className="w-4 h-4 text-teal-400" />
          <h4 className="font-semibold text-xs sm:text-sm text-white">
            {res.deliveryTitle}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {res.deliveries.map((del, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
              <div>
                <strong className="block text-white text-xs font-semibold">{del.name}</strong>
                <span className="text-[10px] text-slate-400">{del.type}</span>
              </div>
              <a
                href={`tel:${del.phone}`}
                className="px-2.5 py-1 rounded-lg bg-[#62e6bd]/20 text-[#9ef2d3] hover:bg-[#62e6bd]/30 border border-[#62e6bd]/30 font-medium text-[10px] flex items-center gap-1"
              >
                <Phone className="w-2.5 h-2.5" />
                <span>Ordina</span>
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
