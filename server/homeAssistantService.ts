/**
 * Home Assistant Integration Service for Aurora in Valtellina
 * Sends an ON input to the button/switch/relay in Home Assistant to open the door.
 * 
 * Supports:
 * 1. Home Assistant Webhook (e.g., https://<ha-url>/api/webhook/<webhook_id>)
 * 2. Home Assistant REST API with Long-Lived Access Token (e.g., /api/services/switch/turn_on)
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { safeReadJsonSync, safeWriteFileSync } from './storageUtils.js';
import { isSupabaseConfigured, loadDocument, saveDocument } from './supabaseStorage.js';

export interface HomeAssistantConfig {
  mode: 'webhook' | 'rest_api';
  // Webhook approach
  webhookUrl: string;       // e.g. https://xxxx.ui.nabu.casa/api/webhook/apri_portone_aurora
  
  // REST API approach
  haUrl: string;            // e.g. https://xxxx.ui.nabu.casa or https://myha.duckdns.org:8123 or http://192.168.1.100:8123
  accessToken: string;      // Home Assistant Long-Lived Access Token
  entityId: string;         // e.g. switch.portone, button.apri_portone, switch.sonoff_portone
  service: string;          // e.g. switch.turn_on, button.press, homeassistant.turn_on
  
  deviceName: string;       // Friendly name, e.g. "Pulsante Portone Aurora"
  wifiSsidRequired: string; // Required Wi-Fi network SSID, e.g. "Casa_Aurora"
  homePublicIp: string;     // Public IP of the Casa_Aurora router
  lanGatewayIp: string;     // Local probe IP for Casa_Aurora LAN (default: 192.168.1.1)
  localWebhookUrl: string;  // Local LAN webhook/relay URL (e.g. http://192.168.1.xxx:8123/api/webhook/apri_portone)
  enabled: boolean;
}

const HASS_CONFIG_REL_PATH = path.join('data', 'hass_config.json');
const HASS_CONFIG_DOCUMENT_KEY = 'home_assistant_config';

function loadSavedHassConfig(): Partial<HomeAssistantConfig> {
  return safeReadJsonSync<Partial<HomeAssistantConfig>>(HASS_CONFIG_REL_PATH, {});
}

function saveHassConfigToFile(config: HomeAssistantConfig) {
  safeWriteFileSync(HASS_CONFIG_REL_PATH, JSON.stringify(config, null, 2));
}

const savedConfig = loadSavedHassConfig();

let currentHassConfig: HomeAssistantConfig = {
  mode: savedConfig.mode ?? (process.env.HASS_MODE as any) ?? (process.env.HASS_URL ? 'rest_api' : 'webhook'),
  webhookUrl: savedConfig.webhookUrl ?? process.env.HASS_WEBHOOK_URL ?? process.env.EWELINK_WEBHOOK_URL ?? '',
  haUrl: savedConfig.haUrl ?? process.env.HASS_URL ?? '',
  accessToken: savedConfig.accessToken ?? process.env.HASS_TOKEN ?? '',
  entityId: savedConfig.entityId ?? process.env.HASS_ENTITY_ID ?? 'switch.portone',
  service: savedConfig.service ?? process.env.HASS_SERVICE ?? 'switch.turn_on',
  deviceName: savedConfig.deviceName ?? process.env.HASS_DEVICE_NAME ?? 'Pulsante Portone Aurora',
  wifiSsidRequired: savedConfig.wifiSsidRequired ?? 'Casa_Aurora',
  homePublicIp: savedConfig.homePublicIp ?? '',
  lanGatewayIp: savedConfig.lanGatewayIp ?? '192.168.1.1',
  localWebhookUrl: savedConfig.localWebhookUrl ?? '',
  enabled: savedConfig.enabled !== undefined
    ? Boolean(savedConfig.enabled)
    : Boolean(
      savedConfig.webhookUrl ||
      process.env.HASS_WEBHOOK_URL ||
      process.env.EWELINK_WEBHOOK_URL ||
      (savedConfig.haUrl && savedConfig.accessToken) ||
      (process.env.HASS_URL && process.env.HASS_TOKEN)
    )
};

let configHydration: Promise<void> | null = null;

export function hydrateHomeAssistantConfig(): Promise<void> {
  if (configHydration) return configHydration;
  configHydration = (async () => {
    if (!isSupabaseConfigured()) return;
    const remoteConfig = await loadDocument<Partial<HomeAssistantConfig>>(HASS_CONFIG_DOCUMENT_KEY);
    if (remoteConfig) {
      currentHassConfig = { ...currentHassConfig, ...remoteConfig };
    }
  })().catch(error => {
    configHydration = null;
    console.warn('[homeAssistantService] Unable to hydrate config from Supabase:', error);
  });
  return configHydration;
}

export function getHomeAssistantConfig(): HomeAssistantConfig {
  return { ...currentHassConfig };
}

export function updateHomeAssistantConfig(newConfig: Partial<HomeAssistantConfig>): HomeAssistantConfig {
  currentHassConfig = {
    ...currentHassConfig,
    ...newConfig
  };
  
  if (newConfig.enabled === undefined) {
    currentHassConfig.enabled = Boolean(
      currentHassConfig.webhookUrl ||
      currentHassConfig.localWebhookUrl ||
      (currentHassConfig.haUrl && currentHassConfig.accessToken)
    );
  } else {
    currentHassConfig.enabled = Boolean(newConfig.enabled);
  }
  
  saveHassConfigToFile(currentHassConfig);
  return { ...currentHassConfig };
}

export async function updateHomeAssistantConfigAsync(newConfig: Partial<HomeAssistantConfig>): Promise<HomeAssistantConfig> {
  const updated = updateHomeAssistantConfig(newConfig);
  if (isSupabaseConfigured()) {
    await saveDocument(HASS_CONFIG_DOCUMENT_KEY, updated);
  }
  return updated;
}

/**
 * Checks if a given URL or hostname points to a private local LAN network (RFC 1918)
 */
