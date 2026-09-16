'use client';

import React from 'react';
import { CostOfSilence } from './CostOfSilence';
import { RemediationPipeline } from './RemediationPipeline';
import { ArchitectureComparison } from './ArchitectureComparison';
import { SlackPreview } from './SlackPreview';
import { SecurityCompliance } from './SecurityCompliance';
import { PricingMatrix } from './PricingMatrix';
import { FaqSection } from './FaqSection';
import { InstantActivationCta } from './InstantActivationCta';

export function LandingSections() {
  return (
    <>
      {/* 1. The Cost of Silence (Problem & Loss Aversion) */}
      <CostOfSilence />

      {/* 2. The 3-Step Remediation Pipeline (How It Works) */}
      <RemediationPipeline />

      {/* 3. Architecture Comparison (Pub/Sub vs. Legacy Polling) */}
      <ArchitectureComparison />

      {/* 4. Live Slack Alert & Payload Preview */}
      <SlackPreview />

      {/* 5. Security & Compliance Standards */}
      <SecurityCompliance />

      {/* 6. Dual Pricing Matrix */}
      <PricingMatrix />

      {/* 7. Programmatic SEO FAQ Section */}
      <FaqSection />

      {/* 8. Instant Live SaaS Onboarding */}
      <InstantActivationCta />
    </>
  );
}
