import bcrypt from 'bcryptjs';
import {
  COOKIE_NAME,
  ALLOWED_ADMIN_EMAILS,
  isAllowedAdminEmail,
  parseCookie,
  verifySessionToken,
  createSessionToken,
  getSessionCookieHeader,
  getClearSessionCookieHeader,
  getSessionCookieOptions,
  getJwtSecret,
  type SessionPayload,
} from './token';

// Re-export all token & session utilities for seamless backward compatibility
export {
  COOKIE_NAME,
  ALLOWED_ADMIN_EMAILS,
  isAllowedAdminEmail,
  parseCookie,
  verifySessionToken,
  createSessionToken,
  getSessionCookieHeader,
  getClearSessionCookieHeader,
  getSessionCookieOptions,
  getJwtSecret,
  type SessionPayload,
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
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
