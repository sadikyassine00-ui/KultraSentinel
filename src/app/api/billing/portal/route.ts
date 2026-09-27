import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { isSuperAdminEmail } from '@/lib/token';
import { findTenantByEmail, updateTenant } from '@/lib/db';
import { getPaddleInstance } from '@/lib/paddle/server';

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
        success: true,
        isSuperAdmin: true,
        url: '/dashboard/settings?tab=billing',
        message: 'Superadmin account has permanent lifetime access.',
      });
    }

    const tenant = await findTenantByEmail(email);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant record not found.' }, { status: 404 });
    }

    let customerId = tenant.paddle_customer_id;
    const paddle = getPaddleInstance();

    // If customerId is not stored locally but subscription ID is known, resolve customer ID
    if (!customerId && tenant.paddle_subscription_id) {
      try {
        const sub = await paddle.subscriptions.get(tenant.paddle_subscription_id);
        if (sub?.customerId) {
          customerId = sub.customerId;
          await updateTenant(tenant.id, { paddle_customer_id: customerId });
        }
      } catch (subErr) {
        console.warn('[Paddle Portal] Error querying subscription for customer ID:', subErr);
      }
    }

    // If still no customer ID, check Paddle customer registry by email
    if (!customerId) {
      try {
        const customerCollection = await paddle.customers.list({ email: [email] });
        const customers = await customerCollection.next();
        if (customers && customers.length > 0 && customers[0]?.id) {
          customerId = customers[0].id;
          await updateTenant(tenant.id, { paddle_customer_id: customerId });
        }
      } catch (custErr) {
        console.warn('[Paddle Portal] Error looking up customer by email:', custErr);
      }
    }

    if (!customerId) {
      return NextResponse.json(
        {
          error: 'No active Paddle customer record found for this account. Please subscribe to a plan first.',
        },
        { status: 400 }
      );
    }

    const subscriptionIds = tenant.paddle_subscription_id ? [tenant.paddle_subscription_id] : [];

    // Mint customer portal session via Paddle Node SDK
    const portalSession = await paddle.customerPortalSessions.create(customerId, subscriptionIds);

    return NextResponse.json({
      success: true,
      url: portalSession.urls.general.overview,
      urls: portalSession.urls,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Paddle Customer Portal Error]', message);
    return NextResponse.json(
      {
        error: message || 'Failed to generate customer portal session.',
      },
      { status: 500 }
    );
  }
}
