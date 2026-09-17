'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Flame,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { Store } from '@/lib/db';

interface DashboardMetrics {
  monitoredProducts: number;
  activeDisapprovals: number;
  alertPipelineStatus: {
    channel: string;
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

interface CriticalIncident {
  id: number | string;
  title: string;
  sku: string;
  issue_code: string;
  severity: 'CRITICAL_DISAPPROVAL' | 'DEMOTION';
  status: string;
  first_detected_at: string;
  shopifyUrl?: string | null;
  gmcUrl?: string | null;
}

interface TableIncident {
  id: number | string;
  sku: string;
  title: string;
  issue_code: string;
  severity: 'CRITICAL_DISAPPROVAL' | 'DEMOTION';
  status: string;
  first_detected_at: string;
  last_detected_at: string;
  resolved_at?: string | null;
  downtimeDuration?: string | null;
  shopifyUrl?: string | null;
  gmcUrl?: string | null;
}

interface DashboardApiResponse {
  zeroStore: boolean;
  stores: Store[];
  activeStore: Store | null;
  billing: BillingSummary;
  metrics: DashboardMetrics;
  criticalIncident: CriticalIncident | null;
  incidents: TableIncident[];
}

interface Props {
  initialStoreId?: string | null;
  justConnected?: boolean;
}

export default function TenantTriageCenter({ initialStoreId, justConnected = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const url = storeId
        ? `/api/dashboard?store_id=${encodeURIComponent(storeId)}`
        : '/api/dashboard';
      const res = await fetch(url);
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
  }, [justConnected]);

  useEffect(() => {
    fetchDashboardData(initialStoreId);
  }, [fetchDashboardData, initialStoreId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(data?.activeStore?.id ? String(data.activeStore.id) : null);
  };

  const handleConnectGmc = async () => {
    try {
      const res = await fetch('/api/auth/merchant/connect');
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          window.location.href = json.url;
        }
      } else {
        window.location.href = '/api/auth/merchant/connect';
      }
    } catch {
      window.location.href = '/api/auth/merchant/connect';
    }
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
      });
      const json = await res.json();
      if (res.ok) {
        setFireDrillBanner(
          json.message ||
            'Test disapproval alert sent to your Slack channel. Check your channel to inspect the alert layout.'
        );

        // Immediate optimistic table mutation in milliseconds (§3)
        const cleanDomain = (data.activeStore.store_url || 'admin.shopify.com')
          .replace(/^https?:\/\//, '')
          .replace(/\/.*$/, '');
        const demoIncident: TableIncident = {
          id: json.incident?.id || `demo-${Date.now()}`,
          sku: json.incident?.sku || 'DEMO-RUNNER-402',
          title: json.incident?.title || 'Apex Carbon Runner - Size 10.5 (Demo Item)',
          issue_code: json.incident?.issue_code || 'item_disapproved: missing_required_attribute [gtin]',
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
            criticalIncident: {
              id: demoIncident.id,
              title: demoIncident.title,
              sku: demoIncident.sku,
              issue_code: demoIncident.issue_code,
              severity: 'CRITICAL_DISAPPROVAL',
              status: 'unresolved',
              first_detected_at: demoIncident.first_detected_at,
              shopifyUrl: demoIncident.shopifyUrl,
              gmcUrl: demoIncident.gmcUrl,
            },
            metrics: {
              ...prev.metrics,
              activeDisapprovals: prev.metrics.activeDisapprovals + (prev.incidents.some((i) => i.sku === demoIncident.sku) ? 0 : 1),
            },
          };
        });

        // Instant re-hydration so demo incident appears in triage table from server as well
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
        body: JSON.stringify({ webhookUrl: slackWebhookInput.trim() }),
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
        body: JSON.stringify({ webhookUrl: webhook }),
      });
      const resJson = await res.json();
      if (res.ok && resJson.verified) {
        setInlineFeedback(`Test alert delivered in ${resJson.latencyMs || 14}ms.`);
      } else {
        setInlineFeedback(`Delivery failed: ${resJson.error || 'Destination unreachable'}`);
      }
    } catch {
      setInlineFeedback('Network exception sending test alert.');
    } finally {
      setTestAlertSending(false);
      setTimeout(() => setInlineFeedback(null), 3000);
    }
  };

  const handleMarkPendingVerification = async (incidentId: string | number) => {
    setVerifyingIncidentId(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/verify`, {
        method: 'POST',
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          const updatedIncidents = prev.incidents.map((inc) =>
            String(inc.id) === String(incidentId)
              ? { ...inc, status: 'pending_verification' }
              : inc
          );
          return {
            ...prev,
            incidents: updatedIncidents,
            criticalIncident:
              prev.criticalIncident && String(prev.criticalIncident.id) === String(incidentId)
                ? { ...prev.criticalIncident, status: 'pending_verification' }
                : prev.criticalIncident,
          };
        });
      }
    } catch (err) {
      console.error('Failed to mark incident pending verification:', err);
    } finally {
      setVerifyingIncidentId(null);
    }
  };

  // Loading: static skeleton blocks per §11 (NO shimmer sweep, NO pulsing loops)
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-20 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
          <div className="h-24 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
          <div className="h-24 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
        </div>
        <div className="h-64 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE A: The Zero-Store State
  // ---------------------------------------------------------------------------
  if (!data || data.zeroStore || data.stores.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-8 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--bg-surface-2)] border border-[var(--hairline)] mb-5">
            <ShieldCheck className="w-6 h-6 text-[var(--signal)]" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tracking-tight mb-3">
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
            <button
              onClick={handleConnectGmc}
              className="btn-primary px-7 py-3 text-[13.5px] font-semibold !rounded-[3px]"
            >
              Connect Google Merchant Center
            </button>

            <div className="mt-2.5 font-mono text-[11px] text-[var(--ghost-text-dim)]">
              Read-only telemetry / No feed modifications
            </div>

            {/* Pre-OAuth Trust Framing Disclaimer (§1 Compliance Directive) */}
            <div className="max-w-lg w-full mt-6 text-left p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--signal)] shrink-0" strokeWidth={1.5} />
                <span className="text-[12.5px] font-semibold text-[var(--ink-primary)]">
                  Google OAuth Scope Transparency
                </span>
              </div>
              <p className="text-[12px] text-[var(--ghost-text)] leading-[1.55]">
                Google displays a standard &ldquo;Manage your product listings&rdquo; consent prompt because Google&apos;s Merchant API lacks a dedicated read-only scope tier. Kultra operates strictly in read-only telemetry mode to capture crawl status and policy health.
              </p>
              <div className="mt-2.5 text-[12px] font-medium text-[var(--ink-primary)] border-t border-[var(--hairline)] pt-2 leading-[1.5]">
                <strong className="text-[var(--signal)]">Safety Guarantee:</strong> Kultra will never edit, overwrite, delete, or mutate your product catalog, pricing, or Google Ads campaigns.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { activeStore, metrics, criticalIncident, incidents } = data;
  const isThreatState = metrics.activeDisapprovals > 0 && criticalIncident !== null;

  return (
    <div className="space-y-5">
      {/* Streamlined Operational Action Bar (§1 Header De-Duplication & Layout Hierarchy) */}
      <div className="flex items-center justify-between gap-3 py-2 border-b border-[var(--hairline)]">
        {/* Left: Operational Fire Drill Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunFireDrill}
            disabled={simulatingFireDrill || (data.billing?.isLocked && !data.billing?.isSuperAdmin)}
            className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              data.billing?.isLocked && !data.billing?.isSuperAdmin
                ? 'Subscription required to run simulated fire drills'
                : 'Simulate a crawler disapproval to test Slack alert routing'
            }
          >
            <Flame className={`w-3.5 h-3.5 ${data.billing?.isLocked && !data.billing?.isSuperAdmin ? 'text-[var(--ghost-text-dim)]' : 'text-[var(--signal)]'} ${simulatingFireDrill ? 'animate-spin' : ''}`} />
            <span>{simulatingFireDrill ? 'Simulating...' : 'Run Test Fire Drill'}</span>
          </button>
        </div>

        {/* Right: Operational Controls (Refresh & Configure alerts) */}
        <div className="flex items-center gap-2">
          {inlineFeedback && (
            <span className="font-mono text-[11px] text-[var(--signal)]">{inlineFeedback}</span>
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
        </div>
      </div>

      {/* Fire Drill Confirmation Banner (§4) */}
      {fireDrillBanner && (
        <div className="bg-[var(--bg-surface-2)] border border-[var(--signal-dim)] rounded-[var(--radius-md)] p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-medium text-[var(--ink-primary)]">
                {fireDrillBanner}
              </div>
              <div className="font-mono text-[11px] text-[var(--ghost-text)] mt-0.5">
                Simulated item &apos;DEMO-RUNNER-402&apos; is now visible below in your triage queue (auto-purges in 15 minutes).
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
      {/* TIER 2: Real-Time Metric Counters (§16 Stat Cards)                   */}
      {/* High-level metrics remain permanently visible to verify catalog scope */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Monitored Products */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5">
          <div className="text-[12px] font-semibold text-[var(--ghost-text)] mb-1">Monitored Products</div>
          <div className="font-mono text-[28px] font-medium text-[var(--ink-primary)] leading-tight">
            {metrics.monitoredProducts.toLocaleString()}
          </div>
          <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] mt-2">
            Continuous catalog sync
          </div>
        </div>

        {/* Metric 2: Active Disapprovals */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5">
          <div className="text-[12px] font-semibold text-[var(--ghost-text)] mb-1">Active Disapprovals</div>
          <div
            className={`font-mono text-[28px] font-medium leading-tight ${
              metrics.activeDisapprovals > 0 ? 'text-[var(--danger)]' : 'text-[var(--signal)]'
            }`}
          >
            {metrics.activeDisapprovals}
          </div>
          <div className="font-mono text-[11px] mt-2">
            {metrics.activeDisapprovals > 0 ? (
              <span className="text-[var(--danger)]">Items blocked from Google Ads</span>
            ) : (
              <span className="text-[var(--ghost-text-dim)]">Zero items disapproved</span>
            )}
          </div>
        </div>

        {/* Metric 3: Alert Pipeline Status */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[12px] font-semibold text-[var(--ghost-text)]">Alert Pipeline</div>
            <button
              onClick={handleSendTestPing}
              disabled={testAlertSending || (data.billing?.isLocked && !data.billing?.isSuperAdmin)}
              className="font-mono text-[11px] text-[var(--signal)] hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {testAlertSending ? 'Sending...' : 'Send test'}
            </button>
          </div>
          <div className="font-mono text-[18px] font-medium text-[var(--ink-primary)] truncate">
            {metrics.alertPipelineStatus.channel}{' '}
            <span className="text-[12px] font-normal text-[var(--ghost-text)]">
              ({metrics.alertPipelineStatus.latencyMs}ms)
            </span>
          </div>
          <div className="font-mono text-[11px] mt-2 text-[var(--ghost-text-dim)]">
            {data.billing?.isLocked && !data.billing?.isSuperAdmin ? (
              <span className="text-[var(--danger)]">Alert pipeline paused (Trial expired)</span>
            ) : metrics.alertPipelineStatus.verified ? (
              'Webhook verified and live'
            ) : (
              'Webhook unverified'
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* ACTIVE INCIDENT TRIAGE & RESOLUTION QUEUE                             */}
      {/* When account is locked, un-dismissible paywall mounts over this area  */}
      {/* --------------------------------------------------------------------- */}
      <div className="relative space-y-5">
        {/* Un-dismissible Lockout Paywall Overlay (§4 Expired Trial Lockout Engine) */}
        {data.billing?.isLocked && !data.billing?.isSuperAdmin && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-[5px] rounded-[var(--radius-md)] min-h-[420px]">
            <div className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] max-w-xl w-full p-7 sm:p-8 space-y-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(ellipse_at_top_right,var(--signal-wash),transparent_70%)] pointer-events-none" />

              {/* Eyebrow / Status Pill */}
              <div className="flex items-center justify-center gap-2">
                <span className="tag-pill tag-danger text-[10.5px] py-0.5 font-medium">
                  14-DAY TRIAL CONCLUDED
                </span>
                <span className="font-mono text-[11px] text-[var(--danger)]">
                  MONITORING PAUSED
                </span>
              </div>

              {/* Display Serif Headline (§2 Typography: Fraunces) */}
              <h2 className="font-serif text-[24px] sm:text-[27px] font-semibold text-[var(--ink-primary)] leading-tight tracking-[-0.01em]">
                Your 14-Day Free Trial Has Concluded
              </h2>

              {/* Clear description of paused states */}
              <p className="text-[14px] text-[var(--ink-secondary)] leading-[1.6] max-w-md mx-auto">
                Real-time Google Merchant Center crawler monitoring and automated Slack notifications are currently <strong className="text-[var(--ink-primary)] font-medium">paused</strong> for this catalog.
              </p>

              <p className="text-[13px] text-[var(--ghost-text)] leading-[1.55] max-w-md mx-auto">
                Your store credentials and SKU mapping remain safely configured. Upgrade to an active plan to reactivate continuous policy enforcement, un-mute Slack notifications, and restore direct product resolution deep links.
              </p>

              {/* Primary Action Button (§4 Buttons: .btn-primary with strict --radius-sm: 3px) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={data.billing.upgradeUrl}
                  className="btn-primary w-full sm:w-auto px-7 py-3 text-[13.5px] font-semibold !rounded-[3px] text-center inline-flex items-center justify-center gap-2 shadow-none"
                >
                  <span>Upgrade to restore protection</span>
                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </div>

              {/* Support reference */}
              <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] pt-3 border-t border-[var(--hairline)]">
                Need assistance with custom billing or high-SKU enterprise catalogs? Contact{' '}
                <a
                  href="mailto:support@usekultra.com"
                  className="text-[var(--ink-secondary)] hover:underline"
                >
                  support@usekultra.com
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TIER 1: Global Health & Triage Banner */}
        {!isThreatState ? (
          // Healthy State (0 active disapprovals): Ghost surface with Signal indicator
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[var(--signal)]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="tag-pill tag-signal text-[10.5px] py-0.5">
                      Catalog shield active
                    </span>
                    <span className="font-mono text-[11px] text-[var(--ghost-text)]">
                      All items eligible
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--ghost-text)]">
                    Google crawler verified:{' '}
                    <span className="font-mono text-[var(--ink-primary)]">
                      {activeStore?.last_message_at
                        ? new Date(activeStore.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-[var(--signal)]">
                0 clicks at risk
              </span>
            </div>
          </div>
        ) : (
          // Threat State (Disapproval detected): Danger band per §11
          <div className="bg-[var(--bg-surface)] border-l-2 border-l-[var(--danger)] border-y border-r border-[var(--hairline)] rounded-r-[var(--radius-md)] p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="tag-pill tag-danger text-[10.5px]">
                    Disapproval detected
                  </span>
                  <span className="font-mono text-[11px] text-[var(--danger)]">
                    Ad traffic blocked
                  </span>
                </div>

                <div className="text-[14px] text-[var(--ink-primary)]">
                  Impacted: <span className="font-medium">{criticalIncident.title}</span>{' '}
                  <span className="font-mono text-[11px] text-[var(--ghost-text)]">(SKU: {criticalIncident.sku})</span>
                </div>

                {/* Strict Monospace Isolation */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">ERROR:</span>
                  <code className="font-mono text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] text-[var(--danger)]">
                    {criticalIncident.issue_code}
                  </code>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {criticalIncident.shopifyUrl ? (
                  <a
                    href={criticalIncident.shopifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5"
                  >
                    <span>Edit Product</span>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--ghost-text-dim)] px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--hairline)]">
                    <Lock className="w-3 h-3" /> Edit Product locked
                  </span>
                )}

                {criticalIncident.gmcUrl && (
                  <a
                    href={criticalIncident.gmcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-[12px] py-1.5 px-3 !rounded-[3px] inline-flex items-center gap-1.5"
                  >
                    <span>GMC console</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--ghost-text)]" strokeWidth={1.5} />
                  </a>
                )}

                {/* Non-interactive status badge vs Action button (§3 Disapproval Card Badge Distinction) */}
                {criticalIncident.status === 'pending_verification' ? (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--ghost-text)] px-2.5 py-1 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-[var(--bg-surface-2)] select-none cursor-default">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-text)]" aria-hidden="true" />
                    <span>Pending verification</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkPendingVerification(criticalIncident.id)}
                    disabled={(data.billing?.isLocked && !data.billing?.isSuperAdmin) || verifyingIncidentId === criticalIncident.id}
                    className="btn-secondary text-[12px] py-1.5 px-3 disabled:opacity-50 !rounded-[3px]"
                  >
                    {verifyingIncidentId === criticalIncident.id ? 'Updating...' : 'Mark fixed'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* TIER 3: Incident History & Resolution Audit Table (§16 Tables)        */}
        {/* --------------------------------------------------------------------- */}
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--hairline)] flex items-center justify-between">
          <div>
            <h2 className="text-[14.5px] font-semibold text-[var(--ink-primary)]">
              Incident history and resolution audit
            </h2>
            <p className="text-[12px] text-[var(--ghost-text)] mt-0.5">
              Crawler policy rejections and auto-resolutions log.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] px-2 py-0.5 rounded bg-[var(--bg-surface-2)] border border-[var(--hairline)]">
            {incidents.length} {incidents.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-[var(--ghost-text)]">
            Zero incidents recorded for this Merchant Center account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-[var(--bg-surface-2)] font-mono text-[11px] text-[var(--ghost-text-dim)]">
                  <th className="py-3 px-4 font-normal">Product title and SKU</th>
                  <th className="py-3 px-4 font-normal">Error reason</th>
                  <th className="py-3 px-4 font-normal">Severity</th>
                  <th className="py-3 px-4 font-normal">First detected</th>
                  <th className="py-3 px-4 font-normal">Last update</th>
                  <th className="py-3 px-4 font-normal text-right">Triage action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline)] text-[13px]">
                {incidents.map((inc) => {
                  const isResolved = inc.status === 'resolved';
                  const isPending = inc.status === 'pending_verification';

                  return (
                    <tr key={inc.id} className="hover:bg-[var(--bg-surface-2)] transition-colors duration-120">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--ink-primary)] truncate max-w-xs">
                          {inc.title}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                          SKU: {inc.sku}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <code className="font-mono text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] text-[var(--danger)]">
                          {inc.issue_code}
                        </code>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`tag-pill text-[10px] ${
                          inc.severity === 'CRITICAL_DISAPPROVAL' ? 'tag-danger' : 'tag-ghost'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--ghost-text)]">
                        {new Date(inc.first_detected_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--ghost-text)]">
                        {new Date(inc.last_detected_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isResolved ? (
                          <span className="tag-pill tag-signal text-[10px]">
                            Auto-resolved {inc.downtimeDuration ? `(${inc.downtimeDuration})` : ''}
                          </span>
                        ) : isPending ? (
                          <div className="inline-flex items-center gap-2">
                            {/* Non-interactive static status badge (§3) */}
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--ghost-text)] px-2.5 py-0.5 rounded-[var(--radius-pill)] border border-[var(--ghost-line)] bg-[var(--bg-surface-2)] select-none cursor-default">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-text)]" aria-hidden="true" />
                              <span>Pending verification</span>
                            </span>
                            {inc.shopifyUrl ? (
                              <a
                                href={inc.shopifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-[11px] py-1 px-2.5 !rounded-[3px] inline-flex items-center gap-1"
                              >
                                <span>Edit Product</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-[var(--ghost-text-dim)]">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleMarkPendingVerification(inc.id)}
                              disabled={data.billing?.isLocked || verifyingIncidentId === inc.id}
                              className="btn-secondary text-[11px] py-1 px-2.5 !rounded-[3px] inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              {verifyingIncidentId === inc.id ? 'Saving...' : 'Mark fixed'}
                            </button>
                            {inc.shopifyUrl ? (
                              <a
                                href={inc.shopifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary text-[11px] py-1 px-2.5 !rounded-[3px] inline-flex items-center gap-1"
                              >
                                <span>Edit Product</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-[var(--ghost-text-dim)]">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* STATE B: Alarm Activation Modal (§3 Floating element rules)          */}
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

            {/* Store Management & Data Ownership Section (§1 Compliance Directive) */}
            <div className="pt-5 border-t border-[var(--hairline)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12.5px] font-semibold text-[var(--ink-primary)]">
                  Data Ownership &amp; Integration Management
                </span>
                <span className="tag-pill tag-ghost text-[10px]">
                  Zero Vendor Lock-In
                </span>
              </div>
              <p className="text-[12px] text-[var(--ghost-text)] leading-[1.5] mb-3">
                You retain 100% ownership of your catalog telemetry. Disconnecting immediately terminates Pub/Sub ingestion and purges all cached incidents from Kultra&apos;s database. For full account deletion or verification inquiries, email{' '}
                <a href="mailto:support@usekultra.com" className="text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] underline">
                  support@usekultra.com
                </a>.
              </p>

              {!confirmDisconnect ? (
                <button
                  type="button"
                  onClick={() => setConfirmDisconnect(true)}
                  className="btn-secondary text-[12px] py-1.5 px-3 text-[var(--danger)] hover:border-[var(--danger)] !rounded-[3px]"
                >
                  Disconnect Store &amp; Purge Cached Telemetry
                </button>
              ) : (
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] space-y-2.5">
                  <div className="text-[12px] text-[var(--danger)] font-medium">
                    Are you sure? This will remove GMC #{activeStore?.gmc_id || activeStore?.merchant_id} and permanently purge all stored incident logs.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={disconnecting}
                      onClick={handleDisconnectStore}
                      className="py-1.5 px-3 rounded-[var(--radius-sm)] bg-[var(--danger)] text-[#111214] font-semibold text-[12px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {disconnecting && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>{disconnecting ? 'Purging telemetry...' : 'Yes, Purge Telemetry & Disconnect'}</span>
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
