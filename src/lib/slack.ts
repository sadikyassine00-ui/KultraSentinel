/**
 * Kultra Slack Notification Engine
 * Formats and dispatches high-urgency Block Kit cards for:
 * - Found Money Initial Audit Alerts (Scenario A)
 * - Clean Slate Operational Confirmation (Scenario B)
 * - Synthetic Fire Drill Simulation Alerts
 */

import { Store, recordDispatchLog } from './db';
import { DisapprovedItem } from './merchant_api';

interface DispatchInitialAuditParams {
  store: Store;
  disapprovals: DisapprovedItem[];
  totalAudited: number;
  appUrl?: string;
}

interface DispatchFireDrillParams {
  store: Store;
  appUrl?: string;
}

/**
 * Dispatches the "Found Money" alert (Scenario A) or "Clean Slate" alert (Scenario B)
 * directly to the store's configured Slack webhook destination.
 */
export async function dispatchInitialAuditSlackNotification({
  store,
  disapprovals,
  totalAudited,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usekultra.com',
}: DispatchInitialAuditParams): Promise<{ success: boolean; outcome: string }> {
  const webhookUrl = store.webhook_url || store.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false, outcome: 'skipped_no_webhook' };
  }

  const gmcId = store.gmc_id || store.merchant_id || 'UNKNOWN';
  const triageUrl = `${appUrl}/dashboard?store_id=${store.id}`;

  let payload: Record<string, unknown>;

  if (disapprovals.length > 0) {
    // Scenario A: Disapprovals Detected ($$$ Value Found Immediately)
    const count = disapprovals.length;
    const topOffenders = disapprovals.slice(0, 3);

    const offenderBlocks = topOffenders.map((item, idx) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${idx + 1}. SKU:* \`${item.offerId}\`\n*Title:* ${item.title}\n*Policy Failure:* \`${item.issueCode}\``,
      },
    }));

    payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 Kultra Shield Armed: ${count} Existing Disapprovals Detected`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `We ran an initial diagnostic check across your catalog. Google's crawler is currently blocking *${count} products* from shopping ad traffic.\n*Store:* \`${store.store_name || store.store_url}\` (GMC #${gmcId})`,
          },
        },
        {
          type: 'divider',
        },
        ...offenderBlocks,
        {
          type: 'divider',
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Triage Disapprovals in Kultra',
              },
              url: triageUrl,
              style: 'primary',
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Dispatched by Kultra Sentinel Event Engine at ${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };
  } else {
    // Scenario B: Zero Disapprovals (Clean Slate Confirmation)
    payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🛡️ Kultra Shield Armed: Catalog 100% Eligible',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Initial diagnostic sweep complete: *0 products* currently disapproved across ${
              totalAudited > 0 ? `${totalAudited} monitored` : 'all'
            } catalog items.\n*Store:* \`${store.store_name || store.store_url}\` (GMC #${gmcId})\n24/7 crawler monitoring active. We will ping this channel the second a crawler violation occurs.`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Telemetry Dashboard',
              },
              url: triageUrl,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Kultra Sentinel Monitoring Engine active at ${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    await recordDispatchLog({
      dispatch_id: `dsp-audit-${Date.now()}`,
      tenant_email: store.tenant_email,
      store_url: store.store_url,
      destination: webhookUrl,
      delivery_status: res.status,
      status_label: res.ok ? 'Delivered' : 'Invalid Webhook',
      payload,
    });

    return {
      success: res.ok,
      outcome: res.ok ? 'initial_audit_dispatched' : `failed_http_${res.status}`,
    };
  } catch (err) {
    console.error('[Slack Notification Engine] Error dispatching initial audit:', err);
    return { success: false, outcome: 'network_error' };
  }
}

/**
 * Dispatches a Synthetic Fire Drill crawler alert to test Slack delivery and layout
 */
export async function dispatchFireDrillSlackNotification({
  store,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usekultra.com',
}: DispatchFireDrillParams): Promise<{ success: boolean; outcome: string; error?: string }> {
  const webhookUrl = store.webhook_url || store.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      success: false,
      outcome: 'skipped_no_webhook',
      error: 'No Slack webhook configured for this store. Please configure alert routing first.',
    };
  }

  const cleanDomain = (store.store_url || 'admin.shopify.com')
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  const shopifyAdminEditUrl = `https://${cleanDomain}/admin/products?query=DEMO-RUNNER`;
  const triageUrl = `${appUrl}/dashboard?store_id=${store.id}`;
  const gmcId = store.gmc_id || store.merchant_id || 'DEMO';

  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 Kultra Fire Drill: Simulated Crawler Disapproval',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Synthetic Fire Drill:* Testing real-time triage dispatch to Slack.\n*Store:* \`${store.store_name || store.store_url}\` (GMC #${gmcId})\n*Environment:* \`[Simulation]\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Product:* Apex Carbon Runner - Size 10.5 (Demo Item)\n*SKU:* \`DEMO-RUNNER-402\`\n*Status:* \`CRITICAL_DISAPPROVAL\`\n*Policy Failure:* \`item_disapproved: missing_required_attribute [gtin]\``,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Fix in Store Backend' },
            url: shopifyAdminEditUrl,
            style: 'primary',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View in Kultra Dashboard' },
            url: triageUrl,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Simulated by team member via Kultra Dashboard at ${new Date().toISOString()}. Auto-purges in 15 minutes.`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    await recordDispatchLog({
      dispatch_id: `dsp-drill-${Date.now()}`,
      tenant_email: store.tenant_email,
      store_url: store.store_url,
      destination: webhookUrl,
      delivery_status: res.status,
      status_label: res.ok ? 'Delivered' : 'Invalid Webhook',
      payload,
    });

    return {
      success: res.ok,
      outcome: res.ok ? 'fire_drill_dispatched' : `failed_http_${res.status}`,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[Slack Notification Engine] Fire drill dispatch failed:', error);
    return {
      success: false,
      outcome: 'network_error',
      error: error.message || 'Connection refused or timed out connecting to Slack',
    };
  }
}
