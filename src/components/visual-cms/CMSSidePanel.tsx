import React, { useState, useRef } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
  LayoutGrid,
  FileText,
  Sliders,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  ImagePlus,
  RotateCcw,
  Home,
  KeyRound,
  Wifi,
  ShieldAlert,
  MapPin,
  Train,
  Wrench,
  Mountain,
  Utensils,
  Coffee,
  ShoppingBag,
  Info,
  Phone,
  LogOut,
  Sparkles,
  ExternalLink,
  Check,
  Edit3,
  Layers,
} from 'lucide-react';
import {
  useEditMode,
  CMSHomeSection,
  CMSHomeTile,
  CMSSubpageItem,
  CMSCustomBlock,
} from './EditModeContext';
import { Language, WelcomePage } from '../../types';
import { TextStyle } from './CMSContext';
import { BOOK_DATA } from '../../data/multilingualBookData';
import { getDoorBannerCopyFields } from '../video_book/cmsPageHelpers';

const DOOR_BANNER_COPY = getDoorBannerCopyFields();

export const PAGE_DEFINITIONS: Array<{
  id: WelcomePage;
  label: string;
  category: string;
  icon: React.ReactNode;
  supportsListItems?: boolean;
  listLabel?: string;
}> = [
  { id: 'grid_menu', label: 'Home Principale', category: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'benvenuto', label: 'Benvenuto & Stanze', category: 'Casa', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'posizione', label: 'Come arrivare & Mappa', category: 'Arrivo', icon: <MapPin className="w-4 h-4" /> },
  { id: 'check_in', label: 'Check-in & Smart Lock', category: 'Arrivo', icon: <KeyRound className="w-4 h-4" /> },
  { id: 'wifi', label: 'Wi-Fi Fibra', category: 'Casa', icon: <Wifi className="w-4 h-4" /> },
  {
    id: 'servizi',
    label: 'Servizi & Comfort',
    category: 'Casa',
    icon: <Wrench className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Dotazioni e Servizi',
  },
  {
    id: 'regole',
    label: 'Regole della Casa',
    category: 'Casa',
    icon: <ShieldAlert className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Regole della Casa',
  },
  {
    id: 'ristoranti',
    label: 'Ristoranti & Crotti',
    category: 'Valtellina',
    icon: <Utensils className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Ristoranti Consigliati',
  },
  {
    id: 'bar_club',
    label: 'Bar, Caffè & Locali',
    category: 'Valtellina',
    icon: <Coffee className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Bar e Pasticcerie',
  },
  {
    id: 'shopping',
    label: 'Spesa & Botteghe',
    category: 'Valtellina',
    icon: <ShoppingBag className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Negozi e Botteghe',
  },
  {
    id: 'attivita',
    label: 'Attività & Esperienze',
    category: 'Valtellina',
    icon: <Mountain className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Attività e Luoghi',
  },
  {
    id: 'trasporti',
    label: 'Come Muoversi (Treni/Bus)',
    category: 'Valtellina',
    icon: <Train className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Mezzi di Trasporto',
  },
  {
    id: 'informazioni',
    label: 'Informazioni Utili',
    category: 'Supporto',
    icon: <Info className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Servizi Utili in Zona',
  },
  {
    id: 'emergenza',
    label: 'Emergenze & Numeri Utili',
    category: 'Supporto',
    icon: <ShieldAlert className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Numeri e Presidi di Emergenza',
  },
  { id: 'contatti', label: 'Contatta Host (Nino)', category: 'Supporto', icon: <Phone className="w-4 h-4" /> },
  {
    id: 'check_out',
    label: 'Partenza & Check-out',
    category: 'Partenza',
    icon: <LogOut className="w-4 h-4" />,
    supportsListItems: true,
    listLabel: 'Checklist di Check-out',
  },
];

/** Estrae le voci di default in italiano da BOOK_DATA per popolare l'editor della sottopagina */
export function getDefaultSubpageItems(page: WelcomePage): CMSSubpageItem[] {
  const it = BOOK_DATA.it;
  switch (page) {
    case 'ristoranti':
      return it.restaurants.recommended.map((r, i) => ({
        id: `rest-${i}`,
        title: r.name,
        time: r.time,
        address: r.address,
        phone: r.phone,
        desc: r.desc,
        mapsUrl: r.mapsUrl,
      }));
    case 'bar_club':
      return it.bars.recommended
        .filter((b) => !/poletti/i.test(b.name))
        .map((b, i) => ({
          id: `bar-${i}`,
          title: b.name,
          time: b.time,
          address: b.address,
          phone: b.phone,
          desc: b.desc,
          mapsUrl: b.mapsUrl,
        }));
    case 'shopping':
      return it.shopping.shops.map((s, i) => ({
        id: `shop-${i}`,
        title: s.title,
        time: s.time,
        hours: s.hours,
        desc: s.desc,
        mapsUrl: s.mapsUrl,
      }));
    case 'servizi':
      return it.amenities.items.map((a, i) => ({
        id: `serv-${i}`,
        title: a.title,
        desc: a.desc,
      }));
    case 'regole':
      return [
        { id: 'rule-1', title: it.rules.r1Title, desc: it.rules.r1Desc, iconName: 'CigaretteOff' },
        { id: 'rule-2', title: it.rules.r2Title, desc: it.rules.r2Desc, iconName: 'HeartHandshake' },
        { id: 'rule-3', title: it.rules.r3Title, desc: it.rules.r3Desc, iconName: 'Volume2' },
        { id: 'rule-4', title: it.rules.r4Title, desc: it.rules.r4Desc, iconName: 'UserX' },
        { id: 'rule-5', title: it.rules.r5Title, desc: it.rules.r5Desc, iconName: 'Lock' },
        { id: 'rule-6', title: it.rules.r6Title, desc: it.rules.r6Desc, iconName: 'PhoneCall' },
      ];
    case 'attivita':
      return it.activities.highlights.map((h, i) => ({
        id: `act-${i}`,
        tag: h.tag,
        title: h.title,
        desc: h.desc,
        mapsUrl: h.mapsUrl,
      }));
    case 'trasporti':
      return it.transport.items.map((t, i) => ({
        id: `tr-${i}`,
        title: t.title,
        subtitle: t.subtitle,
        time: t.time,
        desc: t.desc,
        mapsUrl: t.mapsUrl,
        phone: t.phone,
      }));
    case 'informazioni':
      return it.info.services.map((s, i) => ({
        id: `info-${i}`,
        title: s.title,
        desc: s.desc,
        mapsUrl: s.mapsUrl,
      }));
    case 'emergenza':
      return it.emergency.items.map((e, i) => ({
        id: `em-${i}`,
        title: e.title,
        subtitle: e.subtitle,
        desc: e.subtitle,
        phone: e.phone,
        mapsUrl: e.mapsUrl,
        webUrl: e.webUrl,
        webLabel: e.webLabel,
      }));
    case 'check_out':
      return it.checkOut.checklist.map((c, i) => ({
        id: `co-${i}`,
        title: c.title,
        desc: c.desc,
      }));
    default:
      return [];
  }
}

