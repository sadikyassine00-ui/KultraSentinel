import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'kultra_admin_session';
const DEFAULT_SECRET = 'kultra-sentinel-fallback-secret-key-32-chars-min!';

function generateSessionId(): string {
  if (typeof globalThis !== 'undefined' && typeof globalThis.crypto?.randomUUID === 'function') {
    return `ses_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
  }
  const bytes = new Uint8Array(16);
  if (typeof globalThis !== 'undefined' && typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return `ses_${Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  email: string;
  role: 'admin' | 'user' | string;
  name?: string | null;
  id?: string | number | null;
  sid?: string;
  isSuperAdmin?: boolean;
  isSuspended?: boolean;
}

export interface SessionMetadata {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const SUPERADMIN_EMAILS: string[] = [
  'yassinesadik0@gmail.com',
];

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPERADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export const ALLOWED_ADMIN_EMAILS: string[] = [
  'support@usekultra.com',
  'yassinesadik0@gmail.com',
];

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return ALLOWED_ADMIN_EMAILS.includes(clean) || isSuperAdminEmail(clean);
}

export async function createSessionToken(
  payload: SessionPayload,
  metadata?: SessionMetadata
): Promise<string> {
  const secret = getJwtSecret();
  const email = payload.email.toLowerCase().trim();
  const isSuper = isSuperAdminEmail(email);
  const role = (isSuper || isAllowedAdminEmail(email)) ? 'admin' : (payload.role === 'admin' ? 'admin' : 'user');
  const sid = payload.sid || generateSessionId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Persist session to server-side session tracking table in Node runtime
  if (process.env.NEXT_RUNTIME !== 'edge') {
    try {
      const { createDbSession } = await import('./db');
      await createDbSession({
        sessionId: sid,
        userId: payload.id ? Number(payload.id) : null,
        email,
        ipAddress: metadata?.ipAddress || null,
        userAgent: metadata?.userAgent || null,
        expiresAt,
      });
    } catch (err) {
      console.warn('[Session] Failed to persist session to DB:', err);
    }
  }

  return new SignJWT({
    ...payload,
    email,
    role,
    isSuperAdmin: isSuper,
    sid,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    if (!payload.email) return null;
    const email = (payload.email as string).toLowerCase().trim();
    const isSuper = isSuperAdminEmail(email);
    const rawRole = (payload.role as string) || '';
    const role = (isSuper || isAllowedAdminEmail(email)) ? 'admin' : (rawRole === 'admin' ? 'admin' : 'user');
    const sid = (payload.sid as string) || undefined;

    // Check server-side revocation and suspension status if running in Node runtime
    let isSuspendedUser = Boolean(payload.isSuspended);
    if (process.env.NEXT_RUNTIME !== 'edge') {
      try {
        const { isSessionRevoked, isTenantSuspended } = await import('./db');
        isSuspendedUser = await isTenantSuspended(email);
        if (sid) {
          const revoked = await isSessionRevoked(sid);
          // If revoked for normal logout reasons and user is not suspended, invalidate
          if (revoked && !isSuspendedUser) {
            return null;
          }
        }
      } catch {
        // Fall back to cryptographic JWT validity if DB is not reachable
      }
    }

    return {
      email,
      role,
      isSuperAdmin: isSuper,
      name: (payload.name as string) || null,
      id: (payload.id as string | number) || null,
      sid,
      isSuspended: isSuspendedUser,
    };
  } catch {
    return null;
  }
}

export function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function isSecureContext(request?: Request): boolean {
  if (typeof window !== 'undefined') {
    return window.location.protocol === 'https:';
  }
  if (request) {
    try {
      const url = new URL(request.url);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return false;
      }
      const forwardedProto = request.headers.get('x-forwarded-proto');
      if (forwardedProto) {
        return forwardedProto === 'https';
      }
      return url.protocol === 'https:';
    } catch {
      // Fall through
    }
  }
  return process.env.NODE_ENV === 'production' && !!process.env.NEXTAUTH_URL?.startsWith('https://');
}

export function getSessionCookieOptions(maxAgeSeconds: number = 60 * 60 * 24 * 7, request?: Request) {
  const isSecure = isSecureContext(request);
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isSecure,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

export function getSessionCookieHeader(token: string, maxAgeSeconds: number = 60 * 60 * 24 * 7, request?: Request): string {
  const isSecure = isSecureContext(request);
  const secure = isSecure ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function getClearSessionCookieHeader(request?: Request): string {
  const isSecure = isSecureContext(request);
  const secure = isSecure ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

/**
 * Creates a cryptographically signed state parameter for Slack OAuth.
 * Embeds storeId and tenantEmail to prevent CSRF and cross-account contamination.
 * Expires in 15 minutes.
 */
export async function createSlackOAuthState(payload: {
  storeId: string | number;
  tenantEmail: string;
}): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({
    storeId: String(payload.storeId),
    tenantEmail: payload.tenantEmail.toLowerCase().trim(),
    type: 'slack_oauth_state',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

/**
 * Verifies and decodes the Slack OAuth state parameter.
 * Ensures the state was signed by our server and has not expired.
 */
export async function verifySlackOAuthState(
  state: string
): Promise<{ storeId: string; tenantEmail: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(state, secret);
    if (
      payload.type !== 'slack_oauth_state' ||
      !payload.storeId ||
      !payload.tenantEmail
    ) {
      return null;
    }
    return {
      storeId: String(payload.storeId),
      tenantEmail: String(payload.tenantEmail),
    };
  } catch {
    return null;
  }
}
