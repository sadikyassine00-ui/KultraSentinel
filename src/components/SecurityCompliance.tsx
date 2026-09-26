'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Server, CheckCircle2, ArrowRight } from 'lucide-react';

export function SecurityCompliance() {
  return (
    <section
      id="security"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div className="relative z-10 max-w-[1140px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12 sm:mb-14">
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Enterprise-Grade Security. Zero Risk to Client Feeds.
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55] max-w-[65ch]">
            Kultra operates strictly as a passive, read-only monitoring layer. Your product feeds, active campaigns, and client data remain completely untouched.
          </p>
        </div>

        {/* 3 Prominent Compliance & Credibility Standards (§3 Compliance Directive) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Card 1: Data Storage and Token Security */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center mb-4">
                <Lock className="w-4 h-4 text-[var(--signal)]" strokeWidth={1.5} />
              </div>
              <span className="tag-pill tag-ghost text-[10px] mb-2 inline-block">
                Encrypted at Rest
              </span>
              <h3 className="font-display text-[16px] font-semibold text-[var(--ink-primary)] mb-2">
                AES-256 Token Encryption
              </h3>
              <p className="text-[13px] text-[var(--ghost-text)] leading-[1.55]">
                OAuth refresh tokens and credentials are encrypted at rest using industry-standard AES-256 encryption. Your client credentials never sit exposed in plain text.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--hairline)] font-mono text-[10.5px] text-[var(--ghost-text)]">
              Zero plain-text storage
            </div>
          </div>

          {/* Card 2: Transport Layer Security */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center mb-4">
                <Server className="w-4 h-4 text-[var(--signal)]" strokeWidth={1.5} />
              </div>
              <span className="tag-pill tag-ghost text-[10px] mb-2 inline-block">
                Secure Transmission
              </span>
              <h3 className="font-display text-[16px] font-semibold text-[var(--ink-primary)] mb-2">
                Enforced TLS 1.3 Transport
              </h3>
              <p className="text-[13px] text-[var(--ghost-text)] leading-[1.55]">
                All incoming Google Pub/Sub alerts, dashboard communication, and outbound Slack webhooks are encrypted in transit over modern TLS protocols.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--hairline)] font-mono text-[10.5px] text-[var(--ghost-text)]">
              Encrypted in transit
            </div>
          </div>

          {/* Card 3: Google Compliance and Privacy (Highlighted Card) */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--signal-dim)] p-6 flex flex-col justify-between relative overflow-hidden"
               style={{ background: 'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 65%)' }}>
            <div>
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center mb-4">
                <Shield className="w-4 h-4 text-[var(--signal)]" strokeWidth={1.5} />
              </div>
              <span className="tag-pill tag-signal text-[10px] mb-2 inline-block">
                Google API Standards
              </span>
              <h3 className="font-display text-[16px] font-semibold text-[var(--ink-primary)] mb-2">
                Google Limited Use Compliant
              </h3>
              <p className="text-[13px] text-[var(--ink-secondary)] leading-[1.55]">
                Kultra adheres strictly to Google API Services User Data Policy Limited Use requirements. We never transfer, monetize, or sell merchant data, nor do we use it to train AI models.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--hairline)] font-mono text-[10.5px] text-[var(--signal)]">
              Zero data monetization
            </div>
          </div>
        </div>

        {/* Read-Only Non-Mutation Guarantee Panel */}
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-[700px]">
              <div className="flex items-center gap-2">
                <span className="tag-pill tag-ghost text-[10.5px]">
                  Pre-OAuth transparency
                </span>
                <span className="font-mono text-[11px] text-[var(--ghost-text)]">
                  Strict read-only guarantee
                </span>
              </div>
              <h3 className="font-display text-[1.25rem] font-semibold text-[var(--ink-primary)]">
                Why Google displays a &ldquo;Manage&rdquo; prompt during authorization
              </h3>
              <p className="text-[13.5px] text-[var(--ghost-text)] leading-[1.6]">
                Google Merchant Center API does not provide a dedicated read-only scope tier. The standard OAuth consent screen displays &ldquo;Manage your product listings&rdquo; as Google&apos;s default category description.
              </p>
              <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] text-[13px] text-[var(--ink-primary)] leading-[1.55]">
                <strong className="text-[var(--signal)] font-semibold">Core Guarantee:</strong> Kultra operates strictly as a passive, read-only monitoring layer. Kultra will never edit, overwrite, delete, or modify your product feeds, pricing, or active campaigns.
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center sm:items-start lg:items-center gap-2.5">
              <Link
                href="/register"
                className="btn-primary text-[13px] py-2.5 px-5 !rounded-[var(--radius-sm)] text-center w-full font-semibold inline-flex items-center justify-center"
              >
                Start 14-Day Trial
              </Link>
              <Link
                href="/privacy"
                className="text-[12px] text-[var(--ghost-text)] hover:text-[var(--ink-primary)] underline underline-offset-2 transition-colors"
              >
                Read privacy disclosures
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
