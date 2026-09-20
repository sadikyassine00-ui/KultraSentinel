'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getClientPaddleInstance, openPaddleOverlayCheckout } from '@/lib/paddle/client';
import { getPaddlePriceId, PADDLE_PLANS } from '@/lib/paddle/config';
import { RefreshCw, ShieldCheck, AlertCircle, X, Shield, Lock, Check } from 'lucide-react';

export interface UsePaddleCheckoutOptions {
  userEmail?: string;
  onSuccess?: (plan: 'solo' | 'agency') => void;
  onError?: (error: string) => void;
}

export function usePaddleCheckout(options?: UsePaddleCheckoutOptions) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<'solo' | 'agency' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-initialize Paddle.js in background
    getClientPaddleInstance().catch(() => {});
  }, []);

  const openCheckout = useCallback(
    async (plan: 'solo' | 'agency') => {
      setError(null);
      setIsInitializing(true);
      setActivePlan(plan);

      try {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initiate checkout session.');
        }

        const successUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard/settings?tab=billing&checkout_success=true&plan=${plan}`
          : undefined;

        // 1. Try opening native Paddle checkout with server-generated transaction ID
        if (data.transactionId) {
          const opened = await openPaddleOverlayCheckout({
            transactionId: data.transactionId,
            successUrl,
          });
          if (opened) {
            setIsCheckoutOpen(true);
            return true;
          }
        }

        // 2. Fallback: redirect cleanly to hosted checkout URL
        if (data.url) {
          window.location.href = data.url;
          return true;
        }

        // 3. Open native Paddle overlay directly with verified priceId and metadata
        if (data.priceId) {
          const opened = await openPaddleOverlayCheckout({
            priceId: data.priceId,
            customerEmail: data.customerEmail || options?.userEmail,
            customData: data.customData,
            successUrl,
          });
          if (opened) {
            setIsCheckoutOpen(true);
            return true;
          }
        }

        throw new Error('No checkout URL or transaction ID returned by payment provider.');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error initiating Paddle checkout';
        setError(message);
        options?.onError?.(message);
        return false;
      } finally {
        setIsInitializing(false);
      }
    },
    [options]
  );

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    setActivePlan(null);
    setError(null);
  }, []);

  return {
    openCheckout,
    closeCheckout,
    isInitializing,
    isCheckoutOpen,
    activePlan,
    error,
  };
}

export interface PaddleCheckoutModalProps {
  isOpen: boolean;
  plan: 'solo' | 'agency';
  userEmail?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export function PaddleCheckoutModal({
  isOpen,
  plan,
  userEmail,
  onClose,
  onSuccess,
  onError,
}: PaddleCheckoutModalProps) {
  const [loadingFrame, setLoadingFrame] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const config = PADDLE_PLANS[plan];
  const priceId = getPaddlePriceId(plan);

  useEffect(() => {
    if (!isOpen) {
      setLoadingFrame(true);
      setCheckoutError(null);
      return;
    }

    let isMounted = true;

    async function mountCheckout() {
      setLoadingFrame(true);
      setCheckoutError(null);

      try {
        const paddle = await getClientPaddleInstance();
        if (!paddle) {
          throw new Error('Payment provider is not available. Please check your connection.');
        }

        // Request checkout session from backend
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initiate checkout session.');
        }

        if (!isMounted) return;

        const successUrl = `${window.location.origin}/dashboard/settings?tab=billing&checkout_success=true&plan=${plan}`;

        // Attempt inline frame render first for strict on-brand integration
        const opened = await openPaddleOverlayCheckout({
          transactionId: data.transactionId,
          priceId: data.priceId || priceId,
          customerEmail: data.customerEmail || userEmail,
          customData: data.customData,
          frameTarget: 'paddle-modal-checkout-frame',
          successUrl,
        });

        if (!opened) {
          throw new Error('Unable to mount checkout frame.');
        }

        if (isMounted) {
          setLoadingFrame(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Error mounting checkout';
          setCheckoutError(message);
          setLoadingFrame(false);
          onError?.(message);
        }
      }
    }

    mountCheckout();

    return () => {
      isMounted = false;
    };
  }, [isOpen, plan, userEmail, priceId, onError]);

  if (!isOpen) return null;

  const planTitle = plan === 'agency' ? 'Agency Fleet' : 'Solo Merchant';
  const priceAmount = plan === 'agency' ? '$49' : '$19';
  const priceCents = plan === 'agency' ? '$49.00' : '$19.00';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 bg-[#0a0b0d]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] w-full max-w-[500px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] my-auto overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (§2, §3, GEMINI.md) */}
        <div className="p-5 sm:p-6 border-b border-[var(--hairline)] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10.5px] text-[var(--signal)] tracking-wider uppercase">
                IMMEDIATE BILLING
              </span>
              <span className="tag-pill tag-signal text-[10px] py-0.5">
                {plan === 'agency' ? 'Unlimited GMC' : 'Single Store'}
              </span>
            </div>
            <h3 id="checkout-modal-title" className="font-serif text-[22px] font-semibold text-[var(--ink-primary)] leading-tight">
              {planTitle}
            </h3>
            <p className="text-[13px] text-[var(--ghost-text)] mt-1">
              {config.description}
            </p>
          </div>

          {/* Touch-Friendly Close Button: min 44x44px hit target (§3) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout modal"
            className="checkout-touch-target min-w-[44px] min-h-[44px] -mr-2 -mt-2 p-2.5 rounded-[var(--radius-sm)] text-[var(--ghost-text)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-2)] transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Immediate Billing Breakdown & Cardless Trial Reassurance */}
        <div className="px-5 py-4 sm:px-6 bg-[var(--bg-canvas)] border-b border-[var(--hairline)]">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-[12.5px] font-medium text-[var(--ink-primary)]">
                Amount Due Today
              </div>
              <div className="text-[11.5px] text-[var(--ghost-text)] mt-0.5">
                Billed immediately. Auto-renews monthly. Cancel anytime.
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[20px] font-semibold text-[var(--ink-primary)]">
                {priceCents} <span className="text-[12px] text-[var(--ghost-text)] font-normal">USD</span>
              </div>
              <div className="font-mono text-[11px] text-[var(--signal)] mt-0.5">
                {priceAmount}/month recurring
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--hairline)] flex items-center gap-2 text-[11.5px] text-[var(--ghost-text-dim)]">
            <Lock className="w-3.5 h-3.5 text-[var(--signal)] shrink-0" />
            <span>Cardless 14-day trial is decoupled. Upgrading charges your payment method today.</span>
          </div>
        </div>

        {/* Checkout Content Body */}
        <div className="p-5 sm:p-6 min-h-[440px] flex flex-col justify-center">
          {loadingFrame && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[var(--signal)] animate-spin" />
              <div className="text-[13px] font-medium text-[var(--ink-primary)]">
                Preparing Secure Checkout...
              </div>
              <div className="text-[11.5px] text-[var(--ghost-text)] font-mono">
                Establishing 256-bit encrypted session
              </div>
            </div>
          )}

          {checkoutError && (
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-left space-y-2">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--danger)]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Checkout Initialization Notice</span>
              </div>
              <p className="text-[12px] text-[var(--ink-secondary)]">
                {checkoutError}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLoadingFrame(true);
                    setCheckoutError(null);
                    // Trigger overlay fallback directly
                    openPaddleOverlayCheckout({
                      priceId,
                      customerEmail: userEmail,
                    }).catch(() => {});
                  }}
                  className="btn-secondary text-[12px] py-2 px-3 !rounded-[var(--radius-sm)]"
                >
                  Retry in Overlay
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[12px] text-[var(--ghost-text)] hover:text-[var(--ink-primary)] underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Paddle Inline Container Target */}
          <div
            id="paddle-modal-checkout-frame"
            className={`paddle-checkout-frame ${loadingFrame || checkoutError ? 'hidden' : 'block'}`}
          />
        </div>

        {/* Modal Footer (§3) */}
        <div className="px-5 py-3.5 sm:px-6 bg-[var(--bg-surface-2)] border-t border-[var(--hairline)] flex items-center justify-between text-[11px] text-[var(--ghost-text-dim)] font-mono">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[var(--signal)]" />
            PCI-DSS LEVEL 1 CERTIFIED
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] transition-colors min-h-[44px] flex items-center"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </div>
  );
}

export interface PaddleCheckoutButtonProps {
  plan: 'solo' | 'agency';
  userEmail?: string;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export function PaddleCheckoutButton({
  plan,
  userEmail,
  className,
  children,
  onSuccess,
  onError,
}: PaddleCheckoutButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const config = PADDLE_PLANS[plan];
  const defaultLabel = plan === 'agency'
    ? `Upgrade to Agency ($${config.monthlyPriceUsd}/mo)`
    : `Upgrade to Solo ($${config.monthlyPriceUsd}/mo)`;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={
          className ||
          (plan === 'agency'
            ? 'btn-primary w-full justify-center text-[13px] py-2.5 !rounded-[3px] font-semibold min-h-[44px]'
            : 'btn-secondary w-full justify-center text-[13px] py-2.5 !rounded-[3px] font-semibold min-h-[44px]')
        }
      >
        {children || defaultLabel}
      </button>

      <PaddleCheckoutModal
        isOpen={modalOpen}
        plan={plan}
        userEmail={userEmail}
        onClose={() => setModalOpen(false)}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  );
}
