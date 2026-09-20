import { NextResponse, after } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { claimStoreForTenant, findTenantByEmail, getStoresForTenant, upsertIncident } from '@/lib/db';
import { decryptToken } from '@/lib/security';
import { activateTrialOnFirstStoreConnect, canTenantConnectStore } from '@/lib/subscription';
import {
  registerMerchantNotificationSubscription,
  auditExistingDisapprovals,
  verifyAndFetchMerchantAccount,
  getValidMerchantAccessToken,
} from '@/lib/merchant_api';
import { dispatchInitialAuditSlackNotification } from '@/lib/slack';

interface PendingCookieData {
  email: string;
  encryptedRefreshToken?: string | null;
  accessToken?: string;
  createdAt: number;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionCookie);
    if (!session?.email) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const body = await request.json();
    const rawGmcId = body.gmcId ? String(body.gmcId).trim() : '';

    if (!rawGmcId) {
      return NextResponse.json({ error: 'Google Merchant Center ID is required' }, { status: 400 });
    }

    // Clean GMC ID (allow digits only)
    const gmcId = rawGmcId.replace(/\D/g, '');
    if (!gmcId) {
      return NextResponse.json({ error: 'Invalid Google Merchant Center ID format' }, { status: 400 });
    }

    // Retrieve pending OAuth tokens from cookie if present
    const pendingCookie = cookieStore.get('kultra_gmc_pending')?.value;
    let pendingData: PendingCookieData | null = null;
    if (pendingCookie) {
      try {
        pendingData = JSON.parse(Buffer.from(pendingCookie, 'base64').toString('utf-8'));
      } catch {
        // Ignored if corrupt
      }
    }

    let encryptedRefreshToken = pendingData?.encryptedRefreshToken || undefined;
    let accessToken = pendingData?.accessToken || undefined;

    // If accessToken is missing or expired, attempt token refresh via refresh_token
    if (!accessToken && encryptedRefreshToken) {
      try {
        const refreshToken = await decryptToken(encryptedRefreshToken);
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (clientId && clientSecret && refreshToken) {
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              refresh_token: refreshToken,
              grant_type: 'refresh_token',
            }),
          });
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            accessToken = tokenData.access_token;
          }
        }
      } catch (refreshErr) {
        console.warn('[Direct GMC Link] Token refresh error:', refreshErr);
      }
    }

    // Fallback: check existing stores for tenant to find a valid refresh token
    if (!accessToken) {
      try {
        const existingStores = await getStoresForTenant(session.email);
        for (const st of existingStores) {
          if (st.encrypted_refresh_token) {
            encryptedRefreshToken = st.encrypted_refresh_token;
            accessToken = await getValidMerchantAccessToken(st) || undefined;
            if (accessToken) break;
          }
        }
      } catch (storeErr) {
        console.warn('[Direct GMC Link] Existing store lookup error:', storeErr);
      }
    }

    // If no active OAuth session is available, prompt the user to re-authenticate
    if (!accessToken) {
      return NextResponse.json(
        {
          error: "No active Google OAuth session found. Please click 'Connect a Different Google Account' to authenticate with Google first.",
        },
        { status: 401 }
      );
    }

    // Execute direct targeted call to Google Content API accounts.get using active OAuth credentials
    const verifyResult = await verifyAndFetchMerchantAccount({
      merchantId: gmcId,
      accessToken,
    });

    if (!verifyResult.ok) {
      return NextResponse.json(
        {
          error:
            verifyResult.error ||
            `Google reported that your currently authenticated email does not have access to Merchant ID ${gmcId}. Reconnect with the correct Google email or grant access in Merchant Center.`,
          status: verifyResult.status,
        },
        { status: verifyResult.status >= 400 && verifyResult.status < 500 ? verifyResult.status : 400 }
      );
    }

    // Extract store name and website domain directly from response
    const storeName = verifyResult.storeName || body.storeName?.trim() || `Merchant Center #${gmcId}`;
    const storeUrl = verifyResult.websiteUrl || `https://merchants.google.com/mc/overview?account=${gmcId}`;
    const accountType = 'Standalone Merchant';

    const tenant = await findTenantByEmail(session.email);
    const tenantId = tenant ? tenant.id : 1;

    // Strict Account Entitlement Check: Prevent over-provisioning beyond plan quota
    const existingStores = await getStoresForTenant(session.email);
    const alreadyClaimed = existingStores.some((s) => String(s.gmc_id) === String(gmcId));
    if (!alreadyClaimed) {
      const quotaCheck = canTenantConnectStore(tenant, existingStores.length);
      if (!quotaCheck.allowed) {
        return NextResponse.json(
          {
            error: quotaCheck.reason,
            quotaReached: true,
            planTier: quotaCheck.planTier,
            limit: quotaCheck.limit,
            current: quotaCheck.current,
          },
          { status: 403 }
        );
      }
    }

    // Persist the store record in database
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
      return NextResponse.json(
        {
          error: claimResult.error || 'Failed to link Google Merchant Center account.',
          collision: claimResult.collision,
        },
        { status: claimResult.collision ? 409 : 400 }
      );
    }

    // Start the 14-day trial countdown anchored to this connection
    try {
      await activateTrialOnFirstStoreConnect(session.email);
    } catch (trialErr) {
      console.warn('[Direct Link] Trial activation warning:', trialErr);
    }

    // Register Google Merchant notifications Pub/Sub pipeline
    try {
      await registerMerchantNotificationSubscription({
        merchantId: gmcId,
        accessToken,
        pubsubTopic: claimResult.store?.pubsub_topic,
      });
    } catch (subErr) {
      console.warn('[Direct Link] Pub/Sub registration warning:', subErr);
    }

    // Run non-blocking initial catalog audit and dispatch Slack notification
    const origin = new URL(request.url).origin;
    after(async () => {
      try {
        console.info(`[Direct Link Audit] Auditing catalog for GMC #${gmcId}...`);
        const auditResult = await auditExistingDisapprovals(gmcId, accessToken);
        console.info(
          `[Direct Link Audit] Found ${auditResult.disapprovals.length} disapprovals out of ${auditResult.totalAudited} items.`
        );

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

        if (claimResult.store) {
          await dispatchInitialAuditSlackNotification({
            store: claimResult.store,
            disapprovals: auditResult.disapprovals,
            totalAudited: auditResult.totalAudited,
            appUrl: origin,
          });
        }
      } catch (auditErr) {
        console.error('[Direct Link Audit Error]', auditErr);
      }
    });

    // Redirect user straight to the active dashboard
    const redirectUrl = session.role === 'admin'
      ? '/admin/dashboard?tab=stores&just_connected=true'
      : `/dashboard?just_connected=true&store_id=${claimResult.store?.id || ''}`;

    const response = NextResponse.json({
      success: true,
      store: claimResult.store,
      redirectUrl,
    });

    // Clear pending OAuth cookie after successful linking
    response.cookies.delete('kultra_gmc_pending');

    return response;
  } catch (error) {
    console.error('[Direct GMC Link Error]', error);
    return NextResponse.json(
      { error: 'Failed to link Google Merchant Center account directly.' },
      { status: 500 }
    );
  }
}
