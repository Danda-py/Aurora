import React from 'react';
import { Wifi, Key, MessageCircle, Phone, Navigation, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { APARTMENT_INFO } from '../data/apartmentData';

interface Props {
  language: Language;
  onOpenWiFi: () => void;
  onOpenCheckin: () => void;
  onOpenEmergency: () => void;
}

export const QuickActionToolbar: React.FC<Props> = ({
  language,
  onOpenWiFi,
  onOpenCheckin,
  onOpenEmergency,
}) => {
  const t = translations[language];

  const getWhatsAppMessage = () => {
    switch (language) {
      case 'it': return "Ciao Nino! Ti scrivo dall'Appartamento Aurora per informazioni...";
      case 'en': return "Hello Nino! I'm texting you from Aurora Apartment regarding...";
      case 'de': return "Hallo Nino! Ich schreibe bezüglich des Appartamento Aurora...";
      case 'fr': return "Bonjour Nino ! Je vous écris depuis l'Appartement Aurora...";
      case 'es': return "¡Hola Nino! Te escribo desde el Apartamento Aurora...";
      default: return "Hello Nino! I'm texting from Aurora Apartment...";
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
      
      {/* Wi-Fi Action */}
      <button
        id="quick-wifi-btn"
        onClick={onOpenWiFi}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-teal-50/70 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-teal-50 group-hover:bg-teal-700 group-hover:text-white text-teal-700 flex items-center justify-center transition-colors mb-1.5">
          <Wifi className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-800 text-center group-hover:text-teal-900 line-clamp-1">
          {t.quickActions.wifi}
        </span>
      </button>

      {/* Check-in / Out Action */}
      <button
        id="quick-checkin-btn"
        onClick={onOpenCheckin}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-teal-50/70 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-600 group-hover:text-white text-amber-700 flex items-center justify-center transition-colors mb-1.5">
          <Key className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-800 text-center group-hover:text-amber-900 line-clamp-1">
          {t.quickActions.checkInOut}
        </span>
      </button>

      {/* WhatsApp Host Nino */}
      <a
        id="quick-whatsapp-btn"
        href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(getWhatsAppMessage())}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-emerald-50/70 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition-colors mb-1.5">
          <MessageCircle className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-800 text-center group-hover:text-emerald-900 line-clamp-1">
          {t.quickActions.whatsapp}
        </span>
      </a>

      {/* Direct Phone Call Host Nino */}
      <a
        id="quick-call-btn"
        href={`tel:${APARTMENT_INFO.hostPhone}`}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-teal-50/70 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-800 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors mb-1.5">
          <Phone className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-800 text-center group-hover:text-slate-900 line-clamp-1">
          {t.quickActions.callHost}
        </span>
      </a>

      {/* Google Maps Directions */}
      <a
        id="quick-directions-btn"
        href={APARTMENT_INFO.googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-blue-50/70 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 flex items-center justify-center transition-colors mb-1.5">
          <Navigation className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-800 text-center group-hover:text-blue-900 line-clamp-1">
          {t.quickActions.directions}
        </span>
      </a>

      {/* Emergency SOS */}
      <button
        id="quick-sos-btn"
        onClick={onOpenEmergency}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-rose-50/70 border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-rose-50 group-hover:bg-rose-600 group-hover:text-white text-rose-600 flex items-center justify-center transition-colors mb-1.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-800 text-center group-hover:text-rose-900 line-clamp-1">
          {t.quickActions.emergency}
        </span>
      </button>

    </div>
  );
};
