import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, AlertTriangle, ShieldCheck, Scale, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Kultra',
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
                src="/assets/logos/kultra-logo-horizontal.svg"
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
              1. Parties & Acceptance of Terms
            </a>
            <a href="#service-scope" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              2. Service Scope & Third-Party Affiliation Disclaimer
            </a>
            <a href="#api-dependencies" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              3. Google API Delivery Dependencies & Performance
            </a>
            <a href="#merchant-authority" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              4. Merchant Authority & Acceptable Use
            </a>
            <a href="#subscriptions" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              5. Subscriptions, Fees & Cancellations
            </a>
            <a href="#intellectual-property" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              6. Intellectual Property & Telemetry Data
            </a>
            <a href="#liability" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              7. Limitation of Liability
            </a>
            <a href="#governing-law" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              8. Governing Law & Contact Information
            </a>
          </div>
        </nav>

        {/* SECTION 1 - PARTIES & ACCEPTANCE */}
        <section id="parties" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            1. Parties & Acceptance of Terms
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Customer&quot;, &quot;you&quot;, or &quot;your&quot;)
            and <strong className="text-[#f4f1ea] font-medium">Kultra</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), based in{' '}
            <strong className="text-[#f4f1ea] font-medium">Ouarzazate, Morocco</strong>, governing your access to and use of{' '}
            <a href="https://www.usekultra.com" className="text-[#f4f1ea] underline underline-offset-4">
              https://www.usekultra.com
            </a>{' '}
            and associated automated monitoring and alerting services (the &quot;Service&quot;).
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            By registering an account, connecting a Google Merchant Center store, or using any part of the Service, you confirm
            that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are entering into
            this agreement on behalf of a company or agency, you represent that you possess the authority to bind that entity.
          </p>
        </section>

        {/* SECTION 2 - SERVICE SCOPE & DISCLAIMERS */}
        <section id="service-scope" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            2. Service Scope & Third-Party Affiliation Disclaimer
          </h2>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs tracking-wide">
              <Scale className="w-4 h-4" />
              <span>INDEPENDENT DIAGNOSTIC TOOL DISCLAIMER</span>
            </div>
            <p className="text-[14.5px] leading-[1.65] text-[#f4f1ea] font-medium">
              Kultra is an independent diagnostic software tool and is not affiliated with, authorized by, sponsored by, or endorsed by Google LLC, Alphabet Inc., Shopify Inc., or Slack Technologies.
            </p>
            <p className="text-xs text-[#b9b3a5] leading-[1.5]">
              Google, Google Merchant Center, Google Shopping, Google Cloud, Shopify, and Slack are registered trademarks of their respective owners. Kultra accesses official public APIs in strict accordance with third-party terms of service and developer guidelines.
            </p>
          </div>
        </section>

        {/* SECTION 3 - API DELIVERY DEPENDENCIES */}
        <section id="api-dependencies" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            3. Google API Delivery Dependencies & Performance
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra provides real-time automated telemetry and diagnostic notification mechanisms. You acknowledge and agree that:
          </p>

          <ul className="list-disc list-inside space-y-2.5 text-[14px] text-[#b9b3a5] pl-2">
            <li>
              <strong className="text-[#f4f1ea] font-medium">API Dependency:</strong> Detection of product disapprovals, policy violations, and account suspensions is fundamentally dependent on data delivered by Google APIs and Google Cloud Pub/Sub events. Kultra is not liable for undetected issues or notification delays resulting from upstream Google API outages, propagation latencies, or third-party delivery service failures.
            </li>
            <li>
              <strong className="text-[#f4f1ea] font-medium">Ad Spend & Campaign Decisions:</strong> Kultra provides monitoring notifications and diagnostic telemetry to assist your team. You retain sole responsibility for managing your Google Ads campaigns, budgets, product catalogs, and compliance with Google Shopping policies. Kultra is not liable for campaign losses, lost sales, or wasted advertising spend resulting from third-party API delivery delays.
            </li>
            <li>
              <strong className="text-[#f4f1ea] font-medium">Passive Diagnostic Nature:</strong> Kultra does not modify, edit, or manage your inventory, pricing, or product descriptions. Resolving disapprovals remains the sole responsibility of the merchant.
            </li>
          </ul>
        </section>

        {/* SECTION 4 - ACCEPTABLE USE */}
        <section id="merchant-authority" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            4. Merchant Authority & Acceptable Use
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            By connecting a store or Merchant Center Account to Kultra, you represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[14px] text-[#b9b3a5] pl-2">
            <li>You are the authorized owner, administrator, or designated agency operator of the connected Google Merchant Center Account ID.</li>
            <li>You will maintain the confidentiality of your account credentials and immediately notify Kultra of any unauthorized access.</li>
            <li>You will not use the Service for any unlawful purpose or in violation of Google Merchant Center program policies.</li>
            <li>You will not attempt to reverse engineer, probe, or disrupt Kultra&apos;s infrastructure or monitoring pipelines.</li>
          </ul>
        </section>

        {/* SECTION 5 - SUBSCRIPTIONS & FEES */}
        <section id="subscriptions" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            5. Subscriptions, Fees & Cancellations
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra provides flat-rate monthly subscriptions for merchants and agencies. Subscriptions renew automatically each billing cycle unless cancelled prior to the renewal date. You may cancel your subscription at any time through your dashboard settings. Upon cancellation, access to monitoring continues through the end of the current paid billing period.
          </p>
        </section>

        {/* SECTION 6 - INTELLECTUAL PROPERTY */}
        <section id="intellectual-property" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            6. Intellectual Property & Telemetry Data
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            As between the parties, you retain all right, title, and interest in and to your product catalogs and store data. Kultra retains all intellectual property rights in and to the Service, including software, algorithms, telemetry interfaces, and brand assets.
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
              (A) IN NO EVENT SHALL KULTRA, ITS FOUNDERS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT,
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
            8. Governing Law & Contact Information
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            These Terms shall be governed by and construed in accordance with the applicable commercial laws of the Kingdom of Morocco, without regard to conflict of law principles. Any dispute arising out of or in connection with these Terms shall be resolved through good-faith amicable negotiation before submitting to the competent commercial courts of Morocco.
          </p>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2 font-mono text-xs text-[#b9b3a5]">
            <div>
              <span className="text-[#6b7078]">Operator: </span>
              <span className="text-[#f4f1ea]">Kultra</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Location: </span>
              <span className="text-[#f4f1ea]">Ouarzazate, Morocco</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Single Contact Email: </span>
              <a href="mailto:contact@usekultra.com" className="text-[#f2a93b] underline underline-offset-4">
                contact@usekultra.com
              </a>
            </div>
            <div>
              <span className="text-[#6b7078]">Website: </span>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
