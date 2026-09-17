'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Building, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [accountType, setAccountType] = useState<'merchant' | 'agency'>(
    planParam === 'agency' ? 'agency' : 'merchant'
  );
  const [website, setWebsite] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isMinLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = isMinLength && hasUpper && hasLower && hasNumber && hasSymbol;

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      // Direct navigation to server route which generates cryptographically secure state & CSRF cookie
      window.location.href = '/api/auth/google?prompt=select_account';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google registration failed.');
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and acknowledge the Privacy Policy to proceed.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 10 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          companyName: companyName.trim(),
          accountType,
          website: website.trim(),
          agreedToTerms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please verify your details.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }

      router.push(data.redirectUrl || '/dashboard?just_connected=true');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px]">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-4 outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] rounded-[3px]">
          <Image
            src="/assets/logos/kultra-logo-horizontal.svg"
            alt="Kultra"
            width={150}
            height={42}
            className="h-[34px] sm:h-[36px] w-auto mx-auto object-contain brightness-110"
            priority
          />
        </Link>
        <h1 className="text-[26px] font-semibold text-[#f4f1ea] tracking-tight font-display">
          Start your free 14-day trial
        </h1>
        <p className="text-[13px] text-[#b9b3a5] mt-1">
          Sub-30-second disapproval detection for Google Shopping.
        </p>
      </div>

      {/* Register Card */}
      <div className="rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] p-6 sm:p-7">
        {error && (
          <div className="mb-4 p-3 rounded-[3px] bg-[rgba(214,69,69,0.08)] border border-[#d64545] text-[#d64545] text-[12.5px] leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google 1-Click Social Registration (§1 UI Layout Updates) */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-[3px] bg-white hover:bg-[#f8f9fa] active:bg-[#f1f3f4] text-[#1f1f1f] text-[13px] font-semibold transition-colors border border-[#dadce0] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {googleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#1f1f1f]" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.2-6.8-5.2L1.5 16c1.9 3.8 5.8 6.4 10.5 6.4z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Subtle Horizontal Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-[rgba(255,255,255,0.08)]" />
          <span className="absolute bg-[#0e0f11] px-2.5 text-[11px] font-mono text-[#45484f]">
            or register with email
          </span>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Store or Agency Name */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1">
              Store or agency name <span className="text-[#f2a93b]">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Apparel"
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
          </div>

          {/* Work Email with Real-time Validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12.5px] font-semibold text-[#6b7078]">
                Work email <span className="text-[#f2a93b]">*</span>
              </label>
              {touchedEmail && isEmailValid && (
                <span className="font-mono text-[10.5px] text-[#f2a93b] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Valid format
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="email"
                required
                value={email}
                onBlur={() => setTouchedEmail(true)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!touchedEmail) setTouchedEmail(true);
                }}
                placeholder="founder@acme.com"
                className={`w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:outline-none focus:ring-1 transition-colors ${
                  touchedEmail && !isEmailValid && email.length > 0
                    ? 'border-[#d64545] focus:border-[#d64545] focus:ring-[#d64545]'
                    : 'border-[rgba(255,255,255,0.14)] focus:border-[#f2a93b] focus:ring-[#f2a93b]'
                }`}
              />
            </div>
            {touchedEmail && !isEmailValid && email.length > 0 && (
              <p className="text-[11px] text-[#d64545] mt-1">
                Please enter a valid work email address.
              </p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1">
              Store or agency website <span className="font-mono text-[10.5px] text-[#45484f]">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="acme.com"
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
          </div>

          {/* Account Type Selector */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1">
              Account plan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('merchant')}
                className={`py-2 px-3 rounded-[3px] border text-[12px] font-semibold transition-colors ${
                  accountType === 'merchant'
                    ? 'border-[#7a5a26] bg-[rgba(242,169,59,0.06)] text-[#f2a93b]'
                    : 'border-[rgba(255,255,255,0.14)] text-[#6b7078] hover:text-[#b9b3a5]'
                }`}
              >
                Solo Merchant ($19/mo)
              </button>
              <button
                type="button"
                onClick={() => setAccountType('agency')}
                className={`py-2 px-3 rounded-[3px] border text-[12px] font-semibold transition-colors ${
                  accountType === 'agency'
                    ? 'border-[#7a5a26] bg-[rgba(242,169,59,0.06)] text-[#f2a93b]'
                    : 'border-[rgba(255,255,255,0.14)] text-[#6b7078] hover:text-[#b9b3a5]'
                }`}
              >
                PPC Agency ($99/mo)
              </button>
            </div>
          </div>

          {/* Password with Inline Requirement Indicator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12.5px] font-semibold text-[#6b7078]">
                Password <span className="text-[#f2a93b]">*</span>
              </label>
              <span
                className={`font-mono text-[10.5px] ${
                  isPasswordValid
                    ? 'text-[#f2a93b]'
                    : touchedPassword
                    ? 'text-[#6b7078]'
                    : 'text-[#45484f]'
                }`}
              >
                {isPasswordValid ? '✓ Entropy criteria met' : 'Min 10 chars (A-Z, a-z, 0-9, symbol)'}
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="password"
                required
                minLength={10}
                value={password}
                onBlur={() => setTouchedPassword(true)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!touchedPassword) setTouchedPassword(true);
                }}
                placeholder="Choose a strong password"
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
            {touchedPassword && !isPasswordValid && (
              <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10.5px] font-mono">
                <span className={isMinLength ? 'text-[#f2a93b]' : 'text-[#6b7078]'}>
                  {isMinLength ? '✓' : '○'} 10+ characters
                </span>
                <span className={hasUpper ? 'text-[#f2a93b]' : 'text-[#6b7078]'}>
                  {hasUpper ? '✓' : '○'} 1 uppercase (A-Z)
                </span>
                <span className={hasLower ? 'text-[#f2a93b]' : 'text-[#6b7078]'}>
                  {hasLower ? '✓' : '○'} 1 lowercase (a-z)
                </span>
                <span className={hasNumber && hasSymbol ? 'text-[#f2a93b]' : 'text-[#6b7078]'}>
                  {hasNumber && hasSymbol ? '✓' : '○'} Number & symbol
                </span>
              </div>
            )}
          </div>

          {/* MANDATORY LEGAL CONSENT CHECKBOX (§1 Form Compliance) */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none group">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-[2px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.2)] text-[#f2a93b] focus:ring-0 focus:ring-offset-0 accent-[#f2a93b] cursor-pointer"
              />
              <span className="text-[12px] text-[#b9b3a5] leading-[1.5]">
                I agree to the{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f4f1ea] underline underline-offset-2 hover:text-[#f2a93b] transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and acknowledge the{' '}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f4f1ea] underline underline-offset-2 hover:text-[#f2a93b] transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {!agreedToTerms && (
              <p className="text-[11px] font-mono text-[#6b7078] mt-1.5 pl-6">
                Required for workspace provisioning and API telemetry access.
              </p>
            )}
          </div>

          {/* Hard-Disabled Submit Button with Accessible Dynamic Loading State */}
          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="w-full !mt-5 py-2.5 px-4 rounded-[3px] bg-[#f2a93b] hover:bg-[#f6b855] text-[#1a1305] text-[12.5px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating workspace...</span>
              </>
            ) : (
              <span>Start my free trial</span>
            )}
          </button>
        </form>

        {/* Universal Legal Disclaimer (§1 Form Compliance - Both Registration Methods) */}
        <p className="mt-4 text-center text-[11.5px] text-[#6b7078] leading-relaxed">
          By continuing with Google or registering with email, you agree to Kultra&apos;s{' '}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#b9b3a5] underline underline-offset-2 hover:text-[#f2a93b] transition-colors"
          >
            Terms of Service
          </Link>{' '}
          and acknowledge the{' '}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#b9b3a5] underline underline-offset-2 hover:text-[#f2a93b] transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Footer Login Link */}
      <div className="text-center mt-5 text-[13px] text-[#6b7078]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[#b9b3a5] hover:text-[#f4f1ea] underline underline-offset-4 transition-colors font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#0a0b0d] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-[#6b7078] text-[13px] font-mono">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
