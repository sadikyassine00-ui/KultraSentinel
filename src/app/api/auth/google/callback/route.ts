import { NextResponse } from 'next/server';
import { createOrUpdateAdmin, findTenantByEmail, createTenant, createLead, findAdminByEmail } from '@/lib/db';
import { createSessionToken, getSessionCookieHeader, isAllowedAdminEmail } from '@/lib/auth';
import { verifyOAuthState, OAUTH_STATE_COOKIE_NAME } from '@/lib/security';
import { getClientIp } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const state = url.searchParams.get('state');

  const origin = url.origin;
  const loginUrl = new URL('/login', origin);

  if (error || !code) {
    loginUrl.searchParams.set('error', error || 'Google sign-in was cancelled or failed.');
    return NextResponse.redirect(loginUrl);
  }

  // 1. Cryptographic OAuth State & CSRF Mitigation
  // Extract state verification cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const stateCookieMatch = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE_NAME}=`));
  const stateCookieValue = stateCookieMatch
    ? decodeURIComponent(stateCookieMatch.split('=')[1])
    : null;

  const stateVerification = await verifyOAuthState(state, stateCookieValue);
  if (!stateVerification.valid) {
    loginUrl.searchParams.set(
      'error',
      'Security verification failed: OAuth state parameter mismatch or expired. Please try signing in again.'
    );
    const response = NextResponse.redirect(loginUrl);
    // Clear state cookie
    response.cookies.set({
      name: OAUTH_STATE_COOKIE_NAME,
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    loginUrl.searchParams.set('error', 'Google OAuth credentials are not configured on the server.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 2. Exchange authorization code for access token
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

    // 3. Fetch authenticated user profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      console.error('[Google Callback] Failed to fetch userinfo from Google');
      loginUrl.searchParams.set('error', 'Failed to retrieve Google user profile.');
      return NextResponse.redirect(loginUrl);
    }

    const userData = await userRes.json();
    const email = userData.email?.toLowerCase().trim();
    const name = userData.name || userData.given_name || 'User';
    const googleId = userData.id;

    // 4. Verified Email & Account Takeover Defense
    const isEmailVerified = userData.email_verified === true || userData.verified_email === true;
    if (!email || !isEmailVerified) {
      loginUrl.searchParams.set('error', 'Google account did not return a verified email address.');
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = isAllowedAdminEmail(email);
    const role = isAdmin ? 'admin' : 'user';

    // 5. Account Linking: Link Google ID to existing account if user registered via email
    const existingUser = await findAdminByEmail(email);
    const user = await createOrUpdateAdmin({
      email,
      name: existingUser?.name || name,
      googleId,
      role: existingUser?.role || role,
      passwordHash: existingUser?.password_hash,
    });

    if (role === 'user') {
      const existingTenant = await findTenantByEmail(email);
      if (!existingTenant) {
        // Automatic Metadata Provisioning:
        // Initialize store name as [User Display Name]'s Catalog if no name is provided
        const displayName = (name && name !== 'User' ? name : '').trim() || email.split('@')[0];
        const storeName = `${displayName}'s Catalog`;
        // Default account_plan to solo ($19/mo) and set trial_ends_at to exactly 14 days from creation
        const trialEndsAt = new Date(Date.now() + 14 * 86400000).toISOString();

        await createTenant({
          email,
          companyName: storeName,
          planTier: 'Trial',
          accountType: 'merchant',
          accountPlan: 'solo',
          subscriptionStatus: 'active trial',
          trialEndsAt,
        });

        // Record lead for platform CRM telemetry
        await createLead({
          email,
          accountType: 'merchant',
          website: `${email.split('@')[1] || 'store.com'}`,
          catalogSize: '1,000 - 5,000 SKUs',
        });
      }
    }

    // 6. Generate 7-day secure session token with tracking metadata
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const token = await createSessionToken(
      {
        email: user.email,
        role,
        name: user.name || name,
        id: user.id,
      },
      {
        ipAddress: clientIp,
        userAgent,
      }
    );

    // 7. Route the user directly into /dashboard (or /admin/dashboard for admins)
    const targetUrl = role === 'admin'
      ? new URL('/admin/dashboard', origin)
      : new URL('/dashboard', origin);

    const response = NextResponse.redirect(targetUrl);
    response.headers.set('Set-Cookie', getSessionCookieHeader(token));

    // 8. Invalidate one-time state cookie
    response.cookies.set({
      name: OAUTH_STATE_COOKIE_NAME,
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err) {
    console.error('[Google Callback Error]', err);
    loginUrl.searchParams.set('error', 'Unexpected error occurred during Google sign-in.');
    return NextResponse.redirect(loginUrl);
  }
}
