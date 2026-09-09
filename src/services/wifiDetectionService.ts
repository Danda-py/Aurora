/**
 * Real Wi-Fi Network Detection Service for Casa_Aurora
 * Performs active network validation:
 * 1. Checks Network Information API (blocks cellular 4G/5G mobile data)
 * 2. Probes local LAN subnet gateway (e.g. 192.168.1.1)
 * 3. Server-side verification matching client public IP against the home router public IP
 */

export interface WifiVerificationResult {
  verified: boolean;
  status: 'checking' | 'verified' | 'unverified' | 'cellular_detected' | 'error';
  ssid: string;
  reason?: string;
  clientIp?: string;
  message: string;
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

export async function probeLocalSubnet(targetIp: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  // If definitely on cellular, skip LAN probe
  if (isCellularNetwork()) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);

    // Using mode: 'no-cors' allows receiving opaque responses from local routers/devices
    await fetch(`http://${targetIp}/favicon.ico`, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

export async function checkCasaAuroraWifi(): Promise<WifiVerificationResult> {
  const isCellular = isCellularNetwork();

  if (isCellular) {
    return {
      verified: false,
      status: 'cellular_detected',
      ssid: 'Casa_Aurora',
      reason: 'cellular_network',
      message: 'Sei connesso con rete dati cellulare (4G/5G). Collegati al Wi-Fi Casa_Aurora per azionare la porta.'
    };
  }

  // Browsers cannot read the SSID. Probe only the configured Casa_Aurora
  // gateway so another nearby/private network does not count as a match.
  const probeSuccess = await probeLocalSubnet('192.168.0.1');

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('/api/wifi/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        probeSuccess,
        isCellular: false
      }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data.verified) {
        return {
          verified: true,
          status: 'verified',
          ssid: 'Casa_Aurora',
          reason: data.reason,
          clientIp: data.clientIp,
          message: data.message || 'Connesso alla rete Wi-Fi Casa_Aurora.'
        };
      } else {
        return {
          verified: false,
          status: 'unverified',
          ssid: 'Casa_Aurora',
          reason: data.reason,
          clientIp: data.clientIp,
          message: data.message || 'Non sei connesso alla rete Wi-Fi Casa_Aurora.'
        };
      }
    }
  } catch (err) {
    console.warn('Network verification API check failed:', err);
  }

  // Fallback if probe succeeded
  if (probeSuccess) {
    return {
      verified: true,
      status: 'verified',
      ssid: 'Casa_Aurora',
      reason: 'lan_probe',
      message: 'Connesso alla rete locale Wi-Fi Casa_Aurora.'
    };
  }

  return {
    verified: false,
    status: 'unverified',
    ssid: 'Casa_Aurora',
    reason: 'not_connected',
    message: 'Non sei connesso al Wi-Fi Casa_Aurora.'
  };
}