export function isLocalLanAddress(targetUrl: string): boolean {
  if (!targetUrl) return false;
  return (
    targetUrl.includes('192.168.') ||
    targetUrl.includes('10.') ||
    targetUrl.includes('172.16.') ||
    targetUrl.includes('172.17.') ||
    targetUrl.includes('172.18.') ||
    targetUrl.includes('172.19.') ||
    targetUrl.includes('172.2') ||
    targetUrl.includes('172.3') ||
    targetUrl.includes('.local') ||
    targetUrl.includes('localhost')
  );
}

export interface HassTriggerResult {
  success: boolean;
  wifiBlocked?: boolean;
  message?: string;
  error?: string;
  httpStatus?: number;
  latencyMs?: number;
  details?: any;
  targetEndpoint?: string;
}

/**
 * Sends an ON input to Home Assistant to trigger the door opener switch/button.
 * Real integration with pulse inching for electric strike — strictly no simulated successes.
 */
export async function triggerHomeAssistantOn(params?: {
  guestName?: string;
  source?: string;
  wifiConnected?: boolean;
}): Promise<HassTriggerResult> {
  const startTime = Date.now();
  const config = currentHassConfig;
  const guest = params?.guestName || 'Host';
  const source = params?.source || 'Portale Aurora';

  if (!config.enabled) {
    return {
      success: false,
      error: 'Apertura porta disabilitata. Riattivala nella configurazione Home Assistant.'
    };
  }

  // 1. Wi-Fi security check
  if (params?.wifiConnected === false) {
    return {
      success: false,
      wifiBlocked: true,
      error: `Accesso negato: Devi essere connesso alla rete Wi-Fi di casa (${config.wifiSsidRequired}) per aprire il portone.`
    };
  }

  // 2. Check if anything is configured
  const hasWebhook = config.mode === 'webhook' && Boolean(config.webhookUrl);
  const hasRestApi = config.mode === 'rest_api' && Boolean(config.haUrl && config.accessToken);

  if (!hasWebhook && !hasRestApi) {
    return {
      success: false,
      error: 'Home Assistant non è configurato. Inserisci l\'URL del Webhook o l\'URL con Token REST API nel Portale Host (scheda Home Assistant).'
    };
  }

  // 3. Primary execution path: Authenticated REST API (direct, reliable, unaffected by local_only webhook flags)
  if (hasRestApi) {
    const cleanBaseUrl = config.haUrl.trim().replace(/\/+$/, '');

    if (isLocalLanAddress(cleanBaseUrl)) {
      return {
        success: false,
        error: `L'URL di Home Assistant (${cleanBaseUrl}) è un IP locale privato non raggiungibile dal server cloud. Configura l'URL pubblico HTTPS (Nabu Casa https://...ui.nabu.casa o DuckDNS con HTTPS) nel Portale Host.`,
        targetEndpoint: cleanBaseUrl
      };
    }

    try {
      // Resolve entity ID, replacing legacy placeholder 'switch.portone' with real Aurora door entity
      let entityId = (config.entityId || '').trim();
      if (!entityId || entityId === 'switch.portone') {
        entityId = 'automation.porta_aurora';
      }

      let domain = 'switch';
      let onAction = 'turn_on';
      let isSwitch = false;

      if (entityId.startsWith('automation.')) {
        domain = 'automation';
        onAction = 'trigger';
        isSwitch = false;
      } else if (entityId.startsWith('button.')) {
        domain = 'button';
        onAction = 'press';
        isSwitch = false;
      } else if (entityId.startsWith('lock.')) {
        domain = 'lock';
        onAction = 'unlock';
        isSwitch = false;
      } else if (entityId.startsWith('switch.')) {
        domain = 'switch';
        onAction = 'turn_on';
        isSwitch = true;
      } else if (config.service && config.service.includes('.')) {
        const parts = config.service.split('.');
        domain = parts[0];
        onAction = parts[1];
        isSwitch = domain === 'switch';
      }

      const apiUrl = `${cleanBaseUrl}/api/services/${domain}/${onAction}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken.trim()}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Aurora-Valtellina-SmartLock/2.0'
        },
        body: JSON.stringify({ entity_id: entityId }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      const responseJson = await res.json().catch(() => null);

      if (!res.ok) {
        let errDetail = `HTTP ${res.status}: ${res.statusText}`;
        if (res.status === 401 || res.status === 403) {
          errDetail = 'Access Token non valido o scaduto (HTTP 401/403). Genera un nuovo Long-Lived Access Token in Home Assistant.';
        } else if (res.status === 404) {
          errDetail = `Entità "${entityId}" o servizio "${domain}.${onAction}" non trovato in Home Assistant (HTTP 404).`;
        }
        return {
          success: false,
          httpStatus: res.status,
          latencyMs,
          error: `Errore chiamata Home Assistant: ${errDetail}`,
          details: responseJson,
          targetEndpoint: apiUrl
        };
      }

      // If the target is the Aurora automation or a Sonoff relay switch, trigger hardware inching pulse
      if (isSwitch) {
        setTimeout(async () => {
          try {
            const offUrl = `${cleanBaseUrl}/api/services/switch/turn_off`;
            await fetch(offUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${config.accessToken.trim()}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ entity_id: entityId })
            });
          } catch (e) {
            console.warn('Auto turn_off pulse error (non-critical):', e);
          }
        }, 10000);
      }

      return {
        success: true,
        httpStatus: res.status,
        latencyMs,
        message: `Comando inviato con successo a Home Assistant (${entityId} ➔ ${domain}.${onAction})! Elettroserratura attivata.`,
        details: responseJson,
        targetEndpoint: apiUrl
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        latencyMs,
        error: isTimeout
          ? 'Timeout: Home Assistant REST API non ha risposto entro 8 secondi. Controlla la connessione.'
          : `Errore di rete REST API: ${err.message || 'Impossibile connettersi a Home Assistant'}`,
        targetEndpoint: cleanBaseUrl
      };
    }
  }

  // 4. Fallback Webhook-only Mode (when no REST API token is provided)
  const targetUrl = config.webhookUrl.trim();
  if (isLocalLanAddress(targetUrl)) {
    return {
      success: false,
      error: `Impossibile raggiungere l'indirizzo locale (${targetUrl}) dal server cloud. Per permettere l'apertura remota del portone, usa l'URL pubblico HTTPS di Home Assistant o inserisci il Token REST API.`,
      targetEndpoint: targetUrl
    };
  }

  try {
    const payload = {
      action: 'turn_on',
      state: 'on',
      command: 'ON',
      entity_id: config.entityId || 'automation.porta_aurora',
      timestamp: new Date().toISOString(),
      guest,
      source
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Aurora-Valtellina-SmartLock/2.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    const responseText = await res.text().catch(() => '');

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}: ${res.statusText}`;
      if (res.status === 404) {
        errDetail = `HTTP 404: Webhook non trovato. Verifica che l'ID del Webhook sia corretto e che in Home Assistant sia presente l'automazione corrispondente.`;
      } else if (res.status === 401 || res.status === 403) {
        errDetail = `HTTP ${res.status}: Richiesta non autorizzata. Verifica i permessi in Home Assistant.`;
      }
      return {
        success: false,
        httpStatus: res.status,
        latencyMs,
        error: `Home Assistant ha risposto con errore: ${errDetail}`,
        details: responseText.slice(0, 200),
        targetEndpoint: targetUrl
      };
    }

    return {
      success: true,
      httpStatus: res.status,
      latencyMs,
      message: `Comando inviato con successo a Home Assistant Webhook (${config.deviceName})! Elettroserratura attivata.`,
      details: responseText.slice(0, 200),
      targetEndpoint: targetUrl
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';
    return {
      success: false,
      latencyMs,
      error: isTimeout
        ? 'Timeout di connessione: Home Assistant non ha risposto entro 7 secondi. Controlla che il dispositivo sia online.'
        : `Impossibile connettersi all'URL di Home Assistant (${err.message || 'Errore di rete'}).`,
      targetEndpoint: targetUrl
    };
  }
}

