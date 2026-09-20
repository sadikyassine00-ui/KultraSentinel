'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, RefreshCw, Building, ExternalLink } from 'lucide-react';
import { DiscoveredGmcAccount } from '@/lib/merchant_api';

interface Props {
  accounts: DiscoveredGmcAccount[];
  email: string;
}

export default function AccountSelectorClient({ accounts, email }: Props) {
  const router = useRouter();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectAccount = async (merchantId: string) => {
    try {
      setConnectingId(merchantId);
      setError(null);

      const res = await fetch('/api/auth/merchant/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to link selected Merchant Center account.');
      }

      router.push(data.redirectUrl || '/dashboard?just_connected=true');
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'An error occurred during account connection.');
      setConnectingId(null);
    }
  };

  return (
    <div className="max-w-2xl w-full bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] p-5 sm:p-9 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-pill)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] text-[11px] font-mono font-medium">
          <span>MULTIPLE GMC ACCOUNTS DETECTED</span>
        </div>

        <h1 className="font-serif text-[24px] sm:text-[28px] font-semibold text-[var(--ink-primary)] leading-tight">
          Select Merchant Center Account
        </h1>

        <p className="text-[13.5px] text-[var(--ghost-text)] leading-[1.6]">
          Your Google profile (<span className="text-[var(--ink-primary)] font-mono text-[12px]">{email}</span>) manages {accounts.length} Google Merchant Center accounts. Choose which catalog to connect to Kultra.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-[12.5px] text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Account List */}
      <div className="space-y-3">
        {accounts.map((acct) => {
          const isConnecting = connectingId === acct.merchantId;
          return (
            <div
              key={acct.merchantId}
              className="bg-[var(--bg-canvas)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center justify-center shrink-0 mt-0.5">
                  {acct.isAggregator ? (
                    <Building className="w-5 h-5 text-[var(--signal)]" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-[var(--ghost-text)]" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-semibold text-[var(--ink-primary)]">
                      {acct.name}
                    </span>
                    {acct.isAggregator && (
                      <span className="px-2 py-0.5 rounded-[var(--radius-pill)] border border-[var(--signal-dim)] bg-[var(--signal-wash)] text-[var(--signal)] text-[10px] font-mono">
                        MCA Aggregator
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-mono text-[var(--ghost-text)]">
                    <span>GMC ID: <span className="text-[var(--ink-secondary)]">{acct.merchantId}</span></span>
                    {acct.websiteUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={acct.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--ink-primary)] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{acct.websiteUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3 text-[var(--ghost-text-dim)]" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectAccount(acct.merchantId)}
                  disabled={Boolean(connectingId)}
                  className="btn-primary w-full sm:w-auto py-2 px-4 text-[12.5px] font-semibold !rounded-[3px] inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Options */}
      <div className="pt-4 border-t border-[var(--hairline)] flex items-center justify-between text-[12px] font-mono">
        <a
          href="/api/auth/merchant/connect?prompt=select_account"
          className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] transition-colors inline-flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Switch Google account</span>
        </a>

        <a
          href="/dashboard"
          className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] transition-colors"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
