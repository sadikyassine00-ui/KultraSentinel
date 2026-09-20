'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function DirectGmcLinkForm() {
  const router = useRouter();
  const [gmcId, setGmcId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmcId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/merchant/link-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmcId: gmcId.trim(),
          storeName: storeName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to link Google Merchant Center account.');
      }

      router.push(data.redirectUrl || '/dashboard?just_connected=true');
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'An error occurred while linking your store.');
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] font-semibold text-[var(--ink-primary)] flex items-center gap-2">
          <Store className="w-3.5 h-3.5 text-[var(--signal)]" />
          <span>Already have a Merchant ID? Enter it directly.</span>
        </div>
        <span className="text-[11px] font-mono text-[var(--ghost-text-dim)]">Direct connect</span>
      </div>

      <p className="text-[12px] text-[var(--ghost-text)] leading-[1.5]">
        Newly created Merchant Center accounts can take up to 30 minutes to appear in Google&apos;s directory index. Bypass the propagation delay by entering your 10-digit Merchant Center ID:
      </p>

      {error && (
        <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-[11.5px] text-[var(--danger)] flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-mono text-[var(--ghost-text)] mb-1">
              Merchant Center ID (10 digits) *
            </label>
            <input
              type="text"
              value={gmcId}
              onChange={(e) => setGmcId(e.target.value)}
              placeholder="e.g. 5857345262"
              required
              className="w-full bg-[var(--bg-surface)] border border-[var(--hairline-strong)] focus:border-[var(--signal)] rounded-[var(--radius-sm)] px-3 py-2 text-[12.5px] font-mono text-[var(--ink-primary)] placeholder:text-[var(--ghost-text-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--signal-glow)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[var(--ghost-text)] mb-1">
              Store Name (Optional)
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. TruckSizer"
              className="w-full bg-[var(--bg-surface)] border border-[var(--hairline-strong)] focus:border-[var(--signal)] rounded-[var(--radius-sm)] px-3 py-2 text-[12.5px] text-[var(--ink-primary)] placeholder:text-[var(--ghost-text-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--signal-glow)] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !gmcId.trim()}
          className="btn-primary w-full py-2 px-3 text-[12.5px] font-semibold !rounded-[3px] inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying & Linking Store...</span>
            </>
          ) : (
            <>
              <span>Verify and Link Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
