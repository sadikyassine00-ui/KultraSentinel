'use client';

import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark text-[#FDF4D2] bg-[#0a0b1dff] min-h-screen">
      {children}
    </div>
  );
}
