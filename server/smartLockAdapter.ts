import { 
  getHomeAssistantConfig, 
  triggerHomeAssistantOn, 
  triggerHomeAssistantCheckout, 
  HassTriggerResult 
} from './homeAssistantService.js';

export type SmartLockProviderType = 'home_assistant' | 'shelly' | 'nuki' | 'generic_webhook';

export interface UnlockParams {
  guestName: string;
  source: string;
  guestPassId?: string | null;
  verifiedProximity?: boolean;
}

export interface LockProviderResult {
  success: boolean;
  message?: string;
  error?: string;
  latencyMs?: number;
  provider: SmartLockProviderType;
}

export interface SmartLockProviderSettings {
  provider: SmartLockProviderType;
  // Shelly specific
  shellyServerUrl?: string; // e.g. https://shelly-XX-eu.shelly.cloud or local IP
  shellyAuthKey?: string;
  shellyDeviceId?: string;
  shellyChannel?: number;
  // Nuki specific
  nukiApiToken?: string;
  nukiSmartlockId?: string;
  // Generic Webhook specific
  webhookUrl?: string;
  webhookSecret?: string;
}

/**
 * Abstract Lock Provider Interface
 */
export interface ILockProvider {
  type: SmartLockProviderType;
  unlock(params: UnlockParams): Promise<LockProviderResult>;
  checkout?(guestName: string): Promise<LockProviderResult>;
}

/**
 * 1. Home Assistant Provider (Default & active for Casa Aurora)
 */
export class HomeAssistantProvider implements ILockProvider {
  type: SmartLockProviderType = 'home_assistant';

  async unlock(params: UnlockParams): Promise<LockProviderResult> {
    const res: HassTriggerResult = await triggerHomeAssistantOn({
      guestName: params.guestName,
      source: params.source,
      wifiConnected: params.verifiedProximity ?? true
    });

    return {
      success: res.success,
      message: res.message || (res.success ? 'Portone sbloccato con successo via Home Assistant' : undefined),
      error: res.error,
      latencyMs: res.latencyMs,
      provider: 'home_assistant'
    };
  }

  async checkout(guestName: string): Promise<LockProviderResult> {
    const res = await triggerHomeAssistantCheckout(guestName);
    return {
      success: res.success,
      message: res.message,
      error: res.error,
      provider: 'home_assistant'
    };
  }
}

/**
 * 2. Shelly Cloud & Local Relay Provider
 */
export class ShellyProvider implements ILockProvider {
  type: SmartLockProviderType = 'shelly';
  private config: SmartLockProviderSettings;

  constructor(config: SmartLockProviderSettings) {
    this.config = config;
  }

  async unlock(params: UnlockParams): Promise<LockProviderResult> {
    const startTime = Date.now();
    try {
      const serverUrl = (this.config.shellyServerUrl || '').trim();
      const authKey = (this.config.shellyAuthKey || '').trim();
      const deviceId = (this.config.shellyDeviceId || '').trim();
      const channel = this.config.shellyChannel || 0;

      if (!serverUrl) {
        return {
          success: false,
          error: 'URL server Shelly non configurato.',
          provider: 'shelly'
        };
      }

      // Check if Cloud API or Local HTTP
      const isCloud = serverUrl.includes('shelly.cloud');
      let targetUrl = serverUrl;
      let options: RequestInit = {};

      if (isCloud) {
        targetUrl = `${serverUrl.replace(/\/+$/, '')}/device/relay/control`;
        const bodyParams = new URLSearchParams({
          auth_key: authKey,
          id: deviceId,
          channel: String(channel),
          turn: 'on'
        });
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: bodyParams.toString()
        };
      } else {
        // Local Shelly relay (Gen1 / Gen2)
        // With auto-off timer of 2 seconds for door buzzer pulse
        targetUrl = `${serverUrl.replace(/\/+$/, '')}/relay/${channel}?turn=on&timer=2`;
        options = {
          method: 'GET',
          headers: authKey ? { 'Authorization': `Basic ${Buffer.from(`admin:${authKey}`).toString('base64')}` } : {}
        };
      }

      const res = await fetch(targetUrl, options);
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        return {
          success: false,
          error: `Shelly ha risposto con codice HTTP ${res.status}: ${res.statusText}`,
          latencyMs,
          provider: 'shelly'
        };
      }

