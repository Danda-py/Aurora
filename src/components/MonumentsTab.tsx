import React from 'react';
import { Landmark, MapPin, Navigation, ExternalLink, Calendar, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { HISTORIC_MONUMENTS } from '../data/apartmentData';
import { translations } from '../data/translations';

interface Props {
  language: Language;
}

export const MonumentsTab: React.FC<Props> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              {t.monuments.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.monuments.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Monuments Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HISTORIC_MONUMENTS.map((monument) => (
          <div
            key={monument.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image with Tag */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={monument.image}
                  alt={monument.title[language]}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    {t.monuments.heritageBadge}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60 w-fit">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  <span>{monument.distance}</span>
                </div>

                <h2 className="text-lg font-bold font-serif text-slate-900">
                  {monument.title[language]}
                </h2>

                <p className="text-xs font-medium text-amber-900/80">
                  {monument.subtitle[language]}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {monument.description[language]}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 mt-2">
              <a
                href={monument.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-teal-700 hover:text-white text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer group"
              >
                <Navigation className="w-3.5 h-3.5 text-teal-700 group-hover:text-white transition-colors" />
                <span>{t.monuments.viewLocation}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
