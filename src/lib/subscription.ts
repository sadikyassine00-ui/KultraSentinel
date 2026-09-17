import { Tenant, findTenantByEmail, getDb, ensureSchema } from './db';

export type SubscriptionStatus = 'active trial' | 'paid active' | 'expired' | 'canceled';

export interface SubscriptionEvaluation {
  effectiveStatus: SubscriptionStatus;
  rawStatus: string;
  trialEndsAt: string;
  formattedTrialEnd: string;
  daysRemaining: number;
  isLocked: boolean;
  upgradeUrl: string;
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
 * If an account is currently marked as 'active trial' but current time has passed
 * the trial expiration timestamp, automatically treats the account status as 'expired'.
 *
 * Provides effective status, days remaining, formatted end date, and boolean isLocked flag.
 */
export function evaluateSubscription(tenant?: Partial<Tenant> | null): SubscriptionEvaluation {
  const upgradeUrl = process.env.NEXT_PUBLIC_UPGRADE_URL || '/#pricing';

  // Fallback if tenant is completely missing
  if (!tenant) {
    const defaultTrialEnd = new Date(Date.now() + 14 * 86400000).toISOString();
    return {
      effectiveStatus: 'active trial',
      rawStatus: 'active trial',
      trialEndsAt: defaultTrialEnd,
      formattedTrialEnd: new Date(defaultTrialEnd).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      daysRemaining: 14,
      isLocked: false,
      upgradeUrl,
    };
  }

  const rawStatus =
    tenant.subscription_status ||
    (tenant.plan_tier === 'Active Pro' || tenant.plan_tier === 'Agency Pilot'
      ? 'paid active'
      : 'active trial');

  const normalized = normalizeSubscriptionStatus(rawStatus);

  // Determine trial end timestamp:
  // Strictly prefer tenant.trial_ends_at. Fallback to created_at + 14 days, or Date.now() + 14 days.
  let trialDate: Date;
  if (tenant.trial_ends_at) {
    trialDate = new Date(tenant.trial_ends_at);
  } else if (tenant.created_at) {
    trialDate = new Date(new Date(tenant.created_at).getTime() + 14 * 86400000);
  } else {
    trialDate = new Date(Date.now() + 14 * 86400000);
  }

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
    daysRemaining: effectiveStatus === 'paid active' ? 999 : daysRemaining,
    isLocked,
    upgradeUrl,
  };
}

/**
 * Retrieves a tenant from database and returns evaluated subscription state.
 * If the tenant transitioned from 'active trial' to 'expired', lazily updates the database row.
 */
export async function getTenantSubscription(email: string): Promise<SubscriptionEvaluation> {
  const cleanEmail = email.toLowerCase().trim();
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
