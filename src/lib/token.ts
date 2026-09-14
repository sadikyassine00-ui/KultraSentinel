import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'kultra_admin_session';
const DEFAULT_SECRET = 'kultra-sentinel-fallback-secret-key-32-chars-min!';

export function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  email: string;
  role: string;
  name?: string | null;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
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
    return {
      email: payload.email as string,
      role: (payload.role as string) || 'admin',
      name: (payload.name as string) || null,
    };
  } catch {
    return null;
  }
}

export const ALLOWED_ADMIN_EMAILS: string[] = [
  'yassinesadik0@gmail.com',
  'contact@usekultra.com',
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
