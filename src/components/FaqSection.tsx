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
      question: 'Does Kultra ever modify our client product feeds, pricing, or campaign budgets?',
      answer:
        'No. Kultra operates strictly on passive read-only access. Our software cannot edit your product titles, alter prices, adjust Google Ads campaign bids, or modify feed rules. Kultra acts purely as an automated diagnostic watchdog that detects errors and alerts your media buyers in Slack. All remediations are performed directly by your team inside Google Merchant Center or your store admin.',
    },
    {
      question: 'Why do our feed management apps (Simprosys, Feedonomics, DataFeedWatch) fail to catch these disapprovals?',
      answer:
        'Feed management apps are built to sync catalog data into Google Merchant Center, but their job ends once the upload succeeds. Google automated crawlers and machine learning policy filters continuously inspect live product landing pages hours or days after the feed sync. When Google flags an editorial mismatch, promotional phrase violation, or missing identifier on a live URL, your feed tool reports "Feed Synced 100%," while Google has already disapproved the SKU. Kultra watches Google Merchant Center directly to catch the post-crawl rejection your feed tool never sees.',
    },
    {
      question: 'What Google permissions does Kultra require, and how is client data protected?',
      answer:
        'Initial account login uses basic identity permissions (openid, email, profile) to authenticate your team. When you connect client accounts, Kultra requests access to the Google Content API strictly to read product statuses, disapproval reasons, and account issue notifications. Kultra never accesses your Google Ads bidding data, payment methods, or unrelated Google Workspace documents. Your client data is encrypted at rest using AES-256-GCM and is never sold, shared, or used for AI training.',
    },
    {
      question: 'How does the alert direct media buyers to the exact issue?',
      answer:
        'When a product attribute violation occurs, Kultra constructs a direct deep link straight to the specific item diagnostic panel inside Google Merchant Center. Your media buyer clicks the link in Slack and opens the exact offending SKU and policy rejection reason in one second, bypassing manual CSV exports or catalog searches.',
    },
    {
      question: 'Will connecting multiple client accounts slow down alerts or hit Google API rate limits?',
      answer:
        'No. Kultra is built on Google event-driven push architecture rather than periodic cron polling. Instead of running heavy batch API queries that trigger rate limits, Google automatically pushes notifications to Kultra the moment a product status changes. Whether your agency manages 2 client stores or 5, alert delivery remains consistently under 30 seconds with zero API quota exhaustion.',
    },
    {
      question: 'When does the 14-day free trial start, and how does cancellation work?',
      answer:
        'Your 14-day evaluation clock does not begin at email registration. It starts strictly upon the successful connection of your first Google Merchant Center account. If you sign up today and connect your first client account on Friday, your full 14 days start on Friday. No credit card is required to begin. You can cancel anytime with a single click inside your dashboard billing settings without phone calls, cancellation fees, or retention hurdles.',
    },
  ];

  return (
    <section
      id="faq"
      className="relative w-full py-20 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)] scroll-mt-16"
    >
      <div className="relative z-10 max-w-[860px] mx-auto">
        {/* Section Header without eyebrow tag */}
        <div className="max-w-[760px] mb-12">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Technical integrity, data privacy guarantees, and agency onboarding details.
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
