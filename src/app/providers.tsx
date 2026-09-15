'use client';

import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark text-[#f4f1ea] bg-[#0a0b0d] min-h-screen">
      {children}
    </div>
  );
}
