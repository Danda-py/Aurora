/**
 * Dual Proximity & Network Detection Service for Casa Aurora & Host Product
 * Performs active proximity validation:
 * 1. Checks Network Information API & server-side Wi-Fi public IP matching
 * 2. Fallback GPS Geolocation geofencing (validates user is within ~80m of the property)
 */

export interface WifiVerificationResult {
  verified: boolean;
  status: 'checking' | 'verified' | 'unverified' | 'cellular_detected' | 'error';
  ssid: string;
  reason?: string;
  clientIp?: string;
  message: string;
  method?: 'wifi' | 'gps' | 'none';
  distanceMeters?: number;
  coords?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export function isCellularNetwork(): boolean {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn && conn.type === 'cellular') {
      return true;
    }
  }
  return false;
}

/**
 * Attempts to retrieve high-accuracy browser GPS coordinates (HTML5 Geolocation)
 */
export function getBrowserGeolocation(): Promise<{ latitude: number; longitude: number; accuracy: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      (_err) => {
        // Silently resolve null if user denies or timeout
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000 }
    );
  });
}

/**
 * Performs proximity verification using Wi-Fi first, and GPS geolocation if Wi-Fi isn't matched
 */
export async function checkCasaAuroraWifi(maxRetries = 1, requestGps = true): Promise<WifiVerificationResult> {
  const isCellular = isCellularNetwork();

  // 1. First try Wi-Fi IP match
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('/api/wifi/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store',
        body: JSON.stringify({ isCellular }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          return {
            verified: true,
            status: 'verified',
            ssid: data.details?.ssidExpected || 'Casa_Aurora',
            reason: data.reason,
            clientIp: data.clientIp,
            method: 'wifi',
            message: data.message || 'Connesso alla rete Wi-Fi autorizzata.'
          };
        }
      }
    } catch (err) {
      console.warn(`Verifica Wi-Fi (tentativo ${attempt + 1}) non riuscita:`, err);
    }
  }

  // 2. If Wi-Fi is not verified (e.g. guest on 4G outside the door) and GPS is allowed, try GPS Geofencing!
  if (requestGps) {
    try {
      const coords = await getBrowserGeolocation();
      if (coords) {
        const res = await fetch('/api/proximity/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          body: JSON.stringify({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            return {
              verified: true,
              status: 'verified',
              ssid: 'Casa_Aurora',
              reason: data.reason,
              clientIp: data.clientIp,
              method: data.method || 'gps',
              distanceMeters: data.distanceMeters,
              coords,
              message: data.distanceMeters !== undefined
                ? `Posizione verificata: ti trovi a circa ${data.distanceMeters} metri dalla struttura. Accesso autorizzato!`
                : 'Posizione in prossimità della struttura confermata.'
            };
          } else if (data.distanceMeters !== undefined) {
            return {
              verified: false,
              status: 'unverified',
              ssid: 'Casa_Aurora',
              reason: data.reason,
              clientIp: data.clientIp,
              distanceMeters: data.distanceMeters,
              coords,
              message: `Ti trovi a ${data.distanceMeters}m dalla struttura (massimo consentito: ${data.geofenceRadiusMeters || 80}m). Avvicinati all'ingresso o connettiti al Wi-Fi.`
            };
          }
        }
      }
    } catch (gpsErr) {
      console.warn('Verifica GPS non riuscita:', gpsErr);
    }
  }

  // 3. Fallback when neither Wi-Fi nor GPS is verified
  if (isCellular) {
    return {
      verified: false,
      status: 'cellular_detected',
      ssid: 'Casa_Aurora',
      reason: 'cellular_network',
      message: 'Sei connesso con rete cellulare (4G/5G). Per sbloccare la porta, collegati al Wi-Fi Casa_Aurora oppure consenti l’accesso alla posizione GPS trovandoti davanti all’ingresso.'
    };
  }

  return {
    verified: false,
    status: 'unverified',
    ssid: 'Casa_Aurora',
    reason: 'not_connected',
    message: 'Non sei connesso al Wi-Fi Casa_Aurora né rilevato nei pressi dell’ingresso via GPS.'
  };
}
