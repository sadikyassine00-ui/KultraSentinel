import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Lock, CheckCircle2, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kultra',
  description:
    'Official Privacy Policy for Kultra (usekultra.com). Detailed disclosures on Google Content API data usage, Limited Use compliance, encryption, and data protection.',
  alternates: {
    canonical: '/privacy',
  },
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
                src="/assets/logos/kultra-logo-horizontal.svg"
                alt="Kultra"
                width={120}
                height={34}
                className="h-[26px] w-auto object-contain brightness-105"
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
            <span>Operator: Kultra (Ouarzazate, Morocco)</span>
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
            <a href="#operator" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              1. Service Operator &amp; Unified Contact Information
            </a>
            <a href="#sensitive-scope" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              2. Google API Sensitive Scope Disclosure
            </a>
            <a href="#limited-use" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              3. Google Limited Use Clause &amp; Zero Commercialization
            </a>
            <a href="#storage-encryption" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              4. Data Storage, AES-256 Encryption &amp; Security
            </a>
            <a href="#no-sale" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              5. Zero Commercialization &amp; No AI Model Training
            </a>
            <a href="#subprocessors" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              6. Technical Sub-Processors
            </a>
            <a href="#revocation-deletion" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              7. Data Retention, Revocation &amp; Deletion
            </a>
            <a href="#contact" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              8. Single Point of Contact
            </a>
          </div>
        </nav>

        {/* SECTION 1 - OPERATOR */}
        <section id="operator" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            1. Service Operator &amp; Unified Contact Information
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            This Service is operated exclusively by <strong className="text-[#f4f1ea] font-medium">Kultra</strong>, headquartered and operated out of{' '}
            <strong className="text-[#f4f1ea] font-medium">Ouarzazate, Morocco</strong>. Kultra provides real-time
            automated catalog feed monitoring, policy violation diagnostics, and disapproval alerting for e-commerce
            merchants utilizing Google Merchant Center via{' '}
            <a href="https://www.usekultra.com" className="text-[#f4f1ea] underline underline-offset-4">
              https://www.usekultra.com
            </a>.
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Our unified, centralized point of contact for all legal inquiries, privacy questions, security disclosures,
            and data deletion requests is:{' '}
            <a href="mailto:support@usekultra.com" className="text-[#f2a93b] underline underline-offset-4 font-mono font-medium">
              support@usekultra.com
            </a>.
          </p>
        </section>

        {/* SECTION 2 - GOOGLE API SENSITIVE SCOPE DISCLOSURE */}
        <section id="sensitive-scope" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            2. Google API Sensitive Scope Disclosure (<code className="font-mono text-sm text-[#f2a93b]">https://www.googleapis.com/auth/content</code>)
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Google classifies the <code className="font-mono text-xs text-[#cfcdc8]">https://www.googleapis.com/auth/content</code> permission
            as a sensitive scope. When you authenticate via Google OAuth 2.0 and connect your Google Merchant Center account with Kultra,
            our platform requests access strictly to retrieve read-only catalog status telemetry.
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">
                  Read-Only Catalog Health Telemetry &amp; Disapproval States
                </h3>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#b9b3a5] pl-6">
                Kultra retrieves specific, read-only data points: unique product IDs (Offer IDs), product titles, approval statuses (<code className="font-mono text-xs text-[#cfcdc8]">approved</code>, <code className="font-mono text-xs text-[#cfcdc8]">disapproved</code>, <code className="font-mono text-xs text-[#cfcdc8]">pending</code>), servability states (eligible vs. blocked from shopping ad traffic), and policy disapproval error codes (such as GTIN errors, pricing mismatches, tax configuration discrepancies, or promotional policy violations).
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">
                  Merchant Center Account (GMC) Metadata
                </h3>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#b9b3a5] pl-6">
                Merchant Center Account ID, registered store name, verified store domain URL, and account hierarchy (standalone merchant account vs. Multi-Client Account / MCA child accounts).
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
                User email address, Google unique identifier (<code className="font-mono text-xs text-[#cfcdc8]">sub</code>), and display name, used solely to authenticate and identify your tenant workspace session.
              </p>
            </div>
          </div>

          {/* Callout Box - Explicit Passive Diagnostic Non-Mutation Guarantee */}
          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[#7a5a26] bg-[rgba(242,169,59,0.04)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs tracking-wide">
              <Shield className="w-4 h-4" />
              <span>PASSIVE DIAGNOSTIC MONITOR — NON-MUTATION GUARANTEE</span>
            </div>
            <p className="text-[14.5px] leading-[1.65] text-[#f4f1ea] font-medium">
              &quot;Kultra functions purely as a passive diagnostic monitor and never writes, alters, creates, updates, or deletes product data, pricing, inventory, listings, feeds, or feed configurations in the merchant&apos;s Google Merchant Center account.&quot;
            </p>
          </div>
        </section>

        {/* SECTION 3 - LIMITED USE DISCLOSURE */}
        <section id="limited-use" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            3. Mandatory Google Limited Use Compliance
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra strictly adheres to Google&apos;s API Services User Data Policy, specifically the Limited Use requirements.
          </p>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[#7a5a26] bg-[rgba(242,169,59,0.04)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs tracking-wide">
              <Shield className="w-4 h-4" />
              <span>LIMITED USE REQUIREMENTS VERBATIM DISCLOSURE</span>
            </div>
            <blockquote className="text-[14.5px] leading-[1.65] text-[#f4f1ea] font-medium border-l-2 border-[#f2a93b] pl-4 py-1 italic">
              &quot;Kultra&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-[#f2a93b] underline underline-offset-4 inline-flex items-center gap-1 not-italic"
              >
                <span>Google API Services User Data Policy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              , including the Limited Use requirements.&quot;
            </blockquote>
          </div>

          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            In strict adherence to these requirements:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[14px] text-[#b9b3a5] pl-2">
            <li>Google user data is used strictly to provide and improve customer-facing features prominent in Kultra&apos;s dashboard (real-time catalog health monitoring, incident alerting, and disapproval diagnostics).</li>
            <li>Google user data is never transferred to third parties, except as strictly necessary to deliver the Service (e.g., transmitting an alert payload to your user-configured Slack webhook), to comply with applicable laws, or as part of a corporate transaction with prior affirmative notice.</li>
            <li>Google user data is never used or transferred to serve advertisements, including personalized, targeted, or retargeted advertising.</li>
            <li>Humans are prohibited from reading Google user data unless you have given explicit consent for troubleshooting, it is required for security incident response, or it is required by applicable law.</li>
            <li>Google user data is never used, leased, or transferred to train generalized artificial intelligence (AI) or machine learning (ML) models.</li>
          </ul>
        </section>

        {/* SECTION 4 - DATA STORAGE & ENCRYPTION */}
        <section id="storage-encryption" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            4. Data Storage, Encryption &amp; Security
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra applies rigorous cryptographic protections and defense-in-depth safeguards to protect all merchant data and credentials:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">AES-256 Encryption at Rest</h3>
              </div>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                All OAuth 2.0 refresh tokens, access credentials, API keys, and customer webhook URLs are encrypted at rest using industry-standard AES-256 (AES-256-GCM) encryption before being committed to persistent database storage. Encryption keys are managed in isolated environment boundaries.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">TLS 1.3 / HTTPS in Transit</h3>
              </div>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                All communications between user browsers, Kultra servers, and Google APIs are transmitted exclusively over encrypted HTTPS connections using modern Transport Layer Security (TLS 1.3) protocols with strict HTTP Strict Transport Security (HSTS) enforcement.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5 - NO SALE OR MODEL TRAINING */}
        <section id="no-sale" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            5. Zero Commercialization &amp; No Model Training
          </h2>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs">
              <Lock className="w-4 h-4" />
              <span>NON-NEGOTIABLE COMMERCIAL INTEGRITY GUARANTEE</span>
            </div>
            <p className="text-[15px] leading-[1.65] text-[#f4f1ea] font-medium">
              &quot;Google user data is never sold, leased, rented, or transferred to third-party data brokers. Google user data is never used for serving advertisements, retargeting, or training general AI or machine learning models under any circumstances.&quot;
            </p>
          </div>
        </section>

        {/* SECTION 6 - SUB-PROCESSORS */}
        <section id="subprocessors" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            6. Technical Sub-Processors
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            To deliver real-time monitoring and high-reliability data pipelines, Kultra utilizes vetted infrastructure sub-processors:
          </p>

          <div className="border border-[rgba(255,255,255,0.08)] rounded-[4px] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e0f11] text-[#6b7078] border-b border-[rgba(255,255,255,0.08)] font-mono">
                <tr>
                  <th className="p-3">Sub-Processor</th>
                  <th className="p-3">Role &amp; Function</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.08)] text-[#b9b3a5]">
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Vercel Inc.</td>
                  <td className="p-3">Edge network hosting, SSL termination, and serverless application execution</td>
                </tr>
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Neon Inc.</td>
                  <td className="p-3">Managed cloud PostgreSQL database with AES-256 encrypted persistent storage</td>
                </tr>
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Google Cloud Platform</td>
                  <td className="p-3">Cloud Pub/Sub push subscription infrastructure for real-time Merchant Center push events</td>
                </tr>
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Slack Technologies / Salesforce</td>
                  <td className="p-3">Outbound delivery of Block Kit alert payloads strictly to user-configured webhook destinations</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 7 - RETENTION, REVOCATION & DELETION */}
        <section id="revocation-deletion" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            7. Data Retention, Revocation &amp; Deletion
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            You maintain complete sovereignty over your Google Merchant Center data and can revoke access or request full deletion at any time:
          </p>

          <div className="space-y-3 text-[14px] text-[#b9b3a5]">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Revoking Access via Google Account Security Settings</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                You can revoke Kultra&apos;s access permissions at any time directly through your{' '}
                <strong className="text-[#f4f1ea] font-medium">Google Account Security Settings</strong> (under &quot;Third-party apps &amp; services&quot;) by visiting:{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f2a93b] underline underline-offset-4 inline-flex items-center gap-1"
                >
                  <span>https://myaccount.google.com/permissions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>.
                Revoking access immediately invalidates our OAuth credentials and halts all API data retrieval.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Disconnecting Store Inside Kultra Dashboard</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                You can disconnect your store at any time via your dashboard settings. Disconnecting immediately removes your store from the active polling loop and terminates live monitoring.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Permanent Data Deletion by Email Request</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                Users can request complete, irreversible deletion of their stored catalog metadata, incident logs, store records, and authentication credentials at any time by emailing{' '}
                <a href="mailto:support@usekultra.com" className="text-[#f4f1ea] underline underline-offset-4 font-mono font-medium">
                  support@usekultra.com
                </a>.
                All deletion requests are verified and processed within <strong className="text-[#f4f1ea] font-medium">30 business days</strong>, with all corresponding records permanently purged from our active databases and backup retention cycles.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 8 - CONTACT */}
        <section id="contact" className="space-y-4 scroll-mt-20 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            8. Single Point of Contact
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            For all questions, compliance inquiries, privacy disclosures, or data deletion requests, please contact our unified support channel:
          </p>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2 font-mono text-xs text-[#b9b3a5]">
            <div>
              <span className="text-[#6b7078]">Operator: </span>
              <span className="text-[#f4f1ea]">Kultra</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Headquarters: </span>
              <span className="text-[#f4f1ea]">Ouarzazate, Morocco</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Support Email: </span>
              <a href="mailto:support@usekultra.com" className="text-[#f2a93b] underline underline-offset-4">
                support@usekultra.com
              </a>
            </div>
            <div>
              <span className="text-[#6b7078]">Official Website: </span>
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
            <Link href="/terms" className="hover:text-[#f4f1ea] transition-colors">
              Terms of Service
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
