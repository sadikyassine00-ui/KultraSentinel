import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, Zap } from 'lucide-react';
import { DashboardIllustration } from './DashboardIllustration';

export function Hero() {
  return (
    <section className="relative w-full pt-16 md:pt-24 pb-16 px-4 sm:px-6 flex flex-col items-center z-10">
      {/* 1. Centered Single Column Content */}
      <div className="max-w-[1040px] w-full mx-auto text-center flex flex-col items-center">
        {/* Primary Qualification Eyebrow Tag (Single eyebrow on entire page) */}
        <div className="font-mono text-[11px] sm:text-[12px] text-[var(--signal)] tracking-[0.03em] mb-4 font-medium">
          Built for boutique PPC agencies managing Google Shopping
        </div>

        {/* Main Heading in Tinos */}
        <h1
          className="font-display font-semibold text-[2.25rem] sm:text-[3rem] md:text-[3.6rem] text-[var(--ink-primary)] leading-[1.15] tracking-[-0.01em] max-w-[960px] mx-auto text-center"
          style={{ fontWeight: 600 }}
        >
          Catch Google Feed Disapprovals Before Your Clients Notice.
        </h1>

        {/* Subheadline in Inter (High-contrast ink-secondary per §13) */}
        <p className="mt-6 text-[15.5px] sm:text-[16.5px] text-[var(--ink-secondary)] leading-[1.65] max-w-[720px] mx-auto text-balance">
          Kultra monitors your client feeds 24/7 and pings Slack within 30 seconds of any product disapproval. Connect in 60 seconds with zero storefront scripts and 0% speed impact.
        </p>

        {/* Action Group: Strictly One Clear Primary Conversion Action */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <Link
            href="/register"
            className="btn-primary !rounded-[var(--radius-sm)] text-[14.5px] px-8 py-3.5 font-semibold inline-flex items-center justify-center text-center"
          >
            Start 14-Day Trial
          </Link>

          {/* Clean Trial & No Credit Card Reassurance - No pills, no dots */}
          <p className="mt-3 text-[13px] text-[var(--ghost-text)] text-center">
            14-day trial starts on store connection. No credit card required.
          </p>
        </div>

        {/* Setup Speed Reassurance & Friction Reducer Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>Zero Storefront Code (0% Speed Impact)</span>
          </span>

          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>Read-Only Passive Monitoring</span>
          </span>

          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>Multi-Client Slack Channel Isolation</span>
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
