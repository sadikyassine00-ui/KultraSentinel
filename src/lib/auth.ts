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
  isSecureContext,
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
  isSecureContext,
  getJwtSecret,
  type SessionPayload,
};

// Precomputed 12-round bcrypt hash used to equalize response timing on non-existent users
export const DUMMY_BCRYPT_HASH = '$2a$12$e8mYfE8rGfC534V4uK7FheM5e49jJ2yQ7VlV/rZ0xI6E2B9aB9cK6';

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
    notCommonOrBreached: boolean;
  };
}

/**
 * Validates password against institutional entropy and anti-breach rules:
 * - Minimum 10 characters
 * - At least one uppercase letter [A-Z]
 * - At least one lowercase letter [a-z]
 * - At least one numeric digit [0-9]
 * - At least one symbol [^A-Za-z0-9]
 * - Rejects trivial sequences, repeated characters, and common breached patterns
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      error: 'Password cannot be empty.',
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSymbol: false,
        notCommonOrBreached: false,
      },
    };
  }

  const minLength = password.length >= 10;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const lower = password.toLowerCase();
  const breachedPatterns = [
    'password',
    'admin',
    'qwerty',
    'welcome',
    'kultra',
    'letmein',
    '123456',
    '12345678',
    '123456789',
    'iloveyou',
    'monkey',
    'dragon',
  ];

  const containsBreachedWord = breachedPatterns.some((pattern) => lower.includes(pattern));
  const hasRepeatedChar = /(.)\1{3,}/.test(password); // 4 identical characters in a row (e.g. 'aaaa', '1111')
  const hasTrivialSequence = /12345|23456|34567|45678|56789|abcde|bcdef|cdefg/i.test(password);

  const notCommonOrBreached = !containsBreachedWord && !hasRepeatedChar && !hasTrivialSequence;

  const valid =
    minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSymbol &&
    notCommonOrBreached;

  let error: string | undefined;
  if (!minLength) {
    error = 'Password must be at least 10 characters long.';
  } else if (!hasUppercase) {
    error = 'Password must include at least one uppercase letter (A-Z).';
  } else if (!hasLowercase) {
    error = 'Password must include at least one lowercase letter (a-z).';
  } else if (!hasNumber) {
    error = 'Password must include at least one numeric digit (0-9).';
  } else if (!hasSymbol) {
    error = 'Password must include at least one symbol or special character.';
  } else if (!notCommonOrBreached) {
    error = 'Password contains common breached phrases or trivial character sequences.';
  }

  return {
    valid,
    error,
    requirements: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSymbol,
      notCommonOrBreached,
    },
  };
}

export async function hashPassword(password: string): Promise<string> {
  // Institutional standard: bcrypt with work factor 12
  const salt = await bcrypt.genSalt(12);
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
