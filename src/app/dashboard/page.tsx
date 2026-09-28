import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isTenantSuspended } from '@/lib/db';
import TenantTriageCenter from '@/components/dashboard/TenantTriageCenter';
import { CustomerDashboardSkeleton } from '@/components/Skeleton';
import { getDashboardDataPayload } from '@/lib/dashboard';

interface PageProps {
  searchParams: Promise<{
    just_connected?: string;
    store_id?: string;
    error?: string;
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
  const initialError = resolvedParams.error || null;

  // Hydrate initial dashboard data directly from Neon Postgres on server mount (Directive 2)
  let initialData = null;
  try {
    const dashboardResult = await getDashboardDataPayload(session.email, initialStoreId);
    if (dashboardResult.data) {
      initialData = dashboardResult.data;
    }
  } catch (err) {
    console.warn('[Dashboard Page] Server pre-hydration fallback to client fetch:', err);
  }

  return (
    <Suspense fallback={<CustomerDashboardSkeleton />}>
      <TenantTriageCenter
        initialStoreId={initialStoreId}
        justConnected={justConnected}
        initialError={initialError}
        initialData={initialData}
      />
    </Suspense>
  );
}
