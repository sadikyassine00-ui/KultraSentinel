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
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { PaddleCheckoutModal } from '@/components/billing/PaddleCheckoutOverlay';
import { FleetLimitModal } from '@/components/dashboard/FleetLimitModal';
import { PRICING_TIERS } from '@/config/pricing';
import { PricingCard } from '@/components/billing/PricingCard';

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
  scheduledCancellationDate?: string | null;
  hasPaddleSubscription?: boolean;
  paddleSubscriptionId?: string | null;
  paddleCustomerId?: string | null;
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
  quotaExceeded?: string | null;
}

export default function SettingsClientView({
  initialTab = 'billing',
  checkoutSuccess = false,
  upgradedPlan = null,
  quotaExceeded = null,
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
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  // Self-serve Paddle Portal & Cancellation states
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Store Disconnection states
  const [disconnectingStoreId, setDisconnectingStoreId] = useState<string | number | null>(null);
  const [confirmDisconnectStoreId, setConfirmDisconnectStoreId] = useState<string | number | null>(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [disconnectSuccess, setDisconnectSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (quotaExceeded === 'agency') {
      setIsFleetModalOpen(true);
    } else if (quotaExceeded === 'solo') {
      setQuotaWarning('Solo Plan quota reached: Maximum 1 connected Google Merchant Center store allowed. Upgrade to Agency Fleet to connect up to 5 stores.');
      setActiveTab('billing');
    }
  }, [quotaExceeded]);

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

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    setPortalError(null);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(data.error || 'Failed to generate customer portal session.');
      }
    } catch {
      setPortalError('Network error connecting to billing portal. Please try again.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancellingSubscription(true);
    setCancelError(null);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setShowCancelModal(false);
        const dateStr = data.scheduledCancellationDate
          ? new Date(data.scheduledCancellationDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : 'the end of your current billing period';
        setCancelFeedback(
          `Subscription cancellation scheduled. Your Google Merchant Center monitoring and instant alert protection remain fully armed until ${dateStr}.`
        );
        await fetchBillingData();
      } else {
        setCancelError(data.error || 'Failed to schedule cancellation.');
      }
    } catch {
      setCancelError('Network error communicating with billing service.');
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleDisconnectStore = async (storeId: string | number) => {
    setDisconnectingStoreId(storeId);
    setDisconnectError(null);
    setDisconnectSuccess(null);
    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConfirmDisconnectStoreId(null);
        setStores((prev) => prev.filter((s) => String(s.id) !== String(storeId)));
        setDisconnectSuccess('Store disconnected and Google OAuth access revoked successfully.');
        setTimeout(() => setDisconnectSuccess(null), 5000);
        await fetchBillingData();
      } else {
        const data = await res.json();
        setDisconnectError(data.error || 'Failed to disconnect store. Please try again.');
      }
    } catch {
      setDisconnectError('Network error disconnecting store. Please try again.');
    } finally {
      setDisconnectingStoreId(null);
    }
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
    <div className="space-y-6 max-w-5xl mx-auto py-2 w-full min-w-0 max-w-full">
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
      <div className="flex items-center gap-2 border-b border-[var(--hairline)] pb-px overflow-x-auto w-full">
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

      {/* Cancellation Scheduled Banner */}
      {cancelFeedback && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-[var(--signal)] shrink-0" />
            <div>
              <div className="text-[13.5px] font-semibold text-[var(--ink-primary)]">
                Cancellation Scheduled
              </div>
              <div className="text-[12.5px] text-[var(--ink-secondary)] mt-0.5">
                {cancelFeedback}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCancelFeedback(null)}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] text-[12px] font-mono p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Portal Error Banner */}
      {portalError && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--danger-wash)] border border-[var(--danger)] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0" />
            <div className="text-[13px] text-[var(--danger)]">
              {portalError}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPortalError(null)}
            className="text-[var(--ghost-text)] hover:text-[var(--ink-primary)] text-[12px] font-mono p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
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

      {/* Awaiting Webhook Confirmation Banner */}
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
          {/* Active Scheduled Cancellation Notice */}
          {billing?.scheduledCancellationDate && !isSuperAdmin && (
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline-strong)] flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="tag-pill tag-ghost text-[10.5px] py-0.5 font-medium">
                    CANCELLATION SCHEDULED
                  </span>
                </div>
                <p className="text-[13px] text-[var(--ink-secondary)]">
                  Your subscription is scheduled to cancel on{' '}
                  <strong className="text-[var(--ink-primary)]">
                    {new Date(billing.scheduledCancellationDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </strong>. 
                  Full disapproval surveillance and instant Slack alerts remain active through the end of your prepaid period.
                </p>
              </div>
            </div>
          )}

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

            {/* Self-Serve Subscription Management & Cancellation Bar */}
            {isPaidActive && !isSuperAdmin && (
              <div className="pt-5 pb-5 border-b border-[var(--hairline)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={loadingPortal}
                    onClick={handleManageSubscription}
                    className="btn-secondary text-[12.5px] py-1.5 px-3.5 !rounded-[3px] inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loadingPortal ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting to Paddle...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Manage Subscription &amp; Payment Methods</span>
                      </>
                    )}
                  </button>
                </div>

                {!billing?.scheduledCancellationDate ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="text-[12px] text-[var(--ghost-text)] hover:text-[var(--danger)] hover:underline underline-offset-4 transition-colors"
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <span className="font-mono text-[11px] text-[var(--ghost-text-dim)]">
                    Cancellation scheduled
                  </span>
                )}
              </div>
            )}

            {/* Account Quotas & Entitlements */}
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
                      {isSuperAdmin
                        ? `${stores.length} of Unlimited`
                        : isAgency
                        ? `${stores.length} of 5`
                        : `${Math.min(stores.length, 1)} of 1`}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--ghost-text)] mt-1">
                    {isSuperAdmin
                      ? 'Unlimited stores enabled for Superadmin.'
                      : isAgency
                      ? 'Up to 5 stores & MCA child accounts enabled.'
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

          {/* 2. Conversion and Upgrade Actions */}
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
                  <PricingCard
                    tier={PRICING_TIERS.solo}
                    action={{
                      type: 'button',
                      onClick: () => handleCheckout('solo'),
                      loading: processingCheckout === 'solo',
                      disabled: processingCheckout !== null,
                      label: PRICING_TIERS.solo.ctaText,
                    }}
                  />

                  <PricingCard
                    tier={PRICING_TIERS.agency}
                    action={{
                      type: 'button',
                      onClick: () => handleCheckout('agency'),
                      loading: processingCheckout === 'agency',
                      disabled: processingCheckout !== null,
                      label: PRICING_TIERS.agency.ctaText,
                    }}
                  />
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
                        <span className="tag-pill tag-signal text-[10.5px]">Recommended for Agencies</span>
                        <span className="font-mono text-[11px] text-[var(--signal)]">Up to 5 Accounts</span>
                      </div>
                      <h4 className="font-serif text-[22px] font-semibold text-[var(--ink-primary)]">
                        Upgrade to Agency Fleet ($49/mo)
                      </h4>
                      <p className="text-[13px] text-[var(--ink-secondary)] leading-[1.55]">
                        Scale to multi-client management: protect up to 5 client Google Merchant Center accounts (MCA supported) with dedicated Slack routing to separate private client channels and centralized multi-store overview.
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
                        You have unlocked up to 5 Google Merchant Center connections and MCA fleet routing. Need custom enterprise volume or dedicated account support? Contact{' '}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--hairline)]">
            <div>
              <h3 className="text-[16px] font-semibold text-[var(--ink-primary)]">
                Connected Google Merchant Center Stores
              </h3>
              <p className="text-[13px] text-[var(--ghost-text)] mt-0.5">
                Review active store connections, revoke OAuth credentials, and manage alert endpoints.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-pill)] border border-[var(--signal-dim)] bg-[var(--signal-wash)]">
              <Layers className="w-3.5 h-3.5 text-[var(--signal)]" />
              <span className="font-mono text-[11.5px] text-[var(--signal)] font-medium">
                GMC Accounts: {stores.length} of {isSuperAdmin ? 'Unlimited' : isAgency ? '5' : '1'}
              </span>
            </div>
          </div>

          {/* Disconnect Feedback */}
          {disconnectSuccess && (
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-center gap-2.5 text-[12.5px] text-[var(--ink-primary)]">
              <Check className="w-4 h-4 text-[var(--signal)] shrink-0" />
              <span>{disconnectSuccess}</span>
            </div>
          )}

          {disconnectError && (
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] flex items-center gap-2.5 text-[12.5px] text-[var(--danger)]">
              <AlertTriangle className="w-4 h-4 text-[var(--danger)] shrink-0" />
              <span>{disconnectError}</span>
            </div>
          )}

          {quotaWarning && (
            <div className="p-3.5 bg-[var(--signal-wash)] border border-[var(--signal-dim)] rounded-[var(--radius-sm)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[12.5px] text-[var(--ink-primary)]">
                <ShieldAlert className="w-4 h-4 text-[var(--signal)] shrink-0" />
                <span>{quotaWarning}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className="btn-primary text-[11.5px] py-1 px-3 !rounded-[3px] shrink-0 self-start sm:self-auto"
              >
                Upgrade to Agency ($49/mo)
              </button>
            </div>
          )}

          {stores.length === 0 ? (
            <div className="p-8 text-center rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]">
              <p className="text-[13px] text-[var(--ghost-text)] mb-4">
                No Google Merchant Center accounts are currently linked.
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/api/auth/merchant/connect';
                }}
                className="btn-primary text-[12.5px] py-2 px-4 !rounded-[3px] inline-flex items-center gap-2"
              >
                <span>Connect Google Merchant Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[13.5px] font-medium text-[var(--ink-primary)]">
                        {s.name}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--ghost-text)] mt-0.5">
                        GMC Account ID: #{s.gmcId}
                      </div>
                    </div>

                    {confirmDisconnectStoreId !== s.id && (
                      <div className="flex items-center gap-2.5">
                        <span className="tag-pill tag-signal text-[10px]">
                          Telemetry Active
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmDisconnectStoreId(s.id)}
                          className="btn-secondary text-[11.5px] py-1 px-2.5 text-[var(--ghost-text)] hover:text-[var(--danger)] hover:border-[var(--danger)] !rounded-[3px] inline-flex items-center gap-1.5 transition-colors"
                          title="Revoke Google OAuth token and disconnect store"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {confirmDisconnectStoreId === s.id && (
                    <div className="mt-3 pt-3 border-t border-[var(--hairline)]">
                      <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] space-y-2.5">
                        <div className="text-[12px] text-[var(--danger)] font-medium leading-snug">
                          Disconnect GMC #{s.gmcId}? This immediately invalidates your granted OAuth tokens on Google servers, halts Pub/Sub alert ingestion, and purges telemetry credentials.
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={disconnectingStoreId === s.id}
                            onClick={() => handleDisconnectStore(s.id)}
                            className="py-1.5 px-3 rounded-[var(--radius-sm)] bg-[var(--danger)] text-[#111214] font-semibold text-[11.5px] hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            {disconnectingStoreId === s.id && <RefreshCw className="w-3 h-3 animate-spin" />}
                            <span>{disconnectingStoreId === s.id ? 'Revoking Access...' : 'Yes, Revoke & Disconnect'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={disconnectingStoreId === s.id}
                            onClick={() => setConfirmDisconnectStoreId(null)}
                            className="btn-secondary text-[11.5px] py-1 px-2.5 !rounded-[3px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (isSuperAdmin) {
                      window.location.href = '/api/auth/merchant/connect';
                      return;
                    }
                    if (isAgency && stores.length >= 5) {
                      setIsFleetModalOpen(true);
                      return;
                    }
                    if (!isAgency && stores.length >= 1) {
                      setQuotaWarning('Solo Plan quota reached: Maximum 1 connected Google Merchant Center store allowed. Upgrade to Agency Fleet to connect up to 5 stores.');
                      setActiveTab('billing');
                      return;
                    }
                    window.location.href = '/api/auth/merchant/connect';
                  }}
                  className="btn-secondary text-[12.5px] py-2 px-4 !rounded-[3px] inline-flex items-center gap-2"
                >
                  <span>+ Connect another Google Merchant Center</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-App Self-Serve Paddle Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-surface)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                if (!cancellingSubscription) {
                  setShowCancelModal(false);
                  setCancelError(null);
                }
              }}
              className="absolute top-4 right-4 text-[var(--ghost-text)] hover:text-[var(--ink-primary)] p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="font-mono text-[10.5px] text-[var(--danger)] uppercase tracking-wider">
                SUBSCRIPTION RETENTION
              </span>
              <h3 className="font-serif text-[20px] font-semibold text-[var(--ink-primary)] mt-1">
                Cancel Automatic Renewal
              </h3>
            </div>

            <p className="text-[13px] text-[var(--ghost-text)] leading-[1.55]">
              Your subscription will remain active and Google Merchant Center disapproval monitoring will continue through{' '}
              <strong className="text-[var(--ink-primary)]">
                {billing?.formattedRenewalOrExpiration || 'the end of your current prepaid billing cycle'}
              </strong>. 
              No further charges will be made.
            </p>

            <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] text-[12px] text-[var(--ink-secondary)]">
              Your client retainers remain protected through the prepaid period. Disapproval surveillance and sub-30s Slack alerts will only be silenced after the expiration date.
            </div>

            {cancelError && (
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-[12px] text-[var(--danger)]">
                {cancelError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={cancellingSubscription}
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelError(null);
                }}
                className="btn-secondary text-[12px] py-1.5 px-3.5 !rounded-[3px] disabled:opacity-50"
              >
                Keep Plan Active
              </button>
              <button
                type="button"
                disabled={cancellingSubscription}
                onClick={handleConfirmCancel}
                className="py-1.5 px-4 rounded-[var(--radius-sm)] bg-[var(--danger)] text-[#111214] font-semibold text-[12px] hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {cancellingSubscription && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{cancellingSubscription ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branded Paddle Checkout Modal */}
      <PaddleCheckoutModal
        isOpen={Boolean(checkoutModalPlan)}
        plan={checkoutModalPlan || 'solo'}
        userEmail={userEmail}
        onClose={() => setCheckoutModalPlan(null)}
      />

      {/* Fleet Limit Concierge Modal */}
      <FleetLimitModal
        isOpen={isFleetModalOpen}
        onClose={() => setIsFleetModalOpen(false)}
        userEmail={userEmail}
        storeCount={stores.length}
      />
    </div>
  );
}
