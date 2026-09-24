import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { TextStyle } from './CMSContext';
import { GuestPass } from '../../types';

/**
 * Mock pass NEUTRO per la modalità editor: nessun dato reale del cliente.
 * checkInConfirmed + documentsUploaded = true così la Tessera mostra anche
 * il tasto apriporta (vista completa "con pass").
 */
export const MOCK_EDITOR_PASS: GuestPass = {
  id: 'editor-mock-pass',
  guestName: 'MARIO',
  guestSurname: 'ROSSI',
  phone: '+39 333 000 0000',
  checkInDate: '2026-01-15',
  checkInTime: '14:00',
  checkOutDate: '2026-01-18',
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
            writeLocal(json.data as CMSEditsDocument); // cache locale
            return json.data as CMSEditsDocument;
          }
        }
      } catch {
        // server non raggiungibile: fallback alla cache locale
      }
      return readLocal();
    },
    save: async (doc: CMSEditsDocument): Promise<boolean> => {
      // Scrivi sempre la cache locale (PWA ospite la usa come fallback offline).
      writeLocal(doc);
      try {
        const res = await fetch('/api/cms/edits', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // cookie di sessione host
          body: JSON.stringify({ data: doc }),
        });
        return res.ok;
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
  /** Anteprima nel builder: 'pass' = ospite con pass attivo, 'no-pass' = visitatore. */
  previewVariant: 'pass' | 'no-pass';
  setPreviewVariant: (variant: 'pass' | 'no-pass') => void;
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
      previewVariant: 'pass' as const,
      setPreviewVariant: () => {},
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
  const [previewVariant, setPreviewVariant] = useState<'pass' | 'no-pass'>('pass');

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
      previewVariant,
      setPreviewVariant,
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
      previewVariant,
      setPreviewVariant,
    ],
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
};
