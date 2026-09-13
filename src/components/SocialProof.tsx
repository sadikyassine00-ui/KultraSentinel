'use client';

import React from 'react';
import { ArrowUpRight, Check, Activity, ShieldCheck, Zap } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  desc: string;
  protocol: string;
  latency: string;
  status: string;
  accentColor: string;
  accentBorder: string;
  icon: React.ReactNode;
}

export function SocialProof() {
  const integrations: Integration[] = [
    {
      id: 'pubsub',
      name: 'Google Cloud Pub/Sub',
      category: 'Push Ingestion Stream',
      endpoint: 'pubsub.googleapis.com/v1',
      desc: 'Intercepts crawler disapproval events via Cloud Pub/Sub push subscription, bypassing 4-6 hour batch cron delays.',
      protocol: 'Push QoS 1 Subscription',
      latency: '< 18s E2E Latency',
      status: 'Active Egress',
      accentColor: '#4285F4',
      accentBorder: 'hover:border-[#4285F4]/50',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2 21,7.2 21,17.8 12,23 3,17.8 3,7.2" stroke="#4285F4" strokeWidth="1.5" fill="#4285F4" fillOpacity="0.12" />
          <circle cx="12" cy="12" r="3" fill="#4285F4" />
          <circle cx="12" cy="6.5" r="1.5" fill="#34A853" />
          <circle cx="16.5" cy="14.5" r="1.5" fill="#EA4335" />
          <circle cx="7.5" cy="14.5" r="1.5" fill="#FBBC05" />
          <line x1="12" y1="9" x2="12" y2="7.5" stroke="#4285F4" strokeWidth="1.2" />
          <line x1="14.5" y1="13.5" x2="15.5" y2="14" stroke="#4285F4" strokeWidth="1.2" />
          <line x1="9.5" y1="13.5" x2="8.5" y2="14" stroke="#4285F4" strokeWidth="1.2" />
        </svg>
      ),
    },
    {
      id: 'merchant',
      name: 'Google Merchant API v1',
      category: 'Catalog Engine Protocol',
      endpoint: 'merchantapi.googleapis.com/v1',
      desc: 'Built natively on Google Merchant API v1 with Accounts, Products, and Notification sub-APIs for live catalog state.',
      protocol: 'Modular Sub-APIs',
      latency: 'Instant Policy Sync',
      status: 'Active Egress',
      accentColor: '#34A853',
      accentBorder: 'hover:border-[#34A853]/50',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4Z" stroke="#1E293B" strokeWidth="1" fill="#141C2B" />
          <path d="M12 7V12L15.5 15.5" stroke="#4285F4" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M12 4C14.1 4 16 4.8 17.4 6.2" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
          <path d="M6.2 6.6C4.8 8 4 9.9 4 12" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 12C4 14.1 4.8 16 6.2 17.4" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
          <path d="M17.4 17.4C16 18.8 14.1 19.6 12 19.6" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'shopify',
      name: 'Shopify Admin',
      category: 'Remediation Deep Links',
      endpoint: 'admin.shopify.com/products/{id}',
      desc: 'Maps GMC product identifiers to canonical Shopify variant IDs, directing media buyers straight to the offending field.',
      protocol: 'Bi-Directional Admin Deep Link',
      latency: '1-Click Direct Edit',
      status: 'Active Egress',
      accentColor: '#96BF48',
      accentBorder: 'hover:border-[#96BF48]/50',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 6.5V5.5C16 3.6 14.4 2 12.5 2C10.6 2 9 3.6 9 5.5V6.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5.5 7.5L4 21H20L18.5 7.5H5.5Z" fill="#96BF48" />
          <path d="M5.5 7.5L4 21H8.5L9.5 7.5H5.5Z" fill="#5E8E3E" />
          <path d="M14.5 11.2C14 10.8 13.2 10.5 12.5 10.8C11.5 11.2 11.2 12.2 11.8 13C12.5 14 13.8 14.5 13.5 15.8C13.2 16.8 12.1 17.2 11.2 16.8" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'slack',
      name: 'Slack Telemetry',
      category: 'Incident Dispatch',
      endpoint: 'slack.com/api/chat.postMessage',
      desc: 'Dedicated store-level alerts with 30-day click impact calculation, plain-English diagnosis, and Shopify Admin action CTAs.',
      protocol: 'Dedicated App Bot Paging',
      latency: 'Sub-30s Incident Paging',
      status: 'Active Egress',
      accentColor: '#FF788D',
      accentBorder: 'hover:border-[#FF788D]/50',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="9.5" y="3.5" width="2" height="6.5" rx="1" fill="#36C5F0" />
          <circle cx="15.5" cy="4.5" r="1.25" fill="#36C5F0" />
          <rect x="14" y="9.5" width="6.5" height="2" rx="1" fill="#2EB67D" />
          <circle cx="19.5" cy="15.5" r="1.25" fill="#2EB67D" />
          <rect x="12.5" y="14" width="2" height="6.5" rx="1" fill="#E01E5A" />
          <circle cx="8.5" cy="19.5" r="1.25" fill="#E01E5A" />
          <rect x="3.5" y="12.5" width="6.5" height="2" rx="1" fill="#ECB22E" />
          <circle cx="4.5" cy="8.5" r="1.25" fill="#ECB22E" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="integrations"
      className="relative w-full py-20 px-4 sm:px-6 z-10 border-t border-[#1E293B]/80 bg-[#0a0b1dff]"
    >
      <div className="max-w-[1140px] mx-auto">
        {/* Clean, Grounded Section Header */}
        <div className="max-w-[760px] mb-12">
          <h2 className="text-[1.85rem] sm:text-[2.35rem] font-bold text-[#FDF4D2] leading-[1.18] tracking-[-0.01em]">
            Engineered for modern high-volume merchant stacks
          </h2>
          <p className="mt-3 text-[1rem] text-[#94A3B8] leading-relaxed">
            Kultra operates 100% out-of-band via official Google and Shopify APIs. Zero theme scripts, zero tracking pixels, and zero impact on storefront page speed.
          </p>
        </div>

        {/* 4-Column High-Precision Integration Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {integrations.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-[6px] bg-[#0F1522] border border-[#1E293B] ${item.accentBorder} p-6 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between`}
            >
              {/* Top Accent Line Highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[6px] transition-opacity duration-200 opacity-20 group-hover:opacity-100"
                style={{ backgroundColor: item.accentColor }}
              />

              <div>
                {/* Top Chrome Bar: Icon + Category Badge */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-10 h-10 rounded-[4px] bg-[#141C2B] border border-[#1E293B] group-hover:border-[#334155] flex items-center justify-center shrink-0 transition-colors duration-180">
                    {item.icon}
                  </div>

                  <span className="text-[0.725rem] font-medium text-[#94A3B8] px-2.5 py-1 rounded-[3px] bg-[#141C2B] border border-[#1E293B]">
                    {item.category}
                  </span>
                </div>

                {/* Integration Name & Subtle External Arrow */}
                <h3 className="text-[1.05rem] font-bold text-[#FDF4D2] flex items-center justify-between">
                  <span>{item.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#FDF4D2] transition-colors opacity-0 group-hover:opacity-100" />
                </h3>

                {/* Technical Endpoint / Route */}
                <div className="mt-1 text-[0.75rem] text-[#64748B] truncate">
                  {item.endpoint}
                </div>

                {/* Description */}
                <p className="text-[0.8125rem] text-[#94A3B8] mt-3 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Bottom Telemetry Spec Bar */}
              <div className="mt-6 pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-[0.75rem]">
                <span className="text-[#94A3B8] text-[0.75rem] px-2 py-0.5 rounded-[2px] bg-[#0a0b1dff] border border-[#1E293B] shrink-0">
                  {item.protocol}
                </span>
                <span className="text-[#10B981] font-semibold flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3 text-[#10B981]" strokeWidth={2.5} />
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
