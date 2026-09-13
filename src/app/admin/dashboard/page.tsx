'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Users,
  Store as StoreIcon,
  Radio,
  Send,
  Sliders,
  Search,
  ExternalLink,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Terminal,
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import {
  SuperTelemetry,
  Tenant,
  Store,
  DLQMessage,
  DispatchLog,
  SystemConfig,
} from '@/lib/db';

type TabType = 'tenants' | 'stores' | 'pipeline' | 'dispatches' | 'config';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ email: string; name?: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('tenants');
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Impersonation state
  const [impersonatingTenant, setImpersonatingTenant] = useState<{ user_id: string; email: string; company_name: string } | null>(null);

  // Telemetry KPIs
  const [telemetry, setTelemetry] = useState<SuperTelemetry>({
    mrr: 14850,
    activeSubscriptions: 48,
    activeTrials: 112,
    totalMonitoredStores: 26,
    totalSkusTracked: 1420850,
    globalIngestionRate: 420,
    averageLatencyMs: 184,
    dlqCount: 3,
    webhookFailureRate: 0.02,
  });

  // Tab 1: Tenants
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantPlanFilter, setTenantPlanFilter] = useState('all');
  const [tenantStatusFilter, setTenantStatusFilter] = useState('all');

  // Tab 2: Stores
  const [stores, setStores] = useState<Store[]>([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeAccountFilter, setStoreAccountFilter] = useState('all');

  // Tab 3: DLQ & Pipeline
  const [dlqMessages, setDlqMessages] = useState<DLQMessage[]>([]);
  const [expandedPayloadId, setExpandedPayloadId] = useState<number | null>(null);

  // Tab 4: Dispatch Logs
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>([]);
  const [expandedDispatchId, setExpandedDispatchId] = useState<number | null>(null);

  // Tab 5: System Config
  const [config, setConfig] = useState<SystemConfig>({
    id: 1,
    maintenance_mode: false,
    registration_gate: 'open',
    rate_limit_per_min: 1200,
    banner_text: '',
    updated_at: new Date().toISOString(),
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Dismiss feedback automatically
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Authenticate session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        setAdminUser(data.user);
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Load telemetry & active tab data
  const loadTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/super/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data.telemetry);
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    }
  }, []);

  const loadTabData = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTelemetry();

      if (activeTab === 'tenants') {
        const res = await fetch(
          `/api/admin/super/tenants?search=${encodeURIComponent(tenantSearch)}&planTier=${encodeURIComponent(tenantPlanFilter)}&status=${encodeURIComponent(tenantStatusFilter)}`
        );
        if (res.ok) {
          const data = await res.json();
          setTenants(data.tenants || []);
        }
      } else if (activeTab === 'stores') {
        const res = await fetch(
          `/api/admin/super/stores?search=${encodeURIComponent(storeSearch)}&accountType=${encodeURIComponent(storeAccountFilter)}`
        );
        if (res.ok) {
          const data = await res.json();
          setStores(data.stores || []);
        }
      } else if (activeTab === 'pipeline') {
        const res = await fetch('/api/admin/super/dlq');
        if (res.ok) {
          const data = await res.json();
          setDlqMessages(data.messages || []);
        }
      } else if (activeTab === 'dispatches') {
        const res = await fetch('/api/admin/super/dispatches');
        if (res.ok) {
          const data = await res.json();
          setDispatchLogs(data.dispatches || []);
        }
      } else if (activeTab === 'config') {
        const res = await fetch('/api/admin/super/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data.config);
        }
      }
    } catch (err) {
      console.error('Error loading tab data:', err);
      setFeedback({ type: 'error', message: 'Failed to communicate with platform services.' });
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, tenantSearch, tenantPlanFilter, tenantStatusFilter, storeSearch, storeAccountFilter, loadTelemetry]);

  useEffect(() => {
    if (adminUser) {
      loadTabData();
    }
  }, [adminUser, loadTabData]);

  // Tenant Actions
  const handleTenantAction = async (id: number, action: string, plan_tier?: string) => {
    try {
      const res = await fetch('/api/admin/super/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, plan_tier }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === 'impersonate' && data.impersonating) {
          setImpersonatingTenant(data.impersonating);
        }
        setFeedback({ type: 'success', message: data.message || 'Tenant updated successfully.' });
        loadTabData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update tenant.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network exception during tenant operation.' });
    }
  };

  // Store Actions
  const handleStoreSync = async (storeId: number) => {
    try {
      const res = await fetch('/api/admin/super/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', storeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        loadTabData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Sync request failed.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to dispatch store sync.' });
    }
  };

  const handleOrphanCleanup = async () => {
    try {
      const res = await fetch('/api/admin/super/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanupOrphans' }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        loadTabData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Cleanup failed.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to purge orphan store records.' });
    }
  };

  // DLQ Actions
  const handleDLQAction = async (messageId: number, action: 'replay' | 'purge') => {
    try {
      const res = await fetch('/api/admin/super/dlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, messageId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        loadTabData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'DLQ operation failed.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to execute DLQ action.' });
    }
  };

  // Dispatch Actions
  const handleRetryDispatch = async (dispatchId: number) => {
    try {
      const res = await fetch('/api/admin/super/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', dispatchId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        loadTabData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Retry failed.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to retry outbound dispatch.' });
    }
  };

  const handleDisableWebhook = async (destination: string) => {
    try {
      const res = await fetch('/api/admin/super/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disableWebhook', destination }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        loadTabData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Action failed.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to disable webhook.' });
    }
  };

  // System Config Save
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/super/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
        setFeedback({ type: 'success', message: 'System configuration and feature flags saved live.' });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update system config.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Exception saving system configuration.' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b1dff] text-[#FDF4D2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#94A3B8]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#10B981]" />
          <span>Verifying sole owner authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b1dff] text-[#FDF4D2] font-sans antialiased selection:bg-[#FF788D] selection:text-white">
      {/* Impersonation Banner */}
      {impersonatingTenant && (
        <div className="bg-[#141C2B] border-b border-[#FF788D] px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[#FF788D] font-medium">
              <Eye className="w-3.5 h-3.5" />
              Impersonation Active
            </span>
            <span className="text-[#94A3B8]">
              Scoped debug view for <strong className="text-[#FDF4D2]">{impersonatingTenant.email}</strong> ({impersonatingTenant.company_name})
            </span>
          </div>
          <button
            onClick={() => setImpersonatingTenant(null)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0F1522] border border-[#1E293B] hover:border-[#FF788D] text-[#FDF4D2] rounded transition-colors text-xs"
          >
            <EyeOff className="w-3 h-3" />
            Exit Impersonation
          </button>
        </div>
      )}

      {/* Top Navigation Header */}
      <header className="border-b border-[#1E293B] bg-[#0F1522]/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/assets/branding/kultra-logo-v2.png"
                alt="Kultra Sentinel"
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
              />
              <span className="text-base font-medium tracking-tight text-[#FDF4D2]">Kultra Sentinel</span>
            </div>
            <div className="h-4 w-px bg-[#1E293B]" />
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#141C2B] border border-[#1E293B] text-[#10B981] font-medium">
              Platform Owner View
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[#FDF4D2] font-medium">{adminUser?.email}</div>
              <div className="text-[11px] text-[#94A3B8]">Sole Administrator</div>
            </div>

            <button
              onClick={loadTabData}
              disabled={refreshing}
              title="Refresh telemetry"
              className="p-2 rounded border border-[#1E293B] bg-[#141C2B] text-[#94A3B8] hover:text-[#FDF4D2] hover:border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#10B981]' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 rounded border border-[#1E293B] bg-[#141C2B] text-[#94A3B8] hover:text-[#FF788D] hover:border-[#FF788D]/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-4 py-3 rounded border text-sm flex items-center justify-between transition-all ${
              feedback.type === 'success'
                ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]'
                : 'bg-[#FF788D]/10 border-[#FF788D]/40 text-[#FF788D]'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* SECTION 1: Top-Level Platform Telemetry (Global KPIs) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Platform Telemetry</h2>
            <span className="text-[11px] text-[#94A3B8]">Real-time pipeline observation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Commercial Metrics */}
            <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4">
              <div className="text-[11px] text-[#94A3B8] font-medium">Monthly Recurring Revenue</div>
              <div className="text-2xl font-semibold text-[#FDF4D2] mt-1 tracking-tight">
                ${telemetry.mrr.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#10B981] mt-1.5 flex items-center gap-1">
                <span>Stripe live recurring balance</span>
              </div>
            </div>

            <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4">
              <div className="text-[11px] text-[#94A3B8] font-medium">Active Tenants vs. Trials</div>
              <div className="text-2xl font-semibold text-[#FDF4D2] mt-1 tracking-tight">
                {telemetry.activeSubscriptions}{' '}
                <span className="text-sm font-normal text-[#94A3B8]">Paid</span>
                <span className="text-sm font-normal text-[#1E293B] mx-1.5">/</span>
                {telemetry.activeTrials}{' '}
                <span className="text-sm font-normal text-[#94A3B8]">Trials</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-1.5">
                {telemetry.activeSubscriptions + telemetry.activeTrials} total active platform accounts
              </div>
            </div>

            <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4">
              <div className="text-[11px] text-[#94A3B8] font-medium">Total Monitored Stores</div>
              <div className="text-2xl font-semibold text-[#FDF4D2] mt-1 tracking-tight">
                {telemetry.totalMonitoredStores}
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-1.5">
                Across standalone & MCA child feeds
              </div>
            </div>

            <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4">
              <div className="text-[11px] text-[#94A3B8] font-medium">Total SKUs Tracked</div>
              <div className="text-2xl font-semibold text-[#FDF4D2] mt-1 tracking-tight">
                {telemetry.totalSkusTracked.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#10B981] mt-1.5">
                Under continuous Pub/Sub observation
              </div>
            </div>

            {/* Infrastructure & Pipeline Health */}
            <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4">
              <div className="text-[11px] text-[#94A3B8] font-medium">Global Ingestion Rate</div>
              <div className="text-2xl font-semibold text-[#FDF4D2] mt-1 tracking-tight">
                {telemetry.globalIngestionRate} <span className="text-sm font-normal text-[#94A3B8]">msg/min</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-1.5">
                Inbound Google Cloud Pub/Sub events
              </div>
            </div>

            <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4">
              <div className="text-[11px] text-[#94A3B8] font-medium">Average End-to-End Latency</div>
              <div className="text-2xl font-semibold text-[#10B981] mt-1 tracking-tight">
                {telemetry.averageLatencyMs} <span className="text-sm font-normal text-[#94A3B8]">ms</span>
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-1.5">
                From GCP arrival to Slack webhook dispatch
              </div>
            </div>

            <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4">
              <div className="text-[11px] text-[#94A3B8] font-medium">Dead Letter Queue (DLQ)</div>
              <div className={`text-2xl font-semibold mt-1 tracking-tight ${telemetry.dlqCount > 0 ? 'text-[#FF788D]' : 'text-[#10B981]'}`}>
                {telemetry.dlqCount}
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-1.5">
                Failed or malformed payloads awaiting replay
              </div>
            </div>

            <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4">
              <div className="text-[11px] text-[#94A3B8] font-medium">Outbound Webhook Failure Rate</div>
              <div className="text-2xl font-semibold text-[#FDF4D2] mt-1 tracking-tight">
                {(telemetry.webhookFailureRate * 100).toFixed(2)}%
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-1.5">
                Slack API 4xx/5xx rejection percentage
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Navigation Tabs */}
        <section className="space-y-6">
          <div className="border-b border-[#1E293B]">
            <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px">
              <button
                onClick={() => setActiveTab('tenants')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'tenants'
                    ? 'border-[#FF788D] text-[#FDF4D2]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#FDF4D2] hover:border-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Tenant Management</span>
              </button>

              <button
                onClick={() => setActiveTab('stores')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'stores'
                    ? 'border-[#FF788D] text-[#FDF4D2]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#FDF4D2] hover:border-slate-700'
                }`}
              >
                <StoreIcon className="w-4 h-4" />
                <span>Global Store Registry</span>
              </button>

              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'pipeline'
                    ? 'border-[#FF788D] text-[#FDF4D2]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#FDF4D2] hover:border-slate-700'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Pub/Sub Pipeline & DLQ</span>
                {telemetry.dlqCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#FF788D]/20 text-[#FF788D] border border-[#FF788D]/40">
                    {telemetry.dlqCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('dispatches')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'dispatches'
                    ? 'border-[#FF788D] text-[#FDF4D2]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#FDF4D2] hover:border-slate-700'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Outbound Dispatch Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'config'
                    ? 'border-[#FF788D] text-[#FDF4D2]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#FDF4D2] hover:border-slate-700'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>System Configuration</span>
              </button>
            </nav>
          </div>

          {/* TAB 1: Tenant Management */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search User ID, email, agency..."
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#0F1522] border border-[#1E293B] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#FF788D]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={tenantPlanFilter}
                    onChange={(e) => setTenantPlanFilter(e.target.value)}
                    className="bg-[#0F1522] border border-[#1E293B] rounded text-xs text-[#FDF4D2] px-3 py-1.5 focus:outline-none focus:border-[#FF788D]"
                  >
                    <option value="all">All Plans</option>
                    <option value="Trial">Trial</option>
                    <option value="Agency Pilot">Agency Pilot</option>
                    <option value="Active Pro">Active Pro</option>
                    <option value="Delinquent">Delinquent</option>
                    <option value="Canceled">Canceled</option>
                  </select>

                  <select
                    value={tenantStatusFilter}
                    onChange={(e) => setTenantStatusFilter(e.target.value)}
                    className="bg-[#0F1522] border border-[#1E293B] rounded text-xs text-[#FDF4D2] px-3 py-1.5 focus:outline-none focus:border-[#FF788D]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Tenants Table */}
              <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141C2B] text-[#94A3B8] border-b border-[#1E293B]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tenant Identity</th>
                        <th className="px-4 py-3 font-medium">Subscription Tier</th>
                        <th className="px-4 py-3 font-medium">Usage Footprint</th>
                        <th className="px-4 py-3 font-medium">OAuth Status</th>
                        <th className="px-4 py-3 font-medium">Last Active</th>
                        <th className="px-4 py-3 font-medium text-right">Super-Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {tenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-[#141C2B]/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-[#FDF4D2]">{tenant.company_name}</div>
                            <div className="text-[#94A3B8] text-[11px]">{tenant.email}</div>
                            <div className="text-[#94A3B8]/60 text-[10px]">{tenant.user_id}</div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                                tenant.plan_tier === 'Active Pro'
                                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                                  : tenant.plan_tier === 'Agency Pilot'
                                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                  : tenant.plan_tier === 'Trial'
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : 'bg-[#FF788D]/15 text-[#FF788D] border-[#FF788D]/30'
                              }`}
                            >
                              {tenant.plan_tier}
                            </span>
                            {tenant.status === 'suspended' && (
                              <div className="text-[10px] text-[#FF788D] mt-1 font-medium">Suspended</div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-[#FDF4D2] font-medium">
                              {tenant.connected_stores} store{tenant.connected_stores > 1 ? 's' : ''}
                            </div>
                            <div className="text-[#94A3B8] text-[11px]">
                              {tenant.total_skus.toLocaleString()} SKUs
                            </div>
                            <div className="text-[#94A3B8] text-[10px]">
                              {tenant.incidents_month} incidents this month
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] ${
                                tenant.oauth_status === 'Valid'
                                  ? 'text-[#10B981]'
                                  : tenant.oauth_status === 'Expiring Soon'
                                  ? 'text-amber-400'
                                  : 'text-[#FF788D]'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  tenant.oauth_status === 'Valid'
                                    ? 'bg-[#10B981]'
                                    : tenant.oauth_status === 'Expiring Soon'
                                    ? 'bg-amber-400'
                                    : 'bg-[#FF788D]'
                                }`}
                              />
                              {tenant.oauth_status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-[#94A3B8] text-[11px]">
                            {new Date(tenant.last_active).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleTenantAction(tenant.id, 'impersonate')}
                                title="Impersonate User (Log in as)"
                                className="px-2 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-slate-700 text-[#FDF4D2] rounded text-[11px] transition-colors"
                              >
                                Impersonate
                              </button>

                              <button
                                onClick={() => handleTenantAction(tenant.id, 'extendTrial')}
                                title="Extend Trial / Grant Agency Pilot"
                                className="px-2 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-blue-500/40 text-blue-400 rounded text-[11px] transition-colors"
                              >
                                Pilot Grant
                              </button>

                              <button
                                onClick={() => handleTenantAction(tenant.id, 'forceReauth')}
                                title="Force OAuth Re-Auth Request"
                                className="px-2 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-amber-500/40 text-amber-400 rounded text-[11px] transition-colors"
                              >
                                Re-Auth
                              </button>

                              {tenant.status === 'active' ? (
                                <button
                                  onClick={() => handleTenantAction(tenant.id, 'suspend')}
                                  title="Suspend Tenant (Halt Pub/Sub)"
                                  className="p-1 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D]/60 text-[#FF788D] rounded transition-colors"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleTenantAction(tenant.id, 'unsuspend')}
                                  title="Unsuspend Tenant (Restore Ingestion)"
                                  className="p-1 bg-[#141C2B] border border-[#1E293B] hover:border-[#10B981]/60 text-[#10B981] rounded transition-colors"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tenants.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-[#94A3B8]">
                            No customer accounts match the filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Global Store Registry */}
          {activeTab === 'stores' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search GMC ID, store domain, tenant email..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#0F1522] border border-[#1E293B] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#FF788D]"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={storeAccountFilter}
                    onChange={(e) => setStoreAccountFilter(e.target.value)}
                    className="bg-[#0F1522] border border-[#1E293B] rounded text-xs text-[#FDF4D2] px-3 py-1.5 focus:outline-none focus:border-[#FF788D]"
                  >
                    <option value="all">All Account Types</option>
                    <option value="Standalone Merchant">Standalone Merchant</option>
                    <option value="MCA Child">MCA Child</option>
                  </select>

                  <button
                    onClick={handleOrphanCleanup}
                    className="px-3 py-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D]/50 text-[#FDF4D2] hover:text-[#FF788D] rounded text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Orphan Cleanup</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141C2B] text-[#94A3B8] border-b border-[#1E293B]">
                      <tr>
                        <th className="px-4 py-3 font-medium">GMC Merchant ID</th>
                        <th className="px-4 py-3 font-medium">Parent Tenant</th>
                        <th className="px-4 py-3 font-medium">Account Type</th>
                        <th className="px-4 py-3 font-medium">Store URL & Domain</th>
                        <th className="px-4 py-3 font-medium">Pub/Sub Subscription State</th>
                        <th className="px-4 py-3 font-medium">Disapproval Metrics</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {stores.map((store) => (
                        <tr key={store.id} className="hover:bg-[#141C2B]/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-[#FDF4D2]">
                            {store.gmc_id}
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-[#FDF4D2] font-medium">{store.tenant_email}</div>
                            <div className="text-[#94A3B8] text-[10px]">Tenant ID #{store.tenant_id}</div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] border ${
                                store.account_type === 'MCA Child'
                                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {store.account_type}
                            </span>
                            {store.status === 'orphaned' && (
                              <div className="text-[10px] text-[#FF788D] mt-1 font-medium">Orphan Feed</div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <a
                              href={`https://${store.store_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#FDF4D2] hover:text-[#FF788D] flex items-center gap-1 transition-colors"
                            >
                              <span>{store.store_url}</span>
                              <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                            </a>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-[11px] text-[#94A3B8] font-mono truncate max-w-[200px]" title={store.pubsub_topic}>
                              {store.pubsub_topic}
                            </div>
                            <div className="text-[10px] text-[#94A3B8]/70 mt-0.5">
                              Last push: {new Date(store.last_message_at).toLocaleTimeString()}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                  store.open_disapprovals > 0
                                    ? 'bg-[#FF788D]/15 text-[#FF788D] border border-[#FF788D]/30'
                                    : 'text-[#10B981]'
                                }`}
                              >
                                {store.open_disapprovals} open
                              </span>
                              <span className="text-[#94A3B8] text-[11px]">
                                ({store.total_caught} total caught)
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleStoreSync(store.id)}
                              className="px-2.5 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-slate-700 text-[#FDF4D2] rounded text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3 text-[#10B981]" />
                              <span>Full Sync</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {stores.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-[#94A3B8]">
                            No Google Merchant Center stores registered matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Pub/Sub Ingestion Pipeline & Dead Letter Queue */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Telemetry Stream & Latency Tracker */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Ingestion Stream */}
                <div className="lg:col-span-2 bg-[#0F1522] border border-[#1E293B] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#10B981]" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FDF4D2]">Live Ingestion Stream</h3>
                    </div>
                    <span className="text-[11px] text-[#10B981] font-mono">Stream Active (GCP Pub/Sub)</span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded bg-[#141C2B] border border-[#1E293B] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#10B981]/20 text-[#10B981]">200 OK</span>
                        <span className="text-[#FDF4D2]">item_disapproved: missing_required_attribute [gtin]</span>
                      </div>
                      <span className="text-[#94A3B8] text-[10px]">104928192 - 14ms</span>
                    </div>

                    <div className="p-2.5 rounded bg-[#141C2B] border border-[#1E293B] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700/50 text-[#94A3B8]">SKIPPED</span>
                        <span className="text-[#94A3B8]">item_status_unchanged: product_id: sku_49810</span>
                      </div>
                      <span className="text-[#94A3B8] text-[10px]">294018241 - 4ms</span>
                    </div>

                    <div className="p-2.5 rounded bg-[#141C2B] border border-[#1E293B] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#10B981]/20 text-[#10B981]">200 OK</span>
                        <span className="text-[#FDF4D2]">item_disapproved: pricing_mismatch [price]</span>
                      </div>
                      <span className="text-[#94A3B8] text-[10px]">994817263 - 18ms</span>
                    </div>

                    <div className="p-2.5 rounded bg-[#141C2B] border border-[#1E293B] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#FF788D]/20 text-[#FF788D]">DLQ</span>
                        <span className="text-[#FF788D]">UNSUPPORTED_ISSUE_CODE: unexpected payload schema</span>
                      </div>
                      <span className="text-[#94A3B8] text-[10px]">msg_gcp_9901 - DLQ</span>
                    </div>
                  </div>
                </div>

                {/* Latency Tracker Chart */}
                <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FDF4D2]">Latency Tracker</h3>
                      <span className="text-[11px] text-[#94A3B8]">Last 24 Hours</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#94A3B8]">Average Latency</span>
                          <span className="text-[#10B981] font-mono">184 ms</span>
                        </div>
                        <div className="w-full bg-[#141C2B] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#10B981] h-full" style={{ width: '42%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#94A3B8]">95th Percentile</span>
                          <span className="text-[#FDF4D2] font-mono">240 ms</span>
                        </div>
                        <div className="w-full bg-[#141C2B] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full" style={{ width: '58%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#94A3B8]">99th Percentile</span>
                          <span className="text-[#FDF4D2] font-mono">310 ms</span>
                        </div>
                        <div className="w-full bg-[#141C2B] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: '74%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#141C2B] border border-[#1E293B] rounded text-[11px] text-[#94A3B8]">
                    Threshold Target: &lt; 500 ms SLA across all GCP message events to outbound Slack block kit dispatch.
                  </div>
                </div>
              </div>

              {/* Dead Letter Queue (DLQ) Triage Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FDF4D2]">Dead Letter Queue (DLQ) Triage</h3>
                    <p className="text-[11px] text-[#94A3B8]">Inspect unhandled payloads and replay following worker bug fixes</p>
                  </div>
                  <span className="text-xs text-[#FF788D] font-mono">{dlqMessages.length} unhandled messages</span>
                </div>

                <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141C2B] text-[#94A3B8] border-b border-[#1E293B]">
                        <tr>
                          <th className="px-4 py-3 font-medium">Message ID</th>
                          <th className="px-4 py-3 font-medium">Timestamp</th>
                          <th className="px-4 py-3 font-medium">Merchant ID</th>
                          <th className="px-4 py-3 font-medium">Failure Reason</th>
                          <th className="px-4 py-3 font-medium">Raw Payload</th>
                          <th className="px-4 py-3 font-medium text-right">DLQ Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {dlqMessages.map((msg) => (
                          <React.Fragment key={msg.id}>
                            <tr className="hover:bg-[#141C2B]/50 transition-colors">
                              <td className="px-4 py-3 font-mono text-[11px] text-[#FDF4D2]">
                                {msg.message_id}
                              </td>

                              <td className="px-4 py-3 text-[#94A3B8] text-[11px]">
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </td>

                              <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">
                                {msg.merchant_id}
                              </td>

                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-[#FF788D]/15 text-[#FF788D] border border-[#FF788D]/30 font-mono">
                                  {msg.failure_reason}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setExpandedPayloadId(expandedPayloadId === msg.id ? null : msg.id)}
                                  className="text-xs text-[#94A3B8] hover:text-[#FDF4D2] flex items-center gap-1 transition-colors"
                                >
                                  <span>View JSON</span>
                                  {expandedPayloadId === msg.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleDLQAction(msg.id, 'replay')}
                                    className="px-2 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-[#10B981]/50 text-[#10B981] rounded text-[11px] transition-colors flex items-center gap-1"
                                  >
                                    <Play className="w-3 h-3" />
                                    <span>Replay</span>
                                  </button>

                                  <button
                                    onClick={() => handleDLQAction(msg.id, 'purge')}
                                    className="px-2 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D]/50 text-[#FF788D] rounded text-[11px] transition-colors flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Purge</span>
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {expandedPayloadId === msg.id && (
                              <tr className="bg-[#141C2B]/80">
                                <td colSpan={6} className="px-4 py-3 border-t border-[#1E293B]">
                                  <div className="text-[11px] text-[#94A3B8] mb-1 font-medium">Extracted GCP Message Payload:</div>
                                  <pre className="p-3 bg-[#0a0b1dff] border border-[#1E293B] rounded text-[11px] font-mono text-[#FDF4D2] overflow-x-auto max-h-48">
                                    {JSON.stringify(msg.payload, null, 2)}
                                  </pre>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                        {dlqMessages.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-[#94A3B8]">
                              Dead Letter Queue is empty. No rejected GCP messages detected.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Outbound Dispatch Logs */}
          {activeTab === 'dispatches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FDF4D2]">Slack & Outbound Dispatch Logs</h3>
                  <p className="text-[11px] text-[#94A3B8]">Verify that alerts are successfully delivered to client Slack channels</p>
                </div>
                <span className="text-xs text-[#94A3B8]">{dispatchLogs.length} recent dispatches</span>
              </div>

              <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141C2B] text-[#94A3B8] border-b border-[#1E293B]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Dispatch ID & Time</th>
                        <th className="px-4 py-3 font-medium">Tenant & Store</th>
                        <th className="px-4 py-3 font-medium">Destination Channel</th>
                        <th className="px-4 py-3 font-medium">Delivery Status</th>
                        <th className="px-4 py-3 font-medium">Payload Preview</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {dispatchLogs.map((log) => (
                        <React.Fragment key={log.id}>
                          <tr className="hover:bg-[#141C2B]/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-mono text-[11px] text-[#FDF4D2]">{log.dispatch_id}</div>
                              <div className="text-[10px] text-[#94A3B8]">{new Date(log.created_at).toLocaleTimeString()}</div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-medium text-[#FDF4D2]">{log.tenant_email}</div>
                              <div className="text-[#94A3B8] text-[10px]">{log.store_url}</div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-mono text-[11px] text-[#94A3B8] truncate max-w-[220px]" title={log.destination}>
                                {log.destination}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                                  log.status_label === 'Delivered'
                                    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                                    : log.status_label === 'Rate Limited'
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-[#FF788D]/15 text-[#FF788D] border-[#FF788D]/30'
                                }`}
                              >
                                <span>{log.delivery_status}</span>
                                <span>{log.status_label}</span>
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() => setExpandedDispatchId(expandedDispatchId === log.id ? null : log.id)}
                                className="text-xs text-[#94A3B8] hover:text-[#FDF4D2] flex items-center gap-1 transition-colors"
                              >
                                <span>Block Kit JSON</span>
                                {expandedDispatchId === log.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleRetryDispatch(log.id)}
                                  className="px-2 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-slate-700 text-[#FDF4D2] rounded text-[11px] transition-colors"
                                >
                                  Retry
                                </button>

                                <button
                                  onClick={() => handleDisableWebhook(log.destination)}
                                  className="px-2 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D]/50 text-[#FF788D] rounded text-[11px] transition-colors"
                                >
                                  Silence
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedDispatchId === log.id && (
                            <tr className="bg-[#141C2B]/80">
                              <td colSpan={6} className="px-4 py-3 border-t border-[#1E293B]">
                                <div className="text-[11px] text-[#94A3B8] mb-1 font-medium">Slack Block Kit JSON Dispatched:</div>
                                <pre className="p-3 bg-[#0a0b1dff] border border-[#1E293B] rounded text-[11px] font-mono text-[#FDF4D2] overflow-x-auto max-h-48">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {dispatchLogs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-[#94A3B8]">
                            No outbound webhook dispatches recorded in the buffer.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: System Configuration & Feature Flags */}
          {activeTab === 'config' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[#0F1522] border border-[#1E293B] rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="text-base font-medium text-[#FDF4D2]">Platform Controls & Feature Flags</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Control platform behavior globally in real-time without requiring code redeployments.
                  </p>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-6">
                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between p-4 bg-[#141C2B] border border-[#1E293B] rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-[#FDF4D2]">Maintenance Mode</div>
                      <div className="text-xs text-[#94A3B8] mt-0.5">
                        Pauses customer dashboard logins while keeping background Pub/Sub ingestion alive.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.maintenance_mode}
                        onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#0a0b1dff] border border-[#1E293B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#94A3B8] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF788D]" />
                    </label>
                  </div>

                  {/* Registration Gate */}
                  <div className="p-4 bg-[#141C2B] border border-[#1E293B] rounded-lg space-y-2">
                    <label className="block text-sm font-medium text-[#FDF4D2]">Registration Gate</label>
                    <p className="text-xs text-[#94A3B8]">
                      Regulates pilot onboarding flow on the landing page.
                    </p>
                    <select
                      value={config.registration_gate}
                      onChange={(e) =>
                        setConfig({ ...config, registration_gate: e.target.value as 'open' | 'invite_only' | 'closed' })
                      }
                      className="w-full bg-[#0F1522] border border-[#1E293B] rounded p-2 text-xs text-[#FDF4D2] focus:outline-none focus:border-[#FF788D]"
                    >
                      <option value="open">Open Sign-ups (Standard Pilot Ingestion)</option>
                      <option value="invite_only">Invite-only Code Gate (Manual Access Only)</option>
                      <option value="closed">Closed Registration (Waitlist Paused)</option>
                    </select>
                  </div>

                  {/* Global Rate Limiting */}
                  <div className="p-4 bg-[#141C2B] border border-[#1E293B] rounded-lg space-y-2">
                    <label className="block text-sm font-medium text-[#FDF4D2]">Global Ingestion Rate Limiter</label>
                    <p className="text-xs text-[#94A3B8]">
                      Maximum Pub/Sub and webhook transactions processed per minute per tenant namespace.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="100"
                        max="10000"
                        step="50"
                        value={config.rate_limit_per_min}
                        onChange={(e) => setConfig({ ...config, rate_limit_per_min: Number(e.target.value) })}
                        className="w-48 bg-[#0F1522] border border-[#1E293B] rounded p-2 text-xs text-[#FDF4D2] focus:outline-none focus:border-[#FF788D]"
                      />
                      <span className="text-xs text-[#94A3B8]">req / minute</span>
                    </div>
                  </div>

                  {/* Global Alert Banner */}
                  <div className="p-4 bg-[#141C2B] border border-[#1E293B] rounded-lg space-y-2">
                    <label className="block text-sm font-medium text-[#FDF4D2]">Global Customer Alert Banner</label>
                    <p className="text-xs text-[#94A3B8]">
                      Broadcasts a live message banner across all authenticated customer dashboards. Leave blank to disable.
                    </p>
                    <textarea
                      rows={3}
                      value={config.banner_text || ''}
                      onChange={(e) => setConfig({ ...config, banner_text: e.target.value })}
                      placeholder="e.g., Scheduled Google Merchant API maintenance on Sunday 02:00 UTC. Pub/Sub buffer active."
                      className="w-full bg-[#0F1522] border border-[#1E293B] rounded p-2 text-xs text-[#FDF4D2] placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#FF788D]"
                    />
                    {config.banner_text && (
                      <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-300">
                        <span className="font-semibold">Live Preview: </span>
                        <span>{config.banner_text}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="px-4 py-2 bg-[#FF788D] hover:bg-[#FF788D]/90 text-[#0a0b1dff] font-medium text-xs rounded transition-colors disabled:opacity-50"
                    >
                      {savingConfig ? 'Saving Platform Changes...' : 'Save Configuration Live'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
