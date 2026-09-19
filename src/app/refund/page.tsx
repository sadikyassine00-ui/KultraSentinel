import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Mail, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund and Cancellation Policy | Kultra',
  description:
    'Transparent, direct, and legally binding Refund and Cancellation Policy for Kultra (usekultra.com). Learn about our 14-day trial, first-payment guarantee, and self-serve cancellation.',
};

export default function RefundPolicyPage() {
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
            <span className="hidden sm:inline-block text-[#6b7078] font-mono text-xs">Refund &amp; Cancellation Policy</span>
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
            <ShieldCheck className="w-3.5 h-3.5 text-[#f2a93b]" />
            <span>Buyer Protection &amp; Billing Transparency</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-[#f4f1ea] tracking-tight">
            Refund and Cancellation Policy
          </h1>

          <p className="text-[15px] leading-[1.6] text-[#b9b3a5] max-w-3xl">
            At Kultra (usekultra.com), we stand firmly behind the performance, reliability, and precision of our real-time Google Merchant Center monitoring platform. We believe billing should always be honest, self-serve, and completely predictable with zero hidden fees.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-[#6b7078]">
            <div>Effective Date: <span className="text-[#f4f1ea]">September 19, 2026</span></div>
            <div>Operating Entity: <span className="text-[#f4f1ea]">Kultra (Ouarzazate, Morocco)</span></div>
            <div>Support: <a href="mailto:support@usekultra.com" className="text-[#f2a93b] hover:underline">support@usekultra.com</a></div>
          </div>
        </div>

        {/* Quick Highlights Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#f2a93b]">
              <CheckCircle2 className="w-4 h-4" />
              <span>14-Day Free Trial</span>
            </div>
            <p className="text-xs text-[#b9b3a5] leading-[1.5]">
              Starts only when your GMC account connects. Cancel anytime before day 14 ends and you are never charged.
            </p>
          </div>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#f2a93b]">
              <RefreshCw className="w-4 h-4" />
              <span>14-Day Money-Back Guarantee</span>
            </div>
            <p className="text-xs text-[#b9b3a5] leading-[1.5]">
              First paid charge backed by a full refund if requested within 14 days. No questions asked.
            </p>
          </div>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#f2a93b]">
              <ShieldCheck className="w-4 h-4" />
              <span>1-Click Cancellation</span>
            </div>
            <p className="text-xs text-[#b9b3a5] leading-[1.5]">
              Self-serve directly in your settings dashboard. No phone calls, no support tickets, no retention friction.
            </p>
          </div>
        </div>

        {/* Section 1: Clear Commitment and Overview */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            1. Clear Commitment and Overview
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra provides mission-critical surveillance for Google Shopping feeds and Merchant Center accounts. We understand that e-commerce brand owners and performance marketing agencies depend on sub-30 second Slack alerts to halt wasted ad spend before campaign performance degrades.
          </p>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            We operate on a straightforward software-as-a-service model. All fees are transparently published, all billing cycles are billed monthly recurring in United States Dollars (USD), and you maintain absolute control over your subscription status at all times.
          </p>
        </section>

        {/* Section 2: 14-Day Free Trial Terms */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            2. 14-Day Free Trial Terms
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Every new customer receives a comprehensive 14-day free trial of Kultra with complete access to real-time incident detection, automated root cause translation, and instant Slack notifications.
          </p>
          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-3 text-[13.5px] text-[#b9b3a5]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#f2a93b] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#f4f1ea] font-medium">Activation Trigger:</strong> Your 14-day trial clock begins strictly at the exact timestamp when you connect your first Google Merchant Center account. Registering an account or browsing the setup screen does not start your trial timer.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#f2a93b] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#f4f1ea] font-medium">Zero-Risk Cancellation:</strong> If you decide Kultra is not the ideal solution for your business, you can cancel your subscription inside your settings dashboard at any moment during the 14-day window. If you cancel prior to the end of day 14, your payment method is never charged.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#f2a93b] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#f4f1ea] font-medium">Trial Expiration:</strong> If your trial period concludes without selecting an active subscription tier, real-time alert dispatching is safely silenced and the triage dashboard enters a paywall state until an active plan is activated.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: First-Payment 14-Day Money-Back Guarantee */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            3. First-Payment 14-Day Money-Back Guarantee
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            To eliminate all purchase risk for growing merchants and agencies, Kultra backs your very first subscription invoice with an unconditional <strong className="text-[#f4f1ea] font-medium">14-day money-back guarantee</strong>.
          </p>
          <ul className="space-y-2.5 text-[14px] text-[#b9b3a5] list-disc list-inside">
            <li>
              <strong className="text-[#f4f1ea] font-medium">Eligibility:</strong> This guarantee applies exclusively to first-time paying subscribers on either the Solo plan ($19/month) or the Agency plan ($49/month).
            </li>
            <li>
              <strong className="text-[#f4f1ea] font-medium">Claim Window:</strong> If within 14 calendar days of your initial paid transaction you determine Kultra does not seamlessly fit into your catalog triage operations, simply email support@usekultra.com.
            </li>
            <li>
              <strong className="text-[#f4f1ea] font-medium">Full Reimbursement:</strong> We will promptly issue a 100% refund of that initial charge back to your original payment card without requiring prolonged justifications.
            </li>
          </ul>
        </section>

        {/* Section 4: Subsequent Monthly Renewals */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            4. Subsequent Monthly Renewals
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Following the initial billing cycle, subscriptions renew automatically on a monthly recurring basis to guarantee continuous, 24/7 background surveillance of your merchant catalog.
          </p>
          <div className="space-y-3 text-[14px] text-[#b9b3a5]">
            <p>
              <strong className="text-[#f4f1ea] font-medium">Non-Refundable Renewal Charges:</strong> Recurring monthly renewals after your first paid cycle are non-refundable once processed. Because our infrastructure provisions continuous Google Cloud Pub/Sub subscriptions and compute resources on your behalf, we do not issue prorated refunds for partial month usage.
            </p>
            <p>
              <strong className="text-[#f4f1ea] font-medium">Retained Active Access:</strong> If you choose to cancel after a renewal invoice has settled, your account remains completely operational with full Slack notification capabilities and dashboard tools through the conclusion of your current paid billing period.
            </p>
            <p>
              <strong className="text-[#f4f1ea] font-medium">Automated Receipts:</strong> An automated digital receipt containing itemized transaction details, timestamp, and account metadata is dispatched to your registered account email immediately upon every successful charge.
            </p>
          </div>
        </section>

        {/* Section 5: Plan Upgrades and Downgrades */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            5. Plan Upgrades and Downgrades
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            You can transition between Kultra subscription tiers at any time directly through your account settings dashboard:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
              <h3 className="font-mono text-xs text-[#f2a93b] font-semibold">
                Solo Plan: $19 / Month
              </h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.5]">
                Tailored for standalone Shopify store owners. Monitors 1 Google Merchant Center account with unlimited catalog SKUs and instant Slack alert routing.
              </p>
            </div>

            <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2">
              <h3 className="font-mono text-xs text-[#f2a93b] font-semibold">
                Agency Plan: $49 / Month
              </h3>
              <p className="text-xs text-[#b9b3a5] leading-[1.5]">
                Built for performance marketing agencies. Unlocks up to 15 GMC client accounts, multi-tenant overview capabilities, and client-specific Slack channels.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-[14px] text-[#b9b3a5]">
            <p>
              <strong className="text-[#f4f1ea] font-medium">Immediate Upgrades:</strong> When upgrading from Solo to Agency, your account limits expand immediately so you can connect client stores without interruption. Any billing adjustment applies cleanly and transparently to your monthly cycle.
            </p>
            <p>
              <strong className="text-[#f4f1ea] font-medium">Downgrades:</strong> When downgrading from Agency to Solo, your existing multi-account privileges continue through the end of the paid monthly cycle, after which your account adjusts to single-store monitoring.
            </p>
          </div>
        </section>

        {/* Section 6: Frictionless Self-Serve Cancellation */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            6. Frictionless Self-Serve Cancellation
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            We respect your time and believe software cancellation should be effortless. We never make you place a telephone call, sit in a live chat queue, submit manual support tickets, or endure retention questionnaires.
          </p>

          <div className="p-5 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-3">
            <h3 className="font-mono text-xs text-[#f4f1ea] font-semibold tracking-[0.02em]">
              Steps to Cancel Your Subscription:
            </h3>
            <ol className="space-y-2 text-[13.5px] text-[#b9b3a5] list-decimal list-inside">
              <li>Log into your Kultra dashboard at <strong className="text-[#f4f1ea]">usekultra.com/login</strong>.</li>
              <li>Navigate to <strong className="text-[#f4f1ea]">Settings</strong> in the navigation bar.</li>
              <li>Select the <strong className="text-[#f4f1ea]">Subscription &amp; Billing</strong> tab.</li>
              <li>Click <strong className="text-[#f4f1ea]">Cancel Subscription</strong> and confirm your selection.</li>
            </ol>
          </div>

          <p className="text-[14px] leading-[1.6] text-[#b9b3a5]">
            <strong className="text-[#f4f1ea] font-medium">Post-Cancellation Behavior:</strong> Once confirmed, auto-renewal stops immediately. Your catalog surveillance and Slack notifications remain fully active until your current prepaid monthly cycle concludes. At that point, background event ingestion safely pauses and no further charges will ever occur.
          </p>
        </section>

        {/* Section 7: Alerting Reliability and Outage Credits */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            7. Alerting Reliability and Outage Credits
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Kultra maintains redundant Cloud Pub/Sub webhooks designed for 99.9% monitoring uptime. However, we acknowledge that rare third-party API disruptions or unexpected infrastructure downtimes can occur.
          </p>
          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2 text-[13.5px] text-[#b9b3a5]">
            <p>
              If our core alert pipeline experiences a verifiable, uninterrupted outage exceeding 12 hours that directly prevents incident dispatching, affected customers are eligible for <strong className="text-[#f4f1ea] font-medium">prorated billing credits or a partial refund</strong> for the affected billing period.
            </p>
            <p className="text-xs text-[#6b7078]">
              Note: Outage credits do not apply to downtime caused by customer-side Google OAuth token revocations, unverified Slack webhook URLs, or global Google API outages outside our control.
            </p>
          </div>
        </section>

        {/* Section 8: Step-by-Step Refund Request Process */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            8. Step-by-Step Refund Request Process
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            To request a refund under our 14-day first-payment guarantee or for verifiable service outage credits, follow this streamlined process:
          </p>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-3 text-[13.5px] text-[#b9b3a5]">
            <div className="flex items-center gap-2 text-[#f2a93b] font-mono text-xs">
              <Mail className="w-4 h-4" />
              <span>Email: support@usekultra.com</span>
            </div>
            <p>
              Please submit your request from your registered Kultra account email and include:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-xs pl-2">
              <li>Your primary account email address.</li>
              <li>The transaction date and approximate charge amount.</li>
              <li>A brief sentence indicating you would like a refund under the guarantee.</li>
            </ul>
          </div>

          <div className="space-y-2 text-[14px] text-[#b9b3a5]">
            <p>
              <strong className="text-[#f4f1ea] font-medium">Review Timeline:</strong> Our operational support team in Ouarzazate, Morocco reviews all refund inquiries in under 24 business hours.
            </p>
            <p>
              <strong className="text-[#f4f1ea] font-medium">Bank Processing Duration:</strong> Once approved and initiated, refunds typically take between 5 to 10 business days to appear on your bank statement, depending on your card issuer processing speed.
            </p>
          </div>
        </section>

        {/* Section 9: Chargeback Prevention and Dispute Policy */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            9. Chargeback Prevention and Dispute Policy
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            Chargebacks and payment disputes create severe overhead and processing penalties for independent software companies. Because Kultra provides an instant, self-serve cancellation mechanism and a guaranteed refund policy, initiating a formal chargeback with your banking institution is never necessary.
          </p>

          <div className="p-4 rounded-[4px] bg-[#131418] border border-[rgba(214,69,69,0.3)] space-y-2 text-[13.5px] text-[#b9b3a5]">
            <div className="flex items-center gap-2 text-[#d64545] font-mono text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>Immediate Account Freeze Upon Dispute</span>
            </div>
            <p>
              If a chargeback or payment dispute is initiated without prior communication with our support team:
            </p>
            <ul className="space-y-1 list-disc list-inside text-xs pl-1">
              <li>All real-time catalog monitoring and Slack webhook dispatching are frozen immediately.</li>
              <li>Connected Google Merchant Center accounts are decoupled from our active surveillance worker queue.</li>
              <li>The account is permanently disqualified from future promotional pricing, trials, or self-serve reactivation.</li>
            </ul>
          </div>

          <p className="text-[14px] text-[#b9b3a5]">
            If you ever notice an unrecognized transaction or have a question about an invoice, please contact <strong className="text-[#f4f1ea]">support@usekultra.com</strong> first. We will resolve your inquiry promptly and professionally.
          </p>
        </section>

        {/* Section 10: Contact and Business Details */}
        <section className="space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <h2 className="text-xl font-semibold font-display text-[#f4f1ea]">
            10. Contact and Business Details
          </h2>
          <p className="text-[14.5px] leading-[1.65] text-[#b9b3a5]">
            For any billing questions, cancellation assistance, or policy clarifications, contact our official support desk:
          </p>

          <div className="p-4 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] space-y-2 font-mono text-xs text-[#b9b3a5]">
            <div>
              <span className="text-[#6b7078]">Company: </span>
              <span className="text-[#f4f1ea]">Kultra</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Operational Seat: </span>
              <span className="text-[#f4f1ea]">Ouarzazate, Morocco</span>
            </div>
            <div>
              <span className="text-[#6b7078]">Direct Support Email: </span>
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

        {/* Bottom Navigation CTA Card */}
        <div className="p-6 sm:p-8 rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display text-lg font-semibold text-[#f4f1ea]">
              Ready to safeguard your Google Shopping campaigns?
            </h3>
            <p className="text-xs text-[#b9b3a5]">
              Activate your 14-day free trial. Zero credit card required to connect your catalog.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-[3px] bg-[#f2a93b] text-[#1a1305] font-semibold text-xs hover:bg-[#f6b855] transition-colors shrink-0"
          >
            <span>Start Free 14-Day Trial</span>
            <ArrowUpRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
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
            <Link href="/terms" className="hover:text-[#f4f1ea] transition-colors">
              Terms of Service
            </Link>
            <span>/</span>
            <span className="text-[#f2a93b]">Refund Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
