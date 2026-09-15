'use client';

import React from 'react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="relative w-full border-t border-[var(--hairline)] bg-[var(--bg-canvas)] py-14 px-4 sm:px-6 z-10">
      <div className="max-w-[1140px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[var(--hairline)]">
          {/* Brand & Concise Positioning Statement */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <a href="#" className="flex items-center group outline-none" aria-label="Kultra Home">
              <Image
                src="/assets/logos/kultraLogo-trimmed.png"
                alt="Kultra"
                width={130}
                height={26}
                className="h-[26px] w-auto object-contain brightness-105"
              />
            </a>

            <p className="text-[13.5px] text-[var(--ghost-text)] max-w-[340px] leading-[1.5]">
              Real-time Google Merchant Center telemetry and disapproval watchdog.
            </p>

            {/* System Status */}
            <div className="tag-pill tag-signal text-[11px]">
              Merchant API v1: Operational
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.02em]">
              Navigation
            </h4>
            <ul className="space-y-2 text-[13px] text-[var(--ink-secondary)]">
              <li>
                <a href="#features" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Features
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Architecture
                </a>
              </li>
              <li>
                <a href="#diagnostics" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Diagnostics
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Portal login
                </a>
              </li>
              <li>
                <a href="mailto:support@usekultra.com" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Contact and support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.02em]">
              Compliance
            </h4>
            <ul className="space-y-2 text-[13px] text-[var(--ink-secondary)]">
              <li>
                <a href="#privacy" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#beta" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Pilot access
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[var(--ghost-text-dim)]">
          <p>© {new Date().getFullYear()} Kultra. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Google Merchant API v1</span>
            <span>/</span>
            <span>Cloud Pub/Sub Push</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
