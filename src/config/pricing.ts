export interface PricingBullet {
  anchor: string;
  detail: string;
}

export interface PricingTier {
  id: 'solo' | 'agency';
  badge: string;
  isBadgeAccent: boolean;
  title: string;
  subtitle: string;
  price: string;
  pricePeriod: string;
  subPriceLabel: string;
  bullets: PricingBullet[];
  ctaText: string;
  microCopy: string;
}

export const PRICING_TIERS: Record<'solo' | 'agency', PricingTier> = {
  solo: {
    id: 'solo',
    badge: 'Single Store',
    isBadgeAccent: false,
    title: 'Solo Merchant',
    subtitle: 'For direct-to-consumer brands running independent Google Shopping feeds.',
    price: '$19',
    pricePeriod: '/ month flat',
    subPriceLabel: 'Free for 14 days, then $19/mo',
    bullets: [
      {
        anchor: '1 Google Merchant Center store',
        detail: 'connected',
      },
      {
        anchor: 'Unlimited catalog SKUs',
        detail: 'monitored 24/7',
      },
      {
        anchor: 'Sub-30-second alerts',
        detail: 'sent directly to Slack',
      },
      {
        anchor: 'Direct GMC links',
        detail: 'to inspect disapproved item diagnostics',
      },
      {
        anchor: 'Zero storefront code',
        detail: 'with 0% impact on site speed',
      },
    ],
    ctaText: 'Start Solo Trial',
    microCopy: '14-day trial starts on store connection. No credit card required.',
  },
  agency: {
    id: 'agency',
    badge: 'Recommended for Agencies',
    isBadgeAccent: true,
    title: 'Agency Fleet',
    subtitle: 'For boutique PPC agencies protecting multiple e-commerce client retainers.',
    price: '$49',
    pricePeriod: '/ month flat',
    subPriceLabel: 'Free for 14 days, then $49/mo',
    bullets: [
      {
        anchor: 'Up to 5 client GMC accounts',
        detail: 'included (MCA supported)',
      },
      {
        anchor: 'Dedicated Slack routing',
        detail: 'to separate private client channels',
      },
      {
        anchor: 'Centralized multi-store overview',
        detail: 'for agency media buyers',
      },
      {
        anchor: 'Direct GMC links',
        detail: 'to inspect disapproved item diagnostics',
      },
      {
        anchor: 'Zero storefront code',
        detail: 'across all client storefront themes',
      },
    ],
    ctaText: 'Start Agency Trial',
    microCopy: '14-day trial starts on store connection. No credit card required.',
  },
};
