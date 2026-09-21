import React from 'react';
import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { NetworkCanvas } from '@/components/NetworkCanvas';
import { SocialProof } from '@/components/SocialProof';
import { LandingSections } from '@/components/LandingSections';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Kultra: Google Merchant Center Disapproval Watchdog',
  description:
    "Google won't text you when policy changes silently kill your bestselling ads. Kultra monitors your feed 24/7 and delivers instant alerts before you waste another dollar of ad spend.",
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)] flex flex-col selection:bg-[var(--signal-glow)] selection:text-[var(--ink-primary)]">
      {/* Hero Container with network canvas and centered hero */}
      <div className="relative w-full overflow-hidden flex flex-col">
        {/* Interactive Topological Canvas Mesh (z-[1]) */}
        <NetworkCanvas />

        {/* Hero Section (z-10) */}
        <Hero />
      </div>

      {/* Social Proof Section */}
      <SocialProof />

      {/* Conversion-Optimized Landing Sections (Sections 1-7 in strict order) */}
      <LandingSections />

      {/* Section 8: Technical Footer */}
      <Footer />
    </main>
  );
}
