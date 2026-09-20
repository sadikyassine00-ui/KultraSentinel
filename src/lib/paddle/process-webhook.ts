import {
  EventName,
  type EventEntity,
  type SubscriptionCreatedEvent,
  type SubscriptionUpdatedEvent,
  type SubscriptionCanceledEvent,
  type SubscriptionPastDueEvent,
  type TransactionCompletedEvent,
  type CustomerCreatedEvent,
  type CustomerUpdatedEvent,
} from '@paddle/paddle-node-sdk';
import {
  updateTenantByEmail,
  findTenantByEmail,
  findTenantByPaddleCustomer,
  findTenantByPaddleSubscription,
  findTenantByIdOrUserId,
  setTenantStoreAlertStatus,
  updateTenant,
  type Tenant,
} from '@/lib/db';
import { isSuperAdminEmail } from '@/lib/token';
import { getPlanFromPriceId } from './config';

export async function processPaddleWebhookEvent(event: EventEntity): Promise<void> {
  console.log(`[Paddle Webhook] Processing event: ${event.eventType} (ID: ${event.eventId})`);

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpsert(event as SubscriptionCreatedEvent | SubscriptionUpdatedEvent);
      break;

    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event as SubscriptionCanceledEvent);
      break;

    case EventName.SubscriptionPastDue:
      await handleSubscriptionPastDue(event as SubscriptionPastDueEvent);
      break;

    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event as TransactionCompletedEvent);
      break;

    case EventName.CustomerCreated:
    case EventName.CustomerUpdated:
      await handleCustomerUpsert(event as CustomerCreatedEvent | CustomerUpdatedEvent);
      break;

    default:
      console.log(`[Paddle Webhook] Ignored unhandled event type: ${event.eventType}`);
      break;
  }
}

export async function resolveTenant(params: {
  userId?: string | null;
  tenantId?: string | number | null;
  email?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  customData?: Record<string, unknown> | null;
}): Promise<Tenant | null> {
  // 1. Direct custom data user ID or tenant ID
  const customId =
    params.customData?.userId ??
    params.customData?.tenantId ??
    params.customData?.id ??
    params.userId ??
    params.tenantId;

  if (customId) {
    const tenant = await findTenantByIdOrUserId(String(customId));
    if (tenant) return tenant;
  }

  // 2. Direct custom data email
  const customEmail = (
    (params.customData?.tenantEmail as string) ||
    (params.customData?.email as string) ||
    params.email
  )?.toLowerCase().trim();

  if (customEmail) {
    const tenant = await findTenantByEmail(customEmail);
    if (tenant) return tenant;
  }

  // 3. Lookup by Paddle Subscription ID
  if (params.subscriptionId) {
    const tenant = await findTenantByPaddleSubscription(params.subscriptionId);
    if (tenant) return tenant;
  }

  // 4. Lookup by Paddle Customer ID
  if (params.customerId) {
    const tenant = await findTenantByPaddleCustomer(params.customerId);
    if (tenant) return tenant;
  }

  return null;
}

