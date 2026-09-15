import { NextResponse } from 'next/server';
import { findAdminByEmail, createOrUpdateAdmin } from '@/lib/db';
import {
  verifyPassword,
  hashPassword,
  createSessionToken,
  getSessionCookieHeader,
  isAllowedAdminEmail,
} from '@/lib/auth';
import {
  checkRateLimit,
  recordAttempt,
  resetRateLimit,
  getClientIp,
} from '@/lib/rate-limit';
import { sanitizeRedirectUrl } from '@/lib/security';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'KultraSentinel2026!';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimitKey = `login:${clientIp}`;

  // 1. IP-Based Sliding Window Rate Limiter (Brute-Force & Abuse Protection)
  const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60); // 5 failed attempts per 15 min window
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many failed authentication attempts. Please retry in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s).`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password, redirect: returnUrl } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = isAllowedAdminEmail(cleanEmail);
    const role = isAdmin ? 'admin' : 'user';

    let user = await findAdminByEmail(cleanEmail);

    // Initial Bootstrap for whitelisted admin accounts
    if (isAdmin && (!user || !user.password_hash)) {
      const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
      user = await createOrUpdateAdmin({
        email: cleanEmail,
        passwordHash,
        name: cleanEmail.split('@')[0],
        role: 'admin',
      });
    }

    if (!user || !user.password_hash) {
      recordAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid credentials or account does not exist.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      recordAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid credentials provided.' },
        { status: 401 }
      );
    }

    // 3. Successful authentication - reset rate limit counter for this IP
    resetRateLimit(rateLimitKey);

    // 4. Generate secure 7-day session token with role tagging
    const token = await createSessionToken({
      email: user.email,
      role,
      name: user.name || cleanEmail.split('@')[0],
      id: user.id,
    });

    // 5. Sanitize post-login redirect destination (Open-Redirect Defense)
    const defaultDestination = role === 'admin' ? '/admin/dashboard' : '/dashboard';
    const safeRedirect = sanitizeRedirectUrl(returnUrl, defaultDestination);

    const response = NextResponse.json({
      success: true,
      redirectUrl: safeRedirect,
      user: {
        email: user.email,
        name: user.name,
        role,
      },
    });

    // 6. Set hardened HTTP-only, secure, SameSite=Lax cookie with 7-day expiration
    response.headers.set('Set-Cookie', getSessionCookieHeader(token));

    return response;
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
