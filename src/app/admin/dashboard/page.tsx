'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  AlertTriangle,
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
  ShieldAlert,
  Zap,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import {
  SuperTelemetry,
  Tenant,
  Store,
  DLQMessage,
  DispatchLog,
  SystemConfig,
} from '@/lib/db';
import {
  TenantsTabSkeleton,
  StoresTabSkeleton,
  PipelineDlqTabSkeleton,
  DispatchesTabSkeleton,
  ConfigTabSkeleton,
  DashboardPageSkeleton,
} from '@/components/Skeleton';

type TabType = 'tenants' | 'stores' | 'pipeline' | 'dispatches' | 'config';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ email: string; name?: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tenants');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize sidebar collapsed state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kultra_sidebar_collapsed');
      if (saved === 'true') {
        setSidebarCollapsed(true);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('kultra_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

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

  const loadTabData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setTabLoading(true);
    }
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
      setTabLoading(false);
      setIsRefreshing(false);
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
      setFeedback({ type: 'error', message: 'Failed to clean orphan stores.' });
    }
  };

  // DLQ Actions
  const handleDLQAction = async (id: number, action: 'replay' | 'purge') => {
    try {
      const res = await fetch('/api/admin/super/dlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message || `Message #${id} processed successfully.` });
        loadTabData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Action failed.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network exception during DLQ triage.' });
    }
  };

  // Outbound Dispatch Actions
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
        { id: 'tenants' as TabType, label: 'Tenant Management', icon: Users, badge: tenants.length > 0 ? tenants.length : null, badgeColor: 'bg-[#1E293B]/70 text-[#94A3B8]' },
        { id: 'stores' as TabType, label: 'Global Store Registry', icon: StoreIcon, badge: stores.length > 0 ? stores.length : null, badgeColor: 'bg-[#1E293B]/70 text-[#94A3B8]' },
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
          badgeColor: 'bg-[#FF788D]/15 text-[#FF788D] border border-[#FF788D]/30 font-semibold',
        },
        { id: 'dispatches' as TabType, label: 'Outbound Dispatch Logs', icon: Send, badge: dispatchLogs.length > 0 ? dispatchLogs.length : null, badgeColor: 'bg-[#1E293B]/70 text-[#94A3B8]' },
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
    return <DashboardPageSkeleton />;
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
      <div className="lg:hidden h-12 border-b border-[#1E293B] bg-[#0F1522] px-4 flex items-center justify-between sticky top-[68px] z-30">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-[#1E293B] bg-[#141C2B] text-[#FDF4D2] hover:bg-[#1E293B] text-xs font-semibold transition-colors"
          aria-label="Open dashboard navigation"
        >
          <Menu className="w-4 h-4 text-[#FF788D]" />
          <span>{navGroups.flatMap((g) => g.items).find((n) => n.id === activeTab)?.label}</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-[#10B981] font-medium bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>Pub/Sub QoS 1 Online</span>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Refined Sidebar Navigation (Collapsible Rail) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0c101a] border-r border-[#1a2333] flex flex-col justify-between transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:sticky lg:top-[68px] lg:h-[calc(100vh-68px)] lg:overflow-y-auto shrink-0 ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-[68px]' : 'lg:w-64'}`}
      >
        <div className="p-3.5 space-y-3">
          {/* Top Bar: Mobile Close or Desktop Collapse Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]/60">
            {/* Mobile View: Title + Close Button */}
            <div className="lg:hidden flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#141C2B] border border-[#1E293B] flex items-center justify-center text-[#FDF4D2] shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#FDF4D2] tracking-wide">
                    Sentinel Mission Control
                  </div>
                  <div className="text-[10px] text-[#10B981] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>Production Console</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md border border-[#1E293B] bg-[#141C2B] text-[#94A3B8] hover:text-[#FDF4D2] transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop View: Expanded Mode */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {!sidebarCollapsed ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-[#141C2B] border border-[#1E293B] flex items-center justify-center text-[#FDF4D2] shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#10B981]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#FDF4D2] tracking-tight leading-none truncate">
                        Kultra Sentinel
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-medium flex items-center gap-1.5 mt-1 leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        <span>Fleet Console</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    title="Collapse sidebar"
                    className="p-1.5 rounded-md border border-[#1E293B] bg-[#141C2B] text-[#94A3B8] hover:text-[#FDF4D2] hover:border-[#2B3D55] transition-colors"
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="w-full flex justify-center">
                  <button
                    onClick={toggleSidebar}
                    title="Expand sidebar"
                    className="p-2 rounded-md border border-[#1E293B] bg-[#141C2B] text-[#94A3B8] hover:text-[#FDF4D2] hover:border-[#2B3D55] transition-colors"
                    aria-label="Expand sidebar"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items (Expanded Mode & Mobile) */}
          <nav
            className={`space-y-3 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}
            aria-label="Sidebar Navigation"
          >
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] px-3 pb-1 pt-2 first:pt-0">
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all relative ${
                        isActive
                          ? 'bg-[#141C2B] text-[#FDF4D2] border border-[#1E293B] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] font-semibold'
                          : 'text-[#94A3B8] hover:bg-[#141C2B]/60 hover:text-[#FDF4D2] border border-transparent font-medium'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#FF788D]" />
                      )}
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF788D]' : 'text-[#94A3B8]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Navigation Items (Collapsed Rail Mode) */}
          <nav
            className={`space-y-2 hidden ${sidebarCollapsed ? 'lg:block' : 'lg:hidden'}`}
            aria-label="Sidebar Navigation (Collapsed)"
          >
            {navGroups.map((grp, gIdx) => (
              <div key={grp.group} className="space-y-1.5">
                {gIdx > 0 && <div className="h-px bg-[#1E293B]/60 mx-1.5 my-2" />}
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <div key={item.id} className="relative group flex justify-center">
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        title={item.label}
                        className={`relative w-10 h-10 rounded-md flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#141C2B] text-[#FF788D] border border-[#FF788D]/40 shadow-sm'
                            : 'text-[#94A3B8] hover:bg-[#141C2B] hover:text-[#FDF4D2] border border-transparent'
                        }`}
                        aria-label={item.label}
                      >
                        <Icon className="w-4 h-4" />
                        {item.badge !== null && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF788D] border-2 border-[#0F1522]" />
                        )}
                      </button>

                      {/* Tooltip on Hover */}
                      <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-3 py-1.5 rounded-md bg-[#0F1522] border border-[#1E293B] text-xs font-semibold text-[#FDF4D2] whitespace-nowrap z-50 shadow-2xl items-center gap-2 pointer-events-none top-1/2 -translate-y-1/2">
                        <span>{item.label}</span>
                        {item.badge !== null && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (Admin Profile & Sign Out - Expanded Mode) */}
        <div className={`p-3.5 border-t border-[#1E293B] bg-[#0a0b1dff]/50 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
          {/* Fleet Telemetry Heartbeat */}
          <div className="px-3 py-2 rounded-md bg-[#0a0b1dff]/70 border border-[#1E293B]/70 mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-[#CBD5E1] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>QoS 1 Ingestion</span>
              </div>
              <span className="font-mono text-[#10B981] font-bold text-[10px]">{telemetry.globalIngestionRate} m/m</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
              <span>Pipeline SLA</span>
              <span className="font-mono text-[#CBD5E1]">{telemetry.averageLatencyMs} ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-[#141C2B] border border-[#1E293B] flex items-center justify-center text-xs font-bold text-[#FDF4D2] shrink-0">
                YS
              </div>
              <div className="min-w-0">
                <div className="text-xs text-[#FDF4D2] font-semibold truncate" title={adminUser?.email}>
                  {adminUser?.email}
                </div>
                <div className="text-[10px] text-[#10B981] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Platform Owner</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out of console"
              className="p-1.5 rounded-md border border-[#1E293B] bg-[#141C2B] text-[#94A3B8] hover:text-[#FF788D] hover:border-[#FF788D]/40 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer (Collapsed Rail Mode) */}
        <div className={`p-2.5 border-t border-[#1E293B] bg-[#0a0b1dff]/50 flex-col items-center gap-2.5 hidden ${sidebarCollapsed ? 'lg:flex' : 'lg:hidden'}`}>
          <div
            className="w-8 h-8 rounded-md bg-[#141C2B] border border-[#1E293B] flex items-center justify-center text-xs font-bold text-[#FDF4D2]"
            title={`${adminUser?.email} (Platform Owner)`}
          >
            YS
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of console"
            className="p-2 rounded-md border border-[#1E293B] bg-[#141C2B] text-[#94A3B8] hover:text-[#FF788D] hover:border-[#FF788D]/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Mission Control Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">

        {/* Impersonation Banner */}
        {impersonatingTenant && (
          <div className="bg-[#0F1522] border-b border-[#FF788D]/50 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FF788D] text-[#0a0b1dff] font-bold shrink-0">
                <Eye className="w-3.5 h-3.5" />
                Impersonation Active
              </span>
              <span className="text-[#CBD5E1]">
                Viewing live tenant dashboard for <strong className="text-[#FDF4D2]">{impersonatingTenant.email}</strong> ({impersonatingTenant.company_name})
              </span>
            </div>
            <button
              onClick={() => setImpersonatingTenant(null)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D] text-[#FDF4D2] font-semibold rounded text-xs transition-colors self-start sm:self-auto"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Exit Impersonation</span>
            </button>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Feedback Notification */}
          {feedback && (
            <div
              className={`px-4 py-3 rounded-md border text-xs flex items-center justify-between font-medium transition-all shadow-sm ${
                feedback.type === 'success'
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                  : 'bg-[#FF788D]/10 border-[#FF788D]/30 text-[#FF788D]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? <Check className="w-4 h-4 text-[#10B981]" /> : <AlertTriangle className="w-4 h-4 text-[#FF788D]" />}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-[11px] opacity-80 hover:opacity-100 uppercase tracking-wider font-bold">
                Dismiss
              </button>
            </div>
          )}

          {/* SECTION 1: Top-Level Platform Telemetry (Global KPIs) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-1 flex-wrap gap-4 border-b border-[#1E293B]/70 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] font-medium mb-1">
                  <span>Platform Intelligence</span>
                  <span className="text-[#64748B]">/</span>
                  <span className="text-[#CBD5E1]">Super Admin Console</span>
                  <span className="text-[#64748B]">/</span>
                  <span className="text-[#10B981] font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#10B981]/10 border border-[#10B981]/25">Production Fleet</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-base sm:text-lg font-bold text-[#FDF4D2] tracking-tight">Platform Telemetry & Fleet Health</h1>
                  <span className="text-[10px] font-mono font-medium text-[#94A3B8] px-2 py-0.5 rounded bg-[#0F1522] border border-[#1E293B]">GCP: us-central1</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">Real-time commercial volume and Google Cloud Pub/Sub QoS 1 streaming metrics</p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-md border border-[#10B981]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Pub/Sub Online ({telemetry.globalIngestionRate} msg/min)</span>
                </div>

                <button
                  onClick={() => loadTabData(true)}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141C2B] hover:bg-[#1E293B] text-[#CBD5E1] hover:text-[#FDF4D2] border border-[#1E293B] hover:border-[#2B3D55] text-xs font-semibold transition-all active:translate-y-[0.5px] shadow-sm disabled:opacity-60"
                  title="Refresh telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FF788D]' : ''}`} />
                  <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Tier 1: Commercial Volume Metrics (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: MRR */}
              <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] hover:border-[#2B3D55] transition-all rounded-xl p-4.5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Monthly Recurring Revenue</span>
                  <div className="p-1.5 rounded-md bg-[#141C2B] text-[#94A3B8] border border-[#1E293B]">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
                  ${telemetry.mrr.toLocaleString()}
                </div>
                <div className="text-xs text-[#94A3B8] font-medium flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>Stripe recurring volume</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#10B981] font-semibold">+14.2% MoM</span>
                </div>
              </div>

              {/* Card 2: Active Subs vs Trials */}
              <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] hover:border-[#2B3D55] transition-all rounded-xl p-4.5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Active Accounts</span>
                  <div className="p-1.5 rounded-md bg-[#141C2B] text-[#94A3B8] border border-[#1E293B]">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight flex items-baseline gap-1.5">
                  <span>{telemetry.activeSubscriptions}</span>
                  <span className="text-xs font-semibold text-[#CBD5E1]">Paid</span>
                  <span className="text-xs text-[#64748B]">/</span>
                  <span className="text-lg font-bold text-[#CBD5E1]">{telemetry.activeTrials}</span>
                  <span className="text-xs text-[#94A3B8]">Trial</span>
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <div className="w-full bg-[#141C2B] h-1.5 rounded-full overflow-hidden flex border border-[#1E293B]">
                    <div
                      className="bg-[#10B981] h-full"
                      style={{
                        width: `${Math.round(
                          (telemetry.activeSubscriptions /
                            Math.max(1, telemetry.activeSubscriptions + telemetry.activeTrials)) *
                            100
                        )}%`,
                      }}
                    />
                    <div
                      className="bg-[#94A3B8] h-full"
                      style={{
                        width: `${Math.round(
                          (telemetry.activeTrials /
                            Math.max(1, telemetry.activeSubscriptions + telemetry.activeTrials)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-[#94A3B8] font-medium">
                    {telemetry.activeSubscriptions + telemetry.activeTrials} platform accounts under contract
                  </div>
                </div>
              </div>

              {/* Card 3: Monitored Stores */}
              <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] hover:border-[#2B3D55] transition-all rounded-xl p-4.5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Monitored Stores</span>
                  <div className="p-1.5 rounded-md bg-[#141C2B] text-[#94A3B8] border border-[#1E293B]">
                    <StoreIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
                  {telemetry.totalMonitoredStores}
                </div>
                <div className="text-xs text-[#94A3B8] font-medium flex items-center justify-between pt-0.5">
                  <span>GMC Registry</span>
                  <span className="text-[11px] font-mono text-[#CBD5E1]">Standalone & MCA</span>
                </div>
              </div>

              {/* Card 4: Total SKUs Tracked */}
              <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] hover:border-[#2B3D55] transition-all rounded-xl p-4.5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">Observed SKUs</span>
                  <div className="p-1.5 rounded-md bg-[#141C2B] text-[#94A3B8] border border-[#1E293B]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
                  {telemetry.totalSkusTracked.toLocaleString()}
                </div>
                <div className="text-xs text-[#94A3B8] font-medium flex items-center justify-between pt-0.5">
                  <span>Continuous Pub/Sub monitoring</span>
                  <span className="text-[11px] font-mono text-[#10B981]">100% Coverage</span>
                </div>
              </div>
            </div>

            {/* Tier 2: Real-Time Pipeline Health Console (Unified 4-Metric Surface) */}
            <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-[#1E293B] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 shadow-sm overflow-hidden">
              {/* Metric 1: Ingestion */}
              <div className="p-4.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Ingestion Rate</span>
                  <Radio className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <div className="text-xl font-bold text-[#FDF4D2] tracking-tight flex items-baseline gap-1.5">
                  <span>{telemetry.globalIngestionRate}</span>
                  <span className="text-xs font-semibold text-[#10B981]">msg/min</span>
                </div>
                <div className="flex items-end gap-1 h-3 pt-0.5">
                  <span className="w-1.5 h-1.5 bg-[#10B981]/50 rounded-[1px]" />
                  <span className="w-1.5 h-2.5 bg-[#10B981]/70 rounded-[1px]" />
                  <span className="w-1.5 h-2 bg-[#10B981]/60 rounded-[1px]" />
                  <span className="w-1.5 h-3 bg-[#10B981]/80 rounded-[1px]" />
                  <span className="w-1.5 h-2.5 bg-[#10B981]/70 rounded-[1px]" />
                  <span className="w-1.5 h-3 bg-[#10B981] rounded-[1px]" />
                </div>
                <p className="text-[11px] text-[#94A3B8]">Google Cloud Pub/Sub QoS 1 streaming</p>
              </div>

              {/* Metric 2: Latency */}
              <div className="p-4.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Pipeline Latency</span>
                  <Zap className="w-3.5 h-3.5 text-[#94A3B8]" />
                </div>
                <div className="text-xl font-bold text-[#FDF4D2] tracking-tight flex items-baseline gap-1.5">
                  <span>{telemetry.averageLatencyMs}</span>
                  <span className="text-xs font-semibold text-[#94A3B8]">ms avg</span>
                </div>
                <div className="w-full bg-[#141C2B] h-1.5 rounded-full overflow-hidden border border-[#1E293B]">
                  <div
                    className="bg-[#10B981] h-full"
                    style={{
                      width: `${Math.min(100, Math.round((telemetry.averageLatencyMs / 500) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8]">GCP arrival to Slack dispatch (SLA &lt; 500ms)</p>
              </div>

              {/* Metric 3: Dead Letter Queue */}
              <div className="p-4.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Dead Letter Queue</span>
                  <ShieldAlert className={`w-3.5 h-3.5 ${telemetry.dlqCount > 0 ? 'text-[#FF788D]' : 'text-[#10B981]'}`} />
                </div>
                <div className="text-xl font-bold tracking-tight flex items-baseline gap-2">
                  <span className={telemetry.dlqCount > 0 ? 'text-[#FF788D]' : 'text-[#FDF4D2]'}>
                    {telemetry.dlqCount}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                    telemetry.dlqCount > 0
                      ? 'bg-[#FF788D]/15 text-[#FF788D] border-[#FF788D]/30'
                      : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                  }`}>
                    {telemetry.dlqCount > 0 ? 'Action Required' : 'Healthy'}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] pt-1">
                  {telemetry.dlqCount > 0 ? 'Dropped payloads awaiting triage' : 'Zero dropped payloads'}
                </p>
              </div>

              {/* Metric 4: Webhook Failure Rate */}
              <div className="p-4.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Slack Dispatch Success</span>
                  <Send className="w-3.5 h-3.5 text-[#94A3B8]" />
                </div>
                <div className="text-xl font-bold text-[#FDF4D2] tracking-tight flex items-baseline gap-1.5">
                  <span>{((1 - telemetry.webhookFailureRate) * 100).toFixed(1)}%</span>
                  <span className="text-xs font-semibold text-[#94A3B8]">deliverability</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] pt-1">
                  {(telemetry.webhookFailureRate * 100).toFixed(2)}% outbound 4xx/5xx errors
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: Active Management View */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#FDF4D2] tracking-tight">
                  {navGroups.flatMap((g) => g.items).find((n) => n.id === activeTab)?.label}
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Operational control surface for platform owner administration
                </p>
              </div>
            </div>

            {/* TAB 1: Tenant Management */}
            {activeTab === 'tenants' && tabLoading && <TenantsTabSkeleton />}
            {activeTab === 'tenants' && !tabLoading && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0F1522] border border-[#1E293B] p-3 rounded-xl shadow-sm">
                  <div className="relative w-full sm:w-88">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Search User ID, company, email..."
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      className="w-full pl-9 pr-12 py-2 bg-[#0a0b1dff] border border-[#1E293B] rounded-lg text-xs text-[#FDF4D2] placeholder-[#64748B] focus:outline-none focus:border-[#FF788D] font-medium transition-colors"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#64748B] px-1.5 py-0.5 rounded bg-[#141C2B] border border-[#1E293B] pointer-events-none">
                      ⌘K
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <select
                      value={tenantPlanFilter}
                      onChange={(e) => setTenantPlanFilter(e.target.value)}
                      className="w-1/2 sm:w-auto bg-[#0a0b1dff] border border-[#1E293B] rounded-lg text-xs text-[#FDF4D2] px-3 py-2 focus:outline-none focus:border-[#FF788D] font-medium transition-colors cursor-pointer"
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
                      className="w-1/2 sm:w-auto bg-[#0a0b1dff] border border-[#1E293B] rounded-lg text-xs text-[#FDF4D2] px-3 py-2 focus:outline-none focus:border-[#FF788D] font-medium transition-colors cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>                {/* Tenants Table */}
                <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[720px]">
                      <thead className="bg-[#0c121e] text-[#64748B] border-b border-[#1E293B]">
                        <tr>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Tenant Identity</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Subscription Tier</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Usage Footprint</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">OAuth Status</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Last Active</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]/60">
                        {tenants.map((tenant) => (
                          <tr key={tenant.id} className="hover:bg-[#141C2B]/50 transition-colors">
                            {/* Tenant Identity */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#141C2B] border border-[#1E293B] text-xs font-bold text-[#FDF4D2] flex items-center justify-center shrink-0">
                                  {getInitials(tenant.company_name)}
                                </div>
                                <div>
                                  <div className="font-semibold text-[#FDF4D2] text-xs">{tenant.company_name}</div>
                                  <div className="text-[#94A3B8] text-[11px] font-medium">{tenant.email}</div>
                                  <div className="text-[#64748B] text-[10px] font-mono">{tenant.user_id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Plan Tier */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                                  tenant.plan_tier === 'Active Pro' || tenant.plan_tier === 'Agency Pilot'
                                    ? 'bg-[#141C2B] text-[#FDF4D2] border-[#1E293B]'
                                    : tenant.plan_tier === 'Trial'
                                    ? 'bg-[#141C2B] text-[#CBD5E1] border-[#1E293B]'
                                    : 'bg-[#FF788D]/10 text-[#FF788D] border-[#FF788D]/30'
                                }`}
                              >
                                {tenant.plan_tier}
                              </span>
                              {tenant.status === 'suspended' && (
                                <div className="text-[10px] text-[#FF788D] mt-1 font-semibold">Suspended</div>
                              )}
                            </td>

                            {/* Usage Footprint */}
                            <td className="px-4 py-3.5">
                              <div className="text-[#FDF4D2] font-semibold text-xs">
                                {tenant.connected_stores} store{tenant.connected_stores > 1 ? 's' : ''}
                              </div>
                              <div className="text-[#94A3B8] text-[11px]">
                                {tenant.total_skus.toLocaleString()} SKUs
                              </div>
                              <div className="text-[#10B981] text-[10px] font-medium">
                                {tenant.incidents_month} incidents caught
                              </div>
                            </td>

                            {/* OAuth Status */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                                  tenant.oauth_status === 'Valid'
                                    ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                                    : tenant.oauth_status === 'Expiring Soon'
                                    ? 'bg-[#141C2B] text-[#CBD5E1] border-[#1E293B]'
                                    : 'bg-[#FF788D]/10 text-[#FF788D] border-[#FF788D]/30'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    tenant.oauth_status === 'Valid'
                                      ? 'bg-[#10B981]'
                                      : tenant.oauth_status === 'Expiring Soon'
                                      ? 'bg-[#CBD5E1]'
                                      : 'bg-[#FF788D]'
                                  }`}
                                />
                                {tenant.oauth_status}
                              </span>
                            </td>

                            {/* Last Active */}
                            <td className="px-4 py-3.5 text-[#94A3B8] text-xs font-medium whitespace-nowrap">
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
                                  title="Impersonate User"
                                  className="p-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D]/40 text-[#94A3B8] hover:text-[#FF788D] rounded-md transition-all active:translate-y-[0.5px] shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleTenantAction(tenant.id, 'extendTrial', 'Agency Pilot')}
                                  title="Upgrade to Agency Pilot"
                                  className="p-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#10B981]/40 text-[#94A3B8] hover:text-[#10B981] rounded-md transition-all active:translate-y-[0.5px] shadow-sm"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleTenantAction(tenant.id, 'forceReauth')}
                                  title="Force OAuth Reauthorization"
                                  className="p-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#CBD5E1]/40 text-[#94A3B8] hover:text-[#CBD5E1] rounded-md transition-all active:translate-y-[0.5px] shadow-sm"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>

                                {tenant.status === 'active' ? (
                                  <button
                                    onClick={() => handleTenantAction(tenant.id, 'suspend')}
                                    title="Suspend Tenant"
                                    className="p-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D]/40 text-[#94A3B8] hover:text-[#FF788D] rounded-md transition-all active:translate-y-[0.5px] shadow-sm"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleTenantAction(tenant.id, 'unsuspend')}
                                    title="Unsuspend Tenant"
                                    className="p-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#10B981]/40 text-[#94A3B8] hover:text-[#10B981] rounded-md transition-all active:translate-y-[0.5px] shadow-sm"
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
                            <td colSpan={6} className="px-4 py-12 text-center text-[#94A3B8]">
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
            {activeTab === 'stores' && tabLoading && <StoresTabSkeleton />}
            {activeTab === 'stores' && !tabLoading && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0F1522] border border-[#1E293B] p-3 rounded-xl shadow-sm">
                  <div className="relative w-full sm:w-88">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Search GMC Merchant ID, store domain, tenant..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="w-full pl-9 pr-12 py-2 bg-[#0a0b1dff] border border-[#1E293B] rounded-lg text-xs text-[#FDF4D2] placeholder-[#64748B] focus:outline-none focus:border-[#FF788D] font-medium transition-colors"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#64748B] px-1.5 py-0.5 rounded bg-[#141C2B] border border-[#1E293B] pointer-events-none">
                      ⌘K
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={storeAccountFilter}
                      onChange={(e) => setStoreAccountFilter(e.target.value)}
                      className="bg-[#0a0b1dff] border border-[#1E293B] rounded-lg text-xs text-[#FDF4D2] px-3 py-2 focus:outline-none focus:border-[#FF788D] font-medium transition-colors cursor-pointer"
                    >
                      <option value="all">All Account Types</option>
                      <option value="Standalone Merchant">Standalone Merchant</option>
                      <option value="MCA Child">MCA Child</option>
                    </select>

                    <button
                      onClick={handleOrphanCleanup}
                      className="px-3 py-2 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D]/50 text-[#CBD5E1] hover:text-[#FF788D] rounded-lg text-xs font-semibold transition-all active:translate-y-[0.5px] shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Orphan Cleanup</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[760px]">
                      <thead className="bg-[#0c121e] text-[#64748B] border-b border-[#1E293B]">
                        <tr>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">GMC Merchant ID</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Parent Tenant</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Account Type</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Store Domain</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Pub/Sub State</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Disapprovals</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]/60">
                        {stores.map((store) => (
                          <tr key={store.id} className="hover:bg-[#141C2B]/50 transition-colors">
                            {/* GMC ID */}
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#FDF4D2]">
                              {store.gmc_id}
                            </td>

                            {/* Parent Tenant */}
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-[#FDF4D2] text-xs">{store.tenant_email}</div>
                              <div className="text-[#64748B] text-[10px] font-mono">Tenant ID #{store.tenant_id}</div>
                            </td>

                            {/* Account Type */}
                            <td className="px-4 py-3.5">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium border border-[#1E293B] bg-[#141C2B] text-[#CBD5E1]">
                                {store.account_type}
                              </span>
                              {store.status === 'orphaned' && (
                                <div className="text-[10px] text-[#FF788D] mt-1 font-semibold">Orphan Feed</div>
                              )}
                            </td>

                            {/* URL */}
                            <td className="px-4 py-3.5">
                              <a
                                href={`https://${store.store_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#FDF4D2] font-medium hover:text-[#FF788D] flex items-center gap-1.5 transition-colors"
                              >
                                <span>{store.store_url}</span>
                                <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                              </a>
                            </td>

                            {/* Topic */}
                            <td className="px-4 py-3.5">
                              <div className="text-xs text-[#94A3B8] font-mono truncate max-w-[200px]" title={store.pubsub_topic}>
                                {store.pubsub_topic}
                              </div>
                              <div className="text-[10px] text-[#10B981] font-medium mt-0.5">
                                Last push: {new Date(store.last_message_at).toLocaleTimeString()}
                              </div>
                            </td>

                            {/* Disapprovals */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                                    store.open_disapprovals > 0
                                      ? 'bg-[#FF788D]/10 text-[#FF788D] border-[#FF788D]/30'
                                      : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                                  }`}
                                >
                                  {store.open_disapprovals} open
                                </span>
                                <span className="text-[#94A3B8] text-xs">
                                  ({store.total_caught} caught)
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleStoreSync(store.id)}
                                className="px-2.5 py-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#10B981] text-[#FDF4D2] font-semibold rounded-md text-xs transition-all active:translate-y-[0.5px] shadow-sm flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3 h-3 text-[#10B981]" />
                                <span>Trigger Full Sync</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {stores.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-[#94A3B8]">
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
            {activeTab === 'pipeline' && tabLoading && <PipelineDlqTabSkeleton />}
            {activeTab === 'pipeline' && !tabLoading && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Live Ingestion Stream */}
                  <div className="lg:col-span-2 bg-[#0F1522] border border-[#1E293B] rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#10B981]" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FDF4D2]">Live Pub/Sub Ingestion Terminal</h3>
                      </div>
                      <span className="text-xs text-[#10B981] font-mono font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span>Topic Stream Online</span>
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      <div className="p-3 rounded-lg bg-[#070A12] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">200 OK</span>
                          <span className="text-[#FDF4D2] font-mono break-all">item_disapproved: missing_required_attribute [gtin]</span>
                        </div>
                        <span className="text-[#94A3B8] text-[11px] shrink-0 font-mono">104928192 | 14ms</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#070A12] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E293B] text-[#CBD5E1]">SKIPPED</span>
                          <span className="text-[#94A3B8] font-mono break-all">item_status_unchanged: product_id: sku_49810</span>
                        </div>
                        <span className="text-[#94A3B8] text-[11px] shrink-0 font-mono">294018241 | 4ms</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#070A12] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">200 OK</span>
                          <span className="text-[#FDF4D2] font-mono break-all">item_disapproved: pricing_mismatch [price]</span>
                        </div>
                        <span className="text-[#94A3B8] text-[11px] shrink-0 font-mono">994817263 | 18ms</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#070A12] border border-[#FF788D]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF788D]/15 text-[#FF788D] border border-[#FF788D]/30">DLQ DROP</span>
                          <span className="text-[#FF788D] font-mono break-all">UNSUPPORTED_ISSUE_CODE: unexpected payload schema</span>
                        </div>
                        <span className="text-[#FF788D] text-[11px] shrink-0 font-mono">msg_gcp_9901 | DLQ</span>
                      </div>
                    </div>
                  </div>

                  {/* Latency Breakdown Console */}
                  <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FDF4D2]">Pipeline Latency Percentiles</h3>
                        <span className="text-[11px] text-[#94A3B8] font-medium">Last 24h</span>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#CBD5E1] font-medium">50th Percentile (Median)</span>
                            <span className="text-[#FDF4D2] font-mono font-bold">184 ms</span>
                          </div>
                          <div className="w-full bg-[#0a0b1dff] h-1.5 rounded-full overflow-hidden border border-[#1E293B]">
                            <div className="bg-[#10B981] h-full" style={{ width: '42%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#CBD5E1] font-medium">95th Percentile Latency</span>
                            <span className="text-[#CBD5E1] font-mono font-bold">240 ms</span>
                          </div>
                          <div className="w-full bg-[#0a0b1dff] h-1.5 rounded-full overflow-hidden border border-[#1E293B]">
                            <div className="bg-[#94A3B8] h-full" style={{ width: '58%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#CBD5E1] font-medium">99th Percentile Latency</span>
                            <span className="text-[#CBD5E1] font-mono font-bold">310 ms</span>
                          </div>
                          <div className="w-full bg-[#0a0b1dff] h-1.5 rounded-full overflow-hidden border border-[#1E293B]">
                            <div className="bg-[#64748B] h-full" style={{ width: '74%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#0a0b1dff] border border-[#1E293B] rounded-lg text-xs text-[#94A3B8] font-medium">
                      <span className="text-[#10B981] font-semibold">SLA Guarantee: </span>
                      <span>Target is &lt; 500ms from GCP arrival to Slack alert dispatch. Current pipeline operating at 184ms average.</span>
                    </div>
                  </div>
                </div>

                {/* Dead Letter Queue (DLQ) Triage Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#FDF4D2]">Dead Letter Queue (DLQ) Triage Table</h3>
                      <p className="text-xs text-[#94A3B8]">Inspect unhandled GCP payloads, inspect raw JSON, and replay after worker patches</p>
                    </div>
                    <span className="text-xs text-[#FF788D] bg-[#FF788D]/15 border border-[#FF788D]/30 font-semibold px-2.5 py-1 rounded-md">
                      {dlqMessages.length} Unhandled DLQ Payloads
                    </span>
                  </div>

                  <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[700px]">
                        <thead className="bg-[#0c121e] text-[#64748B] border-b border-[#1E293B]">
                          <tr>
                            <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">GCP Message ID</th>
                            <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Receipt Timestamp</th>
                            <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Merchant ID</th>
                            <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Failure Reason</th>
                            <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Raw Payload</th>
                            <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px] text-right">DLQ Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]/60">
                          {dlqMessages.map((msg) => (
                            <React.Fragment key={msg.id}>
                              <tr className="hover:bg-[#141C2B]/60 transition-colors">
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#FDF4D2]">
                                  {msg.message_id}
                                </td>

                                <td className="px-4 py-3.5 text-[#94A3B8] text-xs font-medium whitespace-nowrap">
                                  {new Date(msg.created_at).toLocaleTimeString()}
                                </td>

                                <td className="px-4 py-3.5 font-mono text-xs text-[#CBD5E1]">
                                  {msg.merchant_id}
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#FF788D]/10 text-[#FF788D] border border-[#FF788D]/30 font-semibold font-mono">
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
                                      className="px-2.5 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-[#10B981] text-[#10B981] font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                      <span>Replay</span>
                                    </button>

                                    <button
                                      onClick={() => handleDLQAction(msg.id, 'purge')}
                                      className="px-2.5 py-1 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D] text-[#FF788D] font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Purge</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {expandedPayloadId === msg.id && (
                                <tr className="bg-[#070A12]">
                                  <td colSpan={6} className="px-4 py-4 border-t border-[#1E293B]">
                                    <div className="text-xs text-[#CBD5E1] mb-2 font-bold flex items-center gap-2">
                                      <Terminal className="w-4 h-4 text-[#FF788D]" />
                                      <span>GCP Pub/Sub Ingestion Raw Payload Details:</span>
                                    </div>
                                    <pre className="p-4 bg-[#0a0b1dff] border border-[#1E293B] rounded-md text-xs font-mono text-[#CBD5E1] overflow-x-auto max-h-56 leading-relaxed">
                                      {JSON.stringify(msg.payload, null, 2)}
                                    </pre>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                          {dlqMessages.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-12 text-center text-[#94A3B8]">
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
            {activeTab === 'dispatches' && tabLoading && <DispatchesTabSkeleton />}
            {activeTab === 'dispatches' && !tabLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#FDF4D2]">Slack & Outbound Dispatch Logs</h3>
                    <p className="text-xs text-[#94A3B8]">Verify that product disapproval incidents are delivered to client Slack channels</p>
                  </div>
                  <span className="text-xs text-[#CBD5E1] bg-[#0F1522] border border-[#1E293B] px-3 py-1 rounded-md font-semibold">
                    {dispatchLogs.length} Recent Dispatches
                  </span>
                </div>

                <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[760px]">
                      <thead className="bg-[#0c121e] text-[#64748B] border-b border-[#1E293B]">
                        <tr>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Dispatch ID & Time</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Tenant & Store</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Destination Channel</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Delivery Status</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px]">Payload Preview</th>
                          <th className="px-4 py-3.5 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]/60">
                        {dispatchLogs.map((log) => (
                          <React.Fragment key={log.id}>
                            <tr className="hover:bg-[#141C2B]/50 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="font-mono text-xs font-bold text-[#FDF4D2]">{log.dispatch_id}</div>
                                <div className="text-[11px] text-[#94A3B8] font-medium">{new Date(log.created_at).toLocaleTimeString()}</div>
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="font-semibold text-[#FDF4D2] text-xs">{log.tenant_email}</div>
                                <div className="text-[#94A3B8] text-xs">{log.store_url}</div>
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="font-mono text-xs text-[#CBD5E1] truncate max-w-[220px]" title={log.destination}>
                                  {log.destination}
                                </div>
                              </td>

                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                                    log.status_label === 'Delivered'
                                      ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                                      : log.status_label === 'Rate Limited'
                                      ? 'bg-[#141C2B] text-[#CBD5E1] border-[#1E293B]'
                                      : 'bg-[#FF788D]/10 text-[#FF788D] border-[#FF788D]/30'
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
                                    className="px-2.5 py-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#10B981] text-[#FDF4D2] font-semibold rounded-md text-xs transition-all active:translate-y-[0.5px] shadow-sm"
                                  >
                                    Retry
                                  </button>

                                  <button
                                    onClick={() => handleDisableWebhook(log.destination)}
                                    className="px-2.5 py-1.5 bg-[#141C2B] border border-[#1E293B] hover:border-[#FF788D] text-[#CBD5E1] hover:text-[#FF788D] font-semibold rounded-md text-xs transition-all active:translate-y-[0.5px] shadow-sm"
                                  >
                                    Silence
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {expandedDispatchId === log.id && (
                              <tr className="bg-[#070A12]">
                                <td colSpan={6} className="px-4 py-4 border-t border-[#1E293B]">
                                  <div className="text-xs text-[#CBD5E1] mb-2 font-bold flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-[#10B981]" />
                                    <span>Slack Block Kit JSON Dispatched to Customer:</span>
                                  </div>
                                  <pre className="p-4 bg-[#0a0b1dff] border border-[#1E293B] rounded-lg text-xs font-mono text-[#CBD5E1] overflow-x-auto max-h-56 leading-relaxed">
                                    {JSON.stringify(log.payload, null, 2)}
                                  </pre>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                        {dispatchLogs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-[#94A3B8]">
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
            {activeTab === 'config' && tabLoading && <ConfigTabSkeleton />}
            {activeTab === 'config' && !tabLoading && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl p-5 sm:p-7 space-y-6 shadow-sm">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#FDF4D2]">Platform Operational Controls & Feature Flags</h3>
                    <p className="text-xs text-[#94A3B8] mt-1 font-medium">
                      Configure platform behavior globally in real-time without redeploying code.
                    </p>
                  </div>

                  <form onSubmit={handleSaveConfig} className="space-y-5">
                    {/* Maintenance Mode */}
                    <div className="flex items-center justify-between p-4 bg-[#0a0b1dff] border border-[#1E293B] rounded-xl">
                      <div className="pr-4">
                        <div className="text-xs font-semibold text-[#FDF4D2]">Maintenance Mode</div>
                        <div className="text-[11px] text-[#94A3B8] mt-0.5">
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
                        <div className="w-11 h-6 bg-[#141C2B] border border-[#1E293B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#94A3B8] peer-checked:after:bg-white after:border after:border-[#1E293B] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF788D]" />
                      </label>
                    </div>

                    {/* Registration Gate */}
                    <div className="p-4 bg-[#0a0b1dff] border border-[#1E293B] rounded-xl space-y-2">
                      <label className="block text-xs font-semibold text-[#FDF4D2]">Registration Gate</label>
                      <p className="text-[11px] text-[#94A3B8]">
                        Regulates pilot onboarding and access controls on the public landing page.
                      </p>
                      <select
                        value={config.registration_gate}
                        onChange={(e) =>
                          setConfig({ ...config, registration_gate: e.target.value as 'open' | 'invite_only' | 'closed' })
                        }
                        className="w-full bg-[#0F1522] border border-[#1E293B] rounded-lg p-2.5 text-xs text-[#FDF4D2] font-medium focus:outline-none focus:border-[#FF788D] transition-colors cursor-pointer"
                      >
                        <option value="open">Open Sign-ups (Standard Pilot Intake)</option>
                        <option value="invite_only">Invite-only Code Gate (Manual Approval Required)</option>
                        <option value="closed">Closed Registration (Waitlist Paused)</option>
                      </select>
                    </div>

                    {/* Global Rate Limiting */}
                    <div className="p-4 bg-[#0a0b1dff] border border-[#1E293B] rounded-xl space-y-2">
                      <label className="block text-xs font-semibold text-[#FDF4D2]">Global Pub/Sub Ingestion Rate Limiter</label>
                      <p className="text-[11px] text-[#94A3B8]">
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
                          className="w-48 bg-[#0F1522] border border-[#1E293B] rounded-lg p-2.5 text-xs text-[#FDF4D2] font-semibold focus:outline-none focus:border-[#FF788D] transition-colors"
                        />
                        <span className="text-xs text-[#94A3B8] font-semibold">req / minute</span>
                      </div>
                    </div>

                    {/* Global Alert Banner */}
                    <div className="p-4 bg-[#0a0b1dff] border border-[#1E293B] rounded-xl space-y-2">
                      <label className="block text-xs font-semibold text-[#FDF4D2]">Global Customer Dashboard Alert Banner</label>
                      <p className="text-[11px] text-[#94A3B8]">
                        Broadcasts a live banner across all authenticated customer dashboards. Leave blank to disable.
                      </p>
                      <textarea
                        rows={3}
                        value={config.banner_text || ''}
                        onChange={(e) => setConfig({ ...config, banner_text: e.target.value })}
                        placeholder="e.g., Routine Google Merchant API maintenance scheduled on Sunday 02:00 UTC. Pub/Sub queue remains active."
                        className="w-full bg-[#0F1522] border border-[#1E293B] rounded-lg p-2.5 text-xs text-[#FDF4D2] placeholder-[#64748B] font-medium focus:outline-none focus:border-[#FF788D] transition-colors"
                      />
                      {config.banner_text && (
                        <div className="mt-2.5 p-3 bg-[#141C2B] border border-[#1E293B] rounded-lg text-xs text-[#CBD5E1]">
                          <span className="font-semibold text-[#FDF4D2]">Live Banner Preview: </span>
                          <span>{config.banner_text}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={savingConfig}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#FF788D] hover:bg-[#FF8FA2] text-[#0a0b1dff] font-bold text-xs rounded-lg transition-all active:translate-y-[0.5px] shadow-sm disabled:opacity-50"
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
