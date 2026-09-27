import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { isSuperAdminEmail } from '@/lib/token';
import { findTenantByEmail, updateTenant, setTenantStoreAlertStatus } from '@/lib/db';
import { getPaddleInstance } from '@/lib/paddle/server';

export async function POST(request: Request) {
  try {
    const session = await getAnySession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const email = session.email.toLowerCase().trim();

    // Superadmin immunity: Cannot be canceled
    if (isSuperAdminEmail(email)) {
      return NextResponse.json(
        {
          error: 'Platform Owner / Superadmin accounts are permanently exempt and cannot be canceled.',
          isSuperAdmin: true,
        },
        { status: 400 }
      );
    }

    const tenant = await findTenantByEmail(email);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant record not found.' }, { status: 404 });
    }

    if (!tenant.paddle_subscription_id) {
      return NextResponse.json(
        { error: 'No active paid Paddle subscription found for this account.' },
        { status: 400 }
      );
    }

    const paddle = getPaddleInstance();

    // Dispatch cancellation scheduled for the end of the current billing cycle
    // Customer retains full protection and monitoring through what they've already prepaid
    const canceledSub = await paddle.subscriptions.cancel(tenant.paddle_subscription_id, {
      effectiveFrom: 'next_billing_period',
    });

    const effectiveAtStr =
      canceledSub.scheduledChange?.effectiveAt ||
      canceledSub.currentBillingPeriod?.endsAt ||
      tenant.current_period_ends_at ||
      new Date(Date.now() + 30 * 86400000).toISOString();

    // Record the scheduled cancellation date in the database
    // Subscription status remains 'paid active' until the effective period end date arrives
    await updateTenant(tenant.id, {
      scheduled_cancellation_at: effectiveAtStr,
      subscription_status: 'paid active',
      is_past_due: false,
    });

    // Ensure live alerts remain armed through the prepaid period
    await setTenantStoreAlertStatus(tenant.email, 'active');

    return NextResponse.json({
      success: true,
      message: 'Subscription cancellation scheduled for the end of the current billing cycle.',
      scheduledCancellationDate: effectiveAtStr,
      subscriptionId: canceledSub.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Paddle Cancel Error]', message);
    return NextResponse.json(
      {
        error: message || 'Failed to schedule subscription cancellation.',
      },
      { status: 500 }
    );
  }
}
