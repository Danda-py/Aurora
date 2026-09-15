import { useState, useEffect, useCallback, useMemo } from 'react';
import { CmsBlock, CmsBlockType, CmsThemeSettings, VisibilityCondition, CMS_BLOCK_PRESETS } from '../types/cmsBuilder';
import { BOOK_DATA } from '../data/multilingualBookData';
import { saveCmsContent, fetchCmsContentFromServer } from '../services/cmsService';
import { savePropertyConfig, fetchPropertyConfig } from '../services/propertyService';
import { Language } from '../types';

const DRAFT_STORAGE_KEY = 'aurora_cms_builder_draft_v2';
const THEME_STORAGE_KEY = 'aurora_cms_theme_v2';

const INITIAL_BLOCKS: CmsBlock[] = [
  {
    id: 'block-welcome',
    type: 'welcome',
    title: 'Card di Benvenuto & Alloggi',
    category: 'identity',
    enabled: true,
    order: 0,
    visibilityRule: 'always',
    data: {
      title: BOOK_DATA.it.welcome.title || 'Benvenuti ad Aurora in Valtellina',
      greeting: BOOK_DATA.it.welcome.greeting || 'Siamo felici di ospitarvi a Morbegno!',
      message: BOOK_DATA.it.welcome.message || 'La vostra casa accogliente nel cuore delle Alpi, tra natura, gusto e relax.',
      viewTitle: BOOK_DATA.it.welcome.viewTitle || 'CORTE & VISTA ALPI',
      viewDesc: BOOK_DATA.it.welcome.viewDesc || 'Parcheggio privato riservato in cortile e vista aperta sulle cime Orobie.',
      livingTitle: BOOK_DATA.it.welcome.livingTitle || 'SALOTTO ACCOGLIENTE & RELAX',
      livingDesc: BOOK_DATA.it.welcome.livingDesc || 'Zona giorno luminosa con divano letto, Smart TV 55" e tavolo da pranzo.',
      bedroomTitle: BOOK_DATA.it.welcome.bedroomTitle || 'LETTO MATRIMONIALE KING SIZE',
      bedroomDesc: BOOK_DATA.it.welcome.bedroomDesc || 'Letto matrimoniale ergonomico, biancheria fresca in cotone e armadio capiente.',
      kitchenTitle: BOOK_DATA.it.welcome.kitchenTitle || 'CUCINA COMPLETA & INDUZIONE',
      kitchenDesc: BOOK_DATA.it.welcome.kitchenDesc || 'Piano cottura a induzione, forno, macchina caffè Nespresso e bollitore.'
    },
    i18n: {
      en: {
        title: BOOK_DATA.en?.welcome?.title || 'Welcome to Aurora in Valtellina',
        greeting: BOOK_DATA.en?.welcome?.greeting || 'We are thrilled to host you in Morbegno!',
        message: BOOK_DATA.en?.welcome?.message || 'Your cozy haven in the Italian Alps, surrounded by nature and peace.',
        viewTitle: BOOK_DATA.en?.welcome?.viewTitle || 'COURTYARD & ALPINE VIEW',
        viewDesc: BOOK_DATA.en?.welcome?.viewDesc || 'Private parking space in courtyard and mountain scenery.',
        livingTitle: BOOK_DATA.en?.welcome?.livingTitle || 'COZY LIVING ROOM & RELAX',
        livingDesc: BOOK_DATA.en?.welcome?.livingDesc || 'Bright living area with sofa bed, 55" Smart TV and dining table.',
        bedroomTitle: BOOK_DATA.en?.welcome?.bedroomTitle || 'KING SIZE MASTER BED',
        bedroomDesc: BOOK_DATA.en?.welcome?.bedroomDesc || 'Ergonomic king mattress, fresh cotton linens and spacious wardrobe.',
        kitchenTitle: BOOK_DATA.en?.welcome?.kitchenTitle || 'FULL INDUCTION KITCHEN',
        kitchenDesc: BOOK_DATA.en?.welcome?.kitchenDesc || 'Induction stove, oven, Nespresso coffee maker and electric kettle.'
      },
      de: {
        title: BOOK_DATA.de?.welcome?.title || 'Willkommen bei Aurora im Veltlin',
        greeting: BOOK_DATA.de?.welcome?.greeting || 'Wir freuen uns, Sie in Morbegno zu begrüßen!',
        message: BOOK_DATA.de?.welcome?.message || 'Ihr gemütliches Zuhause im Herzen der Alpen.',
        viewTitle: BOOK_DATA.de?.welcome?.viewTitle || 'INNENHOF & ALPENBLICK',
        viewDesc: BOOK_DATA.de?.welcome?.viewDesc || 'Privater Parkplatz im Innenhof und Bergblick.',
        livingTitle: BOOK_DATA.de?.welcome?.livingTitle || 'GEMÜTLICHES WOHNZIMMER',
        livingDesc: BOOK_DATA.de?.welcome?.livingDesc || 'Heller Wohnbereich mit Schlafsofa, 55" Smart TV und Esstisch.',
        bedroomTitle: BOOK_DATA.de?.welcome?.bedroomTitle || 'KING-SIZE DOPPELBETT',
        bedroomDesc: BOOK_DATA.de?.welcome?.bedroomDesc || 'Ergonomisches Doppelbett, frische Baumwollbettwäsche.',
        kitchenTitle: BOOK_DATA.de?.welcome?.kitchenTitle || 'INDUKTIONSKÜCHE KOMPLETT',
        kitchenDesc: BOOK_DATA.de?.welcome?.kitchenDesc || 'Induktionskochfeld, Ofen, Nespresso Kaffeemaschine.'
      },
      fr: {
        title: BOOK_DATA.fr?.welcome?.title || 'Bienvenue à Aurora en Valteline',
        greeting: BOOK_DATA.fr?.welcome?.greeting || 'Heureux de vous accueillir à Morbegno !',
        message: BOOK_DATA.fr?.welcome?.message || 'Votre havre de paix au cœur des Alpes italiennes.',
        viewTitle: BOOK_DATA.fr?.welcome?.viewTitle || 'COUR & VUE SUR LES ALPES',
        viewDesc: BOOK_DATA.fr?.welcome?.viewDesc || 'Place de parking privée et panorama alpin.',
        livingTitle: BOOK_DATA.fr?.welcome?.livingTitle || 'SALON COSY & DÉTENTE',
        livingDesc: BOOK_DATA.fr?.welcome?.livingDesc || 'Espace de vie lumineux avec canapé-lit et Smart TV 55".',
        bedroomTitle: BOOK_DATA.fr?.welcome?.bedroomTitle || 'LIT DOUBLE KING SIZE',
        bedroomDesc: BOOK_DATA.fr?.welcome?.bedroomDesc || 'Lit king size ergonomique et linge en coton doux.',
        kitchenTitle: BOOK_DATA.fr?.welcome?.kitchenTitle || 'CUISINE ÉQUIPÉE & INDUCTION',
        kitchenDesc: BOOK_DATA.fr?.welcome?.kitchenDesc || 'Plaque induction, four et machine Nespresso.'
      },
      es: {
        title: BOOK_DATA.es?.welcome?.title || 'Bienvenidos a Aurora en Valtelina',
        greeting: BOOK_DATA.es?.welcome?.greeting || '¡Encantados de recibirlos en Morbegno!',
        message: BOOK_DATA.es?.welcome?.message || 'Su acogedor hogar en el corazón de los Alpes.',
        viewTitle: BOOK_DATA.es?.welcome?.viewTitle || 'PATIO & VISTAS A LOS ALPES',
        viewDesc: BOOK_DATA.es?.welcome?.viewDesc || 'Aparcamiento privado en el patio y vistas a la montaña.',
        livingTitle: BOOK_DATA.es?.welcome?.livingTitle || 'SALÓN ACOGEDOR & RELAX',
        livingDesc: BOOK_DATA.es?.welcome?.livingDesc || 'Zona de estar luminosa con sofá cama y Smart TV 55".',
        bedroomTitle: BOOK_DATA.es?.welcome?.bedroomTitle || 'CAMA MATRIMONIAL KING SIZE',
        bedroomDesc: BOOK_DATA.es?.welcome?.bedroomDesc || 'Colchón king size ergonómico y sábanas de algodón.',
        kitchenTitle: BOOK_DATA.es?.welcome?.kitchenTitle || 'COCINA COMPLETA & INDUCCIÓN',
        kitchenDesc: BOOK_DATA.es?.welcome?.kitchenDesc || 'Placa de inducción, horno y cafetera Nespresso.'
      }
    }
  },
  {
    id: 'block-video',
    type: 'video_tutorial',
    title: 'Video Tutorial YouTube (Smart Lock & Accesso)',
    category: 'media',
    enabled: true,
    order: 1,
    visibilityRule: 'pass_active',
    data: {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoTitle: 'Come aprire il portone principale e la porta blindata',
      videoDescription: 'Guarda questo breve video di 30 secondi per vedere l\'apertura dello Smart Lock e l\'accesso al cortile privato.'
    }
  },
  {
    id: 'block-wifi',
    type: 'wifi',
    title: 'Connessione Wi-Fi Fibra Veloce',
    category: 'network',
    enabled: true,
    order: 2,
    visibilityRule: 'pass_active',
    data: {
      networkLabel: 'Aurora_Valtellina_5G',
      passwordLabel: 'AuroraMorbegno2025!',
      speedNotice: 'Fibra ottica ultraveloce fino a 1 Gbps con copertura in ogni stanza.'
    }
  },
  {
    id: 'block-breaker-thermostat',
    type: 'breaker_thermostat',
    title: 'Impianti, Quadro Elettrico & Riscaldamento',
    category: 'identity',
    enabled: true,
    order: 3,
    visibilityRule: 'always',
    data: {
      breakerLocation: 'Ingresso dell\'appartamento, a destra della porta principale dentro lo sportellino bianco a scomparsa. Se salta la luce per troppi elettrodomestici accesi insieme (induzione + forno), sollevare la levetta nera contrassegnata "GENERALE".',
      thermostatInstructions: 'Termostato digitale a parete situato in corridoio. Temperatura preimpostata ideale a 20.5°C. Toccare i tasti + o - per regolare la temperatura desiderata. In estate, il climatizzatore si aziona con il telecomando dedicato sul comodino.'
    }
  },
  {
    id: 'block-rules',
    type: 'house_rules',
    title: 'Regole della Casa & Convivenza',
    category: 'legal',
    enabled: true,
    order: 4,
    visibilityRule: 'always',
    data: {
      quietHours: '22:00 - 08:00 e 13:30 - 15:00 nel rispetto della quiete del condominio.',
      wasteInfo: 'Raccolta differenziata obbligatoria: i mastelli colorati sono nell\'area cortile interno. Carta (Giallo), Plastica & Metalli (Blu), Umido organico (Marrone), Indifferenziato (Grigio).',
      noSmoking: true,
      noParties: true,
      petsAllowed: false
    }
  },
  {
    id: 'block-guide',
    type: 'local_guide',
    title: 'Guida Morbegno & Ristoranti Tipici',
    category: 'guide',
    enabled: true,
    order: 5,
    visibilityRule: 'always',
    data: {
      recommendedRestaurants: 'Trattoria Valtellinese (pizzoccheri autentici a 400m), Crotto Caurga a Chiavenna, Birrificio Valtellinese.',
      highlights: 'Sentiero del Bitto, Ponte nel Cielo in Val Tartano (a 20 min), Lago di Como e Colico (15 min in auto).'
    }
  },
  {
    id: 'block-legal',
    type: 'legal_bureaucracy',
    title: 'Codici Ministeriali & Conformità Legale',
    category: 'legal',
    enabled: true,
    order: 6,
    visibilityRule: 'always',
    data: {
      cin: 'IT014045B4A1B2C3D4',
      cir: '014045-CNI-00042',
      securityNotice: 'Struttura registrata e conforme a tutte le normative di pubblica sicurezza e Polizia di Stato (Alloggiati Web).'
    }
  }
];

