import React, { useState } from 'react';
import { Wifi, Copy, Check, X, ShieldAlert, Sparkles, QrCode } from 'lucide-react';
import { APARTMENT_INFO } from '../data/apartmentData';
import { Language } from '../types';
import { translations } from '../data/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const WiFiModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const [copied, setCopied] = useState(false);
  const t = translations[language];

  if (!isOpen) return null;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(APARTMENT_INFO.wifiPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WiFi QR Code SVG representation (clean vector pattern for instant scan)
  const wifiUri = `WIFI:T:WPA;S:${APARTMENT_INFO.wifiSSID};P:${APARTMENT_INFO.wifiPassword};;`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(wifiUri)}&margin=8&color=0f766e`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="wifi-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative"
      >
        {/* Header with Alpine Teal Accent */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-teal-100 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">{t.wifi.title}</h2>
              <p className="text-xs text-teal-100">{t.wifi.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="w-44 h-44 bg-white p-2.5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center relative group">
              <img 
                src={qrApiUrl} 
                alt="Wi-Fi QR Code" 
                className="w-full h-full object-contain"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-teal-900/5 rounded-xl pointer-events-none" />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600 font-medium">
              <QrCode className="w-3.5 h-3.5 text-teal-700" />
              <span>{t.wifi.scanQr}</span>
            </div>
          </div>

          {/* Credentials Card */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {t.wifi.network}
              </label>
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 rounded-xl text-slate-800 font-mono text-sm font-semibold border border-slate-200/60 select-all">
                <span>{APARTMENT_INFO.wifiSSID}</span>
                <span className="text-[11px] font-sans text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                  Fibra 1Gbps
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {t.wifi.password}
              </label>
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 rounded-xl text-slate-900 font-mono text-sm font-bold border border-slate-200/60">
                <span className="select-all">{APARTMENT_INFO.wifiPassword}</span>
                <button
                  id="copy-wifi-btn"
                  onClick={handleCopyPassword}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.wifi.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.wifi.copyPassword}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Troubleshooting Tip */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-800">
              {t.wifi.troubleshoot}
            </p>
          </div>
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
