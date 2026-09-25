'use client';

import React, { Suspense } from 'react';
import RouteProgressBar from '@/components/RouteProgressBar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark text-[#f4f1ea] bg-[#0a0b0d] min-h-screen">
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>
      {children}
    </div>
  );
}
