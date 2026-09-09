import React from 'react';
import { X, Home, Users, BedDouble, Bath, Car, Wifi, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { APARTMENT_INFO, AMENITIES } from '../data/apartmentData';
import { translations } from '../data/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HouseSpecsModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900">
                {t.house.specsTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {APARTMENT_INFO.name} • {APARTMENT_INFO.address}, {APARTMENT_INFO.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <Home className="w-4 h-4 text-teal-700 mx-auto mb-1" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Superficie</span>
            <p className="text-sm font-bold text-slate-900">{APARTMENT_INFO.surface}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <Users className="w-4 h-4 text-amber-700 mx-auto mb-1" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Posti Letto</span>
            <p className="text-sm font-bold text-slate-900">Max {APARTMENT_INFO.maxGuests} ospiti</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <BedDouble className="w-4 h-4 text-teal-700 mx-auto mb-1" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Camere</span>
            <p className="text-sm font-bold text-slate-900">{APARTMENT_INFO.bedrooms} Camera + Salotto</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <Bath className="w-4 h-4 text-blue-700 mx-auto mb-1" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Bagni</span>
            <p className="text-sm font-bold text-slate-900">{APARTMENT_INFO.bathrooms} con Doccia</p>
          </div>
        </div>

        {/* Bed details & Layout */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/70 space-y-2">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-xs font-serif">
            <BedDouble className="w-4 h-4 text-teal-700" />
            <span>Disposizione Letti & Spazi</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            • <strong>Camera da letto:</strong> Letto matrimoniale King Size con materasso ortopedico, armadio 4 ante, comodini con prese USB.<br />
            • <strong>Zona giorno:</strong> Comodo divano letto matrimoniale con apertura facilitata e doghe in legno.<br />
            • <strong>Piano:</strong> {APARTMENT_INFO.floor}, comodo e senza barriere architettoniche rilevanti.
          </p>
        </div>

        {/* Legal Codes (CIR & CIN) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Codici Struttura Ricettiva (Regione Lombardia)</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-600">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">CIR: {APARTMENT_INFO.cirCode}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">CIN: {APARTMENT_INFO.cinCode}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 shrink-0">
            Host: <strong>{APARTMENT_INFO.hostName}</strong>
          </div>
        </div>

        {/* Close button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition cursor-pointer"
          >
            {t.pwa.close}
          </button>
        </div>

      </div>
    </div>
  );
};
