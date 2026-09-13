import type express from 'express';

export function extractClientIps(req: express.Request): string[] {
  const forwarded = req.headers['x-forwarded-for'];
  const ips: string[] = [];
  if (typeof forwarded === 'string') {
    ips.push(...forwarded.split(',').map(s => s.trim()));
  } else if (Array.isArray(forwarded)) {
    ips.push(...forwarded.map(s => s.trim()));
  }
  if (typeof req.headers['x-real-ip'] === 'string') {
    ips.push(req.headers['x-real-ip'].trim());
  }
  if (typeof req.headers['cf-connecting-ip'] === 'string') {
    ips.push(req.headers['cf-connecting-ip'].trim());
  }
  if (req.socket.remoteAddress) {
    ips.push(req.socket.remoteAddress.trim());
  }
  return ips.map(ip => ip.replace(/^::ffff:/, '')).filter(Boolean);
}