async function handleSubscriptionUpsert(
  event: SubscriptionCreatedEvent | SubscriptionUpdatedEvent
): Promise<void> {
  const sub = event.data;
  const priceId = sub.items?.[0]?.price?.id || '';
  const customPlan = (sub.customData?.accountPlan as string)?.toLowerCase();
  const detectedPlan = getPlanFromPriceId(priceId) || (customPlan === 'agency' ? 'agency' : 'solo');

  const customEmail = (sub.customData?.tenantEmail as string) || (sub.customData?.email as string) || null;

  const tenant = await resolveTenant({
    userId: sub.customData?.userId as string,
    tenantId: sub.customData?.tenantId as string | number,
    email: customEmail,
    customerId: sub.customerId,
    subscriptionId: sub.id,
    customData: sub.customData as Record<string, unknown> | null,
  });

  const rawStatus = (sub.status || '').toLowerCase();
  const isPastDue = rawStatus === 'past_due';
  const isCanceled = rawStatus === 'canceled';
  const isPaused = rawStatus === 'paused';

  // Determine normalized plan tier and subscription status
  let subscriptionStatus: 'paid active' | 'active trial' | 'expired' | 'canceled' = 'paid active';
  let planTier: 'Active Pro' | 'Agency Pilot' | 'Delinquent' | 'Canceled' =
    detectedPlan === 'agency' ? 'Agency Pilot' : 'Active Pro';

  if (isCanceled) {
    subscriptionStatus = 'canceled';
    planTier = 'Canceled';
  } else if (isPaused) {
    subscriptionStatus = 'expired';
  } else {
    subscriptionStatus = 'paid active';
  }

  // Check for scheduled cancellation in subscription.updated
  const scheduledCancellationAt =
    sub.scheduledChange?.action === 'cancel'
      ? sub.scheduledChange.effectiveAt
      : null;

  const currentPeriodEndsAt = sub.currentBillingPeriod?.endsAt || null;

  // Superadmin guardrail: Never downgrade, cancel, or silence the superadmin account
  const targetEmail = tenant?.email || customEmail;
  if (targetEmail && isSuperAdminEmail(targetEmail)) {
    console.log(`[Paddle Webhook] Enforcing superadmin immunity for ${targetEmail}`);
    subscriptionStatus = 'paid active';
    planTier = detectedPlan === 'agency' ? 'Agency Pilot' : 'Active Pro';
  }

  const updates: Partial<Tenant> = {
    paddle_customer_id: sub.customerId || undefined,
    paddle_subscription_id: sub.id || undefined,
    subscription_status: subscriptionStatus,
    plan_tier: planTier,
    account_plan: detectedPlan,
    current_period_ends_at: currentPeriodEndsAt,
    scheduled_cancellation_at: scheduledCancellationAt,
    is_past_due: isPastDue,
  };

  if (tenant) {
    await updateTenant(tenant.id, updates);
    console.log(
      `[Paddle Webhook] Updated tenant ${tenant.email} (ID: ${tenant.id}) to ${subscriptionStatus} (${planTier}), endsAt: ${currentPeriodEndsAt}`
    );

    // Alert and monitoring management
    if (isCanceled || isPaused) {
      if (!isSuperAdminEmail(tenant.email)) {
        await setTenantStoreAlertStatus(tenant.email, 'degraded');
      }
    } else {
      // For paid active, past_due grace period, or newly created subscription:
      // immediately lift paywalls and enable live GMC monitoring and Slack alerts
      await setTenantStoreAlertStatus(tenant.email, 'active');
    }
  } else if (customEmail) {
    await updateTenantByEmail(customEmail, updates);
    console.log(
      `[Paddle Webhook] Updated tenant by email ${customEmail} to ${subscriptionStatus} (${planTier})`
    );
    if (!isCanceled && !isPaused) {
      await setTenantStoreAlertStatus(customEmail, 'active');
    }
  } else {
    console.warn(`[Paddle Webhook] Subscription ${sub.id} received but no matching tenant resolved`);
  }
}

