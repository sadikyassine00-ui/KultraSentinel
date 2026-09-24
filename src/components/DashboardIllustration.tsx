'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

export function DashboardIllustration() {
  return (
    <div className="relative w-full bg-transparent flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 lg:gap-8 xl:gap-10 select-none">
      {/* ============================================================ */}
      {/* 1. LEFT ELEMENT: THE GMC INCIDENT TRIAGE CARD                 */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[540px] xl:w-[560px] bg-[var(--bg-surface)] border border-[var(--danger)] rounded-[var(--radius-md)] p-5 sm:p-6 flex flex-col justify-between text-left relative shrink-0">
        <div>
          {/* Card Header: Triage Status & Latency Metric */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--hairline)]">
            {/* Status Pill Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(214,69,69,0.1)] border border-[var(--danger)] text-[var(--danger)] font-mono text-[10.5px] sm:text-[11px] font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[var(--danger)]" />
              DISAPPROVAL DETECTED
            </span>

            {/* Real Latency Metric: Captured in <1s */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(242,169,59,0.08)] border border-[rgba(242,169,59,0.3)] text-[var(--ink-primary)] font-mono text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
              Captured in &lt;1s
            </span>
          </div>

          {/* Product Identity Block: Alpine Expedition Anorak */}
          <div className="flex items-center gap-4 mt-5">
            {/* Authentic Product Photo */}
            <div className="w-[74px] h-[74px] sm:w-[84px] sm:h-[84px] rounded-[var(--radius-sm)] overflow-hidden border border-[var(--hairline-strong)] shrink-0 bg-[var(--bg-surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/alpine-anorak.jpg"
                alt="Alpine Expedition Anorak"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Meta & Titles */}
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10.5px] text-[var(--ghost-text)] tracking-wider block truncate">
                CATALOG SKU: OW-8842-BLK-M
              </span>
              <h3 className="font-display font-semibold text-[17px] sm:text-[18px] text-[var(--ink-primary)] leading-snug mt-0.5 truncate">
                Alpine Expedition Anorak
              </h3>
              <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5 truncate">
                Variant: Slate Black / Medium · Price: $148.00 USD
              </p>
              <p className="font-mono text-[11px] text-[var(--ghost-text-dim)] mt-0.5">
                GMC Offer ID: raw_feed_91024_us
              </p>
            </div>
          </div>

          {/* Ad Traffic Exposure Stats Band */}
          <div className="bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-sm)] p-3 sm:p-3.5 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[11px] text-[var(--ghost-text)] block">Active Traffic Exposure</span>
              <span className="font-mono font-medium text-[14.5px] text-[var(--ink-primary)]">
                1,840 clicks at risk
              </span>
            </div>
            <div className="hidden sm:block w-[1px] h-8 bg-[var(--hairline)]" />
            <div>
              <span className="text-[11px] text-[var(--ghost-text)] block">Google Ads Campaign Status</span>
              <span className="font-mono font-medium text-[14.5px] text-[var(--danger)]">
                Shopping Ads Auction Paused
              </span>
            </div>
          </div>

          {/* Protocol Error Box & Active Laser Scanning Interception */}
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--ghost-text)] tracking-wider">
                INTERCEPTED PROTOCOL ERROR
              </span>
              <span className="font-mono text-[10.5px] text-[var(--danger)] font-semibold">
                [CRITICAL]
              </span>
            </div>

            {/* Dark Error Box with Superimposed Laser Scanner */}
            <div className="relative bg-[var(--bg-canvas)] border border-[var(--danger)]/50 rounded-[var(--radius-sm)] p-3 overflow-hidden font-mono text-[12px] sm:text-[12.5px] text-[var(--ink-primary)] leading-normal">
              <span className="relative z-10 text-[var(--danger)] font-medium block break-all">
                item_disapproved: missing_required_attribute [gtin]
              </span>

              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-y-0 left-0 w-16 pointer-events-none laser-scanner-line flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#ff4d4d]/30 to-transparent" />
                <div className="w-[2px] h-full bg-[#ffffff] shadow-[0_0_8px_#ff4d4d]" />
              </div>
            </div>

            <p className="text-[12px] text-[var(--ink-secondary)]">
              Google crawler rejected feed: Missing UPC/GTIN barcode attribute.
            </p>
          </div>
        </div>

        {/* Agnostic Action Buttons: [Edit Product] and [GMC Console] */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-6 pt-4 border-t border-[var(--hairline)]">
          {/* Primary High-Contrast Button: [Edit Product] */}
          <a
            href="#triage"
            className="btn-primary !rounded-[3px] text-[13px] py-2.5 px-4 font-semibold inline-flex items-center justify-center gap-2 flex-1 text-center"
          >
            <span>Edit Product</span>
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>

          {/* Secondary High-Contrast Button: [GMC Console] */}
          <a
            href="https://merchants.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !rounded-[3px] text-[13px] py-2.5 px-4 font-semibold inline-flex items-center justify-center gap-2 flex-1 text-center"
          >
            <span>GMC Console</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--ghost-text)]" strokeWidth={1.5} />
          </a>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DIRECTIONAL TELEMETRY CONNECTION BRIDGE                    */}
      {/* ============================================================ */}
      {/* Desktop Horizontal Bridge (lg+) */}
      <div className="hidden lg:flex flex-col items-center justify-center relative px-2 self-center shrink-0 w-32 xl:w-36">
        <svg className="w-full h-10 overflow-visible" viewBox="0 0 140 40" fill="none">
          <defs>
            <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d64545" />
              <stop offset="60%" stopColor="#f2a93b" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="bridgeGlow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glowing background blur line */}
          <path
            d="M 0 20 L 132 20"
            stroke="#d64545"
            strokeWidth="6"
            strokeOpacity="0.25"
            filter="url(#bridgeGlow)"
          />
          {/* Base gradient line */}
          <path
            d="M 0 20 L 132 20"
            stroke="url(#bridgeGrad)"
            strokeWidth="2"
            strokeOpacity="0.75"
          />
          {/* Animated data pulses */}
          <path
            d="M 0 20 L 132 20"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="telemetry-stream-pulse"
          />
          {/* Arrowhead */}
          <path
            d="M 124 14 L 134 20 L 124 26"
            fill="none"
            stroke="#f2a93b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Origin pulse node */}
          <circle cx="2" cy="20" r="3.5" fill="#d64545" />
        </svg>

        {/* Anchored Latency Badge */}
        <div className="mt-1 px-2.5 py-1 rounded-full bg-[var(--bg-surface-2)] border border-[var(--signal-dim)] text-[var(--signal)] font-mono text-[11px] font-medium flex items-center gap-1 whitespace-nowrap">
          <span>⚡ Live Dispatch: 0.28s</span>
        </div>
      </div>

      {/* Mobile/Tablet Vertical Bridge (< lg) */}
      <div className="flex lg:hidden flex-col items-center justify-center py-2 gap-1.5 shrink-0">
        <div className="w-[2px] h-6 bg-gradient-to-b from-[var(--danger)] via-[var(--signal)] to-white" />
        <span className="px-3 py-1 rounded-full bg-[var(--bg-surface-2)] border border-[var(--signal-dim)] text-[var(--signal)] font-mono text-[11px] font-medium shadow-sm">
          ⚡ Live Dispatch: 0.28s
        </span>
        <div className="w-[2px] h-6 bg-gradient-to-b from-[var(--signal)] to-white" />
      </div>

      {/* ============================================================ */}
      {/* 3. RIGHT ELEMENT: THE CONVERSION DRIVER (SLACK ALERT CARD)    */}
      {/* High contrast, crisp white surface, verbatim notification     */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[460px] xl:w-[480px] bg-[#ffffff] text-[#1d1c1d] rounded-[8px] p-5 sm:p-6 shadow-[0_24px_54px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.15)] flex flex-col justify-between border border-white/20 text-left relative shrink-0">
        <div>
          {/* Slack Channel Ribbon */}
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
            <span className="font-bold flex items-center gap-1 text-[13px] text-[#1d1c1d]">
              <span className="text-[#616061]">#</span> merchant-alerts
            </span>
            <span className="font-mono text-[10.5px] font-medium text-[#007a5a] bg-[#e6f4ea] px-2 py-0.5 rounded">
              LIVE DISPATCH · 0.28s
            </span>
          </div>

          {/* Slack App Identity */}
          <div className="flex items-center gap-3 pt-3">
            {/* Kultra Alerts Avatar */}
            <div className="w-9 h-9 rounded-[6px] bg-[#0e0f11] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
                <g transform="translate(24, 24) scale(1.05) translate(-21.55, -19.25)">
                  <line x1="20" y1="20" x2="6" y2="10" stroke="#6b7078" strokeWidth="2" />
                  <line x1="20" y1="20" x2="8" y2="32" stroke="#6b7078" strokeWidth="2" />
                  <line x1="20" y1="20" x2="33" y2="33" stroke="#6b7078" strokeWidth="2" />
                  <line x1="20" y1="20" x2="34" y2="9" stroke="#f2a93b" strokeWidth="2.5" />
                  <circle cx="6" cy="10" r="3.2" fill="#6b7078" />
                  <circle cx="8" cy="32" r="3.2" fill="#6b7078" />
                  <circle cx="33" cy="33" r="2.8" fill="#6b7078" />
                  <circle cx="34" cy="9" r="4.2" fill="#f2a93b" />
                  <circle cx="20" cy="20" r="5.5" fill="#f2a93b" />
                </g>
              </svg>
            </div>

            {/* App Name & Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[14.5px] text-[#1d1c1d]">Kultra Alerts</span>
              <span className="bg-[#f2f2f2] text-[#616061] text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]">
                APP
              </span>
              <span className="text-[#616061] text-[12px]">12:04 PM</span>
            </div>
          </div>

          {/* Verbatim Slack Block Notification Box with Red Left Accent */}
          <div className="mt-3.5 border-l-4 border-[#e01e5a] bg-[#fafafa] p-4 rounded-r-md space-y-2.5 text-left border border-l-0 border-[#f0f0f0]">
            {/* Headline */}
            <div className="font-bold text-[15px] text-[#1d1c1d] flex items-center gap-1.5">
              <span>🚨</span>
              <span>Critical Disapproval Detected</span>
            </div>

            <hr className="border-[#ebebeb]" />

            {/* Verbatim Key-Value Rows */}
            <div className="space-y-1 text-[13px]">
              <div>
                <span className="font-bold text-[#1d1c1d]">Merchant ID:</span>{' '}
                <span className="font-mono font-medium text-[#1d1c1d]">4918374</span>
              </div>
              <div>
                <span className="font-bold text-[#1d1c1d]">Item:</span>{' '}
                <span className="font-medium text-[#1d1c1d]">ACR-909 (Apex Carbon Runner)</span>
              </div>
              <div>
                <span className="font-bold text-[#1d1c1d]">Error:</span>{' '}
                <span className="text-[#e01e5a] font-semibold">Missing GTIN. Ad traffic paused.</span>
              </div>
            </div>

            {/* Impact Pill */}
            <div className="bg-[#feeef1] border border-[#fad2da] text-[#e01e5a] font-mono text-[11px] font-medium px-2.5 py-1.5 rounded-[3px] mt-1">
              Campaign Impact: 24 active ads suspended
            </div>
          </div>
        </div>

        {/* Footer Action: Open Triage Log */}
        <div className="mt-5 pt-3 border-t border-[#f0f0f0]">
          <a
            href="#triage"
            className="w-full block bg-[#111214] hover:bg-black text-white font-semibold text-[13.5px] py-2.5 px-4 rounded-[4px] text-center transition-colors shadow-sm"
          >
            Open Triage Log →
          </a>
          <p className="text-center text-[11px] text-[#868686] mt-2">
            Direct deep link to Google Merchant Center item diagnostics
          </p>
        </div>
      </div>
    </div>
  );
}
