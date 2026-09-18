import React, { useEffect } from 'react';

export const HostPortal: React.FC = () => {
  useEffect(() => {
    // Unificazione Portale: reindirizza al Portale Host autoritativo Dark Apple HIG
    window.location.replace('/host-portal/');
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-sans text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-[#ff9f0a] border-t-transparent"></div>
        <span className="text-xs text-[#86868b] font-mono tracking-wide">Accesso al Portale Host Aurora...</span>
      </div>
    </div>
  );
};
