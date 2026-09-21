'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface MetricRow {
  title: string;
  legacy: string;
  kultra: string;
  detail: string;
}

export function ArchitectureComparison() {
  const metrics: MetricRow[] = [
    {
      title: 'Detection Speed',
      legacy: '4 to 6 hour delays via batch cron pollers',
      kultra: 'Instant push under 30 seconds via Cloud Pub/Sub',
      detail: 'Eliminates blind downtime before Google Smart Bidding shifts ad budget to non-converting variants.',
    },
    {
      title: 'API Foundation',
      legacy: 'Content API v2.1 (deprecated, restrictive quotas)',
      kultra: 'Google Merchant API v1 + Google Cloud Pub/Sub',
      detail: 'Direct webhook subscription protocol with zero polling load or throttling risks.',
    },
    {
      title: 'Remediation Action',
      legacy: 'Raw code output requiring manual product search',
      kultra: 'Direct 1-click Shopify Admin deep link',
      detail: 'Deep link routes media buyers directly to the rejected field.',
    },
    {
      title: 'Revenue Urgency Context',
      legacy: 'Generic alert counts without revenue correlation',
      kultra: '30-day click count and revenue impact calculation',
      detail: 'Prioritizes high-converting bestsellers over zero-traffic long-tail accessories.',
    },
    {
      title: 'Delivery Routing',
      legacy: 'Periodic bulk email digest once per day',
      kultra: 'Dedicated store-level Slack channels and instant webhooks',
      detail: 'Alerts route directly to agency triage channels or client-specific workspaces in real time.',
    },
  ];

  return (
    <section
      id="architecture"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <span className="font-mono text-[11px] text-[var(--ghost-text)] tracking-[0.02em] block mb-2">
            Architecture comparison
          </span>
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Pub/Sub event streaming vs legacy polling
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Why scheduled batch cron pollers and deprecated Content API scrapers fail high-volume Google Shopping catalogs.
          </p>
        </div>

        {/* Responsive Table: Desktop View with overflow-x-auto per §16 and A5 */}
        <div className="hidden lg:block w-full overflow-x-auto rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bg-surface)]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--hairline)] bg-[var(--bg-surface-2)] font-mono text-[11px] text-[var(--ghost-text)]">
                <th className="py-3.5 px-6 w-[28%] font-normal">
                  Architecture metric
                </th>
                <th className="py-3.5 px-6 w-[36%] font-normal">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--ghost-text)]">Legacy feed tools (Batch cron)</span>
                    <span className="tag-pill tag-ghost text-[10.5px]">
                      Dormant
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-6 w-[36%] font-normal text-[var(--signal)] bg-[var(--signal-wash)] border-l border-[var(--hairline)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--ink-primary)] font-medium">Kultra Engine</span>
                    <span className="tag-pill tag-signal text-[10.5px]">
                      Merchant API v1
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)]">
              {metrics.map((row) => (
                <tr key={row.title} className="hover:bg-[var(--bg-surface-2)] transition-colors duration-120">
                  <td className="py-4 px-6 align-top">
                    <div className="font-medium text-[14px] text-[var(--ink-primary)]">
                      {row.title}
                    </div>
                    <div className="text-[12.5px] text-[var(--ghost-text)] mt-0.5 leading-[1.4]">
                      {row.detail}
                    </div>
                  </td>
                  <td className="py-4 px-6 align-top">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-[var(--radius-sm)] border border-[var(--ghost-line)] text-[var(--ghost-text)] flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3" strokeWidth={1.5} />
                      </div>
                      <span className="text-[13px] text-[var(--ghost-text)] leading-snug">
                        {row.legacy}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 align-top bg-[var(--signal-wash)] border-l border-[var(--hairline)]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-[var(--radius-sm)] border border-[var(--signal-dim)] text-[var(--signal)] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" strokeWidth={1.5} />
                      </div>
                      <span className="text-[13px] font-medium text-[var(--ink-primary)] leading-snug">
                        {row.kultra}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet View: Stacked Cards */}
        <div className="lg:hidden space-y-4">
          {metrics.map((row) => (
            <div
              key={row.title}
              className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-5 space-y-3"
            >
              <div>
                <span className="font-mono text-[10.5px] text-[var(--ghost-text-dim)] block mb-1">
                  Metric
                </span>
                <h3 className="text-[14.5px] font-semibold text-[var(--ink-primary)]">
                  {row.title}
                </h3>
                <p className="text-[12.5px] text-[var(--ghost-text)] mt-0.5">
                  {row.detail}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--hairline)] space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-[var(--radius-sm)] border border-[var(--ghost-line)] text-[var(--ghost-text)] flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[var(--ghost-text-dim)] block">Legacy polling</span>
                    <span className="text-[12.5px] text-[var(--ghost-text)]">{row.legacy}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[var(--signal-wash)] p-2.5 rounded-[var(--radius-sm)] border border-[var(--signal-dim)]">
                  <div className="w-4 h-4 rounded-[var(--radius-sm)] border border-[var(--signal-dim)] text-[var(--signal)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[var(--signal)] font-medium block">Kultra</span>
                    <span className="text-[12.5px] font-medium text-[var(--ink-primary)]">{row.kultra}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
