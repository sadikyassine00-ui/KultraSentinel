import React from 'react';

/**
 * Base lightweight skeleton atom per GEMINI.md §11.
 * Static block on --bg-surface using --bg-surface-2.
 * NO shimmer sweep, NO breathing/pulsing opacity loop.
 */
export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-static rounded-[var(--radius-sm)] ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton matching Tier 1 Commercial Volume KPI Cards.
 */
export function KpiCardSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="w-5 h-5" />
      </div>
      <Skeleton className="h-7 w-32" />
      <div className="flex items-center justify-between pt-0.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * 4 KPI Cards Grid Skeleton
 */
export function TelemetryKpiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="w-5 h-5" />
          </div>
          <Skeleton className="h-7 w-28" />
          <div className="flex items-center justify-between pt-0.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton matching Tier 2 Real-Time Pipeline Health Console.
 */
export function HealthConsoleSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--hairline)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[var(--bg-surface)] p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="w-3.5 h-3.5" />
          </div>
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-2.5 w-40" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Tab 1: Tenant Management Table
 */
export function TenantsTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[var(--bg-surface)] border border-[var(--hairline)] p-3 rounded-[var(--radius-md)]">
        <Skeleton className="w-full sm:w-80 h-9" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="flex-1 sm:w-28 h-9" />
          <Skeleton className="flex-1 sm:w-28 h-9" />
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="p-4 border-b border-[var(--hairline)] bg-[var(--bg-surface-2)]">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--hairline)] last:border-none">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Tab 2: Global Store Registry
 */
export function StoresTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[var(--bg-surface)] border border-[var(--hairline)] p-3 rounded-[var(--radius-md)]">
        <Skeleton className="w-full sm:w-80 h-9" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="flex-1 sm:w-28 h-9" />
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="p-4 border-b border-[var(--hairline)] bg-[var(--bg-surface-2)]">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--hairline)] last:border-none">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Tab 3: Pub/Sub Pipeline & DLQ Triage
 */
export function PipelineDlqTabSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5 space-y-4">
          <Skeleton className="h-4 w-48" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Tab 4: Outbound Dispatch Logs
 */
export function DispatchesTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((idx) => (
          <Skeleton key={idx} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Tab 5: System Configuration
 */
export function ConfigTabSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-6 space-y-5 max-w-2xl mx-auto">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-9 w-32 ml-auto" />
    </div>
  );
}

/**
 * Complete Full Dashboard Page Skeleton (Zero CLS, holds completely still)
 */
export function DashboardPageSkeleton() {
  return (
    <div className="flex-1 w-full bg-[var(--bg-canvas)] text-[var(--ink-primary)] flex flex-col lg:flex-row">
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--hairline)]">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <TelemetryKpiGridSkeleton />
          <TenantsTabSkeleton />
        </main>
      </div>
    </div>
  );
}
