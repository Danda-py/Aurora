import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { TextStyle } from './CMSContext';
import { GuestPass, Language, WelcomePage } from '../../types';

/**
 * Mock pass NEUTRO per la modalità editor: nessun dato reale del cliente.
 * checkInConfirmed + documentsUploaded = true così la Tessera mostra anche
 * il tasto apriporta (vista completa "con pass").
 * Le date sono DINAMICHE (oggi → oggi+3) così il pass è sempre ATTIVO/VALIDO:
 * con date fisse era risultato "scaduto" col passare del tempo.
 */
const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const today = new Date();
const checkout = new Date(today);
checkout.setDate(today.getDate() + 3);

export const MOCK_EDITOR_PASS: GuestPass = {
  id: 'editor-mock-pass',
  guestName: 'MARIO',
  guestSurname: 'ROSSI',
  phone: '+39 333 000 0000',
  checkInDate: isoDate(today),
  checkInTime: '14:00',
  checkOutDate: isoDate(checkout),
  checkOutTime: '10:00',
  pinCode: '0000',
  bookingRef: 'ABC123XYZ',
  guestsCount: 2,
  token: 'editor-mock-token',
  createdAt: new Date().toISOString(),
  active: true,
  checkInConfirmed: true,
  documentsUploaded: true,
};

/** Card / Tile dentro una sezione della Home */
export interface CMSHomeTile {
  id: string;
  page: WelcomePage;
  label: string;
  tag: string;
  desc: string;
  bgImage: string;
  hidden?: boolean;
  externalUrl?: string;
  translations?: Partial<Record<Language, Partial<Record<'label' | 'tag' | 'desc', string>>>>;
}

/** Sezione orizzontale della Home (es. "Guida & Arrivo", "Vivere la Valtellina") */
export interface CMSHomeSection {
  id: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  items: CMSHomeTile[];
  translations?: Partial<Record<Language, Partial<Record<'title' | 'subtitle', string>>>>;
}

/** Blocco libero personalizzato aggiungibile in qualsiasi sottopagina o nella Home */
export interface CMSCustomBlock {
  id: string;
  badge?: string;
  title: string;
  body: string;
  imageUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  translations?: Partial<Record<Language, Partial<Record<'badge' | 'title' | 'body' | 'buttonLabel', string>>>>;
}

/** Singola voce di una sottopagina (ristorante, regola, servizio, negozio, trasporto, ecc.) */
export interface CMSSubpageItem {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  iconName?: string;
  translations?: Partial<Record<Language, Partial<Record<'title' | 'desc' | 'subtitle' | 'tag', string>>>>;
  time?: string;
  hours?: string;
  address?: string;
  desc: string;
  phone?: string;
  mapsUrl?: string;
  webUrl?: string;
  webLabel?: string;
  imageUrl?: string;
}

export function getLocalizedCMSSubpageItem(item: CMSSubpageItem, language: Language): CMSSubpageItem {
  if (language === 'it') return item;
  const translation = item.translations?.[language];
  return translation ? { ...item, ...translation } : item;
}

export function hasCMSSubpageTranslations(items: CMSSubpageItem[], language: Language): boolean {
  if (language === 'it') return true;
  const textFields = ['title', 'desc', 'subtitle', 'tag'] as const;
  return items.every((item) =>
    textFields.every((field) => {
      const source = item[field];
      return typeof source !== 'string' || !source.trim() || Boolean(item.translations?.[language]?.[field]?.trim());
    }),
  );
}

export function getLocalizedCMSHomeSections(sections: CMSHomeSection[], language: Language): CMSHomeSection[] {
  if (language === 'it') return sections;
  return sections.map((section) => ({
    ...section,
    ...(section.translations?.[language] ?? {}),
    items: section.items.map((item) => ({ ...item, ...(item.translations?.[language] ?? {}) })),
  }));
}

export function hasCMSHomeTranslations(sections: CMSHomeSection[], language: Language): boolean {
  if (language === 'it') return true;
  return sections.every((section) => {
    const sectionFields = ['title', 'subtitle'] as const;
    const sectionReady = sectionFields.every((field) => {
      const source = section[field];
      return typeof source !== 'string' || !source.trim() || Boolean(section.translations?.[language]?.[field]?.trim());
    });
    return sectionReady && section.items.every((item) =>
      (['label', 'tag', 'desc'] as const).every((field) => {
        const source = item[field];
        return typeof source !== 'string' || !source.trim() || Boolean(item.translations?.[language]?.[field]?.trim());
      }),
    );
  });
}

export function getLocalizedCMSCustomBlock(block: CMSCustomBlock, language: Language): CMSCustomBlock {
  if (language === 'it') return block;
  return { ...block, ...(block.translations?.[language] ?? {}) };
}

export const DEFAULT_CAROUSEL_IMAGES = ['heroLiving', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'view'];

