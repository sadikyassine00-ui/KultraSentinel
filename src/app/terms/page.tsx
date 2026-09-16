import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, AlertTriangle, ShieldCheck, Scale, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Kultra — Google Merchant Center Telemetry',
  description:
    'Terms of Service governing the use of Kultra (usekultra.com) SaaS catalog monitoring, diagnostic telemetry, and alerting services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f1ea] font-sans selection:bg-[#7a5a26] selection:text-[#f4f1ea]">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 h-14 bg-[#0a0b0d]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] flex items-center">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] rounded-[3px]"
              aria-label="Kultra Homepage"
            >
              <Image
                src="/assets/logos/kultraLogo-trimmed.png"
                alt="Kultra"
                width={110}
                height={22}
                className="h-[22px] w-auto object-contain brightness-105"
                priority
              />
            </Link>
            <span className="hidden sm:inline-block text-[#45484f] font-mono text-xs">/</span>
            <span className="hidden sm:inline-block text-[#6b7078] font-mono text-xs">Terms of Service</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[rgba(255,255,255,0.14)] bg-transparent text-[#b9b3a5] hover:text-[#f4f1ea] hover:border-[#7a5a26] transition-colors text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Legal Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Header Title Section */}
        <div className="space-y-4 border-b border-[rgba(255,255,255,0.08)] pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[100px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.02)] text-[#b9b3a5] text-[11px] font-mono tracking-[0.02em]">
            <FileText className="w-3.5 h-3.5 text-[#f2a93b]" />
            <span>SaaS Commercial Terms & Conditions</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-[#f4f1ea] tracking-tight">
            Terms of Service
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6b7078]">
            <span>Entity: Kultra Inc. (usekultra.com)</span>
            <span>•</span>
            <span>Effective Date: September 16, 2026</span>
            <span>•</span>
            <span>Last Updated: September 2026</span>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-3">
          <h2 className="text-xs font-mono text-[#6b7078] tracking-[0.02em]">
            Terms Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#b9b3a5]">
            <a href="#acceptance" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              1. Acceptance of Terms & Service Scope
            </a>
            <a href="#third-party" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              2. Third-Party Dependency & Affiliation Disclaimer
            </a>
            <a href="#no-guarantee" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              3. No Guarantee of Ad Spend or Approval
            </a>
            <a href="#accounts" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              4. Merchant Authority & Acceptable Use
            </a>
            <a href="#subscriptions" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              5. Subscriptions, Invoicing & Cancellations
            </a>
            <a href="#intellectual-property" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              6. Intellectual Property & Customer Feeds
            </a>
            <a href="#liability" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              7. Limitation of Liability
            </a>
            <a href="#governing-law" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              8. Governing Law & Dispute Resolution
            </a>
          </div>
        </nav>

        {/* SECTION 1 */}
        <section id="acceptance" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            1. Acceptance of Terms & Service Scope
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Customer&quot;, &quot;you&quot;, or &quot;your&quot;)
            and Kultra Inc. (&quot;Kultra&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) regarding your access to and use of{' '}
            <a href="https://www.usekultra.com" className="text-[#f4f1ea] underline underline-offset-4">
              https://www.usekultra.com
            </a>{' '}
            and associated automated monitoring and notification services (the &quot;Service&quot;).
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra provides real-time automated telemetry and diagnostic notification software for Google Merchant Center
            accounts, enabling merchants and advertising agencies to receive alerts when products are disapproved, restricted,
            or affected by policy violations.
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            By registering an account, connecting a Google Merchant Center store, or using the Service, you confirm that you
            have read, understood, and agree to be bound by these Terms and our Privacy Policy.
          </p>
        </section>

        {/* SECTION 2 - THIRD PARTY DISCLAIMER */}
        <section id="third-party" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            2. Third-Party Dependency & Affiliation Disclaimer
          </h2>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs tracking-wide">
              <Scale className="w-4 h-4" />
              <span>INDEPENDENT PROVIDER DISCLAIMER</span>
            </div>
            <p className="text-[14.5px] leading-[1.65] text-[#f4f1ea] font-medium">
              Kultra is an independent monitoring tool and is not affiliated with, endorsed by, sponsored by, or operated by
              Google LLC, Alphabet Inc., Shopify Inc., or Slack Technologies.
            </p>
            <p className="text-xs text-[#b9b3a5] leading-[1.5]">
              Google Merchant Center, Google Shopping, Google Cloud, Shopify, and Slack are registered trademarks of their
              respective owners. Kultra utilizes official public APIs (such as the Google Content API for Shopping) in compliance
              with third-party terms of service and developer guidelines.
            </p>
          </div>
        </section>

        {/* SECTION 3 - NO GUARANTEE OF APPROVAL */}
        <section id="no-guarantee" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            3. No Guarantee of Ad Spend, Ranking, or Product Re-Approval
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra functions strictly as an operational monitoring, diagnostics, and notification mechanism. You acknowledge
            and agree that:
          </p>

          <ul className="list-disc list-inside space-y-2.5 text-[14px] text-[#b9b3a5] pl-2">
            <li>
              <strong className="text-[#f4f1ea]">Observation Only:</strong> Kultra reads and surfaces disapproval states as reported
              by Google&apos;s Content API for Shopping and Cloud Pub/Sub events. Kultra does not alter, write, overwrite, or edit your
              product catalog feed data, campaign settings, bids, or pricing.
            </li>
            <li>
              <strong className="text-[#f4f1ea]">No Approval Guarantee:</strong> Resolving product issues reported by Kultra does not
              guarantee that Google&apos;s automated review algorithms or human policy teams will re-approve your products or reinstate
              suspended accounts.
            </li>
            <li>
              <strong className="text-[#f4f1ea]">No Advertising Performance Guarantee:</strong> Kultra makes no representations or
              guarantees regarding Google Ads performance, return on ad spend (ROAS), click-through rates, impression volumes, or sales conversions.
            </li>
            <li>
              <strong className="text-[#f4f1ea]">Merchant Feed Responsibility:</strong> You retain sole legal responsibility for the
              accuracy, legality, pricing, and compliance of your product catalog feeds with Google Shopping Policies and applicable consumer protection laws.
            </li>
          </ul>
        </section>

        {/* SECTION 4 - ACCEPTABLE USE */}
        <section id="accounts" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            4. Merchant Authority & Acceptable Use
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            To access and use the Service, you represent and warrant that:
          </p>

          <div className="space-y-2 text-[14px] text-[#b9b3a5]">
            <p>
              (a) You are at least 18 years old and possess the legal capacity to enter into binding agreements on behalf of yourself or the entity you represent;
            </p>
            <p>
              (b) You hold lawful ownership, administrative authority, or explicit client authorization to grant OAuth access to the Google Merchant Center accounts you connect;
            </p>
            <p>
              (c) You will not use the Service for any unlawful purpose, to transmit malicious software, or to attempt unauthorized access to other tenant workspaces;
            </p>
            <p>
              (d) You will not reverse engineer, decompile, disassemble, or derive the source code of Kultra&apos;s proprietary telemetry pipeline or dispatch workers.
            </p>
          </div>
        </section>

        {/* SECTION 5 - BILLING & CANCELLATIONS */}
        <section id="subscriptions" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            5. Subscriptions, Invoicing & Cancellations
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra offers recurring subscription tiers (including Solo Merchant and PPC Agency plans) as published on our
            pricing page.
          </p>

          <ul className="list-disc list-inside space-y-2 text-[14px] text-[#b9b3a5] pl-2">
            <li>
              <strong className="text-[#f4f1ea]">Billing Cycle:</strong> Subscription fees are billed in advance on a recurring monthly or annual basis via Stripe.
            </li>
            <li>
              <strong className="text-[#f4f1ea]">Pilot & Trial Periods:</strong> Trial access provides full monitoring capabilities for the specified trial duration. Upon conclusion, paid subscription activation is required to maintain continuous alerting.
            </li>
            <li>
              <strong className="text-[#f4f1ea]">Cancellation:</strong> You may cancel your subscription at any time through your dashboard billing settings. Cancellation becomes effective at the end of the current paid billing cycle. No prorated refunds are issued for partial billing periods.
            </li>
          </ul>
        </section>

        {/* SECTION 6 - INTELLECTUAL PROPERTY */}
        <section id="intellectual-property" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            6. Intellectual Property & Customer Feeds
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra retains all rights, title, and interest in and to the Service, including all software, algorithms, user
            interfaces, designs, documentation, and trademarks.
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            You retain all rights, title, and ownership in your product data, brand assets, and Merchant Center feeds. You grant
            Kultra a limited, non-exclusive license to process your feed telemetry solely to the extent necessary to deliver the
            monitoring and alert services.
          </p>
        </section>

        {/* SECTION 7 - LIMITATION OF LIABILITY */}
        <section id="liability" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            7. Limitation of Liability
          </h2>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] space-y-3">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>COMMERCIAL LIABILITY CAP</span>
            </div>
            <p className="text-[14px] leading-[1.65] text-[#b9b3a5]">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <p className="text-[14px] leading-[1.65] text-[#b9b3a5]">
              (A) IN NO EVENT SHALL KULTRA, ITS DIRECTORS, EMPLOYEES, AGENTS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, LOST
              ADVERTISING SPEND, LOST REVENUE, LOSS OF REPUTATION, OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN CONNECTION
              WITH THE SERVICE OR THESE TERMS.
            </p>
            <p className="text-[14px] leading-[1.65] text-[#f4f1ea] font-medium">
              (B) KULTRA&apos;S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT
              EXCEED THE GREATER OF: (I) THE TOTAL FEES ACTUALLY PAID BY YOU TO KULTRA IN THE TWELVE (12) MONTHS PRECEDING THE
              EVENT GIVING RISE TO LIABILITY, OR (II) ONE HUNDRED UNITED STATES DOLLARS ($100 USD).
            </p>
          </div>
        </section>

        {/* SECTION 8 - GOVERNING LAW */}
        <section id="governing-law" className="space-y-4 scroll-mt-20 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            8. Governing Law & Dispute Resolution
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States,
            without regard to conflict of law principles. Any dispute arising out of or relating to these Terms shall be resolved
            through good-faith informal negotiation before initiating formal legal proceedings.
          </p>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2 font-mono text-xs text-[#b9b3a5]">
            <div>
              <span className="text-[#6b7078]">Legal Inquiries: </span>
              <a href="mailto:legal@usekultra.com" className="text-[#f2a93b] underline underline-offset-4">
                legal@usekultra.com
              </a>
            </div>
            <div>
              <span className="text-[#6b7078]">Support: </span>
              <a href="mailto:support@usekultra.com" className="text-[#f2a93b] underline underline-offset-4">
                support@usekultra.com
              </a>
            </div>
            <div>
              <span className="text-[#6b7078]">Headquarters: </span>
              <span className="text-[#f4f1ea]">Kultra Inc., Wilmington, DE, USA</span>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] py-8 text-center text-xs font-mono text-[#6b7078]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Kultra. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#b9b3a5]">
            <Link href="/" className="hover:text-[#f4f1ea] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/privacy" className="hover:text-[#f4f1ea] transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
