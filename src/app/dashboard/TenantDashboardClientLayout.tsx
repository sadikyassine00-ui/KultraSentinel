'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, ChevronDown, ShieldCheck, LayoutDashboard, CreditCard } from 'lucide-react';
import { FleetLimitModal } from '@/components/dashboard/FleetLimitModal';
import { PaddleCheckoutModal } from '@/components/billing/PaddleCheckoutOverlay';

interface AuthUser {
  email: string;
  name?: string | null;
  role: string;
  isAdmin?: boolean;
}

interface BillingState {
  status: 'active trial' | 'paid active' | 'expired' | 'canceled';
  daysRemaining: number;
  trialEndsAt: string;
  formattedTrialEnd: string;
  isLocked: boolean;
  upgradeUrl: string;
  hasTrialStarted?: boolean;
  isSuperAdmin?: boolean;
  planTier?: 'Solo' | 'Agency' | 'Superadmin';
  planName?: string;
  monthlyPrice?: number;
  formattedPrice?: string;
  renewalOrExpirationDate?: string;
  formattedRenewalOrExpiration?: string;
  isUrgent?: boolean;
  quotas?: {
    gmcAccountsConnected: number;
    gmcAccountsLimit: number | 'unlimited';
    slackDestinationsActive: number;
    pubsubMonitoringStatus: 'Active' | 'Paused' | 'Degraded';
  };
}

interface StoreItem {
  id: number | string;
  name: string;
  domain: string;
  gmcId: string;
}

