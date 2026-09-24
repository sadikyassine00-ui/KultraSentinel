/**
 * Unified Entity Schema (JSON-LD) for Kultra (https://www.usekultra.com)
 * Interconnects the SoftwareApplication, Organization, and Creator (Person)
 * into a single cohesive Schema.org Graph with persistent fragment identifiers.
 */

export const homepageStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.usekultra.com/#organization',
      name: 'Kultra',
      url: 'https://www.usekultra.com',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://www.usekultra.com/#logo',
        url: 'https://www.usekultra.com/assets/logos/kultra-logo-horizontal.svg',
        contentUrl: 'https://www.usekultra.com/assets/logos/kultra-logo-horizontal.svg',
        caption: 'Kultra',
      },
      image: 'https://www.usekultra.com/og-image.png',
      founder: {
        '@id': 'https://www.usekultra.com/#creator',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'support@usekultra.com',
          url: 'https://www.usekultra.com',
          availableLanguage: ['English'],
        },
      ],
    },
    {
      '@type': 'Person',
      '@id': 'https://www.usekultra.com/#creator',
      name: 'Yassine Sadik',
      jobTitle: 'Founder & Creator',
      url: 'https://www.usekultra.com',
      worksFor: {
        '@id': 'https://www.usekultra.com/#organization',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.usekultra.com/#software',
      name: 'Kultra',
      url: 'https://www.usekultra.com',
      description:
        'Real-time Google Merchant Center disapproval monitoring micro-SaaS with sub-30s Slack alerts via Google Content API and Cloud Pub/Sub.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Cloud',
      publisher: {
        '@id': 'https://www.usekultra.com/#organization',
      },
      author: {
        '@id': 'https://www.usekultra.com/#creator',
      },
      creator: {
        '@id': 'https://www.usekultra.com/#creator',
      },
      offers: [
        {
          '@type': 'Offer',
          '@id': 'https://www.usekultra.com/#plan-solo',
          name: 'Solo Merchant',
          price: '19.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '19.00',
            priceCurrency: 'USD',
            unitText: 'MONTH',
          },
          description:
            'Solo tier at $19 per month for 1 Google Merchant Center store with unlimited SKUs. Includes a 14-day free trial activated strictly upon Google Merchant Center account connection.',
          url: 'https://www.usekultra.com/register?plan=merchant',
          seller: {
            '@id': 'https://www.usekultra.com/#organization',
          },
        },
        {
          '@type': 'Offer',
          '@id': 'https://www.usekultra.com/#plan-agency',
          name: 'Agency Fleet',
          price: '49.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '49.00',
            priceCurrency: 'USD',
            unitText: 'MONTH',
          },
          description:
            'Agency tier at $49 per month for up to 5 client Google Merchant Center accounts (MCA supported) and isolated client Slack channel routing. Includes a 14-day free trial activated strictly upon Google Merchant Center account connection.',
          url: 'https://www.usekultra.com/register?plan=agency',
          seller: {
            '@id': 'https://www.usekultra.com/#organization',
          },
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.usekultra.com/#website',
      url: 'https://www.usekultra.com',
      name: 'Kultra',
      description:
        'Real-time Google Merchant Center disapproval monitoring service built on the Google Content API and Cloud Pub/Sub.',
      publisher: {
        '@id': 'https://www.usekultra.com/#organization',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.usekultra.com/#faq',
      isPartOf: {
        '@id': 'https://www.usekultra.com/#website',
      },
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How fast are disapproval notifications?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sub-30 seconds, dispatched via Google Cloud Pub/Sub webhook integrations rather than delayed daily feed scans.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can marketing agencies track multiple client accounts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, the Agency tier supports unlimited Google Merchant Center accounts with multi-channel Slack routing.',
          },
        },
        {
          '@type': 'Question',
          name: 'What Google permissions are required?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Basic login uses identity scopes only (openid, email, profile), while the Google Content API scope (/auth/content) is strictly isolated to the Merchant Center connection workflow.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does the free trial work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A full 14-day trial starts immediately once a Google Merchant Center account is connected, requiring no upfront billing activation on standard signup.',
          },
        },
      ],
    },
  ],
};

/**
 * Serializes and sanitizes JSON-LD structured data against script injection (XSS).
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