export const DEFAULT_HOME_SECTIONS: CMSHomeSection[] = [
  {
    id: 'houseEssentials',
    title: 'Guida & Arrivo',
    subtitle: 'Tutto per iniziare il soggiorno',
    visible: true,
    items: [
      {
        id: 'tile-posizione',
        page: 'posizione',
        label: 'Come arrivare',
        tag: 'Priorità Arrivo',
        desc: 'Indirizzo esatto, navigatore GPS, parcheggio e treni',
        bgImage: '/uploads/map.jpg',
      },
      {
        id: 'tile-check_in',
        page: 'check_in',
        label: 'Check-in & Smart Lock',
        tag: 'Accesso Casa',
        desc: 'Codice apriporta, keybox e ingresso autonomo',
        bgImage: '/uploads/lock.jpg',
      },
      {
        id: 'tile-servizi',
        page: 'servizi',
        label: 'Servizi casa & Comfort',
        tag: 'Dotazioni',
        desc: 'Riscaldamento, elettrodomestici, cucina e comfort',
        bgImage: '/uploads/services.jpg',
      },
      {
        id: 'tile-regole',
        page: 'regole',
        label: 'Regole della casa',
        tag: 'Orari & Quiete',
        desc: 'Orari di rispetto, rifiuti e divieto di fumo',
        bgImage: 'https://media.istockphoto.com/id/2235883229/it/vettoriale/regolamento-prenota.webp?a=1&b=1&s=612x612&w=0&k=20&c=qjJ-peYXP2tDDXUHH8pNKRx3JxtUvklW6HBjml8EIkg=',
      },
    ],
  },
  {
    id: 'exploreValtellina',
    title: 'Vivere la Valtellina',
    subtitle: 'Gusto, tradizioni e trasporti locali',
    visible: true,
    items: [
      {
        id: 'tile-ristoranti',
        page: 'ristoranti',
        label: 'Dove mangiare & Crotto',
        tag: 'Enogastronomia',
        desc: 'Crotto tipico, pizzoccheri, ristoranti e asporto',
        bgImage: '/uploads/restaurant.jpg',
      },
      {
        id: 'tile-shopping',
        page: 'shopping',
        label: 'Spesa e botteghe',
        tag: 'Prodotti Tipici',
        desc: 'Botteghe storiche del Bitto, alimentari e market',
        bgImage: '/uploads/bottega.jpg',
      },
      {
        id: 'tile-attivita',
        page: 'attivita',
        label: 'Attività & Esperienze',
        tag: 'Natura & Relax',
        desc: 'Sentieri, cantine, bici e luoghi da scoprire',
        bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'tile-bar_club',
        page: 'bar_club',
        label: 'Bar, Caffè & Aperitivi',
        tag: 'Colazione & Relax',
        desc: 'Pasticcerie storiche, wine bar e locali in centro',
        bgImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'tile-trasporti',
        page: 'trasporti',
        label: 'Come muoversi',
        tag: 'Treni & Bus',
        desc: 'Stazione FS Morbegno, orari bus e taxi',
        bgImage: '/uploads/train.jpg',
      },
      {
        id: 'tile-informazioni',
        page: 'informazioni',
        label: 'Informazioni e servizi',
        tag: 'Info Pratiche',
        desc: 'Farmacie, banche, raccolta rifiuti e CIR/CIN',
        bgImage: '/uploads/info.jpg',
      },
    ],
  },
  {
    id: 'supportSecurity',
    title: 'Supporto & Sicurezza',
    subtitle: 'Assistenza sempre a portata di mano',
    visible: true,
    items: [
      {
        id: 'tile-contatti',
        page: 'contatti',
        label: 'Contatta Nino',
        tag: 'Host Dedicato',
        desc: 'Assistenza diretta via WhatsApp e telefonica',
        bgImage: '/uploads/host.jpg',
      },
      {
        id: 'tile-emergenza',
        page: 'emergenza',
        label: 'Emergenze & Numeri utili',
        tag: 'Soccorso 24/7',
        desc: 'Carabinieri, Ospedale Morbegno, farmacia di turno e 112',
        bgImage: '/uploads/emergency.jpg',
      },
      {
        id: 'tile-wifi',
        page: 'wifi',
        label: 'Wi-Fi Fibra',
        tag: 'Connessione',
        desc: 'QR Code rapido, nome rete e password fibra',
        bgImage: '/uploads/living.jpg',
      },
    ],
  },
  {
    id: 'departure',
    title: 'Partenza & Check-out',
    subtitle: 'Istruzioni per la conclusione del soggiorno',
    visible: true,
    items: [
      {
        id: 'tile-check_out',
        page: 'check_out',
        label: 'Checklist check-out',
        tag: 'Entro le 10:00',
        desc: 'Riconsegna chiavi, orari e recensione del soggiorno',
        bgImage: 'https://media.istockphoto.com/id/2219309082/it/foto/persona-che-esce-di-casa-con-la-valigia-porta-esistente-del-viaggiatore-con-bagagli.webp?a=1&b=1&s=612x612&w=0&k=20&c=dzLdna5DxchqxEUdEZApP6xKCVUfsBbhVQfEI5u0nB8=',
      },
    ],
  },
];