export default function TenantDashboardClientLayout({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'solo' | 'agency'>('solo');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const storeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.status === 401) {
        setUser(null);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return;
        }
      }
    } catch {
      // Retain existing state on transient network issues
    }
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.billing) {
          setBilling(data.billing);
        }
        if (data.stores && Array.isArray(data.stores) && data.stores.length > 0) {
          setStores(
            data.stores.map((s: { id: number | string; store_name?: string; store_url?: string; gmc_id?: string; merchant_id?: string }) => {
              const rawDomain = s.store_url || '';
              const cleanDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
              return {
                id: s.id,
                name: s.store_name || cleanDomain || `Merchant #${s.gmc_id || s.merchant_id}`,
                domain: cleanDomain,
                gmcId: s.gmc_id || s.merchant_id || 'UNKNOWN',
              };
            })
          );
          if (data.activeStore) {
            setActiveStoreId(String(data.activeStore.id));
          }
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }, []);

  useEffect(() => {
    if (!initialUser) {
      fetchUser();
    }
    fetchStores();
  }, [fetchUser, fetchStores, initialUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(event.target as Node)) {
        setStoreDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setStoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.dispatchEvent(new Event('auth-change'));
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const getInitials = (emailOrName: string) => {
    const parts = emailOrName.split('@')[0].split(/[._ -]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return emailOrName.slice(0, 2).toUpperCase();
  };

  const isSuperAdminUser = Boolean(
    billing?.isSuperAdmin || (user?.email && user.email.toLowerCase().trim() === 'yassinesadik0@gmail.com')
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f1ea] flex flex-col font-sans selection:bg-[#7a5a26] selection:text-[#f4f1ea]">
      {/* Merchant Clean Navigation Bar */}
      <header className="sticky top-0 z-40 h-14 bg-[#0a0b0d] border-b border-[rgba(255,255,255,0.08)] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Left Operational Cluster */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] rounded-[3px] shrink-0"
              aria-label="Kultra Home"
            >
              <Image
                src="/assets/logos/kultra-logo-horizontal.svg"
                alt="Kultra"
                width={140}
                height={36}
                className="h-[22px] xs:h-[26px] sm:h-[28px] w-auto object-contain brightness-110"
                priority
              />
            </Link>

            <div className="h-4 w-px bg-[rgba(255,255,255,0.12)] hidden sm:block shrink-0" />

            {/* Store Identifier and Connection Status with Account Quota */}
            {stores.length > 0 && (() => {
              const activeStore = stores.find((s) => String(s.id) === String(activeStoreId)) || stores[0];
              const isAgencyUser = billing?.planTier === 'Agency' || billing?.planName?.includes('Agency');
              const maxStoresLimit = isSuperAdminUser ? Infinity : isAgencyUser ? 5 : 1;
              const maxStoresLabel = isSuperAdminUser ? 'Unlimited' : isAgencyUser ? '5' : '1';
              const quotaLabel = isSuperAdminUser ? `${stores.length} of ∞` : `${stores.length} of ${maxStoresLabel}`;

              return (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex items-center shrink-0" ref={storeDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setStoreDropdownOpen((prev) => !prev)}
                      className="bg-[#131418] border border-[rgba(255,255,255,0.14)] hover:border-[#7a5a26] text-[#f4f1ea] rounded-[3px] py-1 px-2 sm:px-2.5 flex items-center gap-1.5 sm:gap-2 text-left focus:outline-none focus:border-[#f2a93b] transition-colors"
                      aria-haspopup="listbox"
                      aria-expanded={storeDropdownOpen}
                      aria-label="Switch active store or view store quota"
                    >
                      <div className="flex flex-col min-w-0 max-w-[95px] xs:max-w-[130px] sm:max-w-[200px]">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[12px] sm:text-[12.5px] font-semibold text-[#f4f1ea] truncate leading-tight">
                            {activeStore?.name}
                          </span>
                          <span className="font-mono text-[10px] sm:text-[10.5px] text-[#b9b3a5] shrink-0 font-medium">
                            ({quotaLabel})
                          </span>
                        </div>
                        {activeStore?.domain && (
                          <span className="text-[10px] sm:text-[10.5px] text-[#6b7078] truncate leading-tight">
                            {activeStore.domain}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#6b7078] shrink-0 transition-transform duration-150 ${storeDropdownOpen ? 'rotate-180 text-[#f2a93b]' : ''}`} />
                    </button>

                    {storeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] rounded-[4px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] z-50 py-1.5">
                        <div className="px-3 py-1.5 text-[10px] font-mono text-[#6b7078] tracking-wider uppercase border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                          <span>GMC Accounts ({quotaLabel})</span>
                          <span className="text-[10px] text-[#45484f]">Switch active view</span>
                        </div>

                        <div className="max-h-64 overflow-y-auto py-1">
                          {stores.map((s) => {
                            const isCurrent = String(s.id) === String(activeStoreId);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setStoreDropdownOpen(false);
                                  if (String(s.id) !== String(activeStoreId)) {
                                    setActiveStoreId(String(s.id));
                                    const url = new URL(window.location.href);
                                    url.searchParams.set('store_id', String(s.id));
                                    window.location.href = url.pathname + url.search;
                                  }
                                }}
                                className={`w-full text-left px-3 py-2 flex items-start justify-between gap-2 transition-colors ${
                                  isCurrent
                                    ? 'bg-[rgba(242,169,59,0.08)] border-l-2 border-[#f2a93b]'
                                    : 'hover:bg-[#131418]'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-semibold text-[#f4f1ea] truncate">
                                    {s.name}
                                  </div>
                                  {s.domain && (
                                    <div className="text-[11.5px] text-[#b9b3a5] truncate">
                                      {s.domain}
                                    </div>
                                  )}
                                  <div className="font-mono text-[10px] text-[#6b7078] mt-0.5">
                                    GMC #{s.gmcId}
                                  </div>
                                </div>
                                {isCurrent && (
                                  <span className="shrink-0 mt-0.5 text-[#f2a93b] font-mono text-[11px] font-medium">
                                    Active
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="border-t border-[rgba(255,255,255,0.08)] pt-1 mt-1 px-1">
                          <button
                            type="button"
                            onClick={() => {
                              setStoreDropdownOpen(false);
                              if (isSuperAdminUser) {
                                window.location.href = '/api/auth/merchant/connect';
                                return;
                              }
                              if (stores.length >= maxStoresLimit) {
                                setIsFleetModalOpen(true);
                                return;
                              }
                              window.location.href = '/api/auth/merchant/connect';
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-[3px] text-[12px] text-[#f2a93b] hover:bg-[#131418] flex items-center gap-1.5 transition-colors font-medium"
                          >
                            <span>+ Connect another GMC...</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Controls: Unified Status Trigger & User Profile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* 1. Superadmin: "Lifetime Admin" */}
            {isSuperAdminUser ? (
              <div
                className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-[var(--radius-sm)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] text-[11px] sm:text-[12px] font-mono shrink-0 font-medium"
                title="Superadmin Lifetime Access: Zero billing restrictions or quotas"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
                <span><span className="hidden sm:inline">Lifetime </span>Admin</span>
              </div>
            ) : billing && (
              <>
                {/* 2. Unstarted Trial: Prompt to connect Google Merchant Center */}
                {!billing.hasTrialStarted ? (
                  <a
                    href="/api/auth/merchant/connect"
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[var(--radius-sm)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] hover:border-[var(--signal)] text-[11px] sm:text-[12px] font-mono transition-colors shrink-0 font-medium"
                    title="Connect your Google Merchant Center account to start your 14-day free trial."
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" aria-hidden="true" />
                    <span><span className="hidden sm:inline">Connect GMC to </span>Start Trial</span>
                  </a>
                ) : billing.status === 'active trial' ? (
                  /* 3. Unified Trial Countdown & Upgrade Button: Direct Modal Checkout */
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutPlan('solo');
                      setIsCheckoutOpen(true);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[var(--radius-sm)] border ${
                      billing.daysRemaining <= 3
                        ? 'border-[var(--danger)] bg-[var(--danger-wash)] text-[var(--danger)] hover:bg-[rgba(214,69,69,0.18)]'
                        : 'border-[var(--signal)] bg-[var(--signal)] text-[#1a1305] hover:bg-[#f6b855]'
                    } text-[11px] sm:text-[12px] font-semibold transition-colors shrink-0 cursor-pointer`}
                    title={`14-Day Free Trial: ${billing.daysRemaining} days remaining. Click to upgrade.`}
                    aria-label="Upgrade subscription"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        billing.daysRemaining <= 3 ? 'bg-[var(--danger)]' : 'bg-[#1a1305]'
                      }`}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="hidden sm:inline">{billing.daysRemaining} {billing.daysRemaining === 1 ? 'Day' : 'Days'} Left · Upgrade</span>
                      <span className="sm:hidden">{billing.daysRemaining}d Left · Upgrade</span>
                    </span>
                  </button>
                ) : billing.status === 'paid active' && (billing.planTier === 'Solo' || billing.planName?.includes('Solo')) ? (
                  /* 4. Solo Plan Indicator */
                  <Link
                    href="/dashboard/settings?tab=billing"
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] bg-[var(--bg-surface-2)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--signal-dim)] text-[11px] sm:text-[12px] font-mono transition-colors shrink-0 font-medium"
                    title="Solo Plan ($19/mo) — Click to view billing and store limits"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" aria-hidden="true" />
                    <span>
                      <span className="hidden sm:inline">Solo Plan · {stores.length}/1 Stores</span>
                      <span className="sm:hidden">Solo · {stores.length}/1</span>
                    </span>
                  </Link>
                ) : billing.status === 'paid active' && (billing.planTier === 'Agency' || billing.planName?.includes('Agency')) ? (
                  /* 5. Agency Fleet Indicator */
                  <Link
                    href="/dashboard/settings?tab=billing"
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[var(--radius-sm)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] hover:border-[var(--signal)] text-[11px] sm:text-[12px] font-mono transition-colors shrink-0 font-medium"
                    title="Agency Plan ($49/mo) — Click to manage multi-store fleet"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" aria-hidden="true" />
                    <span>
                      <span className="hidden sm:inline">Agency Fleet · {stores.length}/5 Stores</span>
                      <span className="sm:hidden">Fleet · {stores.length}/5</span>
                    </span>
                  </Link>
                ) : (billing.isLocked || billing.status === 'expired') ? (
                  /* 6. Expired Trial Unified Button */
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutPlan('solo');
                      setIsCheckoutOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[var(--radius-sm)] border border-[var(--danger)] bg-[var(--danger-wash)] text-[var(--danger)] hover:bg-[rgba(214,69,69,0.18)] text-[11px] sm:text-[12px] font-semibold transition-colors shrink-0 cursor-pointer"
                    title="Trial expired. Click to choose plan and restore monitoring."
                    aria-label="Trial expired, upgrade now"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" aria-hidden="true" />
                    <span><span className="hidden sm:inline">Trial </span>Expired · Upgrade</span>
                  </button>
                ) : null}
              </>
            )}

            {user?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border border-[rgba(255,255,255,0.14)] text-[12px] font-medium text-[#b9b3a5] hover:text-[#f4f1ea] hover:border-[#7a5a26] transition-colors shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#f2a93b]" />
                <span>Mission Control</span>
              </Link>
            )}

            {/* User Profile Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 rounded-[3px] hover:bg-[#131418] border border-transparent hover:border-[rgba(255,255,255,0.08)] transition-colors focus-visible:ring-2 focus-visible:ring-[#f2a93b] outline-none shrink-0"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full bg-[#131418] border border-[rgba(255,255,255,0.14)] flex items-center justify-center text-[11px] font-mono font-medium text-[#f4f1ea] shrink-0">
                  {user ? getInitials(user.name || user.email) : 'U'}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-[12px] font-medium text-[#f4f1ea] max-w-[120px] truncate leading-tight">
                    {user?.name || user?.email || 'Merchant'}
                  </span>
                  <span className="text-[10px] font-mono text-[#6b7078] leading-tight">
                    {isSuperAdminUser ? 'Lifetime Admin' : billing?.planName || 'Merchant'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#6b7078] transition-transform duration-120 ${dropdownOpen ? 'rotate-180 text-[#f2a93b]' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] z-50 animate-in fade-in-50 duration-120">
                  <div className="p-2.5 border-b border-[rgba(255,255,255,0.08)]">
                    <div className="text-[13px] font-medium text-[#f4f1ea] truncate">
                      {user?.name || user?.email}
                    </div>
                    <div className="text-[11px] font-mono text-[#6b7078] truncate mt-0.5">
                      {user?.email}
                    </div>
                    <div className="mt-1.5">
                      <span className="tag-pill tag-signal text-[10px]">
                        {isSuperAdminUser ? 'Lifetime Admin' : billing?.planName || 'Active Merchant'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/dashboard/settings?tab=billing"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-[12.5px] text-[#b9b3a5] hover:text-[#f4f1ea] hover:bg-[#131418] transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#f2a93b]" />
                      <span>Billing &amp; Subscription</span>
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-[12.5px] text-[#b9b3a5] hover:text-[#f4f1ea] hover:bg-[#131418] transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#f2a93b]" />
                        <span>Mission Control</span>
                      </Link>
                    )}

                    <Link
                      href="/"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-[12.5px] text-[#b9b3a5] hover:text-[#f4f1ea] hover:bg-[#131418] transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#6b7078]" />
                      <span>Product Overview</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-[rgba(255,255,255,0.08)]">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-[12.5px] text-[#b9b3a5] hover:text-[#d64545] hover:bg-[rgba(214,69,69,0.08)] transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#d64545]" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Merchant Content View */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0 max-w-full overflow-x-hidden">
        {children}
      </main>

      {/* Fleet Limit Interceptor Modal */}
      <FleetLimitModal
        isOpen={isFleetModalOpen}
        onClose={() => setIsFleetModalOpen(false)}
        userEmail={user?.email || ''}
        storeCount={stores.length}
        maxStores={billing?.planTier === 'Agency' || billing?.planName?.includes('Agency') ? 5 : 1}
        onUpgradeToAgency={() => {
          setIsFleetModalOpen(false);
          setCheckoutPlan('agency');
          setIsCheckoutOpen(true);
        }}
      />

      {/* Subscription Checkout Modal */}
      <PaddleCheckoutModal
        isOpen={isCheckoutOpen}
        plan={checkoutPlan}
        userEmail={user?.email || ''}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          fetchStores();
        }}
      />
    </div>
  );
}
