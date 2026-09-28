import React from 'react';

/**
 * Base lightweight skeleton atom per GEMINI.md §11.
 * Default subtle muted dark-theme background pulse on --bg-surface using --bg-surface-2.
 * NO harsh, bright gray blocks. Holds still when prefers-reduced-motion is active.
 */
export function Skeleton({
  className = '',
  style,
  static: isStatic = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  static?: boolean;
}) {
  return (
    <div
      className={`${isStatic ? 'skeleton-static' : 'skeleton-pulse'} rounded-[var(--radius-sm)] ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/* ========================================================================== */
/* USER DASHBOARD SKELETONS (AGENCY LIVE GMC MONITORING)                      */
/* ========================================================================== */

/**
 * Live Status Ribbon Skeleton:
 * Fixed-height horizontal placeholder mirroring the four live status segments:
 * 1. Monitoring Status (pulsing status dot outline + operational text)
 * 2. Alert Destination (channel label + status indicator)
 * 3. Verified Incident Risk (status pill badge)
 * 4. Monitored Inventory (SKU count + label)
 * Separated by vertical dividers matching production geometry.
 */
export function LiveStatusRibbonSkeleton() {
  return (
    <div
      className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-sm)] px-3.5 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-mono min-h-[38px]"
      aria-label="Loading feed status ribbon"
    >
      {/* Segment 1: Real-Time Feed Protection Status */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full border border-[var(--signal-dim)] bg-[var(--signal-wash)] shrink-0" aria-hidden="true" />
        <Skeleton className="h-3.5 w-48" />
      </div>

      {/* Divider 1 */}
      <div className="hidden sm:block h-3.5 w-px bg-[var(--hairline)]" aria-hidden="true" />

      {/* Segment 2: Slack Alert Destination */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Divider 2 */}
      <div className="hidden md:block h-3.5 w-px bg-[var(--hairline)]" aria-hidden="true" />

      {/* Segment 3: Incident Risk Status Pill */}
      <div className="shrink-0">
        <Skeleton className="h-5 w-36 rounded-[var(--radius-pill)] border border-[var(--hairline)]" />
      </div>

      {/* Divider 3 */}
      <div className="hidden lg:block h-3.5 w-px bg-[var(--hairline)]" aria-hidden="true" />

      {/* Segment 4: Verified Monitored Inventory */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
  );
}

/**
 * Core Metrics Grid Skeleton:
 * Responsive card placeholder layout matching:
 * - Card 1: Catalog Health & Risk (Dominant KPI card)
 * - Card 2: Disapproval Diagnostics / Four-State Inventory Breakdown
 * - Card 3: Slack Alert Routing (Channel destination + verification latency)
 * - Card 4: Real-Time Feed Protection (Continuous GMC monitoring engine)
 */
export function CoreMetricsGridSkeleton({ cardCount = 4 }: { cardCount?: 3 | 4 }) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        cardCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
      } gap-4`}
    >
      {/* Card 1: Catalog Health & Risk */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col justify-between min-h-[175px]">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-5 w-24 rounded-[var(--radius-pill)]" />
          </div>
          <Skeleton className="h-8 w-44 mt-3" />
        </div>
        <div className="pt-2.5 border-t border-[var(--hairline)] mt-3">
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Card 2: Disapproval Diagnostics / Inventory Breakdown */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col justify-between min-h-[175px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="space-y-2 py-0.5 mt-2">
            {/* 1. Serving Ads */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-dim)]" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>

            {/* 2. Expiring Soon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-dim)]" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>

            {/* 3. In Review */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-line)]" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>

            {/* 4. Disapproved */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ghost-line)]" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--hairline)] mt-2">
          <Skeleton className="h-2.5 w-36" />
        </div>
      </div>

      {/* Card 3: Slack Alert Routing (Slack Connection) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col justify-between min-h-[175px]">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-5 w-20 rounded-[var(--radius-pill)]" />
          </div>
          <Skeleton className="h-6 w-36 mt-2" />
        </div>

        <div className="pt-2.5 border-t border-[var(--hairline)] flex items-center justify-between mt-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>

      {/* Card 4: Real-Time Feed Protection Engine */}
      {cardCount === 4 && (
        <div className="bg-[var(--bg-canvas)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 flex flex-col justify-between min-h-[175px] opacity-90">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-5 w-14 rounded-[var(--radius-pill)]" />
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--hairline)] mt-2">
            <Skeleton className="h-2.5 w-48" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Incident History Table Skeleton:
 * Structured table placeholder with simulated header row and locked column widths:
 * - Timestamp (w-44)
 * - Target Item / Store Name (w-56)
 * - Issue Detected / Disapproval Code (flex)
 * - Affected Status / Action Trigger Button (w-32, text-right)
 */
export function IncidentHistoryTableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 sm:p-5 border-b border-[var(--hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface-2)]">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-4 h-4 rounded-[var(--radius-sm)] shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72 sm:w-96" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-[var(--radius-pill)] shrink-0" />
      </div>

      {/* Structured Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-[12.5px] min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--hairline)] bg-[var(--bg-canvas)] font-mono text-[10.5px] uppercase tracking-wider text-[var(--ghost-text-dim)]">
              <th scope="col" className="py-2.5 px-4 font-semibold w-44">
                <Skeleton className="h-3 w-20" />
              </th>
              <th scope="col" className="py-2.5 px-4 font-semibold w-56">
                <Skeleton className="h-3 w-24" />
              </th>
              <th scope="col" className="py-2.5 px-4 font-semibold">
                <Skeleton className="h-3 w-28" />
              </th>
              <th scope="col" className="py-2.5 px-4 font-semibold text-right w-32">
                <Skeleton className="h-3 w-16 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hairline)]">
            {Array.from({ length: rowCount }).map((_, idx) => (
              <tr key={idx} className="hover:bg-[var(--bg-surface-2)]/50 transition-colors">
                {/* Timestamp */}
                <td className="py-3 px-4 w-44 align-top space-y-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-16" />
                </td>

                {/* Target Item / Store Name */}
                <td className="py-3 px-4 w-56 align-top space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-2.5 w-24" />
                    {idx % 2 === 1 && (
                      <Skeleton className="h-3.5 w-16 rounded-[var(--radius-sm)]" />
                    )}
                  </div>
                </td>

                {/* Issue Detected / Disapproval Code */}
                <td className="py-3 px-4 align-top space-y-1.5">
                  <Skeleton className="h-3.5 w-48 sm:w-56" />
                  <Skeleton className="h-3 w-full max-w-lg" />
                </td>

                {/* Status / Action Trigger Button */}
                <td className="py-3 px-4 text-right w-32 align-top">
                  <Skeleton className="h-5 w-20 rounded-[var(--radius-pill)] ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Complete Full Customer / Agency Dashboard Page Skeleton (Zero CLS).
 * Matches exact geometry of TenantTriageCenter:
 * - Operational Header Bar (Store Context & 2 Action Buttons)
 * - Live Status Ribbon Skeleton
 * - Core Metrics Grid Skeleton
 * - Active Incident Triage Area Placeholder
 * - Incident History Table Skeleton
 */
export function CustomerDashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0 max-w-full">
      {/* Operational Header Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-5 w-24 rounded-[var(--radius-pill)]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-[var(--radius-sm)]" />
          <Skeleton className="h-8 w-36 rounded-[var(--radius-sm)]" />
        </div>
      </div>

      {/* Live Status Ribbon Skeleton */}
      <LiveStatusRibbonSkeleton />

      {/* Core Metrics Grid Skeleton */}
      <CoreMetricsGridSkeleton cardCount={4} />

      {/* Active Incident Triage Area Placeholder */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-36 rounded-[var(--radius-pill)]" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <Skeleton className="h-3.5 w-32" />
        </div>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-[var(--radius-sm)] shrink-0" />
          <div className="flex-1 space-y-2 w-full">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-40" />
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)] space-y-2">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[var(--hairline)]">
          <Skeleton className="h-7 w-36 rounded-[var(--radius-sm)]" />
          <Skeleton className="h-7 w-24 rounded-[var(--radius-sm)]" />
        </div>
      </div>

      {/* Incident History Table Skeleton */}
      <IncidentHistoryTableSkeleton rowCount={5} />
    </div>
  );
}

