import React from 'react';
import { DashboardIllustration } from './DashboardIllustration';

export function Hero() {
  return (
    <section className="relative w-full pt-12 md:pt-20 pb-16 px-4 sm:px-6 flex flex-col items-center z-10">
      {/* 1. Centered Single Column Content */}
      <div className="max-w-[1140px] w-full mx-auto text-center flex flex-col items-center">
        {/* Main Heading strictly 2 lines in Satoshi */}
        <h1
          style={{ fontFamily: "'Satoshi', sans-serif" }}
          className="text-[1.85rem] sm:text-[2.75rem] md:text-[3.4rem] lg:text-[3.85rem] font-bold text-[#FDF4D2] leading-[1.12] tracking-[-0.01em] w-full max-w-[1060px] mx-auto text-center"
        >
          <span
            style={{ fontFamily: "'Satoshi', sans-serif" }}
            className="block sm:whitespace-nowrap font-bold"
          >
            Stop losing ad spend to silent
          </span>
          <span
            style={{ fontFamily: "'Satoshi', sans-serif" }}
            className="block sm:whitespace-nowrap font-bold"
          >
            Google Merchant disapprovals
          </span>
        </h1>

        {/* Subheadline in Satoshi (Weight 500) */}
        <p
          style={{ fontFamily: "'Satoshi', sans-serif" }}
          className="mt-6 text-[1.05rem] sm:text-[1.15rem] md:text-[1.2rem] font-medium text-subhead leading-[1.6] max-w-[660px] mx-auto text-balance"
        >
          Google won't text you when policy changes silently kill your bestselling ads. Kultra monitors your feed 24/7 and delivers instant alerts before you waste another dollar of ad spend.
        </p>

        {/* Action Group: Side by side, centered, small 4px border radius, custom radar/pulse icon */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#beta"
            className="group relative overflow-hidden bg-[#FF788D] hover:bg-[#FF8FA2] active:scale-[0.98] text-[#0a0b1dff] font-bold text-[0.95rem] px-6 h-12 rounded-[4px] border border-[#FF788D] hover:border-white/90 shadow-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#FF788D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b1dff]"
          >
            {/* Ambient Angled Sheen Sweep on Hover */}
            <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-[4px]">
              <span className="absolute top-0 bottom-0 -left-16 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[420px] transition-all duration-700 ease-out" />
            </span>

            {/* Telemetry Target Reticle (Static, Zero Radar Sweep/Pulse) */}
            <svg
              className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 16 16"
              fill="none"
              stroke="#0a0b1dff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="5.5" />
              <line x1="8" y1="1" x2="8" y2="3.5" />
              <line x1="8" y1="12.5" x2="8" y2="15" />
              <line x1="1" y1="8" x2="3.5" y2="8" />
              <line x1="12.5" y1="8" x2="15" y2="8" />
              <circle cx="8" cy="8" r="1.5" fill="#0a0b1dff" />
            </svg>

            <span className="relative z-10 transition-transform duration-250 group-hover:translate-x-0.5">
              Join priority beta
            </span>

            <span
              aria-hidden="true"
              className="relative z-10 text-[1.05rem] font-bold transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1"
            >
              →
            </span>
          </a>

          <a
            href="#demo"
            className="group relative overflow-hidden bg-[#0F1522] hover:bg-[#141C2B] active:scale-[0.98] text-[#FDF4D2] hover:text-[#FF788D] font-medium text-[0.95rem] px-6 h-12 rounded-[4px] border border-[#1E293B] hover:border-[#FF788D]/50 shadow-none transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b1dff]"
          >
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              View live incident demo
            </span>
            <span
              aria-hidden="true"
              className="text-[1.1rem] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1.5 text-[#94A3B8] group-hover:text-[#FF788D]"
            >
              →
            </span>
          </a>
        </div>
      </div>

      {/* 2. Dashboard Graphic Stage: Visible above the fold peek, 100% opaque, progressive bottom fade */}
      <div className="w-full max-w-[1140px] mx-auto mt-12 md:mt-16 relative">
        <div
          className="relative w-full rounded-[6px] border border-[#1E293B] bg-[#0a0b1dff] shadow-none overflow-hidden dashboard-frame-mask opacity-100"
          style={{ opacity: 1 }}
        >
          {/* Dashboard SVG Illustration (Inline, 100% opaque, small radii, Satoshi + isolated JetBrains Mono) */}
          <div className="w-full relative z-[1] opacity-100">
            <DashboardIllustration />
          </div>

          {/* Bottom Progressive Gradient Scrim for seamless blend into canvas */}
          <div
            className="absolute inset-0 pointer-events-none dashboard-frame-scrim z-[2]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
