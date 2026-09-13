import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { safeReadJsonSync, safeWriteFileSync } from './storageUtils.js';

const SESSION_COOKIE = 'aurora_host_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const HOST_ACCOUNT_PATH = 'data/host_account.json';

interface HostSession {
  email: string;
  expiresAt: number;
}

interface LoginBucket {
  failures: number;
  resetAt: number;
}

interface StoredHostAccount {
  email: string;
  passwordHash: string;
  createdAt: string;
}

const loginBuckets = new Map<string, LoginBucket>();

function storedAccount(): StoredHostAccount | null {
  const account = safeReadJsonSync<StoredHostAccount | null>(HOST_ACCOUNT_PATH, null);
  return account?.email && account?.passwordHash ? account : null;
}

function configuredEmail(): string {
  return (process.env.HOST_EMAIL || storedAccount()?.email || '').trim().toLowerCase();
}

function configuredPasswordHash(): string {
  return process.env.HOST_PASSWORD_HASH || process.env.HOST_PASSWORD || storedAccount()?.passwordHash || '';
}

function verifyScryptHash(password: string, hash: string): boolean {
  const [salt, expected] = hash.split(':');
  if (!salt || !expected || expected.length !== 128) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

function verifyPassword(password: string): boolean {
  const configuredPassword = process.env.HOST_PASSWORD || '';
  const configuredHash = configuredPasswordHash();

  if (configuredHash && configuredHash !== 'salt:scrypt-hash-hex' && configuredHash.includes(':')) {
    return verifyScryptHash(password, configuredHash);
  }

  if (configuredPassword && configuredPassword.includes(':')) {
    const [salt, expected] = configuredPassword.split(':');
    if (salt && expected && expected.length === 128) {
      const actual = crypto.scryptSync(password, salt, 64).toString('hex');
      if (crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'))) return true;
    }
  }

  if (configuredPassword && configuredPassword !== 'salt:scrypt-hash-hex' && password.length === configuredPassword.length) {
    if (crypto.timingSafeEqual(Buffer.from(password), Buffer.from(configuredPassword))) return true;
  }

  return false;
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

function sessionSecret(): string {
  return process.env.HOST_SESSION_SECRET || configuredPasswordHash() || 'aurora-host-session';
}

function signSession(payload: string): string {
  return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function createSession(email: string, expiresAt: number): string {
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString('base64url');
  return `${payload}.${signSession(payload)}`;
}

function readSession(token: string | undefined): HostSession | null {
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return null;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = signSession(payload);
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as HostSession;
    if (!session.email || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function loginHost(req: Request, res: Response): void {
  const email = (req.body?.email || '').toString().trim().toLowerCase();
  const password = (req.body?.password || '').toString();
  const key = clientKey(req);
  const now = Date.now();
  const bucket = loginBuckets.get(key);

  if (bucket && bucket.resetAt > now && bucket.failures >= MAX_LOGIN_ATTEMPTS && process.env.NODE_ENV === 'production') {
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
  const userEmail = email || configuredEmail() || 'antonino.andaloro@gmail.com';
  const token = createSession(userEmail, now + SESSION_TTL_MS);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
  res.json({ success: true, email: userEmail, expiresAt: now + SESSION_TTL_MS });
}

export function logoutHost(req: Request, res: Response): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.json({ success: true });
}

export function getHostSession(req: Request): HostSession | null {
  const session = readSession(parseCookies(req.headers.cookie)[SESSION_COOKIE]);
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
  return Boolean(configuredEmail() && configuredPasswordHash());
}

export function hostRegistrationOpen(): boolean {
  return !isHostConfigured();
}

export function bootstrapHost(req: Request, res: Response): void {
  if (!hostRegistrationOpen()) {
    res.status(403).json({ success: false, error: 'L’account host è già stato creato. La registrazione è chiusa.' });
    return;
  }

  const email = (req.body?.email || '').toString().trim().toLowerCase();
  const password = (req.body?.password || '').toString();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    res.status(400).json({ success: false, error: 'Inserisci un indirizzo email valido.' });
    return;
  }
  if (password.length < 12 || password.length > 256) {
    res.status(400).json({ success: false, error: 'La password deve contenere da 12 a 256 caratteri.' });
    return;
  }

  // Use one salt consistently for the stored representation.
  const salt = crypto.randomBytes(16).toString('hex');
  const account: StoredHostAccount = {
    email,
    passwordHash: `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`,
    createdAt: new Date().toISOString()
  };
  if (!safeWriteFileSync(HOST_ACCOUNT_PATH, JSON.stringify(account, null, 2))) {
    res.status(500).json({ success: false, error: 'Impossibile salvare l’account host.' });
    return;
  }
  loginHost({ ...req, body: { email, password } } as Request, res);
}
