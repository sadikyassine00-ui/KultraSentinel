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
  Check,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  DollarSign,
  Layers,
  Activity,
  ShieldAlert,
  Server,
  Zap,
  Globe,
  RefreshCw,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const navGroups = [
    {
      group: 'Platform Intelligence',
      items: [
        { id: 'tenants' as TabType, label: 'Tenant Management', icon: Users, badge: tenants.length > 0 ? tenants.length : null, badgeColor: 'bg-[#1E293B] text-[#CBD5E1]' },
        { id: 'stores' as TabType, label: 'Global Store Registry', icon: StoreIcon, badge: stores.length > 0 ? stores.length : null, badgeColor: 'bg-[#1E293B] text-[#CBD5E1]' },
      ],
    },
    {
      group: 'Pipeline & Ingestion',
      items: [
        {
          id: 'pipeline' as TabType,
          label: 'Pub/Sub Pipeline & DLQ',
          icon: Radio,
          badge: telemetry.dlqCount > 0 ? `${telemetry.dlqCount} DLQ` : null,
          badgeColor: 'bg-[#FF788D] text-[#0a0b1dff] font-bold',
        },
        { id: 'dispatches' as TabType, label: 'Outbound Dispatch Logs', icon: Send, badge: dispatchLogs.length > 0 ? dispatchLogs.length : null, badgeColor: 'bg-[#1E293B] text-[#CBD5E1]' },
      ],
    },
    {
      group: 'System Controls',
      items: [
        { id: 'config' as TabType, label: 'System Configuration', icon: Sliders, badge: null, badgeColor: '' },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b1dff] text-[#FDF4D2] flex items-center justify-center">
        <div className="text-sm text-[#CBD5E1] flex items-center gap-2.5 font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Verifying sole owner authentication...</span>
        </div>
      </div>
    );
  }

  // Get initials for tenant/user monogram
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex-1 w-full bg-[#0a0b1dff] text-[#FDF4D2] font-sans antialiased selection:bg-[#FF788D] selection:text-white flex flex-col lg:flex-row">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden h-12 border-b border-[#1f2c42] bg-[#0c101c]/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-[68px] z-30">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[#2B3B52] bg-[#142036] text-[#FDF4D2] hover:bg-[#1C2C4A] text-xs font-semibold"
          aria-label="Open dashboard navigation"
        >
          <Menu className="w-4 h-4 text-[#FF788D]" />
          <span>{navGroups.flatMap((g) => g.items).find((n) => n.id === activeTab)?.label}</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-[#34D399] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Pub/Sub Active</span>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0c101c] border-r border-[#1f2c42] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:sticky lg:top-[68px] lg:h-[calc(100vh-68px)] lg:overflow-y-auto shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Console Header */}
          <div className="space-y-2 pb-4 border-b border-[#1f2c42]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-xs font-bold text-[#FDF4D2] tracking-wide uppercase">
                  Sentinel Console
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded text-[#CBD5E1] hover:text-[#FDF4D2]"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#152033] text-[#34D399] border border-[#10B981]/30">
                Platform Owner
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Merchant API v1
              </span>
            </div>
          </div>

          {/* Navigation Items Grouped */}
          <nav className="space-y-5" aria-label="Sidebar Navigation">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] px-3 pb-1">
                  {grp.group}
                </div>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#182438] text-[#FDF4D2] border-l-[3px] border-[#FF788D] shadow-sm font-semibold'
                          : 'text-[#CBD5E1] hover:bg-[#142033] hover:text-[#FDF4D2] border-l-[3px] border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF788D]' : 'text-[#94A3B8]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span className={`px-2 py-0.5 rounded text-[10px] ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (Admin Profile & Sign Out) */}
        <div className="p-4 border-t border-[#1f2c42] bg-[#090d17] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#142036] border border-[#2B3B52] flex items-center justify-center text-xs font-bold text-[#FF788D] shrink-0">
                YS
              </div>
              <div className="min-w-0">
                <div className="text-xs text-[#FDF4D2] font-semibold truncate" title={adminUser?.email}>
                  {adminUser?.email}
                </div>
                <div className="text-[11px] text-[#34D399] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Sole Owner</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out of console"
              className="p-2 rounded border border-[#2B3B52] bg-[#142036] text-[#CBD5E1] hover:text-[#FF788D] hover:border-[#FF788D]/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Mission Control Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Mission Control Sub-Header Strip */}
        <header className="hidden lg:flex h-12 border-b border-[#1f2c42] bg-[#0c101c]/90 backdrop-blur-md px-6 items-center justify-between sticky top-[68px] z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#CBD5E1]">
              <span className="text-[#94A3B8]">Mission Control</span>
              <span className="text-[#475569]">/</span>
              <span className="text-[#FDF4D2]">
                {navGroups.flatMap((g) => g.items).find((n) => n.id === activeTab)?.label}
              </span>
            </div>

            <div className="h-4 w-px bg-[#223147]" />

            <div className="flex items-center gap-1.5 text-xs font-medium text-[#34D399] bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/40">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Pub/Sub Ingestion Online (420 msg/min)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-[#94A3B8] font-mono font-medium px-2 py-0.5 rounded bg-[#111828] border border-[#223147]">
              GCP: us-central1
            </div>

            <button
              onClick={() => loadTabData()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#142036] hover:bg-[#1C2C4A] text-[#CBD5E1] hover:text-[#FDF4D2] border border-[#2B3B52] text-xs font-semibold transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Impersonation Banner */}
        {impersonatingTenant && (
          <div className="bg-[#1C2436] border-b-2 border-[#FF788D] px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF788D] text-[#0a0b1dff] font-bold shrink-0">
                <Eye className="w-3.5 h-3.5" />
                Impersonation Active
              </span>
              <span className="text-[#E2E8F0]">
                Viewing live tenant dashboard for <strong className="text-[#FDF4D2] underline decoration-[#FF788D] underline-offset-2">{impersonatingTenant.email}</strong> ({impersonatingTenant.company_name})
              </span>
            </div>
            <button
              onClick={() => setImpersonatingTenant(null)}
              className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-[#142036] border border-[#2B3B52] hover:border-[#FF788D] text-[#FDF4D2] font-medium rounded transition-colors text-xs self-start sm:self-auto"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Exit Impersonation
            </button>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Feedback Toast */}
          {feedback && (
            <div
              className={`px-4 py-3 rounded-md border text-sm flex items-center justify-between font-medium transition-all shadow-md ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-xs opacity-80 hover:opacity-100 uppercase tracking-wider font-bold">
                Dismiss
              </button>
            </div>
          )}

          {/* SECTION 1: Top-Level Platform Telemetry (Global KPIs) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1]">Platform Global Telemetry</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Real-time commercial volume and Google Cloud Pub/Sub pipeline health</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#34D399] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/40">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>GCP Pipeline Synchronized</span>
              </div>
            </div>

            {/* Commercial Telemetry Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: MRR */}
              <div className="bg-[#111828] border border-[#223147] border-t-2 border-t-sky-400 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#CBD5E1]">Monthly Recurring Revenue</span>
                  <div className="p-1.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
                  ${telemetry.mrr.toLocaleString()}
                </div>
                <div className="text-xs text-sky-400 font-medium flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Stripe Live Recurring Volume</span>
                </div>
              </div>

              {/* Card 2: Active Subs vs Trials */}
              <div className="bg-[#111828] border border-[#223147] border-t-2 border-t-indigo-400 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#CBD5E1]">Active Tenants vs. Trials</span>
                  <div className="p-1.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight flex items-baseline gap-1.5">
                  <span>{telemetry.activeSubscriptions}</span>
                  <span className="text-sm font-medium text-indigo-300">Paid</span>
                  <span className="text-sm text-[#475569]">/</span>
                  <span className="text-xl font-bold text-[#CBD5E1]">{telemetry.activeTrials}</span>
                  <span className="text-sm font-medium text-[#94A3B8]">Trials</span>
                </div>
                <div className="text-xs text-indigo-300 font-medium pt-1">
                  {telemetry.activeSubscriptions + telemetry.activeTrials} total platform accounts under contract
                </div>
              </div>

              {/* Card 3: Monitored Stores */}
              <div className="bg-[#111828] border border-[#223147] border-t-2 border-t-emerald-400 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#CBD5E1]">Total Monitored Stores</span>
                  <div className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <StoreIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
                  {telemetry.totalMonitoredStores}
                </div>
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Standalone & MCA child stores</span>
                </div>
              </div>

              {/* Card 4: Total SKUs Tracked */}
              <div className="bg-[#111828] border border-[#223147] border-t-2 border-t-amber-400 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#CBD5E1]">Total SKUs Under Defense</span>
                  <div className="p-1.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
                  {telemetry.totalSkusTracked.toLocaleString()}
                </div>
                <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Continuous Pub/Sub monitoring</span>
                </div>
              </div>

              {/* Infrastructure & Pipeline Telemetry Row */}
              {/* Card 5: Ingestion Rate */}
              <div className="bg-[#111828] border border-[#223147] border-t-2 border-t-emerald-500 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#CBD5E1]">Global Ingestion Throughput</span>
                  <div className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Radio className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight flex items-baseline gap-1">
                  <span>{telemetry.globalIngestionRate}</span>
                  <span className="text-sm font-semibold text-emerald-400">msg/min</span>
                </div>
                <div className="text-xs text-[#CBD5E1] font-medium pt-1">
                  Inbound Google Cloud Pub/Sub topic events
                </div>
              </div>

              {/* Card 6: Latency */}
              <div className="bg-[#111828] border border-[#223147] border-t-2 border-t-emerald-400 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#CBD5E1]">Average End-to-End Latency</span>
                  <div className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#34D399] tracking-tight flex items-baseline gap-1">
                  <span>{telemetry.averageLatencyMs}</span>
                  <span className="text-sm font-semibold text-emerald-400">ms</span>
                </div>
                <div className="text-xs text-emerald-400 font-medium pt-1">
                  GCP event arrival to Slack dispatch (SLA &lt; 500ms)
                </div>
              </div>

              {/* Card 7: DLQ Count */}
              <div className="bg-[#111828] border border-[#223147] border-t-2 border-t-[#FF788D] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#CBD5E1]">Dead Letter Queue (DLQ)</span>
                  <div className="p-1.5 rounded bg-[#FF788D]/20 text-[#FF788D] border border-[#FF788D]/40">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${telemetry.dlqCount > 0 ? 'text-[#FF788D]' : 'text-[#34D399]'}`}>
                  {telemetry.dlqCount}
                </div>
                <div className="text-xs text-[#CBD5E1] font-medium pt-1">
                  {telemetry.dlqCount > 0 ? 'Payloads awaiting triage and replay' : 'Zero dropped payloads'}
                </div>
              </div>

              {/* Card 8: Webhook Failure Rate */}
              <div className="bg-[#111828] border border-[#223147] border-t-2 border-t-purple-400 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#CBD5E1]">Slack Outbound Failure Rate</span>
                  <div className="p-1.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
                  {(telemetry.webhookFailureRate * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-purple-300 font-medium pt-1">
                  Slack 4xx/5xx API rejection rate
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Active Management View */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#223147]">
              <div>
                <h1 className="text-lg font-bold text-[#FDF4D2]">
                  {navGroups.flatMap((g) => g.items).find((n) => n.id === activeTab)?.label}
                </h1>
                <p className="text-xs text-[#CBD5E1] mt-0.5">
                  Operational control surface for platform administrators
                </p>
              </div>
            </div>

            {/* TAB 1: Tenant Management */}
            {activeTab === 'tenants' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#111828] border border-[#223147] p-3 rounded-lg">
                  <div className="relative w-full sm:w-88">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#CBD5E1]" />
                    <input
                      type="text"
                      placeholder="Search User ID, company, email..."
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF788D] font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <select
                      value={tenantPlanFilter}
                      onChange={(e) => setTenantPlanFilter(e.target.value)}
                      className="w-1/2 sm:w-auto bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] px-3 py-2 focus:outline-none focus:border-[#FF788D] font-medium"
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
                      className="w-1/2 sm:w-auto bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] px-3 py-2 focus:outline-none focus:border-[#FF788D] font-medium"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Tenants Table */}
                <div className="bg-[#111828] border border-[#223147] rounded-lg overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[720px]">
                      <thead className="bg-[#142036] text-[#CBD5E1] border-b border-[#223147]">
                        <tr>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Tenant Identity</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Subscription Tier</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Usage Footprint</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">OAuth Status</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Last Active</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Super-Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#223147]">
                        {tenants.map((tenant) => (
                          <tr key={tenant.id} className="hover:bg-[#152238] transition-colors">
                            {/* Tenant Identity */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-md bg-[#18263D] border border-[#2B3E5C] text-xs font-bold text-[#FDF4D2] flex items-center justify-center shrink-0">
                                  {getInitials(tenant.company_name)}
                                </div>
                                <div>
                                  <div className="font-bold text-[#FDF4D2] text-sm">{tenant.company_name}</div>
                                  <div className="text-[#CBD5E1] text-xs font-medium">{tenant.email}</div>
                                  <div className="text-[#94A3B8] text-[10px] font-mono">{tenant.user_id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Plan Tier */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${
                                  tenant.plan_tier === 'Active Pro'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                    : tenant.plan_tier === 'Agency Pilot'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                                    : tenant.plan_tier === 'Trial'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                }`}
                              >
                                {tenant.plan_tier}
                              </span>
                              {tenant.status === 'suspended' && (
                                <div className="text-[11px] text-[#FF788D] mt-1 font-bold">Suspended Account</div>
                              )}
                            </td>

                            {/* Usage Footprint */}
                            <td className="px-4 py-3.5">
                              <div className="text-[#FDF4D2] font-semibold text-xs">
                                {tenant.connected_stores} connected store{tenant.connected_stores > 1 ? 's' : ''}
                              </div>
                              <div className="text-[#CBD5E1] text-xs font-medium">
                                {tenant.total_skus.toLocaleString()} SKUs Tracked
                              </div>
                              <div className="text-[#34D399] text-[11px] font-semibold">
                                {tenant.incidents_month} incidents caught this mo.
                              </div>
                            </td>

                            {/* OAuth Status */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${
                                  tenant.oauth_status === 'Valid'
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                                    : tenant.oauth_status === 'Expiring Soon'
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/40'
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

                            {/* Last Active */}
                            <td className="px-4 py-3.5 text-[#CBD5E1] text-xs font-medium whitespace-nowrap">
                              {new Date(tenant.last_active).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>

                            {/* Operational Actions */}
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleTenantAction(tenant.id, 'impersonate')}
                                  title="Impersonate User (Log in as)"
                                  className="px-2.5 py-1.5 bg-[#18263D] border border-[#2B3E5C] hover:border-[#FF788D] text-[#FDF4D2] font-semibold rounded text-xs transition-colors"
                                >
                                  Impersonate
                                </button>

                                <button
                                  onClick={() => handleTenantAction(tenant.id, 'extendTrial')}
                                  title="Extend Trial / Grant Agency Pilot"
                                  className="px-2.5 py-1.5 bg-blue-500/15 border border-blue-500/40 hover:bg-blue-500/25 text-blue-300 font-semibold rounded text-xs transition-colors"
                                >
                                  Pilot Grant
                                </button>

                                <button
                                  onClick={() => handleTenantAction(tenant.id, 'forceReauth')}
                                  title="Force OAuth Re-Auth Request"
                                  className="px-2.5 py-1.5 bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 font-semibold rounded text-xs transition-colors"
                                >
                                  Re-Auth
                                </button>

                                {tenant.status === 'active' ? (
                                  <button
                                    onClick={() => handleTenantAction(tenant.id, 'suspend')}
                                    title="Suspend Tenant (Halt Pub/Sub Ingestion)"
                                    className="p-1.5 bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 text-[#FF788D] rounded transition-colors"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleTenantAction(tenant.id, 'unsuspend')}
                                    title="Unsuspend Tenant (Restore Pub/Sub)"
                                    className="p-1.5 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 text-[#10B981] rounded transition-colors"
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
                            <td colSpan={6} className="px-4 py-12 text-center text-[#CBD5E1]">
                              No customer accounts found matching filter criteria.
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
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#111828] border border-[#223147] p-3 rounded-lg">
                  <div className="relative w-full sm:w-88">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#CBD5E1]" />
                    <input
                      type="text"
                      placeholder="Search GMC Merchant ID, store domain, tenant..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF788D] font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={storeAccountFilter}
                      onChange={(e) => setStoreAccountFilter(e.target.value)}
                      className="bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] px-3 py-2 focus:outline-none focus:border-[#FF788D] font-medium"
                    >
                      <option value="all">All Account Types</option>
                      <option value="Standalone Merchant">Standalone Merchant</option>
                      <option value="MCA Child">MCA Child</option>
                    </select>

                    <button
                      onClick={handleOrphanCleanup}
                      className="px-3.5 py-2 bg-[#18263D] border border-rose-500/40 hover:bg-rose-500/20 text-[#FF788D] rounded text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Orphan Cleanup</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#111828] border border-[#223147] rounded-lg overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[760px]">
                      <thead className="bg-[#142036] text-[#CBD5E1] border-b border-[#223147]">
                        <tr>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">GMC Merchant ID</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Parent Tenant</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Account Type</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Store URL & Domain</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Pub/Sub Topic State</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Disapprovals</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#223147]">
                        {stores.map((store) => (
                          <tr key={store.id} className="hover:bg-[#152238] transition-colors">
                            {/* GMC ID */}
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#FDF4D2]">
                              {store.gmc_id}
                            </td>

                            {/* Parent Tenant */}
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-[#FDF4D2] text-xs">{store.tenant_email}</div>
                              <div className="text-[#94A3B8] text-[11px] font-mono">Tenant ID #{store.tenant_id}</div>
                            </td>

                            {/* Account Type */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                                  store.account_type === 'MCA Child'
                                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                }`}
                              >
                                {store.account_type}
                              </span>
                              {store.status === 'orphaned' && (
                                <div className="text-[11px] text-[#FF788D] mt-1 font-bold">Orphan Feed</div>
                              )}
                            </td>

                            {/* URL */}
                            <td className="px-4 py-3.5">
                              <a
                                href={`https://${store.store_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#FDF4D2] font-medium hover:text-[#FF788D] flex items-center gap-1.5 transition-colors underline decoration-[#2B3E5C] underline-offset-2"
                              >
                                <span>{store.store_url}</span>
                                <ExternalLink className="w-3 h-3 text-[#CBD5E1]" />
                              </a>
                            </td>

                            {/* Topic */}
                            <td className="px-4 py-3.5">
                              <div className="text-xs text-[#CBD5E1] font-mono truncate max-w-[200px]" title={store.pubsub_topic}>
                                {store.pubsub_topic}
                              </div>
                              <div className="text-[11px] text-[#34D399] font-medium mt-0.5">
                                Last push: {new Date(store.last_message_at).toLocaleTimeString()}
                              </div>
                            </td>

                            {/* Disapprovals */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    store.open_disapprovals > 0
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                                      : 'text-[#34D399] font-semibold'
                                  }`}
                                >
                                  {store.open_disapprovals} open
                                </span>
                                <span className="text-[#CBD5E1] text-xs font-medium">
                                  ({store.total_caught} total)
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleStoreSync(store.id)}
                                className="px-3 py-1.5 bg-[#18263D] border border-[#2B3E5C] hover:border-[#10B981] text-[#FDF4D2] font-semibold rounded text-xs transition-colors inline-flex items-center gap-1.5"
                              >
                                <span>Trigger Full Sync</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {stores.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-[#CBD5E1]">
                              No Google Merchant Center stores registered.
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Live Ingestion Stream */}
                  <div className="lg:col-span-2 bg-[#111828] border border-[#223147] rounded-lg p-5 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#223147] pb-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#34D399]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#FDF4D2]">Live Pub/Sub Ingestion Terminal</h3>
                      </div>
                      <span className="text-xs text-[#34D399] font-mono font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span>Topic Stream Active</span>
                      </span>
                    </div>

                    <div className="space-y-2.5 font-mono text-xs">
                      <div className="p-3 rounded-md bg-[#152033] border border-[#2B3B52] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">200 OK</span>
                          <span className="text-[#FDF4D2] font-medium break-all">item_disapproved: missing_required_attribute [gtin]</span>
                        </div>
                        <span className="text-[#CBD5E1] text-[11px] shrink-0 font-semibold">104928192 &bull; 14ms</span>
                      </div>

                      <div className="p-3 rounded-md bg-[#152033] border border-[#2B3B52] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-[#CBD5E1] border border-slate-600">SKIPPED</span>
                          <span className="text-[#CBD5E1] font-medium break-all">item_status_unchanged: product_id: sku_49810</span>
                        </div>
                        <span className="text-[#CBD5E1] text-[11px] shrink-0 font-semibold">294018241 &bull; 4ms</span>
                      </div>

                      <div className="p-3 rounded-md bg-[#152033] border border-[#2B3B52] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">200 OK</span>
                          <span className="text-[#FDF4D2] font-medium break-all">item_disapproved: pricing_mismatch [price]</span>
                        </div>
                        <span className="text-[#CBD5E1] text-[11px] shrink-0 font-semibold">994817263 &bull; 18ms</span>
                      </div>

                      <div className="p-3 rounded-md bg-[#152033] border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-[#FF788D] border border-rose-500/50">DLQ DROP</span>
                          <span className="text-[#FF788D] font-medium break-all">UNSUPPORTED_ISSUE_CODE: unexpected payload schema</span>
                        </div>
                        <span className="text-[#FF788D] text-[11px] shrink-0 font-bold">msg_gcp_9901 &bull; DLQ</span>
                      </div>
                    </div>
                  </div>

                  {/* Latency Tracker Chart */}
                  <div className="bg-[#111828] border border-[#223147] rounded-lg p-5 space-y-4 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#223147] pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#FDF4D2]">Pipeline Latency Tracker</h3>
                        <span className="text-xs text-[#34D399] font-medium">Last 24 Hours</span>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#CBD5E1] font-semibold">Average Processing Latency</span>
                            <span className="text-[#34D399] font-mono font-bold">184 ms</span>
                          </div>
                          <div className="w-full bg-[#152033] h-2 rounded-full overflow-hidden border border-[#2B3B52]">
                            <div className="bg-[#10B981] h-full" style={{ width: '42%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#CBD5E1] font-semibold">95th Percentile Latency</span>
                            <span className="text-sky-400 font-mono font-bold">240 ms</span>
                          </div>
                          <div className="w-full bg-[#152033] h-2 rounded-full overflow-hidden border border-[#2B3B52]">
                            <div className="bg-sky-400 h-full" style={{ width: '58%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#CBD5E1] font-semibold">99th Percentile Latency</span>
                            <span className="text-amber-400 font-mono font-bold">310 ms</span>
                          </div>
                          <div className="w-full bg-[#152033] h-2 rounded-full overflow-hidden border border-[#2B3B52]">
                            <div className="bg-amber-400 h-full" style={{ width: '74%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#CBD5E1] font-medium">
                      <span className="text-[#34D399] font-bold">SLA Guarantee: </span>
                      <span>Target is &lt; 500ms from GCP arrival to Slack alert dispatch. Current pipeline operating at 184ms average.</span>
                    </div>
                  </div>
                </div>

                {/* Dead Letter Queue (DLQ) Triage Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#FDF4D2]">Dead Letter Queue (DLQ) Triage Table</h3>
                      <p className="text-xs text-[#CBD5E1]">Inspect unhandled GCP payloads, inspect raw JSON, and replay after worker patches</p>
                    </div>
                    <span className="text-xs text-[#0a0b1dff] bg-[#FF788D] font-bold px-2.5 py-1 rounded">
                      {dlqMessages.length} Unhandled DLQ Payloads
                    </span>
                  </div>

                  <div className="bg-[#111828] border border-[#223147] rounded-lg overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[700px]">
                        <thead className="bg-[#142036] text-[#CBD5E1] border-b border-[#223147]">
                          <tr>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">GCP Message ID</th>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Receipt Timestamp</th>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Merchant ID</th>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Failure Reason</th>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Raw Payload</th>
                            <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">DLQ Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#223147]">
                          {dlqMessages.map((msg) => (
                            <React.Fragment key={msg.id}>
                              <tr className="hover:bg-[#152238] transition-colors">
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#FDF4D2]">
                                  {msg.message_id}
                                </td>

                                <td className="px-4 py-3.5 text-[#CBD5E1] text-xs font-medium whitespace-nowrap">
                                  {new Date(msg.created_at).toLocaleTimeString()}
                                </td>

                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#CBD5E1]">
                                  {msg.merchant_id}
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="px-2.5 py-1 rounded text-xs bg-rose-500/20 text-[#FF788D] border border-rose-500/50 font-bold font-mono">
                                    {msg.failure_reason}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <button
                                    onClick={() => setExpandedPayloadId(expandedPayloadId === msg.id ? null : msg.id)}
                                    className="text-xs text-[#CBD5E1] hover:text-[#FDF4D2] font-semibold flex items-center gap-1.5 transition-colors"
                                  >
                                    <span>Inspect Raw JSON</span>
                                    {expandedPayloadId === msg.id ? <ChevronUp className="w-4 h-4 text-[#FF788D]" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </td>

                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleDLQAction(msg.id, 'replay')}
                                      className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded text-xs transition-colors flex items-center gap-1.5"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                      <span>Replay</span>
                                    </button>

                                    <button
                                      onClick={() => handleDLQAction(msg.id, 'purge')}
                                      className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/50 hover:bg-rose-500/30 text-[#FF788D] font-bold rounded text-xs transition-colors flex items-center gap-1.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Purge</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {expandedPayloadId === msg.id && (
                                <tr className="bg-[#0b0f1a]">
                                  <td colSpan={6} className="px-4 py-4 border-t border-[#223147]">
                                    <div className="text-xs text-[#CBD5E1] mb-2 font-bold flex items-center gap-2">
                                      <Terminal className="w-4 h-4 text-[#FF788D]" />
                                      <span>GCP Pub/Sub Ingestion Raw Payload Details:</span>
                                    </div>
                                    <pre className="p-4 bg-[#060810] border border-[#2B3B52] rounded-md text-xs font-mono text-[#FDF4D2] overflow-x-auto max-h-56 leading-relaxed">
                                      {JSON.stringify(msg.payload, null, 2)}
                                    </pre>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                          {dlqMessages.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-12 text-center text-[#CBD5E1]">
                                Dead Letter Queue is clear. Zero dropped or malformed messages.
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
                    <h3 className="text-sm font-bold text-[#FDF4D2]">Slack & Outbound Dispatch Logs</h3>
                    <p className="text-xs text-[#CBD5E1]">Verify that product disapproval incidents are delivered to client Slack channels</p>
                  </div>
                  <span className="text-xs text-[#CBD5E1] bg-[#142036] border border-[#2B3B52] px-3 py-1 rounded font-semibold">
                    {dispatchLogs.length} Recent Dispatches
                  </span>
                </div>

                <div className="bg-[#111828] border border-[#223147] rounded-lg overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[760px]">
                      <thead className="bg-[#142036] text-[#CBD5E1] border-b border-[#223147]">
                        <tr>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Dispatch ID & Time</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Tenant & Store</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Destination Channel</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Delivery Status</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px]">Payload Preview</th>
                          <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#223147]">
                        {dispatchLogs.map((log) => (
                          <React.Fragment key={log.id}>
                            <tr className="hover:bg-[#152238] transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="font-mono text-xs font-bold text-[#FDF4D2]">{log.dispatch_id}</div>
                                <div className="text-[11px] text-[#CBD5E1] font-medium">{new Date(log.created_at).toLocaleTimeString()}</div>
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="font-bold text-[#FDF4D2] text-xs">{log.tenant_email}</div>
                                <div className="text-[#CBD5E1] text-xs font-medium">{log.store_url}</div>
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="font-mono text-xs text-[#CBD5E1] truncate max-w-[220px]" title={log.destination}>
                                  {log.destination}
                                </div>
                              </td>

                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${
                                    log.status_label === 'Delivered'
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                      : log.status_label === 'Rate Limited'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                      : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                  }`}
                                >
                                  <span>{log.delivery_status}</span>
                                  <span>{log.status_label}</span>
                                </span>
                              </td>

                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <button
                                  onClick={() => setExpandedDispatchId(expandedDispatchId === log.id ? null : log.id)}
                                  className="text-xs text-[#CBD5E1] hover:text-[#FDF4D2] font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                  <span>View Block Kit JSON</span>
                                  {expandedDispatchId === log.id ? <ChevronUp className="w-4 h-4 text-[#FF788D]" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </td>

                              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleRetryDispatch(log.id)}
                                    className="px-3 py-1.5 bg-[#18263D] border border-[#2B3E5C] hover:border-[#10B981] text-[#FDF4D2] font-semibold rounded text-xs transition-colors"
                                  >
                                    Retry
                                  </button>

                                  <button
                                    onClick={() => handleDisableWebhook(log.destination)}
                                    className="px-3 py-1.5 bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 text-[#FF788D] font-semibold rounded text-xs transition-colors"
                                  >
                                    Silence
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {expandedDispatchId === log.id && (
                              <tr className="bg-[#0b0f1a]">
                                <td colSpan={6} className="px-4 py-4 border-t border-[#223147]">
                                  <div className="text-xs text-[#CBD5E1] mb-2 font-bold">Slack Block Kit JSON Dispatched to Customer:</div>
                                  <pre className="p-4 bg-[#060810] border border-[#2B3B52] rounded-md text-xs font-mono text-[#FDF4D2] overflow-x-auto max-h-56 leading-relaxed">
                                    {JSON.stringify(log.payload, null, 2)}
                                  </pre>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                        {dispatchLogs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-[#CBD5E1]">
                              No outbound webhook logs available.
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
                <div className="bg-[#111828] border border-[#223147] rounded-lg p-5 sm:p-7 space-y-6 shadow-xl">
                  <div>
                    <h3 className="text-lg font-bold text-[#FDF4D2]">Platform Operational Controls & Feature Flags</h3>
                    <p className="text-xs text-[#CBD5E1] mt-1 font-medium">
                      Control platform behavior globally in real-time without redeploying code.
                    </p>
                  </div>

                  <form onSubmit={handleSaveConfig} className="space-y-6">
                    {/* Maintenance Mode */}
                    <div className="flex items-center justify-between p-4 bg-[#152033] border border-[#2B3B52] rounded-lg">
                      <div className="pr-4">
                        <div className="text-sm font-bold text-[#FDF4D2]">Maintenance Mode</div>
                        <div className="text-xs text-[#CBD5E1] mt-0.5 font-medium">
                          Pauses customer dashboard logins while keeping background GCP Pub/Sub workers active.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={config.maintenance_mode}
                          onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-[#060810] border border-[#2B3B52] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#CBD5E1] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF788D]" />
                      </label>
                    </div>

                    {/* Registration Gate */}
                    <div className="p-4 bg-[#152033] border border-[#2B3B52] rounded-lg space-y-2">
                      <label className="block text-sm font-bold text-[#FDF4D2]">Registration Gate</label>
                      <p className="text-xs text-[#CBD5E1] font-medium">
                        Regulates pilot onboarding and access controls on the public landing page.
                      </p>
                      <select
                        value={config.registration_gate}
                        onChange={(e) =>
                          setConfig({ ...config, registration_gate: e.target.value as 'open' | 'invite_only' | 'closed' })
                        }
                        className="w-full bg-[#111828] border border-[#2B3B52] rounded p-2.5 text-xs text-[#FDF4D2] font-semibold focus:outline-none focus:border-[#FF788D]"
                      >
                        <option value="open">Open Sign-ups (Standard Pilot Intake)</option>
                        <option value="invite_only">Invite-only Code Gate (Manual Approval Required)</option>
                        <option value="closed">Closed Registration (Waitlist Paused)</option>
                      </select>
                    </div>

                    {/* Global Rate Limiting */}
                    <div className="p-4 bg-[#152033] border border-[#2B3B52] rounded-lg space-y-2">
                      <label className="block text-sm font-bold text-[#FDF4D2]">Global Pub/Sub Ingestion Rate Limiter</label>
                      <p className="text-xs text-[#CBD5E1] font-medium">
                        Maximum Google Cloud Pub/Sub and webhook transactions processed per minute per tenant namespace.
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="100"
                          max="10000"
                          step="50"
                          value={config.rate_limit_per_min}
                          onChange={(e) => setConfig({ ...config, rate_limit_per_min: Number(e.target.value) })}
                          className="w-48 bg-[#111828] border border-[#2B3B52] rounded p-2.5 text-xs text-[#FDF4D2] font-bold focus:outline-none focus:border-[#FF788D]"
                        />
                        <span className="text-xs text-[#CBD5E1] font-bold">req / minute</span>
                      </div>
                    </div>

                    {/* Global Alert Banner */}
                    <div className="p-4 bg-[#152033] border border-[#2B3B52] rounded-lg space-y-2">
                      <label className="block text-sm font-bold text-[#FDF4D2]">Global Customer Dashboard Alert Banner</label>
                      <p className="text-xs text-[#CBD5E1] font-medium">
                        Broadcasts a live banner across all authenticated customer dashboards. Leave blank to disable.
                      </p>
                      <textarea
                        rows={3}
                        value={config.banner_text || ''}
                        onChange={(e) => setConfig({ ...config, banner_text: e.target.value })}
                        placeholder="e.g., Routine Google Merchant API maintenance scheduled on Sunday 02:00 UTC. Pub/Sub queue remains active."
                        className="w-full bg-[#111828] border border-[#2B3B52] rounded p-2.5 text-xs text-[#FDF4D2] placeholder-[#94A3B8] font-medium focus:outline-none focus:border-[#FF788D]"
                      />
                      {config.banner_text && (
                        <div className="mt-2.5 p-3 bg-amber-500/15 border border-amber-500/40 rounded text-xs text-amber-300 font-medium">
                          <span className="font-bold">Live Banner Preview: </span>
                          <span>{config.banner_text}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={savingConfig}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#FF788D] hover:bg-[#FF788D]/90 text-[#0a0b1dff] font-bold text-xs rounded transition-colors shadow-md disabled:opacity-50"
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
    </div>
  );
}
