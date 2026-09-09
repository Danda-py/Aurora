import React from 'react';
import { MapPin, Phone, Mail, Heart, Sparkles } from 'lucide-react';
import { Language, ActiveTab } from '../types';
import { translations } from '../data/translations';
import { APARTMENT_INFO } from '../data/apartmentData';

interface Props {
  language: Language;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenWiFi: () => void;
}

export const Footer: React.FC<Props> = ({ language, onSelectTab, onOpenWiFi }) => {
  const t = translations[language];

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs mt-16 border-t border-slate-800 pb-20 sm:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-serif font-bold text-base">
                A
              </div>
              <span className="text-white font-serif font-bold text-base">
                {APARTMENT_INFO.name}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              {t.tagline}. Alloggio turistico con corte privata e posto auto interno a pochi passi dal centro storico di Morbegno.
            </p>
            <div className="space-y-1 text-[11px] text-slate-500">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                <span>{APARTMENT_INFO.fullAddress}</span>
              </p>
              <p className="text-slate-500">
                CIR: {APARTMENT_INFO.cirCode} • CIN: {APARTMENT_INFO.cinCode}
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Guida & Sezioni
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onSelectTab('home')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('house')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t.nav.house}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('restaurants')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t.nav.places}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('experiences')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t.nav.experiences}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('guestbook')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t.nav.guestbook}
                </button>
              </li>
            </ul>
          </div>

          {/* Host & Direct info */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">
              Contatti Rapidi
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenWiFi}
                  className="text-teal-400 hover:text-teal-300 transition cursor-pointer flex items-center gap-1"
                >
                  <span>Wi-Fi: {APARTMENT_INFO.wifiSSID}</span>
                </button>
              </li>
              <li>
                <a
                  href={`tel:${APARTMENT_INFO.hostPhone}`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{APARTMENT_INFO.hostPhoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${APARTMENT_INFO.hostEmail}`}
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{APARTMENT_INFO.hostEmail}</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {APARTMENT_INFO.name} • Morbegno (Valtellina)</p>
          <p className="flex items-center gap-1">
            <span>Realizzato per gli ospiti con cura</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            <span>in Valtellina</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
