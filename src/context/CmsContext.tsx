import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { 
  getActiveCmsContent, 
  fetchCmsContentFromServer, 
  subscribeToCms, 
  saveCmsContent, 
  saveCmsSection,
  resetCmsToDefault,
  CmsMediaMap,
  DEFAULT_MEDIA_MAP,
  getActiveCmsMedia,
  fetchCmsMediaFromServer,
  subscribeToMedia,
  uploadPhotoToServer,
  saveMediaUrlToServer,
  resetPhotoOnServer
} from '../services/cmsService';
import { BOOK_DATA } from '../data/multilingualBookData';

interface CmsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  cmsData: Record<Language, any>;
  media: CmsMediaMap;
  getPageData: (pageKey: string) => any;
  saveSection: (language: Language, section: string, data: any) => Promise<boolean>;
  saveAllData: (data: Record<Language, any>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  uploadPhoto: (photoKey: string, file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  saveMediaUrl: (photoKey: string, url: string) => Promise<{ success: boolean; error?: string }>;
  resetPhoto: (photoKey?: string) => Promise<boolean>;
  isLoading: boolean;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'aurora_selected_language';
const SUPPORTED_LANGUAGES: Language[] = ['it', 'en', 'de', 'fr', 'es'];

function detectSystemLanguage(): Language {
  if (typeof navigator === 'undefined') return 'it';
  const candidate = (navigator.language || navigator.languages?.[0] || 'it').slice(0, 2).toLowerCase() as Language;
  return SUPPORTED_LANGUAGES.includes(candidate) ? candidate : 'it';
}

export const CmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Determine initial language: URL query ?lang= -> localStorage -> navigator -> 'it'
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') as Language;
      if (urlLang && ['it', 'en', 'de', 'fr', 'es'].includes(urlLang)) {
        return urlLang;
      }
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved && ['it', 'en', 'de', 'fr', 'es'].includes(saved)) {
        return saved;
      }
    }
    return detectSystemLanguage();
  });

  const [cmsData, setCmsData] = useState<Record<Language, any>>(getActiveCmsContent);
  const [media, setMedia] = useState<CmsMediaMap>(getActiveCmsMedia);
  const [isLoading, setIsLoading] = useState(false);

  // Sync language with localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      } catch {
        // ignore
      }
    }
  };

  // Sync CMS content and Media on mount
  useEffect(() => {
    const unsubContent = subscribeToCms((updated) => {
      setCmsData({ ...updated });
    });

    const unsubMedia = subscribeToMedia((updatedMedia) => {
      setMedia({ ...updatedMedia });
    });

    setIsLoading(true);
    Promise.all([
      fetchCmsContentFromServer(),
      fetchCmsMediaFromServer()
    ]).finally(() => {
      setIsLoading(false);
    });

    return () => {
      unsubContent();
      unsubMedia();
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const settings = (cmsData[language]?.siteSettings || cmsData.it?.siteSettings || {}) as Record<string, any>;
    const root = document.documentElement;
    const cssVariables: Record<string, string> = {
      '--aurora-primary': settings.primaryColor,
      '--aurora-accent': settings.accentColor,
      '--aurora-background': settings.backgroundColor,
      '--aurora-text': settings.textColor
    };
    Object.entries(cssVariables).forEach(([name, value]) => {
      if (typeof value === 'string' && value.trim()) root.style.setProperty(name, value);
    });
    if (typeof settings.fontFamily === 'string' && settings.fontFamily.trim()) {
      root.style.setProperty('--aurora-font-family', settings.fontFamily);
      document.body.style.fontFamily = settings.fontFamily;
    }
    if (typeof settings.siteTitle === 'string' && settings.siteTitle.trim()) {
      document.title = settings.siteTitle;
    }
  }, [cmsData, language]);

  const getPageData = (pageKey: string) => {
    const langObj = cmsData[language] || cmsData.it || BOOK_DATA[language] || BOOK_DATA.it;
    if (!langObj) return {};
    return langObj[pageKey] || {};
  };

  const saveSection = async (lang: Language, section: string, data: any): Promise<boolean> => {
    const res = await saveCmsSection(lang, section, data);
    return Boolean(res.success);
  };

  const saveAllData = async (data: Record<Language, any>): Promise<boolean> => {
    const res = await saveCmsContent(data);
    return Boolean(res.success);
  };

  const resetToDefaults = async (): Promise<boolean> => {
    const res = await resetCmsToDefault();
    return Boolean(res.success);
  };

  const uploadPhoto = async (photoKey: string, file: File) => {
    const res = await uploadPhotoToServer(photoKey, file);
    if (res.media) {
      setMedia({ ...res.media });
    }
    return res;
  };

  const saveMediaUrl = async (photoKey: string, url: string) => {
    const res = await saveMediaUrlToServer(photoKey, url);
    if (res.media) {
      setMedia({ ...res.media });
    }
    return res;
  };

  const resetPhoto = async (photoKey?: string): Promise<boolean> => {
    const res = await resetPhotoOnServer(photoKey);
    if (res.media) {
      setMedia({ ...res.media });
    }
    return Boolean(res.success);
  };

  return (
    <CmsContext.Provider
      value={{
        language,
        setLanguage,
        cmsData,
        media,
        getPageData,
        saveSection,
        saveAllData,
        resetToDefaults,
        uploadPhoto,
        saveMediaUrl,
        resetPhoto,
        isLoading
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export function useCms(): CmsContextType {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    const fallbackLang: Language = 'it';
    return {
      language: fallbackLang,
      setLanguage: () => {},
      cmsData: BOOK_DATA,
      media: DEFAULT_MEDIA_MAP,
      getPageData: (pageKey: string) => (BOOK_DATA[fallbackLang] as any)[pageKey] || {},
      saveSection: async () => false,
      saveAllData: async () => false,
      resetToDefaults: async () => false,
      uploadPhoto: async () => ({ success: false }),
      saveMediaUrl: async () => ({ success: false }),
      resetPhoto: async () => false,
      isLoading: false
    };
  }
  return ctx;
}