async function handleSubscriptionCanceled(event: SubscriptionCanceledEvent): Promise<void> {
  const sub = event.data;
  const tenant = await resolveTenant({
    userId: sub.customData?.userId as string,
    tenantId: sub.customData?.tenantId as string | number,
    customerId: sub.customerId,
    subscriptionId: sub.id,
    customData: sub.customData as Record<string, unknown> | null,
  });

  if (!tenant) {
    console.warn(`[Paddle Webhook] Subscription ${sub.id} canceled but tenant not found`);
    return;
  }

  // Superadmin guardrail: Never revoke access or silence alerts for superadmin
  if (isSuperAdminEmail(tenant.email)) {
    console.log(`[Paddle Webhook] Blocked cancellation for superadmin account: ${tenant.email}`);
    return;
  }

  // Check scheduled cancellation date: if effective in future, do not immediately cut access
  const effectiveAtStr = sub.scheduledChange?.effectiveAt || sub.currentBillingPeriod?.endsAt;
  const effectiveDate = effectiveAtStr ? new Date(effectiveAtStr) : null;
  const isFuture = effectiveDate && !isNaN(effectiveDate.getTime()) && effectiveDate.getTime() > Date.now();

  if (isFuture && effectiveAtStr) {
    // Scheduled for period end: keep access active until expiration date
    await updateTenant(tenant.id, {
      scheduled_cancellation_at: effectiveAtStr,
      subscription_status: 'paid active',
      is_past_due: false,
    });
    await setTenantStoreAlertStatus(tenant.email, 'active');
    console.log(
      `[Paddle Webhook] Subscription ${sub.id} cancellation scheduled for ${effectiveAtStr}. Access maintained for ${tenant.email}.`
    );
  } else {
    // Immediate cancellation or period end has arrived: flip to canceled and silence alerts
    await updateTenant(tenant.id, {
      subscription_status: 'canceled',
      plan_tier: 'Canceled',
      scheduled_cancellation_at: new Date().toISOString(),
      is_past_due: false,
    });
    await setTenantStoreAlertStatus(tenant.email, 'degraded');
    console.log(
      `[Paddle Webhook] Subscription ${sub.id} canceled immediately. Alerts silenced and paywall triggered for ${tenant.email}.`
    );
  }
}

async function handleSubscriptionPastDue(event: SubscriptionPastDueEvent): Promise<void> {
  const sub = event.data;
  const tenant = await resolveTenant({
    userId: sub.customData?.userId as string,
    tenantId: sub.customData?.tenantId as string | number,
    customerId: sub.customerId,
    subscriptionId: sub.id,
    customData: sub.customData as Record<string, unknown> | null,
  });

  if (!tenant) {
    console.warn(`[Paddle Webhook] Subscription ${sub.id} past_due received but tenant not found`);
    return;
  }

  // Superadmin guardrail
  if (isSuperAdminEmail(tenant.email)) {
    console.log(`[Paddle Webhook] Superadmin ${tenant.email} is immune to past_due flags`);
    return;
  }

  // Flag the account with a past-due grace period banner without immediately silencing critical alerts
  await updateTenant(tenant.id, {
    is_past_due: true,
    subscription_status: 'paid active', // remains active during grace period
  });

  // Keep live alerts active
  await setTenantStoreAlertStatus(tenant.email, 'active');
  console.log(
    `[Paddle Webhook] Subscription ${sub.id} flagged as past_due (grace period active, alerts armed) for ${tenant.email}`
  );
}

async function handleTransactionCompleted(event: TransactionCompletedEvent): Promise<void> {
  const tx = event.data;
  const customerId = tx.customerId;
  const subscriptionId = tx.subscriptionId;
  const customEmail = (tx.customData?.tenantEmail as string) || (tx.customData?.email as string) || null;

  const tenant = await resolveTenant({
    userId: tx.customData?.userId as string,
    tenantId: tx.customData?.tenantId as string | number,
    email: customEmail,
    customerId,
    subscriptionId,
    customData: tx.customData as Record<string, unknown> | null,
  });

  if (tenant) {
    await updateTenant(tenant.id, {
      subscription_status: 'paid active',
      is_past_due: false,
      ...(customerId ? { paddle_customer_id: customerId } : {}),
      ...(subscriptionId ? { paddle_subscription_id: subscriptionId } : {}),
    });
    await setTenantStoreAlertStatus(tenant.email, 'active');
    console.log(`[Paddle Webhook] Transaction completed and paywall lifted for tenant ${tenant.email}`);
  }
}

async function handleCustomerUpsert(event: CustomerCreatedEvent | CustomerUpdatedEvent): Promise<void> {
  const customer = event.data;
  if (!customer.email || !customer.id) return;

  const cleanEmail = customer.email.toLowerCase().trim();
  const tenant = await findTenantByEmail(cleanEmail);

  if (tenant) {
    await updateTenant(tenant.id, {
      paddle_customer_id: customer.id,
    });
    console.log(`[Paddle Webhook] Linked customer ID ${customer.id} to tenant ${tenant.email}`);
  }
}
