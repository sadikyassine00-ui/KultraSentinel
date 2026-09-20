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

        // 1. Try opening native Paddle checkout overlay with server-generated transaction ID
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
