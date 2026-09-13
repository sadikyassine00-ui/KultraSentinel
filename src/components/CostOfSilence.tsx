'use client';

import React from 'react';
import { SectionNetworkCanvas } from './SectionNetworkCanvas';

export function CostOfSilence() {
  const withoutSteps = [
    {
      step: 'D1',
      title: 'Silent disapproval flagged by crawler',
      desc: 'Zero notifications dispatched. Paid ads for your top SKU stop serving instantly while campaign budgets continue running.',
    },
    {
      step: 'D2',
      title: 'Shopping impressions plummet on top SKUs',
      desc: 'Smart Bidding algorithms reallocate ad spend to low-converting secondary variants with lower ROAS.',
    },
    {
      step: 'D4',
      title: 'Merchant notices sudden drop in Shopify revenue',
      desc: 'Ecommerce director notices missed sales targets and flags lost conversions to the media team.',
    },
    {
      step: 'D5',
      title: 'Manual login to GMC and cryptic error lookup',
      desc: 'Media buyers comb through CSV exports to decode obscure crawler strings after ad momentum is already lost.',
    },
  ];

  const withSteps = [
    {
      step: '0s',
      title: 'Google crawl flags policy rejection',
      desc: 'The instant an attribute fails crawler validation, Google Cloud Pub/Sub publishes an event notification.',
    },
    {
      step: '18s',
      title: 'Pub/Sub push event received by Kultra',
      desc: 'Our streaming ingestion engine intercepts the payload, cross-references catalog historical revenue, and calculates sales urgency.',
    },
    {
      step: '24s',
      title: 'Instant Slack alert with plain-English diagnosis',
      desc: 'The assigned channel receives SKU details, 30-day revenue at risk, and exact root cause explanation.',
    },
    {
      step: '3m',
      title: 'One-click Shopify fix and automatic re-indexing',
      desc: 'Merchant clicks the direct Shopify Admin deep link, resolves the field, and Kultra pushes the updated catalog immediately.',
    },
  ];

  return (
    <section
      id="cost-of-silence"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[#0a0b1dff] border-t border-[#1E293B]/60 overflow-hidden"
    >
      {/* Ambient Sparse Network Mesh */}
      <SectionNetworkCanvas />

      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12 sm:mb-14">
          <span className="text-[0.85rem] font-semibold text-[#FF788D] block mb-2">
            The Cost of Silence
          </span>
          <h2 className="text-[1.85rem] sm:text-[2.4rem] font-bold text-[#FDF4D2] leading-[1.18] tracking-[-0.01em]">
            Silent disapprovals drain ad budgets before your team notices
          </h2>
          <p className="mt-3 text-[0.95rem] sm:text-[1rem] text-[#94A3B8] leading-relaxed max-w-[65ch]">
            When Google Merchant Center crawler policies reject a top-performing SKU, your shopping ads stop serving immediately while campaigns burn budget on secondary inventory.
          </p>
        </div>

        {/* 2-Column Fully Responsive Architecture Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Card 1: Without Kultra (The Silent Bleed) */}
          <div className="rounded-[6px] bg-[#0F1522] border-t-2 border-t-[#FF788D]/80 border-x border-b border-[#1E293B] hover:border-[#FF788D]/40 p-5 sm:p-7 md:p-8 flex flex-col justify-between transition-colors duration-200">
            <div>
              {/* Category & Status with Flex-Wrap to prevent collision */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                <span className="text-[0.75rem] font-semibold text-[#FF788D] px-2.5 py-1 rounded-[3px] bg-[#FF788D]/10 border border-[#FF788D]/25">
                  Without Kultra
                </span>
                <span className="text-[0.8rem] font-bold text-[#FF788D] bg-[#141C2B] px-2.5 py-1 rounded-[3px] border border-[#FF788D]/20">
                  112+ Hours Blindspot
                </span>
              </div>

              <h3 className="text-[1.3rem] sm:text-[1.45rem] font-bold text-[#FDF4D2] tracking-tight break-words">
                The 5-Day Silent Blindspot
              </h3>
              <p className="mt-2 text-[0.875rem] sm:text-[0.9rem] text-[#94A3B8] leading-relaxed break-words">
                When Google rejects a top-selling SKU, zero alerts are sent. Ad spend quietly burns on low-converting inventory.
              </p>

              {/* Minimalist Visual Graph: Traffic Plummet */}
              <div className="my-6 p-3.5 sm:p-4 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B]">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[0.75rem] mb-3">
                  <span className="text-[#94A3B8] font-medium">Top SKU Shopping Traffic</span>
                  <span className="text-[#FF788D] font-bold px-2 py-0.5 rounded-[2px] bg-[#FF788D]/10 border border-[#FF788D]/20">
                    100% → 0% Impressions
                  </span>
                </div>
                <svg viewBox="0 0 440 95" className="w-full h-auto overflow-hidden block" fill="none">
                  <style>{'text { font-family: "Satoshi", sans-serif; }'}</style>
                  <defs>
                    <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF788D" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#FF788D" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Hairline Grid Marks */}
                  <line x1="20" y1="20" x2="420" y2="20" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="20" y1="65" x2="420" y2="65" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* Area Fill */}
                  <path d="M 20 20 L 70 20 L 120 65 L 420 65 L 420 65 L 20 65 Z" fill="url(#dropGrad)" />
                  
                  {/* Trend Line */}
                  <path d="M 20 20 L 70 20 L 120 65 L 420 65" stroke="#FF788D" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Rejection Dot */}
                  <circle cx="70" cy="20" r="3.5" fill="#FF788D" />
                  <text x="70" y="11" fill="#FF788D" fontSize="9" fontWeight="600" textAnchor="middle">Disapproval</text>

                  {/* Day Markers with safe spacing */}
                  <text x="20" y="82" fill="#94A3B8" fontSize="9.5">Day 1</text>
                  <text x="120" y="82" fill="#94A3B8" fontSize="9.5">Day 2</text>
                  <text x="270" y="82" fill="#94A3B8" fontSize="9.5">Day 4</text>
                  <text x="420" y="82" fill="#FF788D" fontSize="9.5" textAnchor="end">Day 5 (Audit)</text>
                </svg>
              </div>

              {/* Connected Timeline Spine: zero text collision, disciplined structure */}
              <div className="pt-2">
                {withoutSteps.map((item, idx, arr) => (
                  <div key={item.step} className="flex items-start gap-3.5 relative">
                    <div className="flex flex-col items-center shrink-0 self-stretch">
                      <span className="text-[0.725rem] font-bold text-[#FF788D] bg-[#141C2B] border border-[#FF788D]/30 w-8 h-6 rounded-[2px] flex items-center justify-center shrink-0 z-10">
                        {item.step}
                      </span>
                      {idx !== arr.length - 1 && (
                        <div className="w-px flex-1 bg-[#1E293B] my-1" aria-hidden="true" />
                      )}
                    </div>
                    <div className={`min-w-0 flex-1 ${idx !== arr.length - 1 ? 'pb-4' : 'pb-1'}`}>
                      <h4 className="text-[0.875rem] font-semibold text-[#FDF4D2] leading-snug break-words">
                        {item.title}
                      </h4>
                      <p className="text-[0.8125rem] text-[#94A3B8] mt-1 leading-relaxed break-words">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Hero Metric: Stacks cleanly on narrow viewports */}
            <div className="mt-8 pt-5 border-t border-[#1E293B]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="text-[0.75rem] text-[#94A3B8] block mb-0.5">Average Revenue Lost per Incident</span>
                  <span className="text-[1.65rem] sm:text-[1.75rem] font-bold text-[#FF788D] leading-none break-words">$4,800+</span>
                </div>
                <span className="self-start sm:self-auto text-[0.75rem] text-[#FF788D] font-semibold bg-[#FF788D]/10 px-2.5 py-1 rounded-[3px] border border-[#FF788D]/25 whitespace-nowrap">
                  Ad Momentum: Zero
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: With Kultra Telemetry (Instant Remediation) */}
          <div className="rounded-[6px] bg-[#0F1522] border-t-2 border-t-[#10B981]/80 border-x border-b border-[#1E293B] hover:border-[#10B981]/60 p-5 sm:p-7 md:p-8 flex flex-col justify-between transition-colors duration-200">
            <div>
              {/* Category & Status with Flex-Wrap to prevent collision */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                <span className="text-[0.75rem] font-semibold text-[#10B981] px-2.5 py-1 rounded-[3px] bg-[#10B981]/10 border border-[#10B981]/25">
                  With Kultra Telemetry
                </span>
                <span className="text-[0.8rem] font-bold text-[#10B981] bg-[#141C2B] px-2.5 py-1 rounded-[3px] border border-[#10B981]/30">
                  Sub-30s Detection SLA
                </span>
              </div>

              <h3 className="text-[1.3rem] sm:text-[1.45rem] font-bold text-[#FDF4D2] tracking-tight break-words">
                Sub-3-Minute Incident Remediation
              </h3>
              <p className="mt-2 text-[0.875rem] sm:text-[0.9rem] text-[#94A3B8] leading-relaxed break-words">
                Direct Cloud Pub/Sub push alerts and 1-click Shopify deep links restore disapproved items before sales dip.
              </p>

              {/* Minimalist Visual Graph: Continuous Traffic Protection */}
              <div className="my-6 p-3.5 sm:p-4 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B]">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[0.75rem] mb-3">
                  <span className="text-[#94A3B8] font-medium">Catalog Traffic Protection</span>
                  <span className="text-[#10B981] font-bold px-2 py-0.5 rounded-[2px] bg-[#10B981]/10 border border-[#10B981]/30">
                    100% Active Continuity
                  </span>
                </div>
                <svg viewBox="0 0 440 95" className="w-full h-auto overflow-hidden block" fill="none">
                  <style>{'text { font-family: "Satoshi", sans-serif; }'}</style>
                  <defs>
                    <linearGradient id="steadyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Hairline Grid Marks */}
                  <line x1="20" y1="20" x2="420" y2="20" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="20" y1="65" x2="420" y2="65" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* Area Fill */}
                  <path d="M 20 20 L 90 20 L 110 32 L 130 20 L 420 20 L 420 65 L 20 65 Z" fill="url(#steadyGrad)" />
                  
                  {/* Steady Protected Line with 3-minute blip */}
                  <path d="M 20 20 L 90 20 L 110 32 L 130 20 L 420 20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Instant Recovery Blip Annotation */}
                  <circle cx="110" cy="32" r="3.5" fill="#10B981" />
                  <text x="110" y="48" fill="#10B981" fontSize="9" fontWeight="600" textAnchor="middle">&lt; 3m Fix</text>

                  {/* Milestone Labels with safe spacing */}
                  <text x="20" y="82" fill="#94A3B8" fontSize="9.5">0s (Event)</text>
                  <text x="160" y="82" fill="#94A3B8" fontSize="9.5">24s (Alert)</text>
                  <text x="420" y="82" fill="#10B981" fontSize="9.5" textAnchor="end">100% Rank Protected</text>
                </svg>
              </div>

              {/* Connected Timeline Spine: zero text collision, disciplined structure */}
              <div className="pt-2">
                {withSteps.map((item, idx, arr) => (
                  <div key={item.step} className="flex items-start gap-3.5 relative">
                    <div className="flex flex-col items-center shrink-0 self-stretch">
                      <span className="text-[0.725rem] font-bold text-[#10B981] bg-[#141C2B] border border-[#10B981]/30 w-8 h-6 rounded-[2px] flex items-center justify-center shrink-0 z-10">
                        {item.step}
                      </span>
                      {idx !== arr.length - 1 && (
                        <div className="w-px flex-1 bg-[#10B981]/25 my-1" aria-hidden="true" />
                      )}
                    </div>
                    <div className={`min-w-0 flex-1 ${idx !== arr.length - 1 ? 'pb-4' : 'pb-1'}`}>
                      <h4 className="text-[0.875rem] font-semibold text-[#FDF4D2] leading-snug break-words">
                        {item.title}
                      </h4>
                      <p className="text-[0.8125rem] text-[#94A3B8] mt-1 leading-relaxed break-words">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Hero Metric: Stacks cleanly on narrow viewports */}
            <div className="mt-8 pt-5 border-t border-[#1E293B]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="text-[0.75rem] text-[#94A3B8] block mb-0.5">Protected Ad Spend</span>
                  <span className="text-[1.65rem] sm:text-[1.75rem] font-bold text-[#10B981] leading-none break-words">$0.00 (Zero Downtime)</span>
                </div>
                <span className="self-start sm:self-auto text-[0.75rem] text-[#10B981] font-semibold bg-[#10B981]/10 px-2.5 py-1 rounded-[3px] border border-[#10B981]/25 whitespace-nowrap">
                  Search Rank: 100% Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

