'use client';

import React, { useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { PRICING_TIERS } from '@/config/pricing';
import { PricingCard } from '@/components/billing/PricingCard';

export interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'solo' | 'agency') => void;
  currentStoresCount?: number;
}

export function PlanSelectionModal({
  isOpen,
  onClose,
  onSelectPlan,
  currentStoresCount = 1,
}: PlanSelectionModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-selection-modal-title"
      className="fixed inset-0 z-[9999] bg-[#0a0b0d]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] w-full max-w-[calc(100vw-24px)] sm:max-w-[720px] md:max-w-[780px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] my-auto overflow-hidden relative box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-7 border-b border-[var(--hairline)] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10.5px] sm:text-[11px] text-[var(--signal)] tracking-wider uppercase font-semibold">
                SURVEILLANCE TIERS
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] border border-[var(--signal-dim)] text-[10px] font-mono text-[var(--signal)] bg-[var(--signal-wash)] font-medium">
                Continuous Monitoring
              </span>
            </div>
            <h2
              id="plan-selection-modal-title"
              className="font-serif text-[22px] sm:text-[26px] font-semibold text-[var(--ink-primary)] leading-tight"
            >
              Select Your Monitoring Plan
            </h2>
            <p className="text-[13px] sm:text-[13.5px] text-[var(--ghost-text)] mt-1 leading-snug">
              Choose the monitoring capacity tailored to your catalog scale. Billed transparently with zero setup fees.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close plan selection modal"
            className="min-w-[40px] min-h-[40px] -mr-1 -mt-1 p-2 rounded-[var(--radius-sm)] text-[var(--ghost-text)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-2)] transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tiers Grid: Stacked on mobile, side-by-side on tablet/desktop */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          <PricingCard
            tier={PRICING_TIERS.solo}
            action={{
              type: 'button',
              onClick: () => onSelectPlan('solo'),
              label: PRICING_TIERS.solo.ctaText,
            }}
          />

          <PricingCard
            tier={PRICING_TIERS.agency}
            action={{
              type: 'button',
              onClick: () => onSelectPlan('agency'),
              label: PRICING_TIERS.agency.ctaText,
            }}
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-3.5 bg-[var(--bg-surface-2)] border-t border-[var(--hairline)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px] text-[var(--ghost-text)] font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--signal)] shrink-0" />
            <span>Encrypted checkout via Paddle (Cancel or change tiers anytime)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] transition-colors hover:underline"
          >
            Keep current trial
          </button>
        </div>
      </div>
    </div>
  );
}
