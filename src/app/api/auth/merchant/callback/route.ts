import { NextResponse, after } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { claimStoreForTenant, findTenantByEmail, getStoresForTenant, upsertIncident } from '@/lib/db';
import { encryptToken, verifyOAuthState, OAUTH_STATE_COOKIE_NAME } from '@/lib/security';
import { registerMerchantNotificationSubscription, auditExistingDisapprovals, discoverMerchantAccounts } from '@/lib/merchant_api';
import { dispatchInitialAuditSlackNotification } from '@/lib/slack';
import { canTenantConnectStore } from '@/lib/subscription';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  const origin = url.origin;

  // 1. CSRF State Parameter Validation (Zero-Trust Security)
  // Check that the state parameter exists and matches the encrypted HTTP-only cookie
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value;

  if (!state) {
    return NextResponse.json(
      { error: 'Forbidden: Missing OAuth state parameter' },
      { status: 403 }
    );
  }

  const stateResult = await verifyOAuthState(state, stateCookie);
  if (!stateResult.valid) {
    return NextResponse.json(
      { error: `Forbidden: ${stateResult.error || 'Invalid or expired OAuth state parameter'}` },
      { status: 403 }
    );
  }

  // 2. Verify authenticated session
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'Session expired during Merchant Center authorization.');
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(sessionCookie.value);
  if (!session) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'Invalid session credentials.');
    return NextResponse.redirect(loginUrl);
  }

  const fallbackDashboardUrl = session.role === 'admin'
    ? new URL('/admin/dashboard?tab=stores', origin)
    : new URL('/dashboard', origin);

  if (errorParam || !code) {
    const isPermissionDenied = errorParam === 'access_denied' || errorParam === 'permission_denied';
    fallbackDashboardUrl.searchParams.set('error', isPermissionDenied ? 'permission_denied' : (errorParam || 'cancelled'));
    const res = NextResponse.redirect(fallbackDashboardUrl);
    res.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return res;
  }

  // Verify state tenant email matches active authenticated session
  if (stateResult.email && stateResult.email.toLowerCase() !== session.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Forbidden: OAuth state parameter tenant mismatch detected' },
      { status: 403 }
    );
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    fallbackDashboardUrl.searchParams.set('error', 'Google OAuth credentials not configured on server.');
    return NextResponse.redirect(fallbackDashboardUrl);
  }

  try {
    const redirectUri = `${origin}/api/auth/merchant/callback`;

    // 3. Exchange code for tokens with Google
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
      console.error('[Merchant OAuth Callback] Token exchange failed:', errText);
      fallbackDashboardUrl.searchParams.set('error', 'Failed to exchange authorization code with Google.');
      return NextResponse.redirect(fallbackDashboardUrl);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const grantedScopes = String(tokenData.scope || '');

    // Branch C: Check if Google Merchant Center scope was granted
    const hasContentScope = grantedScopes.includes('https://www.googleapis.com/auth/content');
    if (!hasContentScope && process.env.NODE_ENV === 'production') {
      console.warn(`[Merchant OAuth Callback] Token missing content scope for ${session.email}. Granted scopes: ${grantedScopes}`);
      fallbackDashboardUrl.searchParams.set('error', 'permission_denied');
      const res = NextResponse.redirect(fallbackDashboardUrl);
      res.cookies.delete(OAUTH_STATE_COOKIE_NAME);
      return res;
    }

    // Encrypt refresh token at rest using AES-256-GCM if provided
    const encryptedRefreshToken = refreshToken ? await encryptToken(refreshToken) : undefined;

    // Check if target GMC ID was passed in OAuth state returnTo
    const targetGmcId = stateResult.returnTo || undefined;

    // 4. Live GMC Account Discovery (Google Merchant API & Content API v2.1)
    const discoveryResult = await discoverMerchantAccounts(accessToken, targetGmcId);
    const discoveredAccounts = discoveryResult.accounts;

    // Helper to construct pending OAuth cookie for manual Merchant ID verification fallback
    const setPendingGmcCookie = (response: NextResponse) => {
      if (accessToken || encryptedRefreshToken) {
        const pendingPayload = JSON.stringify({
          email: session.email,
          encryptedRefreshToken,
          accessToken,
          createdAt: Date.now(),
        });
        response.cookies.set({
          name: 'kultra_gmc_pending',
          value: Buffer.from(pendingPayload).toString('base64'),
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1800, // 30 minutes
        });
      }
    };

    // Discovery Error Handling: Route 404/notFound to Branch B, and scopeMissing to Branch C
    if (discoveryResult.error && discoveredAccounts.length === 0) {
      if (discoveryResult.error.notFound || discoveryResult.error.status === 404) {
        fallbackDashboardUrl.searchParams.set('error', 'no_accounts_found');
        const res = NextResponse.redirect(fallbackDashboardUrl);
        res.cookies.delete(OAUTH_STATE_COOKIE_NAME);
        setPendingGmcCookie(res);
        return res;
      }
      if (discoveryResult.error.apiDisabled) {
        fallbackDashboardUrl.searchParams.set(
          'error',
          'Google Content API for Shopping is disabled in your Google Cloud Project. Please enable it in Google Cloud Console.'
        );
        return NextResponse.redirect(fallbackDashboardUrl);
      }
      if (discoveryResult.error.scopeMissing || discoveryResult.error.status === 403) {
        fallbackDashboardUrl.searchParams.set('error', 'permission_denied');
        const res = NextResponse.redirect(fallbackDashboardUrl);
        res.cookies.delete(OAUTH_STATE_COOKIE_NAME);
        return res;
      }
      fallbackDashboardUrl.searchParams.set('error', `Google API Error: ${discoveryResult.error.message}`);
      return NextResponse.redirect(fallbackDashboardUrl);
    }

    // Branch B: Zero GMC accounts found (Directory propagation delay fallback)
    // Preserve active OAuth tokens in kultra_gmc_pending cookie and route to dashboard with state indicator
    if (discoveredAccounts.length === 0) {
      fallbackDashboardUrl.searchParams.set('error', 'no_accounts_found');
      const res = NextResponse.redirect(fallbackDashboardUrl);
      res.cookies.delete(OAUTH_STATE_COOKIE_NAME);
      setPendingGmcCookie(res);
      return res;
    }

    // Case B: Multiple GMC accounts found -> Redirect to multi-account selector
    if (discoveredAccounts.length > 1) {
      const selectCookiePayload = JSON.stringify({
        email: session.email,
        encryptedRefreshToken,
        accessToken,
        accounts: discoveredAccounts,
        createdAt: Date.now(),
      });

      const selectUrl = new URL('/dashboard/connect/select-account', origin);
      const res = NextResponse.redirect(selectUrl);
      res.cookies.delete(OAUTH_STATE_COOKIE_NAME);
      res.cookies.set({
        name: 'kultra_gmc_select',
        value: Buffer.from(selectCookiePayload).toString('base64'),
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600, // 10 minutes
      });
      return res;
    }

    // Case C: Exactly one account found -> Connect directly
    const selectedAcct = discoveredAccounts[0];
    const gmcId = selectedAcct.merchantId;
    const storeName = selectedAcct.name;
    const storeUrl = selectedAcct.websiteUrl || `https://merchants.google.com/mc/overview?account=${gmcId}`;
    const accountType = selectedAcct.isAggregator ? 'MCA Child' : 'Standalone Merchant';

    // 5. Tenant Isolation, Quota Enforcement & Collision Protection
    const tenant = await findTenantByEmail(session.email);
    const tenantId = tenant ? tenant.id : 1;

    // Strict Account Entitlement Check: Prevent over-provisioning beyond plan quota
    const currentStores = await getStoresForTenant(session.email);
    const alreadyClaimed = currentStores.some((s) => String(s.gmc_id) === String(gmcId));
    if (!alreadyClaimed) {
      const quotaCheck = canTenantConnectStore(tenant, currentStores.length);
      if (!quotaCheck.allowed) {
        const quotaParam = quotaCheck.planTier === 'Agency' ? 'fleet_quota_reached' : 'solo_quota_reached';
        fallbackDashboardUrl.searchParams.set('error', quotaParam);
        const res = NextResponse.redirect(fallbackDashboardUrl);
        res.cookies.delete(OAUTH_STATE_COOKIE_NAME);
        return res;
      }
    }

    const claimResult = await claimStoreForTenant({
      gmcId,
      tenantId,
      tenantEmail: session.email,
      storeName,
      storeUrl,
      encryptedRefreshToken,
      accountType,
    });

    if (!claimResult.success) {
      if (claimResult.collision) {
        return NextResponse.json(
          {
            error: claimResult.error || 'Cross-tenant collision: Google Merchant Center ID already claimed by another tenant.',
            collision: true,
          },
          { status: 409 }
        );
      }
      fallbackDashboardUrl.searchParams.set(
        'error',
        claimResult.error || 'Failed to claim store due to cross-tenant collision.'
      );
      return NextResponse.redirect(fallbackDashboardUrl);
    }

    // Step 4: Auto-register Google Merchant Notifications API Pub/Sub pipeline
    await registerMerchantNotificationSubscription({
      merchantId: gmcId,
      accessToken,
      pubsubTopic: claimResult.store?.pubsub_topic,
    });

    // Step 4.5: Non-Blocking Initial Catalog Audit & "Found Money" Slack Notification (§2 & §3)
    after(async () => {
      try {
        console.info(`[Initial Audit] Initiating non-blocking catalog scan for GMC #${gmcId}...`);
        const auditResult = await auditExistingDisapprovals(gmcId, accessToken);
        console.info(
          `[Initial Audit] Discovered ${auditResult.disapprovals.length} disapprovals out of ${auditResult.totalAudited} items.`
        );

        // Batch upsert detected disapprovals into Neon DB
        for (const item of auditResult.disapprovals) {
          await upsertIncident({
            storeId: claimResult.store?.id || 1,
            gmcId,
            sku: item.offerId,
            title: item.title,
            issueCode: item.issueCode,
            severity: 'critical',
            tenant_email: session.email,
            details: {
              destination: item.destination,
              issueDetail: item.issueDetail,
            },
          });
        }

        // Dispatch "Found Money" Alert to Slack (or "Zero Errors Clean Slate")
        if (claimResult.store) {
          await dispatchInitialAuditSlackNotification({
            store: claimResult.store,
            disapprovals: auditResult.disapprovals,
            totalAudited: auditResult.totalAudited,
            appUrl: origin,
          });
        }
      } catch (auditErr) {
        console.error('[Initial Audit Background Task Error]', auditErr);
      }
    });

    // Step 5: Clean redirect to State B (Arm Your Alarm modal)
    const successUrl = session.role === 'admin'
      ? new URL('/admin/dashboard', origin)
      : new URL('/dashboard', origin);

    if (session.role === 'admin') {
      successUrl.searchParams.set('tab', 'triage');
    }
    successUrl.searchParams.set('just_connected', 'true');
    if (claimResult.store?.id) {
      successUrl.searchParams.set('store_id', String(claimResult.store.id));
    }
    successUrl.searchParams.set('success', `Store ${storeName} (GMC #${gmcId}) successfully connected.`);

    const redirectResponse = NextResponse.redirect(successUrl);
    redirectResponse.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return redirectResponse;
  } catch (err) {
    console.error('[Merchant OAuth Callback Error]', err);
    fallbackDashboardUrl.searchParams.set('error', 'Internal server error processing Merchant Center authorization.');
    return NextResponse.redirect(fallbackDashboardUrl);
  }
}

