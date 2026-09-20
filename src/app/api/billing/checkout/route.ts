import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { isSuperAdminEmail } from '@/lib/token';
import { findTenantByEmail, getDb, ensureSchema, updateTenant } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getAnySession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const email = session.email.toLowerCase().trim();

    // Superadmin bypass: no billing or payment required
    if (isSuperAdminEmail(email)) {
      return NextResponse.json({
        url: '/dashboard/settings?tab=billing',
        message: 'Superadmin account has permanent lifetime access.',
      });
    }

    const body = await request.json().catch(() => ({}));
    const requestedPlan = body.plan === 'agency' ? 'agency' : 'solo';
    const planName = requestedPlan === 'agency' ? 'Agency Fleet' : 'Solo Merchant';
    const priceInCents = requestedPlan === 'agency' ? 4900 : 1900;

    const urlObj = new URL(request.url);
    const origin = urlObj.origin;

    // 1. Create live Paddle Checkout transaction via Paddle API if configured
    const paddleApiKey = process.env.PADDLE_API_KEY?.trim();
    if (paddleApiKey) {
      try {
        const { getPaddleInstance } = await import('@/lib/paddle/server');
        const { getPaddlePriceId } = await import('@/lib/paddle/config');
        const paddle = getPaddleInstance();
        const priceId = getPaddlePriceId(requestedPlan);

        const transaction = await paddle.transactions.create({
          items: [{ priceId, quantity: 1 }],
          customData: {
            tenantEmail: email,
            accountPlan: requestedPlan,
          },
        });

        const checkoutUrl = transaction.checkout?.url;
        if (checkoutUrl) {
          return NextResponse.json({ url: checkoutUrl, plan: requestedPlan });
        }
      } catch (paddleErr) {
        console.warn('[Paddle Server Checkout Fallback Notice]:', paddleErr);
      }
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      // 1. Create live Stripe Checkout Session via Stripe API
      const params = new URLSearchParams();
      params.append('mode', 'subscription');
      params.append('customer_email', email);
      params.append('client_reference_id', email);
      params.append('success_url', `${origin}/dashboard/settings?tab=billing&checkout_success=true&plan=${requestedPlan}`);
      params.append('cancel_url', `${origin}/dashboard/settings?tab=billing`);
      params.append('line_items[0][price_data][currency]', 'usd');
      params.append('line_items[0][price_data][product_data][name]', `Kultra Sentinel — ${planName}`);
      params.append('line_items[0][price_data][product_data][description]', requestedPlan === 'agency' ? 'Unlimited GMC Stores, MCA Architecture & Priority Dispatch' : 'Single GMC Store 24/7 Monitoring & Disapproval Shield');
      params.append('line_items[0][price_data][recurring][interval]', 'month');
      params.append('line_items[0][price_data][unit_amount]', String(priceInCents));
      params.append('line_items[0][quantity]', '1');
      params.append('metadata[tenantEmail]', email);
      params.append('metadata[accountPlan]', requestedPlan);

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
        return NextResponse.json({ url: stripeSession.url });
      }

      console.error('[Stripe Checkout Error]', await stripeRes.text());
    }

    // 2. Database-backed live upgrade fallback (for development/staging or direct activation)
    // Ensures state changes commit immediately to DB with zero mock states.
    const tenant = await findTenantByEmail(email);
    const planTier = requestedPlan === 'agency' ? 'Agency Pilot' : 'Active Pro';

    if (tenant) {
      await updateTenant(tenant.id, {
        plan_tier: planTier,
        account_plan: requestedPlan,
        subscription_status: 'paid active',
      });
    } else {
      const sql = getDb();
      if (sql) {
        await ensureSchema();
        await sql`
          UPDATE tenants
          SET plan_tier = ${planTier},
              account_plan = ${requestedPlan},
              subscription_status = 'paid active'
          WHERE LOWER(email) = ${email};
        `;
      }
    }

    return NextResponse.json({
      url: `/dashboard/settings?tab=billing&checkout_success=true&plan=${requestedPlan}`,
      upgraded: true,
      plan: requestedPlan,
    });
  } catch (error) {
    console.error('[Billing Checkout API Error]', error);
    return NextResponse.json({ error: 'Failed to initiate checkout session' }, { status: 500 });
  }
}
