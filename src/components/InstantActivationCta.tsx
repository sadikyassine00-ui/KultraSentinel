'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Clock, Calendar, ArrowRight } from 'lucide-react';

export function InstantActivationCta() {
  return (
    <section
      id="activate"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[960px] mx-auto text-center">
        {/* Top Eyebrow Tag */}
        <span className="font-mono text-[11px] text-[var(--signal)] tracking-[0.02em] block mb-3">
          Instant activation
        </span>

        {/* Section Headline in Fraunces */}
        <h2 className="font-display text-[2rem] sm:text-[2.6rem] font-semibold text-[var(--ink-primary)] leading-[1.2] max-w-[780px] mx-auto">
          Connect Your Store in 60 Seconds. Protect Ad Revenue Immediately.
        </h2>

        {/* Subheadline in Inter */}
        <p className="mt-4 text-[15px] sm:text-[16px] text-[var(--ink-secondary)] leading-[1.6] max-w-[620px] mx-auto text-balance">
          Stop flying blind between manual Merchant Center checks. Stream real-time Pub/Sub push alerts straight to your team&apos;s Slack channel.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/register"
            className="btn-primary !rounded-[3px] text-[13.5px] px-7 py-3 font-semibold"
          >
            Start your free 14-day trial
          </Link>

          <a
            href="https://cal.com/kultra/15min-audit"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !rounded-[3px] text-[13.5px] px-6 py-3 inline-flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[var(--ghost-text)]" strokeWidth={1.5} />
            <span>Book 15-Min Live Audit</span>
          </a>
        </div>

        {/* 3 Risk-Reversal Reassurances */}
        <div className="mt-8 pt-6 border-t border-[var(--hairline)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-[780px] mx-auto">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <div className="text-[12.5px] font-medium text-[var(--ink-primary)]">Free 14-Day Trial</div>
              <div className="text-[11.5px] text-[var(--ghost-text)]">No credit card required. Full feature access.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <div className="text-[12.5px] font-medium text-[var(--ink-primary)]">Zero Store Impact</div>
              <div className="text-[11.5px] text-[var(--ghost-text)]">100% out-of-band. No storefront scripts.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <div className="text-[12.5px] font-medium text-[var(--ink-primary)]">Fast Setup</div>
              <div className="text-[11.5px] text-[var(--ghost-text)]">Connect GMC and Slack in under 2 minutes.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
