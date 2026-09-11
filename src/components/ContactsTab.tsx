import React from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  AlertTriangle, 
  ShieldAlert, 
  Building2, 
  Car, 
  Cross, 
  Clock, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { APARTMENT_INFO } from '../data/apartmentData';

interface Props {
  language: Language;
}

export const ContactsTab: React.FC<Props> = ({ language }) => {
  const t = translations[language];

  const getWhatsAppMessage = () => {
    switch (language) {
      case 'it': return "Ciao Nino, ti contatto per assistenza all'Appartamento Aurora...";
      case 'en': return "Hello Nino, I am contacting you for assistance at Aurora Apartment...";
      case 'de': return "Hallo Nino, ich kontaktiere Sie für Unterstützung im Appartamento Aurora...";
      case 'fr': return "Bonjour Nino, je vous contacte pour de l'aide à l'Appartement Aurora...";
      case 'es': return "¡Hola Nino! Te contacto para asistencia en el Apartamento Aurora...";
      default: return "Hello Nino, I am contacting you regarding Aurora Apartment...";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
          {t.contacts.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.contacts.subtitle}
        </p>
      </div>

      {/* Host Card */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-inner font-serif text-2xl font-bold text-amber-300">
                N
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Host Diretto
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                  {t.contacts.hostName}
                </h3>
                <p className="text-xs text-teal-100">
                  {t.contacts.hostRole} • {t.contacts.availableHours}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            {/* WhatsApp */}
            <a
              id="host-whatsapp-link"
              href={`https://wa.me/${APARTMENT_INFO.hostWhatsApp}?text=${encodeURIComponent(getWhatsAppMessage())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.contacts.chatWhatsapp}</span>
            </a>

            {/* Direct Call */}
            <a
              id="host-phone-link"
              href={`tel:${APARTMENT_INFO.hostPhone}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              <Phone className="w-4 h-4 text-teal-300" />
              <span>{t.contacts.phoneCall}</span>
            </a>

            {/* Email */}
            <a
              id="host-email-link"
              href={`mailto:${APARTMENT_INFO.hostEmail}?subject=Appartamento Aurora Morbegno`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition cursor-pointer"
            >
              <Mail className="w-4 h-4 text-amber-300" />
              <span>{t.contacts.sendEmail}</span>
            </a>

          </div>

          <div className="text-[11px] text-teal-200/80 pt-2 border-t border-white/10 flex flex-wrap gap-4">
            <span>CIR: {APARTMENT_INFO.cirCode}</span>
            <span>CIN: {APARTMENT_INFO.cinCode}</span>
            <span>Indirizzo: {APARTMENT_INFO.fullAddress}</span>
          </div>
        </div>
      </div>

      {/* Emergency & Numbers Section */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
            {t.contacts.emergencyHeader}
          </h3>
          <p className="text-xs text-slate-500">
            Servizi di soccorso, sanità e trasporti locali a Morbegno
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* SOS 112 */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                112
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-rose-950">Numero Unico Emergenze</h4>
                <p className="text-rose-700 text-[11px]">Ambulanza, Vigili del Fuoco, Polizia</p>
              </div>
            </div>
            <a
              href="tel:112"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              Chiama
            </a>
          </div>

          {/* Guardia Medica */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900">Guardia Medica</h4>
                <p className="text-slate-500 text-[11px]">Continuità assistenziale notturna/festiva</p>
              </div>
            </div>
            <a
              href="tel:116117"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
            >
              116 117
            </a>
          </div>

          {/* Ospedale Morbegno */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900">Ospedale di Morbegno</h4>
                <p className="text-slate-500 text-[11px]">Presidio Sanitario Territoriale</p>
              </div>
            </div>
            <a
              href="tel:0342607111"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
            >
              0342 607111
            </a>
          </div>

          {/* Carabinieri Morbegno */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900">Carabinieri Morbegno</h4>
                <p className="text-slate-500 text-[11px]">Caserma Via Stelvio</p>
              </div>
            </div>
            <a
              href="tel:0342610210"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
            >
              0342 610210
            </a>
          </div>

          {/* Taxi Morbegno */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900">Taxi Morbegno</h4>
                <p className="text-slate-500 text-[11px]">Servizio transfer stazioni e valli</p>
              </div>
            </div>
            <a
              href="tel:+393381234567"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
            >
              Chiama Taxi
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};
