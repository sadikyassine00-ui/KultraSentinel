import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { createOAuthState, OAUTH_STATE_COOKIE_NAME } from '@/lib/security';

export async function GET(request: Request) {
  try {
    let sessionToken: string | undefined;
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Fallback for direct unit tests or environments outside Next.js request async storage
    }

    if (!sessionToken) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
      if (match) {
        sessionToken = decodeURIComponent(match[1]);
      }
    }

    if (!sessionToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
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
    const targetGmcId = url.searchParams.get('target_gmc_id') || url.searchParams.get('gmc_id') || undefined;
    const { state, cookieValue } = await createOAuthState(session.email, targetGmcId);

    const promptParam = url.searchParams.get('prompt') || 'select_account consent';

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/content openid email profile',
      access_type: 'offline',
      prompt: promptParam,
      include_granted_scopes: 'true',
      state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Return JSON with auth URL for AJAX/fetch/RSC requests to prevent cross-origin CORS redirect blocks,
    // or perform direct 307 redirect for native browser document navigation.
    const isJsonOrFetch =
      url.searchParams.get('format') === 'json' ||
      request.headers.get('sec-fetch-mode') === 'cors' ||
      request.headers.get('accept')?.includes('application/json') ||
      url.searchParams.has('_rsc') ||
      request.headers.has('rsc');

    const response = isJsonOrFetch
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
