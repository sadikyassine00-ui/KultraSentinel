'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#features' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`sticky top-0 left-0 w-full z-50 transition-colors duration-250 ${
        scrolled || mobileMenuOpen
          ? 'bg-[#0a0b1dff]/90 backdrop-blur-md border-b border-[#1E293B]/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] h-[68px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Group */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="#"
            className="flex items-center rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0b1dff] group"
            aria-label="Kultra Home"
          >
            <Image
              src="/assets/logos/kultraLogo-trimmed.png"
              alt="Kultra"
              width={140}
              height={30}
              className="h-[26px] sm:h-[30px] w-auto object-contain transition-opacity duration-180 group-hover:opacity-90"
              priority
            />
          </a>
          <span className="hidden lg:inline-block text-[0.8125rem] font-medium text-[#94A3B8] whitespace-nowrap pl-3 border-l border-[#1E293B]">
            Built on Merchant API v1
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[0.875rem] font-medium text-[#94A3B8] hover:text-[#FDF4D2] transition-colors duration-180 relative py-1 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#FF788D] after:transition-all after:duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0b1dff] rounded-[2px]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Header Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sign In / Log in Button */}
          <a
            href="/admin/login"
            className="text-[0.84rem] font-bold text-[#CBD5E1] hover:text-[#FDF4D2] px-2.5 sm:px-3 py-1.5 transition-colors duration-180"
          >
            Log in
          </a>
          <a
            href="/admin/register"
            className="text-[0.84rem] font-bold text-[#0a0b1dff] bg-[#FF788D] hover:bg-[#FF788D]/90 px-3.5 sm:px-4 py-1.5 rounded-[4px] transition-all duration-180 flex items-center gap-1.5 shadow-sm"
          >
            <span>Register</span>
            <span aria-hidden="true" className="text-[0.85rem]">→</span>
          </a>

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
        <div className="md:hidden bg-[#0F1522] border-b border-[#1E293B] px-5 py-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[0.9rem] font-medium text-[#94A3B8] hover:text-[#FDF4D2] py-2 transition-colors border-b border-[#1E293B]/40 last:border-none"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center text-[0.85rem] font-bold text-[#FDF4D2] bg-[#141C2B] hover:bg-[#1E293B] border border-[#1E293B] py-2 rounded-[4px] transition-colors"
            >
              Log in
            </a>
            <a
              href="/admin/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center text-[0.85rem] font-bold text-[#0a0b1dff] bg-[#FF788D] hover:bg-[#FF788D]/90 py-2 rounded-[4px] transition-colors"
            >
              Register
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
