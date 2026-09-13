'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SectionNetworkCanvas } from './SectionNetworkCanvas';

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

  // Sync with selectedPlan prop
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
      className="relative w-full py-24 px-4 sm:px-6 bg-[#0a0b1dff] border-t border-[#1E293B]/60 overflow-hidden"
    >
      {/* Ambient Sparse Network Mesh */}
      <SectionNetworkCanvas />

      <div id="beta" className="relative z-10 max-w-[860px] mx-auto">
        {/* Section Header */}
        <div className="max-w-[760px] mb-12">
          <span className="text-[0.85rem] font-semibold text-[#10B981] block mb-2">
            Limited Pilot Cohort
          </span>
          <h2 className="text-[1.85rem] sm:text-[2.4rem] font-bold text-[#FDF4D2] leading-[1.18] tracking-[-0.01em]">
            Secure Early Pilot Access & Receive a Free Feed Audit
          </h2>
          <p className="mt-3 text-[1rem] text-[#94A3B8] leading-relaxed">
            Onboarding a select cohort of 10 PPC agencies and 25 high-volume Shopify merchants for zero-downtime feed monitoring.
          </p>
        </div>

        {!isSubmitted ? (
          <div className="rounded-[6px] bg-[#0F1522] border border-[#1E293B] overflow-hidden shadow-none">
            <div className="p-7 sm:p-10">
              {/* Short Risk-Reversal Line */}
              <div className="mb-6 p-3 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B] flex items-center gap-2.5 text-[0.8125rem] text-[#10B981] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" strokeWidth={2} />
                <span>No credit card required. If it is not a fit yet, we will tell you honestly on the call.</span>
              </div>

              {/* Application Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Type Segmented Control (Explicitly pre-selected) */}
              <div>
                <label className="block text-[0.8125rem] font-semibold text-[#FDF4D2] mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('merchant')}
                    className={`py-2 px-3 rounded-[3px] text-[0.8125rem] font-bold transition-colors duration-150 ${
                      accountType === 'merchant'
                        ? 'bg-[#141C2B] text-[#FDF4D2] border border-[#334155]'
                        : 'text-[#94A3B8] hover:text-[#FDF4D2]'
                    }`}
                  >
                    Shopify Merchant ($19/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('agency')}
                    className={`py-2 px-3 rounded-[3px] text-[0.8125rem] font-bold transition-colors duration-150 ${
                      accountType === 'agency'
                        ? 'bg-[#FF788D] text-[#0a0b1dff]'
                        : 'text-[#94A3B8] hover:text-[#FDF4D2]'
                    }`}
                  >
                    PPC Agency ($99/mo)
                  </button>
                </div>
              </div>

              {/* Work Email Address */}
              <div>
                <label htmlFor="email" className="block text-[0.8125rem] font-semibold text-[#FDF4D2] mb-1.5">
                  Work Email Address <span className="text-[#FF788D]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="alex@brandname.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B] text-[#FDF4D2] placeholder-[#64748B] text-[0.9rem] outline-none focus:border-[#FF788D] transition-colors"
                />
              </div>

              {/* Primary Shopify Store URL or Agency Website */}
              <div>
                <label htmlFor="website" className="block text-[0.8125rem] font-semibold text-[#FDF4D2] mb-1.5">
                  {accountType === 'agency' ? 'Agency Website / Domain' : 'Primary Shopify Store URL'}{' '}
                  <span className="text-[#FF788D]">*</span>
                </label>
                <input
                  id="website"
                  type="text"
                  required
                  placeholder={accountType === 'agency' ? 'performanceagency.com' : 'store.myshopify.com'}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B] text-[#FDF4D2] placeholder-[#64748B] text-[0.9rem] outline-none focus:border-[#FF788D] transition-colors"
                />
              </div>

              {/* Catalog Size / Accounts */}
              <div>
                <label htmlFor="catalogSize" className="block text-[0.8125rem] font-semibold text-[#FDF4D2] mb-1.5">
                  {accountType === 'agency' ? 'Client Accounts Managed' : 'Approximate Catalog SKU Count'}
                </label>
                <select
                  id="catalogSize"
                  value={catalogSize}
                  onChange={(e) => setCatalogSize(e.target.value)}
                  className="w-full px-4 py-3 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B] text-[#FDF4D2] text-[0.9rem] outline-none focus:border-[#FF788D] transition-colors"
                >
                  <option value="< 500 SKUs">&lt; 500 SKUs</option>
                  <option value="500 - 5,000 SKUs">500 - 5,000 SKUs</option>
                  <option value="5,000+ SKUs">5,000+ SKUs</option>
                  <option value="Managing 5+ Client Accounts">Managing 5+ Client Accounts</option>
                </select>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-3 rounded-[4px] bg-[#FF788D]/10 border border-[#FF788D]/30 flex items-center gap-2 text-[#FF788D] text-[0.8125rem]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-[4px] bg-[#FF788D] hover:bg-[#FF8FA2] disabled:opacity-60 text-[#0a0b1dff] font-bold text-[0.95rem] transition-all duration-180 flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Application...</span>
                  </>
                ) : (
                  <>
                    <span>Apply for Pilot Access & Claim Free Audit</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </>
                )}
              </button>

              <p className="text-[0.75rem] text-[#94A3B8] text-center mt-3">
                Zero spam policy. We only review real merchant and agency catalogs.
              </p>
            </form>
            </div>
          </div>
        ) : (
          /* Confirmation State with Immediate 15-Minute Audit Booking Link */
          <div className="rounded-[6px] bg-[#0F1522] border border-[#10B981]/50 p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto mb-4 border border-[#10B981]/30">
              <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
            </div>

            <span className="text-[0.75rem] font-semibold text-[#10B981] block mb-1">
              Application Confirmed
            </span>

            <h3 className="text-[1.65rem] sm:text-[1.95rem] font-bold text-[#FDF4D2] leading-tight">
              Select Your 15-Minute Onboarding & Live Feed Audit
            </h3>

            <p className="mt-3 text-[0.925rem] text-[#94A3B8] max-w-[500px] mx-auto leading-relaxed">
              We have reserved your pilot slot for <span className="text-[#FDF4D2] font-semibold">{email}</span>. Book your live diagnostic session below to connect your Pub/Sub topic and review disapproved SKUs.
            </p>

            {/* Direct Booking Action (Cal.com / Scheduling) */}
            <div className="mt-7">
              <a
                href="https://cal.com/kultra/15min-audit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[4px] bg-[#10B981] hover:bg-[#059669] text-[#0a0b1dff] font-bold text-[0.95rem] transition-all duration-180 hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" strokeWidth={2.5} />
                <span>Open 15-Minute Audit Calendar (Cal.com)</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </a>
            </div>

            {/* Call Outline */}
            <div className="mt-8 pt-6 border-t border-[#1E293B] text-left max-w-[480px] mx-auto">
              <span className="text-[0.75rem] font-semibold text-[#94A3B8] block mb-2.5">
                What happens on the call:
              </span>
              <ul className="space-y-2 text-[0.8125rem] text-[#94A3B8]">
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">1.</span>
                  <span>Direct Cloud Pub/Sub topic connection to Google Merchant Center.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">2.</span>
                  <span>Instant feed scan to identify currently rejected high-ROAS SKUs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">3.</span>
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
