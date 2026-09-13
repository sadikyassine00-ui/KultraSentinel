import { NextResponse } from 'next/server';
import { findAdminByEmail, createOrUpdateAdmin } from '@/lib/db';
import { verifyPassword, hashPassword, createSessionToken, getSessionCookieHeader, isAllowedAdminEmail, ALLOWED_ADMIN_EMAILS } from '@/lib/auth';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'KultraSentinel2026!';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Strict Admin Authorization Check: Only whitelisted admin emails are allowed
    if (!isAllowedAdminEmail(cleanEmail)) {
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
      return NextResponse.json(
        { error: 'Invalid credentials or account does not exist.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials provided.' },
        { status: 401 }
      );
    }

    // Generate secure 7-day session token
    const token = await createSessionToken({
      email: admin.email,
      role: admin.role,
      name: admin.name || 'Admin',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    // Set HTTP-only secure cookie
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
