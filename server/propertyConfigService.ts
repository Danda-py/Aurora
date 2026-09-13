import path from 'path';
import { safeReadJsonSync, safeWriteFileSync } from './storageUtils.js';
import { isSupabaseConfigured, loadDocument, saveDocument } from './supabaseStorage.js';

export interface PropertyConfig {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  region: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number; // Default: 80 meters

  // Host Info
  hostName: string;
  hostPhone: string;
  hostWhatsApp: string;
  hostEmail: string;
  googleReviewUrl: string;

  // Legal & Tax
  cirCode: string;
  cinCode: string;
  touristTax: {
    enabled: boolean;
    ratePerNight: number;
    exemptUnderAge: number;
    maxNights: number;
  };

  // Wi-Fi
  wifiSSID: string;
  wifiPassword: string;

  // Check-in / Out policies
  checkInStart: string;
  checkInEnd: string;
  checkOutLimit: string;
  keyDeliveryType: string;
  parkingSpot: string;

  // Proximity validation policy
  proximityPolicy: 'wifi_or_gps' | 'wifi_only' | 'gps_only';
}

const PROPERTY_CONFIG_REL_PATH = path.join('data', 'property_config.json');
const PROPERTY_CONFIG_DOCUMENT_KEY = 'property_config';

export const DEFAULT_PROPERTY_CONFIG: PropertyConfig = {
  id: 'aurora-valtellina-01',
  name: 'Aurora in Valtellina',
  tagline: 'Il tuo rifugio tra lago e montagne a Morbegno, Valtellina',
  address: 'Via Serta 188D',
  city: 'Morbegno',
  province: 'SO',
  zip: '23017',
  region: 'Valtellina, Lombardia - Italia',
  fullAddress: 'Via Serta 188D, 23017 Morbegno (SO)',
  latitude: 46.1345,
  longitude: 9.5742,
  geofenceRadiusMeters: 80,

  hostName: 'Antonino (Nino)',
  hostPhone: '+39 391 778 4042',
  hostWhatsApp: '393917784042',
  hostEmail: 'antonino.andaloro@gmail.com',
  googleReviewUrl: 'https://search.google.com/local/reviews?placeid=ChIJ11ZcfABzhEcRq2VgfPsX7WA',

  cirCode: '014045-CNI-00033',
  cinCode: 'IT014045C29IUY4S4V',
  touristTax: {
    enabled: true,
    ratePerNight: 1.50,
    exemptUnderAge: 12,
    maxNights: 7
  },

  wifiSSID: 'Casa_Aurora',
  wifiPassword: 'Luglio2025',

  checkInStart: '14:00',
  checkInEnd: '22:00',
  checkOutLimit: '10:00',
  keyDeliveryType: 'Apertura smart da smartphone (Wi-Fi o GPS in loco) o codice numerico',
  parkingSpot: 'Parcheggio privato dell\'abitazione con posto auto sempre libero e riservato per l\'appartamento',

  proximityPolicy: 'wifi_or_gps'
};

function loadSavedPropertyConfig(): PropertyConfig {
  const fileConfig = safeReadJsonSync<Partial<PropertyConfig>>(PROPERTY_CONFIG_REL_PATH, {});
  return {
    ...DEFAULT_PROPERTY_CONFIG,
    ...fileConfig,
    touristTax: {
      ...DEFAULT_PROPERTY_CONFIG.touristTax,
      ...(fileConfig.touristTax || {})
    }
  };
}

let currentPropertyConfig: PropertyConfig = loadSavedPropertyConfig();

export function getPropertyConfig(): PropertyConfig {
  return currentPropertyConfig;
}

export async function hydratePropertyConfig(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const remote = await loadDocument<Partial<PropertyConfig>>(PROPERTY_CONFIG_DOCUMENT_KEY);
    if (remote) {
      currentPropertyConfig = {
        ...currentPropertyConfig,
        ...remote,
        touristTax: {
          ...currentPropertyConfig.touristTax,
          ...(remote.touristTax || {})
        }
      };
      safeWriteFileSync(PROPERTY_CONFIG_REL_PATH, JSON.stringify(currentPropertyConfig, null, 2));
    }
  } catch (err) {
    console.warn('[propertyConfigService] Hydration from Supabase failed, using local config:', err);
  }
}

export async function updatePropertyConfig(partial: Partial<PropertyConfig>): Promise<PropertyConfig> {
  currentPropertyConfig = {
    ...currentPropertyConfig,
    ...partial,
    touristTax: {
      ...currentPropertyConfig.touristTax,
      ...(partial.touristTax || {})
    }
  };

  safeWriteFileSync(PROPERTY_CONFIG_REL_PATH, JSON.stringify(currentPropertyConfig, null, 2));

  if (isSupabaseConfigured()) {
    try {
      await saveDocument(PROPERTY_CONFIG_DOCUMENT_KEY, currentPropertyConfig);
    } catch (err) {
      console.error('[propertyConfigService] Save to Supabase failed:', err);
    }
  }

  return currentPropertyConfig;
}