export const UserDashboardSkeleton = CustomerDashboardSkeleton;

/* ========================================================================== */
/* SUPERADMIN TELEMETRY CONSOLE SKELETONS                                     */
/* ========================================================================== */

/**
 * Topline KPI Bar Skeleton:
 * Four compact metric placeholders holding exact space for:
 * 1. Total MRR (Monthly Recurring Revenue)
 * 2. Active Accounts (Paid Subscriptions vs Active Trials)
 * 3. Monitored Stores (GMC Connected Registry)
 * 4. System Error Rate / SKUs Tracked (Pub/Sub Ingestion Monitoring)
 */
export function ToplineKpiBarSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Total MRR */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-32 mt-1" />
        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-dim)]" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Card 2: Active Accounts (Paid vs Trial) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-36 mt-1" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-1.5 w-full rounded-[2px]" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      {/* Card 3: Monitored Stores */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-16 mt-1" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Card 4: Observed SKUs & Error Rate / Ingestion */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-28 mt-1" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

// Aliased for backward compatibility
export const TelemetryKpiGridSkeleton = ToplineKpiBarSkeleton;

/**
 * Skeleton matching Tier 1 Commercial Volume KPI Cards.
 */
export function KpiCardSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-4 sm:p-5 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
      </div>
      <Skeleton className="h-8 w-32 mt-1" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * Skeleton matching Tier 2 Real-Time Pipeline Health Console.
 */
