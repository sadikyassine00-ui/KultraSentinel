import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Lock, CheckCircle2, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kultra — Google Merchant Center Telemetry',
  description:
    'Official Privacy Policy for Kultra (usekultra.com). Detailed disclosures on Google Merchant Center API data usage, Limited Use compliance, encryption, and data protection.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f1ea] font-sans selection:bg-[#7a5a26] selection:text-[#f4f1ea]">
      {/* Fixed / Sticky Top Header */}
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
            <span className="hidden sm:inline-block text-[#6b7078] font-mono text-xs">Privacy Policy</span>
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

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Document Header */}
        <div className="space-y-4 border-b border-[rgba(255,255,255,0.08)] pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[100px] border border-[#7a5a26] bg-[rgba(242,169,59,0.06)] text-[#f2a93b] text-[11px] font-mono tracking-[0.02em]">
            <Shield className="w-3.5 h-3.5" />
            <span>Google API User Data Policy Compliant</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-[#f4f1ea] tracking-tight">
            Privacy Policy
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6b7078]">
            <span>Entity: Kultra Inc. (usekultra.com)</span>
            <span>•</span>
            <span>Effective Date: September 16, 2026</span>
            <span>•</span>
            <span>Last Updated: September 2026</span>
          </div>
        </div>

        {/* Quick Navigation / Table of Contents */}
        <nav className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-3">
          <h2 className="text-xs font-mono text-[#6b7078] tracking-[0.02em]">
            Document Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#b9b3a5]">
            <a href="#entity" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              1. Entity Identification & Purpose
            </a>
            <a href="#collection" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              2. Information We Collect via Google APIs
            </a>
            <a href="#use" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              3. How We Use Google Data & Limited Use
            </a>
            <a href="#no-sale" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              4. No Sale or Commercial Transfer of Data
            </a>
            <a href="#subprocessors" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              5. Authorized Service Sub-Processors
            </a>
            <a href="#security" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              6. Data Protection & AES-256 Encryption
            </a>
            <a href="#revocation" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              7. Data Retention, Revocation & Deletion
            </a>
            <a href="#contact" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              8. Contact & Data Protection Inquiries
            </a>
          </div>
        </nav>

        {/* SECTION 1 */}
        <section id="entity" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            1. Entity Identification & Purpose
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website{' '}
            <a href="https://www.usekultra.com" className="text-[#f4f1ea] underline underline-offset-4">
              https://www.usekultra.com
            </a>{' '}
            and provides real-time automated catalog feed monitoring and product disapproval telemetry services for
            e-commerce merchants utilizing Google Merchant Center.
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            This Privacy Policy describes our strict policies and practices regarding the collection, use, protection, and
            disclosure of information when you link your Google Merchant Center accounts with our telemetry platform.
          </p>
        </section>

        {/* SECTION 2 */}
        <section id="collection" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            2. Information We Collect via Google APIs
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            When you authenticate your Google Account and connect your store to Kultra, we request access through Google
            OAuth 2.0. We collect only the minimum required data necessary to deliver monitoring telemetry:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">
                  Google Merchant Center (GMC) Account Metadata
                </h3>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#b9b3a5] pl-6">
                Your Google Merchant Center ID, registered store name, store URL/domain, and account hierarchy (standalone
                merchant vs. Multi-Client Account / MCA child account).
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">
                  Catalog Feed Diagnostic Statuses & Product Issues
                </h3>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#b9b3a5] pl-6">
                Item approval states (<code className="font-mono text-xs text-[#cfcdc8]">approved</code>,{' '}
                <code className="font-mono text-xs text-[#cfcdc8]">disapproved</code>,{' '}
                <code className="font-mono text-xs text-[#cfcdc8]">pending</code>), policy violation codes, diagnostic issue
                descriptions (e.g., missing GTIN, policy disapproved, price mismatch), destination channels (Shopping ads, Free
                listings), impacted Offer IDs, and product titles.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">
                  User Authentication Profile
                </h3>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#b9b3a5] pl-6">
                Your email address, Google user identification number (<code className="font-mono text-xs text-[#cfcdc8]">sub</code>),
                name, and profile avatar image. This data is collected solely to create and authenticate your tenant account
                and identify your workspace sessions.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3 - CRITICAL GOOGLE LIMITED USE CLAUSE */}
        <section id="use" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            3. How We Use Google Data & Limited Use Disclosures
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra uses the data obtained via Google APIs solely to provide automated operational observability for your
            e-commerce inventory:
          </p>

          <ul className="list-disc list-inside space-y-2 text-[14px] text-[#b9b3a5] pl-2">
            <li>Detecting product approval and disapproval transitions in real-time.</li>
            <li>Tracking policy violations and calculating cumulative downtime duration.</li>
            <li>Formatting and dispatching diagnostic notification payloads to your designated communication endpoints (such as Slack webhook channels).</li>
            <li>Rendering aggregate catalog health metrics inside your authenticated tenant workspace.</li>
          </ul>

          {/* Callout Box - Mandatory Exact Google Clause */}
          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[#7a5a26] bg-[rgba(242,169,59,0.04)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs tracking-wide">
              <Shield className="w-4 h-4" />
              <span>MANDATORY GOOGLE LIMITED USE DISCLOSURE</span>
            </div>
            <p className="text-[14.5px] leading-[1.65] text-[#f4f1ea] font-medium">
              &quot;Kultra requests the <code className="font-mono text-xs text-[#f2a93b]">https://www.googleapis.com/auth/content</code> scope solely for passive catalog health monitoring and webhook event subscription. Kultra does not alter, delete, overwrite, or mutate product feed data, campaign configurations, or pricing.&quot;
            </p>
            <p className="text-xs text-[#b9b3a5] leading-[1.5]">
              Kultra&apos;s use and transfer to any other app of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-[#f2a93b] underline underline-offset-4 inline-flex items-center gap-1"
              >
                <span>Google API Services User Data Policy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              , including the Limited Use requirements.
            </p>
          </div>
        </section>

        {/* SECTION 4 - NO SALE OR COMMERCIAL TRANSFER */}
        <section id="no-sale" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            4. No Sale or Commercial Transfer of Data
          </h2>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs">
              <Lock className="w-4 h-4" />
              <span>NON-NEGOTIABLE PRIVACY GUARANTEE</span>
            </div>
            <p className="text-[15px] leading-[1.65] text-[#f4f1ea] font-medium">
              &quot;Kultra does not sell, rent, or trade Google user data to third parties, data brokers, or advertising networks under any circumstances.&quot;
            </p>
          </div>

          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Specifically, Kultra guarantees that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[14px] text-[#b9b3a5] pl-2">
            <li>We do not use Google user data to serve personalized, targeted, or retargeted advertising.</li>
            <li>We do not build advertising profiles or cross-merchant behavioral dossiers.</li>
            <li>We do not share Google Merchant Center data with any third party except the specific technical sub-processors required to deliver the core service.</li>
            <li>We do not transfer or use Google user data to train generalized artificial intelligence (AI) or machine learning (ML) models.</li>
          </ul>
        </section>

        {/* SECTION 5 - SUB-PROCESSORS */}
        <section id="subprocessors" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            5. Authorized Service Sub-Processors
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            To deliver real-time alerting and high-reliability data pipelines, Kultra partners exclusively with vetted,
            SOC 2-compliant infrastructure providers:
          </p>

          <div className="border border-[rgba(255,255,255,0.08)] rounded-[4px] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e0f11] text-[#6b7078] border-b border-[rgba(255,255,255,0.08)] font-mono">
                <tr>
                  <th className="p-3">Sub-Processor</th>
                  <th className="p-3">Role & Function</th>
                  <th className="p-3">Data Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.08)] text-[#b9b3a5]">
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Vercel Inc.</td>
                  <td className="p-3">Edge network hosting, SSL termination, and serverless application runtime</td>
                  <td className="p-3 font-mono text-[#6b7078]">United States</td>
                </tr>
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Neon Inc.</td>
                  <td className="p-3">Managed cloud PostgreSQL database with AES-256 encrypted persistent storage</td>
                  <td className="p-3 font-mono text-[#6b7078]">United States</td>
                </tr>
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Google Cloud Platform</td>
                  <td className="p-3">Cloud Pub/Sub push subscription infrastructure for real-time Merchant Center push events</td>
                  <td className="p-3 font-mono text-[#6b7078]">United States</td>
                </tr>
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Slack Technologies / Salesforce</td>
                  <td className="p-3">Outbound delivery of Block Kit alert payloads strictly to user-configured webhook destinations</td>
                  <td className="p-3 font-mono text-[#6b7078]">United States</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6 - DATA SECURITY & ENCRYPTION */}
        <section id="security" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            6. Data Protection & Encryption Standards
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra implements rigorous technical and organizational measures to safeguard merchant telemetry data against
            unauthorized access, disclosure, or alteration:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">AES-256-GCM Encryption at Rest</h3>
              </div>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                All OAuth 2.0 refresh tokens, credentials, and webhook endpoints are encrypted at rest using industry-standard
                AES-256-GCM before writing to the database. Decryption keys are stored strictly in secure server-side environment secrets.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">TLS 1.3 Encryption in Transit</h3>
              </div>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                All network communication between your browser, Kultra servers, and Google APIs is enforced strictly over
                HTTPS using modern Transport Layer Security (TLS 1.3) protocols with HSTS headers enabled.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7 - DATA RETENTION & ACCOUNT REVOCATION */}
        <section id="revocation" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            7. Data Retention, Revocation & Deletion
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            You maintain full sovereignty over your Google Merchant Center data and can sever access or request complete deletion
            at any time:
          </p>

          <div className="space-y-3 text-[14px] text-[#b9b3a5]">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Revoking Access via Kultra Dashboard</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                You can disconnect any store at any time directly through your Kultra Dashboard store settings. Disconnecting
                a store immediately ceases all Google Content API polling and deletes the active synchronization schedule.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Revoking Access via Google Account Security</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                You may revoke Kultra&apos;s permissions directly from your Google Security console at any time by visiting:{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f2a93b] underline underline-offset-4 inline-flex items-center gap-1"
                >
                  <span>https://myaccount.google.com/permissions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Permanent Account & Data Deletion Requests</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                To request permanent deletion of your Kultra account, associated tenant records, incident logs, and encrypted
                OAuth credentials, email{' '}
                <a href="mailto:privacy@usekultra.com" className="text-[#f4f1ea] underline underline-offset-4 font-mono">
                  privacy@usekultra.com
                </a>{' '}
                or{' '}
                <a href="mailto:support@usekultra.com" className="text-[#f4f1ea] underline underline-offset-4 font-mono">
                  support@usekultra.com
                </a>
                . All associated data will be irreversibly purged from our active databases within 30 days of verification.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 8 - CONTACT */}
        <section id="contact" className="space-y-4 scroll-mt-20 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            8. Contact & Data Protection Inquiries
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            If you have questions regarding this Privacy Policy, our compliance with Google&apos;s API Services User Data Policy,
            or wish to exercise your data access or deletion rights, please contact our Data Protection Officer:
          </p>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2 font-mono text-xs text-[#b9b3a5]">
            <div>
              <span className="text-[#6b7078]">Entity: </span>
              <span className="text-[#f4f1ea]">Kultra Inc.</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Privacy Inquiries: </span>
              <a href="mailto:privacy@usekultra.com" className="text-[#f2a93b] underline underline-offset-4">
                privacy@usekultra.com
              </a>
            </div>
            <div>
              <span className="text-[#6b7078]">Customer Support: </span>
              <a href="mailto:support@usekultra.com" className="text-[#f2a93b] underline underline-offset-4">
                support@usekultra.com
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
          <p>© {new Date().getFullYear()} Kultra. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#b9b3a5]">
            <Link href="/" className="hover:text-[#f4f1ea] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/terms" className="hover:text-[#f4f1ea] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
