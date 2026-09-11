import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { useCms } from '../../../context/CmsContext';
import { Wifi, Copy, Check, QrCode, Zap, Info } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const WifiPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const { getPageData } = useCms();
  const cmsWifi = getPageData('wifi') || {};
  const w = { ...BOOK_DATA[language].wifi, ...cmsWifi };
  const [copiedSSID, setCopiedSSID] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const handleCopySSID = () => {
    navigator.clipboard.writeText(APARTMENT_INFO.wifiSSID);
    setCopiedSSID(true);
    setTimeout(() => setCopiedSSID(false), 2000);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(APARTMENT_INFO.wifiPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=WIFI:S:${encodeURIComponent(APARTMENT_INFO.wifiSSID)};T:WPA;P:${encodeURIComponent(APARTMENT_INFO.wifiPassword)};;`;

  return (
    <div className="bg-[#080b10] min-h-full rounded-none sm:rounded-3xl p-4 sm:p-6 text-slate-100 space-y-4 pb-24">
      
      {/* Top Header */}
      <PageHeader
        title={w.title}
        language={language}
        onBackToMenu={onBackToMenu}
        onSelectLanguage={onSelectLanguage}
      />

      {/* Speed badge */}
      <div className="p-3 rounded-2xl bg-[#62e6bd]/15 border border-[#62e6bd]/25 text-[#9ef2d3] text-xs flex items-center gap-2.5 backdrop-blur-xl">
        <Zap className="w-5 h-5 text-[#62e6bd] shrink-0" />
        <span className="leading-snug">{w.speedNotice}</span>
      </div>

      {/* QR Code Auto-Connect Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wider">
          <QrCode className="w-4 h-4 text-[#62e6bd]" />
          <span>Scansiona per Connetterti Istantaneamente</span>
        </div>

        <div className="w-44 h-44 mx-auto p-3 bg-white rounded-2xl shadow-inner flex items-center justify-center">
          <img
            src={wifiQrUrl}
            alt="Wi-Fi QR Code"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Inquadra il codice QR con la fotocamera del tuo smartphone per collegarti in un tocco.
        </p>
      </div>

      {/* SSID & Password Boxes */}
      <div className="space-y-2.5">
        {/* SSID */}
        <div className="p-3.5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              {w.networkLabel}
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-white truncate block mt-0.5">
              {APARTMENT_INFO.wifiSSID}
            </span>
          </div>
          <button
            onClick={handleCopySSID}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-1.5 transition border border-white/10 shrink-0 cursor-pointer"
          >
            {copiedSSID ? <Check className="w-3.5 h-3.5 text-[#62e6bd]" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copiedSSID ? 'Copiato!' : 'Copia'}</span>
          </button>
        </div>

        {/* Password */}
        <div className="p-3.5 rounded-2xl bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              {w.passwordLabel}
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-white truncate block mt-0.5">
              {APARTMENT_INFO.wifiPassword}
            </span>
          </div>
          <button
            onClick={handleCopyPass}
            className="px-3 py-1.5 rounded-xl bg-[#62e6bd] hover:bg-[#93f4d4] text-[#07110d] font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            {copiedPass ? <Check className="w-3.5 h-3.5 text-[#07110d]" /> : <Copy className="w-3.5 h-3.5 text-[#07110d]" />}
            <span>{copiedPass ? 'Copiato!' : 'Copia Password'}</span>
          </button>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-white">
          <Info className="w-4 h-4 text-[#62e6bd]" />
          <span>{w.troubleshootTitle}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {w.troubleshootText}
        </p>
      </div>

    </div>
  );
};
