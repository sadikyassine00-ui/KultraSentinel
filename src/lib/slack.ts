/**
 * Kultra Slack Notification Engine
 * Formats and dispatches high-urgency Block Kit cards for:
 * - Found Money Initial Audit Alerts (Scenario A)
 * - Clean Slate Operational Confirmation (Scenario B)
 * - Synthetic Fire Drill Simulation Alerts
 */

import { Store, recordDispatchLog, markStoreAlertStatus } from './db';
import { DisapprovedItem } from './merchant_api';
import { translateGmcIssue, isAccountSuspensionCode } from './gmcErrors';

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
    variant?: string | null;
    issueCode?: string;
    issue_code?: string;
    severity?: 'critical' | 'warning' | string;
    targetCountries?: string[];
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
              text: `Dispatched by Kultra Alerts at ${new Date().toISOString()}`,
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
              text: `Kultra Monitoring Engine active at ${new Date().toISOString()}`,
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
  const variant = incident?.variant || null;
  const rawIssueCode = incident?.issueCode || incident?.issue_code || 'item_disapproved: missing_required_attribute [gtin]';
  const severity = incident?.severity === 'warning' ? 'DEMOTION' : 'CRITICAL_DISAPPROVAL';
  
  const isSimulation = triggerType.includes('Diagnostic') || triggerType.includes('Fire Drill') || triggerType.includes('Test');
  const triageUrl = `${appUrl}/dashboard?store_id=${store.id}`;
  const shopifyAdminEditUrl = `https://${cleanDomain}/admin/products?query=${encodeURIComponent(sku)}`;
  const gmcDiagnosticsUrl = `https://merchants.google.com/mc/items/details?account=${gmcId}&item=${encodeURIComponent(sku)}`;
  const gmcAccountSettingsUrl = `https://merchants.google.com/mc/merchantinfo/businessinfo?account=${gmcId}`;

  // Plain-English error translation
  const plainEnglish = translateGmcIssue(rawIssueCode);
  const isAccountSuspension = Boolean(plainEnglish.isAccountLevel || isAccountSuspensionCode(rawIssueCode));

  let payload: Record<string, unknown>;

  if (isAccountSuspension) {
    // -----------------------------------------------------------------------
    // Account Suspension Slack Payload (§3)
    // -----------------------------------------------------------------------
    const targetCountries = (incident?.targetCountries && incident.targetCountries.length > 0)
      ? incident.targetCountries.join(', ')
      : 'All Target Countries';

    payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Emergency Account Suspension Detected',
          },
        },
        // Store Attribution Header: Store name, authentic Merchant ID, and affected target countries
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Store:* *${storeName}* (GMC #${gmcId})\n*Affected Countries:* \`${targetCountries}\`\n*Scope:* \`TOTAL STORE-WIDE SUSPENSION\` • <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>\n*Environment:* \`${isSimulation ? '[Simulation]' : '[Production]'}\``,
          },
        },
        {
          type: 'divider',
        },
        // Diagnosis: Plain-English explanation of the store-wide policy block
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Diagnosis (Store-Wide Policy Block):*\n${plainEnglish.explanation}\n*Policy Enforcement Code:* \`${rawIssueCode}\``,
          },
        },
        // Action Plan: Concise 4-point compliance checklist covering store identity, legal footers, and GMC business information
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Store Compliance Action Plan:*\n` +
              `• *1. Business Transparency:* Add a valid physical address, direct support email, and operational phone number to your website footer and GMC business settings.\n` +
              `• *2. Legal Pages:* Provide clearly visible Refund and Return Policy, Shipping Policy, Privacy Policy, and Terms of Service links in your website navigation.\n` +
              `• *3. Payment & Domain Integrity:* Ensure checkout is secured with an active SSL certificate and all prices and currencies on the site match your GMC feed settings exactly.\n` +
              `• *4. GMC Verification:* Ensure domain is verified and claimed in Google Merchant Center Business Information settings.`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `⚠️ *Important:* Google has paused ad delivery across *all products at once*. Do NOT edit individual product titles, descriptions, or images. Fulfill the store trust requirements above, then request an account review in GMC.`,
            },
          ],
        },
        {
          type: 'divider',
        },
        // Direct deep link button routing to Kultra triage and Merchant Center account settings
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
              text: { type: 'plain_text', text: 'GMC Account Settings' },
              url: gmcAccountSettingsUrl,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Open GMC Diagnostics' },
              url: `https://merchants.google.com/mc/products/diagnostics?account=${gmcId}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Dispatched by Kultra Alerts • Sub-30s Google Pub/Sub Detection${isSimulation ? ' • Auto-purges in 15 minutes.' : ''}`,
            },
          ],
        },
      ],
    };
  } else {
    // -----------------------------------------------------------------------
    // SKU Disapproval Slack Payload (§3)
    // -----------------------------------------------------------------------
    const headerTitle = triggerType === 'Live Google Alert'
      ? '🚨 Item Disapproval Flagged'
      : triggerType === 'Diagnostic Test Ping'
      ? '🚨 Item Disapproval Flagged (Test Ping)'
      : '🚨 Item Disapproval Flagged (Simulated)';

    payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: headerTitle,
          },
        },
        // Dynamic Store Attribution Header (§3): Store Name and Merchant ID
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
        // Item Details: Product title, SKU, variant, and price
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Product:* ${title}\n*SKU:* \`${sku}\`${variant ? `\n*Variant:* ${variant}` : ''}\n*Price:* ${price}\n*Status:* \`${severity}\`\n*Policy Code:* \`${rawIssueCode}\``,
          },
        },
        // Diagnosis: Specific attribute failure translated into clear language
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Why Google Blocked This Ad:* (Diagnosis)\n${plainEnglish.explanation}`,
          },
        },
        // Resolution: Exact steps to fix the attribute in Shopify or the product feed
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*How to Fix:* (Resolution)\n${plainEnglish.fixAdvice}`,
          },
        },
        {
          type: 'divider',
        },
        // Direct deep link action buttons
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
              text: `Dispatched by Kultra Alerts • Sub-30s Google Pub/Sub Detection${isSimulation ? ' • Auto-purges in 15 minutes.' : ''}`,
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

