import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isTenantSuspended } from '@/lib/db';
import TenantDashboardClientLayout from './TenantDashboardClientLayout';

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

  return <TenantDashboardClientLayout>{children}</TenantDashboardClientLayout>;
}
