import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Wifi, 
  Phone, 
  Mail, 
  Star, 
  ShieldCheck, 
  Clock, 
  Car, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Navigation,
  Sliders,
  Info,
  Zap,
  Thermometer
} from 'lucide-react';
import { 
  fetchPropertyConfig, 
  savePropertyConfig, 
  PropertyConfig, 
  FALLBACK_PROPERTY_CONFIG 
} from '../../services/propertyService';

export const PropertySettingsManager: React.FC = () => {
  const [config, setConfig] = useState<PropertyConfig>(FALLBACK_PROPERTY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const data = await fetchPropertyConfig();
    setConfig(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await savePropertyConfig(config);
    if (res.success && res.config) {
      setConfig(res.config);

      setStatusMessage({ type: 'success', text: 'Impostazioni della struttura e istruzioni impianti salvate con successo!' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Errore durante il salvataggio.' });
    }
    setSaving(false);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleDetectGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Geolocalizzazione non supportata dal browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setConfig((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6))
        }));
        setIsLocating(false);
        setStatusMessage({ 
          type: 'success', 
          text: `Coordinate GPS rilevate con successo: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (Precisione: ±${Math.round(pos.coords.accuracy)}m)` 
        });
        setTimeout(() => setStatusMessage(null), 4000);
      },
      (err) => {
        setIsLocating(false);
        setStatusMessage({ type: 'error', text: `Impossibile rilevare posizione GPS: ${err.message}` });
        setTimeout(() => setStatusMessage(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 text-gray-500">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="text-xs font-mono">Caricamento configurazione struttura...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Banner / Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
            <Building2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">{config.name || 'La Tua Struttura'}</h3>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-400/30">
                SaaS Config
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Personalizza le informazioni, le regole di geofencing e le credenziali visibili all'ospite.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full md:w-auto py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 font-medium border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* SECTION 1: Informazioni Generali */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
          <Building2 className="w-4 h-4 text-gray-600" />
          <span>Informazioni Generali & Indirizzo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Nome Struttura</label>
            <input
              type="text"
              required
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="Es. Aurora in Valtellina"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Slogan / Sottotitolo</label>
            <input
              type="text"
              value={config.tagline}
              onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
              placeholder="Es. Luxury Apartment & Smart Hospitality"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-gray-600 mb-1">Indirizzo Completo</label>
            <input
              type="text"
              required
              value={config.fullAddress}
              onChange={(e) => setConfig({ ...config, fullAddress: e.target.value, address: e.target.value })}
              placeholder="Es. Via Garibaldi 12, 23017 Morbegno (SO)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Città</label>
            <input
              type="text"
              value={config.city}
              onChange={(e) => setConfig({ ...config, city: e.target.value })}
              placeholder="Es. Morbegno"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-mono text-gray-600 mb-1">Provincia</label>
              <input
                type="text"
                value={config.province}
                onChange={(e) => setConfig({ ...config, province: e.target.value })}
                placeholder="SO"
                maxLength={4}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-600 mb-1">CAP</label>
              <input
                type="text"
                value={config.zip}
                onChange={(e) => setConfig({ ...config, zip: e.target.value })}
                placeholder="23017"
                maxLength={6}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Geolocalizzazione GPS & Geofencing */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Geolocalizzazione GPS & Geofencing Prossimità</span>
          </div>
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isLocating}
            className="py-1.5 px-3 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            {isLocating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
            <span>{isLocating ? 'Rilevamento...' : 'Rileva GPS Qui'}</span>
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Il geofencing consente all'ospite di sbloccare il portone con il proprio smartphone via 4G/5G se si trova entro il raggio stabilito dall'ingresso della struttura.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Latitudine GPS</label>
            <input
              type="number"
              step="any"
              value={config.latitude}
              onChange={(e) => setConfig({ ...config, latitude: parseFloat(e.target.value) || 0 })}
              placeholder="46.1345"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Longitudine GPS</label>
            <input
              type="number"
              step="any"
              value={config.longitude}
              onChange={(e) => setConfig({ ...config, longitude: parseFloat(e.target.value) || 0 })}
              placeholder="9.5742"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Raggio Geofence (Metri)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={20}
                max={300}
                value={config.geofenceRadiusMeters}
                onChange={(e) => setConfig({ ...config, geofenceRadiusMeters: parseInt(e.target.value, 10) || 80 })}
                className="w-24 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
              />
              <span className="text-xs text-gray-500 font-mono">metri (Consigliato: 80m)</span>
            </div>
          </div>
        </div>

        {/* Policy Selector */}
        <div>
          <label className="block text-xs font-mono text-gray-600 mb-1.5">Politica di Verifica Prossimità Apertura Porta</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setConfig({ ...config, proximityPolicy: 'wifi_or_gps' })}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                config.proximityPolicy === 'wifi_or_gps'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Wi-Fi o GPS</span>
                {config.proximityPolicy === 'wifi_or_gps' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-gray-500 font-normal mt-1">
                Apre se connesso al Wi-Fi OPPURE se il GPS rileva l'ospite sotto casa. Ideale per arrivo ospiti.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setConfig({ ...config, proximityPolicy: 'wifi_only' })}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                config.proximityPolicy === 'wifi_only'
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Solo Wi-Fi</span>
                {config.proximityPolicy === 'wifi_only' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <p className="text-[11px] text-gray-500 font-normal mt-1">
                Richiede obbligatoriamente che il telefono dell'ospite sia connesso al Wi-Fi di casa.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setConfig({ ...config, proximityPolicy: 'gps_only' })}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                config.proximityPolicy === 'gps_only'
                  ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Solo GPS</span>
                {config.proximityPolicy === 'gps_only' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
              </div>
              <p className="text-[11px] text-gray-500 font-normal mt-1">
                Convalida la posizione tramite GPS indipendentemente dalla rete internet utilizzata.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Rete Wi-Fi Ospiti */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
          <Wifi className="w-4 h-4 text-cyan-600" />
          <span>Credenziali Wi-Fi per gli Ospiti</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Nome Rete (SSID)</label>
            <input
              type="text"
              required
              value={config.wifiSSID}
              onChange={(e) => setConfig({ ...config, wifiSSID: e.target.value })}
              placeholder="Es. Casa_Aurora"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Password Wi-Fi</label>
            <input
              type="text"
              required
              value={config.wifiPassword}
              onChange={(e) => setConfig({ ...config, wifiPassword: e.target.value })}
              placeholder="Es. password1234"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Contatti Host & Recensioni */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>Contatti Host & Link Recensioni Google</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Nome Host / Gestore</label>
            <input
              type="text"
              value={config.hostName}
              onChange={(e) => setConfig({ ...config, hostName: e.target.value })}
              placeholder="Es. Nino"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Numero WhatsApp (senza spazi)</label>
            <input
              type="text"
              value={config.hostWhatsApp}
              onChange={(e) => setConfig({ ...config, hostWhatsApp: e.target.value })}
              placeholder="+393281234567"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Telefono Chiamate</label>
            <input
              type="text"
              value={config.hostPhone}
              onChange={(e) => setConfig({ ...config, hostPhone: e.target.value })}
              placeholder="+39 328 123 4567"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Email Notifiche Host</label>
            <input
              type="email"
              value={config.hostEmail}
              onChange={(e) => setConfig({ ...config, hostEmail: e.target.value })}
              placeholder="host@gmail.com"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-gray-600 mb-1 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Link Recensioni Google Maps (inviato all'ospite al check-out)</span>
            </label>
            <input
              type="url"
              value={config.googleReviewUrl}
              onChange={(e) => setConfig({ ...config, googleReviewUrl: e.target.value })}
              placeholder="https://g.page/r/..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: Normativa Obbligatoria (CIN & CIR) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Codici Normativi Obbligatori (Ministero del Turismo)</span>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
            Tassa di soggiorno gestita direttamente dal portale
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Codice CIN (Nazionale)</label>
            <input
              type="text"
              value={config.cinCode}
              onChange={(e) => setConfig({ ...config, cinCode: e.target.value })}
              placeholder="IT014045B4P9XYZABC"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Codice CIR (Regionale)</label>
            <input
              type="text"
              value={config.cirCode}
              onChange={(e) => setConfig({ ...config, cirCode: e.target.value })}
              placeholder="014045-CNI-00042"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: Orari Check-in & Posto Auto */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Orari di Soggiorno & Posto Auto</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Inizio Check-in</label>
            <input
              type="time"
              value={config.checkInStart}
              onChange={(e) => setConfig({ ...config, checkInStart: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Fine Check-in (Self)</label>
            <input
              type="time"
              value={config.checkInEnd}
              onChange={(e) => setConfig({ ...config, checkInEnd: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-600 mb-1">Limite Check-out</label>
            <input
              type="time"
              value={config.checkOutLimit}
              onChange={(e) => setConfig({ ...config, checkOutLimit: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono text-xs focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-mono text-gray-600 mb-1 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-gray-600" />
              <span>Istruzioni Parcheggio / Posto Auto</span>
            </label>
            <input
              type="text"
              value={config.parkingSpot}
              onChange={(e) => setConfig({ ...config, parkingSpot: e.target.value })}
              placeholder="Es. Box N. 4 interno cortile (telecomando o chiave in salotto)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 7: Guida Impianti & Elettrodomestici */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Istruzioni Salvavita, Quadro Elettrico & Riscaldamento/Clima</span>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Questi testi compaiono direttamente nella guida della casa per gli ospiti quando selezionano gli elettrodomestici e gli impianti.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-700 mb-1 flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Posizione Quadro Elettrico / Salvavita (Blackout & Sovraccarico Induzione/Forno)</span>
            </label>
            <textarea
              rows={3}
              value={config.breakerBoxInstructions || ''}
              onChange={(e) => setConfig({ ...config, breakerBoxInstructions: e.target.value })}
              placeholder="Es. Il quadro elettrico si trova all'ingresso. Se salta per induzione+forno..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-700 mb-1 flex items-center gap-1.5 font-bold">
              <Thermometer className="w-3.5 h-3.5 text-rose-600" />
              <span>Come Usare Riscaldamento, Termostato & Climatizzatore</span>
            </label>
            <textarea
              rows={3}
              value={config.climateInstructions || ''}
              onChange={(e) => setConfig({ ...config, climateInstructions: e.target.value })}
              placeholder="Es. Termostato a parete corridoio (20-21°C) e telecomando clima per fresco o caldo..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Salvataggio in corso...' : 'Salva Tutte le Impostazioni'}</span>
        </button>
      </div>

    </form>
  );
};
