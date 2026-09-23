import React, { useState, useRef, useCallback } from 'react';
import { useCmsEditor } from '../../hooks/useCmsEditor';
import { PwaPhonePreview } from './PwaPhonePreview';
import {
  CmsBlock,
  CmsBlockType,
  HUMAN_LABELS,
  VISIBILITY_RULES_OPTIONS,
  VisibilityCondition,
  CMS_BLOCK_PRESETS
} from '../../types/cmsBuilder';
import {
  Plus,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  Smartphone,
  Laptop,
  Palette,
  Settings2,
  Layers,
  Tv,
  Wifi,
  ShieldCheck,
  MapPin,
  FileText,
  Zap,
  X,
  Search,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sliders,
  Filter,
  Loader2,
  Globe
} from 'lucide-react';
import { Language } from '../../types';
import { InlineEditableText } from '../../../components/InlineEditableText';
import { InlineTimePicker } from '../../../components/InlineTimePicker';
import { StyleEditor } from '../../../components/StyleEditor';

const COLOR_PALETTES = [
  { name: 'Ambra Valtellina', primary: '#f59e0b', accent: '#d97706' },
  { name: 'Smeraldo Alpino', primary: '#10b981', accent: '#059669' },
  { name: 'Blu Notte Orobie', primary: '#3b82f6', accent: '#1d4ed8' },
  { name: 'Rosso Crotto', primary: '#ef4444', accent: '#b91c1c' }
];

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'it', label: 'IT', flag: '🇮🇹' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'es', label: 'ES', flag: '🇪🇸' }
];

