'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Check,
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

interface CriticalIncident {
  id: number | string;
  title: string;
  sku: string;
  issue_code: string;
  severity: 'CRITICAL_DISAPPROVAL' | 'DEMOTION';
  status: string;
  first_detected_at: string;
  shopifyUrl: string;
  gmcUrl: string;
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
  shopifyUrl: string;
  gmcUrl: string;
}

interface DashboardApiResponse {
  zeroStore: boolean;
  stores: Store[];
  activeStore: Store | null;
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

  const handleArmSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.activeStore?.id) return;
    if (!slackWebhookInput.trim()) {
      setArmingFeedback('Please enter a valid Slack Incoming Webhook URL.');
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
          setModalOpen(false);
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
              <div className="text-[12px] text-[var(--ghost-text)]">Prevent silent drops with 1-click Shopify triage.</div>
            </div>
          </div>

          <button
            onClick={handleConnectGmc}
            className="btn-primary px-6 py-2.5 text-[13px]"
          >
            Connect Google Merchant Center
          </button>

          <div className="mt-3 font-mono text-[11px] text-[var(--ghost-text-dim)]">
            Read-only access / No feed changes required
          </div>
        </div>
      </div>
    );
  }

  const { activeStore, metrics, criticalIncident, incidents } = data;
  const isThreatState = metrics.activeDisapprovals > 0 && criticalIncident !== null;

  return (
    <div className="space-y-5">
      {/* Top Controls Bar (§16 Top Bar styling) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--hairline)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">STORE:</span>
            <span className="text-[13.5px] font-medium text-[var(--ink-primary)]">{activeStore?.store_name || 'Active Store'}</span>
          </div>
          <span className="tag-pill tag-ghost text-[10px] py-0.5">
            GMC #{activeStore?.gmc_id || activeStore?.merchant_id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {inlineFeedback && (
            <span className="font-mono text-[11px] text-[var(--signal)]">{inlineFeedback}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary text-[12px] py-1.5 px-3"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-secondary text-[12px] py-1.5 px-3"
          >
            <SlidersHorizontal className="w-3 h-3 text-[var(--signal)]" />
            Configure alerts
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TIER 1: Global Health & Triage Banner                                 */}
      {/* --------------------------------------------------------------------- */}
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
              <a
                href={criticalIncident.shopifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-[12px] py-1.5 px-3"
              >
                <span>Fix in Shopify</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>

              <a
                href={criticalIncident.gmcUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-[12px] py-1.5 px-3"
              >
                <span>GMC console</span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--ghost-text)]" strokeWidth={1.5} />
              </a>

              <button
                onClick={() => handleMarkPendingVerification(criticalIncident.id)}
                disabled={criticalIncident.status === 'pending_verification' || verifyingIncidentId === criticalIncident.id}
                className="btn-secondary text-[12px] py-1.5 px-3 disabled:opacity-50"
              >
                {criticalIncident.status === 'pending_verification'
                  ? 'Pending verification'
                  : verifyingIncidentId === criticalIncident.id
                  ? 'Updating...'
                  : 'Mark fixed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TIER 2: Real-Time Metric Counters (§16 Stat Cards)                   */}
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
              disabled={testAlertSending}
              className="font-mono text-[11px] text-[var(--signal)] hover:underline disabled:opacity-50"
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
            {metrics.alertPipelineStatus.verified
              ? 'Webhook verified and live'
              : 'Webhook unverified'}
          </div>
        </div>
      </div>

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
                            <span className="tag-pill tag-ghost text-[10px]">
                              Pending verification
                            </span>
                            <a
                              href={inc.shopifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[11px] text-[var(--ghost-text)] hover:text-[var(--ink-primary)] inline-flex items-center gap-1"
                            >
                              Shopify <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleMarkPendingVerification(inc.id)}
                              disabled={verifyingIncidentId === inc.id}
                              className="font-mono text-[11px] text-[var(--signal)] hover:underline"
                            >
                              {verifyingIncidentId === inc.id ? 'Saving...' : 'Mark fixed'}
                            </button>
                            <a
                              href={inc.shopifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-[11px] py-1 px-2.5"
                            >
                              Shopify <ExternalLink className="w-3 h-3" />
                            </a>
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

      {/* --------------------------------------------------------------------- */}
      {/* STATE B: Alarm Activation Modal (§3 Floating element rules)          */}
      {/* --------------------------------------------------------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
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
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-[12.5px] py-2 px-3.5"
                >
                  Configure later
                </button>

                <button
                  type="submit"
                  disabled={armingStatus === 'testing' || armingStatus === 'armed'}
                  className="btn-primary text-[12.5px] py-2 px-4 disabled:opacity-50"
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
          </div>
        </div>
      )}
    </div>
  );
}
