import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { TextStyle } from './CMSContext';

/**
 * Forma del documento persistito: stili, testi, immagini e orari
 * modificati dall'host nel Visual CMS Builder.
 */
export interface CMSEditsDocument {
  version: 1;
  styles: Record<string, TextStyle>;
  texts: Record<string, Record<string, string>>;
  images: Record<string, string>;
  times: Record<string, string>;
}

const EMPTY_DOC: CMSEditsDocument = { version: 1, styles: {}, texts: {}, images: {}, times: {} };

const STORAGE_KEY = 'aurora_visual_cms_edits_v1';

/**
 * Persistenza: Supabase se configurato, altrimenti localStorage.
 * La tabella è app_documents (key/value JSON), già usata dal backend.
 */
function createPersistence() {
  try {
    // Import statico: supabaseClient esporta `supabase: SupabaseClient | null`
    // ed è null quando le env VITE_SUPABASE_* non sono impostate.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { supabase } = require('../../services/supabaseClient') as typeof import('../../services/supabaseClient');
    if (supabase) {
      return {
        backend: 'supabase' as const,
        load: async (): Promise<CMSEditsDocument | null> => {
          const { data, error } = await supabase
            .from('app_documents')
            .select('value')
            .eq('key', STORAGE_KEY)
            .limit(1)
            .maybeSingle();
          if (error) return null;
          return (data?.value as CMSEditsDocument) ?? null;
        },
        save: async (doc: CMSEditsDocument): Promise<boolean> => {
          const { error } = await supabase
            .from('app_documents')
            .upsert({ key: STORAGE_KEY, value: doc, updated_at: new Date().toISOString() });
          return !error;
        },
      };
    }
  } catch {
    // fallback sotto
  }
  return {
    backend: 'local' as const,
    load: async (): Promise<CMSEditsDocument | null> => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as CMSEditsDocument) : null;
      } catch {
        return null;
      }
    },
    save: async (doc: CMSEditsDocument): Promise<boolean> => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
        return true;
      } catch {
        return false;
      }
    },
  };
}

/**
 * Context leggero di editing: la PWA reale lo consulta per sapere se è in
 * modalità editor (isEditMode), per la selezione e per gli override di
 * testi, stili, immagini e orari. Salva automaticamente al blur/debounce.
 */
interface EditModeContextValue {
  isEditMode: boolean;
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  styles: Record<string, TextStyle>;
  updateStyle: (id: string, patch: Partial<TextStyle>, options?: { immediate?: boolean }) => void;
  resetStyle: (id: string) => void;
  texts: Record<string, Record<string, string>>;
  updateText: (id: string, language: string, text: string, options?: { immediate?: boolean }) => void;
  images: Record<string, string>;
  updateImage: (id: string, url: string) => void;
  times: Record<string, string>;
  updateTime: (id: string, time: string) => void;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  saveStatus: 'saved' | 'saving' | 'error';
  saveNow: () => Promise<void>;
}

const EditModeContext = createContext<EditModeContextValue | undefined>(undefined);

export const useEditMode = (): EditModeContextValue => {
  const ctx = useContext(EditModeContext);
  // Fuori dal provider (PWA in produzione da sola) l'editing è semplicemente OFF.
  return (
    ctx ?? {
      isEditMode: false,
      selectedElementId: null,
      selectElement: () => {},
      styles: {},
      updateStyle: () => {},
      resetStyle: () => {},
      texts: {},
      updateText: () => {},
      images: {},
      updateImage: () => {},
      times: {},
      updateTime: () => {},
      currentLanguage: 'it',
      setLanguage: () => {},
      saveStatus: 'saved' as const,
      saveNow: async () => {},
    }
  );
};

export const EditModeProvider: React.FC<{
  children: ReactNode;
  isEditMode?: boolean;
  initialLanguage?: string;
  /** Quando true (modalità ospite) gli override vengono letti ma non modificabili. */
  applyEdits?: boolean;
}> = ({ children, isEditMode = true, initialLanguage = 'it', applyEdits = true }) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [styles, setStyles] = useState<Record<string, TextStyle>>({});
  const [texts, setTexts] = useState<Record<string, Record<string, string>>>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [times, setTimes] = useState<Record<string, string>>({});
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const persistenceRef = useRef<ReturnType<typeof createPersistence> | null>(null);
  if (!persistenceRef.current) persistenceRef.current = createPersistence();
  const docRef = useRef<CMSEditsDocument>(EMPTY_DOC);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Caricamento iniziale del documento salvato.
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
    });
    return () => {
      cancelled = true;
    };
  }, [applyEdits]);

  const persist = useCallback(
    (debounceMs = 0) => {
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
    },
    [],
  );

  const commit = useCallback(() => {
    docRef.current = {
      version: 1,
      styles,
      texts,
      images,
      times,
    };
  }, [styles, texts, images, times]);

  // Mantieni docRef aggiornato a ogni cambio degli override.
  useEffect(() => {
    commit();
  }, [commit]);

  const saveNow = useCallback(async () => {
    commit();
    await persist(0);
  }, [commit, persist]);

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const updateStyle = useCallback(
    (id: string, patch: Partial<TextStyle>, options?: { immediate?: boolean }) => {
      setStyles((prev) => {
        const next = {
          ...prev,
          [id]: {
            fontFamily: 'system-ui, sans-serif',
            fontSize: 14,
            bold: false,
            italic: false,
            underline: false,
            color: '',
            align: 'left',
            ...prev[id],
            ...patch,
          },
        };
        docRef.current = { ...docRef.current, styles: next };
        return next;
      });
      persist(options?.immediate ? 0 : 800);
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
      setTexts((prev) => {
        const next = { ...prev, [id]: { ...(prev[id] ?? {}), [language]: text } };
        docRef.current = { ...docRef.current, texts: next };
        return next;
      });
      persist(options?.immediate ? 0 : 800);
    },
    [persist],
  );

  const updateImage = useCallback(
    (id: string, url: string) => {
      setImages((prev) => {
        const next = { ...prev, [id]: url };
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

  const setLanguage = useCallback((lang: string) => {
    setCurrentLanguage(lang);
  }, []);

  const value = useMemo(
    () => ({
      isEditMode,
      selectedElementId,
      selectElement,
      styles,
      updateStyle,
      resetStyle,
      texts,
      updateText,
      images,
      updateImage,
      times,
      updateTime,
      currentLanguage,
      setLanguage,
      saveStatus,
      saveNow,
    }),
    [
      isEditMode,
      selectedElementId,
      selectElement,
      styles,
      updateStyle,
      resetStyle,
      texts,
      updateText,
      images,
      updateImage,
      times,
      updateTime,
      currentLanguage,
      setLanguage,
      saveStatus,
      saveNow,
    ],
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
};
