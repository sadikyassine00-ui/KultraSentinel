'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, Mail, Layers, X } from 'lucide-react';

interface FleetLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  storeCount?: number;
  maxStores?: number;
  onUpgradeToAgency?: () => void;
}

export function FleetLimitModal({
  isOpen,
  onClose,
  userEmail = '',
  storeCount = 1,
  maxStores = 1,
  onUpgradeToAgency,
}: FleetLimitModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const isSolo = maxStores <= 1;

  const mailtoSubject = encodeURIComponent(
    isSolo ? 'Solo Store Quota Expansion Request' : 'Custom Agency Fleet Request'
  );
  const mailtoBody = encodeURIComponent(
    isSolo
      ? `Hello Kultra Concierge Team,\n\n` +
        `I have reached the 1-store quota on my Solo plan and would like to expand multi-store monitoring.\n\n` +
        `Account Email: ${userEmail || 'N/A'}\n` +
        `Current Store Count: ${storeCount}\n\n` +
        `Please assist with upgrading to Agency Fleet or custom fleet provisioning.\n\n` +
        `Best regards,\n` +
        `${userEmail || 'Store Owner'}`
      : `Hello Kultra Concierge Team,\n\n` +
        `I have reached the 5-store fleet quota on my Agency Fleet plan and require expanded multi-store volume.\n\n` +
        `Account Email: ${userEmail || 'N/A'}\n` +
        `Currently Monitored Stores: ${storeCount}\n` +
        `Estimated Stores Needed: [Enter required store count]\n\n` +
        `Please assist with custom fleet provisioning, dedicated Slack routing, and priority Pub/Sub pipelines.\n\n` +
        `Best regards,\n` +
        `${userEmail || 'Agency Administrator'}`
  );
  const mailtoUrl = `mailto:support@usekultra.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fleet-limit-title"
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 min-h-[100dvh] w-screen z-[99999] bg-[#0a0b0d]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg max-w-[calc(100vw-24px)] bg-[var(--bg-surface)] border border-[var(--signal-dim)] rounded-[var(--radius-md)] p-5 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-[var(--ink-primary)] my-auto box-border">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-[var(--ghost-text)] hover:text-[var(--ink-primary)] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-center justify-center text-[var(--signal)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="tag-pill tag-signal text-[10.5px]">
            {isSolo ? 'Store Quota Interceptor' : 'Fleet Capacity Interceptor'}
          </span>
        </div>

        <h2
          id="fleet-limit-title"
          className="font-display text-2xl font-semibold text-[var(--ink-primary)] leading-snug mb-3"
        >
          {isSolo
            ? `Store Limit Reached (${storeCount} of 1 Store Active)`
            : (storeCount >= 5 && maxStores === 5)
            ? 'Fleet Limit Reached (5 of 5 Stores Active)'
            : `Fleet Limit Reached (${storeCount} of ${maxStores} Stores Active)`}
        </h2>

        <p className="font-sans text-[14.5px] leading-[1.55] text-[var(--ink-secondary)] mb-6">
          {isSolo
            ? 'Your Solo plan covers 1 monitored store. Upgrade to Agency Fleet ($49/mo) to protect up to 5 client GMC accounts (MCA supported) with dedicated Slack routing to separate private client channels.'
            : 'Your Agency Fleet tier covers up to 5 monitored stores. Need to protect a larger agency portfolio or multi-client MCA? We provide custom fleet provisioning, dedicated Slack routing, and priority Pub/Sub pipelines.'}
        </p>

        <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--hairline)] rounded-[var(--radius-sm)] mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
          <Layers className="w-4 h-4 text-[var(--signal)] shrink-0" />
          <div className="font-mono text-xs text-[var(--ink-secondary)] truncate">
            Account: <span className="text-[var(--ink-primary)] font-medium">{userEmail || 'Active Tenant'}</span>
            <span className="mx-2 text-[var(--ghost-text-dim)]">|</span>
            Active Stores: <span className="text-[var(--signal)] font-medium">{storeCount} of {isSolo ? 1 : maxStores}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isSolo && onUpgradeToAgency ? (
            <button
              type="button"
              onClick={onUpgradeToAgency}
              className="flex-1 btn-primary py-2.5 !rounded-[var(--radius-sm)] text-[13px] font-semibold inline-flex items-center justify-center text-center cursor-pointer"
            >
              <span>Upgrade to Agency Fleet ($49/mo)</span>
            </button>
          ) : (
            <a
              href={mailtoUrl}
              className="flex-1 btn-primary py-2.5 !rounded-[var(--radius-sm)] text-[13px] font-semibold inline-flex items-center justify-center gap-2 text-center"
            >
              <Mail className="w-4 h-4" />
              <span>{isSolo ? 'Contact Concierge' : 'Request Fleet Expansion'}</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2.5 !rounded-[var(--radius-sm)] text-[13px] font-semibold inline-flex items-center justify-center text-center"
          >
            Manage Existing Stores
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
