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
      ? `Hello Kultra Sentinel Concierge Team,\n\n` +
        `I have reached the 1-store quota on my Solo plan and would like to expand multi-store monitoring.\n\n` +
        `Account Email: ${userEmail || 'N/A'}\n` +
        `Current Store Count: ${storeCount}\n\n` +
        `Please assist with upgrading to Agency Fleet or custom fleet provisioning.\n\n` +
        `Best regards,\n` +
        `${userEmail || 'Store Owner'}`
      : `Hello Kultra Sentinel Concierge Team,\n\n` +
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
      <div className="relative w-full max-w-lg bg-[#0e0f11] border border-[#f2a93b]/30 rounded p-6 sm:p-8 shadow-2xl text-[#f4f1ea] my-auto">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-[#6b7078] hover:text-[#f4f1ea] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded bg-[#f2a93b]/10 border border-[#f2a93b]/30 flex items-center justify-center text-[#f2a93b]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="font-mono text-[11px] tracking-[0.02em] uppercase px-2 py-0.5 rounded-full border border-[#f2a93b]/40 text-[#f2a93b] bg-[#f2a93b]/5">
            {isSolo ? 'Store Quota Interceptor' : 'Fleet Capacity Interceptor'}
          </span>
        </div>

        <h2
          id="fleet-limit-title"
          className="font-serif text-2xl font-semibold text-[#f4f1ea] leading-snug mb-3"
        >
          {isSolo
            ? `Store Limit Reached (${storeCount} of 1 Store Active)`
            : (storeCount >= 5 && maxStores === 5)
            ? 'Fleet Limit Reached (5 of 5 Stores Active)'
            : `Fleet Limit Reached (${storeCount} of ${maxStores} Stores Active)`}
        </h2>

        <p className="font-sans text-[14.5px] leading-[1.55] text-[#b9b3a5] mb-6">
          {isSolo
            ? 'Your Solo plan covers 1 monitored store. To protect multiple storefronts, upgrade to the Agency Fleet tier (up to 5 stores) or contact concierge for dedicated multi-client provisioning.'
            : 'Your Agency Fleet tier covers up to 5 monitored stores. Need to protect a larger agency portfolio or multi-client MCA? We provide custom fleet provisioning, dedicated Slack routing, and priority Pub/Sub pipelines.'}
        </p>

        <div className="p-3 bg-[#131418] border border-white/5 rounded mb-6 flex items-center gap-3">
          <Layers className="w-4 h-4 text-[#f2a93b] shrink-0" />
          <div className="font-mono text-xs text-[#b9b3a5]">
            Account: <span className="text-[#f4f1ea] font-medium">{userEmail || 'Active Tenant'}</span>
            <span className="mx-2 text-[#45484f]">|</span>
            Active Stores: <span className="text-[#f2a93b] font-medium">{storeCount} of {isSolo ? 1 : maxStores}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isSolo && onUpgradeToAgency ? (
            <button
              type="button"
              onClick={onUpgradeToAgency}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#f2a93b] text-[#1a1305] font-semibold text-[13px] px-4 py-2.5 rounded hover:bg-[#f6b855] active:bg-[#d9932a] active:scale-[0.98] transition-all text-center cursor-pointer"
            >
              <span>Upgrade to Agency Fleet (5 Stores)</span>
            </button>
          ) : (
            <a
              href={mailtoUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#f2a93b] text-[#1a1305] font-semibold text-[13px] px-4 py-2.5 rounded hover:bg-[#f6b855] active:bg-[#d9932a] active:scale-[0.98] transition-all text-center"
            >
              <Mail className="w-4 h-4" />
              <span>{isSolo ? 'Contact Concierge' : 'Request Fleet Expansion'}</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center bg-transparent border border-white/15 text-[#b9b3a5] font-semibold text-[13px] px-4 py-2.5 rounded hover:border-[#7a5a26] hover:text-[#f4f1ea] transition-all text-center"
          >
            Manage Existing Stores
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
