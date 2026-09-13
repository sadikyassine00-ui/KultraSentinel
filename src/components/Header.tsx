'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@heroui/react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 left-0 w-full h-[68px] z-50 transition-all duration-250 border-b-0 ${
        scrolled
          ? 'bg-[#0a0b1dff]/85 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between gap-6">
        {/* Brand Group */}
        <div className="flex items-center gap-4">
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
              className="h-[28px] sm:h-[30px] w-auto object-contain transition-opacity duration-180 group-hover:opacity-90"
              priority
            />
          </a>
          <span className="hidden sm:inline-block text-[0.8125rem] font-medium text-[#94A3B8] whitespace-nowrap pl-3 border-l border-[#1E293B]">
            Built on Merchant API v1
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          <a
            href="#features"
            className="text-[0.875rem] font-medium text-[#94A3B8] hover:text-[#FDF4D2] transition-colors duration-180 relative py-1 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#FF788D] after:transition-all after:duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0b1dff] rounded-[2px]"
          >
            Features
          </a>
          <a
            href="#architecture"
            className="text-[0.875rem] font-medium text-[#94A3B8] hover:text-[#FDF4D2] transition-colors duration-180 relative py-1 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#FF788D] after:transition-all after:duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0b1dff] rounded-[2px]"
          >
            Architecture
          </a>
          <a
            href="#integrations"
            className="text-[0.875rem] font-medium text-[#94A3B8] hover:text-[#FDF4D2] transition-colors duration-180 relative py-1 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#FF788D] after:transition-all after:duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0b1dff] rounded-[2px]"
          >
            Integrations
          </a>
        </nav>

        {/* Header Action using HeroUI Button with Accent Color and Hover Sequences */}
        <div>
          <Button
            as="a"
            href="#beta"
            size="sm"
            className="group relative overflow-hidden bg-[#FF788D] hover:bg-[#FF8FA2] active:scale-[0.98] text-[#0a0b1dff] text-[0.84rem] font-bold px-[1.15rem] py-[0.5rem] rounded-[4px] border border-[#FF788D] hover:border-white/90 shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#FF788D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b1dff]"
          >
            {/* Ambient Angled Sheen Sweep on Hover */}
            <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-[4px]">
              <span className="absolute top-0 bottom-0 -left-12 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[220px] transition-all duration-600 ease-out" />
            </span>

            {/* Steady Telemetry Glyph (Zero radar/pulse) */}
            <svg
              className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 16 16"
              fill="none"
              stroke="#0a0b1dff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="5.5" />
              <circle cx="8" cy="8" r="1.75" fill="#0a0b1dff" />
            </svg>

            <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">
              Join priority beta
            </span>

            <span
              aria-hidden="true"
              className="relative z-10 text-[0.9rem] font-bold transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1"
            >
              →
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
