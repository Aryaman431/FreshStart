import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'fs_admin_session';

// ── Simple token helpers (Edge-runtime safe — no Buffer/crypto) ───────────────

function toBase64(str: string): string {
  if (typeof btoa !== 'undefined') return btoa(unescape(encodeURIComponent(str)));
  // Node fallback (server components)
  return Buffer.from(str, 'utf8').toString('base64');
}

function fromBase64(str: string): string {
  try {
    if (typeof atob !== 'undefined') return decodeURIComponent(escape(atob(str)));
    return Buffer.from(str, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function pseudoSign(payload: string, secret: string): string {
  let h = 0x811c9dc5;
  const combined = payload + ':' + secret;
  for (let i = 0; i < combined.length; i++) {
    h ^= combined.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function buildToken(username: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'fallback_secret_change_me';
  const payload = `${username}:${Date.now()}`;
  const sig = pseudoSign(payload, secret);
  return toBase64(`${payload}:${sig}`);
}

function verifyToken(token: string): boolean {
  try {
    const decoded = fromBase64(token);
    if (!decoded) return false;

    const lastColon = decoded.lastIndexOf(':');
    if (lastColon === -1) return false;

    const payload = decoded.slice(0, lastColon);
    const sig     = decoded.slice(lastColon + 1);

    const secret = process.env.ADMIN_SESSION_SECRET ?? 'fallback_secret_change_me';
    const expected = pseudoSign(payload, secret);
    if (sig !== expected) return false;

    // Check expiry — 24 hours
    const parts = payload.split(':');
    const ts = parseInt(parts[parts.length - 1], 10);
    if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

/** Server component / Route handler: read cookie from next/headers */
export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token);
}

/** Middleware: read cookie from NextRequest (Edge-safe) */
export function isAdminAuthenticatedFromRequest(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token);
}

/** Validate credentials and return a signed token, or null on failure */
export function createAdminToken(username: string, password: string): string | null {
  const validUser = process.env.ADMIN_USERNAME ?? 'freshstartadmin';
  const validPass = process.env.ADMIN_PASSWORD ?? '';
  if (!validPass) return null; // refuse if env not set
  if (username !== validUser || password !== validPass) return null;
  return buildToken(username);
}
