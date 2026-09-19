import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, AlertTriangle, Scale, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Kultra',
  description:
    'Terms of Service governing the use of Kultra (usekultra.com) SaaS catalog monitoring, diagnostic telemetry, 14-day evaluation, and alerting services.',
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
                src="/assets/logos/kultra-logo-horizontal.svg"
                alt="Kultra"
                width={120}
                height={34}
                className="h-[26px] w-auto object-contain brightness-105"
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
            <span>Commercial SaaS Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-[#f4f1ea] tracking-tight">
            Terms of Service
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6b7078]">
            <span>Party: Kultra (Ouarzazate, Morocco)</span>
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
            <a href="#parties" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              1. Parties &amp; Acceptance of Terms
            </a>
            <a href="#service-scope" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              2. Service Description &amp; Non-Affiliation Disclaimer
            </a>
            <a href="#trial-subscriptions" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              3. 14-Day Free Trial &amp; Subscription Terms
            </a>
            <a href="#api-dependencies" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              4. Google API Dependencies &amp; Merchant Responsibility
            </a>
            <a href="#merchant-authority" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              5. Merchant Authority &amp; Acceptable Use
            </a>
            <a href="#intellectual-property" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              6. Intellectual Property &amp; Telemetry Data
            </a>
            <a href="#liability" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              7. Limitation of Liability &amp; Disclaimers
            </a>
            <a href="#governing-law" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              8. Governing Law, Jurisdiction &amp; Contact Information
            </a>
          </div>
        </nav>

        {/* SECTION 1 - PARTIES & ACCEPTANCE */}
        <section id="parties" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            1. Parties &amp; Acceptance of Terms
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Customer&quot;, &quot;you&quot;, or &quot;your&quot;)
            and <strong className="text-[#f4f1ea] font-medium">Kultra</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), headquartered and operated out of{' '}
            <strong className="text-[#f4f1ea] font-medium">Ouarzazate, Morocco</strong>, governing your access to and use of{' '}
            <a href="https://www.usekultra.com" className="text-[#f4f1ea] underline underline-offset-4">
              https://www.usekultra.com
            </a>{' '}
            and associated automated catalog monitoring and alerting services (the &quot;Service&quot;).
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            By registering an account, connecting a Google Merchant Center catalog, or using any part of the Service, you confirm
            that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are entering into
            this agreement on behalf of a company or agency, you represent and warrant that you possess the legal authority to bind that entity.
          </p>
        </section>

        {/* SECTION 2 - SERVICE DESCRIPTION & NON-AFFILIATION */}
        <section id="service-scope" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            2. Service Description &amp; Non-Affiliation Disclaimer
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra operates as an independent catalog monitoring utility for e-commerce merchants and digital advertising agencies. Kultra continuously monitors Google Merchant Center catalog feeds, diagnoses policy disapproval events, and dispatches automated real-time alert notifications (such as Slack alerts and diagnostic email summaries) to prevent silent ad traffic drops.
          </p>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[#7a5a26] bg-[rgba(242,169,59,0.04)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs tracking-wide">
              <Scale className="w-4 h-4" />
              <span>EXPLICIT NON-AFFILIATION DISCLAIMER</span>
            </div>
            <blockquote className="text-[14.5px] leading-[1.65] text-[#f4f1ea] font-medium border-l-2 border-[#f2a93b] pl-4 py-1 italic">
              &quot;Kultra is an independent software tool and is not affiliated with, sponsored by, or endorsed by Google LLC or Alphabet Inc.&quot;
            </blockquote>
            <p className="text-xs text-[#b9b3a5] leading-[1.5]">
              Google, Google Merchant Center, Google Shopping, Google Ads, and Google Cloud are registered trademarks of Google LLC. Shopify is a registered trademark of Shopify Inc. Slack is a registered trademark of Slack Technologies / Salesforce, Inc. Kultra accesses official public APIs in strict accordance with third-party developer policies.
            </p>
          </div>
        </section>

        {/* SECTION 3 - 14-DAY EVALUATION & SUBSCRIPTION TERMS */}
        <section id="trial-subscriptions" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            3. 14-Day Evaluation &amp; Subscription Terms
          </h2>
          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f2a93b]" />
              <h3 className="text-sm font-semibold text-[#f4f1ea]">14-Day Free Evaluation Period</h3>
            </div>
            <p className="text-xs text-[#b9b3a5] leading-[1.6]">
              Every newly registered merchant account receives a <strong className="text-[#f4f1ea] font-medium">14-day free trial</strong> of full real-time catalog monitoring, instant disapproval detection, and automated alerting services beginning immediately upon account creation. No credit card is required to evaluate the Service during the trial.
            </p>
            <p className="text-xs text-[#b9b3a5] leading-[1.6]">
              Upon expiration of the 14-day evaluation period, active crawler monitoring, diagnostic event tracking, and outbound notifications are automatically paused until the account is upgraded to an active paid subscription plan.
            </p>
          </div>

          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Paid subscriptions renew automatically on a recurring monthly billing cycle unless cancelled prior to the renewal date via your dashboard settings. Upon cancellation, access to monitoring continues through the end of the active paid billing period, with zero recurring charges thereafter.
          </p>
        </section>

        {/* SECTION 4 - GOOGLE API DEPENDENCIES & MERCHANT RESPONSIBILITY */}
        <section id="api-dependencies" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            4. Google API Dependencies &amp; Merchant Responsibility
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            You acknowledge and agree to the operational boundaries of automated catalog monitoring:
          </p>

          <ul className="list-disc list-inside space-y-2.5 text-[14px] text-[#b9b3a5] pl-2">
            <li>
              <strong className="text-[#f4f1ea] font-medium">Upstream API Dependency:</strong> Identification of product disapprovals and account suspensions depends entirely upon telemetry delivered by the Google Content API and Google Cloud Pub/Sub infrastructure. Kultra is not liable for notification delays or unflagged catalog issues resulting from upstream Google API outages, latency, or protocol deprecations.
            </li>
            <li>
              <strong className="text-[#f4f1ea] font-medium">Sole Merchant Responsibility:</strong> The merchant remains solely and exclusively responsible for the accuracy, legality, pricing, feed formatting, and policy compliance of their product catalogs under Google Shopping and Google Ads policies.
            </li>
            <li>
              <strong className="text-[#f4f1ea] font-medium">Advertising Decisions &amp; Spend:</strong> Kultra provides automated notification mechanisms to alert your team. You retain sole discretion over ad budgets, bidding strategies, and campaign configurations. Kultra is not responsible or liable for any advertising suspensions, ad spend fluctuations, revenue losses, or policy enforcement actions imposed on the merchant by Google.
            </li>
            <li>
              <strong className="text-[#f4f1ea] font-medium">Passive Diagnostic Monitor:</strong> Kultra operates purely as a passive diagnostic monitor and never writes, alters, creates, updates, or deletes product data or feed configurations in your Google Merchant Center account.
            </li>
          </ul>
        </section>

        {/* SECTION 5 - MERCHANT AUTHORITY & ACCEPTABLE USE */}
        <section id="merchant-authority" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            5. Merchant Authority &amp; Acceptable Use
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            By connecting a store or Merchant Center Account to Kultra, you represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[14px] text-[#b9b3a5] pl-2">
            <li>You are the verified owner, administrator, or designated agency representative of the connected Google Merchant Center account.</li>
            <li>You will safeguard account credentials and notify Kultra immediately at <code className="font-mono text-xs text-[#f2a93b]">support@usekultra.com</code> of any unauthorized account access.</li>
            <li>You will not use the Service for any unlawful, deceptive, or fraudulent purpose or in violation of Google Merchant Center program policies.</li>
            <li>You will not probe, scan, reverse engineer, or intentionally overload Kultra&apos;s monitoring infrastructure or data pipelines.</li>
          </ul>
        </section>

        {/* SECTION 6 - INTELLECTUAL PROPERTY */}
        <section id="intellectual-property" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            6. Intellectual Property &amp; Telemetry Data
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            As between the parties, you retain all right, title, and interest in and to your proprietary store data and product feeds. Kultra retains all intellectual property rights, copyrights, and trade secrets in and to the Service, including the web application, algorithms, telemetry interfaces, and brand assets.
          </p>
        </section>

        {/* SECTION 7 - LIMITATION OF LIABILITY */}
        <section id="liability" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            7. Limitation of Liability &amp; Disclaimers
          </h2>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] space-y-3">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>COMMERCIAL LIABILITY LIMITATIONS</span>
            </div>
            <p className="text-[14px] leading-[1.65] text-[#b9b3a5]">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <p className="text-[14px] leading-[1.65] text-[#b9b3a5]">
              (A) IN NO EVENT SHALL KULTRA, ITS OPERATORS, FOUNDERS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS,
              WASTED ADVERTISING SPEND, ACCOUNT SUSPENSION COSTS, LOST SALES, LOSS OF BUSINESS GOODWILL, OR DATA LOSS,
              ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
            <p className="text-[14px] leading-[1.65] text-[#f4f1ea] font-medium">
              (B) KULTRA&apos;S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE
              SHALL BE STRICTLY LIMITED TO THE GREATER OF: (I) THE TOTAL FEES ACTUALLY PAID BY YOU TO KULTRA IN THE TWELVE (12)
              MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (II) ONE HUNDRED UNITED STATES DOLLARS ($100 USD).
            </p>
          </div>
        </section>

        {/* SECTION 8 - GOVERNING LAW & JURISDICTION */}
        <section id="governing-law" className="space-y-4 scroll-mt-20 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            8. Governing Law, Jurisdiction &amp; Contact Information
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            These Terms and any dispute, controversy, or claim arising out of or relating to them shall be governed by and construed in accordance with the commercial laws of the <strong className="text-[#f4f1ea] font-medium">Kingdom of Morocco</strong>, without giving effect to any principles of conflicts of law. Any legal proceeding, arbitration, or dispute resolution arising in connection with the Service shall be submitted to the exclusive jurisdiction of the competent courts located in <strong className="text-[#f4f1ea] font-medium">Ouarzazate, Morocco</strong>.
          </p>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2 font-mono text-xs text-[#b9b3a5]">
            <div>
              <span className="text-[#6b7078]">Service Operator: </span>
              <span className="text-[#f4f1ea]">Kultra</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Operational Seat: </span>
              <span className="text-[#f4f1ea]">Ouarzazate, Morocco</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Unified Support Email: </span>
              <a href="mailto:support@usekultra.com" className="text-[#f2a93b] underline underline-offset-4">
                support@usekultra.com
              </a>
            </div>
            <div>
              <span className="text-[#6b7078]">Official URL: </span>
              <a href="https://www.usekultra.com" className="text-[#f4f1ea] underline underline-offset-4">
                https://www.usekultra.com
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] py-8 text-center text-xs font-mono text-[#6b7078]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Kultra. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#b9b3a5]">
            <Link href="/" className="hover:text-[#f4f1ea] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/privacy" className="hover:text-[#f4f1ea] transition-colors">
              Privacy Policy
            </Link>
            <span>/</span>
            <Link href="/refund" className="hover:text-[#f4f1ea] transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
