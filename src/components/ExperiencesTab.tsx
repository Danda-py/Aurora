import React from 'react';
import { Clock, Car, Navigation, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import { Language, Experience } from '../types';
import { translations } from '../data/translations';
import { EXPERIENCES } from '../data/apartmentData';

interface Props {
  language: Language;
}

export const ExperiencesTab: React.FC<Props> = ({ language }) => {
  const t = translations[language];
  const orderedExperiences = [...EXPERIENCES].sort((first, second) => {
    const firstMinutes = Number(first.driveTime.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
    const secondMinutes = Number(second.driveTime.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
    return firstMinutes - secondMinutes;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
          {t.experiences.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.experiences.subtitle}
        </p>
      </div>

      {/* Grid of Experiences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orderedExperiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:border-teal-200 transition-all duration-300"
          >
            <div>
              {/* Image Container with Badges */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src={exp.image}
                  alt={exp.title[language]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                {/* Top Badge */}
                {exp.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                      <Sparkles className="w-3.5 h-3.5" />
                      {exp.badge[language]}
                    </span>
                  </div>
                )}

                {/* Bottom title in image */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold font-serif leading-snug drop-shadow-sm">
                    {exp.title[language]}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-1 opacity-90 drop-shadow-sm">
                    {exp.subtitle[language]}
                  </p>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 space-y-4">
                
                {/* Timing info */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    {exp.duration}
                  </span>
                  <span className="flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg font-medium text-teal-800 border border-teal-200/60">
                    <Car className="w-3.5 h-3.5 text-teal-700" />
                    {exp.driveTime}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exp.description[language]}
                </p>

                {/* Host Tips Box */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Compass className="w-4 h-4 text-teal-700" />
                    <span>{t.experiences.tipsTitle}</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {exp.tips[language].map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            {/* Action Bar */}
            <div className="p-5 pt-0">
              <a
                href={exp.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.experiences.getDirections}</span>
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
