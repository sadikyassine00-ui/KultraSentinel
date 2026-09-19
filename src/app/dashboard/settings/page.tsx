import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isTenantSuspended } from '@/lib/db';
import SettingsClientView from '@/components/dashboard/SettingsClientView';

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    checkout_success?: string;
    plan?: string;
  }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!rawToken) {
    redirect('/login');
  }

  const session = await verifySessionToken(rawToken);
  if (!session || !session.email) {
    redirect('/login');
  }

  const isSuspended = await isTenantSuspended(session.email);
  if (isSuspended) {
    redirect('/suspended');
  }

  const resolvedParams = await searchParams;
  const initialTab = resolvedParams.tab || 'billing';
  const checkoutSuccess = resolvedParams.checkout_success === 'true';
  const upgradedPlan = resolvedParams.plan || null;

  return (
    <Suspense fallback={<div className="p-8 text-[var(--ghost-text)] font-mono text-[13px]">Loading settings...</div>}>
      <SettingsClientView
        initialTab={initialTab}
        checkoutSuccess={checkoutSuccess}
        upgradedPlan={upgradedPlan}
      />
    </Suspense>
  );
}
