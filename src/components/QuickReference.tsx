import React from 'react';

export function QuickReference() {
  return (
    <section
      id="quick-reference"
      aria-label="Quick Reference and System Architecture"
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 z-10 border-t border-[var(--hairline)] bg-[var(--bg-canvas)]"
    >
      <div className="max-w-[1140px] mx-auto">
        {/* Full-width System Definition */}
        <div className="pb-10 border-b border-[var(--hairline)]">
          <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.04em] uppercase mb-3">
            System Specification
          </div>
          <h2 className="font-display font-semibold text-[1.75rem] sm:text-[2.25rem] md:text-[2.6rem] text-[var(--ink-primary)] leading-[1.2] max-w-[1040px]">
            Kultra is a real-time Google Merchant Center disapproval monitoring service built on the Google Content API and Cloud Pub/Sub.
          </h2>
        </div>

        {/* Ghost vs Signal Architectural Duality Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-[var(--hairline)]">
          {/* Ghost: Dormant / Delayed / Before */}
          <div className="py-10 lg:pr-12 lg:border-r border-[var(--hairline)] flex flex-col justify-between">
            <div>
              <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.04em] uppercase mb-4">
                Ghost / Default Inactive State
              </div>

              <div className="text-[20px] sm:text-[22px] font-semibold text-[var(--ghost-heading)] leading-[1.3] mb-3">
                replaces 24-hour delayed daily email summaries
              </div>

              <p className="text-[14px] text-[var(--ghost-text)] leading-[1.6] mb-6">
                Default Google Merchant Center notifications rely on periodic email digests that arrive hours or days after a crawl failure. Products sit silently disapproved while shopping ad spend continues to bleed unnoticed.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--hairline)]">
              <div className="font-mono text-[11px] text-[var(--ghost-text-dim)] uppercase tracking-[0.02em] mb-1">
                Bleed Prevention Benchmark
              </div>
              <div className="text-[14px] font-mono text-[var(--ghost-heading)] leading-[1.5]">
                saves e-commerce brands an average of 4 to 12 hours of unnoticed ad spend bleed per incident.
              </div>
            </div>
          </div>

          {/* Signal: Active / Real-Time Watchdog / After */}
          <div
            className="py-10 lg:pl-12 flex flex-col justify-between relative"
            style={{
              background:
                'radial-gradient(ellipse at top right, var(--signal-wash) 0%, transparent 75%)',
            }}
          >
            <div>
              <div className="font-mono text-[11px] text-[var(--signal)] tracking-[0.04em] uppercase mb-4">
                Signal / Live Active Watchdog
              </div>

              <div className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink-primary)] leading-[1.3] mb-3">
                Sub-30-second Slack notifications
              </div>

              <p className="text-[14px] text-[var(--ink-secondary)] leading-[1.6] mb-6">
                Event-driven Cloud Pub/Sub push triggers immediately when policy changes or feed errors break a catalog SKU. Triage alerts with direct Shopify Admin fix links arrive before ad efficiency degrades.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--signal-dim)]">
              <div className="font-mono text-[11px] text-[var(--signal)] uppercase tracking-[0.02em] mb-1">
                Target Audience
              </div>
              <p className="text-[14px] text-[var(--ink-primary)] leading-[1.6]">
                Designed specifically for Shopify and WooCommerce merchants spending $5,000+ per month on Google Shopping, and PPC agencies managing 5 or more client catalogs.
              </p>
            </div>
          </div>
        </div>

        {/* Operational Telemetry Metadata Bar */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-[12px] font-mono">
          <div>
            <span className="text-[var(--ghost-text-dim)] block mb-1">Ingest Layer</span>
            <span className="text-[var(--ink-primary)]">Google Content API v1 &amp; Cloud Pub/Sub</span>
          </div>
          <div>
            <span className="text-[var(--ghost-text-dim)] block mb-1">Audit Latency</span>
            <span className="text-[var(--signal)]">Sub-30s Event Dispatch</span>
          </div>
          <div>
            <span className="text-[var(--ghost-text-dim)] block mb-1">Storefront Footprint</span>
            <span className="text-[var(--ink-primary)]">Zero Scripts / Out-of-band</span>
          </div>
        </div>
      </div>
    </section>
  );
}
