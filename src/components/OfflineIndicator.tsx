import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';
import { translations } from '../data/translations';

interface Props {
  language: Language;
}

export const OfflineIndicator: React.FC<Props> = ({ language }) => {
  const isOnline = useOnlineStatus();
  const t = translations[language];

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 rounded-xl bg-slate-900/95 text-white px-4 py-3 shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="text-xs">
        <p className="font-semibold text-amber-300">{t.pwa.offlineMode}</p>
        <p className="text-slate-300 text-[11px]">{t.pwa.offlineNotice}</p>
      </div>
    </div>
  );
};
