'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, Server } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative w-full border-t border-[var(--hairline)] bg-[var(--bg-canvas)] py-14 px-4 sm:px-6 z-10">
      <div className="max-w-[1140px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[var(--hairline)]">
          {/* Brand & Positioning Statement */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center group outline-none" aria-label="Kultra Home">
              <Image
                src="/assets/logos/kultra-logo-horizontal.svg"
                alt="Kultra"
                width={140}
                height={36}
                className="h-[28px] sm:h-[30px] w-auto object-contain brightness-105"
              />
            </Link>

            <p className="text-[13.5px] text-[var(--ghost-text)] max-w-[360px] leading-[1.55]">
              Real-time Google Merchant Center telemetry and disapproval watchdog. Sub-30-second Slack alerts before silent ad traffic drops.
            </p>

            <div className="flex flex-col gap-1.5 font-mono text-[11px] text-[var(--ghost-text)]">
              <div>Headquartered in Ouarzazate, Morocco</div>
              <div>Direct inquiry: <a href="mailto:support@usekultra.com" className="text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] underline underline-offset-2">support@usekultra.com</a></div>
            </div>

            {/* System Status */}
            <div className="tag-pill tag-signal text-[10.5px] mt-1">
              Google Merchant API v1: Operational
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="font-mono text-[11px] text-[var(--ghost-text)] tracking-[0.02em]">
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
                <a href="#security" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Security &amp; Compliance
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/register" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Protect Your Google Shopping Ads
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="font-mono text-[11px] text-[var(--ghost-text)] tracking-[0.02em]">
              Compliance &amp; Legal
            </h4>
            <ul className="space-y-2 text-[13px] text-[var(--ink-secondary)]">
              <li>
                <Link href="/privacy" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <a href="#security" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  OAuth Scope Transparency
                </a>
              </li>
              <li>
                <a href="mailto:support@usekultra.com" className="hover:text-[var(--ink-primary)] hover:underline underline-offset-4 transition-colors duration-120">
                  support@usekultra.com
                </a>
              </li>
            </ul>

            {/* Compliance & Security Credibility Badges (§3 Compliance Directive) */}
            <div className="mt-3 pt-3 border-t border-[var(--hairline)] space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--ghost-text)]">
                <Lock className="w-3.5 h-3.5 text-[var(--signal)] shrink-0" strokeWidth={1.5} />
                <span>AES-256-GCM Token Encryption at Rest</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--ghost-text)]">
                <Server className="w-3.5 h-3.5 text-[var(--signal)] shrink-0" strokeWidth={1.5} />
                <span>Enforced TLS 1.3 Transport</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--ghost-text)]">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--signal)] shrink-0" strokeWidth={1.5} />
                <span>Google Limited Use Policy Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Trademark & Platform Disclaimer (§3 Directive) */}
        <div className="py-6 border-b border-[var(--hairline)]">
          <p className="text-[12px] text-[var(--ghost-text)] leading-[1.6]">
            Kultra (usekultra.com) is an independent monitoring platform and is not affiliated with, sponsored by, or endorsed by Google LLC or Shopify Inc. Google Merchant Center and Shopify are registered trademarks of their respective owners.
          </p>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[var(--ghost-text)]">
          <p>© 2026 Kultra (usekultra.com). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--ink-primary)] transition-colors">
              Privacy Policy
            </Link>
            <span>/</span>
            <Link href="/terms" className="hover:text-[var(--ink-primary)] transition-colors">
              Terms of Service
            </Link>
            <span>/</span>
            <Link href="/refund" className="hover:text-[var(--ink-primary)] transition-colors">
              Refund Policy
            </Link>
            <span>/</span>
            <span>Ouarzazate, Morocco</span>
            <span>/</span>
            <span>support@usekultra.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
