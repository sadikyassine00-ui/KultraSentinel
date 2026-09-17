import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'kultra_admin_session';
const DEFAULT_SECRET = 'kultra-sentinel-fallback-secret-key-32-chars-min!';

export function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  email: string;
  role: 'admin' | 'user' | string;
  name?: string | null;
  id?: string | number | null;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecret();
  const email = payload.email.toLowerCase().trim();
  const role = isAllowedAdminEmail(email) ? 'admin' : (payload.role === 'admin' ? 'admin' : 'user');
  return new SignJWT({
    ...payload,
    email,
    role,
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
    const rawRole = (payload.role as string) || '';
    const role = isAllowedAdminEmail(email) ? 'admin' : (rawRole === 'admin' ? 'admin' : 'user');
    return {
      email,
      role,
      name: (payload.name as string) || null,
      id: (payload.id as string | number) || null,
    };
  } catch {
    return null;
  }
}

export const ALLOWED_ADMIN_EMAILS: string[] = [
  'support@usekultra.com',
];

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function getSessionCookieOptions(maxAgeSeconds: number = 60 * 60 * 24 * 7) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

export function getSessionCookieHeader(token: string, maxAgeSeconds: number = 60 * 60 * 24 * 7): string {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function getClearSessionCookieHeader(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
