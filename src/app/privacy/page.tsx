import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Lock, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kultra',
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
              1. Service Operator & Contact Information
            </a>
            <a href="#sensitive-scope" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              2. Google API Sensitive Scope Disclosure
            </a>
            <a href="#limited-use" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              3. Google API Services User Data Policy Compliance
            </a>
            <a href="#storage-encryption" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              4. Data Storage, Encryption & Security
            </a>
            <a href="#no-sale" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              5. No Sale, Rental, or Monetization of Data
            </a>
            <a href="#subprocessors" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              6. Technical Sub-Processors
            </a>
            <a href="#revocation-deletion" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              7. Data Retention, Revocation & Deletion
            </a>
            <a href="#contact" className="hover:text-[#f4f1ea] hover:underline underline-offset-4">
              8. Single Point of Contact
            </a>
          </div>
        </nav>

        {/* SECTION 1 - OPERATOR */}
        <section id="operator" className="space-y-3 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            1. Service Operator & Contact Information
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            This Service is operated by <strong className="text-[#f4f1ea] font-medium">Kultra</strong>, based in{' '}
            <strong className="text-[#f4f1ea] font-medium">Ouarzazate, Morocco</strong>. Kultra provides real-time
            automated catalog feed monitoring, policy violation diagnostics, and disapproval alerting for e-commerce
            merchants utilizing Google Merchant Center via{' '}
            <a href="https://www.usekultra.com" className="text-[#f4f1ea] underline underline-offset-4">
              https://www.usekultra.com
            </a>.
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Our single, centralized point of contact for all legal inquiries, security reports, data protection questions,
            and data deletion requests is:{' '}
            <a href="mailto:contact@usekultra.com" className="text-[#f2a93b] underline underline-offset-4 font-mono font-medium">
              contact@usekultra.com
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
            as a sensitive scope. When you authenticate via Google OAuth 2.0 and link your Google Merchant Center account with Kultra,
            our platform requests access strictly to read catalog status telemetry:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">
                  Merchant Center Account (GMC) Metadata
                </h3>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#b9b3a5] pl-6">
                Merchant Center Account ID, registered Store Name, store URL/domain, and account hierarchy (standalone merchant vs. Multi-Client Account / MCA child account).
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">
                  Catalog Health Telemetry & Disapproval States
                </h3>
              </div>
              <p className="text-[13.5px] leading-[1.55] text-[#b9b3a5] pl-6">
                Product approval states (<code className="font-mono text-xs text-[#cfcdc8]">approved</code>,{' '}
                <code className="font-mono text-xs text-[#cfcdc8]">disapproved</code>,{' '}
                <code className="font-mono text-xs text-[#cfcdc8]">pending</code>), policy violation issue codes (e.g., missing attributes,
                GTIN errors, promotional policy violations), impacted Offer IDs, and product titles.
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
                User email address, Google unique identifier (<code className="font-mono text-xs text-[#cfcdc8]">sub</code>), and display name,
                used solely to authenticate and identify your tenant workspace session.
              </p>
            </div>
          </div>

          {/* Callout Box - Explicit Non-Mutation Guarantee Verbatim */}
          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[#7a5a26] bg-[rgba(242,169,59,0.04)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs tracking-wide">
              <Shield className="w-4 h-4" />
              <span>EXPLICIT NON-MUTATION GUARANTEE</span>
            </div>
            <p className="text-[14.5px] leading-[1.65] text-[#f4f1ea] font-medium">
              &quot;Kultra requests access to the Google Merchant API exclusively for passive health monitoring, diagnostic reporting, and event subscription. Kultra’s codebase does not modify, create, update, or delete your product feeds, prices, listings, or campaign settings.&quot;
            </p>
          </div>
        </section>

        {/* SECTION 3 - LIMITED USE DISCLOSURE */}
        <section id="limited-use" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            3. Google API Services User Data Policy Compliance
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra strictly adheres to Google&apos;s API Services User Data Policy, specifically the Limited Use requirements.
          </p>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[#7a5a26] bg-[rgba(242,169,59,0.04)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs tracking-wide">
              <Shield className="w-4 h-4" />
              <span>LIMITED USE REQUIREMENTS VERBATIM DISCLOSURE</span>
            </div>
            <p className="text-[14.5px] leading-[1.65] text-[#f4f1ea] font-medium">
              &quot;Kultra’s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-[#f2a93b] underline underline-offset-4 inline-flex items-center gap-1"
              >
                <span>Google API Services User Data Policy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              , including the Limited Use requirements.&quot;
            </p>
          </div>

          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            In compliance with these rules:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[14px] text-[#b9b3a5] pl-2">
            <li>Google user data is used exclusively to provide or improve customer-facing features that are prominent in the Kultra interface (catalog health tracking, alert routing, and disapproval diagnostics).</li>
            <li>We do not transfer Google user data to third parties, unless necessary to provide the service (e.g. delivering an alert via your configured Slack webhook), to comply with applicable law, or as part of a merger or acquisition with explicit notice.</li>
            <li>We do not use or transfer Google user data to serve advertisements, including personalized, re-targeted, or interest-based advertising.</li>
            <li>We do not allow humans to read Google user data unless you have given explicit consent for specific troubleshooting, it is necessary for security investigations, or it is required to comply with applicable law.</li>
            <li>We do not use or transfer Google user data to train generalized artificial intelligence (AI) or machine learning (ML) models.</li>
          </ul>
        </section>

        {/* SECTION 4 - DATA STORAGE & ENCRYPTION */}
        <section id="storage-encryption" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            4. Data Storage, Encryption & Security
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra applies rigorous cryptographic protections and strict isolation to safeguard merchant credentials and telemetry:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">AES-256-GCM Encryption at Rest</h3>
              </div>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                All OAuth 2.0 refresh tokens, access credentials, and customer webhook endpoints are encrypted at rest using industry-standard AES-256-GCM before persistent database storage. Cryptographic keys are managed in isolated server environments.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#f2a93b]" />
                <h3 className="text-sm font-semibold text-[#f4f1ea]">Strict HTTPS/TLS 1.3 in Transit</h3>
              </div>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                All network communication between your browser, Kultra servers, and Google APIs is enforced strictly over HTTPS using modern Transport Layer Security (TLS 1.3) protocols with strict HSTS enforcement.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5 - NO SALE, RENTAL, OR MONETIZATION */}
        <section id="no-sale" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            5. No Sale, Rental, or Monetization of Data
          </h2>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.14)] space-y-2.5">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs">
              <Lock className="w-4 h-4" />
              <span>NON-NEGOTIABLE PRIVACY GUARANTEE</span>
            </div>
            <p className="text-[15px] leading-[1.65] text-[#f4f1ea] font-medium">
              &quot;Kultra never sells, rents, trades, or monetizes merchant data or feed telemetry to any third party, data broker, or advertising network under any circumstances.&quot;
            </p>
          </div>
        </section>

        {/* SECTION 6 - SUB-PROCESSORS */}
        <section id="subprocessors" className="space-y-4 scroll-mt-20">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            6. Technical Sub-Processors
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            To deliver real-time alerting and high-reliability data pipelines, Kultra utilizes vetted infrastructure sub-processors:
          </p>

          <div className="border border-[rgba(255,255,255,0.08)] rounded-[4px] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e0f11] text-[#6b7078] border-b border-[rgba(255,255,255,0.08)] font-mono">
                <tr>
                  <th className="p-3">Sub-Processor</th>
                  <th className="p-3">Role & Function</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.08)] text-[#b9b3a5]">
                <tr className="hover:bg-[#131418] transition-colors">
                  <td className="p-3 font-semibold text-[#f4f1ea]">Vercel Inc.</td>
                  <td className="p-3">Edge network hosting, SSL termination, and serverless application runtime</td>
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
            7. Data Retention, Revocation & Deletion
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            You maintain full sovereignty over your Google Merchant Center data and can disconnect our service or request complete data deletion at any time:
          </p>

          <div className="space-y-3 text-[14px] text-[#b9b3a5]">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Disconnecting Store Inside Kultra</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                You can disconnect your store inside Kultra at any time directly through your dashboard settings. Disconnecting immediately terminates active feed monitoring and stops all API polling.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Revoking Access via Google Security Settings</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                You can revoke Kultra&apos;s permissions directly from your Google Security Settings at any time by visiting:{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f2a93b] underline underline-offset-4 inline-flex items-center gap-1"
                >
                  <span>https://myaccount.google.com/permissions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-1.5">
              <h3 className="text-sm font-semibold text-[#f4f1ea]">Permanent Data Purge & Account Deletion</h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.6]">
                Permanent deletion of all stored store records, tokens, account identifiers, and incident logs can be requested at any time by emailing{' '}
                <a href="mailto:contact@usekultra.com" className="text-[#f4f1ea] underline underline-offset-4 font-mono font-medium">
                  contact@usekultra.com
                </a>.
                All associated records will be permanently and irreversibly purged from our active databases within 30 days of verification.
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
            For all questions, compliance inquiries, privacy questions, or data deletion requests, please contact:
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
              <span className="text-[#6b7078]">Contact Email: </span>
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
            <Link href="/terms" className="hover:text-[#f4f1ea] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
