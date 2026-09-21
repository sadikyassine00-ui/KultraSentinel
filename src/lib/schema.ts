/**
 * Unified Entity Schema (JSON-LD) for Kultra (https://usekultra.com)
 * Interconnects the SoftwareApplication, Organization, and Creator (Person)
 * into a single cohesive Schema.org Graph with persistent fragment identifiers.
 */

export const homepageStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://usekultra.com/#organization',
      name: 'Kultra',
      url: 'https://usekultra.com',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://usekultra.com/#logo',
        url: 'https://usekultra.com/assets/logos/kultra-logo-horizontal.svg',
        contentUrl: 'https://usekultra.com/assets/logos/kultra-logo-horizontal.svg',
        caption: 'Kultra',
      },
      image: 'https://usekultra.com/og-image.png',
      founder: {
        '@id': 'https://usekultra.com/#creator',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'support@usekultra.com',
          url: 'https://usekultra.com',
          availableLanguage: ['English'],
        },
      ],
    },
    {
      '@type': 'Person',
      '@id': 'https://usekultra.com/#creator',
      name: 'Yassine Sadik',
      jobTitle: 'Founder & Creator',
      url: 'https://usekultra.com',
      worksFor: {
        '@id': 'https://usekultra.com/#organization',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://usekultra.com/#software',
      name: 'Kultra',
      url: 'https://usekultra.com',
      description:
        'Real-time Google Merchant Center disapproval monitoring micro-SaaS with sub-30s Slack alerts via Google Content API and Cloud Pub/Sub.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Cloud',
      publisher: {
        '@id': 'https://usekultra.com/#organization',
      },
      author: {
        '@id': 'https://usekultra.com/#creator',
      },
      creator: {
        '@id': 'https://usekultra.com/#creator',
      },
      offers: [
        {
          '@type': 'Offer',
          '@id': 'https://usekultra.com/#plan-solo',
          name: 'Solo Plan',
          price: '19.00',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '19.00',
            priceCurrency: 'USD',
            unitText: 'MONTH',
          },
          description:
            'Solo tier at $19 per month for single store monitoring. Includes a 14-day free trial activated upon Google Merchant Center account connection.',
          url: 'https://usekultra.com/register?plan=solo',
          seller: {
            '@id': 'https://usekultra.com/#organization',
          },
        },
        {
          '@type': 'Offer',
          '@id': 'https://usekultra.com/#plan-agency',
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
            'Agency tier at $49 per month for unlimited accounts and team notifications. Includes a 14-day free trial activated upon Google Merchant Center account connection.',
          url: 'https://usekultra.com/register?plan=agency',
          seller: {
            '@id': 'https://usekultra.com/#organization',
          },
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://usekultra.com/#website',
      url: 'https://usekultra.com',
      name: 'Kultra',
      description:
        'Real-time Google Merchant Center disapproval monitoring service built on the Google Content API and Cloud Pub/Sub.',
      publisher: {
        '@id': 'https://usekultra.com/#organization',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://usekultra.com/#faq',
      isPartOf: {
        '@id': 'https://usekultra.com/#website',
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
