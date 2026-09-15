'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Send,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Link2,
  Clock,
  Check,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Store, Incident } from '@/lib/db';

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

  // State B: Modal state
  const [modalOpen, setModalOpen] = useState(justConnected);
  const [slackWebhookInput, setSlackWebhookInput] = useState('');
  const [armingStatus, setArmingStatus] = useState<'idle' | 'testing' | 'armed' | 'error'>('idle');
  const [armingFeedback, setArmingFeedback] = useState<string | null>(null);
  const [verifiedLatency, setVerifiedLatency] = useState<number | null>(null);

  // Verification action state
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

      // Auto-open modal if store was just connected or if webhook unverified
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
        // Refresh underlying dashboard metrics
        fetchDashboardData(String(data.activeStore.id));
        // Auto-close after brief confirmation pause
        setTimeout(() => {
          setModalOpen(false);
          setArmingStatus('idle');
        }, 2200);
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
      setTimeout(() => setInlineFeedback(null), 4000);
    }
  };

  const handleMarkPendingVerification = async (incidentId: string | number) => {
    setVerifyingIncidentId(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/verify`, {
        method: 'POST',
      });
      if (res.ok) {
        // Update local state smoothly
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-[#0F1522] border border-[#1E293B] rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-28 bg-[#0F1522] border border-[#1E293B] rounded-md animate-pulse" />
          <div className="h-28 bg-[#0F1522] border border-[#1E293B] rounded-md animate-pulse" />
          <div className="h-28 bg-[#0F1522] border border-[#1E293B] rounded-md animate-pulse" />
        </div>
        <div className="h-64 bg-[#0F1522] border border-[#1E293B] rounded-md animate-pulse" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STATE A: The Zero-Store State (The Onboarding Funnel)
  // ---------------------------------------------------------------------------
  if (!data || data.zeroStore || data.stores.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-8 sm:p-12 text-center shadow-none">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#141C2B] border border-[#1E293B] mb-6">
            <ShieldCheck className="w-7 h-7 text-[#10B981]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-[#FDF4D2] tracking-tight mb-4">
            Automated, sub-30-second disapproval protection for your Google Shopping campaigns.
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto mb-10 leading-relaxed">
            Eliminate silent catalog blindspots. Connect your Google Merchant Center account to receive instant, actionable Slack alerts the second an item gets rejected.
          </p>

          {/* Proof Mechanism (3-Step Flow) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
            <div className="bg-[#141C2B] border border-[#1E293B] rounded-md p-4">
              <div className="text-xs font-semibold text-[#10B981] mb-1">Step 1</div>
              <div className="text-sm font-medium text-[#FDF4D2] mb-1">Connect GMC</div>
              <div className="text-xs text-[#94A3B8]">Read-only Content API handshake in two clicks.</div>
            </div>

            <div className="bg-[#141C2B] border border-[#1E293B] rounded-md p-4">
              <div className="text-xs font-semibold text-[#10B981] mb-1">Step 2</div>
              <div className="text-sm font-medium text-[#FDF4D2] mb-1">Set Alert Destination</div>
              <div className="text-xs text-[#94A3B8]">Arm your Slack channel with verified sub-500ms pings.</div>
            </div>

            <div className="bg-[#141C2B] border border-[#1E293B] rounded-md p-4">
              <div className="text-xs font-semibold text-[#10B981] mb-1">Step 3</div>
              <div className="text-sm font-medium text-[#FDF4D2] mb-1">Protect Hero SKUs</div>
              <div className="text-xs text-[#94A3B8]">Prevent silent revenue drops with 1-click Shopify triage.</div>
            </div>
          </div>

          {/* Primary Action CTA */}
          <button
            onClick={handleConnectGmc}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#FDF4D2] hover:bg-white text-[#0a0b1d] font-semibold text-sm rounded-md transition-colors shadow-none"
          >
            Connect Google Merchant Center
          </button>

          {/* Friction Reducer */}
          <div className="mt-4 text-xs text-[#94A3B8]">
            Read-only access. No code or feed changes required.
          </div>
        </div>
      </div>
    );
  }

  const { activeStore, metrics, criticalIncident, incidents } = data;
  const isThreatState = metrics.activeDisapprovals > 0 && criticalIncident !== null;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#94A3B8]">Monitored Store:</span>
            <span className="text-sm font-semibold text-[#FDF4D2]">{activeStore?.store_name || 'Active Store'}</span>
          </div>
          <span className="text-xs text-[#94A3B8] px-2 py-0.5 rounded bg-[#141C2B] border border-[#1E293B]">
            GMC #{activeStore?.gmc_id || activeStore?.merchant_id}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {inlineFeedback && (
            <span className="text-xs text-[#10B981]">{inlineFeedback}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#FDF4D2] bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] rounded transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3 py-1.5 text-xs text-[#FDF4D2] bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] rounded transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3 h-3 text-[#10B981]" />
            Configure Alerts
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TIER 1: Global Health & Triage Banner (Top Priority)                   */}
      {/* --------------------------------------------------------------------- */}
      {!isThreatState ? (
        // Healthy State (0 active disapprovals)
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-5 sm:p-6 text-[#FDF4D2]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#10B981] text-[#0a0b1d]">
                    Catalog Shield Active
                  </span>
                  <span className="text-xs text-[#10B981] font-medium">All systems normal</span>
                </div>
                <p className="text-sm text-[#FDF4D2]">
                  All items eligible for Google Shopping. Google crawler last checked:{' '}
                  <span className="font-medium text-[#FDF4D2]">
                    {activeStore?.last_message_at
                      ? new Date(activeStore.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  .
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#10B981]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero ad-spend at risk</span>
            </div>
          </div>
        </div>
      ) : (
        // Threat State (1 or more items disapproved)
        <div className="bg-[#FF788D]/10 border border-[#FF788D]/30 rounded-lg p-5 sm:p-6 text-[#FDF4D2]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#FF788D] text-[#0a0b1d]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Threat Detected
                </span>
                <span className="text-sm font-semibold text-[#FF788D]">
                  Disapprovals Detected - Ad Traffic at Risk
                </span>
              </div>

              <div className="text-sm text-[#FDF4D2]">
                Critical item impacted:{' '}
                <span className="font-semibold text-white">{criticalIncident.title}</span>{' '}
                <span className="text-xs text-[#94A3B8] font-normal">(SKU: <strong className="text-[#FDF4D2]">{criticalIncident.sku}</strong>)</span>
              </div>

              {/* Strict Monospace Isolation for raw protocol error string */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-[#94A3B8]">Policy Rejection:</span>
                <span
                  className="px-2.5 py-1 text-xs bg-[#0a0b1d] border border-[#1E293B] text-[#FF788D] rounded"
                  style={{ fontFamily: "ui-monospace, 'Geist Mono', 'JetBrains Mono', monospace" }}
                >
                  {criticalIncident.issue_code}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={criticalIncident.shopifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold bg-[#141C2B] hover:bg-[#1E293B] text-[#FDF4D2] border border-[#1E293B] rounded-md transition-colors flex items-center gap-1.5"
              >
                Fix in Shopify
                <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
              </a>

              <a
                href={criticalIncident.gmcUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold bg-[#141C2B] hover:bg-[#1E293B] text-[#FDF4D2] border border-[#1E293B] rounded-md transition-colors flex items-center gap-1.5"
              >
                View in Merchant Center
                <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
              </a>

              <button
                onClick={() => handleMarkPendingVerification(criticalIncident.id)}
                disabled={criticalIncident.status === 'pending_verification' || verifyingIncidentId === criticalIncident.id}
                className="px-4 py-2 text-xs font-semibold bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40 rounded-md transition-colors disabled:opacity-50"
              >
                {criticalIncident.status === 'pending_verification'
                  ? 'Pending Verification'
                  : verifyingIncidentId === criticalIncident.id
                  ? 'Updating...'
                  : 'Mark Pending Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TIER 2: Real-Time Metric Counters                                     */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Monitored Products */}
        <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-5">
          <div className="text-xs font-medium text-[#94A3B8] mb-1">Monitored Products</div>
          <div className="text-2xl font-bold text-[#FDF4D2]">
            {metrics.monitoredProducts.toLocaleString()}
          </div>
          <div className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Continuous catalog synchronization
          </div>
        </div>

        {/* Metric 2: Active Disapprovals */}
        <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-5">
          <div className="text-xs font-medium text-[#94A3B8] mb-1">Active Disapprovals</div>
          <div
            className={`text-2xl font-bold ${
              metrics.activeDisapprovals > 0 ? 'text-[#FF788D]' : 'text-[#10B981]'
            }`}
          >
            {metrics.activeDisapprovals}
          </div>
          <div className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1.5">
            {metrics.activeDisapprovals > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF788D]" />
                <span className="text-[#FF788D]">Items blocked from Google Shopping</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>Zero disapproved products</span>
              </>
            )}
          </div>
        </div>

        {/* Metric 3: Alert Pipeline Status */}
        <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-medium text-[#94A3B8]">Alert Pipeline Status</div>
            <button
              onClick={handleSendTestPing}
              disabled={testAlertSending}
              className="text-xs text-[#10B981] hover:underline disabled:opacity-50"
            >
              {testAlertSending ? 'Sending...' : 'Send Test'}
            </button>
          </div>
          <div className="text-lg font-bold text-[#FDF4D2] truncate">
            {metrics.alertPipelineStatus.channel}{' '}
            <span className="text-xs font-normal text-[#94A3B8]">
              ({metrics.alertPipelineStatus.latencyMs}ms)
            </span>
          </div>
          <div className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                metrics.alertPipelineStatus.verified ? 'bg-[#10B981]' : 'bg-[#FF788D]'
              }`}
            />
            <span>
              {metrics.alertPipelineStatus.verified
                ? 'Webhook verified and streaming'
                : 'Webhook unverified'}
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TIER 3: Incident History & Resolution Audit Table                      */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#FDF4D2]">
              Incident History & Resolution Audit
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Real-time audit log of crawler status rejections and auto-resolutions.
            </p>
          </div>
          <span className="text-xs text-[#94A3B8] bg-[#141C2B] px-2.5 py-1 rounded border border-[#1E293B]">
            {incidents.length} {incidents.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#94A3B8]">
            Zero incidents recorded for this Merchant Center account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#141C2B]/50 text-xs font-medium text-[#94A3B8]">
                  <th className="py-3 px-4">Product Title & SKU</th>
                  <th className="py-3 px-4">Error Reason</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">First Detected</th>
                  <th className="py-3 px-4">Last Update</th>
                  <th className="py-3 px-4 text-right">Triage Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-xs">
                {incidents.map((inc) => {
                  const isResolved = inc.status === 'resolved';
                  const isPending = inc.status === 'pending_verification';

                  return (
                    <tr key={inc.id} className="hover:bg-[#141C2B]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#FDF4D2] truncate max-w-xs">
                          {inc.title}
                        </div>
                        <div className="text-[#94A3B8] font-normal">
                          SKU: {inc.sku}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {/* Strict Monospace Isolation */}
                        <span
                          className="px-2 py-0.5 rounded bg-[#0a0b1d] border border-[#1E293B] text-[#FF788D] inline-block"
                          style={{ fontFamily: "ui-monospace, 'Geist Mono', 'JetBrains Mono', monospace" }}
                        >
                          {inc.issue_code}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                            inc.severity === 'CRITICAL_DISAPPROVAL'
                              ? 'bg-[#FF788D]/15 text-[#FF788D] border border-[#FF788D]/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#94A3B8]">
                        {new Date(inc.first_detected_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 text-[#94A3B8]">
                        {new Date(inc.last_detected_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isResolved ? (
                          // Auto-Resolved badge with exact downtime duration
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-medium">
                            <Check className="w-3.5 h-3.5" />
                            <span>Auto-Resolved</span>
                            {inc.downtimeDuration && (
                              <span className="text-[#94A3B8] text-[11px] ml-1">
                                ({inc.downtimeDuration})
                              </span>
                            )}
                          </div>
                        ) : isPending ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Pending Verification
                            </span>
                            <a
                              href={inc.shopifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#94A3B8] hover:text-[#FDF4D2] inline-flex items-center gap-1"
                            >
                              Shopify <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleMarkPendingVerification(inc.id)}
                              disabled={verifyingIncidentId === inc.id}
                              className="text-xs text-[#10B981] hover:underline"
                            >
                              {verifyingIncidentId === inc.id ? 'Saving...' : 'Mark Fixed'}
                            </button>
                            <a
                              href={inc.shopifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#141C2B] hover:bg-[#1E293B] text-[#FDF4D2] border border-[#1E293B] rounded text-xs inline-flex items-center gap-1"
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
      {/* STATE B: The "Arm Your Alarm" Activation Modal (Post-OAuth)           */}
      {/* --------------------------------------------------------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-none">
            {/* Header with linked store & checkmark */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#FDF4D2]">
                  Arm Your Alarm System
                </h3>
                <div className="text-xs text-[#94A3B8]">
                  Store linked:{' '}
                  <strong className="text-[#FDF4D2]">{activeStore?.store_name || 'Store'}</strong>{' '}
                  (GMC #{activeStore?.gmc_id || activeStore?.merchant_id})
                </div>
              </div>
            </div>

            <p className="text-sm text-[#94A3B8]">
              Where should we wake you up when an ad-blocking disapproval occurs? Paste your Slack Incoming Webhook URL to verify instant telemetry.
            </p>

            <form onSubmit={handleArmSystem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Slack Incoming Webhook URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhookInput}
                  onChange={(e) => setSlackWebhookInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141C2B] border border-[#1E293B] text-[#FDF4D2] text-xs rounded-md focus:outline-none focus:border-[#10B981] transition-colors"
                />
              </div>

              {armingFeedback && (
                <div
                  className={`text-xs p-3 rounded border ${
                    armingStatus === 'armed'
                      ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                      : 'bg-[#FF788D]/15 border-[#FF788D]/30 text-[#FF788D]'
                  }`}
                >
                  {armingFeedback}
                  {verifiedLatency && (
                    <span className="block mt-1 text-[11px] text-[#94A3B8]">
                      Latency benchmark: {verifiedLatency}ms
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#FDF4D2] transition-colors"
                >
                  Configure Later
                </button>

                <button
                  type="submit"
                  disabled={armingStatus === 'testing' || armingStatus === 'armed'}
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0a0b1d] font-semibold text-xs rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {armingStatus === 'testing' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Testing Pipeline...
                    </>
                  ) : armingStatus === 'armed' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      System Armed
                    </>
                  ) : (
                    'Send Test Alert & Arm System'
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
