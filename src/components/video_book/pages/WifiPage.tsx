import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
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
  const t = VIDEO_TRANSLATIONS[language] || VIDEO_TRANSLATIONS.it;
  const labels = VIDEO_PAGE_LABELS[language] || VIDEO_PAGE_LABELS.it;
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
    <div className="aurora-concierge min-h-screen text-white">
      <div className="aurora-subpage-shell">
        
        {/* Top Header */}
        <PageHeader
          title={w.title}
          category={t.tiles.wifi}
          language={language}
          onBackToMenu={onBackToMenu}
          onSelectLanguage={onSelectLanguage}
        />

        {/* Speed badge */}
        <div className="aurora-glass-card p-4 flex items-center gap-3">
          <div className="aurora-icon-box">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="aurora-eyebrow">{labels.fiber}</span>
            <p className="text-xs sm:text-sm font-semibold text-white mt-0.5 leading-snug">
              {w.speedNotice}
            </p>
          </div>
        </div>

        {/* QR Code Auto-Connect Card */}
        <div className="aurora-glass-card text-center space-y-4 p-6">
          <div className="flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4 text-[#62e6bd]" />
            <span className="aurora-eyebrow text-white/90">
              {labels.scanQr}
            </span>
          </div>

          <div className="w-48 h-48 mx-auto p-3.5 bg-white rounded-3xl shadow-2xl flex items-center justify-center ring-4 ring-[#62e6bd]/20">
            <img
              src={wifiQrUrl}
              alt="Wi-Fi QR Code"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
            {labels.qrHelp}
          </p>
        </div>

        {/* SSID & Password Boxes */}
        <div className="space-y-3">
          {/* SSID */}
          <div className="aurora-item-card items-center">
            <div className="aurora-icon-box">
              <Wifi className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="aurora-eyebrow block">
                {w.networkLabel}
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white truncate block mt-0.5">
                {APARTMENT_INFO.wifiSSID}
              </span>
            </div>
            <button
              onClick={handleCopySSID}
              className="aurora-secondary-pill"
            >
              {copiedSSID ? <Check className="w-3.5 h-3.5 text-[#62e6bd]" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
              <span>{copiedSSID ? t.actions.copied : t.actions.copy}</span>
            </button>
          </div>

          {/* Password */}
          <div className="aurora-item-card items-center">
            <div className="aurora-icon-box">
              <Copy className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="aurora-eyebrow block">
                {w.passwordLabel}
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white truncate block mt-0.5">
                {APARTMENT_INFO.wifiPassword}
              </span>
            </div>
            <button
              onClick={handleCopyPass}
              className="aurora-action-pill"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5 text-[#07110d]" /> : <Copy className="w-3.5 h-3.5 text-[#07110d]" />}
              <span>{copiedPass ? t.actions.copied : (t.actions.copyPassword || t.actions.copy)}</span>
            </button>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="aurora-glass-card p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#62e6bd]" />
            <span className="aurora-eyebrow text-white">{w.troubleshootTitle}</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed pl-6">
            {w.troubleshootText}
          </p>
        </div>

      </div>
    </div>
  );
};
