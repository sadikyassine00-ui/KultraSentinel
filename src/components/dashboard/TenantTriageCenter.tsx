'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Store } from '@/lib/db';
import { isAccountSuspensionCode } from '@/lib/gmcErrors';

interface InventoryBreakdown {
  servingAds: number;
  expiringSoon: number;
  inReview: number;
  disapproved: number;
}

interface SurveillanceTelemetry {
  status: string;
  streamType?: string;
  pushLatencyMs?: number;
  eventVolume24h?: number;
  lastSyncTimestamp?: string;
  lastSyncFormatted?: string;
  itemsChecked?: number;
}

interface DashboardMetrics {
  monitoredProducts: number;
  approvedProducts?: number;
  activeDisapprovals: number;
  inventoryBreakdown?: InventoryBreakdown;
  surveillance?: SurveillanceTelemetry;
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
  isPastDue?: boolean;
  scheduledCancellationDate?: string | null;
  planTier?: string;
  planName?: string;
  monthlyPrice?: number;
  formattedPrice?: string;
  renewalOrExpirationDate?: string;
  formattedRenewalOrExpiration?: string;
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
  is_simulated?: boolean;
  is_test?: boolean;
  gmcUrl?: string | null;
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  rawTimestamp?: string;
  category?: 'Catalog Audit' | 'Pub/Sub Ingestion' | 'Webhook Latency' | 'Disapproval Guard' | 'Simulation Drill' | string;
  message: string;
  type?: 'scan_verified' | 'pubsub_healthy' | 'incident_dispatched' | 'remediation' | string;
  status: 'Nominal' | 'Active' | 'Resolved' | 'Simulation' | 'success' | 'danger' | 'neutral' | string;
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
  const [slackChannelInput, setSlackChannelInput] = useState('');
  const [manualSlackAccordionOpen, setManualSlackAccordionOpen] = useState(false);
  const [slackConnectedBanner, setSlackConnectedBanner] = useState<{
    show: boolean;
    channel: string;
  } | null>(null);
  const [slackErrorBanner, setSlackErrorBanner] = useState<string | null>(null);
  const [armingStatus, setArmingStatus] = useState<'idle' | 'testing' | 'armed' | 'error'>('idle');
  const [armingFeedback, setArmingFeedback] = useState<string | null>(null);
  const [verifiedLatency, setVerifiedLatency] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('slack_connected') === 'true') {
        const channel = url.searchParams.get('channel') || '#shopping-alerts';
        setSlackConnectedBanner({ show: true, channel });
        url.searchParams.delete('slack_connected');
        url.searchParams.delete('channel');
        const newQuery = url.searchParams.toString();
        const newUrl = url.pathname + (newQuery ? `?${newQuery}` : '');
        window.history.replaceState({}, '', newUrl);
      }
      if (url.searchParams.has('slack_error')) {
        const err = url.searchParams.get('slack_error') || 'Slack connection could not be completed';
        setSlackErrorBanner(err);
        url.searchParams.delete('slack_error');
        const newQuery = url.searchParams.toString();
        const newUrl = url.pathname + (newQuery ? `?${newQuery}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const [verifyingIncidentId, setVerifyingIncidentId] = useState<string | number | null>(null);
  const [testAlertSending, setTestAlertSending] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  // Manual Merchant ID Verification Fallback
  const [manualGmcId, setManualGmcId] = useState('');
  const [manualLinking, setManualLinking] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleManualLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualGmcId.replace(/\D/g, '').trim();
    if (!cleanId) return;

    setManualLinking(true);
    setManualError(null);

    try {
      const res = await fetch('/api/auth/merchant/link-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmcId: cleanId }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(
          resData.error ||
          `Google reported that your currently authenticated email does not have access to Merchant ID ${cleanId}. Reconnect with the correct Google email or grant access in Merchant Center.`
        );
      }

      // Success: clear error and reload dashboard data for newly linked store
      dismissError();
      if (resData.redirectUrl) {
        window.location.href = resData.redirectUrl;
      } else {
        await fetchDashboardData();
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setManualError(
        errorObj.message ||
        `Google reported that your currently authenticated email does not have access to Merchant ID ${cleanId}. Reconnect with the correct Google email or grant access in Merchant Center.`
      );
    } finally {
      setManualLinking(false);
    }
  };

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
      setError('Trial expired. Test alert verification is disabled while your account is locked.');
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
        const demoIncident: IncidentItem = {
          id: json.incident?.id || `demo-${Date.now()}`,
          sku: json.incident?.sku || 'DEMO-RUNNER-402',
          title: json.incident?.title || 'Apex Carbon Runner - Size 10.5 (Demo Item)',
          issue_code: json.incident?.issue_code || 'item_disapproved: missing_required_attribute [gtin]',
          plainEnglish: {
            title: 'Missing Barcode (GTIN / UPC)',
            explanation: 'Google requires a valid GTIN or UPC for branded products to match them across search results.',
            fixAdvice: 'Add the authentic 12- or 14-digit barcode (GTIN/UPC/EAN) in your product feed catalog or Merchant Center diagnostics.',
            category: 'barcode',
          },
          price: '$165.00',
          variant: 'Size 10.5 / Stealth Carbon',
          thumbnailUrl: null,
          severity: 'CRITICAL_DISAPPROVAL',
          status: 'unresolved',
          first_detected_at: json.incident?.first_detected_at || new Date().toISOString(),
          last_detected_at: json.incident?.last_detected_at || new Date().toISOString(),
          gmcUrl: `https://merchants.google.com/mc/items/details?account=${data.activeStore.gmc_id || data.activeStore.merchant_id || ''}&item=DEMO-RUNNER-402`,
        };

        const demoFeedEvent: ActivityEvent = {
          id: `sim-evt-${Date.now()}`,
          timestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
          category: 'Simulation Drill',
          message: `Test alert verification executed for SKU ${demoIncident.sku}. Isolated from production metrics.`,
          type: 'incident_dispatched',
          status: 'Simulation',
        };

        setData((prev) => {
          if (!prev) return prev;
          const remaining = prev.incidents.filter((i) => String(i.id) !== String(demoIncident.id));
          return {
            ...prev,
            incidents: [demoIncident, ...remaining],
            activityFeed: [demoFeedEvent, ...(prev.activityFeed || [])],
          };
        });

        // Instant re-hydration
        await fetchDashboardData(String(data.activeStore.id));
      } else {
        setError(json.error || 'Failed to send test alert.');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error communicating with alert testing service.');
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
          channel: slackChannelInput.trim() || undefined,
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
    const targetIdStr = String(incidentId ?? '').trim();
    if (!targetIdStr) return;

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
        // Strictly filter out ONLY the clicked incident matching targetIdStr
        nextIncidents = prev.incidents.filter((i) => String(i.id) !== targetIdStr);
      } else {
        // Strictly update ONLY the clicked incident matching targetIdStr
        nextIncidents = prev.incidents.map((i) =>
          String(i.id) === targetIdStr
            ? { ...i, status: 'acknowledged' as const, resolved_at: new Date().toISOString() }
            : i
        );
      }
      const nextUnresolved = nextIncidents.filter((i) => i.status === 'unresolved');
      const nextRealUnresolved = nextUnresolved.filter((i) => !i.is_simulated && !(i as unknown as { is_test?: boolean }).is_test && i.sku !== 'DEMO-RUNNER-402');
      return {
        ...prev,
        incidents: nextIncidents,
        criticalIncident:
          prev.criticalIncident && String(prev.criticalIncident.id) === targetIdStr
            ? (nextRealUnresolved[0] || null)
            : prev.criticalIncident,
        metrics: {
          ...prev.metrics,
          activeDisapprovals: nextRealUnresolved.length,
          approvedProducts: prev.metrics.monitoredProducts === 0
            ? 0
            : Math.max(0, (prev.metrics.monitoredProducts || 0) - nextRealUnresolved.length),
        },
      };
    });

    // Confirmation toast
    setInlineFeedback(isSimulated ? 'Test incident cleared.' : 'Incident acknowledged.');
    setTimeout(() => setInlineFeedback(null), 3500);

    try {
      // Outbound mutation payload explicitly sends unique incident identifier
      const res = await fetch(`/api/incidents/${encodeURIComponent(targetIdStr)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: inc.id,
          id: inc.id,
        }),
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
      // Revert only this specific incident without wiping out neighboring cards
      setData((prev) => {
        if (!prev) return prev;
        const restored = prev.incidents.map((i) =>
          String(i.id) === targetIdStr
            ? { ...i, status: 'unresolved' as const, resolved_at: null }
            : i
        );
        const restoredUnresolved = restored.filter((i) => i.status === 'unresolved');
        const restoredRealUnresolved = restoredUnresolved.filter((i) => !i.is_simulated && !(i as unknown as { is_test?: boolean }).is_test && i.sku !== 'DEMO-RUNNER-402');
        return {
          ...prev,
          incidents: restored,
          criticalIncident:
            !prev.criticalIncident || String(prev.criticalIncident.id) === targetIdStr
              ? (restoredRealUnresolved[0] || null)
              : prev.criticalIncident,
          metrics: {
            ...prev.metrics,
            activeDisapprovals: restoredRealUnresolved.length,
            approvedProducts: prev.metrics.monitoredProducts === 0
              ? 0
              : Math.max(0, (prev.metrics.monitoredProducts || 0) - restoredRealUnresolved.length),
          },
        };
      });
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

            {isNoAccountError && (
              <div className="mt-4 pt-3.5 border-t border-[var(--hairline)] max-w-xl">
                <div className="text-[12px] font-semibold text-[var(--ink-primary)] mb-1 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[var(--signal)]" />
                  <span>Already have a Merchant ID? Enter it directly.</span>
                </div>
                <p className="text-[11.5px] text-[var(--ghost-text)] mb-2.5 leading-relaxed">
                  Newly created accounts can take up to 30 minutes to appear in Google&apos;s directory index. Bypass the propagation delay by entering your 10-digit Merchant Center ID:
                </p>

                {manualError && (
                  <div className="mb-2.5 p-2 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-[11px] text-[var(--danger)] flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="leading-snug">{manualError}</span>
                  </div>
                )}

                <form onSubmit={handleManualLink} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={manualGmcId}
                    onChange={(e) => setManualGmcId(e.target.value)}
                    placeholder="e.g. 5857345262"
                    required
                    className="flex-1 bg-[var(--bg-canvas)] border border-[var(--hairline-strong)] focus:border-[var(--signal)] rounded-[var(--radius-sm)] px-3 py-1.5 text-[12px] font-mono text-[var(--ink-primary)] placeholder:text-[var(--ghost-text-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--signal-glow)]"
                  />
                  <button
                    type="submit"
                    disabled={manualLinking || !manualGmcId.trim()}
                    className="btn-primary py-1.5 px-3.5 text-[12px] font-semibold !rounded-[3px] inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {manualLinking ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify and Link Store</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPastDueBanner = () => {
    if (!data?.billing?.isPastDue || data?.billing?.isSuperAdmin) return null;

    return (
      <div
        id="past-due-grace-banner"
        className="mb-6 p-4 sm:p-5 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] border border-[var(--signal-dim)] text-left transition-all relative"
        role="alert"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-[var(--signal)]" strokeWidth={2} />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="tag-pill tag-signal text-[10.5px] py-0.5 font-medium">
                PAYMENT PAST DUE (GRACE PERIOD ACTIVE)
              </span>
            </div>
            <h3 className="text-[14.5px] font-semibold text-[var(--ink-primary)] leading-snug">
              Subscription Renewal Past Due
            </h3>
            <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed max-w-2xl">
              Your recent subscription payment did not go through. Critical Google Merchant Center monitoring and Slack alerts remain live during your grace period. Update your payment method in billing to avoid monitoring interruption.
            </p>

            <div className="pt-2">
              <Link
                href="/dashboard/settings?tab=billing"
                className="btn-primary py-1.5 px-4 text-[12.5px] font-semibold !rounded-[3px] inline-flex items-center gap-1.5"
              >
                <span>Update Payment Method</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScheduledCancellationBanner = () => {
    if (!data?.billing?.scheduledCancellationDate || data?.billing?.isLocked || data?.billing?.isSuperAdmin) return null;

    const cancelDate = new Date(data.billing.scheduledCancellationDate);
    if (isNaN(cancelDate.getTime()) || cancelDate.getTime() <= Date.now()) return null;

    const formattedDate = cancelDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <div
        id="scheduled-cancellation-banner"
        className="mb-6 p-4 sm:p-5 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline-strong)] text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="tag-pill tag-ghost text-[10.5px] py-0.5 font-medium">
              CANCELLATION SCHEDULED
            </span>
            <p className="text-[13px] text-[var(--ink-secondary)]">
              Your subscription is scheduled to cancel on <strong className="text-[var(--ink-primary)]">{formattedDate}</strong>. Full monitoring and alerts remain active until that time.
            </p>
          </div>
          <Link
            href="/dashboard/settings?tab=billing"
            className="btn-secondary py-1.5 px-3 text-[12px] !rounded-[3px] shrink-0 inline-flex items-center gap-1"
          >
            <span>Manage Subscription</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
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
    const lowerError = (error || '').toLowerCase().trim();
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

    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        {renderErrorBanner()}
        {renderPastDueBanner()}
        {renderScheduledCancellationBanner()}

        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-8 sm:p-10 text-center">
          {isNoAccountError ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--danger-wash)] border border-[var(--danger)] mb-5">
                <AlertTriangle className="w-6 h-6 text-[var(--danger)]" strokeWidth={1.5} />
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tracking-tight mb-3">
                No Google Merchant Center Account Found
              </h1>

              <p className="text-[14px] text-[var(--ghost-text)] max-w-lg mx-auto mb-6 leading-[1.55]">
                The Google account you just signed into does not have access to any Google Merchant Center stores. This usually happens when your merchant center is under a different Google email.
              </p>

              {/* Direct manual Merchant ID verification fallback */}
              <div className="my-6 p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12.5px] font-semibold text-[var(--ink-primary)] flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-[var(--signal)]" />
                    <span>Already have a Merchant ID? Enter it directly.</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--ghost-text-dim)]">Direct connect</span>
                </div>
                <p className="text-[12px] text-[var(--ghost-text)] leading-[1.5] mb-3">
                  Newly created Merchant Center accounts can take up to 30 minutes to appear in Google&apos;s directory index. Bypass the propagation delay by entering your 10-digit Merchant Center ID:
                </p>

                {manualError && (
                  <div className="mb-3 p-2.5 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-[11.5px] text-[var(--danger)] flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{manualError}</span>
                  </div>
                )}

                <form onSubmit={handleManualLink} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[var(--ghost-text)] mb-1">
                      Merchant Center ID (10 digits) *
                    </label>
                    <input
                      type="text"
                      value={manualGmcId}
                      onChange={(e) => setManualGmcId(e.target.value)}
                      placeholder="e.g. 5857345262"
                      required
                      className="w-full bg-[var(--bg-surface)] border border-[var(--hairline-strong)] focus:border-[var(--signal)] rounded-[var(--radius-sm)] px-3 py-2 text-[12.5px] font-mono text-[var(--ink-primary)] placeholder:text-[var(--ghost-text-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--signal-glow)] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={manualLinking || !manualGmcId.trim()}
                    className="btn-primary w-full py-2 px-3 text-[12.5px] font-semibold !rounded-[3px] inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {manualLinking ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying & Linking Store...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify and Link Store</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <a
                  href="/api/auth/merchant/connect?prompt=select_account"
                  className="btn-primary px-6 py-2.5 text-[13px] font-semibold !rounded-[3px] inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Connect with a Different Google Account</span>
                </a>

                <a
                  href="https://accounts.google.com/AccountChooser?continue=https://merchants.google.com/mc/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-6 py-2.5 text-[13px] font-semibold !rounded-[3px] inline-flex items-center justify-center gap-1.5 text-[var(--ghost-text)] hover:text-[var(--ink-primary)]"
                >
                  <span>Create a Google Merchant Center Account</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          ) : (
            <>
              {isPermissionDenied && (
                <div className="mb-6 p-4 rounded-[var(--radius-sm)] bg-[rgba(242,169,59,0.06)] border border-[#7a5a26] text-left">
                  <div className="text-[13px] font-medium text-[#f2a93b] mb-1">Permission Required</div>
                  <p className="text-[12px] text-[var(--ghost-text)] leading-relaxed">
                    Kultra requires read-only Content API access to intercept product disapprovals. Please grant the requested permissions.
                  </p>
                </div>
              )}

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
            </>
          )}
        </div>
      </div>
    );
  }

  const { activeStore, metrics, incidents, activityFeed = [] } = data;
  const unresolvedIncidents = incidents.filter((i) => i.status === 'unresolved');
  const realUnresolvedIncidents = unresolvedIncidents.filter(
    (i) => !i.is_simulated && !(i as unknown as { is_test?: boolean }).is_test && i.sku !== 'DEMO-RUNNER-402'
  );
  const acknowledgedIncidents = incidents.filter(
    (i) => i.status === 'acknowledged' || i.status === 'pending_verification'
  );
  const activeCount = realUnresolvedIncidents.length;
  const approvedCount = metrics.monitoredProducts === 0
    ? 0
    : (metrics.approvedProducts ?? Math.max(0, metrics.monitoredProducts - activeCount));

  // Dynamic calculation for Inventory Breakdown categories
  const expiringSoonCount = metrics.inventoryBreakdown?.expiringSoon ?? 0;
  const inReviewCount = metrics.inventoryBreakdown?.inReview ?? 0;
  const disapprovedCount = metrics.inventoryBreakdown?.disapproved !== undefined
    ? Math.max(metrics.inventoryBreakdown.disapproved, activeCount)
    : activeCount;
  const servingAdsCount = metrics.inventoryBreakdown?.servingAds !== undefined
    ? metrics.inventoryBreakdown.servingAds
    : Math.max(0, approvedCount - expiringSoonCount);

  // Reconciled catalog counts dynamically computing the true sum across all categories
  const computedInventorySum = servingAdsCount + expiringSoonCount + inReviewCount + disapprovedCount;
  const totalMonitoredCatalog = Math.max(
    metrics.monitoredProducts || 0,
    computedInventorySum,
    activeCount
  );

  const hasActiveWebhook = Boolean(
    activeStore?.webhook_url ||
    activeStore?.slack_webhook_url ||
    metrics.alertPipelineStatus?.hasWebhook ||
    (metrics.alertPipelineStatus?.channel && metrics.alertPipelineStatus.channel !== 'Unconfigured')
  );

  const rawChannel = activeStore?.slack_channel || (metrics.alertPipelineStatus?.channel && metrics.alertPipelineStatus.channel !== 'Unconfigured' ? metrics.alertPipelineStatus.channel : null);
  const slackDisplayChannel = rawChannel
    ? (rawChannel.startsWith('#') || rawChannel.startsWith('@') ? rawChannel : `#${rawChannel}`)
    : (hasActiveWebhook ? '#shopping-alerts' : 'Unconfigured');

  const isAccountSuspensionActive = Boolean(
    data.accountSuspension?.isSuspended ||
    unresolvedIncidents.some(
      (inc) => inc.isAccountLevel || inc.plainEnglish?.isAccountLevel || isAccountSuspensionCode(inc.issue_code)
    )
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0 max-w-full">
      {renderErrorBanner()}
      {renderPastDueBanner()}
      {renderScheduledCancellationBanner()}

      {/* Slack Connection Live Toast / Feedback Banner */}
      {slackConnectedBanner?.show && (
        <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--signal-wash)] border border-[var(--signal-dim)] text-[var(--ink-primary)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[13px] font-medium">
            <ShieldCheck className="w-4 h-4 text-[var(--signal)] shrink-0" />
            <span>
              Kultra Shield Armed: Real-time Google Merchant Center surveillance is live for{' '}
              <strong>{activeStore?.store_name || activeStore?.store_url}</strong> in{' '}
              <strong className="font-mono">{slackConnectedBanner.channel}</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSlackConnectedBanner(null)}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] text-xs font-mono p-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {slackErrorBanner && (
        <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-[var(--danger)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[13px]">
            <ShieldAlert className="w-4 h-4 text-[var(--danger)] shrink-0" />
            <span>Slack connection could not be completed: {slackErrorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSlackErrorBanner(null)}
            className="text-[var(--danger)]/70 hover:text-[var(--danger)] text-xs font-mono p-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Operational Action Bar (§2 Heartbeat Telemetry & Control Placement) */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 border-b border-[var(--hairline)]">
        {/* Left: Proof-of-work Heartbeat Telemetry */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2 font-mono text-[11px] sm:text-[12px] flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[var(--signal)] shrink-0" aria-hidden="true" />
            <span className="font-semibold text-[var(--ink-primary)]">Surveillance Active</span>
            <span className="text-[var(--ghost-line)]">/</span>
            <span className="text-[var(--ghost-text)]">Last sync {metrics.surveillance?.lastSyncFormatted || '2m ago'}</span>
            <span className="text-[var(--ghost-line)]">/</span>
            <span className={activeCount > 0 ? 'text-[var(--danger)] font-medium' : 'text-[var(--ghost-text)]'}>
              {activeCount === 0 ? '0 issues detected' : `${activeCount} ${activeCount === 1 ? 'issue' : 'issues'} detected`}
            </span>
            <span className="text-[var(--ghost-line)] hidden md:inline">/</span>
            <span className="text-[var(--ghost-text-dim)] hidden md:inline">
              {totalMonitoredCatalog.toLocaleString()} {totalMonitoredCatalog === 1 ? 'item monitored' : 'items monitored'}
            </span>
          </div>
        </div>

        {/* Right: Refined Action Hierarchy */}
        <div className="flex items-center flex-wrap gap-2">
          {inlineFeedback && (
            <span className="font-mono text-[11px] text-[var(--signal)] font-medium mr-1">{inlineFeedback}</span>
          )}
          <button
            type="button"
            onClick={handleRunFireDrill}
            disabled={simulatingFireDrill || (data.billing?.isLocked && !data.billing?.isSuperAdmin)}
            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5 border-[var(--hairline-strong)] hover:border-[var(--signal-dim)] hover:text-[var(--ink-primary)] disabled:opacity-50 transition-colors"
            title="Send a test disapproval alert to verify Slack channel routing"
          >
            <Bell className={`w-3.5 h-3.5 ${data.billing?.isLocked && !data.billing?.isSuperAdmin ? 'text-[var(--ghost-text-dim)]' : 'text-[var(--ghost-text)]'} ${simulatingFireDrill ? 'animate-spin' : ''}`} />
            <span>{simulatingFireDrill ? 'Sending Alert...' : 'Send Test Alert'}</span>
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5 border-[var(--hairline-strong)] hover:border-[var(--signal-dim)] hover:text-[var(--ink-primary)] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--signal)]" />
            <span>Configure alerts</span>
          </button>
        </div>
      </div>

      {/* Test Alert Confirmation Banner */}
      {fireDrillBanner && (
        <div className="bg-[var(--bg-surface-2)] border border-[var(--signal-dim)] rounded-[var(--radius-md)] p-4 flex items-start justify-between gap-3 animate-in fade-in-50 duration-150">
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-medium text-[var(--ink-primary)]">
                {fireDrillBanner}
              </div>
              <div className="font-mono text-[11px] text-[var(--ghost-text)] mt-0.5">
                A test disapproval alert has been dispatched to your configured destination.
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
      {/* SECTION 2: Restructured KPI Scorecards Grid (Adjusted Visual Hierarchy) */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Catalog Health and Risk (Dominant Primary Attention) */}
        <div
          className={`rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col justify-between transition-colors min-h-[175px] ${
            activeCount > 0
              ? 'bg-[var(--bg-surface)] border-l-2 border-l-[var(--danger)] border-y border-r border-[var(--hairline-strong)] shadow-[0_0_24px_rgba(214,69,69,0.06)]'
              : 'bg-[var(--bg-surface)] border border-[var(--hairline)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[12px] font-semibold text-[var(--ink-primary)] truncate">Catalog Health &amp; Risk</span>
              {activeCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--danger)] bg-[var(--danger-wash)] text-[var(--danger)] text-[10.5px] font-mono font-semibold shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Action Needed
                </span>
              ) : totalMonitoredCatalog === 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-transparent text-[var(--ghost-text)] text-[10px] font-mono font-medium shrink-0">
                  Empty
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] text-[10px] font-mono font-medium shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  100% Compliant
                </span>
              )}
            </div>

            <div
              className={`font-mono text-[26px] sm:text-[28px] font-bold leading-tight ${
                activeCount > 0
                  ? 'text-[var(--danger)]'
                  : totalMonitoredCatalog === 0
                  ? 'text-[var(--ghost-heading)]'
                  : 'text-[var(--ink-primary)]'
              }`}
            >
              {activeCount > 0
                ? `${activeCount} ${activeCount === 1 ? 'Disapproval' : 'Disapprovals'}`
                : totalMonitoredCatalog === 0
                ? '0 Products'
                : '100% Compliant'}
            </div>
          </div>

          <div className="font-mono text-[11px] mt-3 pt-2.5 border-t border-[var(--hairline)] text-[var(--ghost-text-dim)]">
            {activeCount > 0 ? (
              <span className="text-[var(--danger)] font-semibold">
                Revenue at risk / {activeCount} {activeCount === 1 ? 'SKU' : 'SKUs'} blocked
              </span>
            ) : totalMonitoredCatalog === 0 ? (
              <span>Add items in Google Merchant Center</span>
            ) : (
              <span className="text-[var(--ghost-text)] font-medium">
                $0 revenue at risk / 0 policy flags
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Four-State Inventory Breakdown */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col justify-between min-h-[175px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-[var(--ghost-text)]">Inventory Breakdown</span>
              <span className="font-mono text-[11px] font-medium text-[var(--ink-secondary)]">
                {computedInventorySum.toLocaleString()} Total
              </span>
            </div>

            <div className="space-y-1.5 py-0.5">
              {/* 1. Serving Ads */}
              <div className="flex items-center justify-between text-[11.5px] font-mono leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" aria-hidden="true" />
                  <span className="text-[var(--ink-primary)]">Serving Ads</span>
                </div>
                <span className="font-semibold text-[var(--ink-primary)]">
                  {servingAdsCount.toLocaleString()}
                </span>
              </div>

              {/* 2. Expiring Soon */}
              <div className="flex items-center justify-between text-[11.5px] font-mono leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-dim)]" aria-hidden="true" />
                  <span className="text-[var(--ink-secondary)]">Expiring Soon</span>
                </div>
                <span className="text-[var(--signal)] font-medium">
                  {expiringSoonCount.toLocaleString()}
                </span>
              </div>

              {/* 3. In Review */}
              <div className="flex items-center justify-between text-[11.5px] font-mono leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-line)]" aria-hidden="true" />
                  <span className="text-[var(--ghost-text)]">In Review</span>
                </div>
                <span className="text-[var(--ghost-text)]">
                  {inReviewCount.toLocaleString()}
                </span>
              </div>

              {/* 4. Disapproved */}
              <div className="flex items-center justify-between text-[11.5px] font-mono leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" aria-hidden="true" />
                  <span className={activeCount > 0 ? 'text-[var(--danger)] font-medium' : 'text-[var(--ghost-text)]'}>
                    Disapproved
                  </span>
                </div>
                <span className={activeCount > 0 ? 'text-[var(--danger)] font-bold' : 'text-[var(--ghost-text)]'}>
                  {disapprovedCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="font-mono text-[10.5px] mt-2 pt-2 border-t border-[var(--hairline)] text-[var(--ghost-text-dim)] truncate">
            Live Content API feed status
          </div>
        </div>

        {/* Card 3: Slack Alert Routing (High Visual Priority) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] hover:border-[var(--signal-dim)] rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col justify-between min-h-[175px] transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[12px] font-semibold text-[var(--ink-primary)] truncate">Slack Alert Routing</span>
              {hasActiveWebhook ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] text-[10.5px] font-mono font-medium shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-transparent text-[var(--ghost-text)] text-[10px] font-mono font-medium shrink-0">
                  Unconfigured
                </span>
              )}
            </div>

            <div className="font-mono text-[18px] font-bold text-[var(--ink-primary)] truncate mt-1">
              {hasActiveWebhook ? slackDisplayChannel : 'Unconfigured'}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--hairline)] flex items-center justify-between">
            {hasActiveWebhook ? (
              <button
                type="button"
                onClick={handleSendTestPing}
                disabled={testAlertSending || (data.billing?.isLocked && !data.billing?.isSuperAdmin)}
                className="font-mono text-[11px] text-[var(--signal)] hover:underline disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>{testAlertSending ? 'Sending Ping...' : 'Send test ping →'}</span>
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
            <span className="font-mono text-[10.5px] text-[var(--ghost-text-dim)]">Sub-30s delivery</span>
          </div>
        </div>

        {/* Card 4: Surveillance Engine (Quiet Reassurance, De-Emphasized) */}
        <div className="bg-[var(--bg-canvas)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col justify-between min-h-[175px] opacity-90 hover:opacity-100 transition-opacity">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[12px] font-medium text-[var(--ghost-text)] truncate">Surveillance Engine</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-transparent text-[var(--ghost-text)] text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-dim)]" />
                Active
              </span>
            </div>

            <div className="space-y-1.5 mt-1">
              <div className="font-mono text-[12px] text-[var(--ghost-text)] flex items-baseline justify-between">
                <span>Listener Status:</span>
                <span className="text-[var(--ink-secondary)] font-medium">Healthy</span>
              </div>
              <div className="font-mono text-[12px] text-[var(--ghost-text)] flex items-baseline justify-between">
                <span>Last Handshake:</span>
                <span className="text-[var(--ink-secondary)] font-medium">Active</span>
              </div>
              <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] flex items-baseline justify-between">
                <span>Push Latency:</span>
                <span>
                  {metrics.alertPipelineStatus.latencyMs || metrics.surveillance?.pushLatencyMs || 14}ms
                </span>
              </div>
            </div>
          </div>

          <div className="font-mono text-[10px] mt-2 pt-2 border-t border-[var(--hairline)] text-[var(--ghost-text-dim)] truncate">
            Official Google Event Stream
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
                  <span>Select a Plan to Restore Protection</span>
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
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-transparent text-[var(--ghost-text)] text-[11px] font-mono font-medium">
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
              <div className="text-[var(--ghost-line)]">/</div>
              <div>Auto-sync on feed upload</div>
            </div>
          </div>
        ) : activeCount === 0 ? (
          /* CONDITION B: Zero-State Experience (All Products Approved) */
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-8 sm:p-12 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--signal-wash)] border border-[var(--signal-dim)]">
              <CheckCircle2 className="w-7 h-7 text-[var(--signal)]" strokeWidth={1.5} />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-pill)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] text-[11px] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
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
              <div className="text-[var(--ghost-line)]">/</div>
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
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--danger)] bg-[var(--danger-wash)] text-[var(--danger)] text-[10.5px] font-mono font-semibold tracking-wide">
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
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--danger-wash)] text-[var(--danger)] border border-[var(--danger)] font-semibold">
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
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono border-b border-[var(--hairline)] pb-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="tag-pill tag-danger text-[10px] py-0.5 font-medium shrink-0">
                          {isItemAccountLevel ? 'STORE-WIDE SUSPENSION' : inc.severity}
                        </span>
                        <span className="text-[var(--ghost-text-dim)] flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          Detected {new Date(inc.first_detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-[var(--ghost-text)] font-medium truncate max-w-[150px] sm:max-w-none">
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
                          disabled={verifyingIncidentId !== null && String(verifyingIncidentId) === String(inc.id)}
                          className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] text-[var(--ghost-text)] hover:text-[var(--ink-primary)] hover:border-[var(--signal-dim)] transition-colors disabled:opacity-50"
                        >
                          {verifyingIncidentId !== null && String(verifyingIncidentId) === String(inc.id) ? 'Updating...' : 'Dismiss or Mark as Acknowledged'}
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
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--bg-canvas)] text-[var(--ghost-text)] border border-[var(--hairline)] font-medium">
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-[var(--bg-surface-2)] text-[var(--ghost-text)] text-[10.5px] font-medium">
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
      {/* SECTION 4: Real-Time Surveillance Audit Feed (Persistent Proof-of-Work) */}
      {/* Persistent activity table below primary incident triage area          */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface-2)]">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-[var(--signal)] shrink-0" />
            <div>
              <div className="text-[14px] font-semibold text-[var(--ink-primary)]">
                Real-Time Surveillance Audit Feed
              </div>
              <div className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                Chronological proof-of-work log: Continuous Google Merchant Center audits, Pub/Sub events, and alert dispatches
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--signal)] bg-[var(--signal-wash)] border border-[var(--signal-dim)] px-2.5 py-1 rounded-[var(--radius-pill)] shrink-0 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
            <span>24/7 Background Surveillance Live</span>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[12.5px] min-w-[580px]">
            <thead>
              <tr className="border-b border-[var(--hairline)] bg-[var(--bg-canvas)] font-mono text-[10.5px] uppercase tracking-wider text-[var(--ghost-text-dim)]">
                <th scope="col" className="py-2.5 px-4 font-semibold w-40">Timestamp</th>
                <th scope="col" className="py-2.5 px-4 font-semibold w-44">Event Category</th>
                <th scope="col" className="py-2.5 px-4 font-semibold">Operational Description</th>
                <th scope="col" className="py-2.5 px-4 font-semibold text-right w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)] font-sans">
              {activityFeed.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center font-mono text-[12px] text-[var(--ghost-text)]">
                    Initializing surveillance feed telemetry...
                  </td>
                </tr>
              ) : (
                activityFeed.map((evt) => {
                  const category = evt.category || (
                    evt.type === 'scan_verified'
                      ? 'Catalog Audit'
                      : evt.type === 'pubsub_healthy'
                      ? 'Pub/Sub Ingestion'
                      : evt.type === 'incident_dispatched'
                      ? 'Disapproval Guard'
                      : 'Remediation'
                  );

                  const isSimulation = evt.status === 'Simulation' || evt.category === 'Simulation Drill' || evt.message.includes('simulation') || evt.message.includes('Fire drill') || evt.message.includes('simulated');
                  const normalizedStatus = isSimulation
                    ? 'Simulation'
                    : evt.status === 'Nominal' || evt.status === 'success'
                    ? 'Nominal'
                    : evt.status === 'Active' || evt.status === 'danger'
                    ? 'Active'
                    : evt.status === 'Resolved' || evt.status === 'remediation'
                    ? 'Resolved'
                    : 'Nominal';

                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-[var(--bg-surface-2)] transition-colors ${
                        isSimulation ? 'bg-[rgba(242,169,59,0.02)]' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--ghost-text)] whitespace-nowrap align-top">
                        {evt.timestamp}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap align-top">
                        <span className="text-[var(--ink-secondary)]">
                          {category}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="py-3 px-4 text-[12.5px] text-[var(--ink-primary)] leading-snug align-top">
                        <span>{evt.message}</span>
                        {isSimulation && (
                          <span className="ml-2 font-mono text-[10px] text-[var(--signal)] bg-[var(--signal-wash)] px-1.5 py-0.5 rounded-[var(--radius-sm)] border border-[var(--signal-dim)]">
                            Test Isolation Active
                          </span>
                        )}
                      </td>

                      {/* Operational Status Badge */}
                      <td className="py-3 px-4 text-right whitespace-nowrap align-top">
                        {normalizedStatus === 'Nominal' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-transparent text-[var(--ghost-text)] text-[10.5px] font-mono font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-line)]" />
                            Nominal
                          </span>
                        ) : normalizedStatus === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--danger)] bg-[var(--danger-wash)] text-[var(--danger)] text-[10.5px] font-mono font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                            Active
                          </span>
                        ) : normalizedStatus === 'Resolved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-transparent text-[var(--ghost-heading)] text-[10.5px] font-mono font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-text)]" />
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] text-[10.5px] font-mono font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
                            Simulation
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* Alert Configuration Modal (Slack Incoming Webhook)                    */}
      {/* --------------------------------------------------------------------- */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-[100dvh] z-[99999] bg-[#0a0b0d]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] w-full max-w-[calc(100vw-24px)] sm:max-w-lg p-5 sm:p-7 space-y-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative my-auto box-border">
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
                className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] p-1 rounded-[var(--radius-sm)] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-[var(--ghost-text)] leading-[1.5]">
              Receive instant notifications when Google flags or blocks products in your feed. Critical policy issues will alert your team in &lt; 30 seconds.
            </p>

            {/* Primary Path: 1-Click Slack OAuth */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-[#131418] border border-[var(--hairline-strong)] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.528 2.528 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#f2a93b"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold text-[var(--ink-primary)]">
                    1-Click Slack OAuth Connection
                  </div>
                  <p className="text-[12px] text-[var(--ghost-text)] mt-0.5 leading-snug">
                    Authorize your Slack workspace instantly. Kultra automatically provisions the alert webhook, binds to your selected channel, and dispatches a test confirmation.
                  </p>
                </div>
              </div>

              <a
                href={`/api/auth/slack/connect?store_id=${activeStore?.id}`}
                className="w-full btn-primary text-[13px] py-2.5 justify-center !rounded-[3px] font-semibold inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.528 2.528 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
                <span>Add to Slack (1-Click)</span>
              </a>
            </div>

            {/* Secondary Enterprise Fallback (Manual Webhook Input) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setManualSlackAccordionOpen((prev) => !prev)}
                className="text-[12px] text-[var(--ghost-text)] hover:text-[var(--ink-primary)] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Using an enterprise workspace? Configure webhook manually</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${manualSlackAccordionOpen ? 'rotate-180 text-[var(--signal)]' : ''}`} />
              </button>

              {manualSlackAccordionOpen && (
                <form onSubmit={handleArmSystem} className="mt-3 p-4 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--ghost-text)] mb-1">
                      Slack Incoming Webhook URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://hooks.slack.com/services/..."
                      value={slackWebhookInput}
                      onChange={(e) => setSlackWebhookInput(e.target.value)}
                      className="input w-full text-[12.5px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--ghost-text)] mb-1">
                      Channel Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="#shopping-alerts"
                      value={slackChannelInput}
                      onChange={(e) => setSlackChannelInput(e.target.value)}
                      className="input w-full text-[12.5px]"
                    />
                  </div>

                  {armingFeedback && (
                    <div
                      className={`text-[12px] p-2.5 rounded-[var(--radius-sm)] border ${
                        armingStatus === 'armed'
                          ? 'bg-[var(--signal-wash)] border-[var(--signal-dim)] text-[var(--signal)]'
                          : 'bg-[var(--danger-wash)] border-[var(--danger)] text-[var(--danger)]'
                      }`}
                    >
                      {armingFeedback}
                      {verifiedLatency && (
                        <span className="block mt-1 font-mono text-[10.5px] text-[var(--ghost-text-dim)]">
                          Latency benchmark: {verifiedLatency}ms
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={armingStatus === 'testing' || armingStatus === 'armed'}
                      className="btn-primary text-[12px] py-1.5 px-3.5 disabled:opacity-50 !rounded-[3px]"
                    >
                      {armingStatus === 'testing' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : armingStatus === 'armed' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[var(--signal)]" />
                          <span>Verified &amp; Armed</span>
                        </>
                      ) : (
                        'Verify and arm alerts'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

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
        </div>,
        document.body
      )}
    </div>
  );
}
