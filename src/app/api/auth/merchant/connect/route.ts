import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return NextResponse.json({ error: 'Google Client ID is not configured' }, { status: 500 });
    }

    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/auth/merchant/callback`;

    // State payload contains tenant identity to prevent CSRF and guarantee account scoping
    const statePayload = Buffer.from(
      JSON.stringify({
        email: session.email,
        timestamp: Date.now(),
      })
    ).toString('base64url');

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/content.readonly openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: statePayload,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Return JSON with auth URL or redirect if requested by browser navigation
    if (url.searchParams.get('format') === 'json') {
      return NextResponse.json({ url: googleAuthUrl });
    }

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error('[Merchant OAuth Connect Error]', error);
    return NextResponse.json({ error: 'Failed to initiate Merchant Center OAuth' }, { status: 500 });
  }
}
