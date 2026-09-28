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
  findTenantByEmail,
  updateIncidentNotificationStatus,
} from '@/lib/db';
import { evaluateSubscription } from '@/lib/subscription';
import { dispatchDisapprovalSlackNotification } from '@/lib/slack';

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

    // Support both direct attributes and Google Merchant Center PubSub issues array
    const hasIssuesArray = Array.isArray(eventData.issues);
    const firstIssue = hasIssuesArray && eventData.issues.length > 0 ? eventData.issues[0] : null;

    const issueCode =
      eventData.issue_code ||
      eventData.reason ||
      eventData.policy_code ||
      (firstIssue ? (firstIssue.code || firstIssue.reason || firstIssue.issue_code) : null) ||
      'missing_required_attribute [gtin]';

    // Status resolution:
    // If eventData.status is explicit, use it.
    // If eventData.issues is an array:
    //   If empty (issues.length === 0), it indicates Google re-approved the item (all issues resolved).
    //   If non-empty, it indicates disapproval.
    // Default fallback: 'disapproved'
    let status = 'disapproved';
    if (eventData.status) {
      status = String(eventData.status).toLowerCase();
    } else if (hasIssuesArray) {
      status = eventData.issues.length === 0 ? 'resolved' : 'disapproved';
    }

    const issueSeverity = firstIssue?.severity ? String(firstIssue.severity).toLowerCase() : null;
    const severity: 'critical' | 'warning' = (status === 'demoted' || issueSeverity === 'warning' || issueSeverity === 'demoted') ? 'warning' : 'critical';

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

    // 6b. User Suspension & Trial Lockout Gate
    // If the account or store is suspended, immediately halt execution:
    // silence Slack alerts, halt event processing, acknowledge message.
    const tenant = store.tenant_email ? await findTenantByEmail(store.tenant_email) : null;
    const isSuspended = tenant?.status === 'suspended' || store.status === 'suspended';

    if (isSuspended) {
      console.log(
        `[PubSub Ingestion Gate] Muted processing for store '${store.store_url}' (owner: ${store.tenant_email || 'unknown'}): account or store is suspended.`
      );

      after(async () => {
        try {
          await markMessageProcessed(messageId);
        } catch (workerErr) {
          console.warn('[PubSub Ingestion Gate] Error marking message processed:', workerErr);
        }
      });

      return NextResponse.json(
        {
          ok: true,
          status: 'acknowledged',
          action: 'muted_suspended_account',
          message: 'Account or store is suspended. Pub/Sub processing halted.',
          messageId,
          latencyMs: Math.round(performance.now() - startTime),
        },
        { status: 200 }
      );
    }

    // 6c. Subscription Lifecycle & Trial Lockout Gate
    // If the account status is expired or canceled, immediately halt execution:
    // do not format or deliver Slack alert cards, do not upsert incidents.
    const subscriptionState = evaluateSubscription(tenant);

    if (subscriptionState.isLocked) {
      console.log(
        `[PubSub Ingestion Gate] Muted processing for store '${store.store_url}' (owner: ${store.tenant_email || 'unknown'}): subscription is ${subscriptionState.effectiveStatus} (isLocked=true)`
      );

      after(async () => {
        try {
          await markMessageProcessed(messageId);
        } catch (workerErr) {
          console.warn('[PubSub Ingestion Gate] Error marking message processed:', workerErr);
        }
      });

      return NextResponse.json(
        {
          ok: true,
          status: 'acknowledged',
          action: 'muted_expired_subscription',
          effectiveStatus: subscriptionState.effectiveStatus,
          messageId,
          latencyMs: Math.round(performance.now() - startTime),
        },
        { status: 200 }
      );
    }

    // 7. Incident Lifecycle State Logic (Auto-resolution)
    if (status === 'approved' || status === 'resolved') {
      try {
        await Promise.allSettled([
          markMessageProcessed(messageId),
          resolveIncident(store.id, sku),
        ]);
      } catch (resolveErr) {
        console.warn('[PubSub Ingestion] Auto-resolve error:', resolveErr);
      }

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

    // 8. Test / Simulation Flag Determination
    const isTestOrSim = Boolean(
      eventData.is_test ||
      eventData.is_simulated ||
      eventData.test ||
      sku.startsWith('DEMO-') ||
      sku === 'APX-TR-402' ||
      sku === 'OW-8842-BLK-M'
    );

    // 9. Outbound Alert Configuration & Spike Guard (Stage 6)
    const destination = store.webhook_url || store.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;
    let dispatchOutcome = 'skipped_no_destination';
    let alertCard: Record<string, unknown> | null = null;

    let volumeInWindow = 0;
    if (destination) {
      volumeInWindow = await getStoreIncidentCountInWindow(store.id, 60);

      const gmcDiagnosticsUrl = `https://merchants.google.com/mc/items/details?account=${encodeURIComponent(merchantId)}&item=${encodeURIComponent(sku)}`;

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
        dispatchOutcome = 'individual_alert_scheduled';
      }
    }

    const initialNotificationStatus = !destination ? 'skipped' : 'pending';

    // 10. Immediate Authoritative Neon Postgres Persistence (Directive 1: zero data loss)
    const { incident: persistedIncident, isNew } = await upsertIncident({
      storeId: store.id,
      gmcId: merchantId,
      sku,
      external_product_id: sku,
      title,
      issueCode,
      severity,
      tenant_email: store.tenant_email,
      notification_status: initialNotificationStatus,
      is_simulated: isTestOrSim,
      is_test: isTestOrSim,
      details: eventData,
    });

    // Mark message processed immediately
    await markMessageProcessed(messageId);

    // 11. Downstream Alert Execution & Notification Delivery Tracking
    if (!isTestOrSim && destination) {
      after(async () => {
        try {
          if (volumeInWindow >= 10 && alertCard) {
            const startDispatch = performance.now();
            try {
              const dispatchRes = await fetch(destination, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alertCard),
                signal: AbortSignal.timeout(3000), // Strict 3s timeout guard
              });
              const latency_ms = Math.round(performance.now() - startDispatch);

              if (dispatchRes.ok) {
                await updateIncidentNotificationStatus(persistedIncident.id, 'delivered');
                await recordDispatchLog({
                  dispatch_id: `dsp-${Date.now()}`,
                  tenant_email: store.tenant_email,
                  store_url: store.store_url,
                  store_name: store.store_name || store.store_url,
                  gmc_id: store.gmc_id,
                  destination,
                  delivery_status: 200,
                  status_label: 'Delivered',
                  latency_ms,
                  payload: alertCard,
                });
              } else {
                await updateIncidentNotificationStatus(persistedIncident.id, 'failed', `HTTP ${dispatchRes.status}`);
                if (dispatchRes.status === 404 || dispatchRes.status === 410) {
                  await markStoreAlertStatus(store.id, 'degraded');
                }
                await recordDispatchLog({
                  dispatch_id: `dsp-${Date.now()}`,
                  tenant_email: store.tenant_email,
                  store_url: store.store_url,
                  store_name: store.store_name || store.store_url,
                  gmc_id: store.gmc_id,
                  destination,
                  delivery_status: dispatchRes.status,
                  status_label: dispatchRes.status === 404 ? 'Invalid Webhook' : 'Rate Limited',
                  latency_ms,
                  payload: alertCard,
                });
              }
            } catch (dispatchErr: unknown) {
              const err = dispatchErr as Error;
              const latency_ms = Math.round(performance.now() - startDispatch);
              await updateIncidentNotificationStatus(persistedIncident.id, 'failed', err.message || 'Network timeout');
              await recordDispatchLog({
                dispatch_id: `dsp-${Date.now()}`,
                tenant_email: store.tenant_email,
                store_url: store.store_url,
                store_name: store.store_name || store.store_url,
                gmc_id: store.gmc_id,
                destination,
                delivery_status: 502,
                status_label: 'Invalid Webhook',
                latency_ms,
                payload: { error: 'Network failure during delivery', alertCard },
              });
            }
          } else {
            const slackRes = await dispatchDisapprovalSlackNotification({
              store,
              incident: {
                sku,
                title,
                price: eventData.price || eventData.sale_price || null,
                issueCode,
                severity,
              },
              triggerType: 'Live Google Alert',
              appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://usekultra.com',
            });

            if (slackRes.success) {
              await updateIncidentNotificationStatus(persistedIncident.id, 'delivered');
            } else {
              await updateIncidentNotificationStatus(persistedIncident.id, 'failed', slackRes.error || slackRes.outcome);
            }
          }
        } catch (workerErr: unknown) {
          const err = workerErr as Error;
          console.error('[PubSub Ingestion Downstream Notification Error]', err);
          await updateIncidentNotificationStatus(persistedIncident.id, 'failed', err.message || 'Worker error');
        }
      });
    }

    const latencyMs = Math.round(performance.now() - startTime);

    // Guaranteed SLA: return 200 OK rapidly with authoritative persisted state
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
