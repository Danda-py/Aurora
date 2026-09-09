import fs from 'fs';
import path from 'path';

/**
 * Returns the best readable file path.
 * Checks /tmp first (for runtime writes on Vercel), then project root.
 */
export function getReadFilePath(relativePath: string): string {
  const tmpPath = path.join('/tmp', relativePath);
  if (fs.existsSync(tmpPath)) {
    return tmpPath;
  }
  return path.join(process.cwd(), relativePath);
}

/**
 * Safely reads JSON from disk, checking /tmp first, then project root.
 */
export function safeReadJsonSync<T>(relativePath: string, fallback: T): T {
  try {
    const filePath = getReadFilePath(relativePath);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.warn(`[storageUtils] Error reading ${relativePath}:`, err);
  }
  return fallback;
}

/**
 * Safely writes content to disk, falling back to /tmp on read-only systems (like Vercel).
 */
export function safeWriteFileSync(relativePath: string, data: string | Buffer): boolean {
  // First attempt: project root
  try {
    const rootPath = path.join(process.cwd(), relativePath);
    const dir = path.dirname(rootPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(rootPath, data);
    return true;
  } catch (err) {
    // If EROFS or read-only filesystem (e.g. Vercel Serverless environment), fallback to /tmp
    try {
      const tmpPath = path.join('/tmp', relativePath);
      const tmpDir = path.dirname(tmpPath);
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      fs.writeFileSync(tmpPath, data);
      return true;
    } catch (tmpErr) {
      console.error(`[storageUtils] Failed to write to both root and /tmp for ${relativePath}:`, tmpErr);
      return false;
    }
  }
}