const DEFAULT_THEME: CmsThemeSettings = {
  primaryColor: '#f59e0b', // Valtellina Warm Amber
  accentColor: '#10b981', // Alpine Emerald
  bgMode: 'dark',
  buttonStyle: 'rounded',
  siteTitle: 'Aurora in Valtellina'
};

export function useCmsEditor() {
  const [blocks, setBlocks] = useState<CmsBlock[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_BLOCKS;
  });

  const [theme, setTheme] = useState<CmsThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) return JSON.parse(savedTheme);
      } catch {
        // ignore
      }
    }
    return DEFAULT_THEME;
  });

  const [activeLang, setActiveLang] = useState<Language>('it');
  const [simulatedGuestState, setSimulatedGuestState] = useState<'all' | VisibilityCondition>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBlockId, setActiveBlockId] = useState<string | null>('block-welcome');
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isPublishing, setIsPublishing] = useState(false);
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [publishFeedback, setPublishFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Sync with server on initial mount
  useEffect(() => {
    fetchCmsContentFromServer()
      .then((serverContent) => {
        if (serverContent && serverContent.it) {
          // If custom blocks are stored in siteSettings, restore them
          const remoteBlocks = serverContent.it.siteSettings?.blocks;
          if (Array.isArray(remoteBlocks) && remoteBlocks.length > 0) {
            setBlocks(remoteBlocks);
          }
        }
      })
      .catch((err) => console.warn('Non è stato possibile caricare i dati server:', err));

    fetchPropertyConfig()
      .then((propConfig) => {
        if (propConfig) {
          setBlocks((prev) => {
            return prev.map((b) => {
              if (b.type === 'wifi' && (propConfig.wifiSSID || propConfig.wifiPassword)) {
                return {
                  ...b,
                  data: {
                    ...b.data,
                    networkLabel: propConfig.wifiSSID || b.data.networkLabel,
                    passwordLabel: propConfig.wifiPassword || b.data.passwordLabel
                  }
                };
              }
              if (b.type === 'legal_bureaucracy' && (propConfig.cirCode || propConfig.cinCode)) {
                return {
                  ...b,
                  data: {
                    ...b.data,
                    cir: propConfig.cirCode || b.data.cir,
                    cin: propConfig.cinCode || b.data.cin
                  }
                };
              }
              if (b.type === 'breaker_thermostat' && (propConfig.breakerBoxInstructions || propConfig.climateInstructions)) {
                return {
                  ...b,
                  data: {
                    ...b.data,
                    breakerLocation: propConfig.breakerBoxInstructions || b.data.breakerLocation,
                    thermostatInstructions: propConfig.climateInstructions || b.data.thermostatInstructions
                  }
                };
              }
              return b;
            });
          });
        }
      })
      .catch((err) => console.warn('Non è stato possibile sincronizzare con PropertyConfig:', err));
  }, []);

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => a.order - b.order);
  }, [blocks]);

  // Filtered blocks based on search and category
  const filteredBlocks = useMemo(() => {
    return sortedBlocks.filter((block) => {
      if (selectedCategory !== 'all' && block.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = block.title.toLowerCase().includes(q) || (block.customTitle && block.customTitle.toLowerCase().includes(q));
        const matchesData = Object.values(block.data).some((val) => 
          typeof val === 'string' && val.toLowerCase().includes(q)
        );
        return matchesTitle || matchesData;
      }
      return true;
    });
  }, [sortedBlocks, selectedCategory, searchQuery]);

  // Helper to read field value in active language
  const getFieldValue = useCallback((block: CmsBlock, fieldKey: string) => {
    if (activeLang === 'it') {
      return block.data[fieldKey] !== undefined ? block.data[fieldKey] : '';
    }
    if (block.i18n?.[activeLang]?.[fieldKey] !== undefined) {
      return block.i18n[activeLang][fieldKey];
    }
    return block.data[fieldKey] !== undefined ? block.data[fieldKey] : '';
  }, [activeLang]);

  // Update a field value
  const updateField = useCallback((blockId: string, fieldKey: string, value: any) => {
    setBlocks((prev) => {
      return prev.map((b) => {
        if (b.id === blockId) {
          if (activeLang === 'it') {
            const currentI18n = { ...(b.i18n || {}) };
            currentI18n.it = { ...(currentI18n.it || {}), [fieldKey]: value };
            return {
              ...b,
              data: {
                ...b.data,
                [fieldKey]: value
              },
              i18n: currentI18n
            };
          } else {
            const currentI18n = { ...(b.i18n || {}) };
            currentI18n[activeLang] = { ...(currentI18n[activeLang] || {}), [fieldKey]: value };
            return {
              ...b,
              i18n: currentI18n
            };
          }
        }
        return b;
      });
    });
    setIsDirty(true);
  }, [activeLang]);

  // Translate a specific field using AI (Gemini)
  const translateFieldWithAi = useCallback(async (blockId: string, fieldKey: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return false;

    const sourceText = getFieldValue(block, fieldKey);
    if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim()) {
      setPublishFeedback({ 
        type: 'error', 
        message: 'Inserisci prima un testo nella casella da tradurre.' 
      });
      setTimeout(() => setPublishFeedback(null), 3000);
      return false;
    }

    setTranslatingField(`${blockId}-${fieldKey}`);
    setPublishFeedback({
      type: 'info',
      message: `✨ Traduzione IA in corso per "${fieldKey}"...`
    });

    try {
      const res = await fetch('/api/cms/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, sourceLang: activeLang })
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.translations) {
        throw new Error(data.error || 'Errore nella traduzione con Gemini');
      }

      const translations = data.translations; // { en: '...', de: '...', fr: '...', es: '...' }

      setBlocks((prev) => {
        return prev.map((b) => {
          if (b.id !== blockId) return b;
          const currentI18n = { ...(b.i18n || {}) };
          
          (['it', 'en', 'de', 'fr', 'es'] as const).forEach((langCode) => {
            if (langCode === activeLang) {
              currentI18n[langCode] = { ...(currentI18n[langCode] || {}), [fieldKey]: sourceText };
            } else if (translations[langCode]) {
              currentI18n[langCode] = { ...(currentI18n[langCode] || {}), [fieldKey]: translations[langCode] };
            }
          });

          return {
            ...b,
            data: activeLang === 'it' ? { ...b.data, [fieldKey]: sourceText } : b.data,
            i18n: currentI18n
          };
        });
      });

      setIsDirty(true);
      setPublishFeedback({
        type: 'success',
        message: `✨ Campo tradotto istantaneamente in EN, DE, FR, ES!`
      });
      setTimeout(() => setPublishFeedback(null), 4000);
      return true;
    } catch (err: any) {
      setPublishFeedback({
        type: 'error',
        message: `Errore durante la traduzione IA: ${err.message}`
      });
      setTimeout(() => setPublishFeedback(null), 4000);
      return false;
    } finally {
      setTranslatingField(null);
    }
  }, [blocks, activeLang, getFieldValue]);

  const updateTheme = useCallback((patch: Partial<CmsThemeSettings>) => {
    setTheme((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
    setIsDirty(true);
  }, []);

  const updateBlockRule = useCallback((blockId: string, rule: VisibilityCondition) => {
    setBlocks((prev) => {
      return prev.map((b) => (b.id === blockId ? { ...b, visibilityRule: rule } : b));
    });
    setIsDirty(true);
  }, []);

  const toggleBlockEnabled = useCallback((blockId: string) => {
    setBlocks((prev) => {
      return prev.map((b) => (b.id === blockId ? { ...b, enabled: !b.enabled } : b));
    });
    setIsDirty(true);
  }, []);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((b) => b.id === blockId);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === sorted.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = sorted[index];
      sorted[index] = sorted[targetIndex];
      sorted[targetIndex] = temp;

      return sorted.map((b, i) => ({ ...b, order: i }));
    });
    setIsDirty(true);
  }, []);

  const addBlockFromPreset = useCallback((preset: typeof CMS_BLOCK_PRESETS[0]) => {
    const newId = `block-${preset.type}-${Date.now()}`;
    const newBlock: CmsBlock = {
      id: newId,
      type: preset.type,
      title: preset.title,
      category: preset.category,
      enabled: true,
      order: blocks.length,
      visibilityRule: preset.defaultRule,
      data: { ...preset.defaultData },
      i18n: {}
    };

    setBlocks((prev) => [...prev, newBlock]);
    setActiveBlockId(newId);
    setIsDirty(true);
    setPublishFeedback({ type: 'success', message: `Blocco "${preset.title}" aggiunto con successo!` });
    setTimeout(() => setPublishFeedback(null), 3000);
  }, [blocks.length]);

  const removeBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
    setIsDirty(true);
  }, [activeBlockId]);

  const saveDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(blocks));
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
      setPublishFeedback({ type: 'success', message: 'Bozza salvata localmente nel browser.' });
      setTimeout(() => setPublishFeedback(null), 3000);
    }
  }, [blocks, theme]);

  // Full persistence to Supabase and Server (PropertyConfig + Multilingual CMS)
  const publishLive = useCallback(async () => {
    setIsPublishing(true);
    setPublishFeedback(null);
    try {
      const welcomeBlock = blocks.find((b) => b.type === 'welcome');
      const wifiBlock = blocks.find((b) => b.type === 'wifi');
      const legalBlock = blocks.find((b) => b.type === 'legal_bureaucracy');
      const breakerBlock = blocks.find((b) => b.type === 'breaker_thermostat');

      const fullCmsPayload: any = JSON.parse(JSON.stringify(BOOK_DATA));

      // Sync across all 5 languages
      const languages: Language[] = ['it', 'en', 'de', 'fr', 'es'];
      languages.forEach((lang) => {
        if (!fullCmsPayload[lang]) {
          fullCmsPayload[lang] = JSON.parse(JSON.stringify(BOOK_DATA[lang] || BOOK_DATA.it));
        }

        // Welcome block sync
        if (welcomeBlock) {
          const langData = lang === 'it' ? welcomeBlock.data : (welcomeBlock.i18n?.[lang] || welcomeBlock.data);
          fullCmsPayload[lang].welcome = {
            ...fullCmsPayload[lang].welcome,
            title: langData.title || fullCmsPayload[lang].welcome.title,
            greeting: langData.greeting || fullCmsPayload[lang].welcome.greeting,
            message: langData.message || fullCmsPayload[lang].welcome.message,
            viewTitle: langData.viewTitle || fullCmsPayload[lang].welcome.viewTitle,
            viewDesc: langData.viewDesc || fullCmsPayload[lang].welcome.viewDesc,
            livingTitle: langData.livingTitle || fullCmsPayload[lang].welcome.livingTitle,
            livingDesc: langData.livingDesc || fullCmsPayload[lang].welcome.livingDesc,
            bedroomTitle: langData.bedroomTitle || fullCmsPayload[lang].welcome.bedroomTitle,
            bedroomDesc: langData.bedroomDesc || fullCmsPayload[lang].welcome.bedroomDesc,
            kitchenTitle: langData.kitchenTitle || fullCmsPayload[lang].welcome.kitchenTitle,
            kitchenDesc: langData.kitchenDesc || fullCmsPayload[lang].welcome.kitchenDesc
          };
        }

        // Wifi block sync
        if (wifiBlock) {
          fullCmsPayload[lang].wifi = {
            ...fullCmsPayload[lang].wifi,
            networkLabel: wifiBlock.data.networkLabel || fullCmsPayload[lang].wifi.networkLabel,
            passwordLabel: wifiBlock.data.passwordLabel || fullCmsPayload[lang].wifi.passwordLabel,
            speedNotice: wifiBlock.data.speedNotice || fullCmsPayload[lang].wifi.speedNotice
          };
        }

        // Site settings & all blocks persistence
        fullCmsPayload[lang].siteSettings = {
          ...(fullCmsPayload[lang].siteSettings || {}),
          primaryColor: theme.primaryColor,
          accentColor: theme.accentColor,
          bgMode: theme.bgMode,
          buttonStyle: theme.buttonStyle,
          siteTitle: theme.siteTitle,
          blocks: blocks
        };
      });

      // 1. Atomically save CMS content
      const cmsRes = await saveCmsContent(fullCmsPayload);
      if (!cmsRes.success) {
        throw new Error(cmsRes.error || 'Errore durante il salvataggio CMS');
      }

      // 2. Atomically synchronize with PropertyConfig model
      const propUpdates: any = {};
      if (wifiBlock?.data?.networkLabel) propUpdates.wifiSSID = wifiBlock.data.networkLabel;
      if (wifiBlock?.data?.passwordLabel) propUpdates.wifiPassword = wifiBlock.data.passwordLabel;
      if (legalBlock?.data?.cir) propUpdates.cirCode = legalBlock.data.cir;
      if (legalBlock?.data?.cin) propUpdates.cinCode = legalBlock.data.cin;
      if (breakerBlock?.data?.breakerLocation) propUpdates.breakerBoxInstructions = breakerBlock.data.breakerLocation;
      if (breakerBlock?.data?.thermostatInstructions) propUpdates.climateInstructions = breakerBlock.data.thermostatInstructions;

      if (Object.keys(propUpdates).length > 0) {
        await savePropertyConfig(propUpdates).catch((err) => {
          console.warn('PropertyConfig partial sync error (non-fatal):', err);
        });
      }

      // 3. Update localStorage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(blocks));
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
      }

      setIsDirty(false);
      setPublishFeedback({ 
        type: 'success', 
        message: '🚀 Modifiche salvate e pubblicate live sulla PWA Ospite!' 
      });
      setTimeout(() => setPublishFeedback(null), 4500);
    } catch (err: any) {
      setPublishFeedback({ 
        type: 'error', 
        message: `Errore durante il salvataggio: ${err.message}` 
      });
    } finally {
      setIsPublishing(false);
    }
  }, [blocks, theme]);

  const revertChanges = useCallback(() => {
    if (confirm('Vuoi annullare le modifiche non pubblicate e ripristinare i dati originali di Casa Aurora?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setBlocks(INITIAL_BLOCKS);
      setTheme(DEFAULT_THEME);
      setIsDirty(false);
      setPublishFeedback({ type: 'success', message: 'Configurazione ripristinata ai valori di fabbrica.' });
      setTimeout(() => setPublishFeedback(null), 3000);
    }
  }, []);

  return {
    blocks: sortedBlocks,
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
  };
}