export const HostCmsTab: React.FC = () => {
  const {
    blocks,
    filteredBlocks,
    theme,
    activeLang,
    simulatedGuestState,
    searchQuery,
    selectedCategory,
    activeBlockId,
    hoveredBlockId,
    activeFieldKey,
    isDirty,
    previewDevice,
    isPublishing,
    translatingField,
    publishFeedback,
    setActiveLang,
    setSimulatedGuestState,
    setSearchQuery,
    setSelectedCategory,
    setActiveBlockId,
    setHoveredBlockId,
    setActiveFieldKey,
    setPreviewDevice,
    getFieldValue,
    updateField,
    translateFieldWithAi,
    updateTheme,
    updateBlockRule,
    toggleBlockEnabled,
    moveBlock,
    addBlockFromPreset,
    removeBlock,
    saveDraft,
    publishLive,
    revertChanges
  } = useCmsEditor();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [expandedLogicBlockId, setExpandedLogicBlockId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced publishLive to avoid too many calls
  const debouncedPublishLive = useCallback(() => {
    // If a publish is already in progress, we could skip or wait; for simplicity, we call directly
    // but we want to debounce rapid calls. We'll use a timeout.
    if (debouncedPublishLiveTimeoutRef.current) {
      clearTimeout(debouncedPublishLiveTimeoutRef.current);
    }
    debouncedPublishLiveTimeoutRef.current = setTimeout(() => {
      publishLive();
    }, 500); // 500ms debounce
  }, [publishLive]);

  const debouncedPublishLiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  // React.useEffect(() => {
  //   return () => {
  //     if (debouncedPublishLiveTimeoutRef.current) {
  //       clearTimeout(debouncedPublishLiveTimeoutRef.current);
  //     }
  //   };
  // }, []);

  const handleSelectBlockFromPreview = (blockId: string, fieldKey?: string) => {
    setActiveBlockId(blockId);
    if (fieldKey) setActiveFieldKey(fieldKey);

    const el = document.getElementById(`editor-block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (fieldKey) {
        setTimeout(() => {
          const inputEl = document.getElementById(`field-${blockId}-${fieldKey}`) as HTMLInputElement | HTMLTextAreaElement;
          if (inputEl) inputEl.focus();
        }, 300);
      }
    }
  };

  // Jump to section via dropdown
  const handleSectionJump = (blockId: string) => {
    if (!blockId) return;
    setActiveBlockId(blockId);
    const el = document.getElementById(`editor-block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedBlockId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetId) return;

    const sourceIndex = blocks.findIndex((b) => b.id === draggedBlockId);
    const targetIndex = blocks.findIndex((b) => b.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const direction = sourceIndex < targetIndex ? 'down' : 'up';
      moveBlock(draggedBlockId, direction);
    }
    setDraggedBlockId(null);
  };

  const getBlockIcon = (type: CmsBlockType) => {
    switch (type) {
      case 'welcome':
        return <Layers className="w-4 h-4 text-amber-500" />;
      case 'video_tutorial':
        return <Tv className="w-4 h-4 text-red-500" />;
      case 'wifi':
        return <Wifi className="w-4 h-4 text-blue-500" />;
      case 'house_rules':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'breaker_thermostat':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'local_guide':
        return <MapPin className="w-4 h-4 text-rose-500" />;
      case 'legal_bureaucracy':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Layers className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#0d1017] text-gray-100 font-sans">
      {/* 1. TOP BAR PROFESSIONALE NO-CODE CMS */}
      <header className="sticky top-0 z-30 bg-[#151922]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Branding & Language Switcher */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Visual PWA Builder
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  WYSIWYG
                </span>
              </h1>
              <p className="text-[10px] text-gray-400">Casa Aurora in Valtellina</p>
            </div>
          </div>

          {/* Multilingual Selector: IT, EN, DE, FR, ES */}
          <div className="flex items-center bg-[#0d1017] p-1 rounded-xl border border-white/[0.08] gap-0.5">
            <span className="text-[10px] text-white/40 px-1.5 font-semibold flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Lingua:</span>
            </span>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLang(lang.code)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeLang === lang.code
                    ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={`Modifica contenuti in ${lang.label}`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Jump to Section & Search Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-md min-w-[240px]">
          {/* Section jump dropdown */}
          <div className="relative flex-1">
            <select
              value={activeBlockId || ''}
              onChange={(e) => handleSectionJump(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-400 truncate"
            >
              <option value="">Sezione da modificare...</option>
              {blocks.map((block, idx) => (
                <option key={block.id} value={block.id}>
                  {idx + 1}. {block.title}
                </option>
              ))}
            </select>
          </div>

          {/* Quick search input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca campi o blocchi..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#0d1017] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions (Reset Default & Salva Modifiche) */}
        <div className="flex items-center gap-2">
          {/* Dirty indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] border border-white/[0.08]">
            <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-gray-400">
              {isDirty ? 'Bozza modificata' : 'Tutto sincronizzato'}
            </span>
          </div>

          <button
            type="button"
            onClick={revertChanges}
            disabled={!isDirty}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-1.5 transition cursor-pointer"
            title="Ripristina configurazione iniziale"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Ripristina Default</span>
          </button>

          <button
            type="button"
            onClick={debouncedPublishLive} // Use debounced publish
            disabled={isPublishing}
            className="px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: theme.primaryColor, color: '#000000' }}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Salvataggio...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>💾 Salva Modifiche</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Alert / Feedback Notification Toast */}
      {publishFeedback && (
        <div
          className={`sticky top-[58px] z-40 px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-md transition-all ${
            publishFeedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/40'
              : publishFeedback.type === 'info'
                ? 'bg-blue-950/90 text-blue-200 border-b border-blue-500/40'
                : 'bg-red-950/90 text-red-200 border-b border-red-500/40'
          }`}
        >
          <div className="flex items-center gap-2 mx-auto">
            {publishFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : publishFeedback.type === 'info' ? (
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{publishFeedback.message}</span>
          </div>
        </div>
      )}

      {/* 2. SPLIT-SCREEN MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col xl:flex-row min-h-0 relative">
        {/* LEFT COLUMN: VISUAL NO-CODE CONTROL PANEL */}
        <div className="w-full xl:w-[56%] 2xl:w-[58%] flex flex-col min-h-0 border-r border-white/[0.08] bg-[#0d1017]">
          {/* Sub-header Toolbar: + Aggiungi Blocco, Stile & Filtri */}
          <div className="p-4 border-b border-white/[0.08] bg-[#11141e] flex flex-wrap items-center justify-between gap-3 sticky top-[57px] z-20">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Aggiungi Blocco</span>
              </button>

              {/* Theme & Palette trigger */}
              <button
                type="button"
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-2 transition cursor-pointer"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <span>Personalizza Tema</span>
                <Palette className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Theme Picker Popover */}
              {showThemePicker && (
                <div className="absolute top-full mt-2 left-4 w-72 p-4 bg-[#181d28] border border-white/10 rounded-2xl shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white">Palette Colori PWA</span>
                    <button type="button" onClick={() => setShowThemePicker(false)} className="text-gray-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PALETTES.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() => updateTheme({ primaryColor: pal.primary, accentColor: pal.accent })}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                          theme.primaryColor === pal.primary
                            ? 'border-amber-400 bg-white/5'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: pal.primary }} />
                        <span className="text-[11px] text-gray-300 truncate font-medium">{pal.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[11px] font-semibold text-gray-400 block">Sfondo PWA:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'dark', label: 'Dark' },
                        { id: 'slate', label: 'Slate' },
                        { id: 'warm', label: 'Caldo' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => updateTheme({ bgMode: m.id as any })}
                          className={`py-1 text-[11px] font-medium rounded-lg border transition ${
                            theme.bgMode === m.id
                              ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                              : 'border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {[
                  { id: 'all', label: 'Tutti' },
                  { id: 'identity', label: 'Identità' },
                  { id: 'network', label: 'Wi-Fi' },
                  { id: 'media', label: 'Media' },
                  { id: 'legal', label: 'Regole' },
                  { id: 'guide', label: 'Guida' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-white/15 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              }
            </div>

            {/* Block List Container */}
            <div ref={containerRef} className="flex-1 p-4 lg:p-6 space-y-4 overflow-y-auto">
              {filteredBlocks.length === 0 ? (
                <div className="p-8 text-center bg-[#11141e] border border-white/10 rounded-2xl space-y-3">
                  <Search className="w-8 h-8 text-gray-500 mx-auto" />
                  <p className="text-sm text-gray-400 font-medium">Nessun blocco trovato per "{searchQuery}".</p>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Reimposta filtri
                  </button>
                </div>
              ) : (
                filteredBlocks.map((block, index) => {
                  const isActive = activeBlockId === block.id;
                  const isHovered = hoveredBlockId === block.id;
                  const isExpandedLogic = expandedLogicBlockId === block.id;
                  const ruleInfo = VISIBILITY_RULES_OPTIONS.find((r) => r.value === block.visibilityRule);

                  return (
                    <div
                      key={block.id}
                      id={`editor-block-${block.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, block.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, block.id)}
                      onMouseEnter={() => setHoveredBlockId(block.id)}
                      onMouseLeave={() => setHoveredBlockId(null)}
                      className={`rounded-2xl transition-all duration-200 border ${
                        isActive
                          ? 'bg-[#151924] border-amber-400/90 shadow-xl shadow-amber-500/10'
                          : isHovered
                            ? 'bg-[#131722] border-white/20'
                            : 'bg-[#11141e] border-white/[0.08] hover:border-white/15'
                      }`}
                    >
                      {/* Card Header: Reorder handle, Title, Status & Actions */}
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Drag Handle */}
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white"
                            title="Trascina per riordinare"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Icon */}
                          <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] shrink-0">
                            {getBlockIcon(block.type)}
                          </div>

                          {/* Title & Type Badge */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-gray-500">{index + 1}.</span>
                              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                                {block.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {/* Visibility rule badge */}
                              <span className="text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.2 rounded-full border border-amber-500/20">
                                {ruleInfo?.badge || 'Sempre Visibile'}
                              </span>
                              {!block.enabled && (
                                <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.2 rounded-full border border-red-500/20">
                                  Disattivato
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Header Actions: Up/Down, Visibility, Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveBlock(block.id, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 rounded-lg hover-bg-white/5 cursor-pointer"
                            title="Sposta su"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(block.id, 'down')}
                            disabled={index === blocks.length - 1}
                            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 rounded-lg hover:bg-white/5 cursor-pointer"
                            title="Sposta giù"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBlockEnabled(block.id)}
                            className={`p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition ${
                              block.enabled ? 'text-emerald-400' : 'text-gray-500'
                            }`}
                            title={block.enabled ? 'Disattiva blocco' : 'Attiva blocco'}
                          >
                            {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Rimuovere il blocco "${block.title}"?`)) {
                                removeBlock(block.id);
                              }
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer transition"
                            title="Elimina blocco"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content: Human-Readable Inputs with AI Translate Buttons */}
                      <div className="p-4 space-y-4">
                        {Object.keys(block.data).map((fieldKey) => {
                          const meta = HUMAN_LABELS[fieldKey] || {
                            label: fieldKey,
                            description: 'Configurazione contenuto per gli ospiti',
                            type: 'text'
                          };
                          const value = getFieldValue(block, fieldKey);
                          const isTranslating = translatingField === `${block.id}-${fieldKey}`;
                          const isFieldFocused = activeBlockId === block.id && activeFieldKey === fieldKey;

                          // Handle boolean fields (checkboxes)
                          if (typeof block.data[fieldKey] === 'boolean') {
                            return (
                              <div
                                key={fieldKey}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                              >
                                <div>
                                  <span className="text-xs font-semibold text-gray-200 block">{meta.label}</span>
                                  <span className="text-[11px] text-gray-500">{meta.description}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={Boolean(value)}
                                  onChange={(e) => updateField(block.id, fieldKey, e.target.checked)}
                                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                />
                              </div>
                            );
                          }

                          // Handle string and textarea fields with InlineEditableText
                          return (
                            <div
                              key={fieldKey}
                              className={`space-y-1.5 p-3 rounded-xl transition-colors ${
                                isFieldFocused ? 'bg-amber-500/[0.04] border border-amber-500/30' : 'bg-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <label
                                    htmlFor={`field-${block.id}-${fieldKey}`}
                                    className="text-xs font-bold text-gray-200 block"
                                  >
                                    {meta.label}
                                  </label>
                                  <span className="text-[11px] text-gray-400 leading-tight block">
                                    {meta.description}
                                  </span>
                                </div>

                                {/* ✨ Traduci con IA Button (per i campi testuali) */}
                                {typeof block.data[fieldKey] === 'string' && fieldKey !== 'videoUrl' && fieldKey !== 'cin' && fieldKey !== 'cir' && (
                                  <button
                                    type="button"
                                    onClick={() => translateFieldWithAi(block.id, fieldKey)}
                                    disabled={isTranslating}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 transition cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                                    title={`Traduci questo campo da ${activeLang.toUpperCase()} in tutte le altre lingue con IA`}
                                  >
                                    {isTranslating ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                                        <span>Traduzione...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        <span>✨ Traduci con IA</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {/* Special handling for videoUrl: we could use InlineEditableText as well, but keep as is for now */}
                                {/* For time fields? Not present in data. */}
                              </div>

                              {/* Active Language Badge */}
                              <div className="flex items-center justify-between text-[10px] text-gray-500">
                                <span>Lingua attiva: <strong className="text-amber-400 uppercase">{activeLang}</strong></span>
                                {activeLang !== 'it' && (
                                  <span className="text-gray-400 italic">
                                    (Modifica traduzione specifica per {activeLang.toUpperCase()})
                                  </span>
                                )}
                              </div>

                              {/* Inline Editable Field */}
                              {typeof block.data[fieldKey] === 'string' && (
                                <>
                                  {/* Determine if this field is a time-like string (e.g., HH:mm) */}
                                  {/* We don't have a way to know; we'll treat all as text for now. */}
                                  <InlineEditableText
                                    value={value}
                                    onChange={(newVal) => updateField(block.id, fieldKey, newVal)}
                                    onSubmit={debouncedPublishLive} // Use debounced publish for each field
                                    multiline={meta.type === 'textarea'}
                                    placeholder={meta.placeholder}
                                    debounceMs={500}
                                    style={{
                                      width: '100%',
                                      // We'll let the component manage its own styling; we can adjust container if needed
                                    }}
                                  />
                                )}
                              }
                              {typeof block.data[fieldKey] !== 'string' && (
                                {/* For non-string, non-boolean (shouldn't happen) fallback */}
                                <input
                                  type="text"
                                  id={`field-${block.id}-${fieldKey}`}
                                  value={value}
                                  onChange={(e) => updateField(block.id, fieldKey, e.target.value)}
                                  onFocus={() => {
                                    setActiveBlockId(block.id);
                                    setActiveFieldKey(fieldKey);
                                  }}
                                  placeholder={meta.placeholder}
                                  className="w-full px-3 py-2 bg-[#0d1017] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                                />
                              )}
                            </div>
                          );
                        })}

                        {/* 3. LOGIC ENGINE PER SINGOLO BLOCCO (Accordion Regole di Visibilità) */}
                        <div className="pt-2 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onClick={() => setExpandedLogicBlockId(isExpandedLogic ? null : block.id)}
                            className="w-full py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between text-xs font-semibold text-gray-300 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Sliders className="w-3.5 h-3.5 text-amber-400" />
                              <span>⚙️ Logica & Condizioni di Visibilità</span>
                              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                {ruleInfo?.badge}
                              </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpandedLogic ? 'rotate-180' : ''}`} />
                          </button>

                          {isExpandedLogic && (
                            <div className="mt-2 p-3.5 bg-[#0e111a] rounded-xl border border-white/[0.08] space-y-3 animate-in fade-in">
                              <label className="text-[11px] font-bold text-gray-300 block">
                                Regola di visualizzazione per l'Ospite:
                              </label>
                              <div className="space-y-2">
                                {VISIBILITY_RULES_OPTIONS.map((opt) => (
                                  <label
                                    key={opt.value}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                                      block.visibilityRule === opt.value
                                        ? 'bg-amber-500/10 border-amber-400/60 text-white'
                                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-gray-200'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`rule-${block.id}`}
                                      value={opt.value}
                                      checked={block.visibilityRule === opt.value}
                                      onChange={() => updateBlockRule(block.id, opt.value)}
                                      className="mt-0.5 accent-amber-500 cursor-pointer"
                                    />
                                    <div className="min-w-0 text-xs">
                                      <span className="font-bold block text-white">{opt.label}</span>
                                      <span className="text-[11px] text-gray-400 block mt-0.5">{opt.description}</span>
                                    </div>
                                  </label>
                                )}
                              }
                            </div>
                          )}
                        }
                      }
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE PWA SMARTPHONE SIMULATOR */}
          <div className="w-full xl:w-[44%] 2xl:w-[42%] bg-[#080a0f] border-t xl:border-t-0 xl:border-l border-white/[0.08] flex flex-col items-center justify-start relative sticky top-[57px] xl:h-[calc(100vh-57px)] overflow-hidden">
            <PwaPhonePreview
              blocks={blocks}
              theme={theme}
              activeBlockId={activeBlockId}
              hoveredBlockId={hoveredBlockId}
              activeFieldKey={activeFieldKey}
              activeLang={activeLang}
              simulatedGuestState={simulatedGuestState}
              previewDevice={previewDevice}
              onSelectBlock={handleSelectBlockFromPreview}
              onHoverBlock={setHoveredBlockId}
              onLanguageChange={setActiveLang}
              onSimulateGuestChange={setSimulatedGuestState}
            />
          </div>
        </div>

        {/* 4. MODALE "+ AGGIUNGI BLOCCO" (CATALOGO PREDEFINITO NO-CODE) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#151922] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Catalogo Blocchi PWA</h3>
                    <p className="text-[11px] text-gray-400">Scegli un modulo pre-costruito da aggiungere all'applicazione</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
                {CMS_BLOCK_PRESETS.map((preset) => (
                  <div
                    key={preset.type}
                    onClick={() => {
                      addBlockFromPreset(preset);
                      setShowAddModal(false);
                    }}
                    className="p-3.5 rounded-xl border border-white/10 hover:border-amber-400/80 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="p-1.5 rounded-lg bg-white/5 text-amber-400 group-hover:scale-110 transition-transform">
                          {getBlockIcon(preset.type)}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                          {preset.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {preset.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-amber-400 font-semibold">
                      <span>Aggiungi alla PWA</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};