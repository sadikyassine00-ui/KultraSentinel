'use client';

import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>500: Server Error | Kultra</title>
        <link rel="icon" type="image/svg+xml" href="/favicon-error.svg?v=500" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-error-48x48.png?v=500" />
        <link rel="shortcut icon" href="/favicon-error.ico?v=500" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0b0d" />
      </head>
      <body className="bg-[#0a0b0d] text-[#f4f1ea] font-sans min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-[#0e0f11] border border-[#d64545] rounded-[4px] p-6 sm:p-8 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-[3px] bg-[rgba(214,69,69,0.08)] border border-[#d64545] flex items-center justify-center text-[#d64545]">
              <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <span className="px-2.5 py-1 rounded-[100px] border border-[#d64545] text-[#d64545] bg-[rgba(214,69,69,0.08)] text-[10.5px] font-mono font-medium">
              INTERNAL SERVER ERROR (500)
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#f4f1ea] leading-tight">
              Root Server Incident Encountered
            </h1>
            <p className="text-[13.5px] text-[#b9b3a5] leading-relaxed">
              An unrecoverable system exception occurred in the root application layout. Our monitoring telemetry has flagged this incident.
            </p>
          </div>

          {error.digest && (
            <div className="p-3 bg-[#131418] border border-white/10 rounded-[3px] space-y-1">
              <div className="text-[10.5px] font-mono text-[#6b7078]">Incident Tracking ID:</div>
              <div className="text-xs font-mono text-[#f4f1ea] truncate font-medium">
                {error.digest}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 bg-[#f2a93b] text-[#1a1305] font-semibold text-[13px] py-2.5 px-4 rounded-[3px] hover:bg-[#f6b855] active:bg-[#d9932a] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Operation</span>
            </button>
            <a
              href="/"
              className="flex-1 bg-transparent border border-white/15 text-[#b9b3a5] font-semibold text-[13px] py-2.5 px-4 rounded-[3px] hover:border-[#7a5a26] hover:text-[#f4f1ea] transition-all inline-flex items-center justify-center gap-2 text-center"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
