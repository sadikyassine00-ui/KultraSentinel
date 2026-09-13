'use client';

import React from 'react';
import { Eye, Languages, ExternalLink, ArrowRight } from 'lucide-react';
import { SectionNetworkCanvas } from './SectionNetworkCanvas';

export function RemediationPipeline() {
  const steps = [
    {
      number: '01',
      badge: 'Step 01',
      title: 'Catch',
      icon: Eye,
      primary: 'We see the disapproval the second it happens, not hours later.',
      secondary:
        'Powered by Google Merchant API v1 and Cloud Pub/Sub push, under 30 seconds, zero polling lag.',
    },
    {
      number: '02',
      badge: 'Step 02',
      title: 'Translate',
      icon: Languages,
      primary: 'No more decoding cryptic Google error codes yourself.',
      secondary:
        'Our diagnostic engine converts strings like promotional_overlay_image or missing_gtin into a plain-English root cause and next action.',
    },
    {
      number: '03',
      badge: 'Step 03',
      title: 'Resolve',
      icon: ExternalLink,
      primary: 'Fix it in one click, without opening Merchant Center at all.',
      secondary:
        'A direct 1-click Shopify Admin deep link (/admin/products/{id}) takes you straight to the field that needs fixing.',
    },
  ];

  return (
    <section
      id="features"
      className="relative w-full py-24 px-4 sm:px-6 bg-[#0a0b1dff] border-t border-[#1E293B]/60 overflow-hidden"
    >
      {/* Ambient Sparse Network Mesh */}
      <SectionNetworkCanvas />

      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-14">
          <span className="text-[0.85rem] font-semibold text-[#10B981] block mb-2">
            The 3-Step Pipeline
          </span>
          <h2 className="text-[1.85rem] sm:text-[2.4rem] font-bold text-[#FDF4D2] leading-[1.18] tracking-[-0.01em]">
            Restore disapproved inventory in three simple steps
          </h2>
          <p className="mt-3 text-[1rem] text-[#94A3B8] leading-relaxed">
            Automated ingestion, intelligent error translation, and direct catalog deep links eliminate Google Merchant Center friction.
          </p>
        </div>

        {/* 3-Column Connected Horizontal Cards Layout with connecting line on desktop */}
        <div className="relative">
          {/* Connecting Line between cards on Desktop (Horizontal) */}
          <div
            className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-[#1E293B] via-[#334155] to-[#1E293B] z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="rounded-[6px] bg-[#0F1522] border border-[#1E293B] p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:border-[#334155] hover:-translate-y-0.5"
                >
                  <div>
                    {/* Step Indicator Header */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="w-10 h-10 rounded-[4px] bg-[#141C2B] border border-[#1E293B] flex items-center justify-center text-[#FDF4D2]">
                        <Icon className="w-5 h-5 text-[#FF788D]" strokeWidth={2} />
                      </div>
                      <span className="text-[0.8125rem] font-bold text-[#94A3B8] tracking-wider px-2.5 py-1 rounded-[3px] bg-[#141C2B] border border-[#1E293B]">
                        {step.badge}
                      </span>
                    </div>

                    {/* Step Title & Outcome-first Headline */}
                    <h3 className="text-[1.25rem] font-bold text-[#FDF4D2] tracking-tight">
                      {step.title}
                    </h3>

                    {/* Primary Line: Outcome-first, plain-language benefit */}
                    <p className="mt-3 text-[0.95rem] font-medium text-[#FDF4D2] leading-snug">
                      {step.primary}
                    </p>

                    {/* Secondary Line: Technical mechanism (smaller text, supporting proof) */}
                    <div className="mt-4 pt-3 border-t border-[#1E293B]/70">
                      <p className="text-[0.8125rem] text-[#94A3B8] leading-relaxed">
                        {step.secondary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-[0.75rem] font-semibold text-[#10B981]">
                    <span>Automated step</span>
                    <ArrowRight className="w-3 h-3 text-[#10B981]" strokeWidth={2} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
