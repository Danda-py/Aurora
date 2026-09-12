import fs from 'fs';
import path from 'path';
import { BOOK_DATA } from '../src/data/multilingualBookData.js';
import { Language } from '../src/types.js';
import { safeReadJsonSync, safeWriteFileSync, getReadFilePath } from './storageUtils.js';
import { loadDocument, saveDocument } from './supabaseStorage.js';

const CMS_REL_PATH = path.join('data', 'cms_content.json');
const CMS_MEDIA_REL_PATH = path.join('data', 'cms_media.json');

export interface CmsMediaMap {
  hostAvatar: string;
  heroLiving: string;
  locationCover: string;
  checkInCover: string;
  servicesCover: string;
  rulesCover: string;
  restaurantsCover: string;
  barsCover: string;
  shoppingCover: string;
  activitiesCover: string;
  transportCover: string;
  infoCover: string;
  emergencyCover: string;
  checkOutCover: string;
  bedroom: string;
  kitchen: string;
  bathroom: string;
  balcony: string;
  view: string;
  wifiQr: string;
  [key: string]: string;
}

export const DEFAULT_MEDIA_MAP: CmsMediaMap = {
  hostAvatar: '/uploads/host.jpg',
  heroLiving: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
  locationCover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  checkInCover: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
  servicesCover: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  rulesCover: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  restaurantsCover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  barsCover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  shoppingCover: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1200&q=80',
  activitiesCover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  transportCover: 'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=1200&q=80',
  infoCover: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80',
  emergencyCover: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
  checkOutCover: 'https://images.unsplash.com/photo-1507525428033-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  bedroom: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
  bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
  balcony: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
  view: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  wifiQr: ''
};

// In-memory caches
let cachedCmsData: Record<Language, any> | null = null;
let cachedMediaData: CmsMediaMap | null = null;

/**
 * Initialize CMS data from disk or fallback to BOOK_DATA defaults
 */
export function getCmsData(): Record<Language, any> {
  if (cachedCmsData) {
    return cachedCmsData;
  }

  const defaultData = JSON.parse(JSON.stringify(BOOK_DATA));
  Object.values(defaultData).forEach((languageData: any) => {
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
  cachedCmsData = safeReadJsonSync<Record<Language, any>>(CMS_REL_PATH, defaultData);
  return cachedCmsData;
}

/**
 * Saves complete or partial CMS data permanently to disk
 */
export function saveCmsData(newData: Record<Language, any>): boolean {
  cachedCmsData = newData;
  return safeWriteFileSync(CMS_REL_PATH, JSON.stringify(newData, null, 2));
}

export async function getCmsDataAsync(): Promise<Record<Language, any>> {
  const remote = await loadDocument<Record<Language, any>>('cms_content');
  return remote || getCmsData();
}

export async function saveCmsDataAsync(newData: Record<Language, any>): Promise<boolean> {
  const saved = saveCmsData(newData);
  await saveDocument('cms_content', newData);
  return saved;
}

/**
 * Updates a specific section or card for a specific language
 */
export function updateCmsSection(language: Language, section: string, content: any): Record<Language, any> {
  const current = getCmsData();
  if (!current[language]) {
    current[language] = JSON.parse(JSON.stringify(BOOK_DATA[language] || BOOK_DATA.it));
  }

  current[language][section] = {
    ...(current[language][section] || {}),
    ...content
  };

  saveCmsData(current);
  return current;
}

/**
 * Resets CMS to original defaults
 */
export function resetCmsData(): Record<Language, any> {
  const defaults = JSON.parse(JSON.stringify(BOOK_DATA));
  saveCmsData(defaults);
  return defaults;
}

/**
 * Get permanent CMS media map (all photos and uploaded images)
 */
export function getCmsMedia(): CmsMediaMap {
  if (cachedMediaData) {
    return cachedMediaData;
  }

  const defaultMedia = { ...DEFAULT_MEDIA_MAP };
  const loaded = safeReadJsonSync<Partial<CmsMediaMap>>(CMS_MEDIA_REL_PATH, {});
  cachedMediaData = { ...defaultMedia, ...loaded };
  return cachedMediaData;
}

/**
 * Save CMS media map permanently to disk
 */
export function saveCmsMedia(newMedia: CmsMediaMap): boolean {
  cachedMediaData = newMedia;
  return safeWriteFileSync(CMS_MEDIA_REL_PATH, JSON.stringify(newMedia, null, 2));
}

export async function getCmsMediaAsync(): Promise<CmsMediaMap> {
  const remote = await loadDocument<CmsMediaMap>('cms_media');
  return remote ? { ...DEFAULT_MEDIA_MAP, ...remote } : getCmsMedia();
}

export async function saveCmsMediaAsync(newMedia: CmsMediaMap): Promise<boolean> {
  const saved = saveCmsMedia(newMedia);
  await saveDocument('cms_media', newMedia);
  return saved;
}

/**
 * Saves an uploaded photo definitively to /public/uploads and updates the media map
 */
export function saveUploadedPhoto(
  photoKey: string,
  filename: string,
  base64DataUrl: string
): { success: boolean; url?: string; error?: string; media?: CmsMediaMap } {
  try {
    if (!photoKey) {
      return { success: false, error: 'Chiave foto (photoKey) obbligatoria' };
    }
    if (!base64DataUrl) {
      return { success: false, error: 'Dati immagine non forniti' };
    }

    // Extract mime and base64 buffer
    let ext = 'jpg';
    let base64Content = base64DataUrl;

    const matches = base64DataUrl.match(/^data:image\/([a-zA-Z0-9\+\.]+);base64,(.+)$/);
    if (matches) {
      ext = matches[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      base64Content = matches[2];
    } else {
      // Fallback from filename extension
      const dotIdx = filename.lastIndexOf('.');
      if (dotIdx > 0) {
        ext = filename.slice(dotIdx + 1).toLowerCase();
      }
    }

    // Clean safe filename
    const safeKey = photoKey.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const safeFilename = `${safeKey}_${Date.now()}.${ext}`;
    const relUploadPath = path.join('public', 'uploads', safeFilename);

    const buffer = Buffer.from(base64Content, 'base64');
    safeWriteFileSync(relUploadPath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
    const media = getCmsMedia();
    media[photoKey] = publicUrl;
    saveCmsMedia(media);

    return {
      success: true,
      url: publicUrl,
      media
    };
  } catch (err: any) {
    console.error('Error saving uploaded photo:', err);
    return {
      success: false,
      error: err.message || 'Errore durante il salvataggio della foto su disco'
    };
  }
}

/**
 * Resets a specific photo or all photos to default
 */
export function resetCmsPhoto(photoKey?: string): CmsMediaMap {
  const current = getCmsMedia();
  if (photoKey) {
    if (DEFAULT_MEDIA_MAP[photoKey]) {
      current[photoKey] = DEFAULT_MEDIA_MAP[photoKey];
    } else {
      delete current[photoKey];
    }
  } else {
    cachedMediaData = { ...DEFAULT_MEDIA_MAP };
    saveCmsMedia(cachedMediaData);
    return cachedMediaData;
  }

  saveCmsMedia(current);
  return current;
}
