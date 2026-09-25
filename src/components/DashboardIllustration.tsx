'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function DashboardIllustration() {
  const [activeToastCard, setActiveToastCard] = useState<'left' | 'right' | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleActionClick = (e: React.MouseEvent, card: 'left' | 'right') => {
    e.preventDefault();
    setActiveToastCard(card);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setActiveToastCard(null);
    }, 6000);
  };

  const renderToast = () => (
    <div
      role="status"
      aria-live="polite"
      className="mt-3 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--signal-dim)] text-[12px] text-[var(--ink-primary)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)] shrink-0" aria-hidden="true" />
        <span>In live alerts, this button opens the exact SKU diagnostic panel inside Google Merchant Center.</span>
      </div>
      <Link
        href="/register"
        className="text-[var(--signal)] hover:underline whitespace-nowrap font-medium inline-flex items-center gap-1 shrink-0"
      >
        <span>Start 14-day trial</span>
        <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
      </Link>
    </div>
  );

  return (
    <div className="relative w-full bg-transparent flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 lg:gap-8 xl:gap-10 select-none">
      {/* ============================================================ */}
      {/* 1. LEFT ELEMENT: DETECTION ENGINE TRIAGE CARD                */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[540px] xl:w-[560px] bg-[var(--bg-surface)] border border-[var(--danger)] rounded-[var(--radius-md)] p-5 sm:p-6 flex flex-col justify-between text-left relative shrink-0">
        <div>
          {/* Card Header: Triage Status Badges */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--hairline)]">
            {/* Status Indicator: Disapproval Detected */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(214,69,69,0.1)] border border-[var(--danger)] text-[var(--danger)] font-mono text-[10.5px] sm:text-[11px] font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[var(--danger)]" />
              Disapproval Detected
            </span>

            {/* Amber Indicator: Captured in under 1s */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(242,169,59,0.08)] border border-[var(--signal-dim)] text-[var(--signal)] font-mono text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
              Captured in under 1s
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
                SKU: OW-8842-BLK-M
              </span>
              <h3 className="font-display font-semibold text-[17px] sm:text-[18px] text-[var(--ink-primary)] leading-snug mt-0.5 truncate">
                Alpine Expedition Anorak
              </h3>
              <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5 truncate">
                Variant: Slate Black / Medium · Price: $148.00 USD
              </p>
              <p className="font-mono text-[11px] text-[var(--ghost-text-dim)] mt-0.5">
                Offer ID: US-8492049182
              </p>
            </div>
          </div>

          {/* Status Breakdown: Catalog Status & Destination */}
          <div className="bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-sm)] p-3 sm:p-3.5 my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[11px] text-[var(--ghost-text)] block">Catalog Status</span>
              <span className="font-mono font-medium text-[13.5px] sm:text-[14px] text-[var(--danger)]">
                Disapproved
              </span>
            </div>
            <div className="hidden sm:block w-[1px] h-8 bg-[var(--hairline)]" />
            <div>
              <span className="text-[11px] text-[var(--ghost-text)] block">Destination</span>
              <span className="font-mono font-medium text-[13.5px] sm:text-[14px] text-[var(--danger)]">
                Shopping Ads Suspended
              </span>
            </div>
          </div>

          {/* Policy Error Box & Active Laser Scanning Interception */}
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--ghost-text)] tracking-wider">
                Google Policy Rejection
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

        {/* Action Button: Single Outlined Button */}
        <div className="mt-6 pt-4 border-t border-[var(--hairline)]">
          <button
            type="button"
            onClick={(e) => handleActionClick(e, 'left')}
            className="btn-secondary !rounded-[var(--radius-sm)] text-[13px] py-2.5 px-4 font-semibold inline-flex items-center justify-center gap-2 w-full text-center cursor-pointer"
          >
            <span>Inspect in Merchant Center</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--ghost-text)]" strokeWidth={1.5} />
          </button>
          {activeToastCard === 'left' && renderToast()}
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
      {/* 3. RIGHT ELEMENT: SLACK NOTIFICATION SIMULATION CARD          */}
      {/* Dark theme visual hierarchy matching the rest of Kultra       */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[460px] xl:w-[480px] bg-[var(--bg-surface)] text-[var(--ink-primary)] rounded-[var(--radius-md)] p-5 sm:p-6 border border-[var(--hairline)] flex flex-col justify-between text-left relative shrink-0">
        <div>
          {/* Slack Channel Ribbon */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--hairline)]">
            <span className="font-semibold flex items-center gap-1.5 text-[13px] text-[var(--ink-primary)]">
              <span className="text-[var(--ghost-text)] font-mono">#</span>
              <span>client-feed-alerts</span>
            </span>
            <span className="font-mono text-[10.5px] font-medium text-[var(--signal)] bg-[var(--signal-wash)] border border-[var(--signal-dim)] px-2 py-0.5 rounded-[var(--radius-pill)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)]" />
              Live Dispatch · 0.28s
            </span>
          </div>

          {/* Slack App Identity */}
          <div className="flex items-center gap-3 pt-3">
            {/* Kultra Alerts Avatar */}
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center shrink-0">
              <Image
                src="/favicon-32x32.png"
                alt="Kultra"
                width={18}
                height={18}
                className="w-4 h-4 object-contain"
              />
            </div>

            {/* App Name & Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[14px] text-[var(--ink-primary)]">Kultra Alerts</span>
              <span className="bg-[var(--bg-surface-2)] border border-[var(--hairline)] text-[var(--ghost-text-dim)] text-[10px] font-bold px-1.5 py-0.5 rounded-[var(--radius-sm)] font-mono">
                APP
              </span>
              <span className="text-[var(--ghost-text)] text-[11px] font-mono">12:04 PM</span>
            </div>
          </div>

          {/* Slack Block Notification Box with Red Left Accent */}
          <div className="mt-3.5 border-l-4 border-[var(--danger)] bg-[var(--bg-surface-2)] p-4 rounded-r-[var(--radius-sm)] space-y-2 text-left border-y border-r border-[var(--hairline)]">
            {/* Headline */}
            <div className="font-semibold text-[14.5px] text-[var(--ink-primary)] flex items-center gap-2">
              <span className="text-[var(--danger)]">🚨</span>
              <span>Critical Disapproval Detected</span>
            </div>

            <div className="pt-2 border-t border-[var(--hairline)] space-y-1.5 text-[12.5px] sm:text-[13px]">
              <div>
                <span className="text-[var(--ghost-text)]">Merchant ID:</span>{' '}
                <span className="font-mono font-medium text-[var(--ink-primary)]">4918374</span>
              </div>
              <div>
                <span className="text-[var(--ghost-text)]">Item:</span>{' '}
                <span className="font-medium text-[var(--ink-primary)]">OW-8842-BLK-M (Alpine Expedition Anorak)</span>
              </div>
              <div>
                <span className="text-[var(--ghost-text)]">Variant:</span>{' '}
                <span className="text-[var(--ink-secondary)]">Slate Black / Medium · $148.00 USD</span>
              </div>
              <div>
                <span className="text-[var(--ghost-text)]">Error:</span>{' '}
                <span className="text-[var(--danger)] font-medium">Missing GTIN barcode. Google crawler rejected feed.</span>
              </div>
            </div>

            {/* Impact Pill */}
            <div className="bg-[rgba(214,69,69,0.08)] border border-[rgba(214,69,69,0.25)] text-[var(--danger)] font-mono text-[11px] font-medium px-2.5 py-1.5 rounded-[var(--radius-sm)] mt-2">
              Impact: Ads for this SKU stopped serving across active campaigns.
            </div>
          </div>
        </div>

        {/* Footer Action: View in Google Merchant Center */}
        <div className="mt-5 pt-3 border-t border-[var(--hairline)]">
          <button
            type="button"
            onClick={(e) => handleActionClick(e, 'right')}
            className="btn-primary !rounded-[var(--radius-sm)] w-full py-2.5 px-4 font-semibold text-[13px] text-center inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>View in Google Merchant Center</span>
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <p className="text-center text-[11px] text-[var(--ghost-text-dim)] mt-2 font-mono">
            Direct link to Google Merchant Center item diagnostics
          </p>
          {activeToastCard === 'right' && renderToast()}
        </div>
      </div>
    </div>
  );
}
