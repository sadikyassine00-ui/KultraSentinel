'use client';

import React from 'react';
import Link from 'next/link';
import { Check, RefreshCw } from 'lucide-react';
import type { PricingTier } from '@/config/pricing';

export interface PricingCardAction {
  type: 'link' | 'button';
  href?: string;
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface PricingCardProps {
  tier: PricingTier;
  action?: PricingCardAction;
  className?: string;
}

export function PricingCard({ tier, action, className = '' }: PricingCardProps) {
  const isSignal = tier.isBadgeAccent;
  const buttonLabel = action?.label || tier.ctaText;

  return (
    <div
      className={`rounded-[var(--radius-md)] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-150 relative ${
        isSignal
          ? 'bg-[var(--bg-surface)] border border-[var(--signal-dim)] overflow-hidden'
          : 'bg-[var(--bg-surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)]'
      } ${className}`}
      style={
        isSignal
          ? {
              background:
                'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 65%)',
            }
          : undefined
      }
    >
      <div>
        {/* Single Top-Right Badge Row (No competing top-left labels) */}
        <div className="flex items-center justify-end mb-3 min-h-[22px]">
          <span
            className={`tag-pill text-[10.5px] ${
              isSignal ? 'tag-signal' : 'tag-ghost'
            }`}
          >
            {tier.badge}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="font-display text-[1.4rem] font-semibold text-[var(--ink-primary)]">
          {tier.title}
        </h3>
        <p className="text-[13px] text-[var(--ghost-text)] mt-1 min-h-[38px] leading-[1.5]">
          {tier.subtitle}
        </p>

        {/* Price Block */}
        <div className="mt-5 mb-5 pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-[2.5rem] font-medium leading-none ${
                isSignal ? 'text-[var(--signal)]' : 'text-[var(--ink-primary)]'
              }`}
            >
              {tier.price}
            </span>
            <span className="font-mono text-[12px] text-[var(--ghost-text)]">
              {tier.pricePeriod}
            </span>
          </div>
          <div
            className={`font-mono text-[12px] mt-1.5 ${
              isSignal ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'
            }`}
          >
            {tier.subPriceLabel}
          </div>
        </div>

        {/* Exactly 5 Symmetrical Feature Bullets with Bold 2-3 Word Anchors */}
        <ul className="space-y-3 text-[13px] text-[var(--ink-secondary)]">
          {tier.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <Check
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isSignal ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'
                }`}
                strokeWidth={1.5}
              />
              <span>
                <strong className="text-[var(--ink-primary)] font-medium">
                  {bullet.anchor}
                </strong>{' '}
                {bullet.detail}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button & Anchored Micro-Copy */}
      <div className="mt-8 pt-6 border-t border-[var(--hairline)]">
        {action?.type === 'button' ? (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className={`w-full justify-center text-[13px] py-2.5 !rounded-[var(--radius-sm)] font-semibold disabled:opacity-50 inline-flex items-center gap-2 ${
              isSignal ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {action.loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{buttonLabel}</span>
            )}
          </button>
        ) : (
          <Link
            href={action?.href || (tier.id === 'agency' ? '/register?plan=agency' : '/register?plan=merchant')}
            onClick={action?.onClick}
            className={`w-full justify-center text-[13px] py-2.5 !rounded-[var(--radius-sm)] font-semibold inline-flex items-center text-center ${
              isSignal ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            <span>{buttonLabel}</span>
          </Link>
        )}

        <div className="mt-3 text-center">
          <span className="font-mono text-[11px] text-[var(--ghost-text)]">
            {tier.microCopy}
          </span>
        </div>
      </div>
    </div>
  );
}
