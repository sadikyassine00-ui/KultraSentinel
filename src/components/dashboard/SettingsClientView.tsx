'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  Check,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Bell,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { openPaddleOverlayCheckout } from '@/lib/paddle/client';
import { PaddleCheckoutModal } from '@/components/billing/PaddleCheckoutOverlay';

interface BillingState {
  status: 'active trial' | 'paid active' | 'expired' | 'canceled';
  daysRemaining: number;
  trialEndsAt: string;
  formattedTrialEnd: string;
  isLocked: boolean;
  upgradeUrl: string;
  hasTrialStarted?: boolean;
  isSuperAdmin?: boolean;
  planTier?: 'Solo' | 'Agency' | 'Superadmin';
  planName?: string;
  monthlyPrice?: number;
  formattedPrice?: string;
  renewalOrExpirationDate?: string;
  formattedRenewalOrExpiration?: string;
  isUrgent?: boolean;
  quotas?: {
    gmcAccountsConnected: number;
    gmcAccountsLimit: number | 'unlimited';
    slackDestinationsActive: number;
    pubsubMonitoringStatus: 'Active' | 'Paused' | 'Degraded';
  };
}

interface Props {
  initialTab?: string;
  checkoutSuccess?: boolean;
  upgradedPlan?: string | null;
}

