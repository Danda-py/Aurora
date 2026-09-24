import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { Language } from '../../types';

// ============================================================
// Tipi
// ============================================================

/** Tipi di blocco testuale supportati dal builder. */
export type TextRole = 'title' | 'heading' | 'subtitle' | 'body';

export type TextAlign = 'left' | 'center' | 'right';

export interface TextStyle {
  role: TextRole;
  fontFamily: string;
  fontSize: number; // px
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  align: TextAlign;
}

export interface BlockStyle {
  /** Immagine di sfondo della card/sezione (URL o dataURL dopo upload). */
  backgroundImage?: string;
  /** Overlay scuro sull'immagine di sfondo per leggibilità (0-1). */
  backgroundOverlay?: number;
  /** Layout interno del blocco. */
  layout: 'stacked' | 'row' | 'row-reverse';
  /** Colore di sfondo (usato se non c'è immagine). */
  backgroundColor?: string;
  /** Colore di accento (pill, icone, bordi). */
  accentColor?: string;
  /** Effetto vetro: opacità dello strato glass. */
  glassOpacity?: number;
  /** Raggio degli angoli in px. */
  borderRadius?: number;
}

export interface BlockContent {
  /** Contenuto testuale per lingua. */
  text?: Record<Language, string>;
  /** Orario collegato (es. check-in "13:00"). */
  time?: string;
  /** URL immagine caricata per la card. */
  image?: string;
}

export interface Block {
  id: string;
  /** Chiave semantica, es. "checkin.time", "rules.title" */
  key: string;
  style: TextStyle;
  container: BlockStyle;
  content: BlockContent;
}

export interface CMSState {
  blocks: Record<string, Block>; // chiave = block.key
  selectedId: string | null;
  language: Language;
  isEditMode: boolean;
  /** Anteprima Guest Mode: nasconde ogni controllo di editing. */
  previewMode: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
}

export type CMSAction =
  | { type: 'SELECT_BLOCK'; payload: string | null }
  | { type: 'UPDATE_TEXT'; payload: { key: string; language: Language; text: string } }
  | { type: 'UPDATE_TEXT_STYLE'; payload: { key: string; style: Partial<TextStyle> } }
  | { type: 'UPDATE_CONTAINER'; payload: { key: string; container: Partial<BlockStyle> } }
  | { type: 'UPDATE_TIME'; payload: { key: string; time: string } }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: CMSState['saveStatus'] }
  | { type: 'HYDRATE'; payload: { blocks: Record<string, Block> } };

// ============================================================
// Valori predefiniti
// ============================================================

export const DEFAULT_TEXT_STYLE: Record<TextRole, TextStyle> = {
  title: {
    role: 'title',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 22,
    bold: true,
    italic: false,
    underline: false,
    color: '#ffffff',
    align: 'left',
  },
  heading: {
    role: 'heading',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 17,
    bold: true,
    italic: false,
    underline: false,
    color: '#ffffff',
    align: 'left',
  },
  subtitle: {
    role: 'subtitle',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 13,
    bold: false,
    italic: true,
    underline: false,
    color: '#62e6bd',
    align: 'left',
  },
  body: {
    role: 'body',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 12,
    bold: false,
    italic: false,
    underline: false,
    color: '#cbd5e1',
    align: 'left',
  },
};

export const DEFAULT_CONTAINER_STYLE: BlockStyle = {
  layout: 'stacked',
  glassOpacity: 0.6,
  borderRadius: 20,
};

const STORAGE_KEY = 'aurora_visual_cms_v1';

// ============================================================
// Reducer
// ============================================================

function cmsReducer(state: CMSState, action: CMSAction): CMSState {
  switch (action.type) {
    case 'SELECT_BLOCK':
      return { ...state, selectedId: action.payload };

    case 'UPDATE_TEXT': {
      const block = state.blocks[action.payload.key];
      if (!block) return state;
      const text = {
        ...(block.content.text ?? ({} as Record<Language, string>)),
        [action.payload.language]: action.payload.text,
      } as Record<Language, string>;
      return {
        ...state,
        blocks: {
          ...state.blocks,
          [action.payload.key]: { ...block, content: { ...block.content, text } },
        },
      };
    }

    case 'UPDATE_TEXT_STYLE': {
      const block = state.blocks[action.payload.key];
      if (!block) return state;
      return {
        ...state,
        blocks: {
          ...state.blocks,
          [action.payload.key]: {
            ...block,
            style: { ...block.style, ...action.payload.style },
          },
        },
      };
    }

    case 'UPDATE_CONTAINER': {
      const block = state.blocks[action.payload.key];
      if (!block) return state;
      return {
        ...state,
        blocks: {
          ...state.blocks,
          [action.payload.key]: {
            ...block,
            container: { ...block.container, ...action.payload.container },
          },
        },
      };
    }

    case 'UPDATE_TIME': {
      const block = state.blocks[action.payload.key];
      if (!block) return state;
      return {
        ...state,
        blocks: {
          ...state.blocks,
          [action.payload.key]: {
            ...block,
            content: { ...block.content, time: action.payload.time },
          },
        },
      };
    }

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'SET_EDIT_MODE':
      return { ...state, isEditMode: action.payload };

    case 'SET_PREVIEW_MODE':
      return {
        ...state,
        previewMode: action.payload,
        isEditMode: !action.payload,
        selectedId: null,
      };

    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };

    case 'HYDRATE':
      return {
        ...state,
        blocks: { ...state.blocks, ...(action.payload.blocks as Record<string, Block>) },
      };

    default:
      return state;
  }
}

