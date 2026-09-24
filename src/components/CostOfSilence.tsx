'use client';

import React from 'react';

export function CostOfSilence() {
  const withoutSteps = [
    {
      time: 'Friday 8:00 PM',
      title: 'Silent disapproval flagged by Google bot',
      desc: 'Zero notifications sent. Ads for your client\'s top revenue generator stop serving immediately while daily budgets continue running.',
    },
    {
      time: 'Saturday 10:00 AM',
      title: 'Blind Smart Bidding budget reallocation',
      desc: 'Google Smart Bidding quietly diverts ad spend into low-converting secondary variants, bleeding cash and tanking account ROAS.',
    },
    {
      time: 'Monday 8:30 AM',
      title: 'Client notices weekend revenue drop',
      desc: 'The brand founder discovers cratered sales before your media buyers log on, firing off an urgent email threatening your retainer.',
    },
    {
      time: 'Monday 10:00 AM',
      title: 'Manual CSV lookup and diagnostic scans',
      desc: 'Media buyers waste the entire morning downloading feed spreadsheets to decode cryptic Google rejection strings.',
    },
  ];

  const withSteps = [
    {
      time: '0s',
      title: 'Google review flags attribute rejection',
      desc: 'Google automated systems flag a product attribute violation on your client\'s catalog.',
    },
    {
      time: '18s',
      title: 'Direct event trigger received by Kultra',
      desc: 'Diagnostic engine identifies the exact client account, SKU identifier, and specific policy reason.',
    },
    {
      time: '28s',
      title: 'Sub-30-second Slack alert to your team',
      desc: 'Your designated agency channel receives the SKU name, error code, and a direct link to Google Merchant Center diagnostics.',
    },
    {
      time: '3m',
      title: 'Proactive weekend fix completed',
      desc: 'Media buyer opens the Merchant Center diagnostic panel, resolves the offending attribute, and keeps client revenue intact.',
    },
  ];

  return (
    <section
      id="cost-of-silence"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header without eyebrow tag */}
        <div className="max-w-[760px] mb-12 sm:mb-14">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Google Disapprovals Strike on Friday Night. Your Clients Discover Them on Monday Morning.
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55] max-w-[65ch]">
            When an automated Google bot review silently flags a top-selling hero product over the weekend, ad spend does not pause. Google Smart Bidding reallocates daily budget to secondary non-converting variants, bleeding ad spend while your media buyers are off duty.
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
                The Default Reality: The Weekend Bleed
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--ghost-text)] leading-[1.5]">
                Silent disapprovals take down top SKUs without warning. Media buyers find out Monday morning from an angry client escalation.
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
                  <text x="20" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">Fri 8 PM</text>
                  <text x="120" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">Sat 10 AM</text>
                  <text x="270" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">Mon 8 AM</text>
                  <text x="420" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">Mon 10 AM</text>
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
                <span className="text-[12.5px] font-semibold text-[var(--ghost-text)] block mb-1.5">Client retainer at risk</span>
                <span className="font-mono text-[28px] sm:text-[32px] leading-[1.1] text-[var(--ghost-heading)] font-medium block">$2,500 to $7,500/mo</span>
              </div>
              <span className="tag-pill tag-ghost text-[10px]">
                Retainer at risk
              </span>
            </div>
          </div>

          {/* Card 2: Signal (Protected / Sub-30-Second Detection) */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--signal-dim)] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden"
               style={{ background: 'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 65%)' }}>
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="tag-pill tag-signal text-[10.5px]">
                  Protected
                </span>
                <span className="font-mono text-[11px] text-[var(--signal)]">
                  Sub-30s alert
                </span>
              </div>

              <h3 className="font-display text-[1.25rem] sm:text-[1.4rem] font-semibold text-[var(--ink-primary)]">
                The Kultra Shield: Instant Retainer Defense
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--ink-secondary)] leading-[1.5]">
                Sub-30-second Slack alerts and direct links to Google Merchant Center diagnostics resolve errors before spend is wasted.
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
                  <text x="160" y="80" fill="var(--ghost-text-dim)" fontSize="10" fontFamily="var(--font-mono)">28s (Alert)</text>
                  <text x="420" y="80" fill="var(--signal)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">100% Protected</text>
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
                <span className="text-[12.5px] font-semibold text-[var(--ink-secondary)] block mb-1.5">Protected client retainers</span>
                <span className="font-mono text-[28px] sm:text-[32px] leading-[1.1] text-[var(--signal)] font-medium block">100% Retained</span>
              </div>
              <span className="tag-pill tag-signal text-[10px]">
                Retainer safe
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
