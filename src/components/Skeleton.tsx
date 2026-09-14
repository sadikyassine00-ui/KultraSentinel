import React from 'react';

/**
 * Base lightweight skeleton atom.
 * Uses GPU-accelerated CSS shimmer without layout shift, glows, or blinking.
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
      className={`skeleton-shimmer rounded ${className}`}
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
    <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28 rounded-sm" />
        <Skeleton className="w-6 h-6 rounded-md" />
      </div>
      <Skeleton className="h-8 w-32 rounded-md" />
      <div className="flex items-center justify-between pt-0.5">
        <Skeleton className="h-3 w-28 rounded-sm" />
        <Skeleton className="h-3 w-16 rounded-sm" />
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
      {/* Card 1: MRR */}
      <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-32 rounded-sm" />
          <Skeleton className="w-6 h-6 rounded-md" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-1.5 h-1.5 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-sm" />
          </div>
          <Skeleton className="h-3 w-14 rounded-sm" />
        </div>
      </div>

      {/* Card 2: Active Accounts */}
      <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="w-6 h-6 rounded-md" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-8 w-12 rounded-md" />
          <Skeleton className="h-4 w-8 rounded-sm" />
          <Skeleton className="h-4 w-2 rounded-sm" />
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="h-4 w-8 rounded-sm" />
        </div>
        <div className="space-y-1.5 pt-0.5">
          <Skeleton className="w-full h-1.5 rounded-full" />
          <Skeleton className="h-2.5 w-44 rounded-sm" />
        </div>
      </div>

      {/* Card 3: Monitored Stores */}
      <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-28 rounded-sm" />
          <Skeleton className="w-6 h-6 rounded-md" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
        <div className="flex items-center justify-between pt-0.5">
          <Skeleton className="h-3 w-20 rounded-sm" />
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
      </div>

      {/* Card 4: Observed SKUs */}
      <div className="bg-[#0F1522] border border-[#1E293B] border-t-white/[0.04] rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="w-6 h-6 rounded-md" />
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
        <div className="flex items-center justify-between pt-0.5">
          <Skeleton className="h-3 w-36 rounded-sm" />
          <Skeleton className="h-3 w-20 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton matching Tier 2 Real-Time Pipeline Health Console.
 */
export function HealthConsoleSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1E293B] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
      {/* Metric 1: Ingestion */}
      <div className="bg-[#0F1522] p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-20 rounded-sm" />
          <Skeleton className="w-3.5 h-3.5 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <Skeleton className="h-6 w-14 rounded-md" />
          <Skeleton className="h-3.5 w-12 rounded-sm" />
        </div>
        <div className="flex items-end gap-1 h-3 pt-0.5">
          {[6, 10, 8, 12, 10, 12].map((h, i) => (
            <Skeleton key={i} className="w-1.5 rounded-[1px]" style={{ height: `${h}px` }} />
          ))}
        </div>
        <Skeleton className="h-2.5 w-44 rounded-sm" />
      </div>

      {/* Metric 2: Latency */}
      <div className="bg-[#0F1522] p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-24 rounded-sm" />
          <Skeleton className="w-3.5 h-3.5 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <Skeleton className="h-6 w-12 rounded-md" />
          <Skeleton className="h-3.5 w-10 rounded-sm" />
        </div>
        <Skeleton className="w-full h-1.5 rounded-full" />
        <Skeleton className="h-2.5 w-48 rounded-sm" />
      </div>

      {/* Metric 3: Dead Letter Queue */}
      <div className="bg-[#0F1522] p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-28 rounded-sm" />
          <Skeleton className="w-3.5 h-3.5 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>
        <Skeleton className="h-2.5 w-40 rounded-sm pt-1" />
      </div>

      {/* Metric 4: Webhook Failure Rate */}
      <div className="bg-[#0F1522] p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-32 rounded-sm" />
          <Skeleton className="w-3.5 h-3.5 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-3.5 w-16 rounded-sm" />
        </div>
        <Skeleton className="h-2.5 w-40 rounded-sm pt-1" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Tab 1: Tenant Management Table
 */
