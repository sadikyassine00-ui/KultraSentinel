'use client';

import React from 'react';
import { Cpu, Check, X, ArrowRight } from 'lucide-react';
import { SectionNetworkCanvas } from './SectionNetworkCanvas';

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
      detail: 'Deep link (/admin/products/{id}) routes media buyers directly to the rejected field.',
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
      className="relative w-full py-24 px-4 sm:px-6 bg-[#0a0b1dff] border-t border-[#1E293B]/60 overflow-hidden"
    >
      {/* Ambient Sparse Network Mesh */}
      <SectionNetworkCanvas />

      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-14">
          <span className="text-[0.85rem] font-semibold text-[#10B981] block mb-2">
            Technical Proof
          </span>
          <h2 className="text-[1.85rem] sm:text-[2.4rem] font-bold text-[#FDF4D2] leading-[1.18] tracking-[-0.01em]">
            Pub/Sub Event Streaming vs. Legacy Polling Architecture
          </h2>
          <p className="mt-3 text-[1rem] text-[#94A3B8] leading-relaxed">
            Why scheduled batch cron pollers and deprecated Content API scrapers fail high-volume Google Shopping catalogs.
          </p>
        </div>

        {/* Responsive Table: Desktop View */}
        <div className="hidden lg:block overflow-hidden rounded-[6px] border border-[#1E293B] bg-[#0F1522]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#141C2B]/60">
                <th className="py-4 px-6 text-[0.8125rem] font-semibold text-[#94A3B8] w-[28%]">
                  Architecture Metric
                </th>
                <th className="py-4 px-6 text-[0.8125rem] font-semibold text-[#94A3B8] w-[36%]">
                  <div className="flex items-center gap-2">
                    <span>Legacy Feed Tools (Batch Cron)</span>
                    <span className="text-[0.675rem] font-semibold px-2 py-0.5 rounded-[2px] bg-[#FF788D]/10 text-[#FF788D] border border-[#FF788D]/30">
                      Deprecated Pattern
                    </span>
                  </div>
                </th>
                <th className="py-4 px-6 text-[0.8125rem] font-semibold text-[#10B981] w-[36%] bg-[#10B981]/5 border-l border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <span>Kultra Sentinel Engine</span>
                    <span className="text-[0.675rem] font-semibold px-2 py-0.5 rounded-[2px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40">
                      Merchant API v1 Native
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {metrics.map((row) => (
                <tr key={row.title} className="hover:bg-[#141C2B]/50 transition-colors duration-150">
                  <td className="py-5 px-6 align-top">
                    <div className="font-semibold text-[0.95rem] text-[#FDF4D2]">
                      {row.title}
                    </div>
                    <div className="text-[0.75rem] text-[#94A3B8] mt-1 leading-normal">
                      {row.detail}
                    </div>
                  </td>
                  <td className="py-5 px-6 align-top">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-[2px] bg-[#FF788D]/15 text-[#FF788D] flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3" strokeWidth={2.5} />
                      </div>
                      <span className="text-[0.875rem] text-[#94A3B8] leading-snug">
                        {row.legacy}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 align-top bg-[#10B981]/5 border-l border-[#1E293B]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-[2px] bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                      </div>
                      <span className="text-[0.875rem] font-semibold text-[#FDF4D2] leading-snug">
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
              className="rounded-[6px] bg-[#0F1522] border border-[#1E293B] p-5 space-y-4"
            >
              <div>
                <span className="text-[0.75rem] font-semibold text-[#94A3B8] block mb-1">
                  Architecture Metric
                </span>
                <h3 className="text-[1.05rem] font-bold text-[#FDF4D2]">
                  {row.title}
                </h3>
                <p className="text-[0.75rem] text-[#94A3B8] mt-1">
                  {row.detail}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E293B] space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-[2px] bg-[#FF788D]/15 text-[#FF788D] flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-[0.7rem] text-[#94A3B8] block">Legacy Polling</span>
                    <span className="text-[0.8125rem] text-[#94A3B8]">{row.legacy}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#10B981]/10 p-2.5 rounded-[4px] border border-[#10B981]/20">
                  <div className="w-4 h-4 rounded-[2px] bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-[0.7rem] text-[#10B981] font-semibold block">Kultra Sentinel</span>
                    <span className="text-[0.8125rem] font-semibold text-[#FDF4D2]">{row.kultra}</span>
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
