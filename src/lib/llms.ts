/**
 * Structured LLMs documentation generator for AI crawlers, search agents, and LLMs.
 * Standard format following https://llmstxt.org specifications.
 */
export function generateLlmsDocumentation(): string {
  return `# Kultra

> Real-time Google Merchant Center disapproval monitoring micro-SaaS providing sub-30s Slack alerts via Google Content API and Cloud Pub/Sub.

## Overview & Core Value
Kultra is a real-time Google Merchant Center disapproval monitoring micro-SaaS. When policy changes or feed issues silently suspend bestselling Google Shopping ads, Kultra detects the changes in real time via Google Content API and Cloud Pub/Sub and dispatches actionable Slack alerts in under 30 seconds, preventing wasted ad spend and silent revenue loss.

## Operational Capabilities
- **Sub-30s Disapproval Detection**: Near real-time event ingestion powered by Google Content API for Shopping and Cloud Pub/Sub push notification architecture.
- **Instant Error Identification**: Deep incident payloads highlighting specific offending SKUs, product titles, and exact Google policy reasons or disapproval codes directly in alert dispatches.
- **Centralized Multi-Client Monitoring**: Centralized multi-store dashboard tailored for PPC agencies and multi-store e-commerce brands to oversee multiple client catalogs from a single interface.
- **Automated Incident Notification**: Instant delivery to connected Slack channels with structured diagnostic details.

## Security and Permissions
- **Least-Privilege Identity Scopes**: User authentication is strictly restricted to identity scopes (\`openid\`, \`email\`, \`profile\`).
- **Isolated Merchant Center Integration**: The Google Content API scope (\`https://www.googleapis.com/auth/content\`) is strictly isolated to the Merchant Center connection workflow and never requested during initial account sign-up.
- **Limited Use Compliance**: Catalog telemetry accessed through the Google Content API is strictly utilized for monitoring, diagnostic status reporting, and alert dispatch. It is never sold, transferred, or used for AI model training or advertising.

## Pricing Structure
- **Solo Plan**: $19 / month. Tailored for single-store monitoring, independent e-commerce brands, and single-catalog merchants. Includes full sub-30s disapproval monitoring and Slack alerts.
- **Agency Fleet**: $49 / month. Tailored for PPC agencies, aggregators, and multi-brand merchants. Includes multi-account catalog monitoring, unlimited accounts/stores, team notifications, priority event processing, and multi-tenant management.

## Trial Architecture
- **14-Day Free Trial**: Complete access to real-time monitoring and diagnostic alerting.
- **Connection-Based Activation**: The 14-day evaluation clock activates strictly upon successful Google Merchant Center connection (not upon initial account registration), ensuring merchants receive a full 14 days of live monitoring.
- **Alert Silencer & Paywall Lockout**: Upon trial expiration without an active paid subscription, an automated alert silencer halts webhook and push notifications, and a paywall lockout screen engages while safely preserving store configurations until an upgrade is completed.

## Canonical Links
- Homepage: https://www.usekultra.com
- Privacy Policy: https://www.usekultra.com/privacy
- Terms of Service: https://www.usekultra.com/terms
- Refund Policy: https://www.usekultra.com/refund
- Support: mailto:support@usekultra.com

## Optional Documentation Links
- [Privacy Policy](https://www.usekultra.com/privacy): Detailed data usage, Limited Use compliance, encryption, and data protection disclosures.
- [Terms of Service](https://www.usekultra.com/terms): Terms governing SaaS catalog monitoring, 14-day evaluation, and subscription billing.
- [Refund and Cancellation Policy](https://www.usekultra.com/refund): Transparent refund policy, trial terms, and self-serve cancellation.
`;
}
