import React, { useState, useRef, useEffect } from 'react';
import { 
  useCmsEditor 
} from '../../hooks/useCmsEditor';
import { PwaPhonePreview } from './PwaPhonePreview';
import { 
  CmsBlock, 
  CmsBlockType, 
  HUMAN_LABELS, 
  VISIBILITY_RULES_OPTIONS, 
  VisibilityCondition 
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
  Sliders,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

const COLOR_PALETTES = [
  { name: 'Ambra Valtellina', primary: '#f59e0b', accent: '#d97706' },
  { name: 'Smeraldo Alpino', primary: '#10b981', accent: '#059669' },
  { name: 'Blu Notte Orobie', primary: '#3b82f6', accent: '#1d4ed8' },
  { name: 'Rosso Crotto', primary: '#ef4444', accent: '#b91c1c' }
];

export const HostCmsTab: React.FC = () => {
  const {
    blocks,
    theme,
    activeBlockId,
    hoveredBlockId,
    activeFieldKey,
    isDirty,
    previewDevice,
    isPublishing,
    publishFeedback,
    setActiveBlockId,
    setHoveredBlockId,
    setActiveFieldKey,
    setPreviewDevice,
    updateField,
    updateTheme,
    updateBlockRule,
    toggleBlockEnabled,
    moveBlock,
    addBlock,
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

  // Auto-scroll to block when selected from phone preview
  const handleSelectBlockFromPreview = (blockId: string, fieldKey?: string) => {
    setActiveBlockId(blockId);
    if (fieldKey) setActiveFieldKey(fieldKey);

    const el = document.getElementById(`editor-block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // If field key is provided, try to focus input
      if (fieldKey) {
        setTimeout(() => {
          const inputEl = document.getElementById(`field-${blockId}-${fieldKey}`) as HTMLInputElement | HTMLTextAreaElement;
          if (inputEl) inputEl.focus();
        }, 300);
      }
    }
  };

  // Drag and Drop handlers
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
      {/* 5. TOP BAR PROFESSIONALE DA NO-CODE CMS (STILE WEBFLOW / GOOGLE SITES) */}
      <header className="sticky top-0 z-30 bg-[#151922]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Branding & Device Switcher */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Visual CMS Builder
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  WYSIWYG
                </span>
              </h1>
              <p className="text-[10px] text-gray-400">Casa Aurora in Valtellina</p>
            </div>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center bg-[#0d1017] p-1 rounded-xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === 'mobile'
                  ? 'bg-[#1f2430] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Vista Smartphone Ospite"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Mobile Ospite</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === 'desktop'
                  ? 'bg-[#1f2430] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Vista Desktop / Tablet Widescreen"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Desktop / TV</span>
            </button>
          </div>
        </div>

        {/* Center: Quick Theme Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="px-3 py-1.5 rounded-xl bg-[#0d1017] hover:bg-[#1a202c] border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-2 transition cursor-pointer"
          >
            <span 
              className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <span className="hidden md:inline">Palette & Stile</span>
            <Palette className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showThemePicker && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-[#181d28] border border-white/10 rounded-2xl shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white">Palette Colori PWA</span>
                <button 
                  type="button" 
                  onClick={() => setShowThemePicker(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => updateTheme({ primaryColor: pal.primary, accentColor: pal.accent })}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                      theme.primaryColor === pal.primary
                        ? 'bg-white/10 text-white font-bold'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: pal.primary }}></span>
                      <span>{pal.name}</span>
                    </div>
                    {theme.primaryColor === pal.primary && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Modalità Sfondo PWA
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(['dark', 'warm', 'slate'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateTheme({ bgMode: mode })}
                      className={`py-1 text-[11px] font-semibold rounded-lg capitalize transition cursor-pointer ${
                        theme.bgMode === mode
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-black/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Status & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#0d1017] border border-white/[0.06]">
            <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span className={isDirty ? 'text-amber-300' : 'text-emerald-400'}>
              {isDirty ? 'Modifiche non salvate' : 'Sincronizzato'}
            </span>
          </div>

          <button
            type="button"
            onClick={revertChanges}
            disabled={!isDirty}
            className="px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-white/5 disabled:opacity-30 text-gray-400 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1"
            title="Annulla modifiche"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ripristina</span>
          </button>

          <button
            type="button"
            onClick={saveDraft}
            className="px-3 py-1.5 rounded-xl bg-[#1e2330] hover:bg-[#252c3d] text-gray-200 border border-white/10 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-gray-400" />
            <span>Salva Bozza</span>
          </button>

          <button
            type="button"
            onClick={publishLive}
            disabled={isPublishing}
            className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white transition-all shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-95"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Pubblicazione...' : '🚀 Pubblica Live'}</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {publishFeedback && (
        <div className={`mx-4 mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top duration-300 ${
          publishFeedback.type === 'success'
            ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-200'
            : 'bg-rose-950/80 border border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {publishFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{publishFeedback.message}</span>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN SPLIT: CONTROLS & LIVE SIMULATOR */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
        
        {/* LEFT COLUMN: BLOCK CONTROLS & ACCORDIONS */}
        <section className="space-y-4" ref={containerRef}>
          {/* Action Bar: "+ Aggiungi Blocco" */}
          <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/[0.08] flex items-center justify-between gap-3 shadow-sm">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Ecosistema Blocchi & Sezioni
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Trascina con <GripVertical className="w-3 h-3 inline mx-0.5 text-gray-500" /> per riordinare o clicca su una scheda per modificarla.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Blocco</span>
            </button>
          </div>

          {/* List of Blocks (Drag and Drop Accordions) */}
          <div className="space-y-3">
            {blocks.map((block, index) => {
              const isExpanded = activeBlockId === block.id;
              const isHovered = hoveredBlockId === block.id;
              const isLogicExpanded = expandedLogicBlockId === block.id;
              const rule = VISIBILITY_RULES_OPTIONS.find((r) => r.value === block.visibilityRule);

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
                    isExpanded
                      ? 'bg-[#151925] border-amber-500/50 shadow-xl shadow-amber-500/5'
                      : isHovered
                        ? 'bg-[#131722] border-white/20'
                        : 'bg-[#11141d] border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  {/* Block Header */}
                  <div 
                    onClick={() => setActiveBlockId(isExpanded ? null : block.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Drag Handle */}
                      <div 
                        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 p-1"
                        title="Trascina per riordinare"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                        {getBlockIcon(block.type)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                            {block.title}
                          </h3>
                          {block.visibilityRule !== 'always' && rule && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              {rule.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Posizione: #{index + 1} • {block.enabled ? 'Attivo sulla PWA' : 'Disattivato'}
                        </span>
                      </div>
                    </div>

                    {/* Controls (Move Up/Down, Visibility, Expand) */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Sposta su"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                        className="p-1 rounded-lg text-gray-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Sposta giù"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBlockEnabled(block.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          block.enabled
                            ? 'text-emerald-400 hover:bg-emerald-950/30'
                            : 'text-gray-500 hover:bg-white/5'
                        }`}
                        title={block.enabled ? 'Disattiva blocco' : 'Attiva blocco'}
                      >
                        {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {block.id.startsWith('block-') && !['block-welcome', 'block-wifi', 'block-rules'].includes(block.id) && (
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                          title="Elimina blocco"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Accordion Body */}
                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-white/[0.06] space-y-4 animate-in fade-in duration-200">
                      
                      {/* Dynamic Inputs with Human-Readable Labels */}
                      <div className="space-y-3.5">
                        {Object.entries(block.data).map(([key, value]) => {
                          if (typeof value === 'boolean') {
                            return (
                              <label key={key} className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) => updateField(block.id, key, e.target.checked)}
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-black/40 border-white/20"
                                />
                                <span className="text-xs text-gray-300 font-medium">
                                  {HUMAN_LABELS[key]?.label || key}
                                </span>
                              </label>
                            );
                          }

                          const meta = HUMAN_LABELS[key] || {
                            label: key.charAt(0).toUpperCase() + key.slice(1),
                            description: 'Campo di configurazione personalizzato.',
                            type: 'text'
                          };

                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-200">
                                  {meta.label}
                                </label>
                                {activeFieldKey === key && (
                                  <span className="text-[10px] text-amber-400 font-semibold animate-pulse">
                                    In Modifica
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 leading-tight">
                                {meta.description}
                              </p>

                              {meta.type === 'textarea' ? (
                                <textarea
                                  id={`field-${block.id}-${key}`}
                                  rows={3}
                                  value={value || ''}
                                  onChange={(e) => updateField(block.id, key, e.target.value)}
                                  onFocus={() => setActiveFieldKey(key)}
                                  placeholder={meta.placeholder || ''}
                                  className="w-full text-xs p-3 rounded-xl bg-black/40 text-white border border-white/10 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                                />
                              ) : (
                                <input
                                  id={`field-${block.id}-${key}`}
                                  type="text"
                                  value={value || ''}
                                  onChange={(e) => updateField(block.id, key, e.target.value)}
                                  onFocus={() => setActiveFieldKey(key)}
                                  placeholder={meta.placeholder || ''}
                                  className="w-full text-xs py-2 px-3 rounded-xl bg-black/40 text-white border border-white/10 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* 4. INSPECTOR LOGIC ENGINE (REGOLE CONDIZIONALI PER BLOCCO) */}
                      <div className="pt-2 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => setExpandedLogicBlockId(isLogicExpanded ? null : block.id)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0d1017] hover:bg-[#161a24] text-xs font-semibold text-gray-300 border border-white/5 flex items-center justify-between transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>⚙️ Logica di Visibilità & Condizioni</span>
                          </div>
                          <span className="text-[10px] text-amber-300 font-mono">
                            {rule?.badge || 'Sempre Visibile'}
                          </span>
                        </button>

                        {isLogicExpanded && (
                          <div className="mt-2.5 p-3 rounded-xl bg-black/50 border border-white/10 space-y-2.5 animate-in fade-in duration-200">
                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                                Condizione di attivazione per l'ospite:
                              </label>
                              <select
                                value={block.visibilityRule}
                                onChange={(e) => updateBlockRule(block.id, e.target.value as VisibilityCondition)}
                                className="w-full text-xs py-2 px-3 rounded-xl bg-[#141824] text-white border border-white/10 outline-none focus:border-amber-400 cursor-pointer"
                              >
                                {VISIBILITY_RULES_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                              <strong className="block font-semibold mb-0.5">Effetto per l'ospite:</strong>
                              <span>{rule?.description}</span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN: REALISTIC PWA PREVIEW & CLICK-TO-EDIT SIMULATOR */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="p-4 rounded-3xl bg-[#141824] border border-white/[0.08] shadow-2xl space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Anteprima Nativa PWA
                </span>
              </div>
              <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Click-to-Edit Attivo
              </span>
            </div>

            <p className="text-[11px] text-gray-400 px-2 leading-tight">
              Clicca direttamente su una card o sul testo nello smartphone per saltare al campo di modifica corrispondente.
            </p>

            {/* PWA Phone Preview */}
            <PwaPhonePreview
              blocks={blocks}
              theme={theme}
              activeBlockId={activeBlockId}
              hoveredBlockId={hoveredBlockId}
              previewDevice={previewDevice}
              onSelectBlock={handleSelectBlockFromPreview}
              onHoverBlock={setHoveredBlockId}
            />
          </div>
        </aside>
      </main>

      {/* 3. MODAL "+ AGGIUNGI BLOCCO" */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161a25] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Aggiungi Blocco Componente</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Seleziona un blocco pre-costruito da aggiungere all'esperienza PWA dell'ospite:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { addBlock('video_tutorial'); setShowAddModal(false); }}
                className="w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-red-500/40 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-xs text-white group-hover:text-red-300">Video Tutorial YouTube</strong>
                  <span className="text-[11px] text-gray-400">Incorpora un video esplicativo (accesso, smart lock, cucina).</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { addBlock('wifi'); setShowAddModal(false); }}
                className="w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-blue-500/40 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-xs text-white group-hover:text-blue-300">Blocco Wi-Fi Veloce</strong>
                  <span className="text-[11px] text-gray-400">Rete fibra, password e pulsante copia veloce.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { addBlock('house_rules'); setShowAddModal(false); }}
                className="w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-emerald-500/40 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-xs text-white group-hover:text-emerald-300">Regole della Casa</strong>
                  <span className="text-[11px] text-gray-400">Orari del silenzio, raccolta differenziata e divieti.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { addBlock('local_guide'); setShowAddModal(false); }}
                className="w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-amber-500/40 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-xs text-white group-hover:text-amber-300">Guida Locale & Ristoranti</strong>
                  <span className="text-[11px] text-gray-400">Crotti, cantine tipiche e sentieri montani.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { addBlock('breaker_thermostat'); setShowAddModal(false); }}
                className="w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-amber-500/40 text-left transition flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-xs text-white group-hover:text-amber-300">Impianti, Salvavita & Riscaldamento</strong>
                  <span className="text-[11px] text-gray-400">Posizione quadro elettrico e regolazione termostato.</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
