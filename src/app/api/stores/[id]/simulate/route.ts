import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { getStoreByIdAndTenant, upsertIncident, findTenantByEmail } from '@/lib/db';
import { evaluateSubscription } from '@/lib/subscription';
import { dispatchFireDrillSlackNotification } from '@/lib/slack';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Synthetic Fire Drill Trigger (§4)
 * Dispatches simulated crawler disapproval Block Kit card to Slack
 * and creates temporary demo incident in Neon DB with 15-minute auto-purge.
 */
export async function POST(request: Request, context: RouteContext) {
  const session = await getAnySession(request);
  if (!session?.email) {
    return NextResponse.json(
      { error: 'Authentication required to run simulated fire drill.' },
      { status: 401 }
    );
  }

  // 14-Day Free Trial & Subscription Lockout Gate
  const tenant = await findTenantByEmail(session.email);
  if (tenant?.status === 'suspended') {
    return NextResponse.json(
      {
        error: 'Account access has been suspended. Please contact support@usekultra.com.',
        isSuspended: true,
      },
      { status: 403 }
    );
  }
  const billing = evaluateSubscription(tenant);
  if (billing.isLocked && !billing.isSuperAdmin) {
    return NextResponse.json(
      {
        error: 'Trial expired. Fire drill simulation is disabled while your account is locked. Please upgrade to restore full protection.',
        isLocked: true,
        upgradeUrl: billing.upgradeUrl,
      },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid store identifier.' }, { status: 400 });
  }

  // Enforce Active Store Parameter Passing (§1)
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // empty body fallback
  }

  const requestedStoreId = body.storeId ?? body.store_id;
  if (!requestedStoreId) {
    return NextResponse.json(
      { error: 'Missing required parameter: storeId must be explicitly provided in request body.' },
      { status: 400 }
    );
  }

  if (String(requestedStoreId) !== String(id)) {
    return NextResponse.json(
      { error: 'Mismatched storeId: request body storeId does not match target route.' },
      { status: 400 }
    );
  }

  const storeId: string | number = isNaN(Number(requestedStoreId)) ? String(requestedStoreId) : Number(requestedStoreId);

  // Anti-IDOR: verify store belongs to authenticated tenant
  const store = await getStoreByIdAndTenant(storeId, session.email);
  if (!store) {
    return NextResponse.json(
      { error: 'Store record not found or access denied for authenticated tenant.' },
      { status: 404 }
    );
  }

  try {
    const url = new URL(request.url);
    const origin = url.origin;

    const sku = (typeof body.sku === 'string' && body.sku.trim()) ? body.sku.trim() : 'DEMO-RUNNER-402';
    const title = (typeof body.title === 'string' && body.title.trim()) ? body.title.trim() : 'Apex Carbon Runner - Size 10.5 (Demo Item)';
    const issueCode = (typeof body.issueCode === 'string' && body.issueCode.trim()) ? body.issueCode.trim() : 'item_disapproved: missing_required_attribute [gtin]';

    // 1. Insert temporary demo incident flagged as is_simulated: true and is_test: true (15-min auto-purge)
    const incidentResult = await upsertIncident({
      storeId: store.id,
      gmcId: store.gmc_id || store.merchant_id || 'DEMO-GMC',
      sku,
      title,
      issueCode,
      severity: 'critical',
      tenant_email: session.email,
      is_simulated: true,
      is_test: true,
      details: {
        simulated: true,
        is_test: true,
        source: 'synthetic_fire_drill',
        issueDetail: 'Missing required attribute: gtin for apparel product variant',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    });

    // 2. Dispatch simulated crawler disapproval Block Kit card to configured Slack channel
    const slackResult = await dispatchFireDrillSlackNotification({
      store,
      appUrl: origin,
      incident: {
        sku,
        title,
        price: '$165.00',
        issueCode,
        severity: 'critical',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test disapproval alert sent to your Slack channel. Check your channel to inspect the alert layout.',
      incident: incidentResult.incident,
      slackOutcome: slackResult.outcome,
      slackDelivered: slackResult.success,
      slackError: slackResult.error,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Synthetic Fire Drill Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to execute fire drill simulation.' },
      { status: 500 }
    );
  }
}
