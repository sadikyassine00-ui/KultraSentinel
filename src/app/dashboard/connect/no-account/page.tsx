import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react';

import DirectGmcLinkForm from './DirectGmcLinkForm';

interface Props {
  searchParams: Promise<{ email?: string; error?: string }>;
}

export default async function NoGmcAccountPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const email = resolvedParams.email || 'your Google account';
  const isPermissionDenied = resolvedParams.error === 'permission_denied';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] p-7 sm:p-9 space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] border border-[var(--danger)] bg-[var(--danger-wash)] text-[var(--danger)] text-[11px] font-mono font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isPermissionDenied ? 'GOOGLE PERMISSION REQUIRED' : 'NO MERCHANT ACCOUNT FOUND'}</span>
          </span>
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-2">
          <h1 className="font-serif text-[24px] sm:text-[26px] font-semibold text-[var(--ink-primary)] leading-tight">
            {isPermissionDenied
              ? 'Google Merchant Center permission was not granted'
              : 'No Google Merchant Center Account Found'}
          </h1>
          <p className="text-[13.5px] text-[var(--ghost-text)] leading-[1.6]">
            {isPermissionDenied ? (
              <>
                Google requires explicit authorization to discover your accounts. When signing in with <strong className="text-[var(--ink-primary)] font-mono text-[12.5px]">{email}</strong>, ensure the checkbox for <strong className="text-[var(--ink-primary)]">&quot;Manage your Google Merchant Center accounts&quot;</strong> is checked.
              </>
            ) : (
              <>
                The Google account you just signed into does not have access to any Google Merchant Center stores. This usually happens when your merchant center is under a different Google email.
              </>
            )}
          </p>
        </div>

        {/* Direct Link Form */}
        <DirectGmcLinkForm />

        {/* Guidance Box */}
        <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] space-y-3">
          <div className="text-[12.5px] font-semibold text-[var(--ink-primary)]">
            Alternative options:
          </div>
          <ol className="text-[12.5px] text-[var(--ink-secondary)] space-y-2.5 list-decimal list-inside leading-[1.55]">
            <li>
              <strong className="text-[var(--ink-primary)]">Switch Google Accounts:</strong> Reconnect using the Google account that has Standard or Admin access to your store in Google Merchant Center.
            </li>
            <li>
              <strong className="text-[var(--ink-primary)]">Create a Merchant Account:</strong> If you don&apos;t have a Merchant Center account yet, visit Google Merchant Center, verify your website, and add your product feed.
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={isPermissionDenied ? "/api/auth/merchant/connect?prompt=consent" : "/api/auth/merchant/connect?prompt=select_account"}
            className="btn-primary py-2.5 px-4 text-[13px] font-semibold !rounded-[3px] inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isPermissionDenied ? 'Authorize Google Merchant Center Permission' : 'Connect with a Different Google Account'}</span>
          </a>

          <a
            href="https://accounts.google.com/AccountChooser?continue=https://merchants.google.com/mc/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2.5 px-4 text-[13px] font-semibold !rounded-[3px] inline-flex items-center justify-center gap-1.5 text-[var(--ghost-text)] hover:text-[var(--ink-primary)]"
          >
            <span>Create a Google Merchant Center Account</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Back Link */}
        <div className="pt-4 border-t border-[var(--hairline)]">
          <Link
            href="/dashboard"
            className="text-[12px] font-mono text-[var(--ghost-text)] hover:text-[var(--ink-primary)] inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
