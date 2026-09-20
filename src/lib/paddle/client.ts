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
  frameTarget?: string;
  onClose?: () => void;
}

export async function openPaddleOverlayCheckout(options: OpenCheckoutOptions): Promise<boolean> {
  const paddle = await getClientPaddleInstance();
  if (!paddle) {
    return false;
  }

  const isInline = Boolean(options.frameTarget);
  const settings = {
    variant: 'one-page' as const,
    theme: 'dark' as const,
    displayMode: (isInline ? 'inline' : 'overlay') as 'inline' | 'overlay',
    ...(isInline
      ? {
          frameTarget: options.frameTarget,
          frameInitialHeight: 450,
          frameStyle: 'width: 100%; min-height: 450px; background-color: transparent; border: none;',
        }
      : {}),
    ...(options.successUrl ? { successUrl: options.successUrl } : {}),
  };

  // Filter out any undefined or null keys from customData to prevent Paddle 400 Bad Request
  const cleanCustomData: Record<string, string | number | boolean> = {};
  if (options.customData) {
    for (const [k, v] of Object.entries(options.customData)) {
      if (v !== undefined && v !== null && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
        cleanCustomData[k] = v;
      }
    }
  }

  const customerEmail = options.customerEmail?.trim().toLowerCase();

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
      ...(customerEmail ? { customer: { email: customerEmail } } : {}),
      ...(options.customerId ? { customer: { id: options.customerId } } : {}),
      ...(Object.keys(cleanCustomData).length > 0 ? { customData: cleanCustomData } : {}),
      settings,
    });
    return true;
  }

  return false;
}