      return {
        success: true,
        message: `Relè Shelly attivato per ${params.guestName}. Impulso inviato al portone.`,
        latencyMs,
        provider: 'shelly'
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Errore di connessione a Shelly: ${err.message}`,
        latencyMs: Date.now() - startTime,
        provider: 'shelly'
      };
    }
  }
}

/**
 * 3. Nuki Web API Provider
 */
export class NukiProvider implements ILockProvider {
  type: SmartLockProviderType = 'nuki';
  private config: SmartLockProviderSettings;

  constructor(config: SmartLockProviderSettings) {
    this.config = config;
  }

  async unlock(params: UnlockParams): Promise<LockProviderResult> {
    const startTime = Date.now();
    try {
      const apiToken = (this.config.nukiApiToken || '').trim();
      const smartlockId = (this.config.nukiSmartlockId || '').trim();

      if (!apiToken || !smartlockId) {
        return {
          success: false,
          error: 'Nuki API Token o Smartlock ID non configurati.',
          provider: 'nuki'
        };
      }

      // Nuki action: 1 = unlock, 3 = unlatch (open door latch for electric strikes)
      const targetUrl = `https://api.nuki.io/smartlock/${smartlockId}/action/unlock`;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ action: 3 }) // Unlatch
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        return {
          success: false,
          error: `Nuki API HTTP ${res.status}: ${errorText || res.statusText}`,
          latencyMs,
          provider: 'nuki'
        };
      }

      return {
        success: true,
        message: `Serratura Nuki sbloccata per ${params.guestName}.`,
        latencyMs,
        provider: 'nuki'
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Errore Nuki API: ${err.message}`,
        latencyMs: Date.now() - startTime,
        provider: 'nuki'
      };
    }
  }
}

/**
 * 4. Generic Webhook Provider
 */
export class GenericWebhookProvider implements ILockProvider {
  type: SmartLockProviderType = 'generic_webhook';
  private config: SmartLockProviderSettings;

  constructor(config: SmartLockProviderSettings) {
    this.config = config;
  }

  async unlock(params: UnlockParams): Promise<LockProviderResult> {
    const startTime = Date.now();
    try {
      const webhookUrl = (this.config.webhookUrl || '').trim();
      if (!webhookUrl) {
        return {
          success: false,
          error: 'URL Webhook non configurato.',
          provider: 'generic_webhook'
        };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (this.config.webhookSecret) {
        headers['X-Webhook-Secret'] = this.config.webhookSecret;
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'unlock',
          guestName: params.guestName,
          source: params.source,
          timestamp: new Date().toISOString()
        })
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        return {
          success: false,
          error: `Webhook ha risposto con codice HTTP ${res.status}`,
          latencyMs,
          provider: 'generic_webhook'
        };
      }

      return {
        success: true,
        message: `Comando inviato con successo al Webhook per ${params.guestName}.`,
        latencyMs,
        provider: 'generic_webhook'
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Errore chiamata Webhook: ${err.message}`,
        latencyMs: Date.now() - startTime,
        provider: 'generic_webhook'
      };
    }
  }
}

/**
 * Smart Lock Factory: creates the appropriate provider
 */
export function getSmartLockProvider(settings?: Partial<SmartLockProviderSettings>): ILockProvider {
  const providerType = settings?.provider || 'home_assistant';

  switch (providerType) {
    case 'shelly':
      return new ShellyProvider(settings as SmartLockProviderSettings);
    case 'nuki':
      return new NukiProvider(settings as SmartLockProviderSettings);
    case 'generic_webhook':
      return new GenericWebhookProvider(settings as SmartLockProviderSettings);
    case 'home_assistant':
    default:
      return new HomeAssistantProvider();
  }
}
