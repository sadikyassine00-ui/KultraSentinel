import React from 'react';
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
          Stop losing ad spend to silent Google Merchant disapprovals
        </h1>

        {/* Subheadline in Inter (High-contrast ink-secondary per §13) */}
        <p className="mt-6 text-[15.5px] sm:text-[16.5px] text-[var(--ink-secondary)] leading-[1.65] max-w-[640px] mx-auto text-balance">
          Google will not text you when policy changes silently kill your bestselling ads. Kultra monitors your feed 24/7 and delivers instant alerts before you waste ad spend.
        </p>

        {/* Action Group: Primary and Secondary buttons (§4 radius 3px) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pilot"
            className="btn-primary !rounded-[3px] text-[13px] px-5 py-2.5"
          >
            Start monitoring feed
          </a>

          <a
            href="#demo"
            className="btn-secondary !rounded-[3px] text-[13px] px-5 py-2.5"
          >
            View live triage demo
          </a>
        </div>
      </div>

      {/* 2. Dashboard Graphic Stage: Visible above the fold peek, flat surface with hairline border */}
      <div className="w-full max-w-[1140px] mx-auto mt-12 md:mt-16 relative">
        <div className="relative w-full rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bg-surface)] overflow-hidden dashboard-frame-mask">
          <div className="w-full relative z-[1]">
            <DashboardIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