export function HealthConsoleSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-surface)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--hairline)]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="w-3.5 h-3.5 rounded-[var(--radius-sm)]" />
          </div>
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-2 w-full rounded-[2px]" />
          <Skeleton className="h-2.5 w-36" />
        </div>
      ))}
    </div>
  );
}

/**
 * Store Registry Table Skeleton:
 * Expanded administrative data table skeleton with ghost rows, customer identifiers,
 * webhook health badges, plan tier pills, and admin action controls.
 */
export function StoreRegistryTableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[var(--bg-surface)] border border-[var(--hairline)] p-3 rounded-[var(--radius-md)]">
        <Skeleton className="w-full sm:w-80 md:w-96 h-9 rounded-[var(--radius-sm)]" />
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Skeleton className="flex-1 sm:w-36 h-9 rounded-[var(--radius-sm)]" />
          <Skeleton className="flex-1 sm:w-32 h-9 rounded-[var(--radius-sm)]" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[var(--bg-surface)] text-[var(--ghost-text-dim)] border-b border-[var(--hairline)] font-mono text-[11px]">
              <tr>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-24" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-24" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-20" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-20" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-24" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-20" /></th>
                <th className="px-4 py-3 font-normal text-right"><Skeleton className="h-3 w-14 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)]">
              {Array.from({ length: rowCount }).map((_, idx) => (
                <tr key={idx} className="hover:bg-[var(--bg-surface-2)] transition-colors">
                  {/* GMC Merchant ID */}
                  <td className="px-4 py-3">
                    <Skeleton className="h-3.5 w-24 font-mono" />
                  </td>

                  {/* Parent Tenant (Customer Identifier) */}
                  <td className="px-4 py-3 space-y-1">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-2.5 w-20" />
                  </td>

                  {/* Account Type / Plan Tier Pill */}
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-28 rounded-[100px]" />
                  </td>

                  {/* Store Domain */}
                  <td className="px-4 py-3">
                    <Skeleton className="h-3.5 w-32" />
                  </td>

                  {/* Pub/Sub State & Webhook Health Badge */}
                  <td className="px-4 py-3 space-y-1">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-24" />
                  </td>

                  {/* Disapprovals Status Pill */}
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-24 rounded-[100px]" />
                  </td>

                  {/* Admin Action Controls */}
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-7 w-20 rounded-[var(--radius-sm)] ml-auto" />
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

// Aliased for backward compatibility
export const StoresTabSkeleton = StoreRegistryTableSkeleton;

/**
 * Skeleton for Tab 1: Tenant Management Table
 */
export function TenantsTabSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[var(--bg-surface)] border border-[var(--hairline)] p-3 rounded-[var(--radius-md)]">
        <Skeleton className="w-full sm:w-80 md:w-96 h-9 rounded-[var(--radius-sm)]" />
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Skeleton className="flex-1 sm:w-28 h-9 rounded-[var(--radius-sm)]" />
          <Skeleton className="flex-1 sm:w-28 h-9 rounded-[var(--radius-sm)]" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[var(--bg-surface)] text-[var(--ghost-text-dim)] border-b border-[var(--hairline)] font-mono text-[11px]">
              <tr>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-28" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-20" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-24" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-20" /></th>
                <th className="px-4 py-3 font-normal"><Skeleton className="h-3 w-20" /></th>
                <th className="px-4 py-3 font-normal text-right"><Skeleton className="h-3 w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)]">
              {Array.from({ length: rowCount }).map((_, idx) => (
                <tr key={idx} className="hover:bg-[var(--bg-surface-2)] transition-colors">
                  {/* Tenant Identity (Avatar + Name + Email) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)] shrink-0" />
                      <div className="space-y-1 min-w-0">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </div>
                  </td>

                  {/* Plan Tier Pill */}
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20 rounded-[100px]" />
                  </td>

                  {/* Usage Footprint */}
                  <td className="px-4 py-3 space-y-1">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-2.5 w-24" />
                  </td>

                  {/* OAuth Status Badge */}
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20 rounded-[100px]" />
                  </td>

                  {/* Last Active Timestamp */}
                  <td className="px-4 py-3">
                    <Skeleton className="h-3 w-24" />
                  </td>

                  {/* Operational Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
                      <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
                      <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
                      <Skeleton className="w-7 h-7 rounded-[var(--radius-sm)]" />
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
 * Complete Full Admin Dashboard Page Skeleton (Zero CLS).
 * Holds the exact 240px (w-60) desktop sidebar rail space and identical container geometry.
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="flex-1 w-full bg-[var(--bg-canvas)] text-[var(--ink-primary)] font-sans antialiased flex flex-col lg:flex-row">
      {/* Mobile Sub-Navigation Bar Placeholder */}
      <div className="lg:hidden h-12 border-b border-[var(--hairline)] bg-[var(--bg-canvas)] px-3 sm:px-4 flex items-center justify-between sticky top-[60px] z-30 gap-2">
        <Skeleton className="h-7 w-40 rounded-[var(--radius-sm)]" />
        <Skeleton className="h-6 w-28 rounded-[var(--radius-pill)]" />
      </div>

      {/* Desktop Fixed Sidebar Spacer (preserves exact layout width without 240px reflow) */}
      <div aria-hidden="true" className="hidden lg:block shrink-0 w-60" />

      {/* Desktop Fixed Sidebar Rail Placeholder */}
      <aside className="hidden lg:flex w-60 fixed top-[60px] bottom-0 left-0 bg-[var(--bg-surface)] border-r border-[var(--hairline)] z-20 flex-col justify-between p-3 overflow-hidden">
        <div className="space-y-4 pt-2">
          {/* Section 1 */}
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-20 px-2" />
            <div className="space-y-1">
              <Skeleton className="h-8 w-full rounded-[var(--radius-sm)]" />
              <Skeleton className="h-8 w-full rounded-[var(--radius-sm)]" />
              <Skeleton className="h-8 w-full rounded-[var(--radius-sm)]" />
              <Skeleton className="h-8 w-full rounded-[var(--radius-sm)]" />
            </div>
          </div>
          {/* Section 2 */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-2.5 w-24 px-2" />
            <Skeleton className="h-8 w-full rounded-[var(--radius-sm)]" />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-[var(--hairline)]">
          <Skeleton className="h-8 w-full rounded-[var(--radius-sm)]" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--hairline)]">
            <div className="space-y-1">
              <Skeleton className="h-6 w-60" />
              <Skeleton className="h-3.5 w-80" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-28 rounded-[var(--radius-sm)]" />
              <Skeleton className="h-8 w-24 rounded-[var(--radius-sm)]" />
            </div>
          </div>

          {/* Tier 1: Topline KPI Bar (Total MRR, Active Accounts, Monitored Stores, Observed SKUs) */}
          <ToplineKpiBarSkeleton />

          {/* Tier 2: Real-Time Pipeline Health Console */}
          <HealthConsoleSkeleton />

          {/* Active Tab Table */}
          <TenantsTabSkeleton />
        </main>
      </div>
    </div>
  );
}

export const DashboardPageSkeleton = AdminDashboardSkeleton;
