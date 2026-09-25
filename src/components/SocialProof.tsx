'use client';

import React from 'react';
import { Zap, ShieldCheck, ExternalLink, Users, Check } from 'lucide-react';

interface OperationalCard {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  body: string;
  footerMetric: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export function SocialProof() {
  const cards: OperationalCard[] = [
    {
      id: 'detection-speed',
      badge: 'Real-Time Speed',
      title: 'Sub-30-Second Push Alerts',
      subtitle: 'Direct Cloud Event Triggers',
      body: 'Intercepts Google crawler rejection events the millisecond they occur. Bypasses the 24 to 48 hour delays of native Google email digests.',
      footerMetric: 'Sub-30s alert delivery',
      icon: Zap,
    },
    {
      id: 'store-safety',
      badge: 'Zero Storefront Code',
      title: '0% Site Speed Impact',
      subtitle: 'Out-of-Band Integration',
      body: 'Operates entirely outside your clients\' Shopify themes. No tracking scripts, no theme backups, and zero Core Web Vitals risk.',
      footerMetric: '0 KB storefront weight',
      icon: ShieldCheck,
    },
    {
      id: 'remediation',
      badge: 'Instant Triage',
      title: 'Direct Diagnostic Deep Links',
      subtitle: 'Google Merchant Center Links',
      body: 'Links media buyers directly to the offending SKU inside Google Merchant Center, highlighting the exact rejected attribute in seconds.',
      footerMetric: '1-click inspection',
      icon: ExternalLink,
    },
    {
      id: 'organization',
      badge: 'Agency Isolation',
      title: 'Client-Specific Slack Routing',
      subtitle: 'Dedicated Channels',
      body: 'Route Client A alerts to #client-a and Client B alerts to #client-b. Keeps client data strictly segregated across your entire agency roster.',
      footerMetric: 'Isolated per client',
      icon: Users,
    },
  ];

  return (
    <section
      id="integrations"
      className="relative w-full py-20 px-4 sm:px-6 z-10 border-t border-[var(--hairline)] bg-[var(--bg-canvas)] scroll-mt-16"
    >
      <div className="max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Engineered for Agency Reliability. Built for Speed.
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Passive, real-time Google Merchant Center monitoring with zero client store code, zero tracking pixels, and zero impact on site speed.
          </p>
        </div>

        {/* 4-Card Operational Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] p-5 sm:p-6 transition-colors duration-150 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Outline Icon + Operational Status Pill */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center shrink-0 text-[var(--signal)]">
                      <Icon className="w-4 h-4 text-[var(--signal)]" strokeWidth={1.5} />
                    </div>

                    <span className="tag-pill tag-ghost text-[10.5px]">
                      {card.badge}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-[15.5px] font-semibold text-[var(--ink-primary)] leading-snug">
                    {card.title}
                  </h3>

                  {/* Operational Subtitle */}
                  <div className="mt-1 font-mono text-[11px] text-[var(--ghost-text)]">
                    {card.subtitle}
                  </div>

                  {/* Body Copy */}
                  <p className="text-[13px] text-[var(--ink-secondary)] mt-3 leading-[1.55]">
                    {card.body}
                  </p>
                </div>

                {/* Footer Metric Bar */}
                <div className="mt-5 pt-3.5 border-t border-[var(--hairline)] flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-[var(--ghost-text-dim)]">Agency SLA</span>
                  <span className="font-medium text-[var(--signal)] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--signal)]" strokeWidth={2} />
                    <span>{card.footerMetric}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
