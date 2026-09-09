import React from 'react';
import { AlertTriangle, Phone, X, ShieldAlert, Building2, Car } from 'lucide-react';
import { APARTMENT_INFO } from '../data/apartmentData';
import { Language } from '../types';
import { translations } from '../data/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const EmergencyModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="emergency-modal-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden relative"
      >
        {/* Header */}
        <div className="bg-rose-600 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-rose-100 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">Numeri di Emergenza</h2>
              <p className="text-xs text-rose-100">Assistenza & Pronto Intervento Morbegno</p>
            </div>
          </div>
        </div>

        {/* Numbers list */}
        <div className="p-6 space-y-3">
          
          {/* 112 SOS */}
          <a
            href="tel:112"
            className="flex items-center justify-between p-3.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-2xl transition group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm">
                112
              </span>
              <div className="text-xs">
                <p className="font-bold text-rose-950">Numero Unico Emergenze</p>
                <p className="text-rose-700 text-[11px]">Pronto Soccorso, Carabinieri, Vigili del Fuoco</p>
              </div>
            </div>
            <Phone className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </a>

          {/* Host Direct */}
          <a
            href={`tel:${APARTMENT_INFO.hostPhone}`}
            className="flex items-center justify-between p-3.5 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-2xl transition group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                Host
              </span>
              <div className="text-xs">
                <p className="font-bold text-teal-950">Host Nino (Appartamento)</p>
                <p className="text-teal-700 text-[11px]">{APARTMENT_INFO.hostPhoneDisplay}</p>
              </div>
            </div>
            <Phone className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
          </a>

          {/* Guardia Medica */}
          <a
            href="tel:116117"
            className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                Med
              </span>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Guardia Medica (116 117)</p>
                <p className="text-slate-500 text-[11px]">Assistenza sanitaria non urgente</p>
              </div>
            </div>
            <Phone className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
          </a>

          {/* Ospedale Morbegno */}
          <a
            href="tel:0342607111"
            className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                Osp
              </span>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Ospedale Morbegno</p>
                <p className="text-slate-500 text-[11px]">0342 607111</p>
              </div>
            </div>
            <Phone className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
          </a>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
          >
            {t.pwa.close}
          </button>
        </div>
      </div>
    </div>
  );
};