type SideTab = 'pages' | 'home_sections' | 'subpage_editor' | 'messages' | 'selected_element';

export const CMSSidePanel: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ containerRef }) => {
  const {
    activePage,
    setActivePage,
    selectedElementId,
    selectElement,
    homeSections,
    updateHomeSections,
    resetHomeSections,
    showPhotoCarousel,
    setShowPhotoCarousel,
    carouselImages,
    setCarouselImages,
    subpageItems,
    updateSubpageItems,
    resetSubpageItems,
    customBlocks,
    updateCustomBlocks,
    texts,
    updateText,
    resetText,
    styles,
    updateStyle,
    resetStyle,
    images,
    updateImage,
    links,
    updateLink,
    currentLanguage,
  } = useEditMode();

  const [tab, setTab] = useState<SideTab>('home_sections');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    homeSections[0]?.id ?? null,
  );
  React.useEffect(() => {
    if (expandedSectionId && !homeSections.some((section) => section.id === expandedSectionId)) {
      setExpandedSectionId(homeSections[0]?.id ?? null);
    }
  }, [homeSections, expandedSectionId]);
  const [editingTileId, setEditingTileId] = useState<string | null>(null);
  const [editingSubItemId, setEditingSubItemId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Quando l'utente clicca un elemento dentro l'iPhone, passa automaticamente
  // alla tab "Elemento Selezionato" per modificarlo comodamente.
  React.useEffect(() => {
    if (selectedElementId) {
      setTab('selected_element');
    }
  }, [selectedElementId]);

  const currentPageDef =
    PAGE_DEFINITIONS.find((p) => p.id === activePage) ?? PAGE_DEFINITIONS[0];

  const handleSelectPage = (page: WelcomePage) => {
    setActivePage(page);
    selectElement(null);
    if (page === 'grid_menu') {
      setTab('home_sections');
    } else {
      setTab('subpage_editor');
    }
  };

  // =======================================================================
  // Helpers upload immagine (dataURL)
  // =======================================================================
  const pickImageFile = (onLoaded: (dataUrl: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => onLoaded(String(reader.result));
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // =======================================================================
  // Gestione Sezioni Home
  // =======================================================================
  const moveSection = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= homeSections.length) return;
    const copy = [...homeSections];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    updateHomeSections(copy);
  };

  const toggleSectionVisible = (sectionId: string) => {
    updateHomeSections(
      homeSections.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s)),
    );
  };

  const updateSectionField = (sectionId: string, patch: Partial<CMSHomeSection>) => {
    updateHomeSections(
      homeSections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    );
  };

  const addSection = () => {
    const newSec: CMSHomeSection = {
      id: `sec-${Date.now()}`,
      title: 'Nuova Sezione',
      subtitle: 'Sottotitolo della sezione',
      visible: true,
      items: [
        {
          id: `tile-${Date.now()}`,
          page: 'informazioni',
          label: 'Nuova Scheda',
          tag: 'Info',
          desc: 'Descrizione breve della scheda',
          bgImage: '/uploads/living.jpg',
        },
      ],
    };
    updateHomeSections([...homeSections, newSec]);
    setExpandedSectionId(newSec.id);
  };

  const deleteSection = (sectionId: string) => {
    updateHomeSections(homeSections.filter((s) => s.id !== sectionId));
  };

  const addTileToSection = (sectionId: string) => {
    const newTile: CMSHomeTile = {
      id: `tile-${Date.now()}`,
      page: 'informazioni',
      label: 'Nuova Card',
      tag: 'Consigliato',
      desc: 'Tocca per scoprire i dettagli',
      bgImage: '/uploads/living.jpg',
    };
    updateHomeSections(
      homeSections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, newTile] } : s,
      ),
    );
    setEditingTileId(newTile.id);
  };

  const updateTileInSection = (
    sectionId: string,
    tileId: string,
    patch: Partial<CMSHomeTile>,
  ) => {
    const section = homeSections.find((s) => s.id === sectionId);
    const originalTile = section?.items.find((it) => it.id === tileId);
    updateHomeSections(
      homeSections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((it) => (it.id === tileId ? { ...it, ...patch } : it)),
            }
          : s,
      ),
    );
    if (originalTile && patch.page && patch.page !== originalTile.page) {
      const previousImageId = `home.tile-${tileId}`;
      const legacyImage = images[`home.tile-${originalTile.page}`];
      if (legacyImage && !images[previousImageId]) {
        updateImage(previousImageId, legacyImage);
      }
    }
  };

  const moveTileInSection = (sectionId: string, idx: number, dir: -1 | 1) => {
    updateHomeSections(
      homeSections.map((s) => {
        if (s.id !== sectionId) return s;
        const target = idx + dir;
        if (target < 0 || target >= s.items.length) return s;
        const copy = [...s.items];
        const [removed] = copy.splice(idx, 1);
        copy.splice(target, 0, removed);
        return { ...s, items: copy };
      }),
    );
  };

  const deleteTileFromSection = (sectionId: string, tileId: string) => {
    updateHomeSections(
      homeSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((it) => it.id !== tileId) }
          : s,
      ),
    );
  };

  // =======================================================================
  // Gestione Voci Sottopagina (Ristoranti, Regole, Servizi, ecc.)
  // =======================================================================
  const currentSubItems: CMSSubpageItem[] =
    subpageItems[activePage] ?? getDefaultSubpageItems(activePage);

  const handleAddSubItem = () => {
    const newItem: CMSSubpageItem = {
      id: `item-${Date.now()}`,
      title: 'Nuova voce',
      subtitle: '',
      desc: 'Inserisci qui la descrizione completa...',
      address: '',
      phone: '',
      mapsUrl: '',
    };
    const next = [...currentSubItems, newItem];
    updateSubpageItems(activePage, next);
    setEditingSubItemId(newItem.id);
  };

  const handleUpdateSubItem = (itemId: string, patch: Partial<CMSSubpageItem>) => {
    const next = currentSubItems.map((it) =>
      it.id === itemId ? { ...it, ...patch } : it,
    );
    updateSubpageItems(activePage, next);
  };

  const handleMoveSubItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= currentSubItems.length) return;
    const copy = [...currentSubItems];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    updateSubpageItems(activePage, copy);
  };

  const handleDeleteSubItem = (itemId: string) => {
    updateSubpageItems(
      activePage,
      currentSubItems.filter((it) => it.id !== itemId),
    );
  };

  // =======================================================================
  // Gestione Blocchi Personalizzati per la pagina attiva
  // =======================================================================
  const pageCustomBlocks: CMSCustomBlock[] = customBlocks[activePage] ?? [];

  const handleAddCustomBlock = () => {
    const newBlock: CMSCustomBlock = {
      id: `blk-${Date.now()}`,
      badge: 'Informazione',
      title: 'Nuovo Blocco Personalizzato',
      body: 'Scrivi qui il testo o le istruzioni aggiuntive per i tuoi ospiti.',
      imageUrl: '',
      buttonLabel: '',
      buttonUrl: '',
    };
    updateCustomBlocks(activePage, [...pageCustomBlocks, newBlock]);
    setEditingBlockId(newBlock.id);
  };

  const handleUpdateCustomBlock = (blockId: string, patch: Partial<CMSCustomBlock>) => {
    updateCustomBlocks(
      activePage,
      pageCustomBlocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
    );
  };

  const handleMoveCustomBlock = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= pageCustomBlocks.length) return;
    const copy = [...pageCustomBlocks];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    updateCustomBlocks(activePage, copy);
  };

  const handleDeleteCustomBlock = (blockId: string) => {
    updateCustomBlocks(
      activePage,
      pageCustomBlocks.filter((b) => b.id !== blockId),
    );
  };

  return (
    <aside
      data-cms-sidepanel
      className="w-full lg:w-[460px] xl:w-[500px] shrink-0 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[840px]"
    >
      {/* Top Bar: Selettore rapido della pagina attiva */}
      <div className="p-3.5 border-b border-white/10 bg-zinc-950/60 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
            Pagina in modifica nell'iPhone
          </span>
          {activePage !== 'grid_menu' && (
            <button
              type="button"
              onClick={() => handleSelectPage('grid_menu')}
              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3 h-3" /> Torna alla Home
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={activePage}
            onChange={(e) => handleSelectPage(e.target.value as WelcomePage)}
            className="w-full bg-zinc-900 border border-white/15 hover:border-emerald-400/50 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none cursor-pointer transition"
          >
            {PAGE_DEFINITIONS.map((p) => (
              <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                [{p.category}] {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs del pannello */}
      <div className="grid grid-cols-5 gap-1 p-1.5 bg-zinc-950/40 border-b border-white/10 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setTab('pages')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl cursor-pointer transition ${
            tab === 'pages'
              ? 'bg-emerald-400 text-black shadow'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pagine</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activePage !== 'grid_menu') setActivePage('grid_menu');
            setTab('home_sections');
          }}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl cursor-pointer transition ${
            tab === 'home_sections'
              ? 'bg-emerald-400 text-black shadow'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Sezioni Home</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('subpage_editor')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl cursor-pointer transition ${
            tab === 'subpage_editor'
              ? 'bg-emerald-400 text-black shadow'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Sottosezioni</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('messages')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl cursor-pointer transition ${
            tab === 'messages'
              ? 'bg-emerald-400 text-black shadow'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Messaggi</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('selected_element')}
          className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl cursor-pointer transition relative ${
            tab === 'selected_element'
              ? 'bg-sky-400 text-black shadow'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Elemento</span>
          {selectedElementId && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-zinc-900" />
          )}
        </button>
      </div>

      {/* Contenuto scrollabile della tab */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ===============================================================
            TAB 1: ELENCO PAGINE & SOTTOPAGINE
           =============================================================== */}
        {tab === 'pages' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/70 leading-relaxed">
              Clicca su qualsiasi pagina qui sotto per aprirla immediatamente nell'iPhone e modificarne testi, immagini, voci e blocchi.
            </div>

            <div className="space-y-1.5">
              {PAGE_DEFINITIONS.map((p) => {
                const isActive = activePage === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPage(p.id)}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-400/50 text-white'
                        : 'bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-emerald-400 text-black'
                            : 'bg-white/10 text-emerald-300'
                        }`}
                      >
                        {p.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                          {p.category}
                        </span>
                        <strong className="text-xs font-bold block truncate">
                          {p.label}
                        </strong>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-300 shrink-0">
                      {isActive ? 'Aperta' : 'Modifica →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===============================================================
            TAB 2: GESTIONE SEZIONI E CARD DELLA HOME
           =============================================================== */}
        {tab === 'home_sections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">Sezioni della Home</h3>
                <p className="text-[11px] text-white/50">
                  Aggiungi, riordina, mostra/nascondi sezioni e modifica le card.
                </p>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold cursor-pointer transition shrink-0 shadow"
              >
                <Plus className="w-3.5 h-3.5" /> Nuova Sezione
              </button>
            </div>

            {/* Toggle e selezione foto per il carosello in Home */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <strong className="text-xs font-bold text-white block">
                    Carosello Foto Appartamento
                  </strong>
                  <span className="text-[11px] text-white/50">
                    Seleziona quali immagini mostrare e attiva lo slideshow
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoCarousel(!showPhotoCarousel)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    showPhotoCarousel
                      ? 'bg-emerald-400 text-black'
                      : 'bg-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {showPhotoCarousel ? 'Visibile' : 'Nascosto'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {[
                  ['heroLiving', 'Soggiorno'],
                  ['bedroom', 'Camera'],
                  ['kitchen', 'Cucina'],
                  ['bathroom', 'Bagno'],
                  ['balcony', 'Balcone'],
                  ['view', 'Panorama'],
                ].map(([key, label]) => {
                  const checked = carouselImages.includes(key);
                  return (
                    <label key={key} className="flex items-center gap-2 text-[11px] text-white/75 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          const next = [...carouselImages];
                          const updated = event.target.checked
                            ? [...new Set([...next, key])]
                            : next.filter((item) => item !== key);
                          setCarouselImages(updated);
                        }}
                        className="accent-emerald-400"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Lista Sezioni */}
            <div className="space-y-3">
              {homeSections.map((section, sIdx) => {
                const isExpanded = expandedSectionId === section.id;
                return (
                  <div
                    key={section.id}
                    className={`rounded-2xl border transition ${
                      section.visible
                        ? 'bg-white/[0.03] border-white/10'
                        : 'bg-white/[0.01] border-white/5 opacity-60'
                    }`}
                  >
                    {/* Header sezione */}
                    <div className="p-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSectionId(isExpanded ? null : section.id)
                        }
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-white truncate">
                            {section.title || 'Sezione senza titolo'}
                          </strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                            {section.items.length} card
                          </span>
                        </div>
                        {section.subtitle && (
                          <span className="text-[11px] text-white/45 block truncate mt-0.5">
                            {section.subtitle}
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveSection(sIdx, -1)}
                          disabled={sIdx === 0}
                          title="Sposta su"
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 disabled:opacity-25 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(sIdx, 1)}
                          disabled={sIdx === homeSections.length - 1}
                          title="Sposta giù"
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 disabled:opacity-25 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSectionVisible(section.id)}
                          title={section.visible ? 'Nascondi sezione' : 'Mostra sezione'}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 cursor-pointer"
                        >
                          {section.visible ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-white/40" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSection(section.id)}
                          title="Elimina sezione"
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dettaglio sezione espansa */}
                    {isExpanded && (
                      <div className="p-3 pt-0 border-t border-white/10 space-y-3">
                        <div className="grid grid-cols-1 gap-2 pt-3">
                          <div>
                            <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                              Titolo Sezione
                            </label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) =>
                                updateSectionField(section.id, { title: e.target.value })
                              }
                              className="w-full bg-zinc-950 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                              Sottotitolo (opzionale)
                            </label>
                            <input
                              type="text"
                              value={section.subtitle ?? ''}
                              onChange={(e) =>
                                updateSectionField(section.id, {
                                  subtitle: e.target.value,
                                })
                              }
                              className="w-full bg-zinc-950 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                            />
                          </div>
                        </div>

                        {/* Card dentro la sezione */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-white/50">
                              Schede (Card) nella sezione
                            </span>
                            <button
                              type="button"
                              onClick={() => addTileToSection(section.id)}
                              className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Aggiungi Card
                            </button>
                          </div>

                          {section.items.map((tile, tIdx) => {
                            const isTileOpen = editingTileId === tile.id;
                            const resolvedImg =
                              images[`home.tile-${tile.id}`] ||
                              images[`home.tile-${tile.page}`] ||
                              tile.bgImage;
                            return (
                              <div
                                key={tile.id}
                                className="rounded-xl bg-zinc-950/80 border border-white/10 p-2.5 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingTileId(isTileOpen ? null : tile.id)
                                    }
                                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                                  >
                                    <img
                                      src={resolvedImg}
                                      alt={tile.label}
                                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10 bg-zinc-800"
                                    />
                                    <div className="min-w-0">
                                      <strong className="text-xs font-bold text-white block truncate">
                                        {tile.label}
                                      </strong>
                                      <span className="text-[10px] text-white/45 block truncate">
                                        {tile.desc}
                                      </span>
                                    </div>
                                  </button>

                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        moveTileInSection(section.id, tIdx, -1)
                                      }
                                      disabled={tIdx === 0}
                                      className="p-1 rounded hover:bg-white/10 text-white/60 disabled:opacity-25 cursor-pointer"
                                      title="Sposta a sinistra"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        moveTileInSection(section.id, tIdx, 1)
                                      }
                                      disabled={tIdx === section.items.length - 1}
                                      className="p-1 rounded hover:bg-white/10 text-white/60 disabled:opacity-25 cursor-pointer"
                                      title="Sposta a destra"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingTileId(isTileOpen ? null : tile.id)
                                      }
                                      className="p-1 rounded hover:bg-white/10 text-sky-400 cursor-pointer"
                                      title="Modifica card"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteTileFromSection(section.id, tile.id)
                                      }
                                      className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                      title="Rimuovi card"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {isTileOpen && (
                                  <div className="pt-2 border-t border-white/10 space-y-2">
                                    <div>
                                      <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                        Titolo Card
                                      </label>
                                      <input
                                        type="text"
                                        value={tile.label}
                                        onChange={(e) =>
                                          updateTileInSection(section.id, tile.id, {
                                            label: e.target.value,
                                          })
                                        }
                                        className="w-full bg-zinc-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                        Descrizione breve
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={tile.desc}
                                        onChange={(e) =>
                                          updateTileInSection(section.id, tile.id, {
                                            desc: e.target.value,
                                          })
                                        }
                                        className="w-full bg-zinc-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                          Sottopagina collegata
                                        </label>
                                        <select
                                          value={tile.page}
                                          onChange={(e) =>
                                            updateTileInSection(section.id, tile.id, {
                                              page: e.target.value as WelcomePage,
                                            })
                                          }
                                          className="w-full bg-zinc-900 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                                        >
                                          {PAGE_DEFINITIONS.filter(
                                            (p) => p.id !== 'grid_menu',
                                          ).map((p) => (
                                            <option key={p.id} value={p.id}>
                                              {p.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div>
                                        <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                          Apri Sottopagina
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => handleSelectPage(tile.page)}
                                          className="w-full py-1.5 px-2 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold hover:bg-sky-500/30 cursor-pointer"
                                        >
                                          Modifica pagina →
                                        </button>
                                      </div>
                                    </div>

                                    {/* Immagine di sfondo della card */}
                                    <div>
                                      <label className="text-[10px] font-mono text-white/50 block mb-1">
                                        Immagine di copertina
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={tile.bgImage}
                                          onChange={(e) => {
                                            updateTileInSection(section.id, tile.id, {
                                              bgImage: e.target.value,
                                            });
                                            updateImage(
                                              `home.tile-${tile.id}`,
                                              e.target.value,
                                            );
                                          }}
                                          placeholder="URL immagine o carica file..."
                                          className="flex-1 bg-zinc-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            pickImageFile((dataUrl) => {
                                              updateTileInSection(section.id, tile.id, {
                                                bgImage: dataUrl,
                                              });
                                              updateImage(
                                                `home.tile-${tile.id}`,
                                                dataUrl,
                                              );
                                            })
                                          }
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer shrink-0"
                                        >
                                          <ImagePlus className="w-3.5 h-3.5" /> Carica
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={resetHomeSections}
                className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Ripristina sezioni predefinite
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            TAB 3: SOTTOSEZIONI (VOCI DELLA PAGINA + BLOCCHI PERSONALIZZATI)
           =============================================================== */}
        {tab === 'subpage_editor' && (
          <div className="space-y-5">
            {/* Intestazione della sottopagina corrente */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-300 block">
                  Stai modificando
                </span>
                <h3 className="text-sm font-bold text-white">{currentPageDef.label}</h3>
              </div>
              {activePage !== 'grid_menu' && (
                <button
                  type="button"
                  onClick={() =>
                    pickImageFile((dataUrl) =>
                      updateImage(`page.${activePage}.hero-img`, dataUrl),
                    )
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-bold cursor-pointer shrink-0"
                >
                  <ImagePlus className="w-3.5 h-3.5" /> Foto Copertina
                </button>
              )}
            </div>

            {/* Sezione A: Voci strutturate della sottopagina (Ristoranti, Regole, Servizi, ecc.) */}
            {currentPageDef.supportsListItems && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {currentPageDef.listLabel || 'Voci della pagina'} (
                      {currentSubItems.length})
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Modifica, riordina, elimina o aggiungi nuove voci.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubItem}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi Voce
                  </button>
                </div>

                <div className="space-y-2">
                  {currentSubItems.map((item, idx) => {
                    const isOpen = editingSubItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white/[0.03] border border-white/10 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingSubItemId(isOpen ? null : item.id)
                            }
                            className="flex-1 text-left min-w-0 cursor-pointer"
                          >
                            <strong className="text-xs font-bold text-white block truncate">
                              {idx + 1}. {item.title || 'Senza titolo'}
                            </strong>
                            <span className="text-[11px] text-white/50 block truncate">
                              {item.desc}
                            </span>
                          </button>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveSubItem(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-white/10 text-white/60 disabled:opacity-25 cursor-pointer"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSubItem(idx, 1)}
                              disabled={idx === currentSubItems.length - 1}
                              className="p-1 rounded hover:bg-white/10 text-white/60 disabled:opacity-25 cursor-pointer"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingSubItemId(isOpen ? null : item.id)
                              }
                              className="p-1 rounded hover:bg-white/10 text-sky-400 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubItem(item.id)}
                              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="pt-2 border-t border-white/10 space-y-2.5">
                            <div>
                              <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                Titolo / Nome
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateSubItem(item.id, {
                                    title: e.target.value,
                                  })
                                }
                                className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                              />
                            </div>

                            {(activePage === 'trasporti' ||
                              activePage === 'emergenza' ||
                              activePage === 'attivita') && (
                              <div>
                                <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                  Sottotitolo / Categoria
                                </label>
                                <input
                                  type="text"
                                  value={item.subtitle || item.tag || ''}
                                  onChange={(e) =>
                                    handleUpdateSubItem(item.id, {
                                      subtitle: e.target.value,
                                      tag: e.target.value,
                                    })
                                  }
                                  className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                />
                              </div>
                            )}

                            {(activePage === 'ristoranti' ||
                              activePage === 'bar_club' ||
                              activePage === 'shopping') && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                    Indirizzo / Distanza
                                  </label>
                                  <input
                                    type="text"
                                    value={item.address || item.time || ''}
                                    onChange={(e) =>
                                      handleUpdateSubItem(item.id, {
                                        address: e.target.value,
                                        time: e.target.value,
                                      })
                                    }
                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                    Orari / Telefono
                                  </label>
                                  <input
                                    type="text"
                                    value={item.phone || item.hours || ''}
                                    onChange={(e) =>
                                      handleUpdateSubItem(item.id, {
                                        phone: e.target.value,
                                        hours: e.target.value,
                                      })
                                    }
                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                Descrizione
                              </label>
                              <textarea
                                rows={3}
                                value={item.desc}
                                onChange={(e) =>
                                  handleUpdateSubItem(item.id, {
                                    desc: e.target.value,
                                  })
                                }
                                className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                              />
                            </div>

                            {activePage === 'regole' && (
                              <div>
                                <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                  Icona della regola
                                </label>
                                <select
                                  value={item.iconName || ['CigaretteOff', 'HeartHandshake', 'Volume2', 'UserX', 'Lock', 'PhoneCall'][Number(item.id.match(/^rule-(\d+)$/)?.[1]) - 1] || 'ShieldCheck'}
                                  onChange={(e) => handleUpdateSubItem(item.id, { iconName: e.target.value })}
                                  className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-400"
                                >
                                  <option value="CigaretteOff">Divieto di fumo</option>
                                  <option value="HeartHandshake">Rispetto e cortesia</option>
                                  <option value="Volume2">Silenzio</option>
                                  <option value="UserX">No ospiti aggiuntivi</option>
                                  <option value="Lock">Sicurezza e chiusura</option>
                                  <option value="PhoneCall">Contattare l’host</option>
                                  <option value="ShieldCheck">Regola generale</option>
                                  <option value="House">Casa</option>
                                  <option value="Trash2">Rifiuti</option>
                                  <option value="PawPrint">Animali</option>
                                  <option value="Baby">Bambini</option>
                                  <option value="Flame">Fuoco e fiamme</option>
                                </select>
                                <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-emerald-300">
                                  Anteprima: {item.iconName || ['CigaretteOff', 'HeartHandshake', 'Volume2', 'UserX', 'Lock', 'PhoneCall'][Number(item.id.match(/^rule-(\d+)$/)?.[1]) - 1] || 'ShieldCheck'}
                                </span>
                              </div>
                            )}

                            {activePage !== 'regole' &&
                              activePage !== 'servizi' &&
                              activePage !== 'check_out' && (
                                <div>
                                  <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                    Link Google Maps / Sito Web (opzionale)
                                  </label>
                                  <input
                                    type="text"
                                    value={item.mapsUrl || ''}
                                    onChange={(e) =>
                                      handleUpdateSubItem(item.id, {
                                        mapsUrl: e.target.value,
                                      })
                                    }
                                    placeholder="https://maps.google.com/..."
                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                  />
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {subpageItems[activePage] && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => resetSubpageItems(activePage)}
                      className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Ripristina elenco originale
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sezione B: Blocchi personalizzati liberi (disponibili su OGNI pagina) */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Blocchi Personalizzati ({pageCustomBlocks.length})
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Aggiungi paragrafi, avvisi, foto o bottoni extra in questa pagina.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomBlock}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuovo Blocco
                </button>
              </div>

              {pageCustomBlocks.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-white/15 text-center text-xs text-white/45">
                  Nessun blocco extra in questa pagina. Clicca "+ Nuovo Blocco" per aggiungere una sottosezione personalizzata con testo, foto e link.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pageCustomBlocks.map((block, bIdx) => {
                    const isOpen = editingBlockId === block.id;
                    return (
                      <div
                        key={block.id}
                        className="rounded-2xl bg-white/[0.03] border border-white/10 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingBlockId(isOpen ? null : block.id)
                            }
                            className="flex-1 text-left min-w-0 cursor-pointer"
                          >
                            <strong className="text-xs font-bold text-white block truncate">
                              {block.title || 'Blocco senza titolo'}
                            </strong>
                            <span className="text-[11px] text-white/50 block truncate">
                              {block.body}
                            </span>
                          </button>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveCustomBlock(bIdx, -1)}
                              disabled={bIdx === 0}
                              className="p-1 rounded hover:bg-white/10 text-white/60 disabled:opacity-25 cursor-pointer"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveCustomBlock(bIdx, 1)}
                              disabled={bIdx === pageCustomBlocks.length - 1}
                              className="p-1 rounded hover:bg-white/10 text-white/60 disabled:opacity-25 cursor-pointer"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingBlockId(isOpen ? null : block.id)
                              }
                              className="p-1 rounded hover:bg-white/10 text-sky-400 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomBlock(block.id)}
                              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="pt-2 border-t border-white/10 space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                  Occhiello / Badge
                                </label>
                                <input
                                  type="text"
                                  value={block.badge || ''}
                                  onChange={(e) =>
                                    handleUpdateCustomBlock(block.id, {
                                      badge: e.target.value,
                                    })
                                  }
                                  placeholder="Es. Consiglio Host"
                                  className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                  Titolo Blocco
                                </label>
                                <input
                                  type="text"
                                  value={block.title}
                                  onChange={(e) =>
                                    handleUpdateCustomBlock(block.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                Testo / Contenuto
                              </label>
                              <textarea
                                rows={3}
                                value={block.body}
                                onChange={(e) =>
                                  handleUpdateCustomBlock(block.id, {
                                    body: e.target.value,
                                  })
                                }
                                className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                Foto (opzionale)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={block.imageUrl || ''}
                                  onChange={(e) =>
                                    handleUpdateCustomBlock(block.id, {
                                      imageUrl: e.target.value,
                                    })
                                  }
                                  placeholder="URL foto o carica..."
                                  className="flex-1 bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    pickImageFile((dataUrl) =>
                                      handleUpdateCustomBlock(block.id, {
                                        imageUrl: dataUrl,
                                      }),
                                    )
                                  }
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold cursor-pointer shrink-0"
                                >
                                  <ImagePlus className="w-3.5 h-3.5" /> Carica
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                  Testo Bottone (opz.)
                                </label>
                                <input
                                  type="text"
                                  value={block.buttonLabel || ''}
                                  onChange={(e) =>
                                    handleUpdateCustomBlock(block.id, {
                                      buttonLabel: e.target.value,
                                    })
                                  }
                                  placeholder="Es. Apri Mappa"
                                  className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-mono text-white/50 block mb-0.5">
                                  Link Bottone (opz.)
                                </label>
                                <input
                                  type="text"
                                  value={block.buttonUrl || ''}
                                  onChange={(e) =>
                                    handleUpdateCustomBlock(block.id, {
                                      buttonUrl: e.target.value,
                                    })
                                  }
                                  placeholder="https://..."
                                  className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===============================================================
            TAB 4: ISPETTORE ELEMENTO SELEZIONATO NELL'IPHONE
           =============================================================== */}
        {tab === 'messages' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-3">
              <h3 className="text-sm font-bold text-white">Banner e messaggi</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-white/55">
                Modifica i testi mostrati nei feedback rapidi della porta. Le modifiche sono salvate per la lingua selezionata.
              </p>
            </div>
            {DOOR_BANNER_COPY.map((message) => {
              const fallback = message.fallback[currentLanguage as Language] ?? message.fallback.it;
              const value = texts[message.id]?.[currentLanguage] ?? fallback;
              return (
                <label key={message.id} className="block space-y-1.5">
                  <span className="text-[10px] font-mono text-white/55">{message.label}</span>
                  {message.id.endsWith('.detail') ? (
                    <textarea
                      rows={3}
                      value={value}
                      onChange={(event) => updateText(message.id, currentLanguage, event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(event) => updateText(message.id, currentLanguage, event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  )}
                  {texts[message.id]?.[currentLanguage] !== undefined && (
                    <button
                      type="button"
                      onClick={() => resetText(message.id)}
                      className="flex items-center gap-1 text-[10px] text-rose-300 hover:text-rose-200"
                    >
                      <RotateCcw className="h-3 w-3" /> Ripristina testo predefinito
                    </button>
                  )}
                </label>
              );
            })}
            <p className="text-[10px] text-white/40">La modifica vale per la lingua selezionata; usa “Ripristina testo predefinito” per annullarla.</p>
          </div>
        )}

        {tab === 'selected_element' && (
          <SelectedElementInspector
            containerRef={containerRef}
            selectedElementId={selectedElementId}
            selectElement={selectElement}
            texts={texts}
            updateText={updateText}
            resetText={resetText}
            styles={styles}
            updateStyle={updateStyle}
            resetStyle={resetStyle}
            images={images}
            updateImage={updateImage}
            links={links}
            updateLink={updateLink}
            currentLanguage={currentLanguage}
            pickImageFile={pickImageFile}
          />
        )}
      </div>
    </aside>
  );
};

// ===========================================================================
// Sotto-componente: Ispettore dell'elemento cliccato dentro l'iPhone
// Estrae tutti i campi di testo, le immagini e i link del blocco selezionato
// e permette di modificarli in comodi input testuali (senza impazzire col
// contentEditable dentro l'iPhone).
// ===========================================================================
const SelectedElementInspector: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  texts: Record<string, Record<string, string>>;
  updateText: (id: string, lang: string, text: string) => void;
  resetText: (id: string) => void;
  styles: Record<string, TextStyle>;
  updateStyle: (id: string, patch: Partial<TextStyle>) => void;
  resetStyle: (id: string) => void;
  images: Record<string, string>;
  updateImage: (id: string, url: string) => void;
  links: Record<string, string>;
  updateLink: (id: string, url: string) => void;
  currentLanguage: string;
  pickImageFile: (cb: (dataUrl: string) => void) => void;
}> = ({
  containerRef,
  selectedElementId,
  selectElement,
  texts,
  updateText,
  resetText,
  styles,
  updateStyle,
  resetStyle,
  images,
  updateImage,
  links,
  updateLink,
  currentLanguage,
  pickImageFile,
}) => {
  const [domFields, setDomFields] = useState<Array<{ key: string; value: string; tag: string; label: string }>>([]);
  const textStyle = styles[selectedElementId ?? ''];
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [hasAnchor, setHasAnchor] = useState(false);
  const [anchorHref, setAnchorHref] = useState('');

  React.useEffect(() => {
    if (!selectedElementId || !containerRef.current) {
      setDomFields([]);
      setImageIds([]);
      setHasAnchor(false);
      return;
    }
    const root = containerRef.current.querySelector(
      `[data-editable-id="${selectedElementId}"]`,
    ) as HTMLElement | null;
    if (!root) {
      setDomFields([]);
      setImageIds([]);
      setHasAnchor(false);
      return;
    }

    // Raccogli i nodi di testo come in EditableElement
    const TEXTY = /^(H[1-6]|P|SPAN|STRONG|EM|SMALL|LABEL|A|BUTTON)$/i;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const el = node as HTMLElement;
        if (el.closest('[data-cms-control]')) return NodeFilter.FILTER_REJECT;
        // Skip layout wrappers but collect each readable text node within them.
        if (!TEXTY.test(el.tagName)) return NodeFilter.FILTER_SKIP;
        const hasDirectText = Array.from(el.childNodes).some(
          (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
        );
        return hasDirectText ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });

    const fields: Array<{ key: string; value: string; tag: string; label: string }> = [];
    let idx = 0;
    let current = walker.nextNode();
    while (current) {
      const el = current as HTMLElement;
      const key = `${selectedElementId}#${idx}`;
      const saved =
        idx === 0 && texts[selectedElementId]?.[currentLanguage] !== undefined
          ? texts[selectedElementId][currentLanguage]
          : texts[key]?.[currentLanguage];
      const value = saved !== undefined ? saved : el.innerText;
      const nearbyLabel = el.getAttribute('aria-label') || el.getAttribute('title');
      const label = nearbyLabel || value.replace(/\s+/g, ' ').trim().slice(0, 38) || `Testo ${idx + 1}`;
      fields.push({
        key,
        value,
        tag: el.tagName.toLowerCase(),
        label,
      });
      idx++;
      current = walker.nextNode();
    }
    setDomFields(fields);

    // Controlla se ci sono immagini associabili
    const foundImgs: string[] = [];
    if (selectedElementId.startsWith('home.tile-')) {
      foundImgs.push(selectedElementId);
    } else if (selectedElementId.startsWith('page.')) {
      const hasImgTag = root.querySelector('img');
      if (hasImgTag) {
        const parts = selectedElementId.split('.');
        if (parts.length === 2) {
          foundImgs.push(`${selectedElementId}.hero-img`);
        } else {
          foundImgs.push(`${selectedElementId}-img`);
        }
      }
    }
    setImageIds(foundImgs);

    const anchor = root.querySelector('a[href]') as HTMLAnchorElement | null;
    setHasAnchor(Boolean(anchor));
    setAnchorHref(links[selectedElementId] || anchor?.getAttribute('href') || '');
  }, [selectedElementId, containerRef, texts, currentLanguage, links]);

  if (!selectedElementId) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-white/15 text-center space-y-2">
        <Sliders className="w-7 h-7 text-sky-400 mx-auto opacity-80" />
        <h4 className="text-xs font-bold text-white">Nessun elemento selezionato</h4>
        <p className="text-[11px] text-white/50 leading-relaxed">
          Clicca su qualsiasi titolo, card o riquadro dentro lo schermo dell'iPhone per modificarne qui tutti i testi, le immagini e i link in modo ordinato.
        </p>
      </div>
    );
  }

  const updateDomNodeDirectly = (idx: number, newVal: string) => {
    if (!containerRef.current) return;
    const root = containerRef.current.querySelector(
      `[data-editable-id="${selectedElementId}"]`,
    ) as HTMLElement | null;
    if (!root) return;
    const TEXTY = /^(H[1-6]|P|SPAN|STRONG|EM|SMALL|LABEL|A|BUTTON)$/i;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const el = node as HTMLElement;
        if (el.closest('[data-cms-control]')) return NodeFilter.FILTER_REJECT;
        // Skip layout wrappers but collect each readable text node within them.
        if (!TEXTY.test(el.tagName)) return NodeFilter.FILTER_SKIP;
        const hasDirectText = Array.from(el.childNodes).some(
          (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
        );
        return hasDirectText ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });
    let i = 0;
    let cur = walker.nextNode();
    while (cur) {
      if (i === idx) {
        (cur as HTMLElement).innerText = newVal;
        break;
      }
      i++;
      cur = walker.nextNode();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-sky-500/10 border border-sky-400/30">
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase text-sky-300 block">
            Elemento Selezionato
          </span>
          <strong className="text-xs font-semibold text-white truncate block">
            {containerRef.current?.querySelector(`[data-editable-id="${selectedElementId}"]`)?.getAttribute('data-editable-label') || selectedElementId.replace(/^[^.]+\./, '').replace(/[._-]+/g, ' ')}
          </strong>
          <span className="text-[9px] font-mono text-white/35">{selectedElementId}</span>
        </div>
        <button
          type="button"
          onClick={() => selectElement(null)}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white cursor-pointer shrink-0"
        >
          Deseleziona
        </button>
      </div>

      {/* Campi di testo dell'elemento selezionato */}
      {domFields.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold">
              Testi contenuti nel blocco ({domFields.length})
            </span>
            <button
              type="button"
              onClick={() => resetText(selectedElementId)}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Ripristina testi originali
            </button>
          </div>

          {domFields.map((field, idx) => (
            <div key={field.key} className="space-y-1">
              <label className="text-[10px] font-mono text-white/65 block">
                {field.label} · {field.tag.toUpperCase()}
              </label>
              {field.value.length > 55 || field.tag === 'p' ? (
                <textarea
                  rows={3}
                  value={field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDomFields((prev) =>
                      prev.map((f, i) => (i === idx ? { ...f, value: val } : f)),
                    );
                    updateText(field.key, currentLanguage, val);
                    updateDomNodeDirectly(idx, val);
                  }}
                  className="w-full bg-zinc-950 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDomFields((prev) =>
                      prev.map((f, i) => (i === idx ? { ...f, value: val } : f)),
                    );
                    updateText(field.key, currentLanguage, val);
                    updateDomNodeDirectly(idx, val);
                  }}
                  className="w-full bg-zinc-950 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div>
          <h4 className="text-[11px] font-bold text-white">Aspetto del testo</h4>
          <p className="mt-0.5 text-[10px] text-white/45">Le modifiche si applicano ai testi di questo elemento.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-[10px] text-white/55">
            Dimensione
            <input
              type="number"
              min={8}
              max={48}
              value={textStyle?.fontSize ?? 14}
              onChange={(event) => updateStyle(selectedElementId, { fontSize: Math.min(48, Math.max(8, Number(event.target.value) || 8)) })}
              className="w-full rounded-lg border border-white/15 bg-zinc-950 px-2 py-1.5 text-xs text-white"
            />
          </label>
          <label className="space-y-1 text-[10px] text-white/55">
            Carattere
            <select
              value={textStyle?.fontFamily ?? 'system-ui, sans-serif'}
              onChange={(event) => updateStyle(selectedElementId, { fontFamily: event.target.value })}
              className="w-full rounded-lg border border-white/15 bg-zinc-950 px-2 py-1.5 text-xs text-white"
            >
              <option value="system-ui, sans-serif">System UI</option>
              <option value="Inter, system-ui, sans-serif">Inter</option>
              <option value="Georgia, serif">Georgia</option>
              <option value={'"JetBrains Mono", monospace'}>JetBrains Mono</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => updateStyle(selectedElementId, { bold: !textStyle?.bold })} aria-pressed={Boolean(textStyle?.bold)} title="Grassetto" className={`rounded-lg p-2 ${textStyle?.bold ? 'bg-sky-500 text-white' : 'bg-white/5 text-white/70'}`}><Bold className="h-4 w-4" /></button>
          <button type="button" onClick={() => updateStyle(selectedElementId, { italic: !textStyle?.italic })} aria-pressed={Boolean(textStyle?.italic)} title="Corsivo" className={`rounded-lg p-2 ${textStyle?.italic ? 'bg-sky-500 text-white' : 'bg-white/5 text-white/70'}`}><Italic className="h-4 w-4" /></button>
          <button type="button" onClick={() => updateStyle(selectedElementId, { underline: !textStyle?.underline })} aria-pressed={Boolean(textStyle?.underline)} title="Sottolineato" className={`rounded-lg p-2 ${textStyle?.underline ? 'bg-sky-500 text-white' : 'bg-white/5 text-white/70'}`}><Underline className="h-4 w-4" /></button>
          <span className="mx-1 h-5 w-px bg-white/10" />
          <button type="button" onClick={() => updateStyle(selectedElementId, { align: 'left' })} aria-label="Allinea a sinistra" aria-pressed={(textStyle?.align ?? 'left') === 'left'} className={`rounded-lg p-2 ${(textStyle?.align ?? 'left') === 'left' ? 'bg-sky-500 text-white' : 'bg-white/5 text-white/70'}`}><AlignLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => updateStyle(selectedElementId, { align: 'center' })} aria-label="Centra" aria-pressed={textStyle?.align === 'center'} className={`rounded-lg p-2 ${textStyle?.align === 'center' ? 'bg-sky-500 text-white' : 'bg-white/5 text-white/70'}`}><AlignCenter className="h-4 w-4" /></button>
          <button type="button" onClick={() => updateStyle(selectedElementId, { align: 'right' })} aria-label="Allinea a destra" aria-pressed={textStyle?.align === 'right'} className={`rounded-lg p-2 ${textStyle?.align === 'right' ? 'bg-sky-500 text-white' : 'bg-white/5 text-white/70'}`}><AlignRight className="h-4 w-4" /></button>
          <input type="color" aria-label="Colore del testo" value={textStyle?.color || '#ffffff'} onChange={(e) => updateStyle(selectedElementId, { color: e.target.value })} className="ml-auto h-8 w-9 cursor-pointer rounded border-0 bg-transparent" />
          <button type="button" onClick={() => resetStyle(selectedElementId)} title="Ripristina stile" className="rounded-lg bg-white/5 p-2 text-white/60 hover:text-white"><RotateCcw className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Immagini associate all'elemento */}
      {imageIds.map((imgId) => (
        <div key={imgId} className="space-y-2 pt-2 border-t border-white/10">
          <label className="text-[10px] font-mono uppercase text-white/50 block font-bold">
            Immagine del blocco
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={images[imgId] || ''}
              onChange={(e) => updateImage(imgId, e.target.value)}
              placeholder="Incolla URL immagine o carica dal dispositivo..."
              className="flex-1 bg-zinc-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <button
              type="button"
              onClick={() => pickImageFile((dataUrl) => updateImage(imgId, dataUrl))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer shrink-0"
            >
              <ImagePlus className="w-3.5 h-3.5" /> Sfoglia
            </button>
          </div>
          {images[imgId] && (
            <button
              type="button"
              onClick={() => updateImage(imgId, '')}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Ripristina immagine predefinita
            </button>
          )}
        </div>
      ))}

      {/* Link di destinazione se il blocco contiene un anchor */}
      {hasAnchor && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="text-[10px] font-mono uppercase text-white/50 block font-bold">
            Link / URL del bottone
          </label>
          <input
            type="text"
            value={anchorHref}
            onChange={(e) => {
              setAnchorHref(e.target.value);
              updateLink(selectedElementId, e.target.value);
            }}
            placeholder="https://... oppure tel:+39..."
            className="w-full bg-zinc-950 border border-white/15 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
      )}
    </div>
  );
};
