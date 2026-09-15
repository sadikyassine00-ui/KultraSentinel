import { NextResponse, after } from 'next/server';
import {
  isMessageProcessed,
  markMessageProcessed,
  findStoreByGmcId,
  hasOpenIncident,
  upsertIncident,
  resolveIncident,
  getStoreIncidentCountInWindow,
  markStoreAlertStatus,
  recordDLQMessage,
  recordDispatchLog,
} from '@/lib/db';

export async function POST(request: Request) {
  const startTime = performance.now();

  try {
    const url = new URL(request.url);

    // 1. Cryptographic / Token Push Verification (Stage 4)
    const expectedToken = process.env.PUBSUB_VERIFICATION_TOKEN;
    if (expectedToken) {
      const queryToken = url.searchParams.get('token') || url.searchParams.get('secret');
      const authHeader = request.headers.get('authorization') || '';
      const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const pushToken = request.headers.get('x-goog-pubsub-token') || queryToken || bearerToken;

      if (!pushToken || pushToken !== expectedToken) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing Pub/Sub push verification token' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();

    // 2. Extract Pub/Sub Message ID
    const messageId =
      body.message?.messageId ||
      body.message?.message_id ||
      body.messageId ||
      body.id ||
      `msg-${Date.now()}`;

    // 3. Message Deduplication (7-day window)
    const alreadyProcessed = await isMessageProcessed(messageId);
    if (alreadyProcessed) {
      return NextResponse.json(
        {
          ok: true,
          status: 'acknowledged',
          action: 'deduplicated',
          messageId,
          latencyMs: Math.round(performance.now() - startTime),
        },
        { status: 200 }
      );
    }

    // 4. Decode Google Cloud Pub/Sub base64 payload if applicable
    let eventData = body;
    if (body.message?.data) {
      try {
        const decoded = Buffer.from(body.message.data, 'base64').toString('utf8');
        eventData = JSON.parse(decoded);
      } catch (parseErr) {
        console.warn('[PubSub Ingestion] Failed to decode base64 data:', parseErr);
      }
    }

    // 5. Extract Event Attributes (Stage 5)
    const merchantId = String(
      eventData.merchant_id ||
      eventData.gmc_id ||
      eventData.merchantId ||
      eventData.accountId ||
      ''
    );

    const sku = String(
      eventData.sku ||
      eventData.offer_id ||
      eventData.productId ||
      eventData.offerId ||
      ''
    );

    const title = eventData.title || eventData.product_title || 'Untitled Catalog Item';
    const issueCode = eventData.issue_code || eventData.reason || eventData.policy_code || 'missing_required_attribute [gtin]';
    const status = String(eventData.status || 'disapproved').toLowerCase();
    const severity: 'critical' | 'warning' = status === 'demoted' ? 'warning' : 'critical';

    // 6. Store Lookup & DLQ Anomaly Routing
    const store = await findStoreByGmcId(merchantId);
    if (!store) {
      // Unregistered merchant: route to DLQ gracefully inside after(), acknowledge 200 OK immediately
      after(async () => {
        try {
          await Promise.allSettled([
            markMessageProcessed(messageId),
            recordDLQMessage({
              message_id: messageId,
              merchant_id: merchantId,
              failure_reason: `Unregistered Merchant Center Account ID: ${merchantId}`,
              payload: eventData,
            }),
          ]);
        } catch (workerErr) {
          console.error('[PubSub Ingestion Worker Error (DLQ)]', workerErr);
        }
      });

      return NextResponse.json(
        {
          ok: true,
          status: 'processed',
          action: 'dlq_routed',
          merchantId,
          latencyMs: Math.round(performance.now() - startTime),
        },
        { status: 200 }
      );
    }

    // 7. Incident Lifecycle State Logic (Auto-resolution)
    if (status === 'approved' || status === 'resolved') {
      after(async () => {
        try {
          await Promise.allSettled([
            markMessageProcessed(messageId),
            resolveIncident(store.id, sku),
          ]);
        } catch (workerErr) {
          console.error('[PubSub Ingestion Worker Error (Resolve)]', workerErr);
        }
      });

      return NextResponse.json(
        {
          ok: true,
          status: 'processed',
          action: 'incident_resolved',
          storeId: store.id,
          sku,
          latencyMs: Math.round(performance.now() - startTime),
        },
        { status: 200 }
      );
    }

    // 8. Disapproval / Demotion: check in-memory status for immediate response
    const isNew = !hasOpenIncident(store.id, sku, issueCode);

    // 9. Outbound Alert Dispatch & Spike Guard (Stage 6)
    const destination = store.webhook_url || process.env.SLACK_WEBHOOK_URL;
    let dispatchOutcome = 'skipped_no_destination';
    let alertCard: Record<string, unknown> | null = null;

    if (destination) {
      const volumeInWindow = await getStoreIncidentCountInWindow(store.id, 60);

      const gmcDiagnosticsUrl = `https://merchants.google.com/mc/items/diagnostics?accountId=${encodeURIComponent(merchantId)}&offerId=${encodeURIComponent(sku)}`;
      const storeAdminEditUrl = `https://${store.store_url}/admin/products?sku=${encodeURIComponent(sku)}`;

      if (volumeInWindow >= 10) {
        // Bulk Spike Guard activated: dispatch aggregated summary
        alertCard = {
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'Kultra Catalog Spike Guard: Bulk Disapproval Storm',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Catalog Feed Storm Detected:* \`${volumeInWindow}\` SKUs flagged within the last 60 seconds for *${store.store_name || store.store_url}*.\n*Environment:* \`[Production]\`\n*Latest Failing SKU:* \`${sku}\` (${issueCode})`,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Open GMC Diagnostics' },
                  url: gmcDiagnosticsUrl,
                  style: 'primary',
                },
              ],
            },
          ],
        };
        dispatchOutcome = 'bulk_spike_guard_dispatched';
      } else {
        // Standard Actionable Alert Card
        const severityLabel = severity === 'critical' ? 'Item Disapproved (Blocked)' : 'Item Demoted';
        alertCard = {
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'Kultra Instant Remediation Alert',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Store:* \`${store.store_name || store.store_url}\` (GMC #${merchantId})\n*Environment:* \`[Production]\`\n*SKU:* \`${sku}\` — *${title}*\n*Status:* \`${severityLabel}\`\n*Policy Failure:* \`${issueCode}\``,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Fix in Store Backend' },
                  url: storeAdminEditUrl,
                  style: 'primary',
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'GMC Item Diagnostics' },
                  url: gmcDiagnosticsUrl,
                },
              ],
            },
          ],
        };
        dispatchOutcome = 'individual_alert_dispatched';
      }
    }

    // Helper for non-blocking outbound webhook execution inside after()
    const dispatchAlert = async () => {
      if (!destination || !alertCard) return;
      try {
        const dispatchRes = await fetch(destination, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertCard),
          signal: AbortSignal.timeout(3000), // Strict 3s timeout guard
        });

        if (!dispatchRes.ok) {
          if (dispatchRes.status === 404 || dispatchRes.status === 410) {
            await markStoreAlertStatus(store.id, 'degraded');
          }

          await recordDispatchLog({
            dispatch_id: `dsp-${Date.now()}`,
            tenant_email: store.tenant_email,
            store_url: store.store_url,
            destination,
            delivery_status: dispatchRes.status,
            status_label: dispatchRes.status === 404 ? 'Invalid Webhook' : 'Rate Limited',
            payload: alertCard,
          });
        } else {
          await recordDispatchLog({
            dispatch_id: `dsp-${Date.now()}`,
            tenant_email: store.tenant_email,
            store_url: store.store_url,
            destination,
            delivery_status: 200,
            status_label: 'Delivered',
            payload: alertCard,
          });
        }
      } catch (dispatchErr: unknown) {
        console.warn('[PubSub Ingestion] Outbound dispatch error:', dispatchErr);
        await recordDispatchLog({
          dispatch_id: `dsp-${Date.now()}`,
          tenant_email: store.tenant_email,
          store_url: store.store_url,
          destination,
          delivery_status: 502,
          status_label: 'Invalid Webhook',
          payload: { error: 'Network failure during delivery', alertCard },
        });
      }
    };

    // 10. Schedule All Downstream Execution inside Next.js 15 after()
    after(async () => {
      try {
        await Promise.allSettled([
          markMessageProcessed(messageId),
          upsertIncident({
            storeId: store.id,
            gmcId: merchantId,
            sku,
            title,
            issueCode,
            severity,
            details: eventData,
          }),
          dispatchAlert(),
        ]);
      } catch (workerErr) {
        console.error('[PubSub Ingestion Worker Error (Incident)]', workerErr);
      }
    });

    const latencyMs = Math.round(performance.now() - startTime);

    // Guaranteed SLA: return 200 OK rapidly
    return NextResponse.json(
      {
        ok: true,
        status: 'processed',
        action: isNew ? 'incident_created' : 'incident_updated',
        storeId: store.id,
        dispatch: dispatchOutcome,
        latencyMs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PubSub Ingestion Critical Error]', error);
    return NextResponse.json(
      {
        ok: false,
        status: 'error_logged',
        error: 'Error processing catalog event',
        latencyMs: Math.round(performance.now() - startTime),
      },
      { status: 200 }
    );
  }
}
