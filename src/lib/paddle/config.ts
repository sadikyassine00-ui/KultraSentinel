export interface PaddlePlanConfig {
  id: 'solo' | 'agency';
  name: string;
  planTier: 'Solo' | 'Agency';
  accountPlan: 'solo' | 'agency';
  monthlyPriceUsd: number;
  unitAmount: string; // in cents
  currencyCode: 'USD';
  billingInterval: 'month';
  billingFrequency: number;
  taxCategory: 'saas';
  priceIdEnvVar: string;
  defaultPriceId: string;
  description: string;
}

export const PADDLE_PLANS: Record<'solo' | 'agency', PaddlePlanConfig> = {
  solo: {
    id: 'solo',
    name: 'Kultra Solo',
    planTier: 'Solo',
    accountPlan: 'solo',
    monthlyPriceUsd: 19,
    unitAmount: '1900',
    currencyCode: 'USD',
    billingInterval: 'month',
    billingFrequency: 1,
    taxCategory: 'saas',
    priceIdEnvVar: 'NEXT_PUBLIC_PADDLE_SOLO_PRICE_ID',
    defaultPriceId: 'pri_kultra_solo_19',
    description: 'Single GMC Store 24/7 Monitoring and Disapproval Shield',
  },
  agency: {
    id: 'agency',
    name: 'Kultra Agency',
    planTier: 'Agency',
    accountPlan: 'agency',
    monthlyPriceUsd: 49,
    unitAmount: '4900',
    currencyCode: 'USD',
    billingInterval: 'month',
    billingFrequency: 1,
    taxCategory: 'saas',
    priceIdEnvVar: 'NEXT_PUBLIC_PADDLE_AGENCY_PRICE_ID',
    defaultPriceId: 'pri_kultra_agency_49',
    description: 'Unlimited GMC Stores, MCA Architecture and Priority Instant Dispatch',
  },
};

export function getPaddleEnvironment(): 'sandbox' | 'production' {
  const env = process.env.NEXT_PUBLIC_PADDLE_ENV?.toLowerCase().trim();
  return env === 'production' ? 'production' : 'sandbox';
}

export function getPaddleClientToken(): string {
  return process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim() || '';
}

export function getPaddlePriceId(plan: 'solo' | 'agency'): string {
  const config = PADDLE_PLANS[plan];
  if (!config) return '';

  if (plan === 'solo') {
    return process.env.NEXT_PUBLIC_PADDLE_SOLO_PRICE_ID?.trim() || config.defaultPriceId;
  }
  return process.env.NEXT_PUBLIC_PADDLE_AGENCY_PRICE_ID?.trim() || config.defaultPriceId;
}

export function getPlanFromPriceId(priceId: string): 'solo' | 'agency' | null {
  if (!priceId) return null;
  const clean = priceId.trim();

  const soloPriceId = getPaddlePriceId('solo');
  const agencyPriceId = getPaddlePriceId('agency');

  if (clean === soloPriceId || clean === PADDLE_PLANS.solo.defaultPriceId || clean.includes('solo')) {
    return 'solo';
  }
  if (clean === agencyPriceId || clean === PADDLE_PLANS.agency.defaultPriceId || clean.includes('agency')) {
    return 'agency';
  }

  return null;
}
