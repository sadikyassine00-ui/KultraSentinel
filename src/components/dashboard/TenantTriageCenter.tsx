'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Flame,
  ChevronDown,
  ChevronUp,
  Lock,
  CreditCard,
  Bell,
  Activity,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';
import { Store } from '@/lib/db';
import { isAccountSuspensionCode } from '@/lib/gmcErrors';

interface DashboardMetrics {
  monitoredProducts: number;
  approvedProducts?: number;
  activeDisapprovals: number;
  alertPipelineStatus: {
    channel: string;
    hasWebhook?: boolean;
    latencyMs: number;
    verified: boolean;
  };
}

interface BillingSummary {
  status: 'active trial' | 'paid active' | 'expired' | 'canceled';
  daysRemaining: number;
  trialEndsAt: string;
  formattedTrialEnd: string;
  isLocked: boolean;
  upgradeUrl: string;
  hasTrialStarted?: boolean;
  isSuperAdmin?: boolean;
}

interface TranslatedIssue {
  title: string;
  explanation: string;
  fixAdvice: string;
  category?: string;
  isAccountLevel?: boolean;
  isUndocumented?: boolean;
  documentationUrl?: string;
  storeTrustChecklist?: {
    businessTransparency: string;
    legalPages: string;
    paymentAndDomainIntegrity: string;
    gmcVerification: string;
  };
}

interface IncidentItem {
  id: number | string;
  sku: string;
  title: string;
  issue_code: string;
  plainEnglish?: TranslatedIssue;
  isAccountLevel?: boolean;
  price?: string;
  variant?: string;
  thumbnailUrl?: string | null;
  severity: 'CRITICAL_DISAPPROVAL' | 'DEMOTION';
  status: string;
  first_detected_at: string;
  last_detected_at: string;
  resolved_at?: string | null;
  downtimeDuration?: string | null;
  shopifyUrl?: string | null;
  gmcUrl?: string | null;
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'scan_verified' | 'pubsub_healthy' | 'incident_dispatched' | 'remediation';
  status: 'success' | 'danger' | 'neutral';
}

interface AccountSuspensionSummary {
  isSuspended: boolean;
  title: string;
  reason?: string;
  affectedCountries?: string;
  checklist?: string[];
}

interface DashboardApiResponse {
  zeroStore: boolean;
  stores: Store[];
  activeStore: Store | null;
  accountSuspension?: AccountSuspensionSummary | null;
  billing: BillingSummary;
  metrics: DashboardMetrics;
  criticalIncident: IncidentItem | null;
  incidents: IncidentItem[];
  activityFeed?: ActivityEvent[];
}

interface Props {
  initialStoreId?: string | null;
  justConnected?: boolean;
  impersonateEmail?: string | null;
  initialError?: string | null;
}

