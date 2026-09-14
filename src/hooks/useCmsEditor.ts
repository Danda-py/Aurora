import { useState, useEffect, useCallback, useMemo } from 'react';
import { CmsBlock, CmsBlockType, CmsThemeSettings, VisibilityCondition } from '../types/cmsBuilder';
import { BOOK_DATA } from '../data/multilingualBookData';
import { saveCmsContent, fetchCmsContentFromServer } from '../services/cmsService';

const DRAFT_STORAGE_KEY = 'aurora_cms_builder_draft_v2';

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
    category: 'network',
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
        const savedTheme = localStorage.getItem('aurora_cms_theme_v2');
        if (savedTheme) return JSON.parse(savedTheme);
      } catch {
        // ignore
      }
    }
    return DEFAULT_THEME;
  });

  const [activeBlockId, setActiveBlockId] = useState<string | null>('block-welcome');
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync with server on initial mount
  useEffect(() => {
    fetchCmsContentFromServer()
      .then((serverContent) => {
        if (serverContent && serverContent.it && serverContent.it.welcome) {
          setBlocks((prev) => {
            return prev.map((b) => {
              if (b.id === 'block-welcome') {
                return {
                  ...b,
                  data: {
                    ...b.data,
                    title: serverContent.it.welcome.title || b.data.title,
                    greeting: serverContent.it.welcome.greeting || b.data.greeting,
                    message: serverContent.it.welcome.message || b.data.message,
                    viewTitle: serverContent.it.welcome.viewTitle || b.data.viewTitle,
                    viewDesc: serverContent.it.welcome.viewDesc || b.data.viewDesc
                  }
                };
              }
              if (b.id === 'block-wifi' && serverContent.it.wifi) {
                return {
                  ...b,
                  data: {
                    ...b.data,
                    networkLabel: serverContent.it.wifi.networkLabel || b.data.networkLabel,
                    passwordLabel: serverContent.it.wifi.passwordLabel || b.data.passwordLabel,
                    speedNotice: serverContent.it.wifi.speedNotice || b.data.speedNotice
                  }
                };
              }
              return b;
            });
          });
        }
      })
      .catch((err) => console.warn('Non è stato possibile caricare i dati server:', err));
  }, []);

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => a.order - b.order);
  }, [blocks]);

  const updateField = useCallback((blockId: string, fieldKey: string, value: any) => {
    setBlocks((prev) => {
      return prev.map((b) => {
        if (b.id === blockId) {
          return {
            ...b,
            data: {
              ...b.data,
              [fieldKey]: value
            }
          };
        }
        return b;
      });
    });
    setIsDirty(true);
  }, []);

  const updateTheme = useCallback((patch: Partial<CmsThemeSettings>) => {
    setTheme((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== 'undefined') {
        localStorage.setItem('aurora_cms_theme_v2', JSON.stringify(next));
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

  const addBlock = useCallback((type: CmsBlockType) => {
    const newId = `block-${type}-${Date.now()}`;
    let newBlock: CmsBlock;

    switch (type) {
      case 'video_tutorial':
        newBlock = {
          id: newId,
          type: 'video_tutorial',
          title: 'Nuovo Video Tutorial YouTube',
          category: 'media',
          enabled: true,
          order: blocks.length,
          visibilityRule: 'always',
          data: {
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            videoTitle: 'Video Guida per gli Ospiti',
            videoDescription: 'Istruzioni video dettagliate per il vostro soggiorno.'
          }
        };
        break;
      case 'wifi':
        newBlock = {
          id: newId,
          type: 'wifi',
          title: 'Rete Wi-Fi Aggiuntiva',
          category: 'network',
          enabled: true,
          order: blocks.length,
          visibilityRule: 'pass_active',
          data: {
            networkLabel: 'Aurora_Guest_Fast',
            passwordLabel: 'Valtellina2025!',
            speedNotice: 'Connessione ad alta velocità.'
          }
        };
        break;
      case 'house_rules':
        newBlock = {
          id: newId,
          type: 'house_rules',
          title: 'Regole della Casa Personalizzate',
          category: 'network',
          enabled: true,
          order: blocks.length,
          visibilityRule: 'always',
          data: {
            quietHours: '23:00 - 08:00',
            wasteInfo: 'Disporre i rifiuti differenziati negli appositi contenitori.',
            noSmoking: true,
            noParties: true
          }
        };
        break;
      case 'local_guide':
        newBlock = {
          id: newId,
          type: 'local_guide',
          title: 'Punti di Interesse & Consigli Host',
          category: 'guide',
          enabled: true,
          order: blocks.length,
          visibilityRule: 'always',
          data: {
            recommendedRestaurants: 'Crotti tipici, ristoranti e botteghe storiche.',
            highlights: 'I migliori scorci di Morbegno e sentieri valtellinesi.'
          }
        };
        break;
      case 'breaker_thermostat':
        newBlock = {
          id: newId,
          type: 'breaker_thermostat',
          title: 'Quadro Elettrico & Climatizzazione',
          category: 'identity',
          enabled: true,
          order: blocks.length,
          visibilityRule: 'always',
          data: {
            breakerLocation: 'Quadro elettrico salvavita nell\'ingresso.',
            thermostatInstructions: 'Istruzioni per riscaldamento autonomo e condizionatore.'
          }
        };
        break;
      default:
        newBlock = {
          id: newId,
          type: 'welcome',
          title: 'Nuova Sezione Informativa',
          category: 'identity',
          enabled: true,
          order: blocks.length,
          visibilityRule: 'always',
          data: {
            title: 'Titolo Sezione',
            message: 'Inserisci qui la descrizione per gli ospiti.'
          }
        };
        break;
    }

    setBlocks((prev) => [...prev, newBlock]);
    setActiveBlockId(newId);
    setIsDirty(true);
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
      localStorage.setItem('aurora_cms_theme_v2', JSON.stringify(theme));
      setPublishFeedback({ type: 'success', message: 'Bozza salvata localmente nel browser!' });
      setTimeout(() => setPublishFeedback(null), 3000);
    }
  }, [blocks, theme]);

  const publishLive = useCallback(async () => {
    setIsPublishing(true);
    setPublishFeedback(null);
    try {
      // Find welcome and wifi block to sync with multilingualBookData structures
      const welcomeBlock = blocks.find((b) => b.type === 'welcome');
      const wifiBlock = blocks.find((b) => b.type === 'wifi');

      const fullCmsPayload: any = JSON.parse(JSON.stringify(BOOK_DATA));

      if (welcomeBlock) {
        fullCmsPayload.it.welcome = {
          ...fullCmsPayload.it.welcome,
          title: welcomeBlock.data.title || fullCmsPayload.it.welcome.title,
          greeting: welcomeBlock.data.greeting || fullCmsPayload.it.welcome.greeting,
          message: welcomeBlock.data.message || fullCmsPayload.it.welcome.message,
          viewTitle: welcomeBlock.data.viewTitle || fullCmsPayload.it.welcome.viewTitle,
          viewDesc: welcomeBlock.data.viewDesc || fullCmsPayload.it.welcome.viewDesc,
          livingTitle: welcomeBlock.data.livingTitle || fullCmsPayload.it.welcome.livingTitle,
          livingDesc: welcomeBlock.data.livingDesc || fullCmsPayload.it.welcome.livingDesc,
          bedroomTitle: welcomeBlock.data.bedroomTitle || fullCmsPayload.it.welcome.bedroomTitle,
          bedroomDesc: welcomeBlock.data.bedroomDesc || fullCmsPayload.it.welcome.bedroomDesc,
          kitchenTitle: welcomeBlock.data.kitchenTitle || fullCmsPayload.it.welcome.kitchenTitle,
          kitchenDesc: welcomeBlock.data.kitchenDesc || fullCmsPayload.it.welcome.kitchenDesc
        };
      }

      if (wifiBlock) {
        fullCmsPayload.it.wifi = {
          ...fullCmsPayload.it.wifi,
          networkLabel: wifiBlock.data.networkLabel || fullCmsPayload.it.wifi.networkLabel,
          passwordLabel: wifiBlock.data.passwordLabel || fullCmsPayload.it.wifi.passwordLabel,
          speedNotice: wifiBlock.data.speedNotice || fullCmsPayload.it.wifi.speedNotice
        };
      }

      // Save custom blocks and siteSettings to theme
      Object.keys(fullCmsPayload).forEach((lang) => {
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

      const res = await saveCmsContent(fullCmsPayload);
      if (!res.success) {
        throw new Error(res.error || 'Errore salvataggio sul server');
      }

      // Save to localStorage as synced
      if (typeof window !== 'undefined') {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(blocks));
        localStorage.setItem('aurora_cms_theme_v2', JSON.stringify(theme));
      }

      setIsDirty(false);
      setPublishFeedback({ 
        type: 'success', 
        message: '🚀 Modifiche pubblicate Live con successo sulla PWA Ospite!' 
      });
      setTimeout(() => setPublishFeedback(null), 4500);
    } catch (err: any) {
      setPublishFeedback({ 
        type: 'error', 
        message: `Errore durante la pubblicazione: ${err.message}` 
      });
    } finally {
      setIsPublishing(false);
    }
  }, [blocks, theme]);

  const revertChanges = useCallback(() => {
    if (confirm('Vuoi annullare tutte le modifiche non pubblicate e ripristinare i dati originali?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      setBlocks(INITIAL_BLOCKS);
      setTheme(DEFAULT_THEME);
      setIsDirty(false);
      setPublishFeedback({ type: 'success', message: 'Modifiche ripristinate allo stato iniziale.' });
      setTimeout(() => setPublishFeedback(null), 3000);
    }
  }, []);

  return {
    blocks: sortedBlocks,
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
  };
}
