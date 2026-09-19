import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isTenantSuspended } from '@/lib/db';
import TenantTriageCenter from '@/components/dashboard/TenantTriageCenter';
import { DashboardPageSkeleton } from '@/components/Skeleton';

interface PageProps {
  searchParams: Promise<{
    just_connected?: string;
    store_id?: string;
  }>;
}

export default async function CustomerDashboardPage({ searchParams }: PageProps) {
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
  const isSuspended = await isTenantSuspended(session.email);
  if (isSuspended) {
    redirect('/suspended');
  }

  const resolvedParams = await searchParams;
  const justConnected = resolvedParams.just_connected === 'true';
  const initialStoreId = resolvedParams.store_id || null;

  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <TenantTriageCenter
        initialStoreId={initialStoreId}
        justConnected={justConnected}
      />
    </Suspense>
  );
}
