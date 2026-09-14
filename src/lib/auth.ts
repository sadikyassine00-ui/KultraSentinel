import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'kultra_admin_session';
const DEFAULT_SECRET = 'kultra-sentinel-fallback-secret-key-32-chars-min!';

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
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

export async function getAnySession(request: Request): Promise<SessionPayload | null> {
  let session: SessionPayload | null = null;

  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    session = await verifySessionToken(token);
  }

  // 2. Check Cookie if no bearer session
  if (!session) {
    const cookieHeader = request.headers.get('cookie');
    const token = parseCookie(cookieHeader, COOKIE_NAME);
    if (token) {
      session = await verifySessionToken(token);
    }
  }

  return session;
}

export async function getAuthSession(request: Request): Promise<SessionPayload | null> {
  let session: SessionPayload | null = null;

  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    session = await verifySessionToken(token);
  }

  // 2. Check Cookie if no bearer session
  if (!session) {
    const cookieHeader = request.headers.get('cookie');
    const token = parseCookie(cookieHeader, COOKIE_NAME);
    if (token) {
      session = await verifySessionToken(token);
    }
  }

  if (!session) return null;

  // Strict Admin Gate: Only whitelisted admin emails are allowed into Mission Control
  if (!isAllowedAdminEmail(session.email)) {
    return null;
  }

  return session;
}

export function getSessionCookieHeader(token: string, maxAgeSeconds: number = 60 * 60 * 24 * 7): string {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function getClearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
