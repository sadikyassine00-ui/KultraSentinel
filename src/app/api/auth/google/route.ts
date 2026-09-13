import { NextResponse } from 'next/server';
import { findAdminByEmail, createOrUpdateAdmin } from '@/lib/db';
import { createSessionToken, getSessionCookieHeader } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, code } = body;

    let email = '';
    let name = 'Admin User';
    let googleId = '';

    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (idToken) {
      // Direct verification via Google OAuth2 tokeninfo endpoint
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!res.ok) {
        return NextResponse.json(
          { error: 'Invalid Google authentication token.' },
          { status: 401 }
        );
      }
      const payload = await res.json();
      
      // Verify audience if GOOGLE_CLIENT_ID is set
      if (googleClientId && payload.aud !== googleClientId) {
        return NextResponse.json(
          { error: 'Google Client ID mismatch.' },
          { status: 401 }
        );
      }

      email = payload.email;
      name = payload.name || payload.given_name || 'Admin User';
      googleId = payload.sub;
    } else if (code && process.env.GOOGLE_CLIENT_SECRET && googleClientId) {
      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: googleClientId,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${new URL(request.url).origin}/api/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        return NextResponse.json(
          { error: 'Failed to exchange Google authorization code.' },
          { status: 401 }
        );
      }

      const tokenData = await tokenRes.json();
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json();

      email = userData.email;
      name = userData.name;
      googleId = userData.id;
    } else if (process.env.NODE_ENV !== 'production' && body.demoEmail) {
      // In development / test mode with no credentials configured
      email = body.demoEmail;
      name = body.demoName || 'Google Authenticated Admin';
      googleId = 'google-dev-' + Date.now();
    } else {
      return NextResponse.json(
        { error: 'Missing required Google ID token or authorization code.' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Unable to extract email from Google identity profile.' },
        { status: 400 }
      );
    }

    // Persist or match admin in Neon database
    const admin = await createOrUpdateAdmin({
      email: email.toLowerCase(),
      name,
      googleId,
      role: 'admin',
    });

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

    response.headers.set('Set-Cookie', getSessionCookieHeader(token));
    return response;
  } catch (error) {
    console.error('[Google Auth Error]', error);
    return NextResponse.json(
      { error: 'Internal server error processing Google authentication.' },
      { status: 500 }
    );
  }
}
