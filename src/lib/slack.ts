/**
 * Kultra Slack Notification Engine
 * Formats and dispatches high-urgency Block Kit cards for:
 * - Found Money Initial Audit Alerts (Scenario A)
 * - Clean Slate Operational Confirmation (Scenario B)
 * - Synthetic Fire Drill Simulation Alerts
 */

import { Store, recordDispatchLog, markStoreAlertStatus } from './db';
import { DisapprovedItem } from './merchant_api';
import { translateGmcIssue } from './gmcErrors';

interface DispatchInitialAuditParams {
  store: Store;
  disapprovals: DisapprovedItem[];
  totalAudited: number;
  appUrl?: string;
}

export interface DispatchDisapprovalAlertParams {
  store: Store;
  incident?: {
    sku?: string;
    title?: string;
    price?: string | null;
    issueCode?: string;
    issue_code?: string;
    severity?: 'critical' | 'warning' | string;
  };
  triggerType?: 'Diagnostic Fire Drill' | 'Diagnostic Test Ping' | 'Live Google Alert';
  appUrl?: string;
}

export type DispatchFireDrillParams = DispatchDisapprovalAlertParams;

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
  if (store.status === 'suspended') {
    return { success: false, outcome: 'silenced_suspended_store' };
  }

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

  const startTime = performance.now();
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    const latency_ms = Math.round(performance.now() - startTime);

    await recordDispatchLog({
      dispatch_id: `dsp-audit-${Date.now()}`,
      tenant_email: store.tenant_email,
      store_url: store.store_url,
      store_name: store.store_name || store.store_url,
      gmc_id: store.gmc_id,
      destination: webhookUrl,
      delivery_status: res.status,
      status_label: res.ok ? 'Delivered' : 'Invalid Webhook',
      latency_ms,
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
 * Formats and dispatches an enriched disapproval alert card to the store's configured Slack destination.
 * Complies strictly with Directive §3:
 * - Dynamic Store Attribution Header: Store Name, GMC ID, Timestamp, Trigger Type
 * - Block 1: Incident summary with SKU, product title, and price
 * - Block 2: Plain-English explanation of why Google blocked the ad
 * - Block 3: Exact steps required to resolve the issue
 * - Block 4: Direct deep link button routing to Kultra incident triage
 */
export async function dispatchDisapprovalSlackNotification({
  store,
  incident,
  triggerType = 'Diagnostic Fire Drill',
  appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usekultra.com',
}: DispatchDisapprovalAlertParams): Promise<{ success: boolean; outcome: string; error?: string; payload?: Record<string, unknown> }> {
  if (store.status === 'suspended') {
    return {
      success: false,
      outcome: 'silenced_suspended_store',
      error: 'Store owner account is suspended. Outbound alert notifications are silenced.',
    };
  }

  const webhookUrl = store.webhook_url || store.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      success: false,
      outcome: 'skipped_no_webhook',
      error: 'No Slack webhook configured for this store. Please configure alert routing first.',
    };
  }

  const storeName = store.store_name || store.store_url || 'Store';
  const gmcId = store.gmc_id || store.merchant_id || 'UNKNOWN';
  const cleanDomain = (store.store_url || 'admin.shopify.com')
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');

  const sku = incident?.sku || 'DEMO-RUNNER-402';
  const title = incident?.title || 'Apex Carbon Runner - Size 10.5 (Demo Item)';
  const price = incident?.price || '$165.00';
  const rawIssueCode = incident?.issueCode || incident?.issue_code || 'item_disapproved: missing_required_attribute [gtin]';
  const severity = incident?.severity === 'warning' ? 'DEMOTION' : 'CRITICAL_DISAPPROVAL';
  
  const isSimulation = triggerType.includes('Diagnostic') || triggerType.includes('Fire Drill') || triggerType.includes('Test');
  const triageUrl = `${appUrl}/dashboard?store_id=${store.id}`;
  const shopifyAdminEditUrl = `https://${cleanDomain}/admin/products?query=${encodeURIComponent(sku)}`;
  const gmcDiagnosticsUrl = `https://merchants.google.com/mc/items/details?account=${gmcId}&item=${encodeURIComponent(sku)}`;

  // Plain-English error translation
  const plainEnglish = translateGmcIssue(rawIssueCode);

  const headerTitle = triggerType === 'Live Google Alert'
    ? '🚨 Kultra Alert: Disapproval Detected'
    : triggerType === 'Diagnostic Test Ping'
    ? '🚨 Kultra Test Alert: Diagnostic Channel Ping'
    : '🚨 Kultra Fire Drill: Simulated Crawler Disapproval';

  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerTitle,
        },
      },
      // Dynamic Store Attribution Header (§3)
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Store:* *${storeName}* (GMC #${gmcId})\n*Trigger:* \`${triggerType}\` • <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>\n*Environment:* \`${isSimulation ? '[Simulation]' : '[Production]'}\``,
        },
      },
      {
        type: 'divider',
      },
      // Block 1: Incident Summary
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Product:* ${title}\n*SKU:* \`${sku}\`\n*Price:* ${price}\n*Status:* \`${severity}\`\n*Policy Code:* \`${rawIssueCode}\``,
        },
      },
      // Block 2: Plain-English Explanation
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Why Google Blocked This Ad:*\n${plainEnglish.explanation}`,
        },
      },
      // Block 3: Exact Steps to Resolve
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*How to Fix:*\n${plainEnglish.fixAdvice}`,
        },
      },
      {
        type: 'divider',
      },
      // Block 4: Direct Deep Link Action Buttons
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Triage in Kultra' },
            url: triageUrl,
            style: 'primary',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Fix in Store Backend' },
            url: shopifyAdminEditUrl,
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Open GMC Diagnostics' },
            url: gmcDiagnosticsUrl,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Dispatched by Kultra Sentinel Event Engine • Sub-30s Google Pub/Sub Detection${isSimulation ? ' • Auto-purges in 15 minutes.' : ''}`,
          },
        ],
      },
    ],
  };

  const startTime = performance.now();
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    const latency_ms = Math.round(performance.now() - startTime);

    if (!res.ok && (res.status === 404 || res.status === 410)) {
      await markStoreAlertStatus(store.id, 'degraded');
    }

    await recordDispatchLog({
      dispatch_id: `dsp-alert-${Date.now()}`,
      tenant_email: store.tenant_email,
      store_url: store.store_url,
      store_name: store.store_name || store.store_url,
      gmc_id: store.gmc_id,
      destination: webhookUrl,
      delivery_status: res.status,
      status_label: res.ok ? 'Delivered' : 'Invalid Webhook',
      latency_ms,
      payload,
    });

    return {
      success: res.ok,
      outcome: res.ok ? 'disapproval_alert_dispatched' : `failed_http_${res.status}`,
      payload,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[Slack Notification Engine] Disapproval alert dispatch failed:', error);
    return {
      success: false,
      outcome: 'network_error',
      error: error.message || 'Connection refused or timed out connecting to Slack',
      payload,
    };
  }
}

export async function dispatchFireDrillSlackNotification(
  params: DispatchFireDrillParams
): Promise<{ success: boolean; outcome: string; error?: string }> {
  return dispatchDisapprovalSlackNotification({
    ...params,
    triggerType: params.triggerType || 'Diagnostic Fire Drill',
  });
}
