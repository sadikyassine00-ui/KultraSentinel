'use client';

import React, { useState } from 'react';
import { CostOfSilence } from './CostOfSilence';
import { RemediationPipeline } from './RemediationPipeline';
import { ArchitectureComparison } from './ArchitectureComparison';
import { SlackPreview } from './SlackPreview';
import { FaqSection } from './FaqSection';
import { PricingMatrix } from './PricingMatrix';
import { PilotApplicationForm } from './PilotApplicationForm';

export function LandingSections() {
  const [selectedPlan, setSelectedPlan] = useState<'merchant' | 'agency'>('agency');

  const handleSelectPlan = (plan: 'merchant' | 'agency') => {
    setSelectedPlan(plan);
  };

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

      {/* 5. Programmatic SEO FAQ Section */}
      <FaqSection />

      {/* 6. Dual Pricing Matrix */}
      <PricingMatrix onSelectPlan={handleSelectPlan} />

      {/* 7. High-Intent Pilot Application Form */}
      <PilotApplicationForm
        selectedPlan={selectedPlan}
        onPlanChange={handleSelectPlan}
      />
    </>
  );
}
