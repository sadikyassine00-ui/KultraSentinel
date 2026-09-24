'use client';

import React from 'react';
import { PRICING_TIERS } from '@/config/pricing';
import { PricingCard } from '@/components/billing/PricingCard';

interface PricingMatrixProps {
  onSelectPlan?: (plan: 'merchant' | 'agency') => void;
}

export function PricingMatrix({ onSelectPlan }: PricingMatrixProps) {
  return (
    <section
      id="pricing"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto flex flex-col items-center">
        {/* Section Header without eyebrow, centered */}
        <div className="max-w-[760px] mx-auto text-center mb-8">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Protect Thousands in Monthly Client Retainers.
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55] max-w-[620px] mx-auto">
            Flat monthly rates with unlimited SKUs. Zero percentage-of-ad-spend tax, no hidden overage fees, and no long-term contracts.
          </p>
        </div>

        {/* Retainer Defense Math Callout, centered */}
        <div className="max-w-[960px] mx-auto text-center mb-10">
          <p className="text-[15px] sm:text-[16px] text-[var(--ink-secondary)] leading-[1.6]">
            A single lost client retainer costs your agency <strong className="text-[var(--danger)] font-semibold">$30,000+ per year</strong>. Kultra Agency costs <strong className="text-[var(--signal)] font-semibold">$49 per month</strong>.
          </p>
        </div>

        {/* 2-Column Pricing Grid: Ghost vs Signal, centered */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[960px] w-full mx-auto items-stretch">
          <PricingCard
            tier={PRICING_TIERS.solo}
            action={{
              type: 'link',
              href: '/register?plan=merchant',
              onClick: () => onSelectPlan?.('merchant'),
              label: PRICING_TIERS.solo.ctaText,
            }}
          />

          <PricingCard
            tier={PRICING_TIERS.agency}
            action={{
              type: 'link',
              href: '/register?plan=agency',
              onClick: () => onSelectPlan?.('agency'),
              label: PRICING_TIERS.agency.ctaText,
            }}
          />
        </div>
      </div>
    </section>
  );
}