/**
 * Forma del documento persistito: stili, testi, immagini, orari, link,
 * sezioni della Home, voci delle sottopagine e blocchi personalizzati.
 */
export interface CMSEditsDocument {
  version: 1;
  styles: Record<string, TextStyle>;
  texts: Record<string, Record<string, string>>;
  images: Record<string, string>;
  times: Record<string, string>;
  links: Record<string, string>;
  homeSections?: CMSHomeSection[];
  showPhotoCarousel?: boolean;
  carouselImages?: string[];
  subpageItems?: Record<string, CMSSubpageItem[]>;
  customBlocks?: Record<string, CMSCustomBlock[]>;
}

const EMPTY_DOC: CMSEditsDocument = {
  version: 1,
  styles: {},
  texts: {},
  images: {},
  times: {},
  links: {},
  homeSections: undefined,
  showPhotoCarousel: false,
  carouselImages: DEFAULT_CAROUSEL_IMAGES,
  subpageItems: {},
  customBlocks: {},
};

const STORAGE_KEY = 'aurora_visual_cms_edits_v1';

/**
 * Persistenza: SEMPRE tramite il server (PUT /api/cms/edits con sessione host
 * via cookie; GET pubblico per la lettura). Il client non scrive mai direttamente
 * su Supabase: la RLS lo vieta e il server valida con il service role key.
 * localStorage resta come cache offline/fallback (es. server non raggiungibile).
 */
function createPersistence() {
  const readLocal = (): CMSEditsDocument | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CMSEditsDocument) : null;
    } catch {
      return null;
    }
  };
  const writeLocal = (doc: CMSEditsDocument): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      return true;
    } catch {
      return false;
    }
  };

  return {
    backend: 'server' as const,
    load: async (): Promise<CMSEditsDocument | null> => {
      try {
        const res = await fetch('/api/cms/edits');
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            writeLocal(json.data as CMSEditsDocument);
            return json.data as CMSEditsDocument;
          }
        }
      } catch {
        // server non raggiungibile: fallback alla cache locale
      }
      return readLocal();
    },
    save: async (doc: CMSEditsDocument): Promise<boolean> => {
      writeLocal(doc);
      try {
        const res = await fetch('/api/cms/edits', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ data: doc }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  };
}

interface EditModeContextValue {
  isEditMode: boolean;
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  /** Pagina attualmente visualizzata dentro l'iPhone (controllabile anche dal pannello laterale) */
  activePage: WelcomePage;
  setActivePage: (page: WelcomePage) => void;
  styles: Record<string, TextStyle>;
  updateStyle: (id: string, patch: Partial<TextStyle>, options?: { immediate?: boolean }) => void;
  resetStyle: (id: string) => void;
  texts: Record<string, Record<string, string>>;
  updateText: (id: string, language: string, text: string, options?: { immediate?: boolean }) => void;
  resetText: (id: string) => void;
  images: Record<string, string>;
  updateImage: (id: string, url: string) => void;
  times: Record<string, string>;
  updateTime: (id: string, time: string) => void;
  links: Record<string, string>;
  updateLink: (id: string, url: string) => void;
  /** Gestione sezioni e card della Home */
  homeSections: CMSHomeSection[];
  updateHomeSections: (sections: CMSHomeSection[]) => void;
  resetHomeSections: () => void;
  showPhotoCarousel: boolean;
  setShowPhotoCarousel: (show: boolean) => void;
  carouselImages: string[];
  setCarouselImages: (images: string[]) => void;
  /** Voci personalizzate delle sottopagine (es. ristoranti, regole, servizi, negozi...) */
  subpageItems: Record<string, CMSSubpageItem[]>;
  updateSubpageItems: (pageKey: string, items: CMSSubpageItem[]) => void;
  resetSubpageItems: (pageKey: string) => void;
  /** Blocchi liberi aggiunti nelle sottopagine o in Home */
  customBlocks: Record<string, CMSCustomBlock[]>;
  updateCustomBlocks: (pageKey: string, blocks: CMSCustomBlock[]) => void;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  saveStatus: 'saved' | 'saving' | 'error';
  translationStatus: 'idle' | 'translating' | 'error';
  translateAll: () => void;
  saveNow: () => Promise<void>;
  previewVariant: 'pass' | 'no-pass';
  setPreviewVariant: (variant: 'pass' | 'no-pass') => void;
}

const EditModeContext = createContext<EditModeContextValue | undefined>(undefined);

export const useEditMode = (): EditModeContextValue => {
  const ctx = useContext(EditModeContext);
  return (
    ctx ?? {
      isEditMode: false,
      selectedElementId: null,
      selectElement: () => {},
      activePage: 'grid_menu',
      setActivePage: () => {},
      styles: {},
      updateStyle: () => {},
      resetStyle: () => {},
      texts: {},
      updateText: () => {},
      resetText: () => {},
      images: {},
      updateImage: () => {},
      times: {},
      updateTime: () => {},
      links: {},
      updateLink: () => {},
      homeSections: DEFAULT_HOME_SECTIONS,
      updateHomeSections: () => {},
      resetHomeSections: () => {},
      showPhotoCarousel: false,
      setShowPhotoCarousel: () => {},
      carouselImages: DEFAULT_CAROUSEL_IMAGES,
      setCarouselImages: () => {},
      subpageItems: {},
      updateSubpageItems: () => {},
      resetSubpageItems: () => {},
      customBlocks: {},
      updateCustomBlocks: () => {},
      currentLanguage: 'it',
      setLanguage: () => {},
      saveStatus: 'saved' as const,
      translationStatus: 'idle' as const,
      translateAll: () => {},
      saveNow: async () => {},
      previewVariant: 'pass' as const,
      setPreviewVariant: () => {},
    }
  );
};

