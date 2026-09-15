'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TenantTriageCenter from '@/components/dashboard/TenantTriageCenter';
import { DashboardPageSkeleton } from '@/components/Skeleton';

function CustomerDashboardContent() {
  const searchParams = useSearchParams();
  const justConnected = searchParams.get('just_connected') === 'true';
  const initialStoreId = searchParams.get('store_id');

  return (
    <TenantTriageCenter
      initialStoreId={initialStoreId}
      justConnected={justConnected}
    />
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <CustomerDashboardContent />
    </Suspense>
  );
}
