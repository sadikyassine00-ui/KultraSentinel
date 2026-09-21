import React from 'react';
import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { NetworkCanvas } from '@/components/NetworkCanvas';
import { QuickReference } from '@/components/QuickReference';
import { SocialProof } from '@/components/SocialProof';
import { LandingSections } from '@/components/LandingSections';
import { Footer } from '@/components/Footer';
import { homepageStructuredData, serializeJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Kultra: Real-Time Google Merchant Center Disapproval Alerts in Slack',
  description:
    'Real-Time Google Merchant Center Disapproval Alerts in Slack. Sub-30-second Cloud Pub/Sub incident dispatch with direct one-click fix links before ad spend bleeds.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://usekultra.com',
    siteName: 'Kultra',
    title: 'Kultra: Real-Time Google Merchant Center Disapproval Alerts in Slack',
    description:
      'Real-Time Google Merchant Center Disapproval Alerts in Slack. Sub-30-second Cloud Pub/Sub incident dispatch with direct one-click fix links before ad spend bleeds.',
    images: [
      {
        url: 'https://usekultra.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kultra: Real-Time Google Merchant Center Disapproval Alerts in Slack',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kultra: Real-Time Google Merchant Center Disapproval Alerts in Slack',
    description:
      'Real-Time Google Merchant Center Disapproval Alerts in Slack. Sub-30-second Cloud Pub/Sub incident dispatch with direct one-click fix links before ad spend bleeds.',
    images: [
      {
        url: 'https://usekultra.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kultra: Real-Time Google Merchant Center Disapproval Alerts in Slack',
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      {/* Unified Schema.org Graph (Organization, Creator Person, SoftwareApplication, WebSite, FAQPage) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(homepageStructuredData),
        }}
      />
      <main className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)] flex flex-col selection:bg-[var(--signal-glow)] selection:text-[var(--ink-primary)]">
      {/* Hero Container with network canvas and centered hero */}
      <div className="relative w-full overflow-hidden flex flex-col">
        {/* Interactive Topological Canvas Mesh (z-[1]) */}
        <NetworkCanvas />

        {/* Hero Section (z-10) */}
        <Hero />
      </div>

      {/* Semantic Quick Reference & Architecture Reference Block */}
      <QuickReference />

      {/* Social Proof Section */}
      <SocialProof />

      {/* Conversion-Optimized Landing Sections (Sections 1-7 in strict order) */}
      <LandingSections />

      {/* Section 8: Technical Footer */}
      <Footer />
    </main>
    </>
  );
}
