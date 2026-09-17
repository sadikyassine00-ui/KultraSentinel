import { Tenant, findTenantByEmail, getDb, ensureSchema } from './db';
import { isSuperAdminEmail } from './token';

export type SubscriptionStatus = 'active trial' | 'paid active' | 'expired' | 'canceled';

export interface SubscriptionEvaluation {
  effectiveStatus: SubscriptionStatus;
  rawStatus: string;
  trialEndsAt: string;
  formattedTrialEnd: string;
  daysRemaining: number;
  isLocked: boolean;
  upgradeUrl: string;
  hasTrialStarted: boolean;
  isSuperAdmin: boolean;
}

/**
 * Normalizes any legacy or external plan/status strings into strict canonical states:
 * 'active trial' | 'paid active' | 'expired' | 'canceled'
 */
export function normalizeSubscriptionStatus(status?: string | null): SubscriptionStatus {
  if (!status) return 'active trial';
  const s = status.toLowerCase().trim();
  if (
    s === 'paid active' ||
    s === 'active' ||
    s === 'active pro' ||
    s === 'agency pilot' ||
    s === 'paid' ||
    s === 'pro'
  ) {
    return 'paid active';
  }
  if (s === 'expired' || s === 'delinquent' || s === 'suspended') {
    return 'expired';
  }
  if (s === 'canceled' || s === 'cancelled') {
    return 'canceled';
  }
  return 'active trial';
}

/**
 * Centralized evaluation helper for account lifecycle and trial timers.
 * 
 * - Superadmin (yassinesadik0@gmail.com) permanently bypasses all trial expirations,
 *   payment requirements, and paywall overlays (isLocked: false, isSuperAdmin: true).
 * - For normal accounts, the 14-day trial does NOT start until a Google Merchant Center
 *   account is connected (trial_ends_at is set).
 * - Once started, trial runs for exactly 14 days and reconnecting does not reset the timer.
 */
export function evaluateSubscription(tenant?: Partial<Tenant> | null): SubscriptionEvaluation {
  const upgradeUrl = process.env.NEXT_PUBLIC_UPGRADE_URL || '/#pricing';

  // 1. Permanent Superadmin Bypass
  const email = tenant?.email?.toLowerCase().trim();
  if (isSuperAdminEmail(email)) {
    return {
      effectiveStatus: 'paid active',
      rawStatus: 'superadmin',
      trialEndsAt: '',
      formattedTrialEnd: 'Permanent Superadmin Access',
      daysRemaining: 9999,
      isLocked: false,
      hasTrialStarted: true,
      isSuperAdmin: true,
      upgradeUrl: '',
    };
  }

  // Fallback if tenant is completely missing
  if (!tenant) {
    return {
      effectiveStatus: 'active trial',
      rawStatus: 'active trial',
      trialEndsAt: '',
      formattedTrialEnd: 'Pending GMC Connection',
      daysRemaining: 14,
      isLocked: false,
      hasTrialStarted: false,
      isSuperAdmin: false,
      upgradeUrl,
    };
  }

  const rawStatus =
    tenant.subscription_status ||
    (tenant.plan_tier === 'Active Pro' || tenant.plan_tier === 'Agency Pilot'
      ? 'paid active'
      : 'active trial');

  const normalized = normalizeSubscriptionStatus(rawStatus);

  // Paid active plans are never locked
  if (normalized === 'paid active') {
    return {
      effectiveStatus: 'paid active',
      rawStatus: String(tenant.subscription_status || 'paid active'),
      trialEndsAt: tenant.trial_ends_at || '',
      formattedTrialEnd: 'Active Subscription',
      daysRemaining: 999,
      isLocked: false,
      hasTrialStarted: true,
      isSuperAdmin: false,
      upgradeUrl,
    };
  }

  // 2. Unstarted Trial (Account created, but Google Merchant Center not yet connected)
  if (!tenant.trial_ends_at) {
    return {
      effectiveStatus: 'active trial',
      rawStatus: 'active trial',
      trialEndsAt: '',
      formattedTrialEnd: 'Pending GMC Connection',
      daysRemaining: 14,
      isLocked: false,
      hasTrialStarted: false,
      isSuperAdmin: false,
      upgradeUrl,
    };
  }

  // 3. Active or Expired Trial (GMC connected, 14-day countdown is running or elapsed)
  const trialDate = new Date(tenant.trial_ends_at);
  const now = Date.now();
  const msRemaining = trialDate.getTime() - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  let effectiveStatus: SubscriptionStatus = normalized;

  // Auto-evaluation check: active trial that has passed expiration is treated as expired
  if (normalized === 'active trial') {
    if (msRemaining <= 0) {
      effectiveStatus = 'expired';
    }
  }

  const isLocked = effectiveStatus === 'expired' || effectiveStatus === 'canceled';

  return {
    effectiveStatus,
    rawStatus: String(tenant.subscription_status || normalized),
    trialEndsAt: trialDate.toISOString(),
    formattedTrialEnd: trialDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    daysRemaining,
    isLocked,
    hasTrialStarted: true,
    isSuperAdmin: false,
    upgradeUrl,
  };
}

