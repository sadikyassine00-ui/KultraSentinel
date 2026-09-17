import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { getStoreByIdAndTenant, upsertIncident } from '@/lib/db';
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

  const { id } = await context.params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid store identifier.' }, { status: 400 });
  }

  const storeId = isNaN(Number(id)) ? id : Number(id);

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

    // 1. Insert temporary demo incident flagged as is_simulated: true (15-min auto-purge)
    const incidentResult = await upsertIncident({
      storeId: store.id,
      gmcId: store.gmc_id || store.merchant_id || 'DEMO-GMC',
      sku: 'DEMO-RUNNER-402',
      title: 'Apex Carbon Runner - Size 10.5 (Demo Item)',
      issueCode: 'item_disapproved: missing_required_attribute [gtin]',
      severity: 'critical',
      tenant_email: session.email,
      is_simulated: true,
      details: {
        simulated: true,
        source: 'synthetic_fire_drill',
        issueDetail: 'Missing required attribute: gtin for apparel product variant',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    });

    // 2. Dispatch simulated crawler disapproval Block Kit card to configured Slack channel
    const slackResult = await dispatchFireDrillSlackNotification({
      store,
      appUrl: origin,
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
