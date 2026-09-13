import { BOOK_DATA } from '../data/multilingualBookData';
import { Language } from '../types';

const CMS_STORAGE_KEY = 'aurora_cms_content_cache';
const CMS_MEDIA_STORAGE_KEY = 'aurora_cms_media_cache';

export interface CmsContentState {
  data: Record<Language, any>;
  loaded: boolean;
  lastUpdated: string | null;
}

export interface CmsMediaMap {
  hostAvatar: string;
  heroLiving: string;
  bedroom: string;
  kitchen: string;
  bathroom: string;
  balcony: string;
  view: string;
  restaurantsCover: string;
  barsCover: string;
  activitiesCover: string;
  wifiQr: string;
  [key: string]: string;
}

export const DEFAULT_MEDIA_MAP: CmsMediaMap = {
  hostAvatar: '/uploads/host.jpg',
  heroLiving: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
  bedroom: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
  bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
  balcony: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
  view: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  restaurantsCover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  barsCover: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
  activitiesCover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  wifiQr: ''
};

// In-memory cache starting with BOOK_DATA defaults
let memoryCms: Record<Language, any> = (() => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CMS_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
  }
  const defaults = JSON.parse(JSON.stringify(BOOK_DATA));
  Object.values(defaults).forEach((languageData: any) => {
    languageData.siteSettings = {
      siteTitle: 'Aurora in Valtellina',
      primaryColor: '#10b981',
      accentColor: '#f59e0b',
      backgroundColor: '#070a0e',
      textColor: '#f8fafc',
      fontFamily: 'system-ui',
      redirects: {
        whatsapp: 'https://wa.me/393917784042',
        maps: 'https://maps.google.com/?q=Morbegno',
        email: ''
      }
    };
  });
  return defaults;
})();

let memoryMedia: CmsMediaMap = (() => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CMS_MEDIA_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!parsed.hostAvatar || parsed.hostAvatar.includes('/assets/images/')) {
          parsed.hostAvatar = '/uploads/host.jpg';
        }
        return { ...DEFAULT_MEDIA_MAP, ...parsed };
      }
    } catch {
      // ignore
    }
  }
  return { ...DEFAULT_MEDIA_MAP };
})();

// Listeners for live updates
type Listener = (content: Record<Language, any>) => void;
const listeners: Set<Listener> = new Set();

type MediaListener = (media: CmsMediaMap) => void;
const mediaListeners: Set<MediaListener> = new Set();

function guestAccessHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = new URLSearchParams(window.location.search).get('pass');
  return token ? { 'X-Guest-Token': token } : {};
}

export function subscribeToCms(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function subscribeToMedia(listener: MediaListener): () => void {
  mediaListeners.add(listener);
  return () => {
    mediaListeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn(memoryCms));
}

function notifyMediaListeners() {
  mediaListeners.forEach((fn) => fn(memoryMedia));
}

/**
 * Fetch latest CMS content from server and sync cache
 */
export async function fetchCmsContentFromServer(): Promise<Record<Language, any>> {
  try {
    const res = await fetch('/api/cms/content', { headers: guestAccessHeaders() });
    if (res.ok) {
      const json = await res.json();
      if (json.success && (json.data || json.content)) {
        memoryCms = json.data || json.content;
        if (typeof window !== 'undefined') {
          localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(memoryCms));
        }
        notifyListeners();
        return memoryCms;
      }
    }
  } catch (err) {
    console.warn('Could not fetch CMS content from server, using local cache:', err);
  }
  return memoryCms;
}

/**
 * Fetch latest CMS media from server and sync cache
 */
export async function fetchCmsMediaFromServer(): Promise<CmsMediaMap> {
  try {
    const res = await fetch('/api/cms/media', { headers: guestAccessHeaders() });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.media) {
        memoryMedia = { ...DEFAULT_MEDIA_MAP, ...json.media };
        if (typeof window !== 'undefined') {
          localStorage.setItem(CMS_MEDIA_STORAGE_KEY, JSON.stringify(memoryMedia));
        }
        notifyMediaListeners();
        return memoryMedia;
      }
    }
  } catch (err) {
    console.warn('Could not fetch CMS media from server, using local cache:', err);
  }
  return memoryMedia;
}

