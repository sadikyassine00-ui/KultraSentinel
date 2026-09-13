import { NextResponse } from 'next/server';
import { createOrUpdateAdmin } from '@/lib/db';
import { createSessionToken, getSessionCookieHeader } from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const origin = url.origin;
  const loginUrl = new URL('/admin/login', origin);
  const dashboardUrl = new URL('/admin/dashboard', origin);

  if (error || !code) {
    loginUrl.searchParams.set('error', error || 'Google sign-in was cancelled or failed.');
    return NextResponse.redirect(loginUrl);
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    loginUrl.searchParams.set('error', 'Google OAuth credentials are not configured on the server.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[Google Callback] Token exchange failed:', errText);
      loginUrl.searchParams.set('error', 'Failed to exchange authorization code with Google.');
      return NextResponse.redirect(loginUrl);
    }

    const tokenData = await tokenRes.json();

    // 2. Fetch authenticated user profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      console.error('[Google Callback] Failed to fetch userinfo from Google');
      loginUrl.searchParams.set('error', 'Failed to retrieve Google user profile.');
      return NextResponse.redirect(loginUrl);
    }

    const userData = await userRes.json();
    const email = userData.email?.toLowerCase();
    const name = userData.name || userData.given_name || 'Admin User';
    const googleId = userData.id;

    if (!email) {
      loginUrl.searchParams.set('error', 'Google account did not return a verified email address.');
      return NextResponse.redirect(loginUrl);
    }

    // 3. Persist or match admin account in Neon DB
    const admin = await createOrUpdateAdmin({
      email,
      name,
      googleId,
      role: 'admin',
    });

    // 4. Generate 7-day secure session token
    const token = await createSessionToken({
      email: admin.email,
      role: admin.role,
      name: admin.name || 'Admin',
    });

    // 5. Redirect to dashboard with HttpOnly session cookie
    const response = NextResponse.redirect(dashboardUrl);
    response.headers.set('Set-Cookie', getSessionCookieHeader(token));
    return response;
  } catch (err) {
    console.error('[Google Callback Error]', err);
    loginUrl.searchParams.set('error', 'Unexpected error occurred during Google sign-in.');
    return NextResponse.redirect(loginUrl);
  }
}
