import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isTenantSuspended, findTenantByEmail } from '@/lib/db';
import { isAllowedAdminEmail } from '@/lib/auth';
import TenantDashboardClientLayout from './TenantDashboardClientLayout';

export const metadata: Metadata = {
  title: 'Dashboard | Kultra',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!rawToken) {
    redirect('/login');
  }

  const session = await verifySessionToken(rawToken);
  if (!session || !session.email) {
    redirect('/login');
  }

  // Server-Side Suspension Verification:
  // Never allow a suspended user's request to reach the dashboard view or client components.
  const isSuspended = await isTenantSuspended(session.email);
  if (isSuspended) {
    redirect('/suspended');
  }

  const isAdmin = Boolean(
    session.role === 'admin' ||
    session.isSuperAdmin ||
    isAllowedAdminEmail(session.email)
  );

  let planName = isAdmin ? 'Lifetime Admin' : 'Merchant';
  let planTier = isAdmin ? 'Superadmin' : 'Solo';

  try {
    const tenant = await findTenantByEmail(session.email);
    if (tenant) {
      const { evaluateSubscription } = await import('@/lib/subscription');
      const sub = evaluateSubscription(tenant);
      planName = sub.planName;
      planTier = sub.planTier;
    }
  } catch {
    // Non-blocking fallback
  }

  const initialUser = {
    email: session.email,
    name: session.name || null,
    role: session.role || (isAdmin ? 'admin' : 'user'),
    isAdmin,
    planName,
    planTier,
  };

  return <TenantDashboardClientLayout initialUser={initialUser}>{children}</TenantDashboardClientLayout>;
}
