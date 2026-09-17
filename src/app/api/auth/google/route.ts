import { NextResponse } from 'next/server';
import { findAdminByEmail, createOrUpdateAdmin, findTenantByEmail, createTenant, createLead } from '@/lib/db';
import { createSessionToken, getSessionCookieHeader, isAllowedAdminEmail, isSuperAdminEmail, isSecureContext } from '@/lib/auth';
import { createOAuthState, OAUTH_STATE_COOKIE_NAME } from '@/lib/security';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const from = url.searchParams.get('from') || '/login';
  const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return NextResponse.json(
      { error: 'Google Client ID is not configured on the server.' },
      { status: 500 }
    );
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  // Generate cryptographically secure state token & encrypted HTTP-only cookie (10 min expiration)
  const { state, cookieValue } = await createOAuthState('google-social-auth', from);

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: url.searchParams.get('prompt') || 'select_account',
    state,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const isJson = url.searchParams.get('format') === 'json';
  const response = isJson
    ? NextResponse.json({ url: authUrl })
    : NextResponse.redirect(authUrl);

  const isSecure = isSecureContext(request);

  // Attach HttpOnly, SameSite=Lax state cookie (Secure only when actually in HTTPS context)
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: cookieValue,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    maxAge: 600, // 10 minutes
  });

  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, code } = body;

    let email = '';
    let name = 'User';
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
      name = payload.name || payload.given_name || 'User';
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
      name = userData.name || userData.given_name || 'User';
      googleId = userData.id;
    } else if (process.env.NODE_ENV !== 'production' && body.demoEmail) {
      // In development / test mode with no credentials configured
      email = body.demoEmail;
      name = body.demoName || 'Google Authenticated User';
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

    const cleanEmail = email.toLowerCase().trim();
    const isSuper = isSuperAdminEmail(cleanEmail);
    const isAdmin = isAllowedAdminEmail(cleanEmail) || isSuper;
    const role = isAdmin ? 'admin' : 'user';

    // Persist or match user in Neon database
    const user = await createOrUpdateAdmin({
      email: cleanEmail,
      name,
      googleId,
      role: isSuper ? 'admin' : role,
    });

    const existingTenant = await findTenantByEmail(cleanEmail);
    if (!existingTenant) {
      // Automatic Metadata Provisioning:
      // Initialize store name as [User Display Name]'s Catalog if no name is provided
      const displayName = (name && name !== 'User' ? name : '').trim() || cleanEmail.split('@')[0];
      const storeName = `${displayName}'s Catalog`;

      await createTenant({
        email: cleanEmail,
        companyName: storeName,
        planTier: isSuper ? 'Active Pro' : 'Trial',
        accountType: 'merchant',
        accountPlan: 'solo',
        subscriptionStatus: isSuper ? 'paid active' : 'active trial',
        trialEndsAt: null, // Trial countdown activates upon GMC connection
      });

      if (!isSuper) {
        // Record lead for platform CRM telemetry
        await createLead({
          email: cleanEmail,
          accountType: 'merchant',
          website: `${cleanEmail.split('@')[1] || 'store.com'}`,
          catalogSize: '1,000 - 5,000 SKUs',
        });
      }
    }

    const token = await createSessionToken({
      email: user.email,
      role,
      name: user.name || name,
      id: user.id,
    });

    const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/dashboard';

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        email: user.email,
        name: user.name,
        role,
      },
    });

    response.headers.set('Set-Cookie', getSessionCookieHeader(token, 60 * 60 * 24 * 7, request));
    return response;
  } catch (error) {
    console.error('[Google Auth Error]', error);
    return NextResponse.json(
      { error: 'Internal server error processing Google authentication.' },
      { status: 500 }
    );
  }
}
