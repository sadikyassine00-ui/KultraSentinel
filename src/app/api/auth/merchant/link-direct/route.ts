import { NextResponse, after } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { claimStoreForTenant, findTenantByEmail, upsertIncident } from '@/lib/db';
import { registerMerchantNotificationSubscription, auditExistingDisapprovals } from '@/lib/merchant_api';
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

    const encryptedRefreshToken = pendingData?.encryptedRefreshToken || undefined;
    const accessToken = pendingData?.accessToken || undefined;

    // Enforce strict Google Content API verification
    let storeName = body.storeName?.trim();
    if (accessToken) {
      try {
        const acctRes = await fetch(
          `https://shoppingcontent.googleapis.com/content/v2.1/${encodeURIComponent(gmcId)}/accounts/${encodeURIComponent(gmcId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );

        if (acctRes.ok) {
          const acctData = await acctRes.json();
          storeName = acctData.name || storeName || `Merchant Center #${gmcId}`;
        } else if (acctRes.status === 404 || acctRes.status === 403) {
          // Check if user has catalog productstatuses access (validates active GMC store for non-admin roles)
          let hasProductAccess = false;
          try {
            const productRes = await fetch(
              `https://shoppingcontent.googleapis.com/content/v2.1/${encodeURIComponent(gmcId)}/productstatuses?maxResults=1`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: 'application/json',
                },
              }
            );
            if (productRes.ok) {
              hasProductAccess = true;
              storeName = storeName || `Merchant Center #${gmcId}`;
            }
          } catch {
            // Ignored
          }

          if (!hasProductAccess) {
            const errText = await acctRes.text();
            console.warn(`[Direct GMC Link] Google rejected merchant #${gmcId} (HTTP ${acctRes.status}): ${errText}`);
            return NextResponse.json(
              { error: `Google Merchant Center account #${gmcId} not found or access denied for this Google identity.` },
              { status: 404 }
            );
          }
        }
      } catch (verifyErr) {
        console.warn(`[Direct GMC Link] Verification error for merchant #${gmcId}:`, verifyErr);
      }
    }

    if (!storeName) {
      storeName = `Merchant Center #${gmcId}`;
    }

    const tenant = await findTenantByEmail(session.email);
    const tenantId = tenant ? tenant.id : 1;
    const storeUrl = `https://merchants.google.com/mc/overview?account=${gmcId}`;
    const accountType = 'Standalone Merchant';

    // Claim store for tenant in Neon DB
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

    // If access token is available, register Pub/Sub topic and trigger initial catalog scan
    if (accessToken) {
      try {
        await registerMerchantNotificationSubscription({
          merchantId: gmcId,
          accessToken,
          pubsubTopic: claimResult.store?.pubsub_topic,
        });
      } catch (subErr) {
        console.warn('[Direct Link] Pub/Sub registration warning:', subErr);
      }

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
    }

    const redirectUrl = session.role === 'admin'
      ? '/admin/dashboard?tab=stores&just_connected=true'
      : `/dashboard?just_connected=true&store_id=${claimResult.store?.id || ''}`;

    const response = NextResponse.json({
      success: true,
      store: claimResult.store,
      redirectUrl,
    });

    // Clear pending OAuth cookie
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
