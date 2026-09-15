'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Globe,
  LogOut,
  ChevronDown,
  User,
  LayoutDashboard,
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

  // Check scroll position for styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch session status
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

  // Listen for custom auth-change events across components
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [checkAuth]);

  // Close dropdown on outside click or escape key
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
    { label: 'How It Works', href: '/#features' },
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
      className={`sticky top-0 left-0 w-full z-50 transition-colors duration-200 ${
        scrolled || mobileMenuOpen
          ? 'bg-[#0a0b1dff]/95 backdrop-blur-md border-b border-[#1E293B]'
          : 'bg-[#0a0b1dff]/80 backdrop-blur-sm border-b border-[#1E293B]/40'
      }`}
    >
      <div className="max-w-[1400px] h-[68px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Group */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0b1dff] group"
            aria-label="Kultra Home"
          >
            <Image
              src="/assets/logos/kultraLogo-trimmed.png"
              alt="Kultra"
              width={140}
              height={30}
              className="h-[26px] sm:h-[30px] w-auto object-contain transition-opacity duration-180 group-hover:opacity-95 brightness-110"
              priority
            />
          </Link>
          <span className="hidden lg:inline-block text-[0.8125rem] font-medium text-[#94A3B8] whitespace-nowrap pl-3 border-l border-[#1E293B]">
            Built on Merchant API v1
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[0.875rem] font-medium text-[#CBD5E1] hover:text-[#FDF4D2] transition-colors duration-180 relative py-1 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#FF788D] after:transition-all after:duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0b1dff] rounded-[2px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            /* Logged-In User Profile Pill & Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#142036] hover:bg-[#1C2C4A] border border-[#2B3B52] hover:border-slate-500 text-xs font-semibold text-[#FDF4D2] transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF788D] text-[#0a0b1dff] flex items-center justify-center text-[10px] font-bold shrink-0">
                  {getInitials(user.name || user.email)}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-xs font-bold text-[#FDF4D2]">
                  {user.name || user.email}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" title="Active Session" />
                <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform ${dropdownOpen ? 'rotate-180 text-[#FF788D]' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg bg-[#0F1522] border border-[#2B3B52] p-2 shadow-2xl z-[100] animate-in fade-in-50 duration-100">
                  {/* User Profile Header */}
                  <div className="p-2.5 border-b border-[#1E293B]">
                    <div className="text-xs font-bold text-[#FDF4D2] truncate">
                      {user.name || user.email}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] truncate">{user.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#142036] border border-[#1E293B] text-[#34D399]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span>{user.isAdmin || user.role === 'admin' ? 'Sole Platform Owner' : 'Active Merchant'}</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1 space-y-0.5">
                    {user.isAdmin || user.role === 'admin' ? (
                      <>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-[#CBD5E1] hover:text-[#FDF4D2] hover:bg-[#18263D] transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#FF788D]" />
                          <span>Mission Control</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-[#CBD5E1] hover:text-[#FDF4D2] hover:bg-[#18263D] transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Catalog Dashboard</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-[#CBD5E1] hover:text-[#FDF4D2] hover:bg-[#18263D] transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#FF788D]" />
                        <span>Catalog Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href="/"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-[#CBD5E1] hover:text-[#FDF4D2] hover:bg-[#18263D] transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Public Website</span>
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1 border-t border-[#1E293B]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-[#FF788D] hover:bg-rose-500/15 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-Out CTAs */
            <>
              <Link
                href="/login"
                className="text-[0.84rem] font-bold text-[#CBD5E1] hover:text-[#FDF4D2] px-2.5 sm:px-3 py-1.5 transition-colors duration-180"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-[0.84rem] font-bold text-[#0a0b1dff] bg-[#FF788D] hover:bg-[#FF788D]/90 px-3.5 sm:px-4 py-1.5 rounded-[4px] transition-all duration-180 flex items-center gap-1.5 shadow-sm"
              >
                <span>Register</span>
                <span aria-hidden="true" className="text-[0.85rem]">→</span>
              </Link>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#94A3B8] hover:text-[#FDF4D2] transition-colors rounded-[4px] border border-[#1E293B] bg-[#0F1522] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F1522] border-b border-[#1E293B] px-5 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[0.9rem] font-medium text-[#CBD5E1] hover:text-[#FDF4D2] py-2 transition-colors border-b border-[#1E293B]/40 last:border-none"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="pt-2 border-t border-[#1E293B] space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded bg-[#142036]">
                <div className="w-7 h-7 rounded-full bg-[#FF788D] text-[#0a0b1dff] flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(user.name || user.email)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#FDF4D2] truncate">{user.name || user.email}</div>
                  <div className="text-[10px] text-[#34D399] font-medium">
                    {user.isAdmin || user.role === 'admin' ? 'Sole Platform Owner' : 'Active Tenant'}
                  </div>
                </div>
              </div>

              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-[0.85rem] font-bold text-[#0a0b1dff] bg-[#FF788D] hover:bg-[#FF788D]/90 py-2 rounded-[4px] transition-colors"
              >
                Go to Mission Control
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full block text-center text-[0.85rem] font-semibold text-[#FF788D] bg-[#142036] hover:bg-[#1E293B] border border-[#1E293B] py-2 rounded-[4px] transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-[0.85rem] font-bold text-[#FDF4D2] bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] py-2 rounded-[4px] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/admin/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-[0.85rem] font-bold text-[#0a0b1dff] bg-[#FF788D] hover:bg-[#FF788D]/90 py-2 rounded-[4px] transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
