import type express from 'express';
import { getPropertyConfig } from './propertyConfigService.js';
import { extractClientIps } from './clientIpUtils.js';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // In meters
}

export interface ProximityVerificationResult {
  verified: boolean;
  method: 'wifi' | 'gps' | 'none';
  clientIp: string;
  homePublicIp: string;
  distanceMeters?: number;
  geofenceRadiusMeters: number;
  isLocalLan: boolean;
  isMatchIp: boolean;
  reason: string;
  propertyName: string;
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (returns distance in meters).
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Verifies proximity to the property using either:
 * 1. Wi-Fi IP match or local subnet (always allowed)
 * 2. GPS Geolocation within 50 meters (ONLY for the first entry)
 */
export function verifyGuestProximity(
  req: express.Request,
  haConfig: any,
  guestCoords?: Coordinates | null,
  isFirstEntry: boolean = true
): ProximityVerificationResult {
  const property = getPropertyConfig();
  const ips = extractClientIps(req);
  const clientIp = ips[0] || '';
  const homePublicIp = (haConfig?.homePublicIp || '').replace(/^::ffff:/, '').trim();

  // 1. Check Wi-Fi match
  const isMatchIp = Boolean(homePublicIp && ips.some(ip => ip === homePublicIp));
  const isLocalLan = ips.some(ip =>
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.3') ||
    ip.startsWith('127.') ||
    ip === '::1' ||
    ip === 'localhost'
  );

  const wifiVerified = isMatchIp || isLocalLan;
  const policy = property.proximityPolicy || 'wifi_or_gps';

  // If Wi-Fi is verified: always allow!
  if (wifiVerified && (policy === 'wifi_or_gps' || policy === 'wifi_only')) {
    return {
      verified: true,
      method: 'wifi',
      clientIp,
      homePublicIp,
      geofenceRadiusMeters: 50,
      isLocalLan,
      isMatchIp,
      reason: isLocalLan 
        ? `Connesso alla rete locale LAN di ${property.name}` 
        : `Connesso alla rete Wi-Fi autorizzata di ${property.name}`,
      propertyName: property.name
    };
  }

  // 2. Check GPS Geolocation (strictly ONLY allowed for the very FIRST entry within 50m)
  if (guestCoords && typeof guestCoords.latitude === 'number' && typeof guestCoords.longitude === 'number') {
    if (!isFirstEntry) {
      return {
        verified: false,
        method: 'none',
        clientIp,
        homePublicIp,
        geofenceRadiusMeters: 50,
        isLocalLan,
        isMatchIp,
        reason: `Il primo ingresso è già avvenuto con successo. Per i successivi sblocchi della porta, connettiti alla rete Wi-Fi "${property.wifiSSID}".`,
        propertyName: property.name
      };
    }

    if (policy === 'wifi_or_gps' || policy === 'gps_only') {
      const distance = calculateHaversineDistanceMeters(
        guestCoords.latitude,
        guestCoords.longitude,
        property.latitude,
        property.longitude
      );

      const maxRadius = 50; // Strictly 50 meters as requested for Casa Aurora
      // Allow slight GPS accuracy tolerance (max 15m extra if accuracy reported)
      const allowedDistance = maxRadius + Math.min(guestCoords.accuracy ? guestCoords.accuracy * 0.3 : 0, 15);

      if (distance <= allowedDistance) {
        return {
          verified: true,
          method: 'gps',
          clientIp,
          homePublicIp,
          distanceMeters: distance,
          geofenceRadiusMeters: maxRadius,
          isLocalLan,
          isMatchIp,
          reason: `Posizione GPS primo ingresso confermata: ti trovi a ${distance}m dall'ingresso di ${property.name} (raggio consentito: ${maxRadius}m).`,
          propertyName: property.name
        };
      } else {
        return {
          verified: false,
          method: 'none',
          clientIp,
          homePublicIp,
          distanceMeters: distance,
          geofenceRadiusMeters: maxRadius,
          isLocalLan,
          isMatchIp,
          reason: `Ti trovi a ${distance} metri da ${property.name}. Per il primo ingresso tramite GPS devi trovarti entro ${maxRadius} metri dall'ingresso.`,
          propertyName: property.name
        };
      }
    }
  }

  // Fallback: Not verified
  return {
    verified: false,
    method: 'none',
    clientIp,
    homePublicIp,
    geofenceRadiusMeters: 50,
    isLocalLan,
    isMatchIp,
    reason: isFirstEntry
      ? `Per il primo sblocco della porta, avvicinati all'ingresso entro 50 metri con GPS attivo, oppure connettiti al Wi-Fi "${property.wifiSSID}".`
      : `Non sei connesso alla rete Wi-Fi "${property.wifiSSID}". Connettiti al Wi-Fi dell'appartamento per aprire la porta.`,
    propertyName: property.name
  };
}
