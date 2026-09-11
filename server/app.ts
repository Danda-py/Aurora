import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { 
  parseBedAndBreakfastBooking, 
  generateRandomPin, 
  formatInvitationMessage 
} from '../src/services/guestPassService.js';
import { GuestPass } from '../src/types.js';
import {
  getHomeAssistantConfig,
  updateHomeAssistantConfig,
  updateHomeAssistantConfigAsync,
  hydrateHomeAssistantConfig,
  triggerHomeAssistantOn
} from './homeAssistantService.js';
import {
  getCmsData,
  getCmsDataAsync,
  saveCmsData,
  saveCmsDataAsync,
  updateCmsSection,
  resetCmsData,
  getCmsMedia,
  getCmsMediaAsync,
  saveUploadedPhoto,
  resetCmsPhoto,
  saveCmsMedia,
  saveCmsMediaAsync
} from './cmsService.js';
import { safeReadJsonSync, safeWriteFileSync, getReadFilePath } from './storageUtils.js';
import { getHostSession, isHostConfigured, loginHost, logoutHost, requireHost } from './hostAuthService.js';
import { deletePass as deleteSupabasePass, isSupabaseConfigured, loadPasses, upsertPass } from './supabaseStorage.js';

const PASSES_REL_PATH = path.join('data', 'passes.json');

const defaultPasses: GuestPass[] = [
  {
    id: 'pass-demo-vip',
    guestName: 'Marco',
    guestSurname: 'Rossi',
    phone: '+39 340 123 4567',
    checkInDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    checkInTime: '15:00',
    checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    checkOutTime: '10:00',
    pinCode: '2741',
    bookingRef: 'BB-67807',
    guestsCount: 2,
    bookingSource: 'bed-and-breakfast.it',
    notes: 'Arrivo in treno da Milano Centrale',
    createdAt: new Date().toISOString(),
    active: true,
    token: 'eyJndWVzdE5hbWUiOiJNYXJjbyIsImd1ZXN0U3VybmFtZSI6IlJvc3NpIiwicGluQ29kZSI6IjI3NDEifQ=='
  }
];

// Persistent list of passes on server
const serverPasses: GuestPass[] = safeReadJsonSync<GuestPass[]>(PASSES_REL_PATH, defaultPasses);

let passesHydration: Promise<void> | null = null;

async function hydratePassesFromSupabase() {
  if (passesHydration) return passesHydration;
  passesHydration = (async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const remotePasses = await loadPasses();
      if (remotePasses) {
        serverPasses.splice(0, serverPasses.length, ...remotePasses);
      }
    } catch (error) {
      passesHydration = null;
      console.error('Supabase passes load failed; keeping local fallback:', error);
    }
  })();
  return passesHydration;
}

function persistPasses() {
  safeWriteFileSync(PASSES_REL_PATH, JSON.stringify(serverPasses, null, 2));
}

function isPassCurrentlyValid(pass: GuestPass): boolean {
  if (!pass.active) return false;
  const today = new Date().toISOString().split('T')[0];
  return Boolean(pass.checkInDate && pass.checkOutDate && pass.checkInDate <= today && pass.checkOutDate >= today);
}

function findValidGuestPass(token: string | undefined): GuestPass | null {
  if (!token) return null;
  const pass = serverPasses.find(item => item.token === token);
  return pass && isPassCurrentlyValid(pass) ? pass : null;
}

interface HassLog {
  timestamp: string;
  guest: string;
  detail: string;
}

// Home Assistant Switch & Door Opener State
const hassDoorState = {
  lastTriggeredAt: new Date().toISOString(),
  guestName: 'Marco Rossi',
  status: 'ready' as 'ready' | 'active' | 'error',
  device: 'Home Assistant (Pulsante Portone)',
  currentActivePin: '2741',
  logs: [
    {
      timestamp: new Date().toISOString(),
      guest: 'Marco Rossi',
      detail: 'Pulsante apriporta Home Assistant pronto per comando ON'
    }
  ] as HassLog[]
};

/**
 * Sends an ON impulse to Home Assistant
 */
