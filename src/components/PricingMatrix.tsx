'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

interface PricingMatrixProps {
  onSelectPlan?: (plan: 'merchant' | 'agency') => void;
}

export function PricingMatrix({ onSelectPlan }: PricingMatrixProps) {
  return (
    <section
      id="pricing"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.02em] block mb-2">
            Pricing
          </span>
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Protect your advertising revenue for less than the cost of one wasted click
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Flat monthly rates with unlimited SKUs. Zero percentage-of-ad-spend tax, no hidden overage fees, and no long-term contracts.
          </p>
        </div>

        {/* Cost-of-Inaction Re-Anchor & Billing Transition Line (§B4 & §B6) */}
        <div className="max-w-[960px] mx-auto mb-8 text-center space-y-2.5">
          <p className="text-[14px] text-[var(--ink-secondary)]">
            One prevented disapproval covers <strong className="text-[var(--signal)] font-semibold">250 months</strong> of Solo Merchant pricing.
          </p>
          <div className="rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-3 text-center">
            <span className="text-[12.5px] text-[var(--ghost-text)]">
              Free for 14 days, no credit card required. After your trial ends, continue for $19/mo (Solo Merchant) or $99/mo (PPC Agency); cancel anytime before then and you will not be charged.
            </span>
          </div>
        </div>

        {/* 2-Column Pricing Grid: Ghost vs Signal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[960px] mx-auto items-stretch">
          {/* Plan 1: Solo Merchant (Ghost card) */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-150">
            <div>
              <div className="flex items-center justify-between gap-2.5 mb-3">
                <span className="font-mono text-[11px] text-[var(--ghost-text)]">
                  Direct-to-Consumer
                </span>
                <span className="tag-pill tag-ghost text-[10px]">
                  Single store
                </span>
              </div>

              <h3 className="font-display text-[1.4rem] font-semibold text-[var(--ink-primary)]">
                Solo Merchant
              </h3>
              <p className="text-[13px] text-[var(--ghost-text)] mt-1">
                For standalone Shopify brands scaling Google Shopping campaigns.
              </p>

              {/* Price */}
              <div className="mt-6 mb-6 pb-6 border-b border-[var(--hairline)]">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[2.5rem] font-medium text-[var(--ink-primary)] leading-none">
                    $19
                  </span>
                  <span className="font-mono text-[12px] text-[var(--ghost-text)]">/ month flat</span>
                </div>
                <div className="font-mono text-[12px] text-[var(--ghost-text)] mt-1.5">
                  Free for 14 days, then $19/mo
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 text-[13px] text-[var(--ink-secondary)]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--ghost-text)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong className="text-[var(--ink-primary)] font-medium">1 GMC Account ID</strong> connected</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--ghost-text)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong className="text-[var(--ink-primary)] font-medium">Unlimited SKUs</strong> monitored 24/7</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--ghost-text)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Real-time Cloud Pub/Sub push alerts (&lt; 30s)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--ghost-text)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Direct 1-click Shopify Admin deep links</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--ghost-text)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Instant Slack and email incident dispatch</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--ghost-text)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Root cause diagnosis translation engine</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-6 border-t border-[var(--hairline)]">
              <Link
                href="/register?plan=merchant"
                onClick={() => onSelectPlan?.('merchant')}
                className="btn-secondary w-full justify-center text-[13px] py-2.5 !rounded-[3px]"
              >
                Start free 14-day trial
              </Link>
            </div>
          </div>

          {/* Plan 2: PPC Agency (Signal card) */}
          <div
            className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--signal-dim)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 65%)' }}
          >
            <div>
              <div className="flex items-center justify-between gap-2.5 mb-3">
                <span className="font-mono text-[11px] text-[var(--signal)]">
                  Agency fleet
                </span>
                <span className="tag-pill tag-signal text-[10px]">
                  Recommended for agencies
                </span>
              </div>

              <h3 className="font-display text-[1.4rem] font-semibold text-[var(--ink-primary)]">
                PPC Agency
              </h3>
              <p className="text-[13px] text-[var(--ink-secondary)] mt-1">
                For boutique search agencies managing high-volume client catalogs.
              </p>

              {/* Price */}
              <div className="mt-6 mb-6 pb-6 border-b border-[var(--hairline)]">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[2.5rem] font-medium text-[var(--signal)] leading-none">
                    $99
                  </span>
                  <span className="font-mono text-[12px] text-[var(--ghost-text)]">/ month ($5/mo per extra account)</span>
                </div>
                <div className="font-mono text-[12px] text-[var(--signal)] mt-1.5">
                  Free for 14 days, then $99/mo
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 text-[13px] text-[var(--ink-secondary)]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong className="text-[var(--ink-primary)] font-medium">Up to 15 GMC Accounts</strong> included</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong className="text-[var(--ink-primary)] font-medium">Multi-tenant</strong> agency overview dashboard</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Client-specific Slack channel alert routing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Revenue-at-risk prioritization scoring</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>White-label incident diagnostic reports</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>Dedicated agency onboarding and custom webhooks</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-6 border-t border-[var(--hairline)]">
              <Link
                href="/register?plan=agency"
                onClick={() => onSelectPlan?.('agency')}
                className="btn-primary w-full justify-center text-[13px] py-2.5 !rounded-[3px]"
              >
                Start free 14-day trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
