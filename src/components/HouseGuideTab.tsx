import React, { useState } from 'react';
import { 
  Wifi, 
  Thermometer, 
  Sparkles, 
  Shirt, 
  Flame, 
  Tv, 
  Coffee, 
  Zap,
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  Apple,
  Milk,
  FileText,
  Wine,
  Trash2,
  CigaretteOff,
  Moon,
  LightbulbOff,
  Car,
  Utensils,
  BedDouble,
  Wind
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { APPLIANCES, WASTE_GUIDE, HOUSE_RULES, AMENITIES, APARTMENT_INFO } from '../data/apartmentData';

interface Props {
  language: Language;
  onOpenWiFi: () => void;
  onOpenCheckin: () => void;
}

export const HouseGuideTab: React.FC<Props> = ({
  language,
  onOpenWiFi,
  onOpenCheckin,
}) => {
  const [expandedAppliance, setExpandedAppliance] = useState<string | null>('wifi_router');
  const t = translations[language];

  const getApplianceIcon = (icon: string) => {
    switch (icon) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-600" />;
      case 'Wifi': return <Wifi className="w-5 h-5" />;
      case 'Thermometer': return <Thermometer className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Shirt': return <Shirt className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Tv': return <Tv className="w-5 h-5" />;
      case 'Coffee': return <Coffee className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  const getWasteIcon = (icon: string) => {
    switch (icon) {
      case 'Apple': return <Apple className="w-5 h-5 text-amber-700" />;
      case 'Milk': return <Milk className="w-5 h-5 text-yellow-600" />;
      case 'FileText': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Wine': return <Wine className="w-5 h-5 text-emerald-700" />;
      case 'Trash2': return <Trash2 className="w-5 h-5 text-slate-600" />;
      default: return <Trash2 className="w-5 h-5 text-slate-600" />;
    }
  };

  const getRuleIcon = (icon: string) => {
    switch (icon) {
      case 'CigaretteOff': return <CigaretteOff className="w-5 h-5 text-rose-600" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-600" />;
      case 'LightbulbOff': return <LightbulbOff className="w-5 h-5 text-amber-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-600" />;
      default: return <AlertCircle className="w-5 h-5 text-teal-600" />;
    }
  };

  const getAmenityIcon = (icon: string) => {
    switch (icon) {
      case 'Wifi': return <Wifi className="w-4 h-4 text-teal-700" />;
      case 'Car': return <Car className="w-4 h-4 text-teal-700" />;
      case 'Utensils': return <Utensils className="w-4 h-4 text-teal-700" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-teal-700" />;
      case 'Shirt': return <Shirt className="w-4 h-4 text-teal-700" />;
      case 'Flame': return <Flame className="w-4 h-4 text-teal-700" />;
      case 'Tv': return <Tv className="w-4 h-4 text-teal-700" />;
      case 'Coffee': return <Coffee className="w-4 h-4 text-teal-700" />;
      case 'BedDouble': return <BedDouble className="w-4 h-4 text-teal-700" />;
      case 'Wind': return <Wind className="w-4 h-4 text-teal-700" />;
      default: return <CheckCircle2 className="w-4 h-4 text-teal-700" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Section Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
          {t.house.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.house.subtitle}
        </p>
      </div>

      {/* Check-in / Check-out Banner Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Checkin card */}
        <div 
          onClick={onOpenCheckin}
          className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 border border-teal-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-700 text-white shadow-xs">
              Check-in dalle {APARTMENT_INFO.checkInStart}
            </span>
            <span className="text-xs text-teal-700 font-semibold group-hover:translate-x-1 transition-transform">
              Guida Arrivo →
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-serif">
            {t.house.checkInTitle}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {t.house.checkInDesc}
          </p>
        </div>

        {/* Checkout card */}
        <div 
          onClick={onOpenCheckin}
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-700 text-white shadow-xs">
              Check-out entro le {APARTMENT_INFO.checkOutLimit}
            </span>
            <span className="text-xs text-amber-700 font-semibold group-hover:translate-x-1 transition-transform">
              Istruzioni Partenza →
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-serif">
            {t.house.checkOutTitle}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {t.house.checkOutDesc}
          </p>
        </div>

      </div>

      {/* Appliances Accordion Section */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
            {t.house.appliancesTitle}
          </h3>
          <p className="text-xs text-slate-500">
            {t.house.appliancesSubtitle}
          </p>
        </div>

        <div className="space-y-3">
          {APPLIANCES.map((app) => {
            const isExpanded = expandedAppliance === app.id;
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedAppliance(isExpanded ? null : app.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      {getApplianceIcon(app.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {app.title[language]}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {app.instructions[language].length} passaggi guida
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3">
                    
                    {/* Instructions list */}
                    <ol className="space-y-2 text-xs text-slate-700">
                      {app.instructions[language].map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed mt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>

                    {/* Pro tip */}
                    {app.tips && (
                      <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200/70 text-xs text-teal-900 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          <strong className="font-semibold">Consiglio: </strong>
                          {app.tips[language]}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recycling Section */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
            {t.house.recyclingTitle}
          </h3>
          <p className="text-xs text-slate-500">
            {t.house.recyclingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WASTE_GUIDE.map((waste) => (
            <div
              key={waste.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  {getWasteIcon(waste.icon)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {waste.name[language]}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {waste.binColor[language]}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {waste.items[language].join(', ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* House Rules */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
            {t.house.rulesTitle}
          </h3>
          <p className="text-xs text-slate-500">
            {t.house.rulesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOUSE_RULES.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {getRuleIcon(rule.icon)}
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900">
                  {rule.title[language]}
                </h4>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  {rule.desc[language]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Amenities */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
            {t.house.amenitiesTitle}
          </h3>
          <p className="text-xs text-slate-500">
            Dotazioni a disposizione nell'alloggio
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AMENITIES.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-teal-50 shrink-0">
                {getAmenityIcon(item.icon)}
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900">
                  {item.name[language]}
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                  {item.description[language]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
