'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, ChevronDown, ShieldCheck, LayoutDashboard } from 'lucide-react';

interface AuthUser {
  email: string;
  name?: string | null;
  role: string;
  isAdmin?: boolean;
}

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stores, setStores] = useState<Array<{ id: number | string; name: string; gmcId: string }>>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.stores && Array.isArray(data.stores) && data.stores.length > 0) {
          setStores(
            data.stores.map((s: { id: number | string; store_name?: string; store_url?: string; gmc_id?: string; merchant_id?: string }) => ({
              id: s.id,
              name: s.store_name || s.store_url || 'Store',
              gmcId: s.gmc_id || s.merchant_id || 'UNKNOWN',
            }))
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
    fetchUser();
    fetchStores();
  }, [fetchUser, fetchStores]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
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

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f1ea] flex flex-col font-sans selection:bg-[#7a5a26] selection:text-[#f4f1ea]">
      {/* Merchant Clean Navigation Bar */}
      <header className="sticky top-0 z-40 h-14 bg-[#0a0b0d] border-b border-[rgba(255,255,255,0.08)] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand & Catalog Status */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] rounded-[3px]"
              aria-label="Kultra Dashboard"
            >
              <Image
                src="/assets/logos/kultra-logo-horizontal.svg"
                alt="Kultra"
                width={140}
                height={36}
                className="h-[28px] sm:h-[30px] w-auto object-contain brightness-110"
                priority
              />
            </Link>

            {/* Catalog Shield Active Indicator */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[100px] border border-[#7a5a26] bg-[rgba(242,169,59,0.06)] text-[#f2a93b] text-[11px] font-mono tracking-[0.02em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" aria-hidden="true" />
              <span>Catalog Shield: Active</span>
            </div>

            {/* Active Store Selector (§1 Clean Merchant Header) */}
            {stores.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#131418] border border-[rgba(255,255,255,0.08)]">
                <span className="font-mono text-[10.5px] text-[#6b7078]">STORE:</span>
                {stores.length > 1 ? (
                  <div className="relative flex items-center">
                    <select
                      aria-label="Select active store"
                      value={activeStoreId || ''}
                      onChange={(e) => {
                        const newId = e.target.value;
                        if (newId === '__connect_new__') {
                          window.location.href = '/api/auth/merchant/connect';
                        } else if (newId) {
                          setActiveStoreId(newId);
                          const url = new URL(window.location.href);
                          url.searchParams.set('store_id', newId);
                          window.location.href = url.pathname + url.search;
                        }
                      }}
                      className="bg-transparent text-[#f4f1ea] text-[11.5px] font-mono rounded-[3px] pr-5 appearance-none focus:outline-none cursor-pointer"
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={String(s.id)} className="bg-[#0e0f11] text-[#f4f1ea]">
                          {s.name} (GMC #{s.gmcId})
                        </option>
                      ))}
                      <option value="__connect_new__" className="bg-[#0e0f11] text-[#f2a93b]">
                        + Connect another GMC...
                      </option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-[#6b7078] pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
                  </div>
                ) : (
                  <span className="font-mono text-[11px] text-[#b9b3a5]">
                    {stores[0]?.name} <span className="text-[#6b7078]">(GMC #{stores[0]?.gmcId})</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Controls: User Profile Menu */}
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[rgba(255,255,255,0.14)] text-[12.5px] font-medium text-[#b9b3a5] hover:text-[#f4f1ea] hover:border-[#7a5a26] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#f2a93b]" />
                <span>Mission Control</span>
              </Link>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-2 py-1 rounded-[3px] hover:bg-[#131418] border border-transparent hover:border-[rgba(255,255,255,0.08)] transition-colors focus-visible:ring-2 focus-visible:ring-[#f2a93b] outline-none"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full bg-[#131418] border border-[rgba(255,255,255,0.14)] flex items-center justify-center text-[11px] font-mono font-medium text-[#f4f1ea] shrink-0">
                  {user ? getInitials(user.name || user.email) : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[12.5px] font-medium text-[#f4f1ea] max-w-[140px] truncate leading-tight">
                    {user?.name || user?.email || 'Customer'}
                  </span>
                  <span className="text-[10.5px] font-mono text-[#6b7078] leading-tight">
                    {user?.role === 'admin' ? 'Platform Owner' : 'Merchant'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#6b7078] transition-transform duration-120 ${dropdownOpen ? 'rotate-180 text-[#f2a93b]' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] z-50 animate-in fade-in-50 duration-120">
                  <div className="p-2.5 border-b border-[rgba(255,255,255,0.08)]">
                    <div className="text-[13px] font-medium text-[#f4f1ea] truncate">
                      {user?.name || user?.email}
                    </div>
                    <div className="text-[11px] font-mono text-[#6b7078] truncate mt-0.5">
                      {user?.email}
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
