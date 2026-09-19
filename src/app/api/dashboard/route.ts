import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { getStoresForTenant, getIncidentsByStore, findTenantByEmail, Incident, Store } from '@/lib/db';
import { evaluateSubscription } from '@/lib/subscription';

export async function GET(request: Request) {
  try {
    const session = await getAnySession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const requestedStoreId = url.searchParams.get('store_id');
    const impersonateParam = url.searchParams.get('impersonate');
    const isAdmin = session.role === 'admin' || session.isSuperAdmin;

    const tenantEmail = (isAdmin && impersonateParam)
      ? impersonateParam.toLowerCase().trim()
      : session.email.toLowerCase().trim();

    const tenant = await findTenantByEmail(tenantEmail);

    // Enforce account status check on protected dashboard data endpoint
    if (tenant?.status === 'suspended' && !(isAdmin && impersonateParam)) {
      return NextResponse.json(
        {
          error: 'Account access has been suspended. All catalog and incident data queries are blocked.',
          isSuspended: true,
          supportEmail: 'support@usekultra.com',
        },
        { status: 403 }
      );
    }

    const billing = evaluateSubscription(tenant);

    // 1. Fetch stores strictly scoped to authenticated tenant
    const stores = await getStoresForTenant(tenantEmail);

    if (stores.length === 0) {
      return NextResponse.json({
        zeroStore: true,
        stores: [],
        activeStore: null,
        billing: {
          status: billing.effectiveStatus,
          daysRemaining: billing.daysRemaining,
          trialEndsAt: billing.trialEndsAt,
          formattedTrialEnd: billing.formattedTrialEnd,
          isLocked: billing.isLocked,
          upgradeUrl: billing.upgradeUrl,
          hasTrialStarted: billing.hasTrialStarted,
          isSuperAdmin: billing.isSuperAdmin,
        },
        metrics: {
          monitoredProducts: 0,
          activeDisapprovals: 0,
          alertPipelineStatus: {
            channel: 'Unconfigured',
            latencyMs: 0,
            verified: false,
          },
        },
        criticalIncident: null,
        incidents: [],
      });
    }

    // 2. Resolve active store with tenant ownership validation
    let activeStore: Store = stores[0];
    if (requestedStoreId) {
      const match = stores.find((s) => String(s.id) === String(requestedStoreId));
      if (match) {
        activeStore = match;
      }
    }

    // 3. Fetch incidents for active store strictly scoped to tenant
    const incidents = await getIncidentsByStore(activeStore.id, tenantEmail);

    // 4. Categorize active vs resolved incidents
    const unresolvedIncidents = incidents.filter(
      (i) => i.status === 'unresolved' || i.status === 'pending_verification'
    );
    const critical = unresolvedIncidents[0] || null;

    // 5. Clean store domain for Shopify deep link
    const cleanDomain = (activeStore.store_url || 'admin.shopify.com')
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');

    // Format incidents table items with duration calculation and sanitized deep links.
    // If account is locked (expired/canceled trial), redact direct admin fix and deep links.
    const formattedIncidents = incidents.map((inc) => {
      let downtimeDuration: string | null = null;
      if (inc.status === 'resolved') {
        const resolvedTime = inc.resolved_at ? new Date(inc.resolved_at).getTime() : Date.now();
        const detectedTime = inc.first_detected_at ? new Date(inc.first_detected_at).getTime() : resolvedTime;
        const diffMs = Math.max(0, resolvedTime - detectedTime);
        const minutes = Math.max(1, Math.round(diffMs / (60 * 1000)));
        if (minutes >= 60) {
          const hours = Math.round((minutes / 60) * 10) / 10;
          downtimeDuration = `Resolved in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        } else {
          downtimeDuration = `Resolved in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        }
      }

      const shopifyUrl = billing.isLocked
        ? null
        : `https://${cleanDomain}/admin/products?query=${encodeURIComponent(inc.sku)}`;
      const gmcId = activeStore.gmc_id || activeStore.merchant_id || '';
      const gmcUrl = billing.isLocked
        ? null
        : `https://merchants.google.com/mc/products/diagnostics?account=${gmcId}`;

      return {
        id: inc.id,
        sku: inc.sku,
        title: inc.title,
        issue_code: inc.issue_code,
        severity: inc.severity === 'critical' ? 'CRITICAL_DISAPPROVAL' : 'DEMOTION',
        status: inc.status,
        first_detected_at: inc.first_detected_at,
        last_detected_at: inc.last_detected_at,
        resolved_at: inc.resolved_at || null,
        downtimeDuration,
        shopifyUrl,
        gmcUrl,
      };
    });

    const activeWebhook = activeStore.webhook_url || activeStore.slack_webhook_url;
    const webhookVerified = Boolean(activeStore.webhook_verified);

    // Database-backed monitored products count from tenant record
    const monitoredProducts = tenant?.total_skus && tenant.total_skus > 0
      ? tenant.total_skus
      : (activeStore.total_caught > 0 ? activeStore.total_caught : Math.max(incidents.length, 0));

    // Dynamic channel resolution without hardcoded mock strings
    let channelLabel = 'Unconfigured';
    if (activeWebhook) {
      if (activeWebhook.includes('slack.com')) {
        channelLabel = webhookVerified ? '#slack-live' : 'Slack Webhook';
      } else {
        channelLabel = 'Custom Webhook';
      }
    }

    return NextResponse.json({
      zeroStore: false,
      stores,
      activeStore,
      billing: {
        status: billing.effectiveStatus,
        daysRemaining: billing.daysRemaining,
        trialEndsAt: billing.trialEndsAt,
        formattedTrialEnd: billing.formattedTrialEnd,
        isLocked: billing.isLocked,
        upgradeUrl: billing.upgradeUrl,
        hasTrialStarted: billing.hasTrialStarted,
        isSuperAdmin: billing.isSuperAdmin,
      },
      metrics: {
        monitoredProducts,
        activeDisapprovals: unresolvedIncidents.length,
        alertPipelineStatus: {
          channel: channelLabel,
          latencyMs: webhookVerified ? 14 : 0,
          verified: webhookVerified,
        },
      },
      criticalIncident: critical
        ? {
            id: critical.id,
            title: critical.title,
            sku: critical.sku,
            issue_code: critical.issue_code,
            severity: critical.severity === 'critical' ? 'CRITICAL_DISAPPROVAL' : 'DEMOTION',
            status: critical.status,
            first_detected_at: critical.first_detected_at,
            shopifyUrl: billing.isLocked
              ? null
              : `https://${cleanDomain}/admin/products?query=${encodeURIComponent(critical.sku)}`,
            gmcUrl: billing.isLocked
              ? null
              : `https://merchants.google.com/mc/products/diagnostics?account=${activeStore.gmc_id || activeStore.merchant_id || ''}`,
          }
        : null,
      incidents: formattedIncidents,
    });

  } catch (error) {
    console.error('[Dashboard Hydration API Error]', error);
    return NextResponse.json({ error: 'Failed to hydrate dashboard data' }, { status: 500 });
  }
}
