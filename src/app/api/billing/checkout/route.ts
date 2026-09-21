import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { isSuperAdminEmail } from '@/lib/token';
import { findTenantByEmail } from '@/lib/db';
import { getPaddleInstance } from '@/lib/paddle/server';
import { getPaddlePriceId } from '@/lib/paddle/config';

export async function POST(request: Request) {
  try {
    const session = await getAnySession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const email = session.email.toLowerCase().trim();

    // Superadmin bypass: permanent lifetime access
    if (isSuperAdminEmail(email)) {
      return NextResponse.json({
        url: '/dashboard/settings?tab=billing',
        message: 'Superadmin account has permanent lifetime access.',
      });
    }

    const body = await request.json().catch(() => ({}));
    const requestedPlan = body.plan === 'agency' ? 'agency' : 'solo';
    const priceId = getPaddlePriceId(requestedPlan);

    if (!priceId) {
      return NextResponse.json(
        { error: `No active price configured for plan: ${requestedPlan}` },
        { status: 400 }
      );
    }

    const tenant = await findTenantByEmail(email);

    // Call Paddle API (sandbox or production) to create an authentic checkout transaction session
    try {
      const cleanCustomData: Record<string, string> = {
        tenantEmail: email,
        accountPlan: requestedPlan,
      };
      if (tenant?.id) {
        cleanCustomData.userId = String(tenant.id);
        cleanCustomData.tenantId = String(tenant.id);
      }

      const paddle = getPaddleInstance();
      const transaction = await paddle.transactions.create({
        items: [{ priceId, quantity: 1 }],
        customData: cleanCustomData,
      });

      const checkoutUrl = transaction.checkout?.url;
      const transactionId = transaction.id;

      if (!checkoutUrl && !transactionId) {
        throw new Error('Paddle transaction did not return a checkout URL or transaction ID.');
      }

      return NextResponse.json({
        url: checkoutUrl,
        transactionId,
        priceId,
        plan: requestedPlan,
        customData: {
          tenantEmail: email,
          accountPlan: requestedPlan,
          userId: tenant ? String(tenant.id) : undefined,
          tenantId: tenant ? String(tenant.id) : undefined,
        },
      });
    } catch (paddleErr: unknown) {
      const err = paddleErr as { message?: string; code?: string };
      console.warn('[Paddle Server Transaction Notice]:', err?.message || err);

      // If Paddle server-side transaction creation cannot be completed (e.g. default payment link not configured
      // in Paddle dashboard, or server API key credential issue), return the verified priceId and metadata
      // for Paddle.js native client overlay initiation.
      // NOTE: ZERO direct DB mutation occurs! Account remains in trial until signed webhook arrives.
      if (priceId) {
        return NextResponse.json({
          priceId,
          plan: requestedPlan,
          clientInit: true,
          customerEmail: email,
          customData: {
            tenantEmail: email,
            accountPlan: requestedPlan,
            userId: tenant ? String(tenant.id) : undefined,
            tenantId: tenant ? String(tenant.id) : undefined,
          },
        });
      }

      // Check Stripe fallback only if STRIPE_SECRET_KEY is configured
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
      if (stripeSecretKey) {
        const origin = new URL(request.url).origin;
        const planName = requestedPlan === 'agency' ? 'Agency Fleet' : 'Solo Merchant';
        const priceInCents = requestedPlan === 'agency' ? 4900 : 1900;

        const params = new URLSearchParams();
        params.append('mode', 'subscription');
        params.append('customer_email', email);
        params.append('client_reference_id', email);
        params.append('success_url', `${origin}/dashboard/settings?tab=billing&checkout_success=true&plan=${requestedPlan}`);
        params.append('cancel_url', `${origin}/dashboard/settings?tab=billing`);
        params.append('line_items[0][price_data][currency]', 'usd');
        params.append('line_items[0][price_data][product_data][name]', `Kultra - ${planName}`);
        params.append('line_items[0][price_data][product_data][description]', requestedPlan === 'agency' ? 'Unlimited GMC Stores, MCA Architecture & Priority Dispatch' : 'Single GMC Store 24/7 Monitoring & Disapproval Shield');
        params.append('line_items[0][price_data][product_data][statement_descriptor]', 'KULTRA SAAS');
        params.append('line_items[0][price_data][recurring][interval]', 'month');
        params.append('line_items[0][price_data][unit_amount]', String(priceInCents));
        params.append('line_items[0][quantity]', '1');
        params.append('subscription_data[description]', 'KULTRA SAAS');
        params.append('metadata[tenantEmail]', email);
        params.append('metadata[accountPlan]', requestedPlan);
        if (tenant?.id) {
          params.append('metadata[userId]', String(tenant.id));
          params.append('metadata[tenantId]', String(tenant.id));
        }

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (stripeRes.ok) {
          const stripeSession = await stripeRes.json();
          return NextResponse.json({ url: stripeSession.url, plan: requestedPlan });
        }
      }

      // CRITICAL: ZERO mock DB elevation! Never mutate database subscription status or plan tier directly.
      // Subscriptions must strictly be initiated through a live payment checkout session,
      // and paid tier status must only activate upon receiving a cryptographically verified webhook.
      return NextResponse.json(
        { error: 'Failed to initiate payment checkout session with payment provider. Please try again.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('[Billing Checkout API Error]', error);
    return NextResponse.json({ error: 'Failed to initiate checkout session' }, { status: 500 });
  }
}
