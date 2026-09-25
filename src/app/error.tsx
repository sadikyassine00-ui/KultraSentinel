'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server error for observability
    console.error('[Internal Server Error 500]:', error);

    // Swap browser tab favicon to the error favicon variant
    const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    const originalHrefs = Array.from(iconLinks).map((el) => ({ el, href: el.href }));

    iconLinks.forEach((link) => {
      link.href = '/favicon-error.svg?v=500';
    });

    return () => {
      // Restore normal favicons when navigating away or unmounting
      originalHrefs.forEach(({ el, href }) => {
        el.href = href;
      });
    };
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[var(--danger-wash)] selection:text-[var(--ink-primary)]">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--danger)] rounded-[var(--radius-md)] p-6 sm:p-8 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Header Icon + 500 Pill */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] flex items-center justify-center text-[var(--danger)]">
            <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <span className="tag-pill tag-danger text-[10.5px] font-mono">
            INTERNAL SERVER ERROR (500)
          </span>
        </div>

        {/* Headline & Description */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] leading-tight">
            Server Incident Encountered
          </h1>
          <p className="text-[13.5px] text-[var(--ink-secondary)] leading-relaxed">
            The platform encountered an unexpected internal server error while processing this request. Our diagnostic telemetry has recorded the incident.
          </p>
        </div>

        {/* Error Digest/Code Reference if available */}
        {error.digest && (
          <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-sm)] space-y-1">
            <div className="text-[10.5px] font-mono text-[var(--ghost-text)]">Incident Tracking ID:</div>
            <div className="text-xs font-mono text-[var(--ink-primary)] truncate font-medium">
              {error.digest}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 btn-primary py-2.5 !rounded-[var(--radius-sm)] text-[13px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Request</span>
          </button>
          <Link
            href="/dashboard"
            className="flex-1 btn-secondary py-2.5 !rounded-[var(--radius-sm)] text-[13px] font-semibold inline-flex items-center justify-center gap-2 text-center"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
