import React, { useState } from 'react';
import { LogIn, LogOut, CheckCircle, Circle, MapPin, Key, Car, Sparkles, X, ShieldCheck } from 'lucide-react';
import { APARTMENT_INFO } from '../data/apartmentData';
import { Language } from '../types';
import { translations } from '../data/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialMode?: 'checkin' | 'checkout';
}

export const CheckinCheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  initialMode = 'checkin',
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'checkout'>(initialMode);
  const [checkinDone, setCheckinDone] = useState<Record<string, boolean>>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });
  const [checkoutDone, setCheckoutDone] = useState<Record<string, boolean>>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });

  const t = translations[language];

  if (!isOpen) return null;

  const toggleCheckinStep = (id: string) => {
    setCheckinDone(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCheckoutStep = (id: string) => {
    setCheckoutDone(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="checkin-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold font-serif">
              {activeTab === 'checkin' ? t.house.checkInTitle : t.house.checkOutTitle}
            </h2>
            <p className="text-xs text-teal-100">
              {APARTMENT_INFO.address}, Morbegno (Valtellina)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-teal-100 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'checkin'
                ? 'border-teal-700 text-teal-800 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Check-in ({APARTMENT_INFO.checkInStart})</span>
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'checkout'
                ? 'border-teal-700 text-teal-800 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Check-out ({APARTMENT_INFO.checkOutLimit})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {activeTab === 'checkin' ? (
            <div className="space-y-4">
              {/* Highlight Card */}
              <div className="p-4 bg-teal-50/80 rounded-xl border border-teal-200/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-950">
                  <p className="font-bold">
                    {language === 'it' && "Accesso Semplice & Parcheggio Riservato"}
                    {language === 'en' && "Easy Self Check-in & Free Courtyard Parking"}
                    {language === 'de' && "Einfacher Check-in & Privatparkplatz im Hof"}
                  </p>
                  <p className="mt-0.5 text-teal-800">
                    {language === 'it' && `Disponibile dalle ore ${APARTMENT_INFO.checkInStart}. ${APARTMENT_INFO.parkingSpot}.`}
                    {language === 'en' && `Available from ${APARTMENT_INFO.checkInStart}. ${APARTMENT_INFO.parkingSpot}.`}
                    {language === 'de' && `Verfügbar ab ${APARTMENT_INFO.checkInStart} Uhr. ${APARTMENT_INFO.parkingSpot}.`}
                  </p>
                </div>
              </div>

              {/* Step Checklist */}
              <div className="space-y-3">
                <div 
                  onClick={() => toggleCheckinStep('step1')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checkinDone.step1 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="mt-0.5 text-teal-700 shrink-0">
                    {checkinDone.step1 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {language === 'it' && "1. Raggiungi Via Serta 188D"}
                      {language === 'en' && "1. Arrive at Via Serta 188D"}
                      {language === 'de' && "1. Ankunft in Via Serta 188D"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {language === 'it' && "Entra nella corte residenziale. La strada è comoda e adiacente al centro di Morbegno."}
                      {language === 'en' && "Enter the residential courtyard. Conveniently located near Morbegno center."}
                      {language === 'de' && "Einfahrt in den ruhigen Innenhof. Nahe am Zentrum von Morbegno."}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => toggleCheckinStep('step2')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checkinDone.step2 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="mt-0.5 text-teal-700 shrink-0">
                    {checkinDone.step2 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {language === 'it' && "2. Parcheggia l'Auto"}
                      {language === 'en' && "2. Park in Dedicated Space"}
                      {language === 'de' && "2. Parkplatz belegen"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {language === 'it' && "Parcheggia nel posto riservato all'appartamento nella corte (n. 4)."}
                      {language === 'en' && "Park your vehicle in space #4 inside the courtyard."}
                      {language === 'de' && "Parken Sie auf dem reservierten Stellplatz Nr. 4 im Innenhof."}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => toggleCheckinStep('step3')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checkinDone.step3 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="mt-0.5 text-teal-700 shrink-0">
                    {checkinDone.step3 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {language === 'it' && "3. Consegna Chiavi a Mano"}
                      {language === 'en' && "3. In-Person Key Handover"}
                      {language === 'de' && "3. Persönliche Schlüsselübergabe"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {language === 'it' && "Le chiavi dell'appartamento vi verranno consegnate direttamente a mano dall'host al vostro arrivo."}
                      {language === 'en' && "The apartment keys will be handed over to you directly in person by the host upon your arrival."}
                      {language === 'de' && "Die Wohnungsschlüssel werden Ihnen bei Ihrer Ankunft persönlich vom Gastgeber übergeben."}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => toggleCheckinStep('step4')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checkinDone.step4 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="mt-0.5 text-teal-700 shrink-0">
                    {checkinDone.step4 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {language === 'it' && "4. Connettiti al Wi-Fi & Rilassati"}
                      {language === 'en' && "4. Connect to Wi-Fi & Enjoy"}
                      {language === 'de' && "4. WLAN verbinden & Wohlfühlen"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {language === 'it' && "Troverai cialde di caffè di benvenuto in cucina e asciugamani freschi in bagno."}
                      {language === 'en' && "Complimentary coffee pods in kitchen and fresh towels in bathroom."}
                      {language === 'de' && "Willkommens-Kaffee in der Küche und frische Handtücher im Bad."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-3">
                <LogOut className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950">
                  <p className="font-bold">
                    {language === 'it' && `Partenza entro le ore ${APARTMENT_INFO.checkOutLimit}`}
                    {language === 'en' && `Check-out by ${APARTMENT_INFO.checkOutLimit} AM`}
                    {language === 'de' && `Check-out bis ${APARTMENT_INFO.checkOutLimit} Uhr`}
                  </p>
                  <p className="mt-0.5 text-amber-800">
                    {language === 'it' && "Ti ringraziamo per aver soggiornato all'Appartamento Aurora! Ecco 4 semplici passaggi prima di partire:"}
                    {language === 'en' && "Thank you for staying at Aurora Apartment! Here are 4 quick steps before departure:"}
                    {language === 'de' && "Vielen Dank für Ihren Aufenthalt im Appartamento Aurora! 4 kurze Schritte zur Abreise:"}
                  </p>
                </div>
              </div>

              {/* Checkout Steps */}
              <div className="space-y-3">
                <div 
                  onClick={() => toggleCheckoutStep('step1')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checkoutDone.step1 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="mt-0.5 text-teal-700 shrink-0">
                    {checkoutDone.step1 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {language === 'it' && "1. Svuota la Spazzatura"}
                      {language === 'en' && "1. Dispose of Waste"}
                      {language === 'de' && "1. Müll entsorgen"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {language === 'it' && "Deposita i sacchetti nei rispettivi mastelli differenziati all'esterno."}
                      {language === 'en' && "Drop sorted bags into corresponding outside recycling bins."}
                      {language === 'de' && "Müll in die jeweiligen Außenbehälter werfen."}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => toggleCheckoutStep('step2')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checkoutDone.step2 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="mt-0.5 text-teal-700 shrink-0">
                    {checkoutDone.step2 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {language === 'it' && "2. Cucina & Stoviglie"}
                      {language === 'en' && "2. Dishes & Kitchen"}
                      {language === 'de' && "2. Küche & Geschirr"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {language === 'it' && "Carica o avvia la lavastoviglie e controlla di non aver dimenticato cibo nel frigo."}
                      {language === 'en' && "Start the dishwasher and check fridge for personal food."}
                      {language === 'de' && "Geschirrspüler einschalten und Kühlschrank prüfen."}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => toggleCheckoutStep('step3')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checkoutDone.step3 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="mt-0.5 text-teal-700 shrink-0">
                    {checkoutDone.step3 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {language === 'it' && "3. Luci & Finestre"}
                      {language === 'en' && "3. Lights, Windows & Heating"}
                      {language === 'de' && "3. Fenster & Heizung"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {language === 'it' && "Chiudi le finestre, spegni le luci e imposta il termostato su 18°C."}
                      {language === 'en' && "Close windows, turn off lights, and set thermostat to 18°C."}
                      {language === 'de' && "Fenster schließen, Lichter aus und Thermostat auf 18°C stellen."}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => toggleCheckoutStep('step4')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checkoutDone.step4 ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="mt-0.5 text-teal-700 shrink-0">
                    {checkoutDone.step4 ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {language === 'it' && "4. Riconsegna Chiavi"}
                      {language === 'en' && "4. Key Return"}
                      {language === 'de' && "4. Schlüsselrückgabe"}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {language === 'it' && "Lascia le chiavi sul tavolo da pranzo e chiudi la porta, oppure riponile nella keybox."}
                      {language === 'en' && "Leave the keys on the dining table or place back in the lockbox."}
                      {language === 'de' && "Schlüssel auf den Esstisch legen oder in die Schlüsselbox geben."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition cursor-pointer shadow-xs"
          >
            {t.pwa.close}
          </button>
        </div>
      </div>
    </div>
  );
};
