'use client';

import { initializePaddle, type Paddle, type Environments } from '@paddle/paddle-js';
import { getPaddleClientToken, getPaddleEnvironment } from './config';

let paddlePromise: Promise<Paddle | undefined> | null = null;
let paddleInstance: Paddle | null = null;

export async function getClientPaddleInstance(): Promise<Paddle | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (paddleInstance && paddleInstance.Initialized) {
    return paddleInstance;
  }

  const token = getPaddleClientToken();
  if (!token) {
    console.warn('[Paddle.js] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured.');
    return null;
  }

  if (!paddlePromise) {
    const env = (getPaddleEnvironment() === 'production' ? 'production' : 'sandbox') as Environments;
    paddlePromise = initializePaddle({
      token,
      environment: env,
      checkout: {
        settings: {
          variant: 'one-page',
          theme: 'dark',
          displayMode: 'overlay',
        },
      },
    }).then((instance) => {
      if (instance) {
        paddleInstance = instance;
      }
      return instance;
    }).catch((err) => {
      console.error('[Paddle.js] Initialization failed:', err);
      paddlePromise = null;
      return undefined;
    });
  }

  const instance = await paddlePromise;
  return instance || null;
}

export interface OpenCheckoutOptions {
  transactionId?: string;
  priceId?: string;
  customerEmail?: string;
  customerId?: string;
  successUrl?: string;
  customData?: Record<string, unknown>;
  onClose?: () => void;
}

export async function openPaddleOverlayCheckout(options: OpenCheckoutOptions): Promise<boolean> {
  const paddle = await getClientPaddleInstance();
  if (!paddle) {
    return false;
  }

  const settings = {
    variant: 'one-page' as const,
    theme: 'dark' as const,
    displayMode: 'overlay' as const,
    ...(options.successUrl ? { successUrl: options.successUrl } : {}),
  };

  if (options.transactionId) {
    paddle.Checkout.open({
      transactionId: options.transactionId,
      settings,
    });
    return true;
  }

  if (options.priceId) {
    paddle.Checkout.open({
      items: [{ priceId: options.priceId, quantity: 1 }],
      ...(options.customerEmail ? { customer: { email: options.customerEmail } } : {}),
      ...(options.customerId ? { customer: { id: options.customerId } } : {}),
      ...(options.customData ? { customData: options.customData } : {}),
      settings,
    });
    return true;
  }

  return false;
}
