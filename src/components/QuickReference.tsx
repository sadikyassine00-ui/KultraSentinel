import React from 'react';

export function QuickReference() {
  return (
    <section
      id="quick-reference"
      aria-label="How It Protects Your Revenue"
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 z-10 border-t border-[var(--hairline)] bg-[var(--bg-canvas)]"
    >
      <div className="max-w-[1140px] mx-auto">
        {/* Section Header & Framing */}
        <div className="pb-10 border-b border-[var(--hairline)]">
          <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.04em] uppercase mb-3">
            HOW IT PROTECTS YOUR REVENUE
          </div>
          <h2 className="font-display font-semibold text-[1.75rem] sm:text-[2.25rem] md:text-[2.6rem] text-[var(--ink-primary)] leading-[1.2] max-w-[1040px] mb-4">
            Instant Slack Alerts Before Ad Spend Bleeds.
          </h2>
          <p className="font-body text-[14.5px] sm:text-[15.5px] text-[var(--ink-secondary)] leading-[1.65] max-w-[920px]">
            Kultra is a real-time Google Merchant Center watchdog built on the Google Content API and Cloud Pub/Sub, engineered to catch silent product disapprovals in under 30 seconds.
          </p>
        </div>

        {/* Problem versus Solution Comparison Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-[var(--hairline)]">
          {/* Left Column (The Status Quo: Without Kultra) */}
          <div className="py-10 lg:pr-12 lg:border-r border-[var(--hairline)] flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <span className="font-mono text-[11px] tracking-[0.03em] uppercase px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--hairline-strong)] text-[var(--ghost-text)] bg-transparent inline-block">
                  Without Kultra
                </span>
              </div>

              <h3 className="font-display text-[20px] sm:text-[22px] font-semibold text-[var(--ghost-heading)] leading-[1.3] mb-3">
                24-Hour Delayed Email Digests.
              </h3>

              <p className="font-body text-[14.5px] text-[var(--ghost-text)] leading-[1.6] mb-6">
                Default Google Merchant Center notifications rely on periodic email digests that arrive hours or days after a crawl failure. Products sit silently disapproved while shopping ad spend continues to bleed unnoticed.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--hairline)]">
              <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] uppercase tracking-[0.02em] mb-1">
                Cost of Inaction
              </div>
              <div className="font-mono text-[13.5px] text-[var(--ghost-heading)] leading-[1.5]">
                Saves e-commerce brands an average of 4 to 12 hours of unnoticed ad spend bleed per incident.
              </div>
            </div>
          </div>

          {/* Right Column (The Active Solution: With Kultra) */}
          <div
            className="py-10 lg:pl-12 flex flex-col justify-between relative"
            style={{
              background:
                'radial-gradient(ellipse at top right, var(--signal-wash) 0%, transparent 75%)',
            }}
          >
            <div>
              <div className="mb-4">
                <span className="font-mono text-[11px] tracking-[0.03em] uppercase px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--signal-dim)] text-[var(--signal)] bg-[var(--signal-wash)] inline-block">
                  With Kultra
                </span>
              </div>

              <h3 className="font-display text-[20px] sm:text-[22px] font-semibold text-[var(--ink-primary)] leading-[1.3] mb-3">
                Sub-30-Second Slack Notifications.
              </h3>

              <p className="font-body text-[14.5px] text-[var(--ink-secondary)] leading-[1.6] mb-6">
                Event-driven Cloud Pub/Sub push triggers immediately when policy changes or feed errors break a catalog SKU. Triage alerts with direct Shopify Admin fix links arrive before ad efficiency degrades.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--signal-dim)]">
              <div className="font-mono text-[11px] text-[var(--signal)] uppercase tracking-[0.02em] mb-1">
                Target Audience &amp; Eligibility
              </div>
              <p className="font-body text-[13.5px] text-[var(--ink-primary)] leading-[1.6]">
                Designed specifically for Shopify and WooCommerce merchants spending $5,000+ per month on Google Shopping, and PPC agencies managing 5 or more client catalogs.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Trust Footer */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-[12.5px] font-mono">
          <div>
            <span className="text-[var(--ink-primary)] font-medium block mb-1">
              Google Content API and Cloud Pub/Sub
            </span>
            <span className="text-[var(--ghost-text)] text-[12px] block leading-[1.5]">
              Real-time event hooks, zero delayed polling.
            </span>
          </div>
          <div>
            <span className="text-[var(--signal)] font-medium block mb-1">
              Sub-30s Event Dispatch
            </span>
            <span className="text-[var(--ghost-text)] text-[12px] block leading-[1.5]">
              Direct Slack alerts before ad spend degrades.
            </span>
          </div>
          <div>
            <span className="text-[var(--ink-primary)] font-medium block mb-1">
              Zero Scripts / Out-of-band
            </span>
            <span className="text-[var(--ghost-text)] text-[12px] block leading-[1.5]">
              100% cloud monitoring, zero storefront footprint or speed impact.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
