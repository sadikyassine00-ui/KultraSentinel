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
  icon: React.ReactNode;
}

export function SocialProof() {
  const integrations: Integration[] = [
    {
      id: 'pubsub',
      name: 'Google Cloud Pub/Sub',
      category: 'Push Ingest',
      endpoint: 'pubsub.googleapis.com/v1',
      desc: 'Intercepts crawler disapproval events via Cloud Pub/Sub push subscription, bypassing 4-6 hour batch cron delays.',
      protocol: 'Push QoS 1 Subscription',
      latency: '< 18s latency',
      icon: <Network className="w-5 h-5 text-[var(--ghost-text)] group-hover:text-[var(--signal)] transition-colors duration-120" strokeWidth={1.5} />,
    },
    {
      id: 'merchant',
      name: 'Google Merchant API v1',
      category: 'Catalog Protocol',
      endpoint: 'merchantapi.googleapis.com/v1',
      desc: 'Built natively on Google Merchant API v1 with Accounts, Products, and Notification sub-APIs for live catalog state.',
      protocol: 'Modular Sub-APIs',
      latency: 'Instant sync',
      icon: <ShieldCheck className="w-5 h-5 text-[var(--ghost-text)] group-hover:text-[var(--signal)] transition-colors duration-120" strokeWidth={1.5} />,
    },
    {
      id: 'shopify',
      name: 'Shopify Admin',
      category: 'Deep Links',
      endpoint: 'admin.shopify.com/products/{id}',
      desc: 'Maps GMC product identifiers to canonical Shopify variant IDs, directing media buyers straight to the offending field.',
      protocol: 'Bi-Directional Deep Link',
      latency: 'Direct edit',
      icon: <Layers className="w-5 h-5 text-[var(--ghost-text)] group-hover:text-[var(--signal)] transition-colors duration-120" strokeWidth={1.5} />,
    },
    {
      id: 'slack',
      name: 'Slack Telemetry',
      category: 'Incident Dispatch',
      endpoint: 'slack.com/api/chat.postMessage',
      desc: 'Store-level alerts with 30-day click impact calculation, plain-English diagnosis, and Shopify Admin action CTAs.',
      protocol: 'App Bot Paging',
      latency: 'Sub-30s paging',
      icon: <Terminal className="w-5 h-5 text-[var(--ghost-text)] group-hover:text-[var(--signal)] transition-colors duration-120" strokeWidth={1.5} />,
    },
  ];

  return (
    <section
      id="integrations"
      className="relative w-full py-20 px-4 sm:px-6 z-10 border-t border-[var(--hairline)] bg-[var(--bg-canvas)]"
    >
      <div className="max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Engineered for high-volume merchant stacks
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Kultra operates out-of-band via official Google and Shopify APIs. Zero theme scripts, zero tracking pixels, and zero impact on storefront page speed.
          </p>
        </div>

        {/* 4-Column Integration Cards (Ghost cards with hairline hover) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] p-5 transition-colors duration-150 flex flex-col justify-between"
            >
              <div>
                {/* Header: Outline Icon + Mono Category Tag */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>

                  <span className="tag-pill tag-ghost text-[10.5px]">
                    {item.category}
                  </span>
                </div>

                {/* Integration Name */}
                <h3 className="text-[15px] font-semibold text-[var(--ink-primary)] flex items-center justify-between">
                  <span>{item.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--ghost-text)] opacity-0 group-hover:opacity-100 transition-opacity duration-120" />
                </h3>

                {/* Technical Endpoint */}
                <div className="mt-1 font-mono text-[11px] text-[var(--ghost-text-dim)] truncate">
                  {item.endpoint}
                </div>

                {/* Description */}
                <p className="text-[13px] text-[var(--ink-secondary)] mt-3 leading-[1.5]">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Telemetry Spec Bar */}
              <div className="mt-5 pt-3.5 border-t border-[var(--hairline)] flex items-center justify-between gap-2 text-[11px] font-mono">
                <span className="text-[var(--ghost-text-dim)]">
                  {item.protocol}
                </span>
                <span className="text-[var(--signal)] font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 text-[var(--signal)]" strokeWidth={2} />
                  <span>{item.latency}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