export const EditModeProvider: React.FC<{
  children: ReactNode;
  isEditMode?: boolean;
  initialLanguage?: string;
  applyEdits?: boolean;
}> = ({ children, isEditMode = true, initialLanguage = 'it', applyEdits = true }) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<WelcomePage>('grid_menu');
  const [styles, setStyles] = useState<Record<string, TextStyle>>({});
  const [texts, setTexts] = useState<Record<string, Record<string, string>>>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [times, setTimes] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<Record<string, string>>({});
  const [homeSections, setHomeSections] = useState<CMSHomeSection[]>(DEFAULT_HOME_SECTIONS);
  const [showPhotoCarousel, setShowPhotoCarouselState] = useState<boolean>(false);
  const [carouselImages, setCarouselImagesState] = useState<string[]>(DEFAULT_CAROUSEL_IMAGES);
  const [subpageItems, setSubpageItems] = useState<Record<string, CMSSubpageItem[]>>({});
  const [customBlocks, setCustomBlocks] = useState<Record<string, CMSCustomBlock[]>>({});
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'translating' | 'error'>('idle');
  const [previewVariant, setPreviewVariant] = useState<'pass' | 'no-pass'>('pass');

  const persistenceRef = useRef<ReturnType<typeof createPersistence> | null>(null);
  if (!persistenceRef.current) persistenceRef.current = createPersistence();
  const docRef = useRef<CMSEditsDocument>(EMPTY_DOC);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translationQueue = useRef<Record<string, string>>({});
  const translationRequestId = useRef(0);
  const textsRef = useRef(texts);
  const subpageItemsRef = useRef(subpageItems);
  const homeSectionsRef = useRef(homeSections);
  const customBlocksRef = useRef(customBlocks);
  textsRef.current = texts;
  subpageItemsRef.current = subpageItems;
  homeSectionsRef.current = homeSections;
  customBlocksRef.current = customBlocks;

  useEffect(() => {
    let cancelled = false;
    if (!applyEdits) return;
    persistenceRef.current!.load().then((doc) => {
      if (cancelled || !doc) return;
      docRef.current = { ...EMPTY_DOC, ...doc };
      setStyles(doc.styles ?? {});
      setTexts(doc.texts ?? {});
      setImages(doc.images ?? {});
      setTimes(doc.times ?? {});
      setLinks(doc.links ?? {});
      if (Array.isArray(doc.homeSections)) {
        setHomeSections(doc.homeSections);
      }
      if (typeof doc.showPhotoCarousel === 'boolean') {
        setShowPhotoCarouselState(doc.showPhotoCarousel);
      }
      if (Array.isArray(doc.carouselImages)) {
        setCarouselImagesState(doc.carouselImages.filter((key) => typeof key === 'string'));
      }
      if (doc.subpageItems && typeof doc.subpageItems === 'object') {
        setSubpageItems(doc.subpageItems);
      }
      if (doc.customBlocks && typeof doc.customBlocks === 'object') {
        setCustomBlocks(doc.customBlocks);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [applyEdits]);

  const persist = useCallback((debounceMs = 0) => {
    const run = async () => {
      setSaveStatus('saving');
      const ok = await persistenceRef.current!.save(docRef.current);
      setSaveStatus(ok ? 'saved' : 'error');
    };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (debounceMs > 0) {
      saveTimer.current = setTimeout(run, debounceMs);
    } else {
      void run();
    }
  }, []);

  const commit = useCallback(() => {
    docRef.current = {
      version: 1,
      styles,
      texts,
      images,
      times,
      links,
      homeSections,
      showPhotoCarousel,
      carouselImages,
      subpageItems,
      customBlocks,
    };
  }, [styles, texts, images, times, links, homeSections, showPhotoCarousel, carouselImages, subpageItems, customBlocks]);

  useEffect(() => {
    commit();
  }, [commit]);

  const saveNow = useCallback(async () => {
    commit();
    await persist(0);
  }, [commit, persist]);

  const enqueueTranslations = useCallback((entries: Record<string, string>, delayMs = 900) => {
    if (!applyEdits || Object.keys(entries).length === 0) return;
    Object.assign(translationQueue.current, entries);
    if (translationTimer.current) clearTimeout(translationTimer.current);
    translationTimer.current = setTimeout(async () => {
      translationTimer.current = null;
      const batch = translationQueue.current;
      translationQueue.current = {};
      if (Object.keys(batch).length === 0) return;
      const requestId = ++translationRequestId.current;
      setTranslationStatus('translating');
      try {
        const entries = Object.entries(batch);
        const batches: Record<string, string>[] = [];
        let currentBatch: Record<string, string> = {};
        let currentLength = 0;
        for (const [key, value] of entries) {
          if (Object.keys(currentBatch).length >= 35 || currentLength + value.length > 12000) {
            if (Object.keys(currentBatch).length) batches.push(currentBatch);
            currentBatch = {};
            currentLength = 0;
          }
          currentBatch[key] = value;
          currentLength += value.length;
        }
        if (Object.keys(currentBatch).length) batches.push(currentBatch);
        const translations: Record<string, Record<string, string>> = {};
        let nextBatchIndex = 0;
        const workerCount = Math.min(5, batches.length);
        await Promise.all(Array.from({ length: workerCount }, async () => {
          while (nextBatchIndex < batches.length) {
            const batchIndex = nextBatchIndex++;
            const response = await fetch('/api/cms/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ texts: batches[batchIndex] }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Traduzione non riuscita');
            Object.assign(translations, data.translations);
          }
        }));

        const nextTexts = { ...textsRef.current };
        const nextSubpageItems = { ...subpageItemsRef.current };
        const nextHomeSections = [...homeSectionsRef.current];
        const nextCustomBlocks = { ...customBlocksRef.current };
        let textsChanged = false;
        let subpageItemsChanged = false;
        let homeSectionsChanged = false;
        let customBlocksChanged = false;

        for (const [encodedKey, sourceText] of Object.entries(batch)) {
          const translated = translations?.[encodedKey];
          if (!translated) continue;
          let keyParts: unknown[];
          try {
            keyParts = JSON.parse(encodedKey);
          } catch {
            continue;
          }
          if (keyParts[0] === 'text' && typeof keyParts[1] === 'string') {
            const textId = keyParts[1];
            if (nextTexts[textId]?.it !== sourceText) continue;
            nextTexts[textId] = { ...nextTexts[textId] };
            for (const lang of ['en', 'de', 'fr', 'es'] as const) {
              if (translated[lang]) nextTexts[textId][lang] = translated[lang];
            }
            textsChanged = true;
          } else if (
            keyParts[0] === 'subpage' &&
            typeof keyParts[1] === 'string' &&
            typeof keyParts[2] === 'string' &&
            typeof keyParts[3] === 'string'
          ) {
            const [, pageKey, itemId, field] = keyParts as [string, string, string, string];
            if (!['title', 'desc', 'subtitle', 'tag'].includes(field)) continue;
            const currentItems = nextSubpageItems[pageKey];
            const itemIndex = currentItems?.findIndex((item) => item.id === itemId) ?? -1;
            if (itemIndex < 0 || currentItems[itemIndex][field as 'title' | 'desc' | 'subtitle' | 'tag'] !== sourceText) continue;
            const updatedItems = [...currentItems];
            const currentItem = updatedItems[itemIndex];
            const nextItemTranslations = { ...(currentItem.translations ?? {}) };
            for (const lang of ['en', 'de', 'fr', 'es'] as const) {
              if (!translated[lang]) continue;
              nextItemTranslations[lang] = {
                ...(nextItemTranslations[lang] ?? {}),
                [field]: translated[lang],
              };
            }
            updatedItems[itemIndex] = { ...currentItem, translations: nextItemTranslations };
            nextSubpageItems[pageKey] = updatedItems;
            subpageItemsChanged = true;
          } else if (keyParts[0] === 'home-section' && typeof keyParts[1] === 'string' && typeof keyParts[2] === 'string') {
            const [, sectionId, field] = keyParts as [string, string, string];
            if (!['title', 'subtitle'].includes(field)) continue;
            const sectionIndex = nextHomeSections.findIndex((section) => section.id === sectionId);
            const section = nextHomeSections[sectionIndex];
            if (!section || section[field as 'title' | 'subtitle'] !== sourceText) continue;
            const sectionTranslations = { ...(section.translations ?? {}) };
            for (const lang of ['en', 'de', 'fr', 'es'] as const) {
              if (translated[lang]) sectionTranslations[lang] = { ...(sectionTranslations[lang] ?? {}), [field]: translated[lang] };
            }
            nextHomeSections[sectionIndex] = { ...section, translations: sectionTranslations };
            homeSectionsChanged = true;
          } else if (keyParts[0] === 'home-tile' && typeof keyParts[1] === 'string' && typeof keyParts[2] === 'string' && typeof keyParts[3] === 'string') {
            const [, sectionId, tileId, field] = keyParts as [string, string, string, string];
            if (!['label', 'tag', 'desc'].includes(field)) continue;
            const sectionIndex = nextHomeSections.findIndex((section) => section.id === sectionId);
            const section = nextHomeSections[sectionIndex];
            const tileIndex = section?.items.findIndex((item) => item.id === tileId) ?? -1;
            const tile = section?.items[tileIndex];
            if (!section || !tile || tile[field as 'label' | 'tag' | 'desc'] !== sourceText) continue;
            const tileTranslations = { ...(tile.translations ?? {}) };
            for (const lang of ['en', 'de', 'fr', 'es'] as const) {
              if (translated[lang]) tileTranslations[lang] = { ...(tileTranslations[lang] ?? {}), [field]: translated[lang] };
            }
            const updatedItems = [...section.items];
            updatedItems[tileIndex] = { ...tile, translations: tileTranslations };
            nextHomeSections[sectionIndex] = { ...section, items: updatedItems };
            homeSectionsChanged = true;
          } else if (keyParts[0] === 'custom' && typeof keyParts[1] === 'string' && typeof keyParts[2] === 'string' && typeof keyParts[3] === 'string') {
            const [, pageKey, blockId, field] = keyParts as [string, string, string, string];
            if (!['badge', 'title', 'body', 'buttonLabel'].includes(field)) continue;
            const pageBlocks = nextCustomBlocks[pageKey];
            const blockIndex = pageBlocks?.findIndex((block) => block.id === blockId) ?? -1;
            const block = pageBlocks?.[blockIndex];
            if (!block || block[field as 'badge' | 'title' | 'body' | 'buttonLabel'] !== sourceText) continue;
            const blockTranslations = { ...(block.translations ?? {}) };
            for (const lang of ['en', 'de', 'fr', 'es'] as const) {
              if (translated[lang]) blockTranslations[lang] = { ...(blockTranslations[lang] ?? {}), [field]: translated[lang] };
            }
            const updatedBlocks = [...pageBlocks];
            updatedBlocks[blockIndex] = { ...block, translations: blockTranslations };
            nextCustomBlocks[pageKey] = updatedBlocks;
            customBlocksChanged = true;
          }
        }

        if (textsChanged) {
          textsRef.current = nextTexts;
          setTexts(nextTexts);
        }
        if (subpageItemsChanged) {
          subpageItemsRef.current = nextSubpageItems;
          setSubpageItems(nextSubpageItems);
        }
        if (homeSectionsChanged) {
          homeSectionsRef.current = nextHomeSections;
          setHomeSections(nextHomeSections);
        }
        if (customBlocksChanged) {
          customBlocksRef.current = nextCustomBlocks;
          setCustomBlocks(nextCustomBlocks);
        }
        if (textsChanged || subpageItemsChanged || homeSectionsChanged || customBlocksChanged) {
          docRef.current = {
            ...docRef.current,
            ...(textsChanged ? { texts: nextTexts } : {}),
            ...(subpageItemsChanged ? { subpageItems: nextSubpageItems } : {}),
            ...(homeSectionsChanged ? { homeSections: nextHomeSections } : {}),
            ...(customBlocksChanged ? { customBlocks: nextCustomBlocks } : {}),
          };
          persist(300);
        }
        if (requestId === translationRequestId.current && !translationTimer.current) {
          setTranslationStatus('idle');
        }
      } catch (error) {
        console.warn('[Visual CMS] Traduzione automatica non riuscita:', error);
        if (requestId === translationRequestId.current && !translationTimer.current) {
          setTranslationStatus('error');
        }
      }
    }, 900);
  }, [applyEdits, persist]);

  const translateAll = useCallback(() => {
    const entries: Record<string, string> = {};
    for (const [id, localized] of Object.entries(textsRef.current)) {
      if (typeof localized.it === 'string' && localized.it.trim()) {
        entries[JSON.stringify(['text', id])] = localized.it;
      }
    }
    for (const [pageKey, items] of Object.entries(subpageItemsRef.current)) {
      for (const item of items) {
        for (const field of ['title', 'desc', 'subtitle', 'tag'] as const) {
          const value = item[field];
          if (typeof value === 'string' && value.trim()) {
            entries[JSON.stringify(['subpage', pageKey, item.id, field])] = value;
          }
        }
      }
    }
    for (const section of homeSectionsRef.current) {
      for (const field of ['title', 'subtitle'] as const) {
        const value = section[field];
        if (typeof value === 'string' && value.trim()) {
          entries[JSON.stringify(['home-section', section.id, field])] = value;
        }
      }
      for (const item of section.items) {
        for (const field of ['label', 'tag', 'desc'] as const) {
          const value = item[field];
          if (typeof value === 'string' && value.trim()) {
            entries[JSON.stringify(['home-tile', section.id, item.id, field])] = value;
          }
        }
      }
    }
    for (const [pageKey, blocks] of Object.entries(customBlocksRef.current)) {
      for (const block of blocks) {
        for (const field of ['badge', 'title', 'body', 'buttonLabel'] as const) {
          const value = block[field];
          if (typeof value === 'string' && value.trim()) {
            entries[JSON.stringify(['custom', pageKey, block.id, field])] = value;
          }
        }
      }
    }
    enqueueTranslations(entries, 0);
  }, [enqueueTranslations]);

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const selectedRef = useRef(selectedElementId);
  selectedRef.current = selectedElementId;

  useEffect(() => {
    if (!isEditMode) return;
    const onCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('[data-cms-sidepanel], [data-floating-toolbar], [data-cms-control]')) return;
      const holder = target.closest('[data-editable-id]') as HTMLElement | null;
      const id = holder?.getAttribute('data-editable-id') ?? null;
      if (!id || selectedRef.current === id) return;
      e.preventDefault();
      e.stopPropagation();
      selectElement(id);
    };
    document.addEventListener('click', onCaptureClick, true);
    return () => document.removeEventListener('click', onCaptureClick, true);
  }, [isEditMode, selectElement]);

  const updateStyle = useCallback(
    (id: string, patch: Partial<TextStyle>, options?: { immediate?: boolean }) => {
      setStyles((prev) => {
        const next = {
          ...prev,
          [id]: {
            role: 'body' as const,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 14,
            bold: false,
            italic: false,
            underline: false,
            color: '',
            align: 'left' as const,
            ...prev[id],
            ...patch,
          },
        };
        docRef.current = { ...docRef.current, styles: next };
        return next;
      });
      persist(options?.immediate ? 0 : 600);
    },
    [persist],
  );

  const resetStyle = useCallback(
    (id: string) => {
      setStyles((prev) => {
        const next = { ...prev };
        delete next[id];
        docRef.current = { ...docRef.current, styles: next };
        return next;
      });
      persist(0);
    },
    [persist],
  );

  const updateText = useCallback(
    (id: string, language: string, text: string, options?: { immediate?: boolean }) => {
      const next = { ...textsRef.current, [id]: { ...(textsRef.current[id] ?? {}), [language]: text } };
      textsRef.current = next;
      setTexts(next);
      docRef.current = { ...docRef.current, texts: next };
      persist(options?.immediate ? 0 : 600);
      if (language === 'it' && text.trim()) {
        enqueueTranslations({ [JSON.stringify(['text', id])]: text });
      }
    },
    [enqueueTranslations, persist],
  );

  const resetText = useCallback(
    (id: string) => {
      const next = { ...textsRef.current };
      Object.keys(next).forEach((key) => {
        if (key === id || key.startsWith(`${id}#`)) delete next[key];
      });
      textsRef.current = next;
      setTexts(next);
      docRef.current = { ...docRef.current, texts: next };
      persist(0);
    },
    [persist],
  );

  const updateImage = useCallback(
    (id: string, url: string) => {
      setImages((prev) => {
        const next = { ...prev };
        if (!url) {
          delete next[id];
        } else {
          next[id] = url;
        }
        docRef.current = { ...docRef.current, images: next };
        return next;
      });
      persist(0);
    },
    [persist],
  );

  const updateTime = useCallback(
    (id: string, time: string) => {
      setTimes((prev) => {
        const next = { ...prev, [id]: time };
        docRef.current = { ...docRef.current, times: next };
        return next;
      });
      persist(0);
    },
    [persist],
  );

  const updateLink = useCallback(
    (id: string, url: string) => {
      setLinks((prev) => {
        const next = { ...prev, [id]: url };
        docRef.current = { ...docRef.current, links: next };
        return next;
      });
      persist(0);
    },
    [persist],
  );

  const updateHomeSections = useCallback(
    (sections: CMSHomeSection[]) => {
      const previousSections = homeSectionsRef.current;
      const entries: Record<string, string> = {};
      for (const section of sections) {
        const previousSection = previousSections.find((previous) => previous.id === section.id);
        for (const field of ['title', 'subtitle'] as const) {
          const value = section[field];
          if (typeof value === 'string' && value.trim() && value !== previousSection?.[field]) {
            entries[JSON.stringify(['home-section', section.id, field])] = value;
          }
        }
        for (const item of section.items) {
          const previousItem = previousSection?.items.find((previous) => previous.id === item.id);
          for (const field of ['label', 'tag', 'desc'] as const) {
            const value = item[field];
            if (typeof value === 'string' && value.trim() && value !== previousItem?.[field]) {
              entries[JSON.stringify(['home-tile', section.id, item.id, field])] = value;
            }
          }
        }
      }
      if (Object.keys(entries).length > 0) {
        for (const section of sections) {
          for (const field of ['title', 'subtitle'] as const) {
            const value = section[field];
            if (typeof value !== 'string' || !value.trim()) continue;
            if (!(['en', 'de', 'fr', 'es'] as const).every((lang) => section.translations?.[lang]?.[field]?.trim())) {
              entries[JSON.stringify(['home-section', section.id, field])] = value;
            }
          }
          for (const item of section.items) {
            for (const field of ['label', 'tag', 'desc'] as const) {
              const value = item[field];
              if (typeof value !== 'string' || !value.trim()) continue;
              if (!(['en', 'de', 'fr', 'es'] as const).every((lang) => item.translations?.[lang]?.[field]?.trim())) {
                entries[JSON.stringify(['home-tile', section.id, item.id, field])] = value;
              }
            }
          }
        }
      }
      homeSectionsRef.current = sections;
      setHomeSections(sections);
      docRef.current = { ...docRef.current, homeSections: sections };
      persist(300);
      enqueueTranslations(entries);
    },
    [enqueueTranslations, persist],
  );

  const resetHomeSections = useCallback(() => {
    homeSectionsRef.current = DEFAULT_HOME_SECTIONS;
    setHomeSections(DEFAULT_HOME_SECTIONS);
    docRef.current = { ...docRef.current, homeSections: DEFAULT_HOME_SECTIONS };
    persist(0);
  }, [persist]);

  const setShowPhotoCarousel = useCallback(
    (show: boolean) => {
      setShowPhotoCarouselState(show);
      docRef.current = { ...docRef.current, showPhotoCarousel: show };
      persist(0);
    },
    [persist],
  );

  const setCarouselImages = useCallback(
    (keys: string[]) => {
      setCarouselImagesState(keys);
      docRef.current = { ...docRef.current, carouselImages: keys };
      persist(0);
    },
    [persist],
  );

  const updateSubpageItems = useCallback(
    (pageKey: string, items: CMSSubpageItem[]) => {
      const previousItems = subpageItemsRef.current[pageKey] ?? [];
      const entries: Record<string, string> = {};
      const textFields = ['title', 'desc', 'subtitle', 'tag'] as const;
      for (const item of items) {
        const previousItem = previousItems.find((previous) => previous.id === item.id);
        for (const field of textFields) {
          const value = item[field];
          if (typeof value !== 'string' || !value.trim() || value === previousItem?.[field]) continue;
          entries[JSON.stringify(['subpage', pageKey, item.id, field])] = value;
        }
      }
      if (Object.keys(entries).length > 0) {
        for (const item of items) {
          for (const field of textFields) {
            const value = item[field];
            if (typeof value !== 'string' || !value.trim()) continue;
            const hasAllTranslations = (['en', 'de', 'fr', 'es'] as const).every(
              (lang) => item.translations?.[lang]?.[field]?.trim(),
            );
            if (!hasAllTranslations) {
              entries[JSON.stringify(['subpage', pageKey, item.id, field])] = value;
            }
          }
        }
      }
      const next = { ...subpageItemsRef.current, [pageKey]: items };
      subpageItemsRef.current = next;
      setSubpageItems(next);
      docRef.current = { ...docRef.current, subpageItems: next };
      persist(300);
      enqueueTranslations(entries);
    },
    [enqueueTranslations, persist],
  );

  const resetSubpageItems = useCallback(
    (pageKey: string) => {
      const next = { ...subpageItemsRef.current };
      delete next[pageKey];
      subpageItemsRef.current = next;
      setSubpageItems(next);
      docRef.current = { ...docRef.current, subpageItems: next };
      persist(0);
    },
    [persist],
  );

  const updateCustomBlocks = useCallback(
    (pageKey: string, blocks: CMSCustomBlock[]) => {
      const previousBlocks = customBlocksRef.current[pageKey] ?? [];
      const entries: Record<string, string> = {};
      const fields = ['badge', 'title', 'body', 'buttonLabel'] as const;
      for (const block of blocks) {
        const previousBlock = previousBlocks.find((previous) => previous.id === block.id);
        for (const field of fields) {
          const value = block[field];
          if (typeof value === 'string' && value.trim() && value !== previousBlock?.[field]) {
            entries[JSON.stringify(['custom', pageKey, block.id, field])] = value;
          }
        }
      }
      if (Object.keys(entries).length > 0) {
        for (const block of blocks) {
          for (const field of fields) {
            const value = block[field];
            if (typeof value !== 'string' || !value.trim()) continue;
            if (!(['en', 'de', 'fr', 'es'] as const).every((lang) => block.translations?.[lang]?.[field]?.trim())) {
              entries[JSON.stringify(['custom', pageKey, block.id, field])] = value;
            }
          }
        }
      }
      const next = { ...customBlocksRef.current, [pageKey]: blocks };
      customBlocksRef.current = next;
      setCustomBlocks(next);
      docRef.current = { ...docRef.current, customBlocks: next };
      persist(300);
      enqueueTranslations(entries);
    },
    [enqueueTranslations, persist],
  );

  const setLanguage = useCallback((lang: string) => {
    setCurrentLanguage(lang);
  }, []);

  const value = useMemo(
    () => ({
      isEditMode,
      selectedElementId,
      selectElement,
      activePage,
      setActivePage,
      styles,
      updateStyle,
      resetStyle,
      texts,
      updateText,
      resetText,
      images,
      updateImage,
      times,
      updateTime,
      links,
      updateLink,
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
      currentLanguage,
      setLanguage,
      saveStatus,
      translationStatus,
      translateAll,
      saveNow,
      previewVariant,
      setPreviewVariant,
    }),
    [
      isEditMode,
      selectedElementId,
      selectElement,
      activePage,
      styles,
      updateStyle,
      resetStyle,
      texts,
      updateText,
      resetText,
      images,
      updateImage,
      times,
      updateTime,
      links,
      updateLink,
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
      currentLanguage,
      setLanguage,
      saveStatus,
      translationStatus,
      translateAll,
      saveNow,
      previewVariant,
      setPreviewVariant,
    ],
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
};
