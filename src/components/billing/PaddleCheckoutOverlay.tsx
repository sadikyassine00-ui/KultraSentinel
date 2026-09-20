'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { getClientPaddleInstance, openPaddleOverlayCheckout } from '@/lib/paddle/client';
import { getPaddlePriceId, PADDLE_PLANS } from '@/lib/paddle/config';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

export interface UsePaddleCheckoutOptions {
  userEmail?: string;
  onSuccess?: (plan: 'solo' | 'agency') => void;
  onError?: (error: string) => void;
}

export function usePaddleCheckout(options?: UsePaddleCheckoutOptions) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-initialize Paddle.js in background
    getClientPaddleInstance().catch(() => {});
  }, []);

  const openCheckout = useCallback(
    async (plan: 'solo' | 'agency') => {
      setError(null);
      setIsInitializing(true);

      try {
        const priceId = getPaddlePriceId(plan);
        if (!priceId) {
          const err = `No Paddle Price ID configured for plan ${plan}. Check environment variables.`;
          setError(err);
          options?.onError?.(err);
          setIsInitializing(false);
          return false;
        }

        const successUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard/settings?tab=billing&checkout_success=true&plan=${plan}`
          : undefined;

        const success = await openPaddleOverlayCheckout({
          priceId,
          customerEmail: options?.userEmail,
          customData: {
            accountPlan: plan,
            tenantEmail: options?.userEmail,
          },
          successUrl,
        });

        if (!success) {
          // If Paddle.js could not be initialized (e.g. missing client token), fall back to server redirect
          const fallbackRes = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
          });

          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            if (data.url) {
              window.location.href = data.url;
              return true;
            }
          }

          const err = 'Failed to launch Paddle checkout. Verify client token or connection.';
          setError(err);
          options?.onError?.(err);
          return false;
        }

        setIsCheckoutOpen(true);
        options?.onSuccess?.(plan);
        return true;
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

  return {
    openCheckout,
    isInitializing,
    isCheckoutOpen,
    error,
  };
}

interface PaddleCheckoutButtonProps {
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
  const { openCheckout, isInitializing, error } = usePaddleCheckout({
    userEmail,
    onSuccess: () => onSuccess?.(),
    onError: (err) => onError?.(err),
  });

  const config = PADDLE_PLANS[plan];
  const defaultLabel = plan === 'agency'
    ? `Upgrade to Agency ($${config.monthlyPriceUsd}/mo)`
    : `Upgrade to Solo ($${config.monthlyPriceUsd}/mo)`;

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={isInitializing}
        onClick={() => openCheckout(plan)}
        className={
          className ||
          (plan === 'agency'
            ? 'btn-primary w-full justify-center text-[13px] py-2.5 !rounded-[3px] font-semibold disabled:opacity-50'
            : 'btn-secondary w-full justify-center text-[13px] py-2.5 !rounded-[3px] font-semibold disabled:opacity-50')
        }
      >
        {isInitializing ? (
          <span className="inline-flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Loading Checkout...</span>
          </span>
        ) : (
          children || defaultLabel
        )}
      </button>

      {error && (
        <div className="mt-2 text-[12px] text-[var(--danger)] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
