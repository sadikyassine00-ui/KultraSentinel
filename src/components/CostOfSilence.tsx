'use client';

import React from 'react';

export function CostOfSilence() {
  const withoutSteps = [
    {
      time: 'Day 1',
      title: 'Silent disapproval flagged by crawler',
      desc: 'Zero notifications dispatched. Paid ads for your top SKU stop serving instantly while campaign budgets continue running.',
    },
    {
      time: 'Day 2',
      title: 'Shopping impressions drop on top SKUs',
      desc: 'Smart Bidding algorithms reallocate ad spend to low-converting secondary variants with lower ROAS.',
    },
    {
      time: 'Day 4',
      title: 'Merchant notices drop in Shopify revenue',
      desc: 'Ecommerce director notices missed sales targets and flags lost conversions to the media team.',
    },
    {
      time: 'Day 5',
      title: 'Manual login to GMC and cryptic error lookup',
      desc: 'Media buyers comb through CSV exports to decode obscure crawler strings after ad momentum is already lost.',
    },
  ];

  const withSteps = [
    {
      time: '0s',
      title: 'Google crawl flags policy rejection',
      desc: 'The instant an attribute fails crawler validation, Google Cloud Pub/Sub publishes an event notification.',
    },
    {
      time: '18s',
      title: 'Pub/Sub push event received by Kultra',
      desc: 'Streaming ingestion engine intercepts the payload, cross-references catalog historical revenue, and calculates urgency.',
    },
    {
      time: '24s',
      title: 'Slack alert with root cause diagnosis',
      desc: 'The assigned channel receives SKU details, 30-day revenue at risk, and exact root cause explanation.',
    },
    {
      time: '3m',
      title: 'Shopify fix and catalog re-indexing',
      desc: 'Merchant opens the direct Shopify Admin deep link, resolves the field, and Kultra pushes the updated catalog immediately.',
    },
  ];

  return (
    <section
      id="cost-of-silence"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12 sm:mb-14">
          <span className="font-mono text-[11px] text-[var(--ghost-text)] tracking-[0.02em] block mb-2">
            The cost of silence
          </span>
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Silent disapprovals drain ad budgets before your team notices
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55] max-w-[65ch]">
            When Google Merchant Center crawler policies reject a top-performing SKU, your shopping ads stop serving immediately while campaigns burn budget on secondary inventory.
          </p>
        </div>

        {/* 2-Column Comparison: Ghost (Unmonitored) vs Signal (Protected) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Ghost (Unmonitored / The 5-Day Silent Blindspot) */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="tag-pill tag-ghost text-[10.5px]">
                  Unmonitored
                </span>
                <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                  112h blindspot
                </span>
              </div>

              <h3 className="font-display text-[1.25rem] sm:text-[1.4rem] font-semibold text-[var(--ghost-heading)]">
                The 5-day silent blindspot
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--ghost-text)] leading-[1.5]">
                When Google rejects a top-selling SKU, zero alerts are sent. Ad spend quietly burns on low-converting inventory.
              </p>

              {/* Minimalist Data Viz: Traffic Plummet (Ghost series per §8) */}
              <div className="my-6 p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ghost-text-dim)] mb-3">
                  <span>Top SKU impressions</span>
                  <span>100% to 0%</span>
                </div>
                <svg viewBox="0 0 440 90" className="w-full h-auto block" fill="none">
                  {/* Hairline Grid Marks */}
                  <line x1="20" y1="20" x2="420" y2="20" stroke="var(--hairline)" strokeWidth="1" />
                  <line x1="20" y1="65" x2="420" y2="65" stroke="var(--hairline)" strokeWidth="1" />
                  
                  {/* Straight segment line per §8 (Ghost stroke) */}
                  <path d="M 20 20 L 70 20 L 120 65 L 420 65" stroke="var(--ghost-text)" strokeWidth="2" strokeLinecap="square" />
                  
                  {/* Event mark (r: 3.5px) */}
                  <circle cx="70" cy="20" r="3.5" fill="var(--bg-canvas)" stroke="var(--ghost-text)" strokeWidth="1.5" />
                  <text x="70" y="12" fill="var(--ghost-text-dim)" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">Disapproval</text>

                  {/* Axis Labels in mono-sm */}
                  <text x="20" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">Day 1</text>
                  <text x="120" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">Day 2</text>
                  <text x="270" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">Day 4</text>
                  <text x="420" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">Day 5 (Audit)</text>
                </svg>
              </div>

              {/* Connected Vertical Timeline per §9 */}
              <div className="pt-2">
                {withoutSteps.map((item, idx, arr) => (
                  <div key={item.time} className="flex items-start gap-4 relative">
                    <div className="flex flex-col items-center shrink-0 self-stretch">
                      {/* 9px dot marker */}
                      <div className="w-[9px] h-[9px] rounded-full bg-[var(--bg-canvas)] border-[1.5px] border-[var(--ghost-line)] shrink-0 mt-1" />
                      {idx !== arr.length - 1 && (
                        <div className="w-px flex-1 bg-[var(--ghost-line)] my-1" aria-hidden="true" />
                      )}
                    </div>
                    <div className={`min-w-0 flex-1 ${idx !== arr.length - 1 ? 'pb-4' : 'pb-1'}`}>
                      <div className="font-mono text-[10.5px] text-[var(--ghost-text-dim)] mb-0.5">
                        {item.time}
                      </div>
                      <h4 className="text-[13.5px] font-semibold text-[var(--ghost-heading)] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[12.5px] text-[var(--ghost-text)] mt-0.5 leading-[1.5]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom KPI Metric (--text-mono-xl per §16 and A3) */}
            <div className="mt-6 pt-4 border-t border-[var(--hairline)] flex items-end justify-between gap-3">
              <div>
                <span className="text-[12.5px] font-semibold text-[var(--ghost-text)] block mb-1.5">Average lost revenue per incident</span>
                <span className="font-mono text-[32px] leading-[1.1] text-[var(--ghost-heading)] font-medium block">$4,800+</span>
              </div>
              <span className="tag-pill tag-ghost text-[10px]">
                Momentum lost
              </span>
            </div>
          </div>

          {/* Card 2: Signal (Protected / Sub-3-Minute Remediation) */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--signal-dim)] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden"
               style={{ background: 'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 65%)' }}>
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="tag-pill tag-signal text-[10.5px]">
                  Protected
                </span>
                <span className="font-mono text-[11px] text-[var(--signal)]">
                  Sub-30s SLA
                </span>
              </div>

              <h3 className="font-display text-[1.25rem] sm:text-[1.4rem] font-semibold text-[var(--ink-primary)]">
                Sub-3-minute incident remediation
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--ink-secondary)] leading-[1.5]">
                Direct Cloud Pub/Sub push alerts and 1-click Shopify deep links restore disapproved items before sales dip.
              </p>

              {/* Minimalist Data Viz: Continuous Continuity (Signal series per §8) */}
              <div className="my-6 p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ghost-text-dim)] mb-3">
                  <span>Catalog traffic protection</span>
                  <span className="text-[var(--signal)]">100% active</span>
                </div>
                <svg viewBox="0 0 440 90" className="w-full h-auto block" fill="none">
                  {/* Hairline Grid Marks */}
                  <line x1="20" y1="20" x2="420" y2="20" stroke="var(--hairline)" strokeWidth="1" />
                  <line x1="20" y1="65" x2="420" y2="65" stroke="var(--hairline)" strokeWidth="1" />
                  
                  {/* Straight segment line per §8 (Signal stroke) */}
                  <path d="M 20 20 L 90 20 L 110 32 L 130 20 L 420 20" stroke="var(--signal)" strokeWidth="2" strokeLinecap="square" />
                  
                  {/* Instant recovery blip mark (r: 3.5px) */}
                  <circle cx="110" cy="32" r="3.5" fill="var(--bg-canvas)" stroke="var(--signal)" strokeWidth="1.5" />
                  <text x="110" y="46" fill="var(--signal)" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">&lt; 3m fix</text>

                  {/* Milestone Labels in mono-sm */}
                  <text x="20" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">0s (Event)</text>
                  <text x="160" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">24s (Alert)</text>
                  <text x="420" y="80" fill="var(--signal)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">100% Rank</text>
                </svg>
              </div>

              {/* Connected Vertical Timeline per §9 */}
              <div className="pt-2">
                {withSteps.map((item, idx, arr) => (
                  <div key={item.time} className="flex items-start gap-4 relative">
                    <div className="flex flex-col items-center shrink-0 self-stretch">
                      {/* 9px dot marker with signal accent */}
                      <div className="w-[9px] h-[9px] rounded-full bg-[var(--bg-canvas)] border-[1.5px] border-[var(--signal)] shrink-0 mt-1" />
                      {idx !== arr.length - 1 && (
                        <div className="w-px flex-1 bg-[var(--signal-dim)] my-1" aria-hidden="true" />
                      )}
                    </div>
                    <div className={`min-w-0 flex-1 ${idx !== arr.length - 1 ? 'pb-4' : 'pb-1'}`}>
                      <div className="font-mono text-[10.5px] text-[var(--signal)] mb-0.5">
                        {item.time}
                      </div>
                      <h4 className="text-[13.5px] font-semibold text-[var(--ink-primary)] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[12.5px] text-[var(--ink-secondary)] mt-0.5 leading-[1.5]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom KPI Metric (--text-mono-xl per §16 and A3) */}
            <div className="mt-6 pt-4 border-t border-[var(--hairline)] flex items-end justify-between gap-3">
              <div>
                <span className="text-[12.5px] font-semibold text-[var(--ink-secondary)] block mb-1.5">Protected ad spend</span>
                <span className="font-mono text-[32px] leading-[1.1] text-[var(--signal)] font-medium block">$0.00 downtime</span>
              </div>
              <span className="tag-pill tag-signal text-[10px]">
                Continuous
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
