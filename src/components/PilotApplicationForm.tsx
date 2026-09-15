'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PilotApplicationFormProps {
  selectedPlan: 'merchant' | 'agency';
  onPlanChange: (plan: 'merchant' | 'agency') => void;
}

export function PilotApplicationForm({ selectedPlan, onPlanChange }: PilotApplicationFormProps) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [catalogSize, setCatalogSize] = useState('500 - 5,000 SKUs');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [accountType, setAccountType] = useState<'merchant' | 'agency'>(selectedPlan);

  useEffect(() => {
    setAccountType(selectedPlan);
  }, [selectedPlan]);

  const handleAccountTypeChange = (type: 'merchant' | 'agency') => {
    setAccountType(type);
    onPlanChange(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          accountType,
          website,
          catalogSize,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="pilot-application"
      className="relative w-full py-20 sm:py-24 px-4 sm:px-6 bg-[var(--bg-canvas)] border-t border-[var(--hairline)]"
    >
      <div id="beta" className="relative z-10 max-w-[800px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <span className="font-mono text-[11px] text-[var(--ghost-text-dim)] tracking-[0.02em] block mb-2">
            Early pilot
          </span>
          <h2 className="font-display text-[1.85rem] sm:text-[2.25rem] font-semibold text-[var(--ink-primary)] leading-[1.2]">
            Secure pilot access and receive a feed audit
          </h2>
          <p className="mt-3 text-[14.5px] text-[var(--ink-secondary)] leading-[1.55]">
            Onboarding a select cohort of 10 boutique PPC agencies and 25 Shopify merchants for continuous feed monitoring.
          </p>
        </div>

        {!isSubmitted ? (
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 sm:p-9">
            {/* Short Risk-Reversal Line */}
            <div className="mb-6 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-surface-2)] border border-[var(--hairline)] flex items-center gap-2.5 text-[12.5px] text-[var(--ink-secondary)]">
              <ShieldCheck className="w-4 h-4 text-[var(--signal)] shrink-0" strokeWidth={1.5} />
              <span>No credit card required. Direct diagnostic onboarding with the core team.</span>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Segmented Control */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[var(--ghost-text)] mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--hairline-strong)]">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('merchant')}
                    className={`py-2 px-3 rounded-[var(--radius-sm)] text-[12.5px] font-semibold transition-colors duration-120 ${
                      accountType === 'merchant'
                        ? 'bg-[var(--signal)] text-[#1a1305]'
                        : 'text-[var(--ghost-text)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    Shopify Merchant ($19/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('agency')}
                    className={`py-2 px-3 rounded-[var(--radius-sm)] text-[12.5px] font-semibold transition-colors duration-120 ${
                      accountType === 'agency'
                        ? 'bg-[var(--signal)] text-[#1a1305]'
                        : 'text-[var(--ghost-text)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    PPC Agency ($99/mo)
                  </button>
                </div>
              </div>

              {/* Work Email Address */}
              <div>
                <label htmlFor="email" className="block text-[12.5px] font-semibold text-[var(--ghost-text)] mb-1.5">
                  Work Email Address <span className="text-[var(--signal)]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="alex@brandname.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                />
              </div>

              {/* Primary Shopify Store URL or Agency Website */}
              <div>
                <label htmlFor="website" className="block text-[12.5px] font-semibold text-[var(--ghost-text)] mb-1.5">
                  {accountType === 'agency' ? 'Agency Website Domain' : 'Primary Shopify Store URL'}{' '}
                  <span className="text-[var(--signal)]">*</span>
                </label>
                <input
                  id="website"
                  type="text"
                  required
                  placeholder={accountType === 'agency' ? 'agencydomain.com' : 'store.myshopify.com'}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input w-full"
                />
              </div>

              {/* Catalog Size / Accounts */}
              <div>
                <label htmlFor="catalogSize" className="block text-[12.5px] font-semibold text-[var(--ghost-text)] mb-1.5">
                  {accountType === 'agency' ? 'Client Accounts Managed' : 'Approximate SKU Count'}
                </label>
                <select
                  id="catalogSize"
                  value={catalogSize}
                  onChange={(e) => setCatalogSize(e.target.value)}
                  className="input w-full bg-[var(--bg-canvas)]"
                >
                  <option value="< 500 SKUs">&lt; 500 SKUs</option>
                  <option value="500 - 5,000 SKUs">500 - 5,000 SKUs</option>
                  <option value="5,000+ SKUs">5,000+ SKUs</option>
                  <option value="Managing 5+ Client Accounts">Managing 5+ Client Accounts</option>
                </select>
              </div>

              {/* Error Message if any (§11) */}
              {errorMessage && (
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] flex items-center gap-2 text-[var(--danger)] text-[13px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center text-[13.5px] py-3.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing application...</span>
                    </>
                  ) : (
                    <span>Submit pilot application</span>
                  )}
                </button>
              </div>

              <p className="text-[12px] text-[var(--ghost-text-dim)] text-center mt-2">
                Zero spam policy. We only review real merchant and agency catalogs.
              </p>
            </form>
          </div>
        ) : (
          /* Confirmation State with Direct Cal.com Link */
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--signal-dim)] p-8 sm:p-10 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--signal-wash)] text-[var(--signal)] flex items-center justify-center mx-auto mb-4 border border-[var(--signal-dim)]">
              <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            </div>

            <span className="font-mono text-[11px] text-[var(--signal)] block mb-1">
              Application confirmed
            </span>

            <h3 className="font-display text-[1.5rem] sm:text-[1.8rem] font-semibold text-[var(--ink-primary)] leading-tight">
              Select your 15-minute onboarding and live audit
            </h3>

            <p className="mt-3 text-[14px] text-[var(--ink-secondary)] max-w-[500px] mx-auto leading-[1.55]">
              We reserved your pilot slot for <span className="text-[var(--ink-primary)] font-medium">{email}</span>. Book your live diagnostic session below to connect your Pub/Sub topic and review disapproved SKUs.
            </p>

            <div className="mt-6">
              <a
                href="https://cal.com/kultra/15min-audit"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-[13.5px] py-3 px-6 inline-flex"
              >
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <span>Open calendar (Cal.com)</span>
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--hairline)] text-left max-w-[460px] mx-auto">
              <span className="text-[12px] font-semibold text-[var(--ghost-text)] block mb-2">
                What happens on the call:
              </span>
              <ul className="space-y-2 text-[13px] text-[var(--ink-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[var(--signal)] font-medium">1.</span>
                  <span>Direct Cloud Pub/Sub topic connection to Google Merchant Center.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[var(--signal)] font-medium">2.</span>
                  <span>Instant feed scan to identify currently rejected high-ROAS SKUs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-[var(--signal)] font-medium">3.</span>
                  <span>Configuration of dedicated Slack alert triage channels for your team.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