/**
 * Activates the 14-day trial when a tenant connects their Google Merchant Center account.
 * - If the tenant is superadmin or already on a paid plan, no-op.
 * - If the tenant's trial_ends_at is ALREADY set, preserve existing countdown; do NOT reset the timer.
 * - If trial_ends_at is null, initialize it to exactly 14 days from now.
 */
export async function activateTrialOnFirstStoreConnect(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSuperAdminEmail(cleanEmail)) {
    return;
  }

  const tenant = await findTenantByEmail(cleanEmail);
  if (!tenant) {
    return;
  }

  if (tenant.subscription_status === 'paid active') {
    return;
  }

  // Critical requirement: Reconnecting or disconnecting must NOT reset the 14-day timer
  if (tenant.trial_ends_at) {
    return;
  }

  const newTrialEndsAt = new Date(Date.now() + 14 * 86400000).toISOString();

  // Update in-memory state
  tenant.trial_ends_at = newTrialEndsAt;
  tenant.subscription_status = 'active trial';

  // Persist to Neon DB
  try {
    const sql = getDb();
    if (sql) {
      await ensureSchema();
      await sql`
        UPDATE tenants
        SET trial_ends_at = ${newTrialEndsAt},
            subscription_status = 'active trial'
        WHERE id = ${tenant.id};
      `;
    }
  } catch (err) {
    console.warn('[Subscription] Failed to activate trial on GMC connect in DB:', err);
  }
}

/**
 * Retrieves a tenant from database and returns evaluated subscription state.
 * If the tenant transitioned from 'active trial' to 'expired', lazily updates the database row.
 */
export async function getTenantSubscription(email: string): Promise<SubscriptionEvaluation> {
  const cleanEmail = email.toLowerCase().trim();
  if (isSuperAdminEmail(cleanEmail)) {
    return evaluateSubscription({ email: cleanEmail, plan_tier: 'Active Pro', subscription_status: 'paid active' });
  }

  const tenant = await findTenantByEmail(cleanEmail);
  const evaluation = evaluateSubscription(tenant);

  // If status transitioned to expired and DB still says active trial, sync state lazily
  if (
    tenant &&
    evaluation.effectiveStatus === 'expired' &&
    tenant.subscription_status === 'active trial'
  ) {
    try {
      const sql = getDb();
      if (sql) {
        await ensureSchema();
        await sql`
          UPDATE tenants
          SET subscription_status = 'expired'
          WHERE id = ${tenant.id};
        `;
      }
      tenant.subscription_status = 'expired';
    } catch (err) {
      console.warn('[Subscription] Failed to lazily sync expired status to DB:', err);
    }
  }

  return evaluation;
}
