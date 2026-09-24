'use client';

import React from 'react';
import { Eye, Languages, ExternalLink } from 'lucide-react';

export function RemediationPipeline() {
  const steps = [
    {
      title: 'Connect Agency Accounts',
      icon: Eye,
      primary: 'Authenticate via 1-click Google OAuth with read-only permissions.',
      secondary:
        'Kultra automatically indexes your associated Google Merchant Center IDs, sub-accounts, and multi-client aggregators without requiring developer access or storefront edits.',
    },
    {
      title: 'Route Notifications to Slack',
      icon: Languages,
      primary: 'Assign dedicated Slack channels per client retainer.',
      secondary:
        'Route Brand A alerts to #client-brand-a and Brand B alerts to #client-brand-b, keeping client data segregated while giving account leads centralized visibility.',
    },
    {
      title: 'Instant Diagnostic Triage',
      icon: ExternalLink,
      primary: 'Receive instant alerts with direct links to Google Merchant Center diagnostics.',
      secondary:
        'The moment a product is flagged, your channel receives the SKU name, error reason, and a direct link to the item diagnostic panel to fix it in minutes.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative w-full py-20 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div id="features" className="absolute -top-20 pointer-events-none" />
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header without eyebrow tag */}
        <div className="max-w-[760px] mb-12">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Protect Every Client Catalog in Under 2 Minutes.
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            A frictionless three-step setup built for boutique PPC agencies and media buyers.
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
                  <span>Zero Code Setup</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
