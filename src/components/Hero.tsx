import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, Zap } from 'lucide-react';
import { DashboardIllustration } from './DashboardIllustration';

export function Hero() {
  return (
    <section className="relative w-full pt-16 md:pt-24 pb-16 px-4 sm:px-6 flex flex-col items-center z-10">
      {/* 1. Centered Single Column Content */}
      <div className="max-w-[1040px] w-full mx-auto text-center flex flex-col items-center">
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

        {/* Action Group: Primary and Secondary buttons (§4 radius 3px) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="btn-primary !rounded-[3px] text-[13.5px] px-6 py-3"
          >
            Start your free 14-day trial
          </Link>

          <a
            href="#demo"
            className="btn-secondary !rounded-[3px] text-[13.5px] px-6 py-3"
          >
            View Live Triage Demo
          </a>
        </div>

        {/* Urgency and Free Trial Mono Line (§B5, no em-dashes per §A8) */}
        <div className="mt-3.5 text-center">
          <span className="font-mono text-[11px] text-[var(--ghost-text)] tracking-[0.02em]">
            Free 14-day trial, no credit card required. Limited pilot cohort this month (10 agency / 25 merchant seats).
          </span>
        </div>

        {/* Three Friction Reducer Pills Directly Below Primary Action (§2 Landing Page Directive) */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>No Credit Card Required</span>
          </span>

          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>Read-Only Catalog Access</span>
          </span>

          <span className="tag-pill tag-ghost text-[11px] py-1 px-3 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={1.5} />
            <span>Set Up in Under 2 Minutes</span>
          </span>
        </div>
      </div>

      {/* 2. Dashboard Graphic Stage: Visible above the fold peek, flat surface with hairline border */}
      <div id="demo" className="w-full max-w-[1140px] mx-auto mt-12 md:mt-16 relative">
        <div className="relative w-full rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bg-surface)] overflow-hidden dashboard-frame-mask">
          <div className="w-full relative z-[1]">
            <DashboardIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
