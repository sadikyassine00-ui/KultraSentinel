import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShieldAlert, Mail } from 'lucide-react';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isTenantSuspended } from '@/lib/db';
import SuspendedLogoutButton from './SuspendedLogoutButton';

export default async function AccountSuspendedPage() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!rawToken) {
    redirect('/login');
  }

  const session = await verifySessionToken(rawToken);
  if (!session || !session.email) {
    redirect('/login');
  }

  // If the user is no longer suspended (e.g. reinstated by admin), restore dashboard access
  const isSuspended = await isTenantSuspended(session.email);
  if (!isSuspended) {
    redirect('/dashboard');
  }

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

            {/* Clear Unambiguous Messaging */}
            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#f4f1ea] tracking-tight">
                Account Access Suspended
              </h1>
              <p className="text-[13.5px] text-[#b9b3a5] leading-relaxed">
                Your merchant account access has been suspended by an administrator. Real-time catalog monitoring, Google Pub/Sub ingestion, and outbound Slack notifications have been paused for your stores.
              </p>
            </div>

            {/* Suspended User Identifier */}
            <div className="p-3 bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] rounded-[3px] space-y-1">
              <div className="text-[10.5px] font-mono text-[#6b7078]">Suspended Account Identifier:</div>
              <div className="text-xs font-mono text-[#f4f1ea] font-medium truncate">{session.email}</div>
            </div>

            {/* Unclickable Protected Resolution Notice */}
            <div className="p-4 bg-[rgba(214,69,69,0.04)] border border-[rgba(214,69,69,0.25)] rounded-[3px] space-y-2 select-none">
              <div className="text-xs font-semibold text-[#f4f1ea] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d64545]" />
                <span>Account Review &amp; Dispute Resolution</span>
              </div>
              <p className="text-[12.5px] text-[#b9b3a5] leading-relaxed">
                This account has been suspended by a platform administrator. To appeal this decision, review catalog policy flags, or request account reinstatement, contact platform support:
              </p>
              <div className="pt-1 font-mono text-xs text-[#f2a93b] font-medium tracking-wide">
                support@usekultra.com
              </div>
            </div>

            {/* Explicit Functional Log Out Action */}
            <div className="pt-2">
              <SuspendedLogoutButton />
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