/**
 * Get current CMS media synchronously
 */
export function getActiveCmsMedia(): CmsMediaMap {
  return memoryMedia;
}

/**
 * Upload an image file permanently to the server
 */
export async function uploadPhotoToServer(
  photoKey: string,
  file: File
): Promise<{ success: boolean; url?: string; media?: CmsMediaMap; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await fetch('/api/cms/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoKey,
            filename: file.name,
            dataUrl
          })
        });

        const json = await res.json();
        if (json.success && json.media) {
          memoryMedia = { ...DEFAULT_MEDIA_MAP, ...json.media };
          if (typeof window !== 'undefined') {
            localStorage.setItem(CMS_MEDIA_STORAGE_KEY, JSON.stringify(memoryMedia));
          }
          notifyMediaListeners();
          resolve(json);
        } else {
          resolve({ success: false, error: json.error || 'Errore caricamento file' });
        }
      } catch (err: any) {
        resolve({ success: false, error: err.message || 'Errore di connessione' });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Errore lettura file locale' });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Save image URL manually
 */
export async function saveMediaUrlToServer(
  photoKey: string,
  url: string
): Promise<{ success: boolean; media?: CmsMediaMap; error?: string }> {
  try {
    const res = await fetch('/api/cms/save-media-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoKey, url })
    });
    const json = await res.json();
    if (json.success && json.media) {
      memoryMedia = { ...DEFAULT_MEDIA_MAP, ...json.media };
      if (typeof window !== 'undefined') {
        localStorage.setItem(CMS_MEDIA_STORAGE_KEY, JSON.stringify(memoryMedia));
      }
      notifyMediaListeners();
      return json;
    }
    return { success: false, error: json.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Reset a photo to default
 */
export async function resetPhotoOnServer(photoKey?: string): Promise<{ success: boolean; media?: CmsMediaMap }> {
  try {
    const res = await fetch('/api/cms/reset-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoKey })
    });
    const json = await res.json();
    if (json.success && json.media) {
      memoryMedia = { ...DEFAULT_MEDIA_MAP, ...json.media };
      if (typeof window !== 'undefined') {
        localStorage.setItem(CMS_MEDIA_STORAGE_KEY, JSON.stringify(memoryMedia));
      }
      notifyMediaListeners();
      return json;
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

/**
 * Get current CMS data synchronously (immediate, non-blocking)
 */
export function getActiveCmsContent(): Record<Language, any> {
  return memoryCms;
}

/**
 * Get content for a specific language and page
 */
export function getPageCms(language: Language, pageKey: string, fallback: any = {}): any {
  const langData = memoryCms[language] || memoryCms.it || BOOK_DATA[language] || BOOK_DATA.it;
  if (!langData) return fallback;
  return langData[pageKey] || fallback;
}

/**
 * Save complete CMS content to server and local storage
 */
export async function saveCmsContent(content: Record<Language, any>): Promise<{ success: boolean; message?: string; error?: string }> {
  memoryCms = content;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(content));
  }
  notifyListeners();

  try {
    const res = await fetch('/api/cms/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { success: false, error: data.error || `HTTP ${res.status}` };
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore salvataggio server' };
  }
}

/**
 * Save a single page section for a specific language
 */
export async function saveCmsSection(language: Language, section: string, content: any): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!memoryCms[language]) {
    memoryCms[language] = JSON.parse(JSON.stringify(BOOK_DATA[language] || BOOK_DATA.it));
  }
  memoryCms[language][section] = {
    ...(memoryCms[language][section] || {}),
    ...content
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(memoryCms));
  }
  notifyListeners();

  try {
    const res = await fetch('/api/cms/section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, section, content })
    });
    const data = await res.json();
    if (!res.ok || !data.success) return { success: false, error: data.error || `HTTP ${res.status}` };
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Reset CMS to default BOOK_DATA
 */
export async function resetCmsToDefault(): Promise<{ success: boolean; message?: string }> {
  memoryCms = JSON.parse(JSON.stringify(BOOK_DATA));
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CMS_STORAGE_KEY);
  }
  notifyListeners();

  try {
    const res = await fetch('/api/cms/reset', { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
