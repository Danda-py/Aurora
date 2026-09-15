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
  Eye,
  EyeOff,
  Filter,
  Volume2,
  Lock,
  Compass,
  FileText,
  Sliders,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { CmsBlock, CmsThemeSettings, VISIBILITY_RULES_OPTIONS, VisibilityCondition } from '../../types/cmsBuilder';
import { Language } from '../../types';

interface PwaPhonePreviewProps {
  blocks: CmsBlock[];
  theme: CmsThemeSettings;
  activeBlockId: string | null;
  hoveredBlockId: string | null;
  activeFieldKey: string | null;
  activeLang: Language;
  simulatedGuestState: 'all' | VisibilityCondition;
  previewDevice: 'mobile' | 'desktop';
  onSelectBlock: (blockId: string, fieldKey?: string) => void;
  onHoverBlock: (blockId: string | null) => void;
  onLanguageChange?: (lang: Language) => void;
  onSimulateGuestChange?: (state: 'all' | VisibilityCondition) => void;
}

export const PwaPhonePreview: React.FC<PwaPhonePreviewProps> = ({
  blocks,
  theme,
  activeBlockId,
  hoveredBlockId,
  activeFieldKey,
  activeLang,
  simulatedGuestState,
  previewDevice,
  onSelectBlock,
  onHoverBlock,
  onLanguageChange,
  onSimulateGuestChange
}) => {
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedCin, setCopiedCin] = useState(false);
  const [copiedCir, setCopiedCir] = useState(false);
  const [showHiddenBlocksGhost, setShowHiddenBlocksGhost] = useState(true);

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

  const handleCopyCode = (e: React.MouseEvent, code: string, type: 'cin' | 'cir') => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      if (type === 'cin') {
        setCopiedCin(true);
        setTimeout(() => setCopiedCin(false), 2000);
      } else {
        setCopiedCir(true);
        setTimeout(() => setCopiedCir(false), 2000);
      }
    }
  };

  // Check if block matches simulated condition
  const isBlockVisibleInSimulation = (block: CmsBlock) => {
    if (simulatedGuestState === 'all') return true;
    if (block.visibilityRule === 'always') return true;
    if (block.visibilityRule === simulatedGuestState) return true;
    // Cumulative state logic: tax_paid or gps_nearby implies pass is active
    if (simulatedGuestState === 'tax_paid' && block.visibilityRule === 'pass_active') return true;
    if (simulatedGuestState === 'gps_nearby' && (block.visibilityRule === 'pass_active' || block.visibilityRule === 'tax_paid')) return true;
    return false;
  };

  // Helper to read text in active preview language
  const getText = (block: CmsBlock, fieldKey: string, fallback: string = '') => {
    if (activeLang === 'it') {
      return block.data[fieldKey] || fallback;
    }
    return block.i18n?.[activeLang]?.[fieldKey] || block.data[fieldKey] || fallback;
  };

  // Background styling based on theme
  const getBgClass = () => {
    switch (theme.bgMode) {
      case 'warm':
        return 'bg-[#fcfaf6] text-neutral-900';
      case 'slate':
        return 'bg-[#0f172a] text-slate-100';
      case 'dark':
      default:
        return 'bg-[#0a0d14] text-white';
    }
  };

  const isLight = theme.bgMode === 'warm';

  // Render individual block in native PWA layout
  const renderBlock = (block: CmsBlock) => {
    if (!block.enabled) return null;

    const visibleInSim = isBlockVisibleInSimulation(block);
    if (!visibleInSim && !showHiddenBlocksGhost) return null;

    const isActive = activeBlockId === block.id;
    const isHovered = hoveredBlockId === block.id;
    const ruleInfo = VISIBILITY_RULES_OPTIONS.find((r) => r.value === block.visibilityRule);

    const blockWrapperClass = `relative rounded-2xl transition-all duration-200 cursor-pointer select-none group ${
      !visibleInSim 
        ? 'opacity-40 border border-dashed border-amber-500/50 bg-amber-500/[0.03]'
        : isActive 
          ? 'ring-2 ring-amber-400 shadow-xl shadow-amber-500/20 scale-[1.01]' 
          : isHovered 
            ? 'ring-2 ring-amber-400/80 shadow-md shadow-amber-500/10' 
            : 'hover:ring-1 hover:ring-white/20'
    }`;

    // Click-to-edit badge overlay on hover
    const editBadge = (
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1 shadow-lg pointer-events-none">
        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
        <span>Clicca per modificare</span>
      </div>
    );

    switch (block.type) {
      case 'welcome': {
        const title = getText(block, 'title', 'Benvenuti ad Aurora in Valtellina');
        const greeting = getText(block, 'greeting', 'Siamo felici di ospitarvi!');
        const message = getText(block, 'message', 'La vostra casa accogliente nel cuore delle Alpi.');
        const viewTitle = getText(block, 'viewTitle', 'CORTE & VISTA ALPI');
        const viewDesc = getText(block, 'viewDesc', 'Parcheggio privato e vista sulle Orobie.');
        const livingTitle = getText(block, 'livingTitle', 'SALOTTO ACCOGLIENTE');
        const bedroomTitle = getText(block, 'bedroomTitle', 'LETTO KING SIZE');

        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'title')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#141824] border border-white/[0.08]'}`}
          >
            {editBadge}
            {/* Condition badge */}
            {block.visibilityRule !== 'always' && ruleInfo && (
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Eye className="w-3 h-3" />
                <span>{ruleInfo.badge}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase text-white shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Benvenuto
                </span>
                <span className={`text-[11px] font-medium truncate ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                  {greeting}
                </span>
              </div>

              <h2 className={`text-base font-bold tracking-tight leading-snug ${activeFieldKey === 'title' && isActive ? 'text-amber-400 underline decoration-amber-400' : isLight ? 'text-gray-900' : 'text-white'}`}>
                {title}
              </h2>

              <p className={`text-xs leading-relaxed ${activeFieldKey === 'message' && isActive ? 'text-amber-300' : isLight ? 'text-gray-600' : 'text-white/70'}`}>
                {message}
              </p>

              {/* Panoramic View Subcard */}
              <div className={`mt-2 p-3 rounded-xl flex items-center gap-3 ${isLight ? 'bg-amber-50/80 border border-amber-200/60' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
                  style={{ backgroundColor: `${theme.primaryColor}25`, color: theme.primaryColor }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-bold uppercase tracking-wide truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {viewTitle}
                  </h4>
                  <p className={`text-[11px] truncate ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                    {viewDesc}
                  </p>
                </div>
              </div>

              {/* Living & Bedroom Pills */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className={`p-2 rounded-xl text-center ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-black/30 border border-white/5'}`}>
                  <span className={`block text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Zona Giorno</span>
                  <strong className={`block text-xs font-semibold mt-0.5 truncate ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {livingTitle}
                  </strong>
                </div>
                <div className={`p-2 rounded-xl text-center ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-black/30 border border-white/5'}`}>
                  <span className={`block text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Zona Notte</span>
                  <strong className={`block text-xs font-semibold mt-0.5 truncate ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {bedroomTitle}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'video_tutorial': {
        const ytid = getYouTubeId(block.data.videoUrl);
        const videoTitle = getText(block, 'videoTitle', 'Video Tutorial');
        const videoDesc = getText(block, 'videoDescription', 'Guida passo-passo');

        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'videoUrl')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-3.5 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#141824] border border-white/[0.08]'}`}
          >
            {editBadge}
            {block.visibilityRule !== 'always' && ruleInfo && (
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Eye className="w-3 h-3" />
                <span>{ruleInfo.badge}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center">
                <Play className="w-3 h-3 fill-current" />
              </div>
              <h3 className={`text-xs font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {videoTitle}
              </h3>
            </div>

            {/* Video Container */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 mb-2">
              {ytid ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytid}?controls=1&modestbranding=1&rel=0`}
                  title={block.data.videoTitle || 'YouTube Video'}
                  className="w-full h-full border-0 pointer-events-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 text-white/50">
                  <Play className="w-8 h-8 mb-1 text-white/30" />
                  <span className="text-[11px]">Nessun video YouTube configurato</span>
                </div>
              )}
            </div>

            {videoDesc && (
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/70'}`}>
                {videoDesc}
              </p>
            )}
          </div>
        );
      }

      case 'wifi': {
        const ssid = block.data.networkLabel || 'Aurora_Valtellina_5G';
        const password = block.data.passwordLabel || 'AuroraMorbegno2025!';
        const speed = getText(block, 'speedNotice', 'Fibra ottica ultraveloce');

        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'passwordLabel')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#141824] border border-white/[0.08]'}`}
          >
            {editBadge}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: `${theme.primaryColor}25`, color: theme.primaryColor }}
                >
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    Connessione Wi-Fi Ospite
                  </h3>
                  <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
                    {speed}
                  </p>
                </div>
              </div>

              {block.visibilityRule !== 'always' && ruleInfo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {ruleInfo.badge}
                </span>
              )}
            </div>

            {/* Network Credentials Box */}
            <div className={`p-3 rounded-xl space-y-2.5 ${isLight ? 'bg-gray-50 border border-gray-200/70' : 'bg-black/30 border border-white/5'}`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`text-[11px] ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Rete (SSID):</span>
                <strong className={`font-mono font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{ssid}</strong>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div>
                  <span className={`text-[10px] block ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Password WPA2:</span>
                  <span className="font-mono font-bold text-xs text-amber-400">{password}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopyWifi(e, password)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  style={{
                    backgroundColor: copiedWifi ? '#10b981' : theme.primaryColor,
                    color: '#ffffff'
                  }}
                >
                  {copiedWifi ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copia</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 'house_rules': {
        const quiet = getText(block, 'quietHours', '22:00 - 08:00');
        const waste = getText(block, 'wasteInfo', 'Raccolta differenziata obbligatoria nei mastelli in cortile.');

        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'quietHours')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#141824] border border-white/[0.08]'}`}
          >
            {editBadge}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  Regole della Casa & Convivenza
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Quiet hours */}
              <div className={`p-2.5 rounded-xl flex items-center gap-2.5 ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-black/30 border border-white/5'}`}>
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className={`block text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Orari del Silenzio</span>
                  <p className={`text-xs font-medium truncate ${isLight ? 'text-gray-800' : 'text-white'}`}>{quiet}</p>
                </div>
              </div>

              {/* Waste recycling */}
              <div className={`p-2.5 rounded-xl flex items-start gap-2.5 ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-black/30 border border-white/5'}`}>
                <Trash2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className={`block text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-gray-500' : 'text-white/50'}`}>Raccolta Differenziata</span>
                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-gray-700' : 'text-white/70'}`}>{waste}</p>
                </div>
              </div>

              {/* Policy Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {block.data.noSmoking && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    🚭 No Fumo
                  </span>
                )}
                {block.data.noParties && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    🎉 No Feste
                  </span>
                )}
                {!block.data.petsAllowed ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    🐾 No Animali
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🐾 Animali Ammessi
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'breaker_thermostat': {
        const breaker = getText(block, 'breakerLocation', 'All\'ingresso dentro lo sportellino bianco.');
        const thermo = getText(block, 'thermostatInstructions', 'Termostato digitale in corridoio a 20.5°C.');

        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'breakerLocation')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#141824] border border-white/[0.08]'}`}
          >
            {editBadge}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  Quadro Elettrico & Termostato
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-amber-50/50 border-amber-200/60 text-gray-800' : 'bg-black/30 border-white/5 text-white/80'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Salvavita & Generale</span>
                </div>
                <p className="text-xs leading-relaxed">{breaker}</p>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-gray-50 border-gray-100 text-gray-800' : 'bg-black/30 border-white/5 text-white/80'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Riscaldamento / Clima</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-amber-300">20.5°C</span>
                </div>
                <p className="text-xs leading-relaxed">{thermo}</p>
              </div>
            </div>
          </div>
        );
      }

      case 'local_guide': {
        const resto = getText(block, 'recommendedRestaurants', 'Trattoria Valtellinese, Crotto Caurga.');
        const high = getText(block, 'highlights', 'Sentiero del Bitto, Ponte nel Cielo.');

        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'recommendedRestaurants')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#141824] border border-white/[0.08]'}`}
          >
            {editBadge}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  Consigli Host & Sapori Alpini
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-xl ${isLight ? 'bg-rose-50/50 border border-rose-100' : 'bg-black/30 border border-white/5'}`}>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-rose-400 mb-1">Ristoranti & Crotti Tipici</span>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-700' : 'text-white/80'}`}>{resto}</p>
              </div>

              {high && (
                <div className={`p-3 rounded-xl ${isLight ? 'bg-gray-50 border border-gray-100' : 'bg-black/30 border border-white/5'}`}>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-1">Luoghi & Trekking</span>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-700' : 'text-white/80'}`}>{high}</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'legal_bureaucracy': {
        const cin = block.data.cin || 'IT014045B4A1B2C3D4';
        const cir = block.data.cir || '014045-CNI-00042';
        const notice = getText(block, 'securityNotice', 'Struttura registrata conforme alla normativa.');

        return (
          <div
            key={block.id}
            id={`preview-${block.id}`}
            onClick={() => onSelectBlock(block.id, 'cin')}
            onMouseEnter={() => onHoverBlock(block.id)}
            onMouseLeave={() => onHoverBlock(null)}
            className={`${blockWrapperClass} p-4 ${isLight ? 'bg-white border border-gray-200/80 shadow-sm' : 'bg-[#141824] border border-white/[0.08]'}`}
          >
            {editBadge}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  Codici Ministeriali & Conformità
                </h3>
                <span className="text-[10px] text-purple-300">Dati ufficiali Ministero del Turismo</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-2.5 rounded-xl flex items-center justify-between ${isLight ? 'bg-gray-50 border border-gray-200/60' : 'bg-black/30 border border-white/5'}`}>
                <div>
                  <span className={`block text-[9px] uppercase font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>CIN (Nazionale)</span>
                  <span className="font-mono text-xs font-bold text-amber-400">{cin}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCopyCode(e, cin, 'cin')}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
                >
                  {copiedCin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCin ? 'Copiato' : 'Copia'}</span>
                </button>
              </div>

              <div className={`p-2.5 rounded-xl flex items-center justify-between ${isLight ? 'bg-gray-50 border border-gray-200/60' : 'bg-black/30 border border-white/5'}`}>
                <div>
                  <span className={`block text-[9px] uppercase font-bold ${isLight ? 'text-gray-500' : 'text-white/50'}`}>CIR (Lombardia)</span>
                  <span className="font-mono text-xs font-bold text-white/90">{cir}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCopyCode(e, cir, 'cir')}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
                >
                  {copiedCir ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCir ? 'Copiato' : 'Copia'}</span>
                </button>
              </div>

              <p className={`text-[10px] leading-relaxed pt-1 ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
                {notice}
              </p>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 lg:p-6 overflow-y-auto">
      {/* Simulation & Device Controller Bar */}
      <div className="w-full max-w-[420px] mb-4 flex flex-col gap-2 shrink-0">
        <div className="bg-[#181d28]/95 backdrop-blur-md rounded-2xl border border-white/[0.08] p-2.5 shadow-lg flex items-center justify-between gap-2">
          {/* Guest State Simulator dropdown */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-semibold text-white/70 shrink-0">Simula:</span>
            <select
              value={simulatedGuestState}
              onChange={(e) => onSimulateGuestChange && onSimulateGuestChange(e.target.value as any)}
              className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-medium text-white focus:outline-none focus:border-amber-400 truncate max-w-[190px]"
            >
              <option value="all">Tutti i Blocchi (Editor)</option>
              <option value="always">Ospite Senza Pass (Pubblico)</option>
              <option value="pass_active">VIP Pass Attivo (In Soggiorno)</option>
              <option value="tax_paid">Tassa Saldata (Wi-Fi Sbloccato)</option>
              <option value="gps_nearby">GPS Vicino (&lt;60m dalla Porta)</option>
              <option value="checkout_day">Giorno Check-out</option>
            </select>
          </div>

          {/* Ghost toggle */}
          <button
            type="button"
            onClick={() => setShowHiddenBlocksGhost(!showHiddenBlocksGhost)}
            title="Mostra blocchi condizionati in semitrasparenza"
            className={`p-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors ${
              showHiddenBlocksGhost ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/40'
            }`}
          >
            {showHiddenBlocksGhost ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Realistic Smartphone Mockup Frame */}
      <div 
        className={`transition-all duration-300 relative ${
          previewDevice === 'mobile' 
            ? 'w-full max-w-[390px]' 
            : 'w-full max-w-[560px]'
        }`}
      >
        {/* Physical Side Buttons on iPhone mockup */}
        {previewDevice === 'mobile' && (
          <>
            {/* Left Mute/Action Button */}
            <div className="absolute top-24 -left-2 w-1.5 h-7 bg-[#282b34] rounded-l-md shadow-md"></div>
            {/* Left Volume Up Button */}
            <div className="absolute top-36 -left-2 w-1.5 h-12 bg-[#282b34] rounded-l-md shadow-md"></div>
            {/* Left Volume Down Button */}
            <div className="absolute top-52 -left-2 w-1.5 h-12 bg-[#282b34] rounded-l-md shadow-md"></div>
            {/* Right Power / Lock Button */}
            <div className="absolute top-40 -right-2 w-1.5 h-16 bg-[#282b34] rounded-r-md shadow-md"></div>
          </>
        )}

        {/* Phone Outer Chassis */}
        <div 
          className={`relative mx-auto rounded-[50px] border-[10px] border-[#1c202a] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-2.5 pt-4 min-h-[720px] max-h-[840px] flex flex-col overflow-hidden ring-1 ring-white/10 ${getBgClass()}`}
        >
          {/* Dynamic Island Pill with Camera & Sensors */}
          {previewDevice === 'mobile' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-between px-3 shadow-md pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0d14] ring-1 ring-white/10 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-blue-950/80"></span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#151515]"></div>
            </div>
          )}

          {/* iOS Status Bar */}
          <div className="px-5 py-1 pt-1 flex items-center justify-between text-[11px] font-semibold opacity-70 select-none shrink-0 mb-1 z-30">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <div className="w-5 h-2.5 rounded-xs border border-current p-0.5 flex items-center">
                <div className="h-full w-3/4 bg-emerald-400 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* PWA App Header with Interactive Language Switcher */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-white/[0.08] shrink-0 mb-2">
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  PWA Live
                </span>
              </div>
            </div>

            {/* Language Selector inside PWA Preview */}
            <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-lg">
              {(['it', 'en', 'de', 'fr', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange && onLanguageChange(lang)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    activeLang === lang 
                      ? 'bg-amber-400 text-black shadow-xs' 
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable PWA Screen Content */}
          <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-6 custom-scrollbar">
            {blocks.map((block) => renderBlock(block))}
          </div>

          {/* Bottom PWA Action Bar + iOS Home Indicator */}
          <div className="pt-2 pb-1 border-t border-white/[0.08] shrink-0 select-none">
            <div className="flex items-center justify-around text-[10px] opacity-75 mb-1.5">
              <span className="font-semibold text-amber-400 flex flex-col items-center">
                <span>Home</span>
              </span>
              <span className="flex flex-col items-center">Check-in</span>
              <span className="flex flex-col items-center">Servizi</span>
              <span className="flex flex-col items-center">Mappa</span>
            </div>
            {/* iOS Home Indicator Bar */}
            <div className="w-28 h-1 bg-white/30 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
