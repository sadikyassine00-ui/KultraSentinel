'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Mail, LogOut, ExternalLink, RefreshCw } from 'lucide-react';

export default function AccountSuspendedPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Check live status: if account is restored/unsuspended, automatically restore dashboard access
  const checkAccountStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        // If not authenticated at all, redirect to login
        router.replace('/login');
        return;
      }
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUserEmail(data.user.email);
        if (!data.isSuspended && !data.user.isSuspended) {
          // Account was unsuspended! Restore access immediately
          window.location.href = '/dashboard';
          return;
        }
      } else {
        router.replace('/login');
      }
    } catch {
      // Non-blocking
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkAccountStatus();

    // Heartbeat check every 8 seconds to detect unsuspend live
    const interval = setInterval(checkAccountStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f1ea] flex flex-col justify-between font-sans selection:bg-[rgba(214,69,69,0.2)] selection:text-[#f4f1ea]">
      {/* Top Brand Header */}
      <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] flex items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] rounded-[3px]">
            <Image
              src="/assets/logos/kultra-logo-horizontal.svg"
              alt="Kultra"
              width={140}
              height={36}
              className="h-[28px] sm:h-[30px] w-auto object-contain brightness-105"
              priority
            />
          </Link>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[100px] border border-[rgba(214,69,69,0.4)] bg-[rgba(214,69,69,0.08)] text-[#d64545] text-[11px] font-mono tracking-[0.02em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d64545]" aria-hidden="true" />
            <span>Account Lockout Active</span>
          </div>
        </div>
      </header>

      {/* Main Lockout Surface */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Card Container */}
          <div className="rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] p-6 sm:p-8 space-y-6">
            {/* Header Icon + Status Pill */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-[3px] bg-[#131418] border border-[rgba(214,69,69,0.4)] flex items-center justify-center text-[#d64545]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-[100px] text-[11px] font-mono border border-[rgba(214,69,69,0.4)] text-[#d64545] bg-[rgba(214,69,69,0.08)] font-medium">
                STATUS: SUSPENDED
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#f4f1ea] tracking-tight">
                Account Access Suspended
              </h1>
              <p className="text-[13.5px] text-[#b9b3a5] leading-relaxed">
                Your merchant account access has been suspended by the platform administrator. Real-time catalog monitoring, Google Pub/Sub ingestion, and outbound Slack notifications have been paused for your stores.
              </p>
            </div>

            {/* Targeted User Identifier */}
            {userEmail && (
              <div className="p-3 bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] rounded-[3px] space-y-1">
                <div className="text-[10.5px] font-mono text-[#6b7078]">Suspended Account Identifier:</div>
                <div className="text-xs font-mono text-[#f4f1ea] font-medium truncate">{userEmail}</div>
              </div>
            )}

            {/* Resolution Box */}
            <div className="p-4 bg-[rgba(214,69,69,0.04)] border border-[rgba(214,69,69,0.25)] rounded-[3px] space-y-2">
              <div className="text-xs font-semibold text-[#f4f1ea] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d64545]" />
                <span>Contact Kultra Platform Operations</span>
              </div>
              <p className="text-[12.5px] text-[#b9b3a5] leading-relaxed">
                To appeal this decision, resolve billing irregularities, or request immediate reinstatement of catalog protection, please reach out to:
              </p>
              <div className="pt-1">
                <a
                  href={`mailto:support@usekultra.com?subject=Account%20Suspension%20Appeal%20-%20${encodeURIComponent(userEmail || 'Merchant')}`}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#f2a93b] hover:underline underline-offset-4 font-semibold"
                >
                  <span>support@usekultra.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <a
                href={`mailto:support@usekultra.com?subject=Account%20Suspension%20Appeal%20-%20${encodeURIComponent(userEmail || 'Merchant')}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f2a93b] hover:bg-[#f6b855] text-[#1a1305] font-semibold text-xs rounded-[3px] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact support@usekultra.com</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={checkAccountStatus}
                  disabled={checkingStatus}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.25)] bg-transparent text-[#b9b3a5] hover:text-[#f4f1ea] text-xs font-medium rounded-[3px] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin text-[#f2a93b]' : ''}`} />
                  <span>{checkingStatus ? 'Checking status...' : 'Check status'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-[rgba(214,69,69,0.4)] hover:bg-[rgba(214,69,69,0.08)] bg-transparent text-[#d64545] text-xs font-medium rounded-[3px] transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-[11px] font-mono text-[#6b7078]">
              Automated Sentinel Guard • Access tokens and session keys are rejected
            </p>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="h-12 border-t border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] flex items-center justify-between px-4 sm:px-6 lg:px-8 text-[11px] font-mono text-[#45484f]">
        <span>Kultra Security Perimeter</span>
        <span className="text-[#6b7078]">support@usekultra.com</span>
      </footer>
    </div>
  );
}
