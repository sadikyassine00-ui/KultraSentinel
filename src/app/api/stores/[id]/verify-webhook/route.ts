import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { getStoreForTenant, updateStoreWebhook, recordDispatchLog } from '@/lib/db';
import { validateWebhookUrl } from '@/lib/security';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 });
    }
    const storeId = isNaN(Number(id)) ? id : Number(id);

    // 1. Authenticate user
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // 2. Anti-IDOR Composite Authorization: verify tenant ownership of store
    const store = await getStoreForTenant(storeId, session.email);
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found or access unauthorized' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { webhookUrl } = body;

    // 3. Input Sanitization & Anti-SSRF Defense
    const validation = validateWebhookUrl(webhookUrl);
    if (!validation.valid || !validation.url) {
      return NextResponse.json(
        { error: validation.error || 'Invalid webhook destination' },
        { status: 400 }
      );
    }

    const sanitizedUrl = validation.url;

    // 4. Construct Synthetic Verification Payload (Block Kit format)
    const testPayload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Kultra Sentinel Webhook Verification Ping',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Synthetic Test:* Delivery latency benchmark from Kultra Event Engine.\n*Store:* \`${store.store_url}\` (GMC #${store.gmc_id})\n*Environment:* \`[Production]\``,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Dispatched at: ${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };

    // 5. Measure Round-Trip Delivery Latency
    const startTime = performance.now();
    let deliveryStatus = 500;
    let deliverySuccess = false;
    let deliveryError = '';

    try {
      // In test mode with simulated endpoint or external webhook
      const res = await fetch(sanitizedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(5000), // 5-second timeout safeguard
      });

      deliveryStatus = res.status;
      deliverySuccess = res.ok;
      if (!res.ok) {
        deliveryError = `Destination returned HTTP ${res.status}`;
      }
    } catch (err: unknown) {
      const e = err as Error;
      deliveryStatus = 502;
      deliverySuccess = false;
      deliveryError = e.message || 'Connection refused or timed out';
    }

    const latencyMs = Math.round(performance.now() - startTime);

    // 6. State Mutation & Logging
    if (deliverySuccess) {
      await updateStoreWebhook(storeId, session.email, sanitizedUrl, true, 'active');
      await recordDispatchLog({
        dispatch_id: `dsp-test-${Date.now()}`,
        tenant_email: session.email,
        store_url: store.store_url,
        destination: sanitizedUrl,
        delivery_status: deliveryStatus,
        status_label: 'Delivered',
        payload: testPayload,
      });

      return NextResponse.json({
        success: true,
        verified: true,
        latencyMs,
        message: 'Notification channel successfully verified and activated.',
      });
    } else {
      // Flag endpoint as invalid / degraded immediately
      await updateStoreWebhook(storeId, session.email, sanitizedUrl, false, 'degraded');
      await recordDispatchLog({
        dispatch_id: `dsp-test-${Date.now()}`,
        tenant_email: session.email,
        store_url: store.store_url,
        destination: sanitizedUrl,
        delivery_status: deliveryStatus,
        status_label: 'Invalid Webhook',
        payload: { error: deliveryError, testPayload },
      });

      return NextResponse.json(
        {
          success: false,
          verified: false,
          latencyMs,
          error: `Verification ping failed: ${deliveryError}`,
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
