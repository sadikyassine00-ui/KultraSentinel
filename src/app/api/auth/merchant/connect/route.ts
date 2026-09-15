import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { createOAuthState, OAUTH_STATE_COOKIE_NAME } from '@/lib/security';

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

    // Generate cryptographically random state and encrypted 10-minute HTTP-only cookie
    const { state, cookieValue } = await createOAuthState(session.email);

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/content.readonly openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Return JSON with auth URL or redirect directly for browser navigation
    const isJsonFormat = url.searchParams.get('format') === 'json';
    const response = isJsonFormat
      ? NextResponse.json({ url: googleAuthUrl })
      : NextResponse.redirect(googleAuthUrl);

    // Attach state verification cookie (10 minute lifespan)
    response.cookies.set({
      name: OAUTH_STATE_COOKIE_NAME,
      value: cookieValue,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('[Merchant OAuth Connect Error]', error);
    return NextResponse.json({ error: 'Failed to initiate Merchant Center OAuth' }, { status: 500 });
  }
}
