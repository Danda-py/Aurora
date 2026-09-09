import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';
import { Language } from '../../types';

interface Props {
  language: Language;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<Props> = ({ language, compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (isInstalled) {
    return null;
  }

  const labels = {
    it: {
      install: 'Installa App',
      installIOS: 'Installa su iPhone / iPad',
      iosTitle: 'Come installare su iOS (Safari)',
      iosStep1: 'Tocca il pulsante "Condividi" nella barra di Safari in basso.',
      iosStep2: 'Scorri e seleziona "Aggiungi a Schermata Home".',
      close: 'Chiudi',
      success: 'App Installata!'
    },
    en: {
      install: 'Install App',
      installIOS: 'Install on iPhone / iPad',
      iosTitle: 'How to install on iOS (Safari)',
      iosStep1: 'Tap the "Share" icon in Safari toolbar.',
      iosStep2: 'Scroll down and tap "Add to Home Screen".',
      close: 'Close',
      success: 'App Installed!'
    },
    fr: {
      install: 'Installer l\'App',
      installIOS: 'Installer sur iPhone / iPad',
      iosTitle: 'Comment installer sur iOS (Safari)',
      iosStep1: 'Appuyez sur le bouton "Partager" en bas dans Safari.',
      iosStep2: 'Sélectionnez "Sur l\'écran d\'accueil".',
      close: 'Fermer',
      success: 'Application Installée !'
    },
    es: {
      install: 'Instalar App',
      installIOS: 'Instalar en iPhone / iPad',
      iosTitle: 'Cómo instalar en iOS (Safari)',
      iosStep1: 'Toca el botón "Compartir" en la barra inferior de Safari.',
      iosStep2: 'Desplázate y selecciona "Añadir a pantalla de inicio".',
      close: 'Cerrar',
      success: '¡App Instalada!'
    },
    de: {
      install: 'App Installieren',
      installIOS: 'Auf iPhone / iPad installieren',
      iosTitle: 'Installation auf iOS (Safari)',
      iosStep1: 'Tippen Sie auf das "Teilen"-Symbol in Safari.',
      iosStep2: 'Wählen Sie "Zum Home-Bildschirm".',
      close: 'Schließen',
      success: 'App Installiert!'
    }
  }[language];

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for browsers that don't trigger beforeinstallprompt directly
      setShowIOSGuide(true);
    }
  };

  if (installedSuccess) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-xs">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{labels.success}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
          compact
            ? 'px-2.5 py-1 text-[11px] rounded-full bg-amber-800 hover:bg-amber-900 text-white'
            : 'px-3.5 py-2 text-xs rounded-xl bg-slate-900 hover:bg-black text-amber-300 border border-amber-400/30'
        }`}
        title="Installa questa Web App sulla schermata Home del tuo dispositivo"
      >
        <Download className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
        <span>{isIOS ? labels.installIOS : labels.install}</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#fcfaf7] border border-[#e2d6c1] p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-800" />
                <h3 className="font-serif font-bold text-sm text-slate-900">
                  {labels.iosTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-[#ece4d6]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>{labels.iosStep1}</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p>{labels.iosStep2}</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition"
            >
              {labels.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
