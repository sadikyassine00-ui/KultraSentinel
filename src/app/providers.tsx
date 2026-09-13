'use client';

import { HeroUIProvider } from '@heroui/react';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider className="dark text-foreground bg-[#0a0b1dff] min-h-screen">
      {children}
    </HeroUIProvider>
  );
}