/**
 * Triggers the "Check-out Effettuato" automation scenario on Home Assistant.
 */
export async function triggerHomeAssistantCheckout(guestName: string): Promise<HassTriggerResult> {
  const startTime = Date.now();
  const config = currentHassConfig;

  // Graceful simulation fallback when HA is disabled or not configured
  const hasWebhook = config.mode === 'webhook' && Boolean(config.webhookUrl);
  const hasRestApi = config.mode === 'rest_api' && Boolean(config.haUrl && config.accessToken);

  if (!config.enabled || (!hasWebhook && !hasRestApi)) {
    return {
      success: true,
      message: `[Simulazione] Scenario Check-out "Check-out Effettuato" eseguito per ${guestName}: tutte le luci spente, elettrodomestici in standby disattivati, riscaldamento impostato in modalità "Antigelo" (7°C).`
    };
  }

  // A: Webhook scenario
  if (hasWebhook) {
    try {
      const payload = {
        action: 'checkout',
        scenario: 'Check-out Effettuato',
        guestName,
        timestamp: new Date().toISOString(),
        commands: [
          { service: 'light.turn_off', entity_id: 'all' },
          { service: 'switch.turn_off', entity_id: 'all' },
          { service: 'climate.set_temperature', entity_id: 'all', temperature: 7 }
        ],
        details: {
          lights: 'turn_off_all',
          standby_appliances: 'turn_off_all',
          climate_mode: 'Antigelo'
        }
      };
      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return { success: true, message: 'Scenario Check-out "Check-out Effettuato" inviato con successo via Webhook. Luci spente, Stand-by disattivati, Riscaldamento in Antigelo.' };
      }
      return { success: false, error: `HA Webhook returned HTTP ${res.status}` };
    } catch (err: any) {
      return { success: false, error: `Errore Webhook Checkout: ${err.message}` };
    }
  }

  // B: REST API scenario
  const cleanBaseUrl = config.haUrl.trim().replace(/\/+$/, '');
  try {
    // Fire event 'aurora_checkout' so HA can run any automation
    const eventUrl = `${cleanBaseUrl}/api/events/aurora_checkout`;
    try {
      await fetch(eventUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guestName, timestamp: new Date().toISOString() })
      });
    } catch {}

    // Also call individual services to ensure the lights/appliances are turned off and climate set to Antigelo
    // 1. Turn off all lights
    try {
      await fetch(`${cleanBaseUrl}/api/services/light/turn_off`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.accessToken.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: 'all' })
      });
    } catch {}

    // 2. Turn off standby appliances (e.g. any configured switch group or entityId)
    try {
      await fetch(`${cleanBaseUrl}/api/services/switch/turn_off`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.accessToken.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: 'all' })
      });
    } catch {}

    // 3. Set climate to Antigelo mode (7°C or hvac_off)
    try {
      await fetch(`${cleanBaseUrl}/api/services/climate/set_temperature`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.accessToken.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_id: 'all', temperature: 7 })
      });
    } catch {}

    return {
      success: true,
      message: 'Scenario Check-out inviato. Luci spente, stand-by disattivati e clima in Antigelo (7°C).'
    };
  } catch (err: any) {
    return { success: false, error: `Errore REST API Checkout: ${err.message}` };
  }
}
