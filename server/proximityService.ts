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
 * 1. Wi-Fi IP match or local subnet
 * 2. GPS Geolocation within configured radius
 */
export function verifyGuestProximity(
  req: express.Request,
  haConfig: any,
  guestCoords?: Coordinates | null
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

  // If Wi-Fi is verified and policy allows Wi-Fi:
  if (wifiVerified && (policy === 'wifi_or_gps' || policy === 'wifi_only')) {
    return {
      verified: true,
      method: 'wifi',
      clientIp,
      homePublicIp,
      geofenceRadiusMeters: property.geofenceRadiusMeters || 80,
      isLocalLan,
      isMatchIp,
      reason: isLocalLan 
        ? `Connesso alla rete locale LAN di ${property.name}` 
        : `Connesso alla rete Wi-Fi autorizzata di ${property.name}`,
      propertyName: property.name
    };
  }

  // 2. Check GPS Geolocation (if provided and policy allows GPS)
  if (guestCoords && typeof guestCoords.latitude === 'number' && typeof guestCoords.longitude === 'number') {
    if (policy === 'wifi_or_gps' || policy === 'gps_only') {
      const distance = calculateHaversineDistanceMeters(
        guestCoords.latitude,
        guestCoords.longitude,
        property.latitude,
        property.longitude
      );

      const maxRadius = property.geofenceRadiusMeters || 80;
      // Allow slight GPS jitter if accuracy is reported (max accuracy tolerance: 50m)
      const allowedDistance = maxRadius + Math.min(guestCoords.accuracy ? guestCoords.accuracy * 0.5 : 0, 40);

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
          reason: `Posizione GPS confermata: ti trovi a circa ${distance} metri dall'ingresso di ${property.name}`,
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
          reason: `Sei a ${distance} metri da ${property.name} (raggio massimo consentito: ${maxRadius}m). Avvicinati all'ingresso o connettiti al Wi-Fi.`,
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
    geofenceRadiusMeters: property.geofenceRadiusMeters || 80,
    isLocalLan,
    isMatchIp,
    reason: homePublicIp
      ? `Non sei connesso al Wi-Fi "${property.wifiSSID}" né rilevato in prossimità GPS dell'ingresso.`
      : `Verifica Wi-Fi/GPS non ancora completata. Connettiti al Wi-Fi dell'appartamento o abilita la geolocalizzazione sul tuo dispositivo.`,
    propertyName: property.name
  };
}
