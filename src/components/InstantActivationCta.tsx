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
        {/* Section Headline in Fraunces without eyebrow tag */}
        <h2 className="font-display text-[2rem] sm:text-[2.6rem] font-semibold text-[var(--ink-primary)] leading-[1.2] max-w-[780px] mx-auto">
          Stop Finding Out About Broken Feeds from Angry Clients.
        </h2>

        {/* Subheadline in Inter */}
        <p className="mt-4 text-[15px] sm:text-[16px] text-[var(--ink-secondary)] leading-[1.6] max-w-[620px] mx-auto text-balance">
          Connect your client Google Merchant Center accounts in under 60 seconds. Free for 14 days with zero code on client websites and zero credit card required.
        </p>

        {/* Action Button: High-Contrast Primary Conversion Action */}
        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/register"
            className="btn-primary !rounded-[var(--radius-sm)] text-[14.5px] px-8 py-3.5 font-semibold inline-flex items-center justify-center text-center"
          >
            Start 14-Day Trial
          </Link>
        </div>

        {/* Risk-Reversal Subtext Directly Below Primary Action */}
        <div className="mt-3 text-center">
          <span className="font-mono text-[11.5px] text-[var(--ghost-text)] tracking-[0.02em]">
            14-day trial starts on store connection. Cancel anytime in one click.
          </span>
        </div>

        {/* Setup Speed Reassurance Pill */}
        <div className="mt-4 flex items-center justify-center">
          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>Connects via Google OAuth in 60 seconds.</span>
          </span>
        </div>

        {/* 3 Risk-Reversal Reassurances */}
        <div className="mt-8 pt-6 border-t border-[var(--hairline)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-[780px] mx-auto">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <div className="text-[12.5px] font-medium text-[var(--ink-primary)]">14-Day Free Trial</div>
              <div className="text-[11.5px] text-[var(--ghost-text)]">Trial starts upon connecting your first store. No credit card required.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <div className="text-[12.5px] font-medium text-[var(--ink-primary)]">Zero Store Impact</div>
              <div className="text-[11.5px] text-[var(--ghost-text)]">100% cloud monitoring. Zero client scripts or speed risk.</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <div className="text-[12.5px] font-medium text-[var(--ink-primary)]">60-Second Setup</div>
              <div className="text-[11.5px] text-[var(--ghost-text)]">1-click Google OAuth with read-only permissions.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
