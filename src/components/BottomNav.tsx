import React from 'react';
import { Home, Key, UtensilsCrossed, Compass, MessageSquare, PhoneCall } from 'lucide-react';
import { ActiveTab, Language } from '../types';
import { translations } from '../data/translations';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  language: Language;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  language,
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'home' as ActiveTab, label: t.nav.home, icon: <Home className="w-5 h-5" /> },
    { id: 'house' as ActiveTab, label: t.nav.house, icon: <Key className="w-5 h-5" /> },
    { id: 'restaurants' as ActiveTab, label: t.nav.places, icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'experiences' as ActiveTab, label: t.nav.experiences, icon: <Compass className="w-5 h-5" /> },
    { id: 'contacts' as ActiveTab, label: t.nav.contacts, icon: <PhoneCall className="w-5 h-5" /> },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 shadow-lg safe-area-pb">
      <div className="grid grid-cols-5 gap-1 items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-teal-800 font-bold bg-teal-50/80 scale-102'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'text-teal-700' : 'text-slate-500'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
