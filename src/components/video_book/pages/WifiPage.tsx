import React, { useState } from 'react';
import { Language } from '../../../types';
import { PageHeader } from '../PageHeader';
import { BOOK_DATA } from '../../../data/multilingualBookData';
import { VIDEO_TRANSLATIONS } from '../../../data/videoTranslations';
import { VIDEO_PAGE_LABELS } from '../../../data/videoPageLabels';
import { Wifi, Copy, Check, QrCode, Zap, Info } from 'lucide-react';
import { APARTMENT_INFO } from '../../../data/apartmentData';
import { PageEditable, EditableHeroBanner } from '../cmsPageHelpers';

interface Props {
  language: Language;
  onBackToMenu: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export const WifiPage: React.FC<Props> = ({ language, onBackToMenu, onSelectLanguage }) => {
  const w = BOOK_DATA[language].wifi;
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
        <PageEditable id="page.wifi.speed-badge" label="Badge velocità Wi-Fi">
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
        </PageEditable>

        {/* QR Code Auto-Connect Card */}
        <PageEditable id="page.wifi.qr-card" label="QR Wi-Fi">
          <div className="aurora-glass-card text-center space-y-3 p-4">
            <div className="flex items-center justify-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#62e6bd]" />
              <span className="aurora-eyebrow text-white/90">
                {labels.scanQr}
              </span>
            </div>

          <div className="w-40 h-40 mx-auto p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center ring-2 ring-[#62e6bd]/20">
            <img
              src={wifiQrUrl}
              alt="Wi-Fi QR Code"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
            <p className="text-[11px] text-white/60 max-w-xs mx-auto leading-relaxed">
              {labels.qrHelp}
            </p>
          </div>
        </PageEditable>

        {/* SSID & Password Boxes */}
        <div className="space-y-2.5">
          {/* SSID */}
          <PageEditable id="page.wifi.ssid" label="Rete Wi-Fi (SSID)">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] text-[#62e6bd] border border-white/10 flex items-center justify-center shrink-0">
              <Wifi className="w-4 h-4" />
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
              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] active:bg-white/[0.16] text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition shrink-0 cursor-pointer"
            >
              {copiedSSID ? <Check className="w-3.5 h-3.5 text-[#62e6bd]" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
              <span>{copiedSSID ? t.actions.copied : t.actions.copy}</span>
            </button>
          </div>
          </PageEditable>

          {/* Password */}
          <PageEditable id="page.wifi.password" label="Password Wi-Fi">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] text-[#62e6bd] border border-white/10 flex items-center justify-center shrink-0">
              <Copy className="w-4 h-4" />
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
              className="px-3 py-1.5 rounded-lg bg-[#62e6bd] hover:bg-[#93f4d4] active:bg-[#4ddbb0] text-[#07110d] text-xs font-bold flex items-center gap-1.5 shadow-xs transition shrink-0 cursor-pointer"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5 text-[#07110d]" /> : <Copy className="w-3.5 h-3.5 text-[#07110d]" />}
              <span>{copiedPass ? t.actions.copied : (t.actions.copyPassword || t.actions.copy)}</span>
            </button>
          </div>
          </PageEditable>
        </div>

        {/* Troubleshooting */}
        <PageEditable id="page.wifi.troubleshooting" label="Assistenza Wi-Fi">
          <div className="aurora-glass-card p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#62e6bd]" />
              <span className="aurora-eyebrow text-white">{w.troubleshootTitle}</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed pl-6">
              {w.troubleshootText}
            </p>
          </div>
        </PageEditable>

      </div>
    </div>
  );
};