/**
 * Dispatches an automated confirmation ping upon completing Slack OAuth connection.
 * Delivers immediate proof-of-value confirming real-time surveillance is live.
 */
export async function dispatchSlackWelcomePing({
  store,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usekultra.com',
}: {
  store: Store;
  appUrl?: string;
}): Promise<{ success: boolean; outcome: string; error?: string }> {
  const webhookUrl = store.webhook_url || store.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: false, outcome: 'skipped_no_webhook', error: 'No webhook URL found' };
  }

  const gmcId = store.gmc_id || store.merchant_id || 'UNKNOWN';
  const storeName = store.store_name || store.store_url || 'Merchant Store';
  const triageUrl = `${appUrl}/dashboard?store_id=${store.id}`;

  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🛡️ Kultra Shield Armed',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Real-time Google Merchant Center surveillance is now *LIVE* for *${storeName}* (GMC ID: \`${gmcId}\`).\n\nYour ad campaigns and shopping feed are actively protected. Policy disapprovals, account-level warnings, and item demotions will be dispatched to this channel in &lt; 30 seconds.`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Catalog Triage Dashboard',
              emoji: true,
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
            text: `Kultra Alerts | Real-Time Google Merchant API v1 Pub/Sub QoS-1 Stream`,
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

    await recordDispatchLog({
      dispatch_id: `dsp-welcome-${Date.now()}`,
      tenant_email: store.tenant_email,
      store_url: store.store_url,
      store_name: storeName,
      gmc_id: store.gmc_id,
      destination: webhookUrl,
      delivery_status: res.status,
      status_label: res.ok ? 'Delivered' : 'Invalid Webhook',
      latency_ms,
      payload,
    });

    return {
      success: res.ok,
      outcome: res.ok ? 'welcome_dispatched' : `failed_http_${res.status}`,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[Slack Notification Engine] Welcome ping failed:', error);
    return {
      success: false,
      outcome: 'network_error',
      error: error.message || 'Connection timeout to Slack',
    };
  }
}
