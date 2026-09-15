'use client';

import React from 'react';
import { Eye, Languages, ExternalLink } from 'lucide-react';

export function RemediationPipeline() {
  const steps = [
    {
      title: 'Catch',
      icon: Eye,
      primary: 'We see the disapproval the second it happens, not hours later.',
      secondary:
        'Powered by Google Merchant API v1 and Cloud Pub/Sub push, under 30 seconds, zero polling lag.',
    },
    {
      title: 'Translate',
      icon: Languages,
      primary: 'No more decoding cryptic Google error codes yourself.',
      secondary:
        'Our diagnostic engine converts strings like promotional_overlay_image or missing_gtin into a plain-English root cause and next action.',
    },
    {
      title: 'Resolve',
      icon: ExternalLink,
      primary: 'Fix it in one click, without opening Merchant Center at all.',
      secondary:
        'A direct 1-click Shopify Admin deep link takes you straight to the field that needs fixing.',
    },
  ];

  return (
    <section
      id="features"
      className="relative w-full py-20 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.02em] block mb-2">
            Remediation pipeline
          </span>
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Restore disapproved inventory in three steps
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Automated ingestion, intelligent error translation, and direct catalog deep links eliminate Google Merchant Center friction.
          </p>
        </div>

        {/* 3 Steps Connected Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] p-6 flex flex-col justify-between transition-colors duration-150"
              >
                <div>
                  {/* Step Header: Outline Icon + Sequence Indicator */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center text-[var(--ink-primary)]">
                      <Icon className="w-4 h-4 text-[var(--ghost-text)]" strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                      Step {idx + 1}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-display text-[1.2rem] font-semibold text-[var(--ink-primary)]">
                    {step.title}
                  </h3>

                  {/* Primary Line */}
                  <p className="mt-2 text-[14px] text-[var(--ink-primary)] leading-[1.5]">
                    {step.primary}
                  </p>

                  {/* Secondary Line */}
                  <div className="mt-4 pt-3 border-t border-[var(--hairline)]">
                    <p className="text-[12.5px] text-[var(--ghost-text)] leading-[1.5]">
                      {step.secondary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--hairline)] flex items-center gap-1.5 font-mono text-[11px] text-[var(--signal)]">
                  <span>Automated</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
