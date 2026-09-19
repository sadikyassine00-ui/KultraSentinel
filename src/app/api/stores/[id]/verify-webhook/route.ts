import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { getStoreForTenant, updateStoreWebhook, isTenantSuspended, upsertIncident } from '@/lib/db';
import { validateWebhookUrl } from '@/lib/security';
import { dispatchDisapprovalSlackNotification } from '@/lib/slack';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 });
    }

    // 1. Authenticate user
    const session = await getAnySession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (await isTenantSuspended(session.email)) {
      return NextResponse.json(
        { error: 'Account access has been suspended. Please contact support@usekultra.com.', isSuspended: true },
        { status: 403 }
      );
    }

    // 2. Strict Active Store Parameter Validation (§1)
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400 }
      );
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

    // 3. Anti-IDOR Composite Authorization: verify tenant ownership of store
    const store = await getStoreForTenant(storeId, session.email);
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found or access unauthorized for active session.' },
        { status: 404 }
      );
    }

    const webhookUrl = (body.webhookUrl || store.webhook_url || store.slack_webhook_url) as string | undefined;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'No webhook destination provided or configured for this store.' },
        { status: 400 }
      );
    }

    // 4. Input Sanitization & Anti-SSRF Defense
    const validation = validateWebhookUrl(webhookUrl);
    if (!validation.valid || !validation.url) {
      return NextResponse.json(
        { error: validation.error || 'Invalid webhook destination' },
        { status: 400 }
      );
    }

    const sanitizedUrl = validation.url;
    const url = new URL(request.url);
    const origin = url.origin;

    // 5. Measure Round-Trip Delivery Latency and Dispatch Enriched Card (§3)
    const startTime = performance.now();

    const slackResult = await dispatchDisapprovalSlackNotification({
      store: {
        ...store,
        webhook_url: sanitizedUrl,
        slack_webhook_url: sanitizedUrl,
      },
      triggerType: 'Diagnostic Test Ping',
      appUrl: origin,
      incident: {
        sku: 'DEMO-RUNNER-402',
        title: 'Apex Carbon Runner - Size 10.5 (Demo Item)',
        price: '$165.00',
        issueCode: 'item_disapproved: missing_required_attribute [gtin]',
        severity: 'critical',
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);

    // 6. State Mutation, Scoped Incident Creation (§2), & Logging
    if (slackResult.success) {
      // Create temporary demo incident scoped strictly to this active store
      await upsertIncident({
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
          source: 'diagnostic_test_ping',
          issueDetail: 'Missing required attribute: gtin for apparel product variant',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      });

      await updateStoreWebhook(storeId, session.email, sanitizedUrl, true, 'active');

      return NextResponse.json({
        success: true,
        verified: true,
        latencyMs,
        message: `Test alert delivered to Slack in ${latencyMs}ms.`,
        payload: slackResult.payload,
      });
    } else {
      // Flag endpoint as invalid / degraded immediately
      await updateStoreWebhook(storeId, session.email, sanitizedUrl, false, 'degraded');

      return NextResponse.json(
        {
          success: false,
          verified: false,
          latencyMs,
          error: `Verification ping failed: ${slackResult.error || 'Destination rejected verification ping'}`,
          payload: slackResult.payload,
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('[Verify Webhook Error]', error);
    return NextResponse.json(
      { error: 'Internal server error verifying notification endpoint' },
      { status: 500 }
    );
  }
}
