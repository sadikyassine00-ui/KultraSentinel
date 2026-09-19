'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';

interface AuthUser {
  email: string;
  name?: string | null;
  role: string;
  isAdmin?: boolean;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuth = useCallback(async () => {
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

  useEffect(() => {
    checkAuth();
  }, [checkAuth, pathname]);

  useEffect(() => {
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [checkAuth]);

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      window.dispatchEvent(new Event('auth-change'));
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };


  const navLinks = [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Architecture', href: '/#architecture' },
    { label: 'Integrations', href: '/#integrations' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ];

  const getInitials = (emailOrName: string) => {
    const parts = emailOrName.split('@')[0].split(/[._ -]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return emailOrName.slice(0, 2).toUpperCase();
  };

  // Dedicated merchant workspace on /dashboard manages its own layout header
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 left-0 w-full z-50 transition-colors duration-150 ${
        scrolled || mobileMenuOpen
          ? 'bg-[#0a0b0d]/95 backdrop-blur-md border-b border-[var(--hairline)]'
          : 'bg-[#0a0b0d] border-b border-[var(--hairline)]'
      }`}
    >
      <div className="max-w-[1400px] h-[60px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Group */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            href="/"
            className="flex items-center rounded-[var(--radius-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)]"
            aria-label="Kultra Home"
          >
            <Image
              src="/assets/logos/kultra-logo-horizontal.svg"
              alt="Kultra"
              width={140}
              height={36}
              className="h-[28px] sm:h-[30px] w-auto object-contain brightness-105"
              priority
            />
          </Link>
          <span className="hidden xl:inline-block font-mono text-[11px] text-[var(--ghost-text-dim)] pl-3 border-l border-[var(--hairline)]">
            Merchant API v1
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium text-[var(--ghost-text)] hover:text-[var(--ink-primary)] transition-colors duration-120"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            /* Logged-In User Profile Pill & Dropdown (§16 Top bar) - Static Status Dot with ZERO animation (§17) */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-2)] border border-[var(--hairline)] text-[13px] text-[var(--ink-primary)] transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--bg-surface-2)] border border-[var(--hairline)] text-[var(--ink-primary)] flex items-center justify-center font-mono text-[10px] font-semibold shrink-0">
                  {getInitials(user.name || user.email)}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-[13px] text-[var(--ink-primary)]">
                  {user.name || user.email}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)] shrink-0" title="Active Session" />
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--ghost-text)] transition-transform duration-120 ${dropdownOpen ? 'rotate-180 text-[var(--signal)]' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline-strong)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] z-[100]">
                  <div className="p-2 border-b border-[var(--hairline)]">
                    <div className="text-[13px] font-medium text-[var(--ink-primary)] truncate">
                      {user.name || user.email}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--ghost-text-dim)] truncate">{user.email}</div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    {user.isAdmin || user.role === 'admin' ? (
                      <>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[var(--ghost-text)]" />
                          <span>Mission Control</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-[var(--signal)]" />
                          <span>Catalog Shield</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[var(--signal)]" />
                        <span>Catalog Shield</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[var(--hairline)]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--danger)] hover:bg-[var(--danger-wash)] transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Visitor Actions: Sign In + Call to Value CTA */
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="text-[13px] font-medium text-[var(--ghost-text)] hover:text-[var(--ink-primary)] px-2 py-1.5 transition-colors duration-120"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-primary !rounded-[3px] text-[12.5px] sm:text-[13px] py-2 px-3.5 sm:px-4 font-semibold whitespace-nowrap"
              >
                <span className="hidden sm:inline">Protect Your Google Shopping Ads</span>
                <span className="sm:hidden">Protect Shopping Ads</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle for all users */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--ghost-text)] hover:text-[var(--ink-primary)] transition-colors rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--bg-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--hairline)] px-5 py-4 space-y-3">
          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[14px] font-medium text-[var(--ghost-text)] hover:text-[var(--ink-primary)] py-2 transition-colors border-b border-[var(--hairline)] last:border-none"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="pt-2 border-t border-[var(--hairline)] space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary !rounded-[3px] w-full justify-center text-[13px] py-2"
              >
                Open Catalog Shield
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn-secondary !rounded-[3px] w-full justify-center text-[13px] py-2"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[var(--hairline)] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary !rounded-[3px] w-full justify-center text-[13px] py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary !rounded-[3px] w-full justify-center text-[13px] py-2"
              >
                Protect Your Google Shopping Ads
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
