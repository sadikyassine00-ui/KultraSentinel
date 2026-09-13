'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { SectionNetworkCanvas } from './SectionNetworkCanvas';

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
      question: 'How does Kultra link directly to my specific Shopify product admin?',
      answer:
        "Kultra maps your Google Merchant Center product identifier (such as offer_id or channel ID) back to the canonical Shopify product and variant ID. When an incident is flagged, Kultra dynamically constructs a direct deep link (/admin/products/{id}) straight to the product editor in your Shopify Admin, saving media buyers from searching through thousands of catalog SKUs manually.",
    },
    {
      question: 'Does Kultra require a Shopify app installation or slow down storefront performance?',
      answer:
        "No. Kultra operates 100% out-of-band via Google APIs and server-side webhooks. We inject zero JavaScript, tracking pixels, or theme scripts into your Shopify storefront. Your store speed, Core Web Vitals, and checkout performance are completely unaffected.",
    },
    {
      question: "How does Kultra handle Google's migration from Content API to Merchant API v1?",
      answer:
        "Kultra was built natively on Google Merchant API v1 from day one. As Google sunsets Content API v2.1, Kultra utilizes the new modular Accounts, Products, and Notifications sub-APIs with native Cloud Pub/Sub push architecture, avoiding deprecated endpoints, batch quota limits, and polling throttles.",
    },
    {
      question: 'What happens during the pilot? How fast do I get access after applying?',
      answer:
        "We personally review and onboard pilot accounts within 24 hours of submission. During your scheduled 15-minute onboarding session, we assist you in connecting your Google Merchant Center Cloud Pub/Sub push notification topic and designated Slack channel, run an instant comprehensive diagnostic audit of your live feed, and confirm real-time alert delivery immediately.",
    },
  ];

  // JSON-LD Schema for rich search snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kultra',
        operatingSystem: 'Web-based cloud telemetry',
        applicationCategory: 'BusinessApplication',
        offers: {
          '@type': 'Offer',
          price: '19.00',
          priceCurrency: 'USD',
        },
        description:
          "Instant alerts before policy changes kill your bestselling Google Merchant ads. Kultra catches Google Merchant Center product disapprovals via real-time Pub/Sub push events.",
      },
    ],
  };

  return (
    <section
      id="faq"
      className="relative w-full py-24 px-4 sm:px-6 bg-[#0a0b1dff] border-t border-[#1E293B]/60 overflow-hidden"
    >
      {/* Ambient Sparse Network Mesh */}
      <SectionNetworkCanvas />

      {/* Embedded JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative z-10 max-w-[860px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-14">
          <span className="text-[0.85rem] font-semibold text-[#10B981] block mb-2">
            Frequently Asked Questions
          </span>
          <h2 className="text-[1.85rem] sm:text-[2.4rem] font-bold text-[#FDF4D2] leading-[1.18] tracking-[-0.01em]">
            Everything you need to know about zero-downtime feed monitoring
          </h2>
          <p className="mt-3 text-[1rem] text-[#94A3B8] leading-relaxed">
            Architectural transparency, integration prerequisites, and pilot onboarding timelines.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.question}
                className="rounded-[6px] border border-[#1E293B] bg-[#0F1522] transition-colors duration-180 hover:border-[#334155] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF788D]"
                  aria-expanded={isOpen}
                >
                  <span className="text-[1rem] sm:text-[1.05rem] font-semibold text-[#FDF4D2] leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#10B981]' : ''
                    }`}
                    strokeWidth={2}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-1 text-[0.875rem] sm:text-[0.925rem] text-[#94A3B8] leading-relaxed border-t border-[#1E293B]/60">
                    <p className="mt-3 pl-0">{faq.answer}</p>
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
