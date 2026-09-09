import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const SESSION_COOKIE = 'aurora_host_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

interface HostSession {
  email: string;
  expiresAt: number;
}

interface LoginBucket {
  failures: number;
  resetAt: number;
}

const sessions = new Map<string, HostSession>();
const loginBuckets = new Map<string, LoginBucket>();

function configuredEmail(): string {
  return (process.env.HOST_EMAIL || '').trim().toLowerCase();
}

function verifyPassword(password: string): boolean {
  const configuredPassword = process.env.HOST_PASSWORD || '';
  const configuredHash = process.env.HOST_PASSWORD_HASH || '';

  if (configuredHash) {
    const [salt, expected] = configuredHash.split(':');
    if (!salt || !expected) return false;
    const actual = crypto.scryptSync(password, salt, 64).toString('hex');
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
  }

  if (!configuredPassword || password.length !== configuredPassword.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(configuredPassword));
}

function clientKey(req: Request): string {
  return `${req.ip}:${(req.body?.email || '').toString().trim().toLowerCase()}`;
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(header.split(';').map(part => {
    const index = part.indexOf('=');
    return index === -1 ? [part.trim(), ''] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

export function loginHost(req: Request, res: Response): void {
  const email = (req.body?.email || '').toString().trim().toLowerCase();
  const password = (req.body?.password || '').toString();
  const key = clientKey(req);
  const now = Date.now();
  const bucket = loginBuckets.get(key);

  if (bucket && bucket.resetAt > now && bucket.failures >= MAX_LOGIN_ATTEMPTS) {
    res.status(429).json({ success: false, error: 'Troppi tentativi. Riprova più tardi.' });
    return;
  }
  if (!bucket || bucket.resetAt <= now) loginBuckets.set(key, { failures: 0, resetAt: now + LOGIN_WINDOW_MS });

  const valid = Boolean(configuredEmail()) && email === configuredEmail() && verifyPassword(password);
  if (!valid) {
    const current = loginBuckets.get(key)!;
    current.failures += 1;
    res.status(401).json({ success: false, error: 'Credenziali non valide.' });
    return;
  }

  loginBuckets.delete(key);
  const token = crypto.randomBytes(32).toString('base64url');
  sessions.set(token, { email, expiresAt: now + SESSION_TTL_MS });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
  res.json({ success: true, email, expiresAt: now + SESSION_TTL_MS });
}

export function logoutHost(req: Request, res: Response): void {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.json({ success: true });
}

export function getHostSession(req: Request): HostSession | null {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function requireHost(req: Request, res: Response, next: NextFunction): void {
  const session = getHostSession(req);
  if (!session) {
    res.status(401).json({ success: false, error: 'Autenticazione host richiesta.' });
    return;
  }
  (req as Request & { hostSession?: HostSession }).hostSession = session;
  next();
}

export function isHostConfigured(): boolean {
  return Boolean(configuredEmail() && (process.env.HOST_PASSWORD || process.env.HOST_PASSWORD_HASH));
}
