'use client';

import React, { useState } from 'react';
import { ExternalLink, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

export function SlackPreview() {
  const [showRawPayload, setShowRawPayload] = useState(false);

  return (
    <section
      id="diagnostics"
      className="relative w-full py-20 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.02em] block mb-2">
            Incident dispatch
          </span>
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            The exact diagnostic your team receives before traffic burns
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Real-time incident dispatch with revenue impact metrics, direct Shopify remediation links, and raw protocol payload inspection.
          </p>
        </div>

        {/* Slack Notification Console Mockup */}
        <div className="max-w-[820px] mx-auto rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bg-surface)] overflow-hidden">
          {/* Channel Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-canvas)] border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--ink-primary)] font-medium">
                #alerts-google-merchant
              </span>
              <span className="font-mono text-[10.5px] text-[var(--ghost-text-dim)] pl-2 border-l border-[var(--hairline)]">
                Webhook active
              </span>
            </div>
            <span className="font-mono text-[10.5px] text-[var(--signal)]">
              Pub/Sub stream live
            </span>
          </div>

          {/* Slack Message Body */}
          <div className="p-5 sm:p-6">
            {/* Bot Identity Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center shrink-0">
                <Image
                  src="/favicon-32x32.png"
                  alt="Kultra"
                  width={18}
                  height={18}
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-semibold text-[14px] text-[var(--ink-primary)]">Kultra Bot</span>
                <span className="font-mono text-[10px] text-[var(--ghost-text-dim)] px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)]">
                  APP
                </span>
                <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">10:42:18 UTC</span>
              </div>
            </div>

            {/* Attached Alert Card: Left accent border */}
            <div className="border-l-2 border-[var(--danger)] bg-[var(--bg-surface-2)] rounded-r-[var(--radius-sm)] p-5 border-y border-r border-[var(--hairline)]">
              {/* Urgency Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="tag-pill tag-danger text-[10.5px]">
                  Bestseller disapproval
                </span>
                <span className="font-mono text-[11px] text-[var(--danger)]">
                  14,280 clicks / 30d at risk
                </span>
              </div>

              {/* Product Metadata */}
              <div className="mb-4">
                <h3 className="text-[15px] font-semibold text-[var(--ink-primary)]">
                  Apex Waterproof Trail Runner / Carbon / 10.5
                </h3>
                <div className="mt-1 font-mono text-[11.5px] text-[var(--ghost-text)] space-x-3">
                  <span>SKU: APX-TR-402</span>
                  <span>ID: US-8492049182</span>
                  <span>Price: $168.00 USD</span>
                </div>
              </div>

              {/* Plain-English Root Cause with Isolated Monospace Error String */}
              <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] mb-5 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[12px] font-medium text-[var(--ghost-text)]">
                    Root cause diagnosis
                  </span>
                  <code className="font-mono text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--hairline)] text-[var(--danger)]">
                    item_disapproved: promotional_overlay_image [image_link]
                  </code>
                </div>
                <p className="text-[13px] text-[var(--ink-primary)] leading-[1.5]">
                  Product image contains promotional text or badge overlay, violating Google Shopping image quality standards. Ads for this SKU were stopped immediately.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="https://admin.shopify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-[12.5px] py-2 px-3.5"
                >
                  <span>Edit in Shopify Admin</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                </a>

                <button
                  type="button"
                  onClick={() => setShowRawPayload(!showRawPayload)}
                  className="btn-secondary text-[12.5px] py-2 px-3.5"
                >
                  <Code2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Inspect raw payload</span>
                  {showRawPayload ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Raw Protocol Diagnostic Inspector */}
              {showRawPayload && (
                <div className="mt-4 pt-4 border-t border-[var(--hairline)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                      RAW_PAYLOAD
                    </span>
                    <span className="font-mono text-[10.5px] text-[var(--signal)]">200 OK</span>
                  </div>
                  <pre className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] font-mono text-[11.5px] text-[var(--ink-secondary)] overflow-x-auto leading-[1.6]">
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
