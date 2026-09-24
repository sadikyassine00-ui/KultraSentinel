'use client';

import React from 'react';
import { Zap, ShieldCheck, Users } from 'lucide-react';

export function ArchitectureComparison() {
  const capabilities = [
    {
      icon: Zap,
      title: 'Sub-30-Second Detection Speed',
      headline: 'Catch disapprovals before weekend ad spend burns.',
      description:
        'Google automated review systems audit product landing pages non-stop, including late Friday nights. Kultra captures rejection events the instant Google flags them, pushing actionable Slack alerts to your team in under 30 seconds so media buyers can correct issues before ad spend bleeds.',
      metric: '< 30s Alert Delivery',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Storefront Footprint',
      headline: 'Zero code on client sites with 0% speed risk.',
      description:
        'Never request client developer access, create theme backups, or install heavy tracking snippets. Kultra operates 100% cloud-side via direct Google API integration, adding zero bytes to client storefronts and zero risk to client Core Web Vitals or conversion rates.',
      metric: '0.00ms Store Latency',
    },
    {
      icon: Users,
      title: 'Multi-Client Agency Coverage',
      headline: 'One unified dashboard, dedicated client Slack channels.',
      description:
        'Stop logging into 15 different Google Merchant Center accounts every morning just to check feed health tabs. Monitor your entire agency portfolio from a single dashboard and route client alerts to isolated, client-specific Slack channels.',
      metric: 'Up to 5 GMC Accounts',
    },
  ];

  return (
    <section
      id="capabilities"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header without eyebrow tag */}
        <div className="max-w-[760px] mb-12 sm:mb-14">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Three Operational Advantages Engineered for High-Volume Media Buyers.
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            How Kultra translates event-driven monitoring into reliable retainer protection for boutique PPC agencies.
          </p>
        </div>

        {/* 3 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] p-6 sm:p-7 flex flex-col justify-between transition-colors duration-150"
              >
                <div>
                  <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center text-[var(--signal)] mb-5">
                    <Icon className="w-5 h-5 text-[var(--signal)]" strokeWidth={1.5} />
                  </div>

                  <span className="font-mono text-[11px] text-[var(--ghost-text)] tracking-[0.02em] block mb-1">
                    {cap.title}
                  </span>

                  <h3 className="font-display text-[1.2rem] font-semibold text-[var(--ink-primary)] leading-[1.3] mb-3">
                    {cap.headline}
                  </h3>

                  <p className="text-[13.5px] text-[var(--ink-secondary)] leading-[1.6]">
                    {cap.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--hairline)] flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[var(--ghost-text-dim)]">Agency SLA</span>
                  <span className="text-[var(--signal)] font-medium">{cap.metric}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