// ============================================================
// Persistenza (Supabase se configurato, altrimenti localStorage)
// ============================================================

export interface CMSPersistence {
  /** Carica i blocchi salvati; null se non configurato o assenti. */
  load: () => Promise<Record<string, Block> | null>;
  /** Salva l'intero layout; ritorna true in caso di successo. */
  save: (blocks: Record<string, Block>) => Promise<boolean>;
}

function localStoragePersistence(): CMSPersistence {
  return {
    load: async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Record<string, Block>) : null;
      } catch {
        return null;
      }
    },
    save: async (blocks) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
        return true;
      } catch {
        return false;
      }
    },
  };
}

function supabasePersistence(): CMSPersistence | null {
  // Import dinamico: il client Supabase è null se non configurato.
  // Manteniamo il builder utilizzabile anche senza Supabase.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../../services/supabaseClient') as typeof import('../../services/supabaseClient');
    if (!mod.supabase) return null;
    return {
      load: async () => {
        const { data, error } = await mod.supabase!
          .from('app_documents')
          .select('value')
          .eq('key', STORAGE_KEY)
          .limit(1)
          .maybeSingle();
        if (error) return null;
        return (data?.value as Record<string, Block>) ?? null;
      },
      save: async (blocks) => {
        const { error } = await mod.supabase!
          .from('app_documents')
          .upsert({ key: STORAGE_KEY, value: blocks, updated_at: new Date().toISOString() });
        return !error;
      },
    };
  } catch {
    return null;
  }
}

// ============================================================
// Context
// ============================================================

interface CMSContextValue {
  state: CMSState;
  selectBlock: (key: string | null) => void;
  updateText: (key: string, language: Language, text: string) => void;
  updateTextStyle: (key: string, style: Partial<TextStyle>) => void;
  updateContainer: (key: string, container: Partial<BlockStyle>) => void;
  updateTime: (key: string, time: string) => void;
  setLanguage: (language: Language) => void;
  setPreviewMode: (preview: boolean) => void;
  /** Registra (o aggiorna) un blocco della pagina. Chiamato dai blocchi stessi. */
  registerBlock: (key: string, defaults: { style?: Partial<TextStyle>; container?: Partial<BlockStyle> }) => void;
  /** Trigger manuale del salvataggio (debounced internamente). */
  saveNow: () => void;
}

const CMSContext = createContext<CMSContextValue | undefined>(undefined);

export const useCMS = (): CMSContextValue => {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error('useCMS deve essere usato dentro <CMSProvider>');
  return ctx;
};

export const CMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cmsReducer, {
    blocks: {},
    selectedId: null,
    language: 'it',
    isEditMode: true,
    previewMode: false,
    saveStatus: 'saved',
  });

  const [persistence] = useState<CMSPersistence>(() => supabasePersistence() ?? localStoragePersistence());
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blocksRef = useRef(state.blocks);
  blocksRef.current = state.blocks;

  // Caricamento iniziale
  useEffect(() => {
    let cancelled = false;
    persistence.load().then((saved) => {
      if (!cancelled && saved) {
        dispatch({ type: 'HYDRATE', payload: { blocks: saved } });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [persistence]);

  const saveNow = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });
      const ok = await persistence.save(blocksRef.current);
      dispatch({ type: 'SET_SAVE_STATUS', payload: ok ? 'saved' : 'error' });
    }, 600);
  }, [persistence]);

  // Salvataggio automatico a ogni modifica dei blocchi
  useEffect(() => {
    if (Object.keys(state.blocks).length > 0) {
      saveNow();
    }
  }, [state.blocks, saveNow]);

  const registerBlock = useCallback(
    (key: string, defaults: { style?: Partial<TextStyle>; container?: Partial<BlockStyle> }) => {
      // Registrazione idempotente: i default vengono scritti solo se il
      // blocco non esiste ancora. Evita loop infiniti di dispatch.
      if (state.blocks[key]) return;
      const role = (defaults.style?.role ?? 'body') as TextRole;
      dispatch({
        type: 'HYDRATE',
        payload: {
          blocks: {
            [key]: {
              id: key,
              key,
              style: { ...DEFAULT_TEXT_STYLE[role], ...defaults.style },
              container: { ...DEFAULT_CONTAINER_STYLE, ...defaults.container },
              content: {},
            },
          },
        },
      });
    },
    [state.blocks],
  );

  const value = useMemo<CMSContextValue>(
    () => ({
      state,
      selectBlock: (key) => dispatch({ type: 'SELECT_BLOCK', payload: key }),
      updateText: (key, language, text) => {
        dispatch({ type: 'UPDATE_TEXT', payload: { key, language, text } });
        saveNow();
      },
      updateTextStyle: (key, style) => {
        dispatch({ type: 'UPDATE_TEXT_STYLE', payload: { key, style } });
        saveNow();
      },
      updateContainer: (key, container) => {
        dispatch({ type: 'UPDATE_CONTAINER', payload: { key, container } });
        saveNow();
      },
      updateTime: (key, time) => {
        dispatch({ type: 'UPDATE_TIME', payload: { key, time } });
        saveNow();
      },
      setLanguage: (language) => dispatch({ type: 'SET_LANGUAGE', payload: language }),
      setPreviewMode: (preview) => dispatch({ type: 'SET_PREVIEW_MODE', payload: preview }),
      registerBlock,
      saveNow,
    }),
    [state, registerBlock, saveNow],
  );

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
};