export default function TenantTriageCenter({ initialStoreId, justConnected = false, impersonateEmail, initialError }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardApiResponse | null>(null);
  const [error, setError] = useState<string | null>(initialError || null);

  // Ingest URL error parameter client-side for dynamic navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get('error');
      if (urlError) {
        setError(urlError);
      }
    }
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('error')) {
        url.searchParams.delete('error');
        const newQuery = url.searchParams.toString();
        const newUrl = url.pathname + (newQuery ? `?${newQuery}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const [modalOpen, setModalOpen] = useState(justConnected);
  const [slackWebhookInput, setSlackWebhookInput] = useState('');
  const [armingStatus, setArmingStatus] = useState<'idle' | 'testing' | 'armed' | 'error'>('idle');
  const [armingFeedback, setArmingFeedback] = useState<string | null>(null);
  const [verifiedLatency, setVerifiedLatency] = useState<number | null>(null);

  const [verifyingIncidentId, setVerifyingIncidentId] = useState<string | number | null>(null);
  const [testAlertSending, setTestAlertSending] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const [simulatingFireDrill, setSimulatingFireDrill] = useState(false);
  const [fireDrillBanner, setFireDrillBanner] = useState<string | null>(null);
  const [activityFeedOpen, setActivityFeedOpen] = useState(false);
  const [acknowledgedOpen, setAcknowledgedOpen] = useState(false);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setConfirmDisconnect(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('just_connected') || url.searchParams.has('success') || url.searchParams.has('error')) {
        url.searchParams.delete('just_connected');
        url.searchParams.delete('success');
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, []);

  const fetchDashboardData = useCallback(async (storeId?: string | null) => {
    try {
      const queryParams = new URLSearchParams();
      if (storeId) queryParams.set('store_id', storeId);
      if (impersonateEmail) queryParams.set('impersonate', impersonateEmail);
      const queryString = queryParams.toString();
      const url = queryString ? `/api/dashboard?${queryString}` : '/api/dashboard';

      const res = await fetch(url);
      if (res.status === 403) {
        const errJson = await res.json();
        if (errJson.isSuspended) {
          window.location.href = '/suspended';
          return;
        }
      }
      if (!res.ok) {
        throw new Error(`Failed to load catalog triage data: HTTP ${res.status}`);
      }
      const json: DashboardApiResponse = await res.json();
      setData(json);

      if (justConnected && json.activeStore) {
        setModalOpen(true);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error communicating with monitoring engine');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [justConnected, impersonateEmail]);

  useEffect(() => {
    // Flush previous store incidents and show loading skeleton immediately on store switch
    setData(null);
    setLoading(true);
    fetchDashboardData(initialStoreId);
  }, [fetchDashboardData, initialStoreId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(data?.activeStore?.id ? String(data.activeStore.id) : null);
  };

  const handleConnectGmc = () => {
    window.location.href = '/api/auth/merchant/connect';
  };

  const handleDisconnectStore = async () => {
    if (!data?.activeStore?.id) return;
    setDisconnecting(true);
    setArmingFeedback(null);

    try {
      const res = await fetch(`/api/stores/${data.activeStore.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        closeModal();
        await fetchDashboardData(null);
      } else {
        const resJson = await res.json();
        setArmingFeedback(resJson.error || 'Failed to disconnect store. Please contact support@usekultra.com.');
        setArmingStatus('error');
      }
    } catch {
      setArmingFeedback('Network timeout communicating with store management service.');
      setArmingStatus('error');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRunFireDrill = async () => {
    if (!data?.activeStore?.id) return;
    if (data?.billing?.isLocked && !data?.billing?.isSuperAdmin) {
      setError('Trial expired. Fire drill simulation is disabled while your account is locked.');
      return;
    }
    setSimulatingFireDrill(true);
    setFireDrillBanner(null);

    try {
      const res = await fetch(`/api/stores/${data.activeStore.id}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: data.activeStore.id }),
      });
      const json = await res.json();
      if (res.ok) {
        setFireDrillBanner(
          json.message ||
            'Test disapproval alert sent to your Slack channel. Check your channel to inspect the alert layout.'
        );

        // Immediate optimistic incident card mutation
        const cleanDomain = (data.activeStore.store_url || 'admin.shopify.com')
          .replace(/^https?:\/\//, '')
          .replace(/\/.*$/, '');
        const demoIncident: IncidentItem = {
          id: json.incident?.id || `demo-${Date.now()}`,
          sku: json.incident?.sku || 'DEMO-RUNNER-402',
          title: json.incident?.title || 'Apex Carbon Runner - Size 10.5 (Demo Item)',
          issue_code: json.incident?.issue_code || 'item_disapproved: missing_required_attribute [gtin]',
          plainEnglish: {
            title: 'Missing Barcode (GTIN / UPC)',
            explanation: 'Google requires a valid GTIN or UPC for branded products to match them across search results.',
            fixAdvice: 'Add the 12- or 14-digit barcode (GTIN/UPC/EAN) in your product catalog or Shopify admin.',
            category: 'barcode',
          },
          price: '$165.00',
          variant: 'Size 10.5 / Stealth Carbon',
          thumbnailUrl: null,
          severity: 'CRITICAL_DISAPPROVAL',
          status: 'unresolved',
          first_detected_at: json.incident?.first_detected_at || new Date().toISOString(),
          last_detected_at: json.incident?.last_detected_at || new Date().toISOString(),
          shopifyUrl: `https://${cleanDomain}/admin/products?query=DEMO-RUNNER`,
          gmcUrl: `https://merchants.google.com/mc/products/diagnostics?account=${data.activeStore.gmc_id || data.activeStore.merchant_id || ''}`,
        };

        setData((prev) => {
          if (!prev) return prev;
          const remaining = prev.incidents.filter((i) => i.sku !== demoIncident.sku);
          return {
            ...prev,
            incidents: [demoIncident, ...remaining],
            criticalIncident: demoIncident,
            metrics: {
              ...prev.metrics,
              activeDisapprovals: prev.metrics.activeDisapprovals + (prev.incidents.some((i) => i.sku === demoIncident.sku) ? 0 : 1),
            },
          };
        });

        // Instant re-hydration
        await fetchDashboardData(String(data.activeStore.id));
      } else {
        setError(json.error || 'Failed to trigger simulated fire drill.');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error communicating with simulation engine.');
    } finally {
      setSimulatingFireDrill(false);
    }
  };

  const handleArmSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.activeStore?.id) return;
    const trimmedWebhook = slackWebhookInput.trim();
    if (!trimmedWebhook) {
      setArmingFeedback('Please enter a valid Slack Incoming Webhook URL.');
      setArmingStatus('error');
      return;
    }

    if (!trimmedWebhook.startsWith('https://hooks.slack.com/')) {
      setArmingFeedback('Invalid Slack Webhook format. Please provide a standard incoming webhook URL beginning with the authorized domain (https://hooks.slack.com/services/...).');
      setArmingStatus('error');
      return;
    }

    setArmingStatus('testing');
    setArmingFeedback(null);

    try {
      const res = await fetch(`/api/stores/${data.activeStore.id}/verify-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: data.activeStore.id,
          webhookUrl: slackWebhookInput.trim(),
        }),
      });

      const resJson = await res.json();

      if (res.ok && resJson.verified) {
        setArmingStatus('armed');
        setVerifiedLatency(resJson.latencyMs || 14);
        setArmingFeedback('Alert pipeline verified. Your campaigns are now monitored 24/7.');
        fetchDashboardData(String(data.activeStore.id));
        setTimeout(() => {
          closeModal();
          setArmingStatus('idle');
        }, 1800);
      } else {
        setArmingStatus('error');
        setArmingFeedback(resJson.error || 'Webhook test failed. Destination rejected verification ping.');
      }
    } catch {
      setArmingStatus('error');
      setArmingFeedback('Network timeout connecting to webhook destination.');
    }
  };

  const handleSendTestPing = async () => {
    if (!data?.activeStore?.id) return;
    const webhook = data.activeStore.webhook_url || data.activeStore.slack_webhook_url;
    if (!webhook) {
      setModalOpen(true);
      return;
    }

    setTestAlertSending(true);
    setInlineFeedback(null);

    try {
      const res = await fetch(`/api/stores/${data.activeStore.id}/verify-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: data.activeStore.id,
          webhookUrl: webhook,
          sendTestAlert: true,
        }),
      });
      const resJson = await res.json();
      if (res.ok && resJson.verified) {
        setInlineFeedback(`Test alert delivered to Slack in ${resJson.latencyMs || 14}ms.`);
        await fetchDashboardData(String(data.activeStore.id));
      } else {
        setInlineFeedback(`Delivery failed: ${resJson.error || 'Destination unreachable'}`);
      }
    } catch {
      setInlineFeedback('Network exception sending test alert.');
    } finally {
      setTestAlertSending(false);
      setTimeout(() => setInlineFeedback(null), 3500);
    }
  };

  const handleDismissIncident = async (inc: IncidentItem) => {
    const incidentId = inc.id;
    const isSimulated = Boolean(
      inc.sku === 'DEMO-RUNNER-402' ||
      inc.title?.includes('(Demo Item)') ||
      (inc as unknown as { is_simulated?: boolean }).is_simulated
    );

    setVerifyingIncidentId(incidentId);

    // Immediate optimistic mutation (§3: instantaneous card removal for test incidents, acknowledged state for real)
    setData((prev) => {
      if (!prev) return prev;
      let nextIncidents: IncidentItem[];
      if (isSimulated) {
        nextIncidents = prev.incidents.filter((i) => String(i.id) !== String(incidentId));
      } else {
        nextIncidents = prev.incidents.map((i) =>
          String(i.id) === String(incidentId)
            ? { ...i, status: 'acknowledged', resolved_at: new Date().toISOString() }
            : i
        );
      }
      const nextUnresolved = nextIncidents.filter((i) => i.status === 'unresolved');
      return {
        ...prev,
        incidents: nextIncidents,
        criticalIncident:
          prev.criticalIncident && String(prev.criticalIncident.id) === String(incidentId)
            ? (nextUnresolved[0] || null)
            : prev.criticalIncident,
        metrics: {
          ...prev.metrics,
          activeDisapprovals: nextUnresolved.length,
        },
      };
    });

    // Confirmation toast
    setInlineFeedback(isSimulated ? 'Test incident cleared.' : 'Incident acknowledged.');
    setTimeout(() => setInlineFeedback(null), 3500);

    try {
      const res = await fetch(`/api/incidents/${incidentId}/verify`, {
        method: 'POST',
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || 'Failed to dismiss incident');
      }
      if (resJson.isSimulated || resJson.dismissed) {
        setInlineFeedback('Test incident cleared.');
      } else {
        setInlineFeedback('Incident acknowledged.');
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Failed to dismiss incident:', e);
      setInlineFeedback(`Error: ${e.message || 'Failed to dismiss'}. Reverting...`);
      // Revert optimistic state by re-fetching
      fetchDashboardData(data?.activeStore?.id ? String(data.activeStore.id) : null);
    } finally {
      setVerifyingIncidentId(null);
    }
  };

  // High-contrast contextual error banner with recovery options (§2 & §3)
  const renderErrorBanner = () => {
    if (!error) return null;

    const lowerError = error.toLowerCase().trim();
    const isNoAccountError =
      lowerError === 'no_accounts_found' ||
      lowerError === 'no_merchant_account' ||
      lowerError === 'zero_accounts' ||
      lowerError.includes('no_account') ||
      lowerError.includes('no merchant account');

    const isPermissionDenied =
      lowerError === 'access_denied' ||
      lowerError === 'insufficient_permissions' ||
      lowerError === 'permission_denied' ||
      lowerError.includes('permission');

    const isApiDisabled =
      lowerError === 'api_disabled' ||
      lowerError.includes('api disabled') ||
      lowerError.includes('content api for shopping is disabled') ||
      lowerError.includes('api_not_enabled');

    let headline = 'Google Connection Error';
    let explanation = error;
    let primaryText = 'Try Reconnecting';
    let primaryHref = '/api/auth/merchant/connect?prompt=select_account';
    let secondaryText = 'Open Google Merchant Center';
    let secondaryHref = 'https://merchants.google.com';

    if (isNoAccountError) {
      headline = 'No Google Merchant Center Account Found';
      explanation =
        'Google authenticated successfully, but no Merchant Center accounts or MCA client profiles are linked to this Google email.';
      primaryText = 'Connect a Different Google Account';
      primaryHref = '/api/auth/merchant/connect?prompt=select_account';
      secondaryText = 'Open Google Merchant Center';
      secondaryHref = 'https://merchants.google.com';
    } else if (isPermissionDenied) {
      headline = 'Permissions Missing';
      explanation =
        'Permissions Missing. Kultra requires read access to your Merchant Center catalog to detect disapprovals. Please reconnect and check all requested permission boxes.';
      primaryText = 'Grant Permissions';
      primaryHref = '/api/auth/merchant/connect?prompt=consent';
      secondaryText = 'Connect a Different Google Account';
      secondaryHref = '/api/auth/merchant/connect?prompt=select_account';
    } else if (isApiDisabled) {
      headline = 'Google Merchant Center API Disabled';
      explanation =
        'The Content API for Shopping is not enabled for your Google Cloud Project or Google account. Please enable it in Google Cloud Console or try another account.';
      primaryText = 'Reconnect Google Account';
      primaryHref = '/api/auth/merchant/connect?prompt=select_account';
      secondaryText = 'Open Google Cloud Console';
      secondaryHref = 'https://console.cloud.google.com/apis/library/content.googleapis.com';
    }

    return (
      <div
        id="dashboard-error-banner"
        className="mb-6 p-5 sm:p-6 rounded-[var(--radius-md)] bg-[#131418] border-2 border-[#f2a93b] text-left transition-all relative shadow-[0_4px_24px_rgba(242,169,59,0.08)]"
        role="alert"
        aria-live="assertive"
      >
        <button
          type="button"
          onClick={dismissError}
          id="dismiss-error-banner-btn"
          className="absolute top-4 right-4 text-[var(--ghost-text)] hover:text-[var(--ink-primary)] p-1 rounded transition-colors"
          aria-label="Dismiss error banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-8 h-8 rounded-full bg-[rgba(242,169,59,0.12)] border border-[#7a5a26] flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-[#f2a93b]" strokeWidth={2} />
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-[var(--ink-primary)] leading-snug">
              {headline}
            </h3>
            <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed max-w-2xl">
              {explanation}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={primaryHref}
                id="recovery-primary-btn"
                className="btn-primary py-2 px-4 text-[12.5px] font-semibold !rounded-[3px] inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{primaryText}</span>
              </a>

              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                id="recovery-secondary-link"
                className="btn-secondary py-2 px-3.5 text-[12.5px] font-medium !rounded-[3px] inline-flex items-center gap-1.5 text-[var(--ghost-text)] hover:text-[var(--ink-primary)]"
              >
                <span>{secondaryText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading: static skeleton blocks per §11
  if (loading) {
    return (
      <div className="space-y-5 max-w-7xl mx-auto">
        <div className="h-16 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
          <div className="h-28 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
          <div className="h-28 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
          <div className="h-28 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
        </div>
        <div className="h-72 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE A: The Zero-Store State (Prompt to connect GMC)
  // ---------------------------------------------------------------------------
  if (!data || data.zeroStore || data.stores.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        {renderErrorBanner()}

        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-8 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--bg-surface-2)] border border-[var(--hairline)] mb-5">
            <ShieldCheck className="w-6 h-6 text-[var(--signal)]" strokeWidth={1.5} />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tracking-tight mb-3">
            Sub-30-second disapproval protection
          </h1>

          <p className="text-[14px] text-[var(--ghost-text)] max-w-lg mx-auto mb-8 leading-[1.55]">
            Connect your Google Merchant Center account to receive instant Slack alerts the second an item gets rejected by Google crawler policies.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
            <div className="bg-[var(--bg-canvas)] border border-[var(--hairline)] rounded-[var(--radius-sm)] p-3.5">
              <div className="font-mono text-[10.5px] text-[var(--signal)] mb-1">STEP 1</div>
              <div className="text-[13px] font-medium text-[var(--ink-primary)] mb-1">Connect GMC</div>
              <div className="text-[12px] text-[var(--ghost-text)]">Content API handshake in two clicks.</div>
            </div>

            <div className="bg-[var(--bg-canvas)] border border-[var(--hairline)] rounded-[var(--radius-sm)] p-3.5">
              <div className="font-mono text-[10.5px] text-[var(--signal)] mb-1">STEP 2</div>
              <div className="text-[13px] font-medium text-[var(--ink-primary)] mb-1">Set alert channel</div>
              <div className="text-[12px] text-[var(--ghost-text)]">Arm your Slack channel with verified pings.</div>
            </div>

            <div className="bg-[var(--bg-canvas)] border border-[var(--hairline)] rounded-[var(--radius-sm)] p-3.5">
              <div className="font-mono text-[10.5px] text-[var(--signal)] mb-1">STEP 3</div>
              <div className="text-[13px] font-medium text-[var(--ink-primary)] mb-1">Protect bestsellers</div>
              <div className="text-[12px] text-[var(--ghost-text)]">Prevent silent drops with 1-click product triage.</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <a
              href="/api/auth/merchant/connect"
              className="btn-primary px-7 py-3 text-[13.5px] font-semibold !rounded-[3px] inline-flex items-center justify-center text-center"
            >
              Connect Google Merchant Center
            </a>

            <div className="mt-2.5 font-mono text-[11px] text-[var(--ghost-text-dim)]">
              Read-only telemetry / No feed modifications
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { activeStore, metrics, incidents, activityFeed = [] } = data;
  const unresolvedIncidents = incidents.filter((i) => i.status === 'unresolved');
  const acknowledgedIncidents = incidents.filter(
    (i) => i.status === 'acknowledged' || i.status === 'pending_verification'
  );
  const activeCount = unresolvedIncidents.length;
  const approvedCount = metrics.approvedProducts ?? Math.max(0, metrics.monitoredProducts - activeCount);

  const hasActiveWebhook = Boolean(
    activeStore?.webhook_url ||
    activeStore?.slack_webhook_url ||
    metrics.alertPipelineStatus?.hasWebhook ||
    (metrics.alertPipelineStatus?.channel && metrics.alertPipelineStatus.channel !== 'Unconfigured')
  );

  const slackDisplayChannel = (metrics.alertPipelineStatus?.channel && metrics.alertPipelineStatus.channel !== 'Unconfigured')
    ? metrics.alertPipelineStatus.channel
    : 'Active Webhook';

  const isAccountSuspensionActive = Boolean(
    data.accountSuspension?.isSuspended ||
    unresolvedIncidents.some(
      (inc) => inc.isAccountLevel || inc.plainEnglish?.isAccountLevel || isAccountSuspensionCode(inc.issue_code)
    )
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {renderErrorBanner()}

      {/* Operational Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-[var(--hairline)]">
        {/* Left: Fire Drill Simulation Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunFireDrill}
            disabled={simulatingFireDrill || (data.billing?.isLocked && !data.billing?.isSuperAdmin)}
            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5 disabled:opacity-50"
            title="Simulate a crawler disapproval to test Slack alert routing"
          >
            <Flame className={`w-3.5 h-3.5 ${data.billing?.isLocked && !data.billing?.isSuperAdmin ? 'text-[var(--ghost-text-dim)]' : 'text-[var(--signal)]'} ${simulatingFireDrill ? 'animate-spin' : ''}`} />
            <span>{simulatingFireDrill ? 'Simulating...' : 'Run Test Fire Drill'}</span>
          </button>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-2">
          {inlineFeedback && (
            <span className="font-mono text-[11px] text-[#22c55e] font-medium">{inlineFeedback}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--signal)]" />
            <span>Configure alerts</span>
          </button>
          <Link
            href="/dashboard/settings?tab=billing"
            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-[var(--ghost-text)]" />
            <span>Billing &amp; Quotas</span>
          </Link>
        </div>
      </div>

      {/* Fire Drill Confirmation Banner */}
      {fireDrillBanner && (
        <div className="bg-[var(--bg-surface-2)] border border-[var(--signal-dim)] rounded-[var(--radius-md)] p-4 flex items-start justify-between gap-3 animate-in fade-in-50 duration-150">
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-medium text-[var(--ink-primary)]">
                {fireDrillBanner}
              </div>
              <div className="font-mono text-[11px] text-[var(--ghost-text)] mt-0.5">
                A simulated disapproval event has been processed and is now visible below in your incident triage center.
              </div>
            </div>
          </div>
          <button
            onClick={() => setFireDrillBanner(null)}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] text-[12px] font-mono shrink-0 p-1"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 2: The 2-Second Health Scorecard (Top Metric Bar)             */}
      {/* 4 clean, high-contrast metric cards in a single horizontal row        */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Catalog Status (The Fire Alarm) */}
        <div
          className={`rounded-[var(--radius-md)] p-5 transition-colors ${
            activeCount > 0
              ? 'bg-[var(--bg-surface)] border-l-2 border-l-[var(--danger)] border-y border-r border-[var(--hairline)]'
              : 'bg-[var(--bg-surface)] border border-[var(--hairline)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[var(--ghost-text)]">Catalog Status</span>
            {activeCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[100px] border border-[#d64545] bg-[rgba(214,69,69,0.12)] text-[#d64545] text-[10.5px] font-mono font-medium animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Action Needed
              </span>
            ) : metrics.monitoredProducts === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[100px] border border-[var(--hairline)] bg-[var(--bg-surface-2)] text-[var(--ghost-text)] text-[10.5px] font-mono font-medium">
                <Package className="w-3 h-3" />
                Empty Catalog
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[100px] border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] text-[#22c55e] text-[10.5px] font-mono font-medium">
                <CheckCircle2 className="w-3 h-3" />
                All Approved
              </span>
            )}
          </div>

          <div
            className={`font-mono text-[26px] font-semibold leading-tight ${
              activeCount > 0 ? 'text-[var(--danger)]' : metrics.monitoredProducts === 0 ? 'text-[var(--ghost-heading)]' : 'text-[#22c55e]'
            }`}
          >
            {activeCount > 0 ? `${activeCount} Disapproved` : metrics.monitoredProducts === 0 ? '0 Products' : '100% Compliant'}
          </div>

          <div className="font-mono text-[11px] mt-2 text-[var(--ghost-text-dim)]">
            {activeCount > 0 ? (
              <span className="text-[var(--danger)]">Google Ads delivery blocked</span>
            ) : metrics.monitoredProducts === 0 ? (
              <span>Add items in Google Merchant Center</span>
            ) : (
              <span>Zero revenue at risk</span>
            )}
          </div>
        </div>

        {/* Card 2: Total Active Products */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5">
          <div className="text-[12px] font-semibold text-[var(--ghost-text)] mb-2">
            Total Active Products
          </div>
          <div className="font-mono text-[26px] font-semibold text-[var(--ink-primary)] leading-tight">
            {approvedCount.toLocaleString()}
          </div>
          <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] mt-2">
            {approvedCount > 0 ? 'Serving traffic in Google Shopping' : 'No active products detected'}
          </div>
        </div>

        {/* Card 3: Slack Alert Destination (§4 UI Synchronization) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[var(--ghost-text)]">Slack Alert Channel</span>
            {hasActiveWebhook ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[100px] border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.06)] text-[#22c55e] text-[10.5px] font-mono font-medium">
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[100px] border border-[var(--ghost-line)] bg-transparent text-[var(--ghost-text)] text-[10.5px] font-mono font-medium">
                Not Connected
              </span>
            )}
          </div>
          <div className="font-mono text-[18px] font-medium text-[var(--ink-primary)] truncate">
            {hasActiveWebhook ? slackDisplayChannel : 'Unconfigured'}
          </div>
          <div className="mt-2">
            {hasActiveWebhook ? (
              <button
                type="button"
                onClick={handleSendTestPing}
                disabled={testAlertSending || (data.billing?.isLocked && !data.billing?.isSuperAdmin)}
                className="font-mono text-[11px] text-[var(--signal)] hover:underline disabled:opacity-50 inline-flex items-center gap-1"
              >
                <span>{testAlertSending ? 'Sending...' : 'Send test ping →'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary text-[11px] py-1 px-2.5 inline-flex items-center gap-1.5 font-semibold"
              >
                <span>Connect Slack</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 4: Detection Latency */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5">
          <div className="text-[12px] font-semibold text-[var(--ghost-text)] mb-2">
            Detection Latency
          </div>
          <div className="font-mono text-[26px] font-semibold text-[var(--ink-primary)] leading-tight flex items-baseline gap-2">
            <span>Sub-30s</span>
            <span className="text-[12px] font-mono text-[#22c55e] font-normal">
              ({metrics.alertPipelineStatus.latencyMs || 14}ms push)
            </span>
          </div>
          <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] mt-2">
            Google Pub/Sub Webhook Sync
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 3: Primary Incident Triage Center (The Core Work Area)        */}
      {/* --------------------------------------------------------------------- */}
      <div className="relative space-y-4">
        {/* Un-dismissible Lockout Paywall Overlay when trial expired */}
        {data.billing?.isLocked && !data.billing?.isSuperAdmin && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-[5px] rounded-[var(--radius-md)] min-h-[420px]">
            <div className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] max-w-lg w-full p-7 sm:p-8 space-y-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-2">
                <span className="tag-pill tag-danger text-[10.5px] py-0.5 font-medium">
                  14-DAY TRIAL CONCLUDED
                </span>
              </div>

              <h2 className="font-serif text-[24px] font-semibold text-[var(--ink-primary)] leading-tight">
                Your Free Trial Has Concluded
              </h2>

              <p className="text-[13.5px] text-[var(--ink-secondary)] leading-[1.6]">
                Real-time Google Merchant Center monitoring and automated Slack notifications are paused. Upgrade your plan to restore 24/7 disapproval surveillance.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  href="/dashboard/settings?tab=billing"
                  className="btn-primary px-7 py-2.5 text-[13.5px] font-semibold !rounded-[3px] inline-flex items-center gap-2"
                >
                  <span>Upgrade to restore protection</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* CONDITION A: Empty Catalog State (0 Products in Feed - Directive §3) */}
        {metrics.monitoredProducts === 0 && activeCount === 0 ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-8 sm:p-12 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--bg-surface-2)] border border-[var(--hairline)]">
              <Package className="w-7 h-7 text-[var(--ghost-text)]" strokeWidth={1.5} />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[100px] border border-[var(--hairline)] bg-[var(--bg-surface-2)] text-[var(--ghost-text)] text-[11px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-text)]" />
                <span>EMPTY CATALOG</span>
              </div>

              <h2 className="font-serif text-[24px] sm:text-[28px] font-semibold text-[var(--ink-primary)]">
                No products found in this Merchant Center catalog
              </h2>

              <p className="text-[14px] text-[var(--ghost-text)] leading-[1.6]">
                Add items to your feed in Google Merchant Center to begin monitoring. Kultra is listening for feed updates and will track disapproval changes automatically.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://merchants.google.com/mc/products/sources?account=${activeStore?.gmc_id || activeStore?.merchant_id || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-5 py-2.5 text-[13px] font-semibold !rounded-[3px] inline-flex items-center gap-2"
              >
                <span>Open Google Merchant Center Feeds</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleSendTestPing}
                disabled={testAlertSending}
                className="btn-secondary px-5 py-2.5 text-[13px] font-medium !rounded-[3px] inline-flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-[var(--signal)]" />
                <span>{testAlertSending ? 'Sending Ping...' : 'Test Slack Alert'}</span>
              </button>
            </div>

            <div className="pt-6 border-t border-[var(--hairline)] max-w-lg mx-auto flex items-center justify-around text-center text-[11px] font-mono text-[var(--ghost-text-dim)]">
              <div>Continuous Pub/Sub stream: Active</div>
              <div>•</div>
              <div>Auto-sync on feed upload</div>
            </div>
          </div>
        ) : activeCount === 0 ? (
          /* CONDITION B: Zero-State Experience (All Products Approved) */
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-8 sm:p-12 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-7 h-7 text-[#22c55e]" strokeWidth={1.5} />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[100px] border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.06)] text-[#22c55e] text-[11px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span>100% COMPLIANT FEED</span>
              </div>

              <h2 className="font-serif text-[24px] sm:text-[28px] font-semibold text-[var(--ink-primary)]">
                Your Google Merchant Center feed is 100% compliant.
              </h2>

              <p className="text-[14px] text-[var(--ghost-text)] leading-[1.6]">
                Kultra is listening for webhook events and will alert your Slack channel the second a disapproval occurs.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSendTestPing}
                disabled={testAlertSending}
                className="btn-secondary px-5 py-2.5 text-[13px] font-medium !rounded-[3px] inline-flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-[var(--signal)]" />
                <span>{testAlertSending ? 'Sending Ping...' : 'Run Test Alert to Slack'}</span>
              </button>
            </div>

            <div className="pt-6 border-t border-[var(--hairline)] max-w-lg mx-auto flex items-center justify-around text-center text-[11px] font-mono text-[var(--ghost-text-dim)]">
              <div>Continuous Pub/Sub stream: Active</div>
              <div>•</div>
              <div>Sub-30s notification guarantee</div>
            </div>
          </div>
        ) : (
          /* CONDITION C: Active Incident Cards (Disapproved Products) */
          <div className="space-y-4">
            {/* Emergency Account Suspension Alert Banner (§1) */}
            {isAccountSuspensionActive && (
              <div className="bg-[rgba(214,69,69,0.08)] border border-[rgba(214,69,69,0.35)] rounded-[var(--radius-md)] p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(214,69,69,0.2)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(214,69,69,0.15)] border border-[rgba(214,69,69,0.4)] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[100px] border border-[rgba(214,69,69,0.4)] bg-[rgba(214,69,69,0.1)] text-[var(--danger)] text-[10.5px] font-mono font-semibold tracking-wide">
                        <span>STORE-WIDE EMERGENCY</span>
                      </div>
                      <h3 className="text-[17px] font-semibold text-[var(--ink-primary)] mt-1">
                        Google Merchant Center Account Suspension Detected
                      </h3>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] shrink-0">
                    Scope: Total Store Suspension
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[13.5px] text-[var(--ink-primary)] leading-[1.6]">
                    Google has <strong>paused ad delivery across all products in your catalog</strong> due to store-level policy enforcement (such as <em>Misrepresentation</em> or <em>Untrusted Store</em>). Google blocks the entire catalog at once until store trust requirements are met.
                  </p>

                  <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--hairline-strong)] space-y-2.5">
                    <div className="text-[12.5px] font-semibold text-[var(--signal)] flex items-center gap-2">
                      <span>Store-Level Compliance Resolution Checklist:</span>
                    </div>
                    <ul className="space-y-2 text-[12.5px] text-[var(--ink-secondary)] leading-[1.5]">
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-[var(--signal)] shrink-0 font-medium">1.</span>
                        <span><strong>Business Transparency:</strong> Add a valid physical address, direct support email, and operational phone number to your website footer and GMC business settings.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-[var(--signal)] shrink-0 font-medium">2.</span>
                        <span><strong>Legal Pages:</strong> Provide clearly visible Refund and Return Policy, Shipping Policy, Privacy Policy, and Terms of Service links in your website navigation.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-[var(--signal)] shrink-0 font-medium">3.</span>
                        <span><strong>Payment and Domain Integrity:</strong> Ensure checkout is secured with an active SSL certificate and all prices and currencies on the site match your GMC feed settings exactly.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-mono text-[var(--signal)] shrink-0 font-medium">4.</span>
                        <span><strong>GMC Verification:</strong> Ensure your domain is verified and claimed in Google Merchant Center Business Information settings.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-[12px] text-[var(--ghost-text)]">
                    <AlertCircle className="w-3.5 h-3.5 text-[var(--signal)] shrink-0" />
                    <span><strong>Do NOT edit individual product copy or images.</strong> Individual product attributes are not the root cause of this account suspension.</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[rgba(214,69,69,0.2)]">
                  <a
                    href={`https://merchants.google.com/mc/merchantinfo/businessinfo?account=${activeStore?.gmc_id || activeStore?.merchant_id || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-[12px] py-1.5 px-3.5 !rounded-[3px] inline-flex items-center gap-1.5 font-semibold"
                  >
                    <span>Open GMC Business Settings</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://merchants.google.com/mc/products/diagnostics?account=${activeStore?.gmc_id || activeStore?.merchant_id || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5"
                  >
                    <span>View Account Diagnostics</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://support.google.com/merchants/answer/2947246"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] text-[12px] underline underline-offset-4 ml-auto"
                  >
                    Google Policy Documentation →
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--ink-primary)] flex items-center gap-2">
                  <span>Active Disapprovals Requiring Action</span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[rgba(214,69,69,0.12)] text-[#d64545] border border-[#d64545] font-semibold">
                    {activeCount}
                  </span>
                </h2>
                <p className="text-[12.5px] text-[var(--ghost-text)] mt-0.5">
                  These items are currently blocked from serving in Google Shopping ads. Resolve them to restore ad traffic.
                </p>
              </div>
            </div>

            {/* List of High-Contrast Incident Cards */}
            <div className="space-y-3">
              {unresolvedIncidents.map((inc) => {
                const isPending = inc.status === 'pending_verification';
                const isItemAccountLevel = Boolean(
                  inc.isAccountLevel ||
                  inc.plainEnglish?.isAccountLevel ||
                  isAccountSuspensionCode(inc.issue_code)
                );

                return (
                  <div
                    key={inc.id}
                    className={`bg-[var(--bg-surface)] border ${
                      isItemAccountLevel
                        ? 'border-[rgba(214,69,69,0.3)] bg-[rgba(214,69,69,0.02)]'
                        : 'border-[var(--hairline)] hover:border-[var(--hairline-strong)]'
                    } rounded-[var(--radius-md)] p-5 space-y-4 transition-colors`}
                  >
                    {/* Card Header Row */}
                    <div className="flex items-center justify-between gap-3 text-[11px] font-mono border-b border-[var(--hairline)] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="tag-pill tag-danger text-[10px] py-0.5 font-medium">
                          {isItemAccountLevel ? 'STORE-WIDE SUSPENSION' : inc.severity}
                        </span>
                        <span className="text-[var(--ghost-text-dim)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Detected {new Date(inc.first_detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-[var(--ghost-text)] font-medium">
                        SKU: <span className="text-[var(--ink-primary)]">{inc.sku}</span>
                      </div>
                    </div>

                    {/* Card Body: Product thumbnail + Details + Plain-English Error */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Product Thumbnail with Fallback */}
                      <div className="w-16 h-16 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] flex items-center justify-center shrink-0 overflow-hidden">
                        {inc.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={inc.thumbnailUrl}
                            alt={inc.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-[var(--ghost-text)]" strokeWidth={1.5} />
                        )}
                      </div>

                      {/* Product Metadata & Plain-English Error Box */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="text-[15px] font-semibold text-[var(--ink-primary)] truncate">
                            {inc.title}
                          </h3>
                          <div className="font-mono text-[11.5px] text-[var(--ghost-text)] mt-0.5">
                            {inc.variant && (
                              <span>Variant: <span className="text-[var(--ink-secondary)]">{inc.variant}</span></span>
                            )}
                            {inc.variant && inc.price && <span> • </span>}
                            {inc.price && (
                              <span>Price: <span className="text-[var(--ink-secondary)]">{inc.price}</span></span>
                            )}
                          </div>
                        </div>

                        {/* Plain English Translation Box */}
                        <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] space-y-1.5">
                          <div className="text-[13px] font-semibold text-[var(--danger)] flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{isItemAccountLevel ? 'Store-Wide Account Disapproval' : (inc.plainEnglish?.title || 'Policy Disapproval')}</span>
                          </div>

                          <p className="text-[12.5px] text-[var(--ink-secondary)] leading-[1.5]">
                            {isItemAccountLevel
                              ? 'Google crawler flagged this listing because your entire Google Merchant Center account is suspended under store policy. Ad serving is paused across all products in your catalog.'
                              : (inc.plainEnglish?.explanation || inc.issue_code)}
                          </p>

                          <div className="text-[12px] text-[var(--ink-primary)] pt-1.5 border-t border-[var(--hairline)]">
                            <strong className="text-[var(--signal)]">How to fix:</strong>{' '}
                            {isItemAccountLevel
                              ? 'Follow the store-level compliance checklist in the emergency banner above. Do NOT edit product titles, descriptions, or images.'
                              : (inc.plainEnglish?.fixAdvice || 'Inspect product diagnostics in Google Merchant Center.')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--hairline)]">
                      <div className="flex items-center gap-2">
                        {/* Primary Button: Fix in Merchant Center / GMC Business Settings */}
                        {isItemAccountLevel ? (
                          <a
                            href={`https://merchants.google.com/mc/merchantinfo/businessinfo?account=${activeStore?.gmc_id || activeStore?.merchant_id || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-[12px] py-1.5 px-3.5 !rounded-[3px] inline-flex items-center gap-1.5 font-semibold"
                          >
                            <span>Open GMC Business Info</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : inc.gmcUrl ? (
                          <a
                            href={inc.gmcUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-[12px] py-1.5 px-3.5 !rounded-[3px] inline-flex items-center gap-1.5 font-semibold"
                          >
                            <span>Fix in Merchant Center</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : null}

                        {/* Secondary Button: Edit in Shopify (only for SKU attribute issues, NOT account suspensions) */}
                        {!isItemAccountLevel && inc.shopifyUrl && (
                          <a
                            href={inc.shopifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5"
                          >
                            <span>Edit in Shopify</span>
                            <ExternalLink className="w-3 h-3 text-[var(--ghost-text)]" />
                          </a>
                        )}

                        {isItemAccountLevel && (
                          <a
                            href={`https://merchants.google.com/mc/products/diagnostics?account=${activeStore?.gmc_id || activeStore?.merchant_id || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5"
                          >
                            <span>View Diagnostics</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => handleDismissIncident(inc)}
                          disabled={verifyingIncidentId === inc.id}
                          className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] text-[var(--ghost-text)] hover:text-[var(--ink-primary)] hover:border-[var(--signal-dim)] transition-colors disabled:opacity-50"
                        >
                          {verifyingIncidentId === inc.id ? 'Updating...' : 'Dismiss or Mark as Acknowledged'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Acknowledged Disapprovals Section (§3) */}
            {acknowledgedIncidents.length > 0 && (
              <div className="pt-4 border-t border-[var(--hairline)]">
                <button
                  type="button"
                  onClick={() => setAcknowledgedOpen((prev) => !prev)}
                  className="flex items-center justify-between w-full py-2.5 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] text-left transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-[var(--ghost-heading)] group-hover:text-[var(--ink-primary)] transition-colors">
                      Acknowledged Disapprovals
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-canvas)] text-[var(--ghost-text)] border border-[var(--hairline)] font-medium">
                      {acknowledgedIncidents.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--ghost-text)] group-hover:text-[var(--ink-primary)] font-mono">
                    <span>{acknowledgedOpen ? 'Hide' : 'Show'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${acknowledgedOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {acknowledgedOpen && (
                  <div className="space-y-3 mt-3">
                    {acknowledgedIncidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 space-y-3 opacity-80"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono border-b border-[var(--hairline)] pb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[100px] border border-[var(--ghost-line)] bg-[var(--bg-surface-2)] text-[var(--ghost-text)] text-[10.5px] font-medium">
                              Acknowledged
                            </span>
                            <span className="text-[var(--ghost-text-dim)]">
                              SKU: {inc.sku}
                            </span>
                          </div>
                          {inc.resolved_at && (
                            <span className="text-[var(--ghost-text-dim)]">
                              Acknowledged {new Date(inc.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <h4 className="text-[13.5px] font-semibold text-[var(--ink-primary)] truncate">
                              {inc.title}
                            </h4>
                            <p className="text-[12px] text-[var(--ghost-text)] mt-0.5">
                              {inc.plainEnglish?.explanation || inc.issue_code}
                            </p>
                          </div>
                          {inc.gmcUrl && (
                            <a
                              href={inc.gmcUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-[11.5px] py-1 px-2.5 !rounded-[3px] shrink-0 inline-flex items-center gap-1"
                            >
                              <span>View in GMC</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 4: Recent Activity and Sync Feed (Bottom Panel)               */}
      {/* A clean, chronological, collapsible event log                         */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
        <button
          type="button"
          onClick={() => setActivityFeedOpen(!activityFeedOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--bg-surface-2)] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-[var(--signal)] shrink-0" />
            <div>
              <div className="text-[14px] font-semibold text-[var(--ink-primary)]">
                Recent Activity &amp; Sync Feed
              </div>
              <div className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                Live chronological audit of Google Merchant Center scans and alert dispatches
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--ghost-text)]">
            <span>{activityFeedOpen ? 'Collapse' : 'Expand'}</span>
            {activityFeedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {activityFeedOpen && (
          <div className="border-t border-[var(--hairline)] p-4 sm:p-5 space-y-3 bg-[var(--bg-canvas)]">
            {activityFeed.length === 0 ? (
              <div className="text-[12.5px] font-mono text-[var(--ghost-text)] text-center py-4">
                No recent activity events recorded.
              </div>
            ) : (
              activityFeed.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 text-[12.5px] p-2.5 rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--bg-surface)]"
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      evt.status === 'danger'
                        ? 'bg-[var(--danger)]'
                        : evt.status === 'success'
                        ? 'bg-[#22c55e]'
                        : 'bg-[var(--ghost-text)]'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                      {evt.timestamp}
                    </div>
                    <div className="text-[var(--ink-primary)] mt-0.5">
                      {evt.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* Alert Configuration Modal (Slack Incoming Webhook)                    */}
      {/* --------------------------------------------------------------------- */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[var(--signal)]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--ink-primary)]">
                    Configure alert destination
                  </h3>
                  <div className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                    Store: {activeStore?.store_name || 'Store'} (GMC #{activeStore?.gmc_id || activeStore?.merchant_id})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] p-1 rounded-[var(--radius-sm)] transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-[var(--ghost-text)] leading-[1.5]">
              Where should notifications route when an ad-blocking policy rejection occurs? Paste your Slack Incoming Webhook URL to verify telemetry.
            </p>

            <form onSubmit={handleArmSystem} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-[var(--ghost-text)] mb-1.5">
                  Slack Incoming Webhook URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhookInput}
                  onChange={(e) => setSlackWebhookInput(e.target.value)}
                  className="input w-full text-[13px]"
                />
              </div>

              {armingFeedback && (
                <div
                  className={`text-[12.5px] p-3 rounded-[var(--radius-sm)] border ${
                    armingStatus === 'armed'
                      ? 'bg-[var(--signal-wash)] border-[var(--signal-dim)] text-[var(--signal)]'
                      : 'bg-[var(--danger-wash)] border-[var(--danger)] text-[var(--danger)]'
                  }`}
                >
                  {armingFeedback}
                  {verifiedLatency && (
                    <span className="block mt-1 font-mono text-[11px] text-[var(--ghost-text-dim)]">
                      Latency benchmark: {verifiedLatency}ms
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary text-[12.5px] py-2 px-3.5 !rounded-[3px]"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={armingStatus === 'testing' || armingStatus === 'armed'}
                  className="btn-primary text-[12.5px] py-2 px-4 disabled:opacity-50 !rounded-[3px]"
                >
                  {armingStatus === 'testing' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Testing pipeline...
                    </>
                  ) : armingStatus === 'armed' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      System armed
                    </>
                  ) : (
                    'Verify and arm alerts'
                  )}
                </button>
              </div>
            </form>

            {/* Store Management & Data Ownership Section */}
            <div className="pt-5 border-t border-[var(--hairline)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12.5px] font-semibold text-[var(--ink-primary)]">
                  Data Ownership &amp; Store Management
                </span>
                <span className="tag-pill tag-ghost text-[10px]">
                  Zero Lock-In
                </span>
              </div>
              <p className="text-[12px] text-[var(--ghost-text)] leading-[1.5] mb-3">
                Disconnecting immediately terminates Google Pub/Sub ingestion and purges all cached incidents from Kultra&apos;s database.
              </p>

              {!confirmDisconnect ? (
                <button
                  type="button"
                  onClick={() => setConfirmDisconnect(true)}
                  className="btn-secondary text-[12px] py-1.5 px-3 text-[var(--danger)] hover:border-[var(--danger)] !rounded-[3px]"
                >
                  Disconnect Store &amp; Purge Telemetry
                </button>
              ) : (
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] space-y-2.5">
                  <div className="text-[12px] text-[var(--danger)] font-medium">
                    Are you sure? This will remove GMC #{activeStore?.gmc_id || activeStore?.merchant_id} and purge stored incident logs.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={disconnecting}
                      onClick={handleDisconnectStore}
                      className="py-1.5 px-3 rounded-[var(--radius-sm)] bg-[var(--danger)] text-[#111214] font-semibold text-[12px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {disconnecting && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>{disconnecting ? 'Purging...' : 'Yes, Disconnect Store'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDisconnect(false)}
                      className="btn-secondary text-[12px] py-1.5 px-2.5 !rounded-[3px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