/**
 * Programmatic POST handler for direct API testing / simulation
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    let session = null;

    if (sessionCookie?.value) {
      session = await verifySessionToken(sessionCookie.value);
    }

    const body = await request.json();
    const email = body.tenantEmail || session?.email;

    if (!email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { gmcId, storeName, storeUrl, refreshToken, accountType } = body;

    if (!gmcId || !storeName || !storeUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters: gmcId, storeName, storeUrl' },
        { status: 400 }
      );
    }

    // Encrypt refresh token at rest using AES-256-GCM
    const encryptedRefreshToken = refreshToken ? await encryptToken(refreshToken) : undefined;

    const tenant = await findTenantByEmail(email);
    const tenantId = tenant ? tenant.id : (body.tenantId || 1);

    const claimResult = await claimStoreForTenant({
      gmcId: String(gmcId),
      tenantId,
      tenantEmail: email,
      storeName,
      storeUrl,
      encryptedRefreshToken,
      accountType: accountType || 'Standalone Merchant',
    });

    if (!claimResult.success) {
      return NextResponse.json(
        {
          error: claimResult.error,
          collision: claimResult.collision,
        },
        { status: claimResult.collision ? 409 : 400 }
      );
    }

    // Trigger non-blocking audit & simulation backfill for test store
    after(async () => {
      try {
        const auditResult = await auditExistingDisapprovals(String(gmcId), 'mock_access_token');
        for (const item of auditResult.disapprovals) {
          await upsertIncident({
            storeId: claimResult.store?.id || 1,
            gmcId: String(gmcId),
            sku: item.offerId,
            title: item.title,
            issueCode: item.issueCode,
            severity: 'critical',
            tenant_email: email,
            details: {
              destination: item.destination,
              issueDetail: item.issueDetail,
            },
          });
        }
        if (claimResult.store) {
          await dispatchInitialAuditSlackNotification({
            store: claimResult.store,
            disapprovals: auditResult.disapprovals,
            totalAudited: auditResult.totalAudited,
          });
        }
      } catch (postAuditErr) {
        console.warn('[Programmatic Connect Audit Error]', postAuditErr);
      }
    });

    return NextResponse.json({
      success: true,
      store: claimResult.store,
    });
  } catch (error) {
    console.error('[Merchant OAuth Programmatic Error]', error);
    return NextResponse.json({ error: 'Failed to process store connection' }, { status: 500 });
  }
}
