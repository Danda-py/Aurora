import React from 'react';
import { AlertTriangle, Phone, X, ShieldAlert, Building2, MapPin, ExternalLink, Pill, Shield, HeartPulse } from 'lucide-react';
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

  const isIt = language === 'it';
  const isEn = language === 'en';
  const isDe = language === 'de';
  const isFr = language === 'fr';

  const labels = {
    title: isIt ? 'Numeri di Emergenza' : isEn ? 'Emergency Numbers' : isDe ? 'Notfallnummern' : isFr ? 'Numéros d’urgence' : 'Números de Emergencia',
    subtitle: isIt ? 'Assistenza & Pronto Intervento Morbegno' : isEn ? 'Morbegno Emergency & Assistance' : isDe ? 'Notruf & Hilfe in Morbegno' : isFr ? 'Assistance & Urgences Morbegno' : 'Asistencia y Emergencias Morbegno',
    call: isIt ? 'Chiama' : isEn ? 'Call' : isDe ? 'Anrufen' : isFr ? 'Appeler' : 'Llamar',
    maps: isIt ? 'Mappa' : isEn ? 'Map' : isDe ? 'Karte' : isFr ? 'Carte' : 'Mapa',
    checkDuty: isIt ? 'Farmacie Aperte' : isEn ? 'Open Pharmacies' : isDe ? 'Offene Apotheken' : isFr ? 'Pharmacies Ouvertes' : 'Farmacias Abiertas',
    carabinieriTitle: isIt ? 'Centro Comando Carabinieri Morbegno' : isEn ? 'Carabinieri Police Command - Morbegno' : isDe ? 'Carabinieri Polizeikommando Morbegno' : isFr ? 'Poste Commandement Carabinieri Morbegno' : 'Centro de Mando Carabinieri Morbegno',
    carabinieriDesc: 'Via Morelli 24, Morbegno • 0342 610210',
    hospitalTitle: isIt ? 'Ospedale di Morbegno' : isEn ? 'Morbegno Hospital' : isDe ? 'Krankenhaus Morbegno' : isFr ? 'Hôpital de Morbegno' : 'Hospital de Morbegno',
    hospitalDesc: isIt ? 'Presidio Sanitario Territoriale • Via Morelli 1 • 0342 607111' : isEn ? 'Territorial Healthcare Center • Via Morelli 1 • 0342 607111' : isDe ? 'Regionales Krankenhaus • Via Morelli 1 • 0342 607111' : isFr ? 'Pôle Hospitalier Territorial • Via Morelli 1 • 0342 607111' : 'Centro Hospitalario • Via Morelli 1 • 0342 607111',
    pharmacyTitle: isIt ? 'Farmacia di Turno (Morbegno)' : isEn ? 'On-Duty Pharmacy (Morbegno)' : isDe ? 'Notdienstapotheke Morbegno' : isFr ? 'Pharmacie de Garde (Morbegno)' : 'Farmacia de Guardia (Morbegno)',
    pharmacyDesc: isIt ? 'Verifica le farmacie aperte adesso in tempo reale (PharmAround)' : isEn ? 'Check real-time open pharmacies nearby (PharmAround)' : isDe ? 'Aktuell geöffnete Apotheken in Echtzeit (PharmAround)' : isFr ? 'Vérifiez les pharmacies ouvertes en direct (PharmAround)' : 'Consulta farmacias de guardia en tiempo real (PharmAround)',
    guardTitle: isIt ? 'Guardia Medica (116 117)' : isEn ? 'Medical Guard (116 117)' : isDe ? 'Ärztlicher Bereitschaftsdienst (116 117)' : isFr ? 'Médecin de Garde (116 117)' : 'Guardia Médica (116 117)',
    guardDesc: isIt ? 'Assistenza sanitaria non urgente notturna e festiva' : isEn ? 'Non-urgent night & holiday healthcare' : isDe ? 'Nacht- und Wochenendbereitschaft' : isFr ? 'Soins non urgents de nuit et jours fériés' : 'Asistencia médica no urgente nocturna y festivos'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="emergency-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden relative max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-rose-600 px-6 py-5 text-white relative shrink-0">
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
              <h2 className="text-lg font-bold font-serif">{labels.title}</h2>
              <p className="text-xs text-rose-100">{labels.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Numbers list */}
        <div className="p-5 space-y-3 overflow-y-auto">
          
          {/* 112 SOS */}
          <a
            href="tel:112"
            className="flex items-center justify-between p-3.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-2xl transition group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                112
              </span>
              <div className="text-xs">
                <p className="font-bold text-rose-950 text-sm">Numero Unico Europeo 112</p>
                <p className="text-rose-700 text-[11px]">Pronto Soccorso, Ambulanza, Vigili del Fuoco, Forze dell'Ordine</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1 shrink-0 group-hover:bg-rose-700 transition">
              <Phone className="w-3.5 h-3.5" />
              <span>{labels.call}</span>
            </div>
          </a>

          {/* 1. Centro Comando Carabinieri Morbegno */}
          <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 text-sm">{labels.carabinieriTitle}</p>
                <p className="text-slate-600 text-[11px]">{labels.carabinieriDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <a
                href="https://maps.google.com/?q=Carabinieri+Morbegno+Via+Morelli+24"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                title="Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{labels.maps}</span>
              </a>
              <a
                href="tel:0342610210"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{labels.call}</span>
              </a>
            </div>
          </div>

          {/* 2. Ospedale di Morbegno */}
          <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 text-sm">{labels.hospitalTitle}</p>
                <p className="text-slate-600 text-[11px]">{labels.hospitalDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <a
                href="https://maps.google.com/?q=Ospedale+di+Morbegno+Via+Morelli+1"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                title="Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{labels.maps}</span>
              </a>
              <a
                href="tel:0342607111"
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{labels.call}</span>
              </a>
            </div>
          </div>

          {/* 3. Farmacia di Turno (PharmAround) */}
          <div className="p-3.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-emerald-950 text-sm">{labels.pharmacyTitle}</p>
                  <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.2 rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px] mt-0.5">{labels.pharmacyDesc}</p>
              </div>
            </div>
            <div className="self-end sm:self-auto shrink-0">
              <a
                href="https://web.pharmaround.it/farmacie/morbegno?onlyOpen=true&distance=5"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <span>{labels.checkDuty}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Guardia Medica */}
          <a
            href="tel:116117"
            className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0">
                116 117
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">{labels.guardTitle}</p>
                <p className="text-slate-500 text-[11px]">{labels.guardDesc}</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-200 group-hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 shrink-0 transition">
              <Phone className="w-3.5 h-3.5" />
              <span>{labels.call}</span>
            </div>
          </a>

          {/* Host Direct */}
          <a
            href={`tel:${APARTMENT_INFO.hostPhone}`}
            className="flex items-center justify-between p-3.5 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 rounded-2xl transition group"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                Host
              </span>
              <div className="text-xs">
                <p className="font-bold text-teal-950">{APARTMENT_INFO.hostName} (Appartamento)</p>
                <p className="text-teal-700 text-[11px]">{APARTMENT_INFO.hostPhoneDisplay}</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 group-hover:bg-teal-800 transition">
              <Phone className="w-3.5 h-3.5" />
              <span>{labels.call}</span>
            </div>
          </a>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
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

