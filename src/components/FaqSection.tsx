'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "Why doesn't Google Merchant Center alert me immediately when products are disapproved?",
      answer:
        "Google Merchant Center default notifications are designed for periodic email digests that often send hours or days after a crawl failure occurs. Furthermore, Google does not proactively push real-time alerts to ad managers when individual product variants are disapproved. Unless you maintain a custom Google Cloud Pub/Sub subscription or log in manually every morning, disapprovals remain completely silent while ad spend continues flowing to non-converting variants.",
    },
    {
      question: 'Does Kultra ever modify my product feed or campaign settings?',
      answer:
        "No. Kultra requests Google Merchant API access exclusively for passive health monitoring, diagnostic reporting, and event subscription. Kultra's codebase does not modify, create, update, or delete your product feeds, prices, listings, or campaign settings, full stop. Every fix is executed by you, in one click, directly inside Shopify Admin or Google Merchant Center. Kultra only ever watches and reports.",
    },
    {
      question: 'What happens after my free trial ends?',
      answer:
        'Free for 14 days, no credit card required. After your trial ends, continue for $19/mo (Solo Merchant) or $49/mo (PPC Agency); cancel anytime before then and you will not be charged.',
    },
    {
      question: 'How does Kultra link directly to my specific Shopify product admin?',
      answer:
        'Kultra maps your Google Merchant Center product identifier (such as offer_id or channel ID) back to the canonical Shopify product and variant ID. When an incident is flagged, Kultra dynamically constructs a direct deep link (/admin/products/{id}) straight to the product editor in your Shopify Admin, saving media buyers from searching through thousands of catalog SKUs manually.',
    },
    {
      question: 'Does Kultra require a Shopify app installation or slow down storefront performance?',
      answer:
        'No. Kultra operates 100% out-of-band via Google APIs and server-side webhooks. We inject zero JavaScript, tracking pixels, or theme scripts into your Shopify storefront. Your store speed, Core Web Vitals, and checkout performance are completely unaffected.',
    },
    {
      question: "How does Kultra handle Google's migration from Content API to Merchant API v1?",
      answer:
        'Kultra was built natively on Google Merchant API v1 from day one. As Google sunsets Content API v2.1, Kultra utilizes the new modular Accounts, Products, and Notifications sub-APIs with native Cloud Pub/Sub push architecture, avoiding deprecated endpoints, batch quota limits, and polling throttles.',
    },
    {
      question: 'How quickly can I set up Kultra and begin receiving alerts?',
      answer:
        'Setup takes under 2 minutes. Authenticate your Google Merchant Center account with read-only OAuth, paste your Slack incoming webhook URL, and Kultra immediately synchronizes catalog health and streams real-time Pub/Sub push alerts.',
    },
  ];

  return (
    <section
      id="faq"
      className="relative w-full py-20 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >

      <div className="relative z-10 max-w-[860px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <span className="font-mono text-[11px] text-[var(--ghost-text)] tracking-[0.02em] block mb-2">
            Frequently asked questions
          </span>
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Everything you need to know about zero-downtime feed monitoring
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Architectural transparency, integration prerequisites, and instant onboarding workflows.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.question}
                className="rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bg-surface)] hover:border-[var(--hairline-strong)] transition-colors duration-120 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)]"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-medium text-[var(--ink-primary)] leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--ghost-text)] shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180 text-[var(--signal)]' : ''
                    }`}
                    strokeWidth={1.5}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-[13.5px] text-[var(--ink-secondary)] leading-[1.6] border-t border-[var(--hairline)]">
                    <p className="mt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
