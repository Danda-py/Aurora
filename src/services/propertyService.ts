import { APARTMENT_INFO } from '../data/apartmentData';

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
  geofenceRadiusMeters: number;

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

export const FALLBACK_PROPERTY_CONFIG: PropertyConfig = {
  id: 'aurora-valtellina-01',
  name: APARTMENT_INFO.name,
  tagline: APARTMENT_INFO.tagline,
  address: APARTMENT_INFO.address,
  city: APARTMENT_INFO.city,
  province: APARTMENT_INFO.province,
  zip: APARTMENT_INFO.zip,
  region: APARTMENT_INFO.region,
  fullAddress: APARTMENT_INFO.fullAddress,
  latitude: 46.1345,
  longitude: 9.5742,
  geofenceRadiusMeters: 80,

  hostName: APARTMENT_INFO.hostName,
  hostPhone: APARTMENT_INFO.hostPhone,
  hostWhatsApp: APARTMENT_INFO.hostWhatsApp,
  hostEmail: APARTMENT_INFO.hostEmail,
  googleReviewUrl: APARTMENT_INFO.googleReviewUrl,

  cirCode: APARTMENT_INFO.cirCode,
  cinCode: APARTMENT_INFO.cinCode,
  touristTax: {
    enabled: true,
    ratePerNight: 1.50,
    exemptUnderAge: 12,
    maxNights: 7
  },

  wifiSSID: APARTMENT_INFO.wifiSSID,
  wifiPassword: APARTMENT_INFO.wifiPassword,

  checkInStart: APARTMENT_INFO.checkInStart,
  checkInEnd: APARTMENT_INFO.checkInEnd,
  checkOutLimit: APARTMENT_INFO.checkOutLimit,
  keyDeliveryType: APARTMENT_INFO.keyDeliveryType,
  parkingSpot: APARTMENT_INFO.parkingSpot,

  proximityPolicy: 'wifi_or_gps'
};

let cachedConfig: PropertyConfig | null = null;

export async function fetchPropertyConfig(): Promise<PropertyConfig> {
  try {
    const res = await fetch('/api/property/config', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        cachedConfig = data.config;
        return data.config;
      }
    }
  } catch (err) {
    console.warn('[propertyService] Impossibile recuperare configurazione remota:', err);
  }
  return cachedConfig || FALLBACK_PROPERTY_CONFIG;
}

export async function savePropertyConfig(config: Partial<PropertyConfig>): Promise<{ success: boolean; config?: PropertyConfig; error?: string }> {
  try {
    const res = await fetch('/api/property/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      cachedConfig = data.config;
      return { success: true, config: data.config };
    }
    return { success: false, error: data.error || 'Errore salvataggio' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Errore di rete' };
  }
}
