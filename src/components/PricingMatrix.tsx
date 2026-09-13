'use client';

import React from 'react';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { SectionNetworkCanvas } from './SectionNetworkCanvas';

interface PricingMatrixProps {
  onSelectPlan: (plan: 'merchant' | 'agency') => void;
}

export function PricingMatrix({ onSelectPlan }: PricingMatrixProps) {
  const handlePlanClick = (plan: 'merchant' | 'agency') => {
    onSelectPlan(plan);
    const formElement = document.getElementById('pilot-application') || document.getElementById('beta');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="pricing"
      className="relative w-full py-24 px-4 sm:px-6 bg-[#0a0b1dff] border-t border-[#1E293B]/60 overflow-hidden"
    >
      {/* Ambient Sparse Network Mesh */}
      <SectionNetworkCanvas />

      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <span className="text-[0.85rem] font-semibold text-[#10B981] block mb-2">
            Predictable Flat Pricing
          </span>
          <h2 className="text-[1.85rem] sm:text-[2.4rem] font-bold text-[#FDF4D2] leading-[1.18] tracking-[-0.01em]">
            Protect your advertising revenue for less than the cost of one wasted click
          </h2>
          <p className="mt-3 text-[1rem] text-[#94A3B8] leading-relaxed">
            Flat monthly rates with unlimited SKUs. Zero percentage-of-ad-spend tax, no hidden overage fees, and no long-term contracts.
          </p>
        </div>

        {/* Honest Founder Trust Line Above Grid */}
        <div className="max-w-[960px] mx-auto mb-10 rounded-[4px] bg-[#0F1522] border border-[#1E293B] p-4 text-center text-[0.85rem]">
          <span className="text-[#FDF4D2] font-medium">
            We are personally onboarding every pilot account this month: no automated queue.
          </span>
        </div>

        {/* 2-Column Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[960px] mx-auto items-stretch">
          {/* Plan 1: Solo Merchant */}
          <div className="rounded-[6px] bg-[#0F1522] border border-[#1E293B] p-5 sm:p-7 md:p-8 flex flex-col justify-between transition-all duration-200 hover:border-[#334155]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                <span className="text-[0.8125rem] font-bold text-[#94A3B8]">
                  Direct-to-Consumer
                </span>
                <span className="text-[0.75rem] text-[#94A3B8] px-2 py-0.5 rounded-[2px] bg-[#141C2B] border border-[#1E293B]">
                  Single Store
                </span>
              </div>

              <h3 className="text-[1.5rem] font-bold text-[#FDF4D2]">
                Solo Merchant
              </h3>
              <p className="text-[0.875rem] text-[#94A3B8] mt-1">
                For standalone Shopify brands scaling Google Shopping campaigns.
              </p>

              {/* Price */}
              <div className="mt-6 mb-6 pb-6 border-b border-[#1E293B] flex flex-wrap items-baseline gap-2">
                <span className="text-[2.6rem] font-bold text-[#FDF4D2] leading-none">
                  $19
                </span>
                <span className="text-[0.875rem] text-[#94A3B8]">/ month flat</span>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 text-[0.875rem] text-[#94A3B8]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span><strong className="text-[#FDF4D2]">1 GMC Account ID</strong> connected</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span><strong className="text-[#FDF4D2]">Unlimited SKUs</strong> monitored 24/7</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Real-time Cloud Pub/Sub push alerts (<strong className="text-[#FDF4D2]">&lt; 30s</strong>)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Direct 1-click Shopify Admin deep links</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Instant Slack and email incident dispatch</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Plain-English diagnostic translation engine</span>
                </li>
              </ul>
            </div>

            {/* CTA Button: Pre-selects 'merchant' */}
            <div className="mt-8 pt-6 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => handlePlanClick('merchant')}
                className="w-full py-3.5 px-5 rounded-[4px] bg-[#141C2B] hover:bg-[#1E293B] text-[#FDF4D2] hover:text-[#FF788D] border border-[#1E293B] hover:border-[#FF788D]/40 font-bold text-[0.925rem] transition-all duration-180 flex items-center justify-center gap-2"
              >
                <span>Apply for Merchant Pilot</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Plan 2: PPC Agency (Featured / Highlighted Card) */}
          <div className="rounded-[6px] bg-[#0F1522] border-2 border-[#FF788D] p-5 sm:p-7 md:p-8 flex flex-col justify-between relative transition-all duration-200">
            {/* Top Featured Pill Badge */}
            <div className="absolute -top-3.5 left-6 sm:left-8 px-3 py-1 rounded-[3px] bg-[#FF788D] text-[#0a0b1dff] text-[0.75rem] font-bold flex items-center shadow-none">
              <span>Most Popular for Boutique Agencies</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 mt-1 sm:mt-0">
                <span className="text-[0.8125rem] font-bold text-[#FF788D]">
                  Agency Fleet
                </span>
                <span className="text-[0.75rem] text-[#FF788D] px-2 py-0.5 rounded-[2px] bg-[#FF788D]/10 border border-[#FF788D]/30">
                  Multi-Client
                </span>
              </div>

              <h3 className="text-[1.5rem] font-bold text-[#FDF4D2]">
                PPC Agency
              </h3>
              <p className="text-[0.875rem] text-[#94A3B8] mt-1">
                For boutique search agencies managing high-volume client catalogs.
              </p>

              {/* Price */}
              <div className="mt-6 mb-6 pb-6 border-b border-[#1E293B] flex flex-wrap items-baseline gap-2">
                <span className="text-[2.6rem] font-bold text-[#FDF4D2] leading-none">
                  $99
                </span>
                <span className="text-[0.875rem] text-[#94A3B8]">/ month ($5/mo per extra account)</span>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 text-[0.875rem] text-[#94A3B8]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span><strong className="text-[#FDF4D2]">Up to 15 GMC Accounts</strong> included</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span><strong className="text-[#FDF4D2]">Unified multi-tenant</strong> agency overview dashboard</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Client-specific Slack channel alert routing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Revenue-at-risk prioritization scoring</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>White-label weekly incident diagnostic reports</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>Dedicated agency onboarding & custom webhook targets</span>
                </li>
              </ul>
            </div>

            {/* CTA Button: Pre-selects 'agency' */}
            <div className="mt-8 pt-6 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => handlePlanClick('agency')}
                className="w-full py-3.5 px-5 rounded-[4px] bg-[#FF788D] hover:bg-[#FF8FA2] text-[#0a0b1dff] font-bold text-[0.925rem] transition-all duration-180 flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                <span>Apply for Agency Pilot</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