export function TenantsTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search & Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0F1522] border border-[#1E293B] p-3 sm:p-3.5 rounded-xl shadow-sm">
        <Skeleton className="w-full sm:w-80 md:w-96 h-9 rounded-lg" />
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Skeleton className="flex-1 sm:flex-initial sm:w-32 h-9 rounded-lg" />
          <Skeleton className="flex-1 sm:flex-initial sm:w-32 h-9 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0c121e]">
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-28 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden md:table-cell"><Skeleton className="h-3 w-16 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-16 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-14 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden lg:table-cell"><Skeleton className="h-3 w-14 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 text-right"><Skeleton className="h-3 w-20 ml-auto rounded-sm" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="hover:bg-[#141C2B]/30 transition-colors">
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-32 rounded-sm" />
                        <Skeleton className="h-2.5 w-24 rounded-sm" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden md:table-cell">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-36 rounded-sm" />
                      <Skeleton className="h-2.5 w-20 rounded-sm" />
                    </div>
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <Skeleton className="h-5 w-20 rounded" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="w-1.5 h-1.5 rounded-full" />
                      <Skeleton className="h-3 w-12 rounded-sm" />
                    </div>
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden lg:table-cell">
                    <Skeleton className="h-3 w-20 rounded-sm" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="w-7 h-7 rounded-md" />
                      <Skeleton className="w-7 h-7 rounded-md" />
                      <Skeleton className="w-7 h-7 rounded-md" />
                      <Skeleton className="w-7 h-7 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      {/* Search & Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0F1522] border border-[#1E293B] p-3 sm:p-3.5 rounded-xl shadow-sm">
        <Skeleton className="w-full sm:w-80 md:w-96 h-9 rounded-lg" />
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Skeleton className="flex-1 sm:flex-initial sm:w-36 h-9 rounded-lg" />
          <Skeleton className="flex-1 sm:flex-initial sm:w-32 h-9 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0c121e]">
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-28 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-32 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden md:table-cell"><Skeleton className="h-3 w-24 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden lg:table-cell"><Skeleton className="h-3 w-20 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-16 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 text-right"><Skeleton className="h-3 w-16 ml-auto rounded-sm" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="hover:bg-[#141C2B]/30 transition-colors">
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <Skeleton className="h-3.5 w-28 rounded-sm font-mono" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-36 rounded-sm" />
                      <Skeleton className="h-2.5 w-28 rounded-sm" />
                    </div>
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden md:table-cell">
                    <Skeleton className="h-5 w-24 rounded" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="w-1.5 h-1.5 rounded-full" />
                      <Skeleton className="h-3 w-16 rounded-sm" />
                    </div>
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <Skeleton className="h-3.5 w-20 rounded-sm" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 text-right">
                    <Skeleton className="w-16 h-7 ml-auto rounded-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    <div className="space-y-6">
      {/* 2-Column Live Terminal + Latency Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Live Ingestion Stream Skeleton */}
        <div className="lg:col-span-2 bg-[#0F1522] border border-[#1E293B] rounded-xl p-4 sm:p-5 lg:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-sm" />
              <Skeleton className="h-3.5 w-48 rounded-sm" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-sm" />
            </div>
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-2.5 sm:p-3 rounded-lg bg-[#070A12] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-4 w-14 rounded font-mono" />
                  <Skeleton className="h-3.5 w-72 rounded-sm font-mono" />
                </div>
                <Skeleton className="h-3 w-24 rounded-sm font-mono" />
              </div>
            ))}
          </div>
        </div>

        {/* Latency Breakdown Console Skeleton */}
        <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl p-4 sm:p-5 lg:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <Skeleton className="h-3.5 w-40 rounded-sm" />
              <Skeleton className="h-3 w-14 rounded-sm" />
            </div>

            <div className="mt-4 space-y-4">
              {[
                { label: 'w-36', val: 'w-12', pct: '42%' },
                { label: 'w-32', val: 'w-12', pct: '58%' },
                { label: 'w-32', val: 'w-12', pct: '74%' },
              ].map((row, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className={`h-3 ${row.label} rounded-sm`} />
                    <Skeleton className={`h-3 ${row.val} rounded-sm`} />
                  </div>
                  <Skeleton className="w-full h-1.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-3.5 bg-[#0a0b1dff] border border-[#1E293B] rounded-lg space-y-1 mt-3">
            <Skeleton className="h-3 w-24 rounded-sm" />
            <Skeleton className="h-2.5 w-full rounded-sm" />
          </div>
        </div>
      </div>

      {/* Dead Letter Queue (DLQ) Triage Table Skeleton */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-56 rounded-sm" />
            <Skeleton className="h-3 w-80 rounded-sm" />
          </div>
          <Skeleton className="h-6 w-36 rounded-md self-start sm:self-auto" />
        </div>

        <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0c121e]">
                  <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-28 rounded-sm" /></th>
                  <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-24 rounded-sm" /></th>
                  <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-20 rounded-sm" /></th>
                  <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-24 rounded-sm" /></th>
                  <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-24 rounded-sm" /></th>
                  <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 text-right"><Skeleton className="h-3 w-16 ml-auto rounded-sm" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60">
                {[1, 2, 3].map((idx) => (
                  <tr key={idx} className="hover:bg-[#141C2B]/30 transition-colors">
                    <td className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3.5 w-24 rounded-sm font-mono" /></td>
                    <td className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-16 rounded-sm" /></td>
                    <td className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3.5 w-20 rounded-sm font-mono" /></td>
                    <td className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-5 w-36 rounded" /></td>
                    <td className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3.5 w-28 rounded-sm" /></td>
                    <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="w-16 h-6 rounded-md" />
                        <Skeleton className="w-14 h-6 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0F1522] border border-[#1E293B] p-3 sm:p-3.5 rounded-xl shadow-sm">
        <Skeleton className="w-full sm:w-80 md:w-96 h-9 rounded-lg" />
        <Skeleton className="w-full sm:w-36 h-9 rounded-lg" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0c121e]">
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-20 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-28 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden md:table-cell"><Skeleton className="h-3 w-32 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden lg:table-cell"><Skeleton className="h-3 w-16 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5"><Skeleton className="h-3 w-16 rounded-sm" /></th>
                <th className="px-3.5 sm:px-4 py-3 sm:py-3.5 text-right"><Skeleton className="h-3 w-14 ml-auto rounded-sm" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="hover:bg-[#141C2B]/30 transition-colors">
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <Skeleton className="h-3.5 w-16 rounded-sm font-mono" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-32 rounded-sm" />
                      <Skeleton className="h-2.5 w-24 rounded-sm" />
                    </div>
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden md:table-cell">
                    <Skeleton className="h-3.5 w-28 rounded-sm" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 hidden lg:table-cell">
                    <Skeleton className="h-3.5 w-14 rounded-sm" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5">
                    <Skeleton className="h-5 w-20 rounded" />
                  </td>
                  <td className="px-3.5 sm:px-4 py-3 sm:py-3.5 text-right">
                    <Skeleton className="w-16 h-7 ml-auto rounded-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Tab 5: System Configuration
 */
export function ConfigTabSkeleton() {
  return (
    <div className="bg-[#0F1522] border border-[#1E293B] rounded-xl p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6 shadow-sm max-w-3xl mx-auto">
      <div className="space-y-1.5 pb-4 border-b border-[#1E293B]">
        <Skeleton className="h-5 w-48 rounded-sm" />
        <Skeleton className="h-3 w-80 rounded-sm" />
      </div>

      <div className="space-y-5">
        {/* Toggle 1: Maintenance Mode */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#0a0b1dff] border border-[#1E293B]">
          <div className="space-y-1">
            <Skeleton className="h-4 w-36 rounded-sm" />
            <Skeleton className="h-3 w-64 rounded-sm" />
          </div>
          <Skeleton className="w-11 h-6 rounded-full" />
        </div>

        {/* Setting 2: Registration Gate */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#0a0b1dff] border border-[#1E293B] space-y-2">
          <Skeleton className="h-3.5 w-32 rounded-sm" />
          <Skeleton className="h-9 w-full rounded-lg bg-[#0F1522]" />
        </div>

        {/* Setting 3: Rate Limiting */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#0a0b1dff] border border-[#1E293B] space-y-2">
          <Skeleton className="h-3.5 w-44 rounded-sm" />
          <Skeleton className="h-9 w-full sm:w-48 rounded-lg bg-[#0F1522]" />
        </div>

        {/* Setting 4: Alert Banner */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#0a0b1dff] border border-[#1E293B] space-y-2">
          <Skeleton className="h-3.5 w-40 rounded-sm" />
          <Skeleton className="h-20 w-full rounded-lg bg-[#0F1522]" />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Skeleton className="w-full sm:w-36 h-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar Navigation Skeleton (Matches expanded and collapsed state)
 */
export function SidebarSkeleton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <aside
      className={`bg-[#0c101a] border-r border-[#1a2333] flex flex-col justify-between shrink-0 ${
        collapsed ? 'w-[68px]' : 'w-64'
      } h-[calc(100vh-68px)] sticky top-[68px]`}
      aria-hidden="true"
    >
      <div className="p-4 space-y-6">
        {/* Brand Console Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            {!collapsed && (
              <div className="space-y-1 min-w-0">
                <Skeleton className="h-3.5 w-24 rounded-sm" />
                <Skeleton className="h-2.5 w-20 rounded-sm" />
              </div>
            )}
          </div>
          {!collapsed && <Skeleton className="w-7 h-7 rounded-md shrink-0" />}
        </div>

        {/* Nav Items */}
        <div className="space-y-4">
          {[1, 2, 3].map((grp) => (
            <div key={grp} className="space-y-1.5">
              {!collapsed && <Skeleton className="h-2.5 w-24 rounded-sm mb-2" />}
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
                  {!collapsed && <Skeleton className="h-3 w-32 rounded-sm" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile & Telemetry */}
      <div className="p-3.5 border-t border-[#1E293B] bg-[#0a0b1dff]/50 space-y-3">
        {!collapsed && (
          <div className="px-3 py-2 rounded-md bg-[#0a0b1dff]/70 border border-[#1E293B]/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-20 rounded-sm" />
              <Skeleton className="h-2.5 w-12 rounded-sm" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-2 w-16 rounded-sm" />
              <Skeleton className="h-2 w-10 rounded-sm" />
            </div>
          </div>
        )}

        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            {!collapsed && (
              <div className="space-y-1 min-w-0">
                <Skeleton className="h-3 w-28 rounded-sm" />
                <Skeleton className="h-2 w-20 rounded-sm" />
              </div>
            )}
          </div>
          {!collapsed && <Skeleton className="w-7 h-7 rounded-md shrink-0" />}
        </div>
      </div>
    </aside>
  );
}

/**
 * Complete Full Dashboard Page Skeleton (Zero CLS, zero white flash)
 */
export function DashboardPageSkeleton() {
  return (
    <div className="flex-1 w-full bg-[#0a0b1dff] text-[#FDF4D2] flex flex-col lg:flex-row">
      {/* Sidebar Rail Skeleton */}
      <div className="hidden lg:block">
        <SidebarSkeleton collapsed={false} />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-5 sm:space-y-6 lg:space-y-8">
          {/* Top Title & Telemetry Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#1E293B]/70 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton className="h-2.5 w-24 rounded-sm" />
                <Skeleton className="h-2.5 w-2 rounded-sm" />
                <Skeleton className="h-2.5 w-28 rounded-sm" />
                <Skeleton className="h-2.5 w-2 rounded-sm" />
                <Skeleton className="h-4 w-20 rounded font-mono" />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-6 w-64 rounded-md" />
                <Skeleton className="h-5 w-24 rounded font-mono" />
              </div>
              <Skeleton className="h-3 w-80 rounded-sm" />
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Skeleton className="hidden sm:block h-8 w-44 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>

          {/* Tier 1: 4 Commercial Volume KPI Cards */}
          <TelemetryKpiGridSkeleton />

          {/* Tier 2: Real-Time Pipeline Health Console */}
          <HealthConsoleSkeleton />

          {/* Section 2: Management View Header */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-[#1E293B] space-y-1">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-sm" />
            </div>

            {/* Default Tab Content Skeleton */}
            <TenantsTabSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}
