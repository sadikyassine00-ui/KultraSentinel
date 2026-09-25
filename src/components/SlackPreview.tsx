'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function SlackPreview() {
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  return (
    <section
      id="features"
      className="relative w-full py-20 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)] scroll-mt-16"
    >
      <div id="diagnostics" className="absolute -top-16" />
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            What Your Team Sees the Second an Item Breaks.
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Sub-30-second Slack notifications with the exact product title, rejected attribute, and a direct link to resolve the issue in Google Merchant Center.
          </p>
        </div>

        {/* Slack Notification Console Mockup */}
        <div className="max-w-[820px] mx-auto rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bg-surface)] overflow-hidden">
          {/* Channel Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-canvas)] border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--ink-primary)] font-medium">
                #client-shopping-alerts
              </span>
              <span className="font-mono text-[10.5px] text-[var(--ghost-text)] pl-2 border-l border-[var(--hairline)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-line)] shrink-0 inline-block" />
                Client retainer channel
              </span>
            </div>
            <span className="font-mono text-[10.5px] text-[var(--signal)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)] shrink-0 inline-block" />
              Active alert stream
            </span>
          </div>

          {/* Slack Message Body */}
          <div className="p-5 sm:p-6">
            {/* Bot Identity Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center shrink-0">
                <Image
                  src="/favicon-32x32.png"
                  alt="Kultra"
                  width={18}
                  height={18}
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-semibold text-[14px] text-[var(--ink-primary)]">Kultra Alerts</span>
                <span className="font-mono text-[10px] text-[var(--ghost-text-dim)] px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)]">
                  APP
                </span>
                <span className="font-mono text-[11px] text-[var(--ghost-text)]">10:42:18 UTC</span>
              </div>
            </div>

            {/* Attached Alert Card: Prominent red vertical accent border matching Slack Block Kit */}
            <div className="border-l-4 border-[var(--danger)] bg-[var(--bg-surface-2)] rounded-r-[var(--radius-sm)] p-5 border-y border-r border-[var(--hairline)]">
              {/* Diagnostic Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="tag-pill tag-danger text-[10.5px]">
                  Disapproval Detected
                </span>
                <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                  GMC Policy Violation
                </span>
              </div>

              {/* Product Metadata */}
              <div className="mb-4">
                <h3 className="text-[15px] font-semibold text-[var(--ink-primary)]">
                  Apex Waterproof Trail Runner / Carbon / 10.5
                </h3>
                <div className="mt-1 font-mono text-[11.5px] text-[var(--ghost-text)] space-x-3">
                  <span>SKU: APX-TR-402</span>
                  <span>ID: US-8492049182</span>
                  <span>Price: $168.00 USD</span>
                </div>
              </div>

              {/* Root Cause Diagnosis Box */}
              <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] mb-5 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[12px] font-medium text-[var(--ghost-text)]">
                    Root cause diagnosis
                  </span>
                  <code className="font-mono text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--hairline)] text-[var(--danger)]">
                    item_disapproved: promotional_overlay_image [image_link]
                  </code>
                </div>
                <p className="text-[13px] text-[var(--ink-primary)] leading-[1.5]">
                  Product image contains promotional text or badge overlay, violating Google Shopping image quality standards. Ads for this SKU were stopped immediately.
                </p>
              </div>

              {/* Single Primary Action Button with Informative Toast */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="btn-primary !rounded-[var(--radius-sm)] text-[12.5px] py-2 px-3.5 inline-flex items-center gap-1.5 cursor-pointer"
                  aria-label="View in Google Merchant Center Diagnostics preview action"
                >
                  <span>View in Google Merchant Center Diagnostics</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                {showToast && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-3 flex items-start sm:items-center gap-2.5 p-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--signal-dim)] text-[12px] text-[var(--ink-primary)]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal)] shrink-0 mt-1 sm:mt-0" aria-hidden="true" />
                    <span>Live alerts link directly to the specific SKU diagnostic panel inside Google Merchant Center.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