export default function SettingsClientView({
  initialTab = 'billing',
  checkoutSuccess = false,
  upgradedPlan = null,
}: Props) {
  const [activeTab, setActiveTab] = useState<'billing' | 'general'>(
    initialTab === 'general' ? 'general' : 'billing'
  );
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [stores, setStores] = useState<Array<{ id: number | string; name: string; gmcId: string }>>([]);
  const [processingCheckout, setProcessingCheckout] = useState<'solo' | 'agency' | null>(null);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<'solo' | 'agency' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(checkoutSuccess);

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.userEmail) {
          setUserEmail(data.userEmail);
        }
        if (data.billing) {
          setBilling(data.billing);
        }
        if (data.stores && Array.isArray(data.stores)) {
          setStores(
            data.stores.map((s: { id: number | string; store_name?: string; store_url?: string; gmc_id?: string; merchant_id?: string }) => ({
              id: s.id,
              name: s.store_name || s.store_url || 'Store',
              gmcId: s.gmc_id || s.merchant_id || 'UNKNOWN',
            }))
          );
        }
      }
    } catch {
      // Non-blocking fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const isSuperAdmin = Boolean(billing?.isSuperAdmin);
  const isTrial = billing?.status === 'active trial';
  const isPaidActive = billing?.status === 'paid active';
  const isSolo = isPaidActive && (billing?.planTier === 'Solo' || billing?.planName?.includes('Solo'));
  const isAgency = isPaidActive && (billing?.planTier === 'Agency' || billing?.planName?.includes('Agency'));
  const isExpired = Boolean(billing?.isLocked || billing?.status === 'expired');

  useEffect(() => {
    if (checkoutSuccess && !isPaidActive && !isSuperAdmin) {
      const interval = setInterval(() => {
        fetchBillingData();
      }, 2500);
      const timer = setTimeout(() => clearInterval(interval), 15000);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [checkoutSuccess, isPaidActive, isSuperAdmin, fetchBillingData]);
  const handleCheckout = (plan: 'solo' | 'agency') => {
    setCheckoutError(null);
    setCheckoutModalPlan(plan);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <div className="h-10 w-48 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-sm)]" />
        <div className="h-64 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
        <div className="h-48 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-md)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--hairline)]">
        <div>
          <h1 className="font-serif text-[24px] sm:text-[28px] font-semibold text-[var(--ink-primary)] tracking-tight">
            Account Settings &amp; Plan Management
          </h1>
          <p className="text-[13.5px] text-[var(--ghost-text)] mt-1">
            Manage your subscription tier, Google Merchant Center quotas, and integration telemetry.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="btn-secondary text-[12.5px] py-1.5 px-3 self-start sm:self-auto !rounded-[3px] inline-flex items-center gap-1.5"
        >
          <span>&larr; Back to Catalog Triage</span>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--hairline)] pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-2 outline-none ${
            activeTab === 'billing'
              ? 'border-[var(--signal)] text-[var(--ink-primary)] font-semibold'
              : 'border-transparent text-[var(--ghost-text)] hover:text-[var(--ink-primary)]'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${activeTab === 'billing' ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'}`} />
          <span>Billing &amp; Subscription</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-2 outline-none ${
            activeTab === 'general'
              ? 'border-[var(--signal)] text-[var(--ink-primary)] font-semibold'
              : 'border-transparent text-[var(--ghost-text)] hover:text-[var(--ink-primary)]'
          }`}
        >
          <SlidersHorizontal className={`w-4 h-4 ${activeTab === 'general' ? 'text-[var(--signal)]' : 'text-[var(--ghost-text)]'}`} />
          <span>Store &amp; Webhooks</span>
        </button>
      </div>

      {/* Success Notification Banner: only shown when subscription is authentically confirmed in database */}
      {showSuccessBanner && isPaidActive && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-[var(--signal)] shrink-0" />
            <div>
              <div className="text-[13.5px] font-semibold text-[var(--ink-primary)]">
                Subscription Confirmed
              </div>
              <div className="text-[12.5px] text-[var(--ink-secondary)] mt-0.5">
                Your account is now activated on the {billing?.planTier === 'Agency' ? 'Agency Fleet ($49/mo)' : 'Solo Merchant ($19/mo)'} tier. 24/7 disapproval surveillance is armed.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessBanner(false)}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] text-[12px] font-mono p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Awaiting Webhook Confirmation Banner: shown when returning from checkout before webhook has completed */}
      {showSuccessBanner && !isPaidActive && !isSuperAdmin && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] border border-[var(--signal-dim)] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[var(--signal)] shrink-0 animate-spin" />
            <div>
              <div className="text-[13.5px] font-semibold text-[var(--ink-primary)]">
                Payment Submitted - Awaiting Webhook Confirmation
              </div>
              <div className="text-[12.5px] text-[var(--ink-secondary)] mt-0.5">
                Your payment is being processed by Paddle. Your paid tier will activate automatically as soon as the cryptographically signed webhook is confirmed.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessBanner(false)}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] text-[12px] font-mono p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Checkout Error Banner */}
      {checkoutError && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--danger-wash)] border border-[var(--danger)] flex items-start justify-between gap-3">
          <div className="text-[13px] text-[var(--danger)]">
            {checkoutError}
          </div>
          <button
            type="button"
            onClick={() => setCheckoutError(null)}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] text-[12px] font-mono p-1"
          >
            ✕
          </button>
        </div>
      )}

      {activeTab === 'billing' ? (
        <div className="space-y-6">
          {/* 1. Primary "Current Plan" Summary Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--hairline)]">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] uppercase tracking-wider">
                    CURRENT SUBSCRIPTION
                  </span>
                  {isSuperAdmin ? (
                    <span className="tag-pill tag-signal text-[10.5px] py-0.5">
                      Lifetime Access
                    </span>
                  ) : isTrial ? (
                    <span className={`tag-pill ${billing?.daysRemaining && billing.daysRemaining <= 3 ? 'tag-danger' : 'tag-ghost'} text-[10.5px] py-0.5`}>
                      Active Trial ({billing?.daysRemaining} {billing?.daysRemaining === 1 ? 'day' : 'days'} left)
                    </span>
                  ) : isExpired ? (
                    <span className="tag-pill tag-danger text-[10.5px] py-0.5">
                      Trial Expired (Locked)
                    </span>
                  ) : (
                    <span className="tag-pill tag-signal text-[10.5px] py-0.5">
                      Active Paid
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-[26px] font-semibold text-[var(--ink-primary)]">
                  {isSuperAdmin ? 'Platform Owner / Lifetime Admin' : billing?.planName || 'Free Trial'}
                </h2>
                <p className="text-[13px] text-[var(--ghost-text)] mt-1">
                  {isSuperAdmin
                    ? 'Permanent superadmin privileges with unrestricted multi-store monitoring.'
                    : isTrial
                    ? 'Full feature access during your 14-day evaluation window.'
                    : isSolo
                    ? 'Single-store standalone Google Shopping campaign protection.'
                    : isAgency
                    ? 'Multi-store agency fleet protection with MCA support.'
                    : 'Monitoring paused. Upgrade to reactivate 24/7 disapproval surveillance.'}
                </p>
              </div>

              {/* Price & Billing Cycle */}
              <div className="sm:text-right shrink-0">
                <div className="flex items-baseline sm:justify-end gap-1.5">
                  <span className="font-mono text-[32px] font-semibold text-[var(--ink-primary)] leading-none">
                    {isSuperAdmin
                      ? '$0'
                      : isTrial
                      ? '$0'
                      : isAgency
                      ? '$49'
                      : '$19'}
                  </span>
                  <span className="font-mono text-[13px] text-[var(--ghost-text)]">
                    {isSuperAdmin ? '/ lifetime' : '/ month'}
                  </span>
                </div>
                <div className="font-mono text-[11.5px] text-[var(--ghost-text-dim)] mt-1.5">
                  {isSuperAdmin
                    ? 'Complimentary Platform Owner'
                    : isTrial
                    ? `Trial ends ${billing?.formattedTrialEnd || 'in 14 days'}`
                    : `Renewal: ${billing?.formattedRenewalOrExpiration || 'Auto-renews monthly'}`}
                </div>
              </div>
            </div>

            {/* Account Quotas & Entitlements (§2 Account Quotas and Feature Visibility) */}
            <div className="pt-6">
              <div className="text-[12.5px] font-semibold text-[var(--ghost-text)] mb-3">
                Current Plan Entitlements &amp; Quotas
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Quota 1: GMC Accounts */}
                <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[var(--signal)]" />
                      GMC ACCOUNTS
                    </span>
                    <span className="font-mono text-[11px] text-[var(--ink-primary)] font-medium">
                      {isAgency || isSuperAdmin
                        ? `${stores.length} of Unlimited`
                        : `${Math.min(stores.length, 1)} of 1`}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--ghost-text)] mt-1">
                    {isAgency || isSuperAdmin
                      ? 'Multi-store & MCA child accounts enabled.'
                      : 'Single Google Merchant Center account.'}
                  </div>
                </div>

                {/* Quota 2: Slack Alert Destinations */}
                <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[var(--signal)]" />
                      ALERT DESTINATIONS
                    </span>
                    <span className="font-mono text-[11px] text-[var(--signal)] font-medium">
                      Active
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--ghost-text)] mt-1">
                    Instant sub-30s Slack webhook telemetry.
                  </div>
                </div>

                {/* Quota 3: Real-Time Pub/Sub Monitoring */}
                <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[var(--signal)]" />
                      PUB/SUB INGESTION
                    </span>
                    <span className={`font-mono text-[11px] font-medium ${isExpired ? 'text-[var(--danger)]' : 'text-[var(--signal)]'}`}>
                      {isExpired ? 'Paused' : 'Active'}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--ghost-text)] mt-1">
                    {isExpired
                      ? 'Telemetry paused due to expired trial.'
                      : 'Real-time Google Merchant API v1 streaming.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Conversion and Upgrade Actions (§2 Conversion and Upgrade Actions) */}
          {!isSuperAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--ink-primary)]">
                    {isSolo ? 'Upgrade to Agency Fleet' : 'Available Subscription Plans'}
                  </h3>
                  <p className="text-[12.5px] text-[var(--ghost-text)] mt-0.5">
                    {isSolo
                      ? 'Scale to multi-store management and unlock MCA child store support.'
                      : 'Select a plan to maintain 24/7 disapproval surveillance and instant Slack triage.'}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Comparison Cards for Trial/Expired Users */}
              {(isTrial || isExpired) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                  {/* Solo Plan Card */}
                  <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] rounded-[var(--radius-md)] p-6 flex flex-col justify-between transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">SINGLE STORE</span>
                        <span className="tag-pill tag-ghost text-[10px]">Solo</span>
                      </div>
                      <h4 className="font-serif text-[20px] font-semibold text-[var(--ink-primary)]">
                        Solo Merchant
                      </h4>
                      <p className="text-[13px] text-[var(--ghost-text)] mt-1">
                        For standalone Shopify brands scaling Google Shopping campaigns.
                      </p>

                      <div className="mt-4 mb-5 pb-5 border-b border-[var(--hairline)]">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-[28px] font-semibold text-[var(--ink-primary)]">$19</span>
                          <span className="font-mono text-[12px] text-[var(--ghost-text)]">/ month flat</span>
                        </div>
                      </div>

                      <ul className="space-y-2.5 text-[12.5px] text-[var(--ink-secondary)]">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span><strong className="text-[var(--ink-primary)]">1 GMC Account ID</strong> connected</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span><strong className="text-[var(--ink-primary)]">Unlimited SKUs</strong> monitored 24/7</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span>Real-time Cloud Pub/Sub push alerts (&lt; 30s)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span>Direct 1-click Shopify Admin deep links</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span>Instant Slack incident dispatch</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[var(--hairline)]">
                      <button
                        type="button"
                        disabled={processingCheckout !== null}
                        onClick={() => handleCheckout('solo')}
                        className="btn-secondary w-full justify-center text-[13px] py-2.5 !rounded-[3px] font-semibold disabled:opacity-50"
                      >
                        {processingCheckout === 'solo' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          'Upgrade to Solo ($19/mo)'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Agency Plan Card */}
                  <div
                    className="bg-[var(--bg-surface)] border border-[var(--signal-dim)] rounded-[var(--radius-md)] p-6 flex flex-col justify-between relative overflow-hidden"
                    style={{ background: 'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 65%)' }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-[var(--signal)]">MULTI-STORE FLEET</span>
                        <span className="tag-pill tag-signal text-[10px]">Recommended</span>
                      </div>
                      <h4 className="font-serif text-[20px] font-semibold text-[var(--ink-primary)]">
                        Agency Fleet
                      </h4>
                      <p className="text-[13px] text-[var(--ink-secondary)] mt-1">
                        For agencies and aggregators managing multiple stores and MCA child accounts.
                      </p>

                      <div className="mt-4 mb-5 pb-5 border-b border-[var(--hairline)]">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-[28px] font-semibold text-[var(--ink-primary)]">$49</span>
                          <span className="font-mono text-[12px] text-[var(--ghost-text)]">/ month flat</span>
                        </div>
                      </div>

                      <ul className="space-y-2.5 text-[12.5px] text-[var(--ink-secondary)]">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span><strong className="text-[var(--ink-primary)]">Unlimited GMC Accounts</strong> connected</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span><strong className="text-[var(--ink-primary)]">Multi-Client MCA</strong> child store support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span>Team seats &amp; shared client triage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span>Sub-30s priority Pub/Sub stream</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--signal)] shrink-0 mt-0.5" />
                          <span>Dedicated Slack channel routing per store</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[var(--hairline)]">
                      <button
                        type="button"
                        disabled={processingCheckout !== null}
                        onClick={() => handleCheckout('agency')}
                        className="btn-primary w-full justify-center text-[13px] py-2.5 !rounded-[3px] font-semibold disabled:opacity-50"
                      >
                        {processingCheckout === 'agency' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          'Upgrade to Agency ($49/mo)'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upgrade to Agency Card for Solo Users */}
              {isSolo && (
                <div
                  className="bg-[var(--bg-surface)] border border-[var(--signal-dim)] rounded-[var(--radius-md)] p-6 sm:p-7 relative overflow-hidden"
                  style={{ background: 'radial-gradient(ellipse at top right, var(--signal-wash) 0%, var(--bg-surface) 65%)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="tag-pill tag-signal text-[10.5px]">Multi-Store Expansion</span>
                        <span className="font-mono text-[11px] text-[var(--signal)]">Save on Fleet Operations</span>
                      </div>
                      <h4 className="font-serif text-[22px] font-semibold text-[var(--ink-primary)]">
                        Upgrade to Agency Fleet ($49/mo)
                      </h4>
                      <p className="text-[13px] text-[var(--ink-secondary)] leading-[1.55]">
                        Need to monitor additional Google Merchant Center accounts? Upgrade to Agency to connect unlimited GMC accounts, monitor MCA child stores, and add team seats.
                      </p>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        disabled={processingCheckout !== null}
                        onClick={() => handleCheckout('agency')}
                        className="btn-primary px-6 py-2.5 text-[13px] font-semibold !rounded-[3px] disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {processingCheckout === 'agency' ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>Upgrade to Agency ($49/mo)</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Agency Fleet Active Card */}
              {isAgency && (
                <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[var(--signal)]" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-[var(--ink-primary)]">
                        Agency Fleet Tier Active
                      </h4>
                      <p className="text-[12.5px] text-[var(--ghost-text)] mt-0.5">
                        You have unlocked unlimited Google Merchant Center connections and MCA fleet routing. Need custom enterprise volume or dedicated account support? Contact{' '}
                        <a href="mailto:support@usekultra.com" className="text-[var(--signal)] hover:underline">
                          support@usekultra.com
                        </a>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Superadmin Exclusive Summary Card */}
          {isSuperAdmin && (
            <div className="bg-[var(--bg-surface)] border border-[var(--signal-dim)] rounded-[var(--radius-md)] p-6 sm:p-7 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[var(--signal)]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[15px] font-semibold text-[var(--ink-primary)]">
                    Permanent Superadmin Privileges
                  </h3>
                  <p className="text-[13px] text-[var(--ghost-text)] leading-[1.55]">
                    This account (<strong className="text-[var(--ink-primary)] font-mono">yassinesadik0@gmail.com</strong>) is registered as the platform owner. All trial expirations, payment requirements, and store quotas are permanently bypassed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: General & Store Management */
        <div className="bg-[var(--bg-surface)] border border-[var(--hairline)] rounded-[var(--radius-md)] p-6 space-y-6">
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--ink-primary)]">
              Connected Google Merchant Center Stores
            </h3>
            <p className="text-[13px] text-[var(--ghost-text)] mt-0.5">
              Review active store connections and alert endpoints.
            </p>
          </div>

          <div className="space-y-3">
            {stores.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]"
              >
                <div>
                  <div className="text-[13.5px] font-medium text-[var(--ink-primary)]">
                    {s.name}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--ghost-text)] mt-0.5">
                    GMC Account ID: #{s.gmcId}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="tag-pill tag-signal text-[10px]">
                    Telemetry Active
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-3">
              <a
                href="/api/auth/merchant/connect"
                className="btn-secondary text-[12.5px] py-2 px-4 !rounded-[3px] inline-flex items-center gap-2"
              >
                <span>+ Connect another Google Merchant Center</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Branded, Mobile-Responsive Paddle Checkout Modal (§2, §3, GEMINI.md) */}
      <PaddleCheckoutModal
        isOpen={Boolean(checkoutModalPlan)}
        plan={checkoutModalPlan || 'solo'}
        userEmail={userEmail}
        onClose={() => setCheckoutModalPlan(null)}
      />
    </div>
  );
}
