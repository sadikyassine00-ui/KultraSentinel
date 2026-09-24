'use client';

import React from 'react';
import { ArrowUpRight, Check, Network, Layers, ShieldCheck, Terminal } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  desc: string;
  protocol: string;
  latency: string;
  isLive: boolean;
  icon: (isLive: boolean) => React.ReactNode;
}

export function SocialProof() {
  const integrations: Integration[] = [
    {
      id: 'pubsub',
      name: 'Google Cloud Pub/Sub',
      category: 'Push ingest',
      endpoint: 'pubsub.googleapis.com/v1',
      desc: 'Intercepts crawler disapproval events via Cloud Pub/Sub push subscription, bypassing 4-6 hour batch cron delays.',
      protocol: 'Push QoS 1 subscription',
      latency: '< 18s latency',
      isLive: true,
      icon: (live) => (
        <Network
          className={`w-5 h-5 transition-colors duration-120 ${
            live ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'
          }`}
          strokeWidth={1.5}
        />
      ),
    },
    {
      id: 'merchant',
      name: 'Google Merchant API v1',
      category: 'Catalog protocol',
      endpoint: 'merchantapi.googleapis.com/v1',
      desc: 'Built natively on Google Merchant API v1 with Accounts, Products, and Notification sub-APIs for live catalog state.',
      protocol: 'Modular sub-APIs',
      latency: 'Instant sync',
      isLive: true,
      icon: (live) => (
        <ShieldCheck
          className={`w-5 h-5 transition-colors duration-120 ${
            live ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'
          }`}
          strokeWidth={1.5}
        />
      ),
    },
    {
      id: 'merchant-diagnostics',
      name: 'Merchant Center Diagnostics',
      category: 'Diagnostic links',
      endpoint: 'merchants.google.com/diagnostics',
      desc: 'Deep-links straight to the affected product in Google Merchant Center, highlighting the exact rejected attribute for instant triage.',
      protocol: 'Direct diagnostic link',
      latency: 'Instant triage',
      isLive: true,
      icon: (live) => (
        <Layers
          className={`w-5 h-5 transition-colors duration-120 ${
            live ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'
          }`}
          strokeWidth={1.5}
        />
      ),
    },
    {
      id: 'slack',
      name: 'Slack Telemetry',
      category: 'Incident dispatch',
      endpoint: 'slack.com/api/chat.postMessage',
      desc: 'Client-level alerts with 30-day click impact calculation, plain-English diagnosis, and direct Google Merchant Center diagnostic links.',
      protocol: 'App bot paging',
      latency: 'Sub-30s paging',
      isLive: true,
      icon: (live) => (
        <Terminal
          className={`w-5 h-5 transition-colors duration-120 ${
            live ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'
          }`}
          strokeWidth={1.5}
        />
      ),
    },
  ];

  return (
    <section
      id="integrations"
      className="relative w-full py-20 px-4 sm:px-6 z-10 border-t border-[var(--hairline)] bg-[var(--bg-canvas)]"
    >
      <div className="max-w-[1140px] mx-auto">
        {/* Section Header without eyebrow tag */}
        <div className="max-w-[760px] mb-12">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Engineered for high-volume merchant stacks
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Kultra connects directly via official Google Content APIs. Zero theme scripts, zero tracking pixels, and zero impact on storefront page speed.
          </p>
        </div>

        {/* 4-Column Integration Cards (Differentiated by live vs ghost state per §5 and A2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((item) => {
            const isLive = item.isLive;
            return (
              <div
                key={item.id}
                className={`group relative rounded-[var(--radius-md)] p-5 transition-colors duration-150 flex flex-col justify-between ${
                  isLive
                    ? 'border border-[var(--signal-dim)] hover:border-[var(--signal)]'
                    : 'bg-[var(--bg-surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)]'
                }`}
                style={
                  isLive
                    ? {
                        background:
                          'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 72%)',
                      }
                    : undefined
                }
              >
                <div>
                  {/* Header: Outline Icon + Mono Category Tag (§7, sentence case) */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 border ${
                        isLive
                          ? 'bg-[var(--bg-surface-2)] border-[var(--signal-dim)]'
                          : 'bg-[var(--bg-surface-2)] border-[var(--hairline)]'
                      }`}
                    >
                      {item.icon(isLive)}
                    </div>

                    <span
                      className={`tag-pill text-[10.5px] ${
                        isLive ? 'tag-signal' : 'tag-ghost'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Integration Name */}
                  <h3
                    className={`text-[15px] font-semibold flex items-center justify-between ${
                      isLive ? 'text-[var(--ink-primary)]' : 'text-[var(--ghost-heading)]'
                    }`}
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--ghost-text)] opacity-0 group-hover:opacity-100 transition-opacity duration-120" />
                  </h3>

                  {/* Technical Endpoint (High-contrast ghost-text per §13) */}
                  <div className="mt-1 font-mono text-[11px] text-[var(--ghost-text)] truncate">
                    {item.endpoint}
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-[var(--ink-secondary)] mt-3 leading-[1.5]">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Telemetry Spec Bar */}
                <div className="mt-5 pt-3.5 border-t border-[var(--hairline)] flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-[var(--ghost-text)]">
                    {item.protocol}
                  </span>
                  <span
                    className={`font-medium flex items-center gap-1 ${
                      isLive ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 ${
                        isLive ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'
                      }`}
                      strokeWidth={2}
                    />
                    <span>{item.latency}</span>
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
