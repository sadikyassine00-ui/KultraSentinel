import { NextResponse, after } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { claimStoreForTenant, findTenantByEmail, upsertIncident } from '@/lib/db';
import { registerMerchantNotificationSubscription, auditExistingDisapprovals, DiscoveredGmcAccount } from '@/lib/merchant_api';
import { dispatchInitialAuditSlackNotification } from '@/lib/slack';

interface SelectCookieData {
  email: string;
  encryptedRefreshToken?: string | null;
  accessToken: string;
  accounts: DiscoveredGmcAccount[];
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

    const selectCookie = cookieStore.get('kultra_gmc_select')?.value;
    if (!selectCookie) {
      return NextResponse.json(
        { error: 'Account selection session expired. Please reconnect your Google account.' },
        { status: 400 }
      );
    }

    let selectData: SelectCookieData;
    try {
      selectData = JSON.parse(Buffer.from(selectCookie, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.json({ error: 'Invalid selection session data' }, { status: 400 });
    }

    // Verify session email matches cookie state
    if (selectData.email.toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: 'Tenant identity mismatch' }, { status: 403 });
    }

    const body = await request.json();
    const { merchantId } = body;

    if (!merchantId) {
      return NextResponse.json({ error: 'Missing merchantId parameter' }, { status: 400 });
    }

    const chosenAcct = selectData.accounts.find((a) => String(a.merchantId) === String(merchantId));
    if (!chosenAcct) {
      return NextResponse.json(
        { error: 'Selected Merchant Center account was not found in your Google profile.' },
        { status: 404 }
      );
    }

    const tenant = await findTenantByEmail(session.email);
    const tenantId = tenant ? tenant.id : 1;
    const storeUrl = chosenAcct.websiteUrl || `https://merchants.google.com/mc/overview?account=${chosenAcct.merchantId}`;
    const accountType = chosenAcct.isAggregator ? 'MCA Child' : 'Standalone Merchant';

    const claimResult = await claimStoreForTenant({
      gmcId: chosenAcct.merchantId,
      tenantId,
      tenantEmail: session.email,
      storeName: chosenAcct.name,
      storeUrl,
      encryptedRefreshToken: selectData.encryptedRefreshToken || undefined,
      accountType,
    });

    if (!claimResult.success) {
      return NextResponse.json(
        {
          error: claimResult.error || 'Failed to claim store.',
          collision: claimResult.collision,
        },
        { status: claimResult.collision ? 409 : 400 }
      );
    }

    // Auto-register Google Merchant Notifications API Pub/Sub pipeline
    await registerMerchantNotificationSubscription({
      merchantId: chosenAcct.merchantId,
      accessToken: selectData.accessToken,
      pubsubTopic: claimResult.store?.pubsub_topic,
    });

    // Non-blocking initial audit
    const origin = new URL(request.url).origin;
    after(async () => {
      try {
        console.info(`[Initial Audit] Scanning real catalog for GMC #${chosenAcct.merchantId}...`);
        const auditResult = await auditExistingDisapprovals(chosenAcct.merchantId, selectData.accessToken);
        console.info(
          `[Initial Audit] Discovered ${auditResult.disapprovals.length} authentic disapprovals out of ${auditResult.totalAudited} items.`
        );

        for (const item of auditResult.disapprovals) {
          await upsertIncident({
            storeId: claimResult.store?.id || 1,
            gmcId: chosenAcct.merchantId,
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
        console.error('[Initial Audit Error]', auditErr);
      }
    });

    const response = NextResponse.json({
      success: true,
      store: claimResult.store,
      redirectUrl: `/dashboard?just_connected=true&store_id=${claimResult.store?.id || ''}`,
    });

    response.cookies.delete('kultra_gmc_select');
    return response;
  } catch (error) {
    console.error('[Merchant Select Error]', error);
    return NextResponse.json({ error: 'Failed to complete store connection' }, { status: 500 });
  }
}
