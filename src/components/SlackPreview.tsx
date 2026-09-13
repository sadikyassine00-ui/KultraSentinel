'use client';

import React, { useState } from 'react';
import { Bell, ExternalLink, Code2, AlertOctagon, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { SectionNetworkCanvas } from './SectionNetworkCanvas';

export function SlackPreview() {
  const [showRawPayload, setShowRawPayload] = useState(false);

  return (
    <section
      id="diagnostics"
      className="relative w-full py-24 px-4 sm:px-6 bg-[#0a0b1dff] border-t border-[#1E293B]/60 overflow-hidden"
    >
      {/* Ambient Sparse Network Mesh */}
      <SectionNetworkCanvas />

      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-14">
          <span className="text-[0.85rem] font-semibold text-[#FF788D] block mb-2">
            Live Slack Alert & Payload Preview
          </span>
          <h2 className="text-[1.85rem] sm:text-[2.4rem] font-bold text-[#FDF4D2] leading-[1.18] tracking-[-0.01em]">
            The exact diagnostic your team receives before traffic burns
          </h2>
          <p className="mt-3 text-[1rem] text-[#94A3B8] leading-relaxed">
            Real-time incident dispatch with revenue impact metrics, direct Shopify remediation links, and raw protocol payload inspection.
          </p>
        </div>

        {/* High-Fidelity Slack Notification Console Mockup */}
        <div className="max-w-[820px] mx-auto rounded-[6px] border border-[#1E293B] bg-[#0F1522] overflow-hidden shadow-none">
          {/* Slack Window Chrome */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0a0b1dff] border-b border-[#1E293B]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-[#0F1522] border border-[#1E293B]">
                <span className="text-[0.75rem] font-semibold text-[#FDF4D2]">
                  #alerts-google-merchant
                </span>
                <span className="text-[0.65rem] text-[#94A3B8] border-l border-[#1E293B] pl-2">
                  Live Feed Webhook
                </span>
              </div>
            </div>
            <span className="text-[0.725rem] text-[#94A3B8]">
              Pub/Sub Ingestion Stream Active
            </span>
          </div>

          {/* Slack Message Body */}
          <div className="p-5 sm:p-6">
            {/* Bot Identity Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-[4px] bg-[#141C2B] border border-[#1E293B] flex items-center justify-center shrink-0">
                <Image
                  src="/favicon-32x32.png"
                  alt="Kultra"
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-bold text-[0.95rem] text-[#FDF4D2]">Kultra Bot</span>
                <span className="text-[0.65rem] font-bold text-[#94A3B8] px-1.5 py-0.5 rounded-[2px] bg-[#141C2B] border border-[#1E293B]">
                  APP
                </span>
                <span className="text-[0.75rem] text-[#94A3B8]">10:42:18 AM</span>
              </div>
            </div>

            {/* Attached Alert Card: Left accent border */}
            <div className="border-l-4 border-[#FF788D] bg-[#141C2B] rounded-r-[6px] p-5 sm:p-6 border-y border-r border-[#1E293B]">
              {/* Urgency Badge: STATIC ONLY, NO PULSE, NO BLINKING */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-[#FF788D]/15 border border-[#FF788D]/40 text-[#FF788D] text-[0.8125rem] font-semibold">
                  <AlertOctagon className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Critical - High Bestseller Alert</span>
                </div>
                <div className="text-[0.75rem] font-semibold text-[#FF788D] bg-[#0F1522] px-2.5 py-1 rounded-[3px] border border-[#FF788D]/30">
                  14,280 clicks / 30d at risk
                </div>
              </div>

              {/* Product Metadata */}
              <div className="mb-4">
                <h3 className="text-[1.1rem] font-bold text-[#FDF4D2]">
                  Apex Waterproof Trail Runner - Carbon / 10.5
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-[#94A3B8]">
                  <span>SKU: SKU-APX-TR-402</span>
                  <span>|</span>
                  <span>Offer ID: US-8492049182</span>
                  <span>|</span>
                  <span>Price: $168.00 USD</span>
                </div>
              </div>

              {/* Plain-English Root Cause with Isolated Monospace Error String */}
              <div className="p-3.5 rounded-[4px] bg-[#0F1522] border border-[#1E293B] mb-5 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[0.75rem] font-semibold text-[#94A3B8] block">
                    Plain-English Root Cause
                  </span>
                  <code className="text-[0.725rem] px-2 py-0.5 rounded-[2px] bg-[#0a0b1dff] border border-[#1E293B] text-[#FF788D]">
                    item_disapproved: promotional_overlay_image [image_link]
                  </code>
                </div>
                <p className="text-[0.875rem] text-[#FDF4D2] leading-relaxed">
                  Product image contains promotional text or badge overlay, violating Google Shopping image quality standards. Ads for this SKU were stopped immediately.
                </p>
              </div>

              {/* Interactive CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Primary CTA: 1-Click Shopify Deep Link */}
                <a
                  href="https://admin.shopify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#FF788D] hover:bg-[#FF8FA2] text-[#0a0b1dff] font-bold text-[0.85rem] transition-all duration-180 hover:-translate-y-0.5"
                >
                  <span>Edit in Shopify Admin</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
                </a>

                {/* Secondary CTA: Inspect Raw Diagnostic Payload */}
                <button
                  type="button"
                  onClick={() => setShowRawPayload(!showRawPayload)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#0F1522] hover:bg-[#1E293B] text-[#FDF4D2] hover:text-[#FF788D] border border-[#1E293B] font-medium text-[0.85rem] transition-all duration-180"
                >
                  <Code2 className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Inspect Raw Google Payload</span>
                  {showRawPayload ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Raw Protocol Diagnostic Inspector */}
              {showRawPayload && (
                <div className="mt-5 pt-4 border-t border-[#1E293B]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.75rem] font-semibold text-[#94A3B8]">
                      Raw Google Protocol Diagnostic Payload
                    </span>
                    <span className="text-[0.7rem] text-[#10B981] font-semibold">200 OK</span>
                  </div>
                  <pre className="p-4 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B] text-[0.8125rem] text-[#FDF4D2] overflow-x-auto leading-relaxed">
{`{
  "event_type": "product_status_change",
  "feed_label": "US",
  "target_country": "US",
  "product_id": "shopify_US_8492049182_402",
  "item_issues": [
    {
      "code": "promotional_overlay_image",
      "severity": "disapproved",
      "attribute": "image_link",
      "raw_error": "item_disapproved: promotional_overlay_image [image_link]",
      "destination": "Shopping_ads",
      "detail": "Promotional text on image violates Google Shopping feed specification."
    }
  ],
  "pubsub_message_id": "9482019482018",
  "timestamp_utc": "2026-09-13T10:42:18.420Z"
}`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
