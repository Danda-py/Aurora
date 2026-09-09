import React from 'react';
import { MapPin, Navigation, Clock, Key, ShieldCheck, SunMedium, CloudSun, Sparkles, Phone, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { APARTMENT_INFO } from '../data/apartmentData';

interface Props {
  language: Language;
  onOpenCheckin: () => void;
  onOpenWiFi: () => void;
}

export const HeroBanner: React.FC<Props> = ({
  language,
  onOpenCheckin,
  onOpenWiFi,
}) => {
  const t = translations[language];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white shadow-xl border border-teal-800/40">
      
      {/* Background Image Layer with Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80"
          alt="Valtellina Alps Morbegno"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Decorative Radial Lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-between gap-6">
        
        {/* Top Badges: Location & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Via Serta 188D, Morbegno (SO)</span>
          </div>

          {/* Valtellina Weather Widget Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/60 backdrop-blur-md border border-teal-600/40 text-xs text-teal-100 font-medium">
            <CloudSun className="w-3.5 h-3.5 text-amber-300" />
            <span>Morbegno 22°C • Sereno</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-white leading-tight">
            {t.hero.welcome}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
            {t.hero.intro}
          </p>
        </div>

        {/* Key Features Quick Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          
          {/* Check-in info */}
          <div 
            onClick={onOpenCheckin}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xs transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-teal-300 mb-1">
              <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Orario</span>
            </div>
            <p className="text-xs font-bold text-white">In: {APARTMENT_INFO.checkInStart} | Out: {APARTMENT_INFO.checkOutLimit}</p>
          </div>

          {/* Wi-Fi Quick Access */}
          <div 
            onClick={onOpenWiFi}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xs transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-teal-300 mb-1">
              <Sparkles className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Wi-Fi Fibra</span>
            </div>
            <p className="text-xs font-bold text-white font-mono truncate">{APARTMENT_INFO.wifiSSID}</p>
          </div>

          {/* Private Parking */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-teal-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Parcheggio</span>
            </div>
            <p className="text-xs font-bold text-white">Privato in Corte</p>
          </div>

          {/* Directions / Maps */}
          <a
            href={APARTMENT_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-teal-800/80 hover:bg-teal-700/80 border border-teal-600/50 backdrop-blur-xs transition-colors flex flex-col justify-center group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-amber-300 mb-1">
              <Navigation className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-[11px] font-semibold uppercase tracking-wide">Google Maps</span>
            </div>
            <p className="text-xs font-bold text-white">{t.quickActions.directions}</p>
          </a>
        </div>

      </div>
    </div>
  );
};
