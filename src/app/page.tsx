import React from 'react';
import { Hero } from '@/components/Hero';
import { NetworkCanvas } from '@/components/NetworkCanvas';
import { SocialProof } from '@/components/SocialProof';
import { LandingSections } from '@/components/LandingSections';
import { Footer } from '@/components/Footer';

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