async function sendHomeAssistantOnInput(guest: string = 'Host', source: string = 'Manuale', wifiConnected: boolean = true) {
  hassDoorState.lastTriggeredAt = new Date().toISOString();
  hassDoorState.guestName = guest;
  
  const result = await triggerHomeAssistantOn({ guestName: guest, source, wifiConnected });
  
  if (result.success) {
    hassDoorState.status = 'ready';
    hassDoorState.logs.unshift({
      timestamp: new Date().toISOString(),
      guest,
      detail: `Input ON inviato a Home Assistant [${source}]: ${result.message}`
    });
  } else {
    hassDoorState.status = 'error';
    hassDoorState.logs.unshift({
      timestamp: new Date().toISOString(),
      guest,
      detail: `Errore comando ON Home Assistant: ${result.error}`
    });
  }

  if (hassDoorState.logs.length > 25) {
    hassDoorState.logs.pop();
  }

  return result;
}

export function createApp() {
  const app = express();

  void hydratePassesFromSupabase();
  void hydrateHomeAssistantConfig();

  // Middlewares for JSON and form-urlencoded webhooks (up to 25mb for high-res photo uploads)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Same-origin by default. External booking systems use the authenticated webhook secret.
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Booking-Webhook-Secret, X-Guest-Token');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Serve permanent uploads directory directly (/uploads/*)
  const uploadsStaticPath = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsStaticPath)) {
    try {
      fs.mkdirSync(uploadsStaticPath, { recursive: true });
    } catch {}
  }
  app.use('/uploads', express.static(uploadsStaticPath));

  // Serve standalone Host Portal static site directly
  const hostPortalStaticPath = path.join(process.cwd(), 'public', 'host-portal');
  app.use('/host-portal', express.static(hostPortalStaticPath));

  // Create API router for modular routing
  const apiRouter = express.Router();

  apiRouter.use(async (req, res, next) => {
    await hydratePassesFromSupabase();
    if (req.path === '/health' || req.path === '/wifi/verify' || req.path.startsWith('/auth/') || req.path === '/guest/pass') {
      next();
      return;
    }
    if (req.method === 'GET' && (req.path === '/cms/content' || req.path === '/cms/media')) {
      const guestToken = req.get('x-guest-token') || (typeof req.query.guestToken === 'string' ? req.query.guestToken : undefined);
      if (findValidGuestPass(guestToken)) {
        next();
        return;
      }
    }
    if (req.path === '/webhook/booking') {
      if (req.method === 'GET') {
        next();
        return;
      }
      const expected = process.env.BOOKING_WEBHOOK_SECRET || '';
      const hostSession = getHostSession(req);
      const hasWebhookSecret = Boolean(expected && req.get('x-booking-webhook-secret') === expected);
      if (!hostSession && !hasWebhookSecret) {
        res.status(401).json({ success: false, error: 'Webhook non autorizzato.' });
        return;
      }
      next();
      return;
    }
    if (req.path === '/hass/unlock' || req.path === '/ewelink/unlock') {
      const session = getHostSession(req);
      const guestToken = req.get('x-guest-token') || req.body?.guestToken;
      if (session || findValidGuestPass(guestToken)) {
        next();
        return;
      }
      res.status(401).json({ success: false, error: 'Link guest valido o autenticazione host richiesta.' });
      return;
    }
    requireHost(req, res, next);
  });

  apiRouter.post('/auth/login', loginHost);
  apiRouter.post('/auth/logout', logoutHost);
  apiRouter.get('/auth/me', (req, res) => {
    const session = getHostSession(req);
    res.json({ authenticated: Boolean(session), email: session?.email || null, configured: isHostConfigured() });
  });

  apiRouter.get('/guest/pass', (req, res) => {
    const pass = findValidGuestPass(typeof req.query.token === 'string' ? req.query.token : undefined);
    if (!pass) {
      res.status(404).json({ success: false, error: 'Link ospite non valido o scaduto.' });
      return;
    }
    res.json({ success: true, pass });
  });

  // Health check
  apiRouter.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Aurora Valtellina Home Assistant Door Opener Engine',
      hassStatus: hassDoorState.status,
      hassDevice: hassDoorState.device
    });
  });

  // Keypad & Home Assistant Switch Status
  apiRouter.get('/keypad/status', (_req, res) => {
    res.json({
      status: hassDoorState.status,
      device: hassDoorState.device,
      currentActivePin: hassDoorState.currentActivePin,
      lastTriggeredAt: hassDoorState.lastTriggeredAt,
      guestName: hassDoorState.guestName,
      logs: hassDoorState.logs
    });
  });

  // Door Unlock Handler
  const handleDoorUnlock = async (req: express.Request, res: express.Response) => {
    try {
      const { guestName, guest, source, wifiConnected, wifiSsid } = req.body || {};
      const actualGuest = guestName || guest || 'Ospite Aurora';
      const actualSource = source || 'Pannello Host';
      
      const result = await sendHomeAssistantOnInput(
        actualGuest, 
        actualSource, 
        wifiConnected !== undefined ? Boolean(wifiConnected) : true
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Portone sbloccato. Spingi la porta per entrare.',
          timestamp: new Date().toISOString()
        });
      } else {
        const isWifiBlocked = (result as any).wifiBlocked;
        res.status(isWifiBlocked ? 403 : 500).json({
          success: false,
          error: result.error,
          wifiBlocked: isWifiBlocked
        });
      }
    } catch (err: any) {
      console.error('Error handling door unlock:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Errore interno del server'
      });
    }
  };

  apiRouter.post('/hass/unlock', handleDoorUnlock);
  apiRouter.post('/ewelink/unlock', handleDoorUnlock);

  // Wi-Fi Status
  apiRouter.get('/wifi/status', (req, res) => {
    const config = getHomeAssistantConfig();
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '';
    const isLocal = clientIp.startsWith('192.168.') || clientIp.startsWith('10.') || clientIp.startsWith('127.') || clientIp === '::1';
    const matchesHomePublicIp = Boolean(config.homePublicIp && clientIp === config.homePublicIp);

    res.json({
      configuredSsid: config.wifiSsidRequired || 'Casa_Aurora',
      clientIp,
      homePublicIp: config.homePublicIp || 'Non configurato',
      isLocalLan: isLocal,
      isHomePublicIp: matchesHomePublicIp,
      verified: isLocal || matchesHomePublicIp
    });
  });

  // Wi-Fi Verify
  apiRouter.post('/wifi/verify', (req, res) => {
    const config = getHomeAssistantConfig();
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '';
    const isMatchIp = Boolean(config.homePublicIp && clientIp === config.homePublicIp);
    const verified = isMatchIp;

    res.json({
      verified,
      reason: verified 
        ? 'Connessione a Casa_Aurora verificata con successo' 
        : config.homePublicIp
          ? 'Dispositivo non connesso alla rete Wi-Fi dell\'appartamento (Casa_Aurora)'
          : 'Verifica Wi-Fi non configurata: l\'host deve registrare l\'IP pubblico di Casa_Aurora.',
      details: {
        ssidExpected: config.wifiSsidRequired || 'Casa_Aurora',
        matchedByPublicIp: isMatchIp
      }
    });
  });

  // Set Home IP
  apiRouter.post('/wifi/set-home-ip', async (req, res) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || '';
    const { ip } = req.body || {};
    const targetIp = ip || clientIp;

    if (!targetIp) {
      res.status(400).json({ success: false, error: 'Impossibile rilevare indirizzo IP' });
      return;
    }

    await updateHomeAssistantConfigAsync({ homePublicIp: targetIp });
    res.json({
      success: true,
      message: `IP pubblico di Casa_Aurora impostato a: ${targetIp}`,
      homePublicIp: targetIp
    });
  });

  // CMS Endpoints
  apiRouter.get('/cms/content', async (_req, res) => {
    try {
      const data = await getCmsDataAsync();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/save', async (req, res) => {
    try {
      const { data } = req.body;
      if (!data) {
        res.status(400).json({ success: false, error: 'Dati mancanti' });
        return;
      }
      await saveCmsDataAsync(data);
      res.json({ success: true, message: 'Dati CMS salvati con successo', data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/section', async (req, res) => {
    try {
      const { language, section, content } = req.body;
      if (!language || !section || !content) {
        res.status(400).json({ success: false, error: 'Campi obbligatori mancanti: language, section, content' });
        return;
      }
      const current = await getCmsDataAsync();
      if (!current[language]) current[language] = {};
      current[language][section] = { ...(current[language][section] || {}), ...content };
      await saveCmsDataAsync(current);
      const updated = current;
      res.json({ success: true, message: `Sezione ${section} aggiornata`, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/reset', async (_req, res) => {
    try {
      const defaults = resetCmsData();
      await saveCmsDataAsync(defaults);
      res.json({ success: true, message: 'CMS ripristinato ai valori predefiniti', data: defaults });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.get('/cms/media', async (_req, res) => {
    try {
      const media = await getCmsMediaAsync();
      res.json({ success: true, media });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/upload-photo', async (req, res) => {
    try {
      const { photoKey, filename, base64DataUrl } = req.body;
      if (!photoKey || !base64DataUrl) {
        res.status(400).json({ success: false, error: 'photoKey e base64DataUrl sono obbligatori' });
        return;
      }
      const result = saveUploadedPhoto(photoKey, filename || 'photo.jpg', base64DataUrl);
      if (result.success) {
        if (result.media) await saveCmsMediaAsync(result.media);
        res.json({ success: true, url: result.url, media: result.media });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/save-media-url', async (req, res) => {
    try {
      const { photoKey, url } = req.body;
      if (!photoKey || !url) {
        res.status(400).json({ success: false, error: 'photoKey e url sono obbligatori' });
        return;
      }
      const media = await getCmsMediaAsync();
      media[photoKey] = url;
      await saveCmsMediaAsync(media);
      res.json({ success: true, media });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/cms/reset-photo', async (req, res) => {
    try {
      const { photoKey } = req.body;
      if (!photoKey) {
        res.status(400).json({ success: false, error: 'photoKey obbligatoria' });
        return;
      }
      const result = resetCmsPhoto(photoKey);
      await saveCmsMediaAsync(result);
      res.json({ success: true, media: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Parser & Config Endpoints
  apiRouter.post('/parse-booking', (req, res) => {
    const rawText = req.body?.rawText || req.body?.text || req.body?.body || '';
    if (!rawText || typeof rawText !== 'string') {
      res.status(400).json({ success: false, error: 'Nessun testo fornito' });
      return;
    }
    const parsed = parseBedAndBreakfastBooking(rawText);
    res.json({ success: true, parsed });
  });

  apiRouter.get('/hass/config', async (req, res) => {
    await hydrateHomeAssistantConfig();
    const config = getHomeAssistantConfig();
    const token = config.accessToken;
    const maskedToken = token ? `${token.slice(0, 4)}••••••••${token.slice(-4)}` : '';
    res.json({
      mode: config.mode,
      webhookUrl: config.webhookUrl,
      haUrl: config.haUrl,
      accessToken: maskedToken,
      hasToken: Boolean(token),
      entityId: config.entityId,
      service: config.service,
      deviceName: config.deviceName,
      wifiSsidRequired: config.wifiSsidRequired,
      homePublicIp: config.homePublicIp,
      lanGatewayIp: config.lanGatewayIp,
      localWebhookUrl: config.localWebhookUrl,
      enabled: config.enabled,
      status: hassDoorState.status
    });
  });

  apiRouter.get('/ewelink/config', (_req, res) => {
    const config = getHomeAssistantConfig();
    res.json({
      webhookUrl: config.webhookUrl,
      haUrl: config.haUrl,
      entityId: config.entityId,
      deviceName: config.deviceName,
      enabled: config.enabled,
      status: hassDoorState.status
    });
  });

  apiRouter.post('/hass/config', async (req, res) => {
    const { mode, webhookUrl, haUrl, accessToken, entityId, service, deviceName, wifiSsidRequired, homePublicIp, lanGatewayIp, localWebhookUrl, enabled } = req.body;
    const currentConfig = getHomeAssistantConfig();
    
    let resolvedToken = currentConfig.accessToken;
    if (accessToken && !accessToken.includes('••••')) {
      resolvedToken = accessToken.trim();
    }

    const updated = await updateHomeAssistantConfigAsync({
      ...(mode && { mode }),
      ...(webhookUrl !== undefined && { webhookUrl }),
      ...(haUrl !== undefined && { haUrl }),
      ...(resolvedToken !== undefined && { accessToken: resolvedToken }),
      ...(entityId && { entityId }),
      ...(service && { service }),
      ...(deviceName && { deviceName }),
      ...(wifiSsidRequired !== undefined && { wifiSsidRequired }),
      ...(homePublicIp !== undefined && { homePublicIp }),
      ...(lanGatewayIp !== undefined && { lanGatewayIp }),
      ...(localWebhookUrl !== undefined && { localWebhookUrl }),
      ...(enabled !== undefined && { enabled })
    });

    hassDoorState.status = 'ready';
    hassDoorState.device = updated.deviceName || 'Home Assistant (Pulsante Portone)';

    res.json({
      success: true,
      message: 'Configurazione Home Assistant aggiornata con successo',
      config: {
        mode: updated.mode,
        webhookUrl: updated.webhookUrl,
        haUrl: updated.haUrl,
        hasToken: Boolean(updated.accessToken),
        entityId: updated.entityId,
        service: updated.service,
        deviceName: updated.deviceName,
        wifiSsidRequired: updated.wifiSsidRequired,
        homePublicIp: updated.homePublicIp,
        lanGatewayIp: updated.lanGatewayIp,
        localWebhookUrl: updated.localWebhookUrl,
        enabled: updated.enabled
      }
    });
  });

  apiRouter.post('/ewelink/config', async (req, res) => {
    const { webhookUrl, entityId, deviceName, enabled } = req.body;
    const updated = await updateHomeAssistantConfigAsync({
      ...(webhookUrl !== undefined && { webhookUrl }),
      ...(entityId && { entityId }),
      ...(deviceName && { deviceName }),
      ...(enabled !== undefined && { enabled })
    });

    hassDoorState.status = 'ready';
    hassDoorState.device = updated.deviceName || 'Home Assistant (Pulsante Portone)';

    res.json({
      success: true,
      message: 'Configurazione aggiornata',
      config: updated
    });
  });

  apiRouter.post('/hass/test', async (req, res) => {
    try {
      const result = await sendHomeAssistantOnInput('Test Configurazione', 'Test Manuale Portale Host');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.post('/ewelink/test', async (req, res) => {
    try {
      const result = await sendHomeAssistantOnInput('Test Configurazione', 'Test Compatibilità EWeLink');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Webhook Booking Receiver
  apiRouter.post('/webhook/booking', async (req, res) => {
    try {
      const payload = req.body;
      const isStructuredPayload = payload && typeof payload === 'object' && !Array.isArray(payload);
      const rawText = typeof payload === 'string'
        ? payload
        : (payload.text || payload.body || payload.message || '');
      
      const parsed = isStructuredPayload && !rawText
        ? { guestName: '', guestSurname: '', checkInDate: '', checkOutDate: '', phone: '', bookingRef: '', guestsCount: 2, bookingSource: '' }
        : parseBedAndBreakfastBooking(rawText);

      const guestName = (isStructuredPayload ? payload.guestName || payload.name : parsed.guestName) || '';
      const guestSurname = (isStructuredPayload ? payload.guestSurname || payload.surname : parsed.guestSurname) || '';
      const checkInDate = (isStructuredPayload ? payload.checkInDate || payload.checkIn : parsed.checkInDate) || '';
      const checkOutDate = (isStructuredPayload ? payload.checkOutDate || payload.checkOut : parsed.checkOutDate) || '';
      const phone = (isStructuredPayload ? payload.phone || payload.tel : parsed.phone) || '';
      const bookingRef = (isStructuredPayload ? payload.bookingRef || payload.ref : parsed.bookingRef) || `BB-${Math.floor(10000 + Math.random() * 90000)}`;
      const guestsCount = (isStructuredPayload ? payload.guestsCount : parsed.guestsCount) || 2;
      const bookingSource = (isStructuredPayload ? payload.bookingSource : parsed.bookingSource) || 'bed-and-breakfast.it (webhook)';
      const pinCode = generateRandomPin();

      if (!guestName || !checkInDate || !checkOutDate) {
        res.status(400).json({
          success: false,
          error: 'Prenotazione incompleta: servono nome ospite, data check-in e data check-out.'
        });
        return;
      }

      const newPass: GuestPass = {
        id: `pass-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        guestName,
        guestSurname,
        checkInDate,
        checkInTime: '15:00',
        checkOutDate,
        checkOutTime: '10:00',
        phone,
        pinCode,
        bookingRef,
        guestsCount,
        bookingSource,
        notes: (parsed as any).notes || `Ricevuto autonomamente via webhook`,
        createdAt: new Date().toISOString(),
        active: true,
        token: ''
      };

      const token = crypto.randomBytes(32).toString('base64url');
      newPass.token = token;

      serverPasses.unshift(newPass);
      persistPasses();
      await upsertPass(newPass);

      const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
      const guestUrl = `${origin}/?pass=${token}`;
      const whatsappMessage = formatInvitationMessage(newPass, origin);
      const whatsappUrl = phone ? `https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : null;

      res.status(201).json({
        success: true,
        message: 'Pass VIP generato autonomamente con successo!',
        pass: newPass,
        token,
        link: guestUrl,
        guestUrl,
        whatsappUrl,
        whatsappMessage,
        links: {
          guestDirectUrl: guestUrl,
          whatsappInvitationText: whatsappMessage,
          whatsappDirectLink: whatsappUrl
        }
      });
    } catch (err: any) {
      console.error('Webhook error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  apiRouter.get('/webhook/booking', (req, res) => {
    res.json({
      status: 'active',
      description: 'Webhook autonomo per ricevere notifiche di prenotazione da Bed-and-Breakfast.it, Zapier o Make',
      method: 'POST',
      acceptedFormats: ['application/json', 'application/x-www-form-urlencoded', 'text/plain'],
      expectedFields: {
        rawText: 'Testo dell\'email o della notifica di prenotazione (es. Ospite: Mario Rossi, Check-in: 15/09/2026, ...)',
        guestName: 'Opzionale (se già estratto)',
        guestSurname: 'Opzionale',
        checkInDate: 'Opzionale (YYYY-MM-DD)',
        checkOutDate: 'Opzionale (YYYY-MM-DD)',
        phone: 'Opzionale (+39...)',
        bookingRef: 'Opzionale (Es. BB-12345)'
      },
      exampleCurl: `curl -X POST https://${req.get('host')}/api/webhook/booking -H "Content-Type: application/json" -d '{"rawText": "Nuova prenotazione per Mario Rossi dal 15/09/2026 al 18/09/2026 tel: +39 340 1234567"}'`
    });
  });

  // Generate Link
  apiRouter.all('/generate-link', async (req, res) => {
    try {
      const data = req.method === 'POST' ? req.body : req.query;
      const {
        guestName,
        guestSurname = '',
        checkInDate,
        checkInTime = '15:00',
        checkOutDate,
        checkOutTime = '10:00',
        phone = '',
        pinCode = generateRandomPin(),
        bookingRef = `DIR-${Math.floor(1000 + Math.random() * 9000)}`,
        guestsCount = 2,
        bookingSource = 'Pannello Host'
      } = data;

      if (!guestName || !checkInDate || !checkOutDate) {
        res.status(400).json({ 
          error: 'Campi obbligatori mancanti: guestName, checkInDate, checkOutDate' 
        });
        return;
      }

      const newPass: GuestPass = {
        id: `pass-${Date.now()}`,
        guestName,
        guestSurname,
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime,
        phone,
        pinCode,
        bookingRef,
        guestsCount: Number(guestsCount) || 2,
        bookingSource,
        createdAt: new Date().toISOString(),
        active: true,
        token: ''
      };

      const token = crypto.randomBytes(32).toString('base64url');
      newPass.token = token;

      serverPasses.unshift(newPass);
      persistPasses();
      await upsertPass(newPass);

      const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
      const guestUrl = `${origin}/?pass=${token}`;
      const whatsappMessage = formatInvitationMessage(newPass, origin);
      const whatsappLink = phone ? `https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : null;

      res.json({
        success: true,
        pass: newPass,
        token,
        link: guestUrl,
        guestUrl,
        whatsappUrl: whatsappLink,
        whatsappMessage,
        whatsappLink
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Passes List & Delete
  apiRouter.get('/passes', (_req, res) => {
    res.json({
      success: true,
      passes: serverPasses
    });
  });

  apiRouter.delete('/passes/:id', async (req, res) => {
    const id = req.params.id;
    const index = serverPasses.findIndex(p => p.id === id);
    if (index !== -1) {
      const removed = serverPasses.splice(index, 1)[0];
      persistPasses();
      await deleteSupabasePass(id);
      hassDoorState.logs.unshift({
        timestamp: new Date().toISOString(),
        guest: `${removed.guestName} ${removed.guestSurname}`.trim(),
        detail: `Pass revocato ed eliminato dal sistema`
      });
      res.json({ success: true, message: 'Pass eliminato con successo' });
    } else {
      res.status(404).json({ success: false, error: 'Pass non trovato' });
    }
  });

  // Download Standalone Host Portal .ZIP
  apiRouter.get('/download-host-portal-zip', async (_req, res) => {
    try {
      const zip = new JSZip();
      const portalDir = path.join(process.cwd(), 'public', 'host-portal');

      if (fs.existsSync(portalDir)) {
        const files = fs.readdirSync(portalDir);
        for (const file of files) {
          const filePath = path.join(portalDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            const content = fs.readFileSync(filePath);
            zip.file(file, content);
          }
        }
      }

      const zipBuffer = await zip.generateAsync({ 
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="aurora-host-portal.zip"');
      res.send(zipBuffer);
    } catch (err: any) {
      console.error('Error creating host portal zip:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mount API router on both /api and root / so it resolves properly in both local Express and Vercel Serverless
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  return app;
}

const app = createApp();
export default app;
