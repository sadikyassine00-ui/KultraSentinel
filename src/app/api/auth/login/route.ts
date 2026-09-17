import { NextResponse } from 'next/server';
import { findAdminByEmail, createOrUpdateAdmin } from '@/lib/db';
import {
  verifyPassword,
  hashPassword,
  createSessionToken,
  getSessionCookieHeader,
  isAllowedAdminEmail,
  DUMMY_BCRYPT_HASH,
} from '@/lib/auth';
import {
  checkRateLimit,
  recordAttempt,
  resetRateLimit,
  getClientIp,
  getAttemptCount,
  applyExponentialBackoff,
} from '@/lib/rate-limit';
import { sanitizeRedirectUrl } from '@/lib/security';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'KultraSentinel2026!';

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const ipRateLimitKey = `login:ip:${clientIp}`;

  // 1. IP-Based Sliding Window Rate Limiter (Brute-Force & Abuse Protection)
  const ipRateLimit = checkRateLimit(ipRateLimitKey, 5, 15 * 60); // 5 failed attempts per 15 min window
  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many failed authentication attempts. Please retry in ${Math.ceil(ipRateLimit.retryAfterSeconds / 60)} minute(s).`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(ipRateLimit.retryAfterSeconds),
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

    // 2. Email Normalization (trim whitespace and lowercase)
    const cleanEmail = email.trim().toLowerCase();
    const emailRateLimitKey = `login:email:${cleanEmail}`;

    // 3. Identifier-Based Rate Limiting (Account Takeover Defense)
    const emailRateLimit = checkRateLimit(emailRateLimitKey, 5, 15 * 60);
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed authentication attempts for this account. Please retry in ${Math.ceil(emailRateLimit.retryAfterSeconds / 60)} minute(s).`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(emailRateLimit.retryAfterSeconds),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 4. Progressive Exponential Backoff after 3 consecutive failures
    const maxFailures = Math.max(
      getAttemptCount(ipRateLimitKey),
      getAttemptCount(emailRateLimitKey)
    );
    if (maxFailures >= 3) {
      await applyExponentialBackoff(maxFailures);
    }

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

    // 5. User Enumeration Prevention & Timing Equalization:
    // If user does not exist or has no password hash (e.g. Google OAuth only user),
    // execute identical 12-round bcrypt hash verification against precomputed dummy hash.
    if (!user || !user.password_hash) {
      await verifyPassword(password, DUMMY_BCRYPT_HASH);
      recordAttempt(ipRateLimitKey);
      recordAttempt(emailRateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      recordAttempt(ipRateLimitKey);
      recordAttempt(emailRateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 6. Successful authentication - reset rate limit counters
    resetRateLimit(ipRateLimitKey);
    resetRateLimit(emailRateLimitKey);

    // 7. Generate secure 7-day session token with session tracking metadata
    const userAgent = request.headers.get('user-agent');
    const token = await createSessionToken(
      {
        email: user.email,
        role,
        name: user.name || cleanEmail.split('@')[0],
        id: user.id,
      },
      {
        ipAddress: clientIp,
        userAgent,
      }
    );

    // 8. Sanitize post-login redirect destination (Open-Redirect Defense)
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

    // 9. Set hardened HTTP-only, secure, SameSite=Lax cookie with 7-day expiration
    response.headers.set('Set-Cookie', getSessionCookieHeader(token, 60 * 60 * 24 * 7, request));

    return response;
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
