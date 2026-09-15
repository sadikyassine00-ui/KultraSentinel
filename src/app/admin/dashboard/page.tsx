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
  ShieldCheck,
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
import TenantTriageCenter from '@/components/dashboard/TenantTriageCenter';

type TabType = 'triage' | 'tenants' | 'stores' | 'pipeline' | 'dispatches' | 'config';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ email: string; name?: string; role: string; isAdmin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('triage');
  const [justConnected, setJustConnected] = useState(false);
  const [urlStoreId, setUrlStoreId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize sidebar collapsed state and URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kultra_sidebar_collapsed');
      if (saved === 'true') {
        setSidebarCollapsed(true);
      }

      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      const isJustConnected = params.get('just_connected') === 'true';
      const sId = params.get('store_id');
      if (isJustConnected) setJustConnected(true);
      if (sId) setUrlStoreId(sId);
      if (tabParam && ['triage', 'tenants', 'stores', 'pipeline', 'dispatches', 'config'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else if (isJustConnected) {
        setActiveTab('triage');
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
      if (activeTab === 'triage') {
        setTabLoading(false);
        setIsRefreshing(false);
        return;
      }

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
  const handleStoreSync = async (storeId: number | string) => {
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
      group: 'Catalog monitoring',
      items: [
        { id: 'triage' as TabType, label: 'Catalog shield triage', icon: ShieldCheck, badge: null, badgeClass: '' },
      ],
    },
    {
      group: 'Platform intelligence',
      items: [
        { id: 'tenants' as TabType, label: 'Tenant management', icon: Users, badge: tenants.length > 0 ? tenants.length : null, badgeClass: 'tag-ghost' },
        { id: 'stores' as TabType, label: 'Global store registry', icon: StoreIcon, badge: stores.length > 0 ? stores.length : null, badgeClass: 'tag-ghost' },
      ],
    },
    {
      group: 'Pipeline & ingestion',
      items: [
        {
          id: 'pipeline' as TabType,
          label: 'Pub/Sub pipeline & DLQ',
          icon: Radio,
          badge: telemetry.dlqCount > 0 ? `${telemetry.dlqCount} DLQ` : null,
          badgeClass: 'tag-danger',
        },
        { id: 'dispatches' as TabType, label: 'Outbound dispatch logs', icon: Send, badge: dispatchLogs.length > 0 ? dispatchLogs.length : null, badgeClass: 'tag-ghost' },
      ],
    },
    {
      group: 'System controls',
      items: [
        { id: 'config' as TabType, label: 'System configuration', icon: Sliders, badge: null, badgeClass: '' },
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
    <div className="flex-1 w-full bg-[#0a0b0d] text-[#f4f1ea] font-sans antialiased selection:bg-[#7a5a26] selection:text-[#f4f1ea] flex flex-col lg:flex-row">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden h-12 border-b border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-4 flex items-center justify-between sticky top-[60px] z-30">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] border border-[rgba(255,255,255,0.14)] bg-transparent text-[#f4f1ea] hover:bg-[#131418] text-xs font-semibold transition-colors"
          aria-label="Open dashboard navigation"
        >
          <Menu className="w-4 h-4 text-[#f2a93b]" />
          <span>{navGroups.flatMap((g) => g.items).find((n) => n.id === activeTab)?.label}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-[0.02em] text-[#f2a93b] bg-[rgba(242,169,59,0.06)] px-2.5 py-1 rounded-[100px] border border-[#7a5a26]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" aria-hidden="true" />
          <span>Pub/Sub QoS 1 active</span>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Refined Sidebar Navigation (Collapsible Rail per GEMINI.md §16) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0e0f11] border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between transition-all duration-200 ease-in-out lg:static lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto shrink-0 ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
      >
        <div className="py-3 space-y-3">
          {/* Top Bar: Mobile Close or Desktop Collapse Toggle */}
          <div className="flex items-center justify-between px-3 pb-3 border-b border-[rgba(255,255,255,0.08)]">
            {/* Mobile View: Title + Close Button */}
            <div className="lg:hidden flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[3px] bg-[#131418] border border-[rgba(255,255,255,0.14)] flex items-center justify-center text-[#f4f1ea] shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#f2a93b]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#f4f1ea] tracking-tight">
                    Mission Control
                  </div>
                  <div className="text-[10.5px] font-mono text-[#6b7078] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" />
                    <span>Production console</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-[3px] border border-[rgba(255,255,255,0.14)] bg-transparent text-[#b9b3a5] hover:text-[#f4f1ea] transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop View: Expanded Mode */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {!sidebarCollapsed ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[3px] bg-[#131418] border border-[rgba(255,255,255,0.14)] flex items-center justify-center text-[#f4f1ea] shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#f2a93b]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#f4f1ea] tracking-tight truncate">
                        Kultra Sentinel
                      </div>
                      <div className="text-[10.5px] font-mono text-[#6b7078] flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" />
                        <span>Fleet console</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    title="Collapse sidebar"
                    className="p-1.5 rounded-[3px] border border-[rgba(255,255,255,0.08)] bg-transparent text-[#6b7078] hover:text-[#f4f1ea] hover:border-[rgba(255,255,255,0.14)] transition-colors"
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
                    className="p-1.5 rounded-[3px] border border-[rgba(255,255,255,0.08)] bg-transparent text-[#6b7078] hover:text-[#f4f1ea] hover:border-[rgba(255,255,255,0.14)] transition-colors"
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
              <div key={grp.group} className="space-y-0.5">
                <div className="text-[10.5px] font-mono text-[#45484f] px-3 py-1">
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
                      className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-colors relative text-left ${
                        isActive
                          ? 'border-l-2 border-[#f2a93b] bg-[rgba(242,169,59,0.06)] text-[#f4f1ea]'
                          : 'border-l-2 border-transparent text-[#6b7078] hover:bg-[#131418] hover:text-[#f4f1ea]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#f2a93b]' : 'text-[#6b7078]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span className={`px-2 py-0.5 rounded-[100px] text-[10.5px] font-mono shrink-0 ${
                          item.badgeClass === 'tag-danger'
                            ? 'border border-[rgba(214,69,69,0.4)] text-[#d64545] bg-[rgba(214,69,69,0.08)] font-medium'
                            : 'border border-[#3a3d43] text-[#6b7078] bg-transparent'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Navigation Items (Collapsed Rail Mode per GEMINI.md §16) */}
          <nav
            className={`space-y-2 hidden ${sidebarCollapsed ? 'lg:block' : 'lg:hidden'}`}
            aria-label="Sidebar Navigation (Collapsed)"
          >
            {navGroups.map((grp, gIdx) => (
              <div key={grp.group} className="space-y-1">
                {gIdx > 0 && <div className="h-px bg-[rgba(255,255,255,0.08)] mx-2 my-2" />}
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
                        className={`relative w-10 h-10 rounded-[3px] flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[rgba(242,169,59,0.06)] text-[#f2a93b] border-l-2 border-[#f2a93b]'
                            : 'text-[#6b7078] hover:bg-[#131418] hover:text-[#f4f1ea]'
                        }`}
                        aria-label={item.label}
                      >
                        <Icon className="w-4 h-4" />
                        {item.badge !== null && (
                          <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                            item.badgeClass === 'tag-danger' ? 'bg-[#d64545]' : 'bg-[#6b7078]'
                          }`} />
                        )}
                      </button>

                      {/* Floating Tooltip with 400ms delay and soft shadow */}
                      <div className="hidden lg:group-hover:flex absolute left-full ml-2 px-2.5 py-1 rounded-[3px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] text-xs text-[#f4f1ea] whitespace-nowrap z-50 shadow-[0_16px_40px_rgba(0,0,0,0.5)] items-center gap-2 pointer-events-none top-1/2 -translate-y-1/2 font-sans font-medium">
                        <span>{item.label}</span>
                        {item.badge !== null && (
                          <span className={`px-1.5 py-0.2 rounded-[100px] text-[10px] font-mono ${
                            item.badgeClass === 'tag-danger'
                              ? 'border border-[rgba(214,69,69,0.4)] text-[#d64545] bg-[rgba(214,69,69,0.08)]'
                              : 'border border-[#3a3d43] text-[#6b7078]'
                          }`}>
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
        <div className={`p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#0e0f11] ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
          {/* Fleet Telemetry Heartbeat */}
          <div className="px-2.5 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] mb-3 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-[#b9b3a5] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" />
                <span>QoS 1 Ingestion</span>
              </div>
              <span className="font-mono text-[#f2a93b] font-medium text-[11px]">{telemetry.globalIngestionRate} m/m</span>
            </div>
            <div className="flex items-center justify-between text-[10.5px] font-mono text-[#6b7078]">
              <span>Pipeline SLA</span>
              <span className="text-[#b9b3a5]">{telemetry.averageLatencyMs} ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#131418] border border-[rgba(255,255,255,0.14)] flex items-center justify-center text-[11px] font-mono font-medium text-[#f4f1ea] shrink-0">
                YS
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] text-[#f4f1ea] font-medium truncate" title={adminUser?.email}>
                  {adminUser?.email || 'Platform Owner'}
                </div>
                <div className="text-[10.5px] font-mono text-[#6b7078] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" />
                  <span>Platform Owner</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out of console"
              className="p-1.5 rounded-[3px] border border-[rgba(255,255,255,0.08)] bg-transparent text-[#6b7078] hover:text-[#d64545] hover:bg-[rgba(214,69,69,0.08)] transition-colors shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Footer (Collapsed Rail Mode) */}
        <div className={`p-2.5 border-t border-[rgba(255,255,255,0.08)] bg-[#0e0f11] flex-col items-center gap-2.5 hidden ${sidebarCollapsed ? 'lg:flex' : 'lg:hidden'}`}>
          <div
            className="w-7 h-7 rounded-full bg-[#131418] border border-[rgba(255,255,255,0.14)] flex items-center justify-center text-[11px] font-mono font-medium text-[#f4f1ea]"
            title={`${adminUser?.email} (Platform Owner)`}
          >
            YS
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of console"
            className="p-1.5 rounded-[3px] border border-[rgba(255,255,255,0.08)] bg-transparent text-[#6b7078] hover:text-[#d64545] hover:bg-[rgba(214,69,69,0.08)] transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Mission Control Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#0a0b0d]">

        {/* Impersonation Banner */}
        {impersonatingTenant && (
          <div className="bg-[#131418] border-b border-[#7a5a26] px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[100px] border border-[#7a5a26] bg-[rgba(242,169,59,0.06)] text-[#f2a93b] font-mono text-[11px] font-medium shrink-0">
                <Eye className="w-3.5 h-3.5" />
                Impersonation active
              </span>
              <span className="text-[#b9b3a5]">
                Viewing live tenant dashboard for <strong className="text-[#f4f1ea]">{impersonatingTenant.email}</strong> ({impersonatingTenant.company_name})
              </span>
            </div>
            <button
              onClick={() => setImpersonatingTenant(null)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#f4f1ea] font-medium rounded-[3px] text-xs transition-colors self-start sm:self-auto"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Exit impersonation</span>
            </button>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Feedback Notification Banner */}
          {feedback && (
            <div
              className={`px-4 py-3 rounded-[3px] border text-xs flex items-center justify-between font-medium transition-colors ${
                feedback.type === 'success'
                  ? 'bg-[rgba(242,169,59,0.06)] border-[#7a5a26] text-[#f2a93b]'
                  : 'bg-[rgba(214,69,69,0.08)] border-[rgba(214,69,69,0.4)] text-[#d64545]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedback.type === 'success' ? <Check className="w-4 h-4 text-[#f2a93b]" /> : <AlertTriangle className="w-4 h-4 text-[#d64545]" />}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-[11px] font-mono opacity-80 hover:opacity-100 uppercase tracking-wider"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === 'triage' ? (
            <TenantTriageCenter initialStoreId={urlStoreId} justConnected={justConnected} />
          ) : (
            <>
              {/* SECTION 1: Top-Level Platform Telemetry (Global KPIs per GEMINI.md §16) */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[rgba(255,255,255,0.08)] gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#45484f] mb-1 flex-wrap">
                      <span>Platform intelligence</span>
                      <span>/</span>
                      <span className="text-[#b9b3a5]">Super admin console</span>
                      <span>/</span>
                      <span className="text-[#f2a93b] px-2 py-0.5 rounded-[100px] bg-[rgba(242,169,59,0.06)] border border-[#7a5a26]">Production fleet</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-semibold font-display text-[#f4f1ea] tracking-tight">
                        Platform Telemetry & Fleet Health
                      </h1>
                      <span className="text-[10.5px] font-mono text-[#6b7078] px-2 py-0.5 rounded-[3px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)]">
                        GCP: us-central1
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6b7078] mt-1">
                      Real-time commercial volume and Google Cloud Pub/Sub QoS 1 streaming metrics
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[#f2a93b] bg-[rgba(242,169,59,0.06)] px-3 py-1.5 rounded-[100px] border border-[#7a5a26]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" />
                      <span>Pub/Sub active ({telemetry.globalIngestionRate} msg/min)</span>
                    </div>

                    <button
                      onClick={() => loadTabData(true)}
                      disabled={isRefreshing}
                      className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs disabled:opacity-50"
                      title="Refresh telemetry"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#f2a93b]' : ''}`} />
                      <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>

                {/* Tier 1: Commercial Volume Metrics (4 Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: MRR */}
                  <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-medium text-[#6b7078]">Monthly recurring revenue</span>
                      <div className="p-1.5 rounded-[3px] bg-[#131418] text-[#6b7078] border border-[rgba(255,255,255,0.08)]">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#f4f1ea] tracking-tight">
                      ${telemetry.mrr.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#6b7078] flex items-center justify-between pt-1 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" />
                        <span>Stripe recurring</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#f2a93b] font-medium">+14.2% MoM</span>
                    </div>
                  </div>

                  {/* Card 2: Active Subs vs Trials */}
                  <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-medium text-[#6b7078]">Active accounts</span>
                      <div className="p-1.5 rounded-[3px] bg-[#131418] text-[#6b7078] border border-[rgba(255,255,255,0.08)]">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#f4f1ea] tracking-tight flex items-baseline gap-1.5 flex-wrap">
                      <span>{telemetry.activeSubscriptions}</span>
                      <span className="text-xs font-sans text-[#b9b3a5]">paid</span>
                      <span className="text-xs text-[#45484f]">/</span>
                      <span className="text-xl font-mono text-[#b9b3a5]">{telemetry.activeTrials}</span>
                      <span className="text-xs font-sans text-[#6b7078]">trial</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full bg-[#131418] h-1.5 rounded-[2px] overflow-hidden flex border border-[rgba(255,255,255,0.08)]">
                        <div
                          className="bg-[#f2a93b] h-full"
                          style={{
                            width: `${Math.round(
                              (telemetry.activeSubscriptions /
                                Math.max(1, telemetry.activeSubscriptions + telemetry.activeTrials)) *
                                100
                            )}%`,
                          }}
                        />
                        <div
                          className="bg-[#6b7078] h-full"
                          style={{
                            width: `${Math.round(
                              (telemetry.activeTrials /
                                Math.max(1, telemetry.activeSubscriptions + telemetry.activeTrials)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="text-[11px] font-mono text-[#6b7078]">
                        {telemetry.activeSubscriptions + telemetry.activeTrials} total contracts
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Monitored Stores */}
                  <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-medium text-[#6b7078]">Monitored stores</span>
                      <div className="p-1.5 rounded-[3px] bg-[#131418] text-[#6b7078] border border-[rgba(255,255,255,0.08)]">
                        <StoreIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#f4f1ea] tracking-tight">
                      {telemetry.totalMonitoredStores}
                    </div>
                    <div className="text-xs text-[#6b7078] flex items-center justify-between pt-1">
                      <span>GMC Registry</span>
                      <span className="text-[11px] font-mono text-[#b9b3a5]">Standalone & MCA</span>
                    </div>
                  </div>

                  {/* Card 4: Total SKUs Tracked */}
                  <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-medium text-[#6b7078]">Observed SKUs</span>
                      <div className="p-1.5 rounded-[3px] bg-[#131418] text-[#6b7078] border border-[rgba(255,255,255,0.08)]">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-semibold font-mono text-[#f4f1ea] tracking-tight">
                      {telemetry.totalSkusTracked.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#6b7078] flex items-center justify-between pt-1">
                      <span>Pub/Sub monitoring</span>
                      <span className="text-[11px] font-mono text-[#f2a93b]">100% coverage</span>
                    </div>
                  </div>
                </div>

                {/* Tier 2: Real-Time Pipeline Health Console (Unified 4-Metric Surface) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[rgba(255,255,255,0.08)] rounded-[4px] overflow-hidden bg-[#0e0f11] divide-y sm:divide-y-0 sm:divide-x divide-[rgba(255,255,255,0.08)]">
                  {/* Metric 1: Ingestion */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#45484f]">Ingestion rate</span>
                      <Radio className="w-3.5 h-3.5 text-[#f2a93b]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold font-mono text-[#f4f1ea] tracking-tight flex items-baseline gap-1.5">
                      <span>{telemetry.globalIngestionRate}</span>
                      <span className="text-xs font-mono text-[#f2a93b]">msg/min</span>
                    </div>
                    <div className="flex items-end gap-1 h-3 pt-0.5">
                      <span className="w-1.5 h-1.5 bg-[#f2a93b]/40 rounded-[1px]" />
                      <span className="w-1.5 h-2.5 bg-[#f2a93b]/60 rounded-[1px]" />
                      <span className="w-1.5 h-2 bg-[#f2a93b]/50 rounded-[1px]" />
                      <span className="w-1.5 h-3 bg-[#f2a93b]/75 rounded-[1px]" />
                      <span className="w-1.5 h-2.5 bg-[#f2a93b]/65 rounded-[1px]" />
                      <span className="w-1.5 h-3 bg-[#f2a93b] rounded-[1px]" />
                    </div>
                    <p className="text-[11px] font-mono text-[#6b7078]">Pub/Sub QoS 1 streaming</p>
                  </div>

                  {/* Metric 2: Latency */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#45484f]">Pipeline latency</span>
                      <Zap className="w-3.5 h-3.5 text-[#6b7078]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold font-mono text-[#f4f1ea] tracking-tight flex items-baseline gap-1.5">
                      <span>{telemetry.averageLatencyMs}</span>
                      <span className="text-xs font-mono text-[#6b7078]">ms avg</span>
                    </div>
                    <div className="w-full bg-[#131418] h-1.5 rounded-[2px] overflow-hidden border border-[rgba(255,255,255,0.08)]">
                      <div
                        className="bg-[#f2a93b] h-full"
                        style={{
                          width: `${Math.min(100, Math.round((telemetry.averageLatencyMs / 500) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-mono text-[#6b7078]">SLA target &lt; 500ms</p>
                  </div>

                  {/* Metric 3: Dead Letter Queue */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#45484f]">Dead letter queue</span>
                      <ShieldAlert className={`w-3.5 h-3.5 ${telemetry.dlqCount > 0 ? 'text-[#d64545]' : 'text-[#f2a93b]'}`} />
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight flex items-baseline gap-2">
                      <span className={telemetry.dlqCount > 0 ? 'text-[#d64545]' : 'text-[#f4f1ea]'}>
                        {telemetry.dlqCount}
                      </span>
                      <span className={`text-[10.5px] font-mono px-2 py-0.5 rounded-[100px] border ${
                        telemetry.dlqCount > 0
                          ? 'bg-[rgba(214,69,69,0.08)] text-[#d64545] border-[rgba(214,69,69,0.4)]'
                          : 'bg-[rgba(242,169,59,0.06)] text-[#f2a93b] border-[#7a5a26]'
                      }`}>
                        {telemetry.dlqCount > 0 ? 'Action required' : 'Healthy'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#6b7078]">
                      {telemetry.dlqCount > 0 ? 'Dropped payloads awaiting triage' : 'Zero dropped payloads'}
                    </p>
                  </div>

                  {/* Metric 4: Webhook Failure Rate */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#45484f]">Dispatch success</span>
                      <Send className="w-3.5 h-3.5 text-[#6b7078]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold font-mono text-[#f4f1ea] tracking-tight flex items-baseline gap-1.5">
                      <span>{((1 - telemetry.webhookFailureRate) * 100).toFixed(1)}%</span>
                      <span className="text-xs font-mono text-[#6b7078]">deliverability</span>
                    </div>
                    <p className="text-[11px] font-mono text-[#6b7078] pt-1">
                      {(telemetry.webhookFailureRate * 100).toFixed(2)}% outbound 4xx/5xx errors
                    </p>
                  </div>
                </div>
              </section>

              {/* SECTION 2: Active Management View */}
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold font-display text-[#f4f1ea] tracking-tight">
                      {navGroups.flatMap((g) => g.items).find((n) => n.id === activeTab)?.label}
                    </h2>
                    <p className="text-xs text-[#6b7078] mt-0.5">
                      Operational control surface for platform owner administration
                    </p>
                  </div>
                </div>

                {/* TAB 1: Tenant Management */}
                {activeTab === 'tenants' && tabLoading && <TenantsTabSkeleton />}
                {activeTab === 'tenants' && !tabLoading && (
                  <div className="space-y-4">
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] p-3 rounded-[4px]">
                      <div className="relative w-full sm:w-80 md:w-96">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#45484f]" />
                        <input
                          type="text"
                          placeholder="Search User ID, company, email..."
                          value={tenantSearch}
                          onChange={(e) => setTenantSearch(e.target.value)}
                          className="w-full pl-9 pr-12 py-2 bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] rounded-[3px] text-xs text-[#f4f1ea] placeholder-[#45484f] focus:outline-none focus:border-[#f2a93b] focus:ring-1 focus:ring-[#f2a93b] font-sans transition-colors"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#45484f] px-1.5 py-0.5 rounded-[3px] bg-[#131418] border border-[rgba(255,255,255,0.08)] pointer-events-none">
                          ⌘K
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                        <select
                          value={tenantPlanFilter}
                          onChange={(e) => setTenantPlanFilter(e.target.value)}
                          className="flex-1 sm:flex-initial bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] rounded-[3px] text-xs text-[#f4f1ea] px-3 py-2 focus:outline-none focus:border-[#f2a93b] font-sans transition-colors cursor-pointer"
                        >
                          <option value="all">All plans</option>
                          <option value="Trial">Trial</option>
                          <option value="Agency Pilot">Agency Pilot</option>
                          <option value="Active Pro">Active Pro</option>
                          <option value="Delinquent">Delinquent</option>
                          <option value="Canceled">Canceled</option>
                        </select>

                        <select
                          value={tenantStatusFilter}
                          onChange={(e) => setTenantStatusFilter(e.target.value)}
                          className="flex-1 sm:flex-initial bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] rounded-[3px] text-xs text-[#f4f1ea] px-3 py-2 focus:outline-none focus:border-[#f2a93b] font-sans transition-colors cursor-pointer"
                        >
                          <option value="all">All statuses</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>

                    {/* Tenants Table (per GEMINI.md §16) */}
                    <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[720px]">
                          <thead className="bg-[#0e0f11] text-[#45484f] border-b border-[rgba(255,255,255,0.08)] font-mono text-[11px]">
                            <tr>
                              <th className="px-4 py-3 font-normal">Tenant identity</th>
                              <th className="px-4 py-3 font-normal">Subscription tier</th>
                              <th className="px-4 py-3 font-normal">Usage footprint</th>
                              <th className="px-4 py-3 font-normal">OAuth status</th>
                              <th className="px-4 py-3 font-normal">Last active</th>
                              <th className="px-4 py-3 font-normal text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                            {tenants.map((tenant) => (
                              <tr key={tenant.id} className="hover:bg-[#131418] transition-colors">
                                {/* Tenant Identity */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-[3px] bg-[#131418] border border-[rgba(255,255,255,0.14)] text-xs font-mono font-medium text-[#f4f1ea] flex items-center justify-center shrink-0">
                                      {getInitials(tenant.company_name)}
                                    </div>
                                    <div>
                                      <div className="font-medium text-[#f4f1ea] text-xs">{tenant.company_name}</div>
                                      <div className="text-[#6b7078] text-[11px]">{tenant.email}</div>
                                      <div className="text-[#45484f] text-[10px] font-mono">{tenant.user_id}</div>
                                    </div>
                                  </div>
                                </td>

                                {/* Plan Tier */}
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-[100px] text-[11px] font-mono border ${
                                      tenant.plan_tier === 'Active Pro' || tenant.plan_tier === 'Agency Pilot'
                                        ? 'bg-[rgba(242,169,59,0.06)] text-[#f2a93b] border-[#7a5a26]'
                                        : tenant.plan_tier === 'Trial'
                                        ? 'bg-transparent text-[#b9b3a5] border-[rgba(255,255,255,0.14)]'
                                        : 'bg-[rgba(214,69,69,0.08)] text-[#d64545] border-[rgba(214,69,69,0.4)]'
                                    }`}
                                  >
                                    {tenant.plan_tier}
                                  </span>
                                  {tenant.status === 'suspended' && (
                                    <div className="text-[10px] font-mono text-[#d64545] mt-1">Suspended</div>
                                  )}
                                </td>

                                {/* Usage Footprint */}
                                <td className="px-4 py-3">
                                  <div className="text-[#f4f1ea] font-medium text-xs">
                                    {tenant.connected_stores} store{tenant.connected_stores > 1 ? 's' : ''}
                                  </div>
                                  <div className="text-[#6b7078] font-mono text-[11px]">
                                    {tenant.total_skus.toLocaleString()} SKUs
                                  </div>
                                  <div className="text-[#f2a93b] font-mono text-[10px]">
                                    {tenant.incidents_month} incidents caught
                                  </div>
                                </td>

                                {/* OAuth Status */}
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[100px] text-[11px] font-mono border ${
                                      tenant.oauth_status === 'Valid'
                                        ? 'bg-[rgba(242,169,59,0.06)] text-[#f2a93b] border-[#7a5a26]'
                                        : tenant.oauth_status === 'Expiring Soon'
                                        ? 'bg-transparent text-[#b9b3a5] border-[#3a3d43]'
                                        : 'bg-[rgba(214,69,69,0.08)] text-[#d64545] border-[rgba(214,69,69,0.4)]'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        tenant.oauth_status === 'Valid'
                                          ? 'bg-[#f2a93b]'
                                          : tenant.oauth_status === 'Expiring Soon'
                                          ? 'bg-[#6b7078]'
                                          : 'bg-[#d64545]'
                                      }`}
                                    />
                                    {tenant.oauth_status}
                                  </span>
                                </td>

                                {/* Last Active */}
                                <td className="px-4 py-3 text-[#6b7078] font-mono text-xs whitespace-nowrap">
                                  {new Date(tenant.last_active).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>

                                {/* Operational Actions */}
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleTenantAction(tenant.id, 'impersonate')}
                                      title="Impersonate user"
                                      className="p-1.5 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#b9b3a5] hover:text-[#f4f1ea] rounded-[3px] transition-colors"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleTenantAction(tenant.id, 'extendTrial', 'Agency Pilot')}
                                      title="Upgrade to Agency Pilot"
                                      className="p-1.5 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#b9b3a5] hover:text-[#f2a93b] rounded-[3px] transition-colors"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleTenantAction(tenant.id, 'forceReauth')}
                                      title="Force OAuth reauthorization"
                                      className="p-1.5 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#b9b3a5] hover:text-[#f4f1ea] rounded-[3px] transition-colors"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                    </button>

                                    {tenant.status === 'active' ? (
                                      <button
                                        onClick={() => handleTenantAction(tenant.id, 'suspend')}
                                        title="Suspend tenant"
                                        className="p-1.5 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[rgba(214,69,69,0.4)] text-[#6b7078] hover:text-[#d64545] rounded-[3px] transition-colors"
                                      >
                                        <Lock className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleTenantAction(tenant.id, 'unsuspend')}
                                        title="Unsuspend tenant"
                                        className="p-1.5 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#6b7078] hover:text-[#f2a93b] rounded-[3px] transition-colors"
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
                                <td colSpan={6} className="px-4 py-12 text-center text-[#6b7078]">
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
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] p-3 rounded-[4px]">
                      <div className="relative w-full sm:w-80 md:w-96">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#45484f]" />
                        <input
                          type="text"
                          placeholder="Search GMC Merchant ID, store domain, tenant..."
                          value={storeSearch}
                          onChange={(e) => setStoreSearch(e.target.value)}
                          className="w-full pl-9 pr-12 py-2 bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] rounded-[3px] text-xs text-[#f4f1ea] placeholder-[#45484f] focus:outline-none focus:border-[#f2a93b] font-sans transition-colors"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#45484f] px-1.5 py-0.5 rounded-[3px] bg-[#131418] border border-[rgba(255,255,255,0.08)] pointer-events-none">
                          ⌘K
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                        <select
                          value={storeAccountFilter}
                          onChange={(e) => setStoreAccountFilter(e.target.value)}
                          className="flex-1 sm:flex-initial bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] rounded-[3px] text-xs text-[#f4f1ea] px-3 py-2 focus:outline-none focus:border-[#f2a93b] font-sans transition-colors cursor-pointer"
                        >
                          <option value="all">All account types</option>
                          <option value="Standalone Merchant">Standalone Merchant</option>
                          <option value="MCA Child">MCA Child</option>
                        </select>

                        <button
                          onClick={handleOrphanCleanup}
                          className="px-3 py-2 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[rgba(214,69,69,0.4)] text-[#b9b3a5] hover:text-[#d64545] rounded-[3px] text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Orphan cleanup</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[760px]">
                          <thead className="bg-[#0e0f11] text-[#45484f] border-b border-[rgba(255,255,255,0.08)] font-mono text-[11px]">
                            <tr>
                              <th className="px-4 py-3 font-normal">GMC Merchant ID</th>
                              <th className="px-4 py-3 font-normal">Parent tenant</th>
                              <th className="px-4 py-3 font-normal">Account type</th>
                              <th className="px-4 py-3 font-normal">Store domain</th>
                              <th className="px-4 py-3 font-normal">Pub/Sub state</th>
                              <th className="px-4 py-3 font-normal">Disapprovals</th>
                              <th className="px-4 py-3 font-normal text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                            {stores.map((store) => (
                              <tr key={store.id} className="hover:bg-[#131418] transition-colors">
                                {/* GMC ID */}
                                <td className="px-4 py-3 font-mono text-xs font-semibold text-[#f4f1ea]">
                                  {store.gmc_id}
                                </td>

                                {/* Parent Tenant */}
                                <td className="px-4 py-3">
                                  <div className="font-medium text-[#f4f1ea] text-xs">{store.tenant_email}</div>
                                  <div className="text-[#45484f] text-[10px] font-mono">Tenant #{store.tenant_id}</div>
                                </td>

                                {/* Account Type */}
                                <td className="px-4 py-3">
                                  <span className="inline-block px-2 py-0.5 rounded-[100px] text-[11px] font-mono border border-[rgba(255,255,255,0.08)] bg-[#131418] text-[#b9b3a5]">
                                    {store.account_type}
                                  </span>
                                  {store.status === 'orphaned' && (
                                    <div className="text-[10px] font-mono text-[#d64545] mt-1">Orphan feed</div>
                                  )}
                                </td>

                                {/* URL */}
                                <td className="px-4 py-3">
                                  <a
                                    href={`https://${store.store_url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#b9b3a5] hover:text-[#f4f1ea] flex items-center gap-1.5 transition-colors underline-offset-2 hover:underline"
                                  >
                                    <span>{store.store_url}</span>
                                    <ExternalLink className="w-3 h-3 text-[#6b7078]" />
                                  </a>
                                </td>

                                {/* Topic */}
                                <td className="px-4 py-3">
                                  <div className="text-xs text-[#6b7078] font-mono truncate max-w-[200px]" title={store.pubsub_topic}>
                                    {store.pubsub_topic}
                                  </div>
                                  <div className="text-[10px] font-mono text-[#f2a93b] mt-0.5">
                                    Last push: {new Date(store.last_message_at).toLocaleTimeString()}
                                  </div>
                                </td>

                                {/* Disapprovals */}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-[100px] text-[11px] font-mono border ${
                                        store.open_disapprovals > 0
                                          ? 'bg-[rgba(214,69,69,0.08)] text-[#d64545] border-[rgba(214,69,69,0.4)]'
                                          : 'bg-[rgba(242,169,59,0.06)] text-[#f2a93b] border-[#7a5a26]'
                                      }`}
                                    >
                                      {store.open_disapprovals} open
                                    </span>
                                    <span className="text-[#6b7078] font-mono text-xs">
                                      ({store.total_caught} caught)
                                    </span>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => handleStoreSync(store.id)}
                                    className="px-2.5 py-1.5 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#f4f1ea] font-medium rounded-[3px] text-xs transition-colors flex items-center gap-1.5 ml-auto"
                                  >
                                    <RefreshCw className="w-3 h-3 text-[#f2a93b]" />
                                    <span>Trigger sync</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {stores.length === 0 && (
                              <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-[#6b7078]">
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
                      <div className="lg:col-span-2 bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-[#f2a93b]" />
                            <h3 className="text-xs font-mono text-[#f4f1ea]">Live Pub/Sub Ingestion Terminal</h3>
                          </div>
                          <span className="text-xs text-[#f2a93b] font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" />
                            <span>Topic stream online</span>
                          </span>
                        </div>

                        <div className="space-y-2 font-mono text-xs">
                          <div className="p-2.5 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2 py-0.5 rounded-[100px] text-[10.5px] font-mono bg-[rgba(242,169,59,0.06)] text-[#f2a93b] border border-[#7a5a26]">200 OK</span>
                              <span className="text-[#f4f1ea] font-mono break-all">item_disapproved: missing_required_attribute [gtin]</span>
                            </div>
                            <span className="text-[#6b7078] text-[11px] shrink-0 font-mono">104928192 / 14ms</span>
                          </div>

                          <div className="p-2.5 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2 py-0.5 rounded-[100px] text-[10.5px] font-mono bg-transparent text-[#6b7078] border border-[#3a3d43]">SKIPPED</span>
                              <span className="text-[#6b7078] font-mono break-all">item_status_unchanged: product_id: sku_49810</span>
                            </div>
                            <span className="text-[#6b7078] text-[11px] shrink-0 font-mono">294018241 / 4ms</span>
                          </div>

                          <div className="p-2.5 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2 py-0.5 rounded-[100px] text-[10.5px] font-mono bg-[rgba(242,169,59,0.06)] text-[#f2a93b] border border-[#7a5a26]">200 OK</span>
                              <span className="text-[#f4f1ea] font-mono break-all">item_disapproved: pricing_mismatch [price]</span>
                            </div>
                            <span className="text-[#6b7078] text-[11px] shrink-0 font-mono">994817263 / 18ms</span>
                          </div>

                          <div className="p-2.5 rounded-[3px] bg-[#0a0b0d] border border-[rgba(214,69,69,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2 py-0.5 rounded-[100px] text-[10.5px] font-mono bg-[rgba(214,69,69,0.08)] text-[#d64545] border border-[rgba(214,69,69,0.4)]">DLQ DROP</span>
                              <span className="text-[#d64545] font-mono break-all">UNSUPPORTED_ISSUE_CODE: unexpected payload schema</span>
                            </div>
                            <span className="text-[#d64545] text-[11px] shrink-0 font-mono">msg_gcp_9901 / DLQ</span>
                          </div>
                        </div>
                      </div>

                      {/* Latency Breakdown Console */}
                      <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                            <h3 className="text-xs font-mono text-[#f4f1ea]">Pipeline Latency Percentiles</h3>
                            <span className="text-[11px] font-mono text-[#6b7078]">Last 24h</span>
                          </div>

                          <div className="mt-4 space-y-4 font-mono text-xs">
                            <div>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-[#b9b3a5]">50th percentile (median)</span>
                                <span className="text-[#f4f1ea] font-semibold">184 ms</span>
                              </div>
                              <div className="w-full bg-[#0a0b0d] h-1.5 rounded-[2px] overflow-hidden border border-[rgba(255,255,255,0.08)]">
                                <div className="bg-[#f2a93b] h-full" style={{ width: '42%' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-[#b9b3a5]">95th percentile latency</span>
                                <span className="text-[#b9b3a5] font-semibold">240 ms</span>
                              </div>
                              <div className="w-full bg-[#0a0b0d] h-1.5 rounded-[2px] overflow-hidden border border-[rgba(255,255,255,0.08)]">
                                <div className="bg-[#6b7078] h-full" style={{ width: '58%' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-[#b9b3a5]">99th percentile latency</span>
                                <span className="text-[#b9b3a5] font-semibold">310 ms</span>
                              </div>
                              <div className="w-full bg-[#0a0b0d] h-1.5 rounded-[2px] overflow-hidden border border-[rgba(255,255,255,0.08)]">
                                <div className="bg-[#45484f] h-full" style={{ width: '74%' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] rounded-[3px] text-xs text-[#6b7078]">
                          <span className="text-[#f2a93b] font-mono">SLA Guarantee: </span>
                          <span>Target is &lt; 500ms from GCP arrival to Slack alert dispatch. Current pipeline operating at 184ms average.</span>
                        </div>
                      </div>
                    </div>

                    {/* Dead Letter Queue (DLQ) Triage Table */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold font-display text-[#f4f1ea]">Dead Letter Queue (DLQ) Triage</h3>
                          <p className="text-xs text-[#6b7078]">Inspect unhandled GCP payloads, inspect raw JSON, and replay after worker patches</p>
                        </div>
                        <span className="text-xs font-mono text-[#d64545] bg-[rgba(214,69,69,0.08)] border border-[rgba(214,69,69,0.4)] px-2.5 py-1 rounded-[100px] self-start sm:self-auto">
                          {dlqMessages.length} unhandled payloads
                        </span>
                      </div>

                      <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs min-w-[700px]">
                            <thead className="bg-[#0e0f11] text-[#45484f] border-b border-[rgba(255,255,255,0.08)] font-mono text-[11px]">
                              <tr>
                                <th className="px-4 py-3 font-normal">GCP Message ID</th>
                                <th className="px-4 py-3 font-normal">Receipt timestamp</th>
                                <th className="px-4 py-3 font-normal">Merchant ID</th>
                                <th className="px-4 py-3 font-normal">Failure reason</th>
                                <th className="px-4 py-3 font-normal">Raw payload</th>
                                <th className="px-4 py-3 font-normal text-right">DLQ actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                              {dlqMessages.map((msg) => (
                                <React.Fragment key={msg.id}>
                                  <tr className="hover:bg-[#131418] transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#f4f1ea]">
                                      {msg.message_id}
                                    </td>

                                    <td className="px-4 py-3 text-[#6b7078] font-mono text-xs whitespace-nowrap">
                                      {new Date(msg.created_at).toLocaleTimeString()}
                                    </td>

                                    <td className="px-4 py-3 font-mono text-xs text-[#b9b3a5]">
                                      {msg.merchant_id}
                                    </td>

                                    <td className="px-4 py-3">
                                      <span className="px-2 py-0.5 rounded-[100px] text-[11px] bg-[rgba(214,69,69,0.08)] text-[#d64545] border border-[rgba(214,69,69,0.4)] font-mono">
                                        {msg.failure_reason}
                                      </span>
                                    </td>

                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <button
                                        onClick={() => setExpandedPayloadId(expandedPayloadId === msg.id ? null : msg.id)}
                                        className="text-xs text-[#b9b3a5] hover:text-[#f4f1ea] font-medium flex items-center gap-1.5 transition-colors"
                                      >
                                        <span>Inspect raw JSON</span>
                                        {expandedPayloadId === msg.id ? <ChevronUp className="w-4 h-4 text-[#f2a93b]" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </td>

                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => handleDLQAction(msg.id, 'replay')}
                                          className="px-2.5 py-1 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#f2a93b] font-medium rounded-[3px] text-xs transition-colors flex items-center gap-1.5"
                                        >
                                          <Play className="w-3.5 h-3.5" />
                                          <span>Replay</span>
                                        </button>

                                        <button
                                          onClick={() => handleDLQAction(msg.id, 'purge')}
                                          className="px-2.5 py-1 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[rgba(214,69,69,0.4)] text-[#6b7078] hover:text-[#d64545] font-medium rounded-[3px] text-xs transition-colors flex items-center gap-1.5"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>Purge</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {expandedPayloadId === msg.id && (
                                    <tr className="bg-[#0a0b0d]">
                                      <td colSpan={6} className="px-4 py-4 border-t border-[rgba(255,255,255,0.08)]">
                                        <div className="text-xs text-[#b9b3a5] mb-2 font-mono flex items-center gap-2">
                                          <Terminal className="w-4 h-4 text-[#f2a93b]" />
                                          <span>GCP Pub/Sub ingestion raw payload details:</span>
                                        </div>
                                        <pre className="p-3 bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[3px] text-xs font-mono text-[#b9b3a5] overflow-x-auto max-h-56 leading-relaxed">
                                          {JSON.stringify(msg.payload, null, 2)}
                                        </pre>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                              {dlqMessages.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="px-4 py-12 text-center text-[#6b7078]">
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold font-display text-[#f4f1ea]">Slack & Outbound Dispatch Logs</h3>
                        <p className="text-xs text-[#6b7078]">Verify that product disapproval incidents are delivered to client Slack channels</p>
                      </div>
                      <span className="text-xs font-mono text-[#b9b3a5] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] px-3 py-1 rounded-[100px] self-start sm:self-auto">
                        {dispatchLogs.length} recent dispatches
                      </span>
                    </div>

                    <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[760px]">
                          <thead className="bg-[#0e0f11] text-[#45484f] border-b border-[rgba(255,255,255,0.08)] font-mono text-[11px]">
                            <tr>
                              <th className="px-4 py-3 font-normal">Dispatch ID & time</th>
                              <th className="px-4 py-3 font-normal">Tenant & store</th>
                              <th className="px-4 py-3 font-normal">Destination channel</th>
                              <th className="px-4 py-3 font-normal">Delivery status</th>
                              <th className="px-4 py-3 font-normal">Payload preview</th>
                              <th className="px-4 py-3 font-normal text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                            {dispatchLogs.map((log) => (
                              <React.Fragment key={log.id}>
                                <tr className="hover:bg-[#131418] transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="font-mono text-xs font-semibold text-[#f4f1ea]">{log.dispatch_id}</div>
                                    <div className="text-[11px] font-mono text-[#6b7078]">{new Date(log.created_at).toLocaleTimeString()}</div>
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="font-medium text-[#f4f1ea] text-xs">{log.tenant_email}</div>
                                    <div className="text-[#6b7078] text-xs">{log.store_url}</div>
                                  </td>

                                  <td className="px-4 py-3">
                                    <div className="font-mono text-xs text-[#b9b3a5] truncate max-w-[220px]" title={log.destination}>
                                      {log.destination}
                                    </div>
                                  </td>

                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[100px] text-[11px] font-mono border ${
                                        log.status_label === 'Delivered'
                                          ? 'bg-[rgba(242,169,59,0.06)] text-[#f2a93b] border-[#7a5a26]'
                                          : log.status_label === 'Rate Limited'
                                          ? 'bg-transparent text-[#b9b3a5] border-[rgba(255,255,255,0.14)]'
                                          : 'bg-[rgba(214,69,69,0.08)] text-[#d64545] border-[rgba(214,69,69,0.4)]'
                                      }`}
                                    >
                                      <span>{log.delivery_status}</span>
                                      <span>{log.status_label}</span>
                                    </span>
                                  </td>

                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <button
                                      onClick={() => setExpandedDispatchId(expandedDispatchId === log.id ? null : log.id)}
                                      className="text-xs text-[#b9b3a5] hover:text-[#f4f1ea] font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                      <span>View Block Kit JSON</span>
                                      {expandedDispatchId === log.id ? <ChevronUp className="w-4 h-4 text-[#f2a93b]" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                  </td>

                                  <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleRetryDispatch(log.id)}
                                        className="px-2.5 py-1.5 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#f4f1ea] font-medium rounded-[3px] text-xs transition-colors"
                                      >
                                        Retry
                                      </button>

                                      <button
                                        onClick={() => handleDisableWebhook(log.destination)}
                                        className="px-2.5 py-1.5 bg-transparent border border-[rgba(255,255,255,0.14)] hover:border-[rgba(214,69,69,0.4)] text-[#6b7078] hover:text-[#d64545] font-medium rounded-[3px] text-xs transition-colors"
                                      >
                                        Silence
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {expandedDispatchId === log.id && (
                                  <tr className="bg-[#0a0b0d]">
                                    <td colSpan={6} className="px-4 py-4 border-t border-[rgba(255,255,255,0.08)]">
                                      <div className="text-xs text-[#b9b3a5] mb-2 font-mono flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-[#f2a93b]" />
                                        <span>Slack Block Kit JSON dispatched to customer:</span>
                                      </div>
                                      <pre className="p-3 bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[3px] text-xs font-mono text-[#b9b3a5] overflow-x-auto max-h-56 leading-relaxed">
                                        {JSON.stringify(log.payload, null, 2)}
                                      </pre>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                            {dispatchLogs.length === 0 && (
                              <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-[#6b7078]">
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
                    <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] rounded-[4px] p-5 sm:p-6 space-y-5">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold font-display text-[#f4f1ea]">
                          Platform Operational Controls & Feature Flags
                        </h3>
                        <p className="text-xs text-[#6b7078] mt-1">
                          Configure platform behavior globally in real-time without redeploying code.
                        </p>
                      </div>

                      <form onSubmit={handleSaveConfig} className="space-y-5">
                        {/* Maintenance Mode */}
                        <div className="flex items-center justify-between p-3.5 bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] rounded-[3px]">
                          <div className="pr-4">
                            <div className="text-xs font-semibold text-[#f4f1ea]">Maintenance mode</div>
                            <div className="text-[11px] text-[#6b7078] mt-0.5">
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
                            <div className="w-10 h-5 bg-[#131418] border border-[rgba(255,255,255,0.14)] peer-focus:outline-none rounded-[100px] peer peer-checked:bg-[#f2a93b] peer-checked:border-[#f2a93b] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#6b7078] peer-checked:after:bg-[#1a1305] after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5" />
                          </label>
                        </div>

                        {/* Registration Gate */}
                        <div className="p-3.5 bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] rounded-[3px] space-y-2">
                          <label className="block text-xs font-semibold text-[#f4f1ea]">Registration gate</label>
                          <p className="text-[11px] text-[#6b7078]">
                            Regulates pilot onboarding and access controls on the public landing page.
                          </p>
                          <select
                            value={config.registration_gate}
                            onChange={(e) =>
                              setConfig({ ...config, registration_gate: e.target.value as 'open' | 'invite_only' | 'closed' })
                            }
                            className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] rounded-[3px] p-2 text-xs text-[#f4f1ea] font-sans focus:outline-none focus:border-[#f2a93b] transition-colors cursor-pointer"
                          >
                            <option value="open">Open Sign-ups (Standard Pilot Intake)</option>
                            <option value="invite_only">Invite-only Code Gate (Manual Approval Required)</option>
                            <option value="closed">Closed Registration (Waitlist Paused)</option>
                          </select>
                        </div>

                        {/* Global Rate Limiting */}
                        <div className="p-3.5 bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] rounded-[3px] space-y-2">
                          <label className="block text-xs font-semibold text-[#f4f1ea]">Global Pub/Sub ingestion rate limiter</label>
                          <p className="text-[11px] text-[#6b7078]">
                            Maximum Google Cloud Pub/Sub and webhook transactions processed per minute per tenant namespace.
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                            <input
                              type="number"
                              min="100"
                              max="10000"
                              step="50"
                              value={config.rate_limit_per_min}
                              onChange={(e) => setConfig({ ...config, rate_limit_per_min: Number(e.target.value) })}
                              className="w-full sm:w-48 bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] rounded-[3px] p-2 text-xs font-mono text-[#f4f1ea] focus:outline-none focus:border-[#f2a93b] transition-colors"
                            />
                            <span className="text-xs font-mono text-[#6b7078]">req / minute</span>
                          </div>
                        </div>

                        {/* Global Alert Banner */}
                        <div className="p-3.5 bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] rounded-[3px] space-y-2">
                          <label className="block text-xs font-semibold text-[#f4f1ea]">Global customer dashboard alert banner</label>
                          <p className="text-[11px] text-[#6b7078]">
                            Broadcasts a live banner across all authenticated customer dashboards. Leave blank to disable.
                          </p>
                          <textarea
                            rows={3}
                            value={config.banner_text || ''}
                            onChange={(e) => setConfig({ ...config, banner_text: e.target.value })}
                            placeholder="e.g., Routine Google Merchant API maintenance scheduled on Sunday 02:00 UTC. Pub/Sub queue remains active."
                            className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] rounded-[3px] p-2 text-xs text-[#f4f1ea] placeholder-[#45484f] focus:outline-none focus:border-[#f2a93b] transition-colors font-sans"
                          />
                          {config.banner_text && (
                            <div className="mt-2 p-2.5 bg-[#131418] border border-[rgba(255,255,255,0.08)] rounded-[3px] text-xs text-[#b9b3a5]">
                              <span className="font-semibold text-[#f4f1ea]">Live banner preview: </span>
                              <span>{config.banner_text}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={savingConfig}
                            className="btn-primary w-full sm:w-auto text-xs py-2 px-5 disabled:opacity-50"
                          >
                            {savingConfig ? 'Saving platform changes...' : 'Save configuration live'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
