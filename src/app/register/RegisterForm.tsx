'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Building, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { startRouteTransition } from '@/components/RouteProgressBar';

export default function RegisterForm() {
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

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      setError(decodeURIComponent(err));
    }
  }, [searchParams]);

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
      startRouteTransition();
      window.location.href = '/api/auth/google?prompt=select_account&from=/register';
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

      startRouteTransition();
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

        {/* Google 1-Click Social Registration */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={loading || googleLoading}
          className="btn-secondary w-full justify-center !rounded-[3px] text-[13px] py-2.5 gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#b9b3a5]" />
          ) : (
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
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-[rgba(255,255,255,0.08)]" />
          <span className="absolute bg-[#0e0f11] px-2 text-[11px] font-mono text-[#45484f]">
            or register with email
          </span>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Account Type Selector */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('merchant')}
                className={`py-2 px-3 rounded-[3px] text-[12.5px] font-medium border text-center transition-colors ${
                  accountType === 'merchant'
                    ? 'border-[#f2a93b] bg-[rgba(242,169,59,0.06)] text-[#f2a93b]'
                    : 'border-[rgba(255,255,255,0.14)] bg-[#0a0b0d] text-[#b9b3a5] hover:text-[#f4f1ea]'
                }`}
              >
                Solo Merchant
              </button>
              <button
                type="button"
                onClick={() => setAccountType('agency')}
                className={`py-2 px-3 rounded-[3px] text-[12.5px] font-medium border text-center transition-colors ${
                  accountType === 'agency'
                    ? 'border-[#f2a93b] bg-[rgba(242,169,59,0.06)] text-[#f2a93b]'
                    : 'border-[rgba(255,255,255,0.14)] bg-[#0a0b0d] text-[#b9b3a5] hover:text-[#f4f1ea]'
                }`}
              >
                PPC Agency
              </button>
            </div>
          </div>

          {/* Company / Store Name */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1.5">
              {accountType === 'agency' ? 'Agency name' : 'Store name'}
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={accountType === 'agency' ? 'Apex PPC Partners' : 'Nordic Outfitters'}
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1.5">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="store.com"
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1.5">
              Work email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouchedEmail(true)}
                placeholder="name@company.com"
                className={`w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:outline-none focus:ring-1 transition-colors ${
                  touchedEmail && !isEmailValid
                    ? 'border-[#d64545] focus:border-[#d64545] focus:ring-[#d64545]'
                    : 'border-[rgba(255,255,255,0.14)] focus:border-[#f2a93b] focus:ring-[#f2a93b]'
                }`}
              />
            </div>
            {touchedEmail && !isEmailValid && (
              <p className="text-[11.5px] text-[#d64545] mt-1 font-mono">
                Please enter a valid email address.
              </p>
            )}
          </div>

          {/* Institutional Password Input */}
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouchedPassword(true)}
                placeholder="Institutional password"
                className={`w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:outline-none focus:ring-1 transition-colors ${
                  touchedPassword && !isPasswordValid
                    ? 'border-[#d64545] focus:border-[#d64545] focus:ring-[#d64545]'
                    : 'border-[rgba(255,255,255,0.14)] focus:border-[#f2a93b] focus:ring-[#f2a93b]'
                }`}
              />
            </div>

            {/* Real-Time Password Complexity Checklist */}
            <div className="mt-2.5 p-3 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.08)] space-y-1.5 font-mono text-[11px]">
              <div className="text-[10px] text-[#6b7078] uppercase tracking-wider mb-1">
                Password Requirements
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1.5 ${isMinLength ? 'text-[#f2a93b]' : 'text-[#6b7078]'}`}>
                  <Check className={`w-3 h-3 ${isMinLength ? 'text-[#f2a93b]' : 'text-[#45484f]'}`} />
                  <span>10+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-[#f2a93b]' : 'text-[#6b7078]'}`}>
                  <Check className={`w-3 h-3 ${hasUpper ? 'text-[#f2a93b]' : 'text-[#45484f]'}`} />
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-[#f2a93b]' : 'text-[#6b7078]'}`}>
                  <Check className={`w-3 h-3 ${hasLower ? 'text-[#f2a93b]' : 'text-[#45484f]'}`} />
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-[#f2a93b]' : 'text-[#6b7078]'}`}>
                  <Check className={`w-3 h-3 ${hasNumber ? 'text-[#f2a93b]' : 'text-[#45484f]'}`} />
                  <span>Number (0-9)</span>
                </div>
                <div className={`col-span-2 flex items-center gap-1.5 ${hasSymbol ? 'text-[#f2a93b]' : 'text-[#6b7078]'}`}>
                  <Check className={`w-3 h-3 ${hasSymbol ? 'text-[#f2a93b]' : 'text-[#45484f]'}`} />
                  <span>Special symbol (!@#$%^&amp;*...)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded-[2px] border-[rgba(255,255,255,0.14)] bg-[#0a0b0d] text-[#f2a93b] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-[12px] text-[#b9b3a5] leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-[#f4f1ea] hover:underline underline-offset-2">
                  Terms of Service
                </Link>{' '}
                and acknowledge the{' '}
                <Link href="/privacy" target="_blank" className="text-[#f4f1ea] hover:underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading || !agreedToTerms || !isPasswordValid || !isEmailValid}
            className="w-full mt-2 py-2.5 px-4 rounded-[3px] bg-[#f2a93b] hover:bg-[#f6b855] text-[#1a1305] text-[12.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Start 14-day free trial</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer Login Prompt */}
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
