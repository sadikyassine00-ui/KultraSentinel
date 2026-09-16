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
          <span className="font-mono text-[11px] text-[var(--ghost-text)] tracking-[0.02em] block mb-2">
            Security &amp; compliance
          </span>
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Enterprise-grade data protection, zero catalog mutation
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55] max-w-[65ch]">
            Kultra operates strictly as a read-only monitoring and telemetry watchdog. Your product catalog, advertising campaigns, and customer data remain untouched.
          </p>
        </div>

        {/* 3 Prominent Compliance & Credibility Standards (§3 Compliance Directive) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Standard 1: AES-256-GCM */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center mb-4">
                <Lock className="w-4 h-4 text-[var(--signal)]" strokeWidth={1.5} />
              </div>
              <span className="tag-pill tag-ghost text-[10px] mb-2 inline-block">
                Cryptographic storage
              </span>
              <h3 className="font-display text-[16px] font-semibold text-[var(--ink-primary)] mb-2">
                AES-256-GCM Token Encryption at Rest
              </h3>
              <p className="text-[13px] text-[var(--ghost-text)] leading-[1.55]">
                OAuth refresh tokens, merchant API credentials, and client webhook targets are encrypted using authenticated Galois/Counter Mode with isolated secret management.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--hairline)] font-mono text-[10.5px] text-[var(--ghost-text)]">
              FIPS 140-2 aligned
            </div>
          </div>

          {/* Standard 2: TLS 1.3 */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center mb-4">
                <Server className="w-4 h-4 text-[var(--signal)]" strokeWidth={1.5} />
              </div>
              <span className="tag-pill tag-ghost text-[10px] mb-2 inline-block">
                Encrypted in transit
              </span>
              <h3 className="font-display text-[16px] font-semibold text-[var(--ink-primary)] mb-2">
                Enforced TLS 1.3 Transport
              </h3>
              <p className="text-[13px] text-[var(--ghost-text)] leading-[1.55]">
                All incoming Pub/Sub ingestion webhooks, API dispatches, and dashboard browser traffic enforce TLS 1.3 encryption with strict HSTS headers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--hairline)] font-mono text-[10.5px] text-[var(--ghost-text)]">
              Forward secrecy enforced
            </div>
          </div>

          {/* Standard 3: Google Limited Use */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--signal-dim)] p-6 flex flex-col justify-between relative overflow-hidden"
               style={{ background: 'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 65%)' }}>
            <div>
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center mb-4">
                <Shield className="w-4 h-4 text-[var(--signal)]" strokeWidth={1.5} />
              </div>
              <span className="tag-pill tag-signal text-[10px] mb-2 inline-block">
                OAuth verification verified
              </span>
              <h3 className="font-display text-[16px] font-semibold text-[var(--ink-primary)] mb-2">
                Google Limited Use Policy Compliant
              </h3>
              <p className="text-[13px] text-[var(--ink-secondary)] leading-[1.55]">
                Kultra adheres strictly to the Google API Services User Data Policy, including the Limited Use requirements. We never transfer or sell merchant data, nor use it for advertising or AI training.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--hairline)] font-mono text-[10.5px] text-[var(--signal)]">
              Limited Use verified
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
                  Strict non-mutation guarantee
                </span>
              </div>
              <h3 className="font-display text-[1.25rem] font-semibold text-[var(--ink-primary)]">
                Why Google displays a &ldquo;Manage&rdquo; prompt during authorization
              </h3>
              <p className="text-[13.5px] text-[var(--ghost-text)] leading-[1.6]">
                Google Merchant Center API does not provide a dedicated read-only scope tier. The standard OAuth consent screen displays &ldquo;Manage your product listings&rdquo; as Google&apos;s default category description.
              </p>
              <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] text-[13px] text-[var(--ink-primary)] leading-[1.55]">
                <strong className="text-[var(--signal)] font-semibold">Core Guarantee:</strong> Kultra operates strictly in read-only diagnostic telemetry mode. Kultra will never edit, overwrite, delete, or mutate your product catalog, pricing, or Google Ads campaigns.
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/register"
                className="btn-primary text-[13px] py-2.5 px-5 !rounded-[3px] text-center"
              >
                Start free 7-day trial
              </Link>
              <Link
                href="/privacy"
                className="btn-secondary text-[13px] py-2.5 px-5 !rounded-[3px] text-center flex items-center justify-center gap-1.5"
              >
                <span>Read Privacy Disclosures</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--ghost-text)]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
