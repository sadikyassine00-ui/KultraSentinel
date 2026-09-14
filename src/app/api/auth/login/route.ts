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

    // 2. Strict Admin Authorization Check: Only whitelisted admin emails are allowed into Mission Control
    if (!isAllowedAdminEmail(cleanEmail)) {
      recordAttempt(rateLimitKey);
      return NextResponse.json(
        { error: `Access restricted: ${cleanEmail} is registered as a regular user. The user dashboard is currently in private pilot.` },
        { status: 403 }
      );
    }

    let admin = await findAdminByEmail(cleanEmail);

    // Initial Bootstrap for whitelisted admin accounts
    if (!admin || !admin.password_hash) {
      const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
      admin = await createOrUpdateAdmin({
        email: cleanEmail,
        passwordHash,
        name: cleanEmail.split('@')[0],
        role: 'admin',
      });
    }

    if (!admin || !admin.password_hash) {
      recordAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid credentials or account does not exist.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      recordAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid credentials provided.' },
        { status: 401 }
      );
    }

    // 3. Successful authentication - reset rate limit counter for this IP
    resetRateLimit(rateLimitKey);

    // 4. Generate secure 7-day session token
    const token = await createSessionToken({
      email: admin.email,
      role: admin.role,
      name: admin.name || 'Admin',
    });

    // 5. Sanitize post-login redirect destination (Open-Redirect Defense)
    const safeRedirect = sanitizeRedirectUrl(returnUrl, '/admin/dashboard');

    const response = NextResponse.json({
      success: true,
      redirectUrl: safeRedirect,
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
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
