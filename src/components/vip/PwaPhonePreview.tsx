import React, { useState } from 'react';
import { 
  Wifi, 
  Copy, 
  Check, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Trash2, 
  Zap, 
  Thermometer, 
  Utensils, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { CmsBlock, CmsThemeSettings, VISIBILITY_RULES_OPTIONS } from '../../types/cmsBuilder';

interface PwaPhonePreviewProps {
  blocks: CmsBlock[];
  theme: CmsThemeSettings;
  activeBlockId: string | null;
  hoveredBlockId: string | null;
  previewDevice: 'mobile' | 'desktop';
  onSelectBlock: (blockId: string, fieldKey?: string) => void;
  onHoverBlock: (blockId: string | null) => void;
}

export const PwaPhonePreview: React.FC<PwaPhonePreviewProps> = ({
  blocks,
  theme,
  activeBlockId,
  hoveredBlockId,
  previewDevice,
  onSelectBlock,
  onHoverBlock
}) => {
  const [copiedWifi, setCopiedWifi] = useState(false);

  // Helper to extract YouTube video ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const handleCopyWifi = (e: React.MouseEvent, password: string) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(password);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  // Background styling based on theme
  const getBgClass = () => {
    switch (theme.bgMode) {
      case 'warm':
        return 'bg-[#f8f6f0] text-gray-900';
      case 'slate':
        return 'bg-[#0f172a] text-slate-100';
      case 'dark':
      default:
        return 'bg-[#070a0e] text-white';
    }
  };

  const isLight = theme.bgMode === 'warm';

  // Render individual block in native PWA layout
  const renderBlock = (block: CmsBlock) => {
    if (!block.enabled) return null;

    const isActive = activeBlockId === block.id;
    const isHovered = hoveredBlockId === block.id;
    const ruleInfo = VISIBILITY_RULES_OPTIONS.find((r) => r.value === block.visibilityRule);

    const blockWrapperClass = `relative rounded-2xl transition-all duration-200 cursor-pointer ${
      isActive 
        ? 'ring-2 ring-amber-400 shadow-xl shadow-amber-500/20 scale-[1.01]' 
        : isHovered 
          ? 'ring-1 ring-amber-300/80 shadow-md shadow-amber-500/10' 
          : 'hover:ring-1 hover:ring-white/20'
    }`;

    switch (block.type) {
      case 'welcome':
        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'title')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#121620] border border-white/[0.08]'}`}
          >
            {/* Rule badge */}
            {block.visibilityRule !== 'always' && ruleInfo && (
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Eye className="w-3 h-3" />
                <span>{ruleInfo.badge}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase text-white"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Benvenuto
                </span>
                <span className={`text-[11px] font-medium ${isLight ? 'text-gray-500' : 'text-white/60'}`}>
                  {block.data.greeting || 'Casa Aurora'}
                </span>
              </div>

              <h2 className={`text-base font-bold tracking-tight leading-snug ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {block.data.title || 'Benvenuti ad Aurora in Valtellina'}
              </h2>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/70'}`}>
                {block.data.message || 'La vostra casa accogliente nel cuore delle Alpi.'}
              </p>

              {/* Panoramic View Subcard */}
              <div className={`mt-3 p-3 rounded-xl flex items-center gap-3 ${isLight ? 'bg-amber-50 border border-amber-200/60' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
                  style={{ backgroundColor: `${theme.primaryColor}25`, color: theme.primaryColor }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-bold uppercase tracking-wide truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {block.data.viewTitle || 'Corte & Vista Alpi'}
                  </h4>
                  <p className={`text-[11px] truncate ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                    {block.data.viewDesc || 'Parcheggio privato e panorama montano.'}
                  </p>
                </div>
              </div>

              {/* Living & Rooms Pills */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className={`p-2.5 rounded-xl text-center ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-black/30 border border-white/5'}`}>
                  <span className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Zona Giorno</span>
                  <strong className={`block text-xs font-semibold mt-0.5 truncate ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {block.data.livingTitle || 'Salotto Relax'}
                  </strong>
                </div>
                <div className={`p-2.5 rounded-xl text-center ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-black/30 border border-white/5'}`}>
                  <span className={`block text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Zona Notte</span>
                  <strong className={`block text-xs font-semibold mt-0.5 truncate ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {block.data.bedroomTitle || 'Letto King Size'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        );

      case 'video_tutorial': {
        const ytid = getYouTubeId(block.data.videoUrl);
        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'videoUrl')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-3.5 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#121620] border border-white/[0.08]'}`}
          >
            {block.visibilityRule !== 'always' && ruleInfo && (
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Eye className="w-3 h-3" />
                <span>{ruleInfo.badge}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                Tutorial Video
              </span>
            </div>

            <h3 className={`text-xs font-bold leading-tight mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {block.data.videoTitle || 'Guida Video YouTube'}
            </h3>

            {/* Video Player or Embed */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/90 border border-white/10 flex items-center justify-center group">
              {ytid ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytid}?controls=1&modestbranding=1&rel=0`}
                  title={block.data.videoTitle || 'YouTube Video'}
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-3">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <span className="text-[11px] text-white/80 font-medium mt-2">
                    {block.data.videoUrl ? 'Video Pronto' : 'Inserisci URL YouTube'}
                  </span>
                </div>
              )}
            </div>

            <p className={`text-[11px] leading-relaxed mt-2 ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
              {block.data.videoDescription || 'Segui la guida visuale sul tuo smartphone.'}
            </p>
          </div>
        );
      }

      case 'wifi':
        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'networkLabel')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#121620] border border-white/[0.08]'}`}
          >
            {block.visibilityRule !== 'always' && ruleInfo && (
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Eye className="w-3 h-3" />
                <span>{ruleInfo.badge}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 mb-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
              >
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-xs font-bold leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  Wi-Fi Fibra Ottica
                </h3>
                <span className="text-[10px] text-emerald-500 font-semibold">
                  {block.data.speedNotice || 'Fibra 1 Gbps Ultraveloce'}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-xl space-y-2 ${isLight ? 'bg-gray-50 border border-gray-200/60' : 'bg-black/30 border border-white/5'}`}>
              <div className="flex items-center justify-between text-xs">
                <span className={isLight ? 'text-gray-500' : 'text-white/50'}>Nome Rete:</span>
                <span className={`font-mono font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  {block.data.networkLabel || 'Aurora_Valtellina'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-dashed border-gray-200/40">
                <span className={isLight ? 'text-gray-500' : 'text-white/50'}>Password:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold text-xs ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                    {block.data.passwordLabel || '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyWifi(e, block.data.passwordLabel)}
                    className="px-2 py-1 rounded-md text-[10px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedWifi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedWifi ? 'Copiata' : 'Copia'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'breaker_thermostat':
        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'breakerLocation')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#121620] border border-white/[0.08]'}`}
          >
            {block.visibilityRule !== 'always' && ruleInfo && (
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Eye className="w-3 h-3" />
                <span>{ruleInfo.badge}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className={`text-xs font-bold leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Impianti & Sicurezza Elettrica
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-amber-50/70 border border-amber-200/60 text-gray-800' : 'bg-amber-950/20 border border-amber-500/20 text-amber-100'}`}>
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-600 mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Quadro Elettrico / Salvavita</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {block.data.breakerLocation || 'Situato all\'ingresso a destra della porta principale.'}
                </p>
              </div>

              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-blue-50/70 border border-blue-200/60 text-gray-800' : 'bg-blue-950/20 border border-blue-500/20 text-blue-100'}`}>
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-500 mb-1">
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Riscaldamento & Clima</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {block.data.thermostatInstructions || 'Termostato digitale in corridoio preimpostato a 20.5°C.'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'house_rules':
        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'quietHours')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#121620] border border-white/[0.08]'}`}
          >
            {block.visibilityRule !== 'always' && ruleInfo && (
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Eye className="w-3 h-3" />
                <span>{ruleInfo.badge}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-xs font-bold leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Regole della Casa
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className={`block text-[11px] font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>Orari di Silenzio:</strong>
                  <span className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-white/70'}`}>
                    {block.data.quietHours || '22:00 - 08:00 e 13:30 - 15:00'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Trash2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className={`block text-[11px] font-semibold ${isLight ? 'text-gray-800' : 'text-white'}`}>Raccolta Differenziata:</strong>
                  <span className={`text-[11px] ${isLight ? 'text-gray-600' : 'text-white/70'}`}>
                    {block.data.wasteInfo || 'Mastelli colorati nell\'area cortile interno.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  🚭 Vietato Fumare
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  🎉 No Feste
                </span>
              </div>
            </div>
          </div>
        );

      case 'local_guide':
        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'recommendedRestaurants')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#121620] border border-white/[0.08]'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-4 h-4 text-amber-500" />
              <h3 className={`text-xs font-bold leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Guida Locale & Crotti
              </h3>
            </div>

            <p className={`text-[11px] leading-relaxed mb-2 ${isLight ? 'text-gray-600' : 'text-white/70'}`}>
              {block.data.recommendedRestaurants || 'Trattoria Valtellinese, Crotto Caurga, Botteghe del Bitto.'}
            </p>

            <div className="flex items-center justify-between text-[10px] font-semibold text-amber-500 pt-1">
              <span>Esplora sapori tipici</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        );

      case 'legal_bureaucracy':
        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'cin')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-3 ${isLight ? 'bg-gray-50 border border-gray-200 text-gray-700' : 'bg-black/40 border border-white/5 text-white/60'}`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono">CIN: <strong className={isLight ? 'text-gray-900' : 'text-white'}>{block.data.cin || 'IT014...'}</strong></span>
              <span className="font-mono">CIR: <strong className={isLight ? 'text-gray-900' : 'text-white'}>{block.data.cir || '014...'}</strong></span>
            </div>
            <p className="text-[9px] mt-1 text-center opacity-70">
              {block.data.securityNotice || 'Conforme a normativa Alloggiati Web Polizia di Stato.'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-2">
      {/* Device wrapper: mobile iPhone or desktop tablet */}
      <div
        className={`transition-all duration-300 ${
          previewDevice === 'mobile'
            ? 'w-full max-w-[360px]'
            : 'w-full max-w-[620px]'
        }`}
      >
        <div 
          className={`relative mx-auto rounded-[40px] border-[8px] border-[#20232a] shadow-2xl p-3 pt-7 min-h-[640px] flex flex-col overflow-hidden ring-4 ring-black/20 ${getBgClass()}`}
        >
          {/* Dynamic Island Notch (visible in mobile mode) */}
          {previewDevice === 'mobile' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1e] mr-2"></span>
              <span className="w-1 h-1 rounded-full bg-blue-950/60"></span>
            </div>
          )}

          {/* Phone Status Bar */}
          <div className="px-3 py-1 flex items-center justify-between text-[11px] font-semibold opacity-60 select-none shrink-0 mb-2">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <div className="w-4 h-2 rounded-xs border border-current p-0.5 flex items-center">
                <div className="h-full w-2/3 bg-current rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* PWA App Top Navigation Bar */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-white/[0.06] shrink-0 mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: theme.primaryColor }}
              >
                A
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-bold truncate leading-tight">
                  {theme.siteTitle || 'Aurora Valtellina'}
                </h1>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  PWA Live
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10">IT</span>
              <span className="text-[10px] opacity-40">EN</span>
              <span className="text-[10px] opacity-40">DE</span>
            </div>
          </div>

          {/* Scrollable PWA Content */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-6 custom-scrollbar">
            {blocks.map((block) => renderBlock(block))}
          </div>

          {/* Bottom PWA Action Bar */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-around text-[10px] opacity-75 shrink-0 select-none">
            <span className="font-semibold text-amber-400">Home</span>
            <span>Check-in</span>
            <span>Servizi</span>
            <span>Contatti</span>
          </div>
        </div>
      </div>
    </div>
  );
};
