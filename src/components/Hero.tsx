import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, Zap } from 'lucide-react';
import { DashboardIllustration } from './DashboardIllustration';

export function Hero() {
  return (
    <section className="relative w-full pt-16 md:pt-24 pb-16 px-4 sm:px-6 flex flex-col items-center z-10">
      {/* 1. Centered Single Column Content */}
      <div className="max-w-[1040px] w-full mx-auto text-center flex flex-col items-center">
        {/* Primary Positioning Eyebrow */}
        <div className="font-mono text-[11px] sm:text-[12px] text-[var(--signal)] tracking-[0.03em] mb-4 font-medium">
          The real-time Google Merchant Center watchdog
        </div>

        {/* Main Heading in Fraunces (Strictly weight 600 per §2) */}
        <h1
          className="font-display font-semibold text-[2.25rem] sm:text-[3rem] md:text-[3.6rem] text-[var(--ink-primary)] leading-[1.15] tracking-[-0.01em] max-w-[960px] mx-auto text-center"
          style={{ fontWeight: 600 }}
        >
          Detect Google Merchant Disapprovals Before Silent Ad Traffic Drops.
        </h1>

        {/* Subheadline in Inter (High-contrast ink-secondary per §13) */}
        <p className="mt-6 text-[15.5px] sm:text-[16.5px] text-[var(--ink-secondary)] leading-[1.65] max-w-[680px] mx-auto text-balance">
          Google will not text you when policy changes break your catalog. Instant sub-30-second Slack alerts with direct one-click fix links the moment Google&apos;s crawler flags a product violation.
        </p>

        {/* Action Group: Strictly One Clear Primary Conversion Action (§4 radius 3px) */}
        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/register"
            className="btn-primary !rounded-[3px] text-[14px] px-7 py-3.5 font-semibold"
          >
            Protect Your Google Shopping Ads
          </Link>
        </div>

        {/* Risk-Reversal Subtext Directly Below Primary Action */}
        <div className="mt-3.5 text-center">
          <span className="font-mono text-[11.5px] text-[var(--ghost-text)] tracking-[0.02em]">
            Instant Slack alerts. 14-day trial starts upon connecting your store. No credit card required.
          </span>
        </div>

        {/* Setup Speed Reassurance & Friction Reducer Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>Connects via Google in 60 seconds.</span>
          </span>

          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>No Credit Card Required</span>
          </span>

          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>Read-Only Catalog Access</span>
          </span>
        </div>
      </div>

      {/* 2. Proof-of-Work Pipeline Stage: Transparent side-by-side composition */}
      <div id="demo" className="w-full max-w-[1140px] mx-auto mt-12 md:mt-16 relative bg-transparent">
        <DashboardIllustration />
      </div>
    </section>
  );
}
