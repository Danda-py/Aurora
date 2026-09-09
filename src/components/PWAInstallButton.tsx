import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';
import { translations } from '../data/translations';

interface Props {
  language: Language;
  variant?: 'header' | 'banner' | 'floating';
}

export const PWAInstallButton: React.FC<Props> = ({ language, variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = translations[language];

  // If already running in standalone PWA mode, don't show prompt
  if (isInstalled) {
    if (variant === 'header') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200/60 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">{t.pwa.installed}</span>
        </span>
      );
    }
    return null;
  }

  const renderButton = () => {
    if (isInstallable) {
      return (
        <button
          id="pwa-install-btn"
          onClick={install}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 active:scale-95 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>{t.pwa.installButton}</span>
        </button>
      );
    }

    if (isIOS) {
      return (
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-100/80 hover:bg-teal-200/80 active:scale-95 border border-teal-300/60 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.pwa.installButton} (iOS)</span>
        </button>
      );
    }

    // Default fallback install button that gives tips
    return (
      <button
        id="pwa-install-generic-btn"
        onClick={() => setShowIOSGuide(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-all duration-150 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-teal-700" />
        <span>{t.pwa.installButton}</span>
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 mb-4 mx-auto">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1 font-serif">
              {t.pwa.iosInstructions}
            </h3>
            <p className="text-xs text-slate-600 text-center mb-5">
              {t.pwa.installPrompt}
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs text-slate-700 border border-slate-200/60">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-teal-700 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{t.pwa.iosStep1}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-teal-700 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{t.pwa.iosStep2}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition cursor-pointer"
            >
              {t.pwa.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
