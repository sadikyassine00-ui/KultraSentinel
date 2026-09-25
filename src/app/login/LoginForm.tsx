'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { sanitizeRedirectUrl } from '@/lib/security';
import { startRouteTransition } from '@/components/RouteProgressBar';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectParam = searchParams.get('callbackUrl') || searchParams.get('redirect');

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      setError(decodeURIComponent(err));
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, redirect: redirectParam }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }

      const safeDestination = data.isSuspended
        ? '/suspended'
        : sanitizeRedirectUrl(data.redirectUrl || redirectParam, '/dashboard');

      startRouteTransition();
      window.location.href = safeDestination;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      startRouteTransition();
      window.location.href = '/api/auth/google?prompt=select_account&from=/login';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-4">
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
          Sign in to your catalog
        </h1>
        <p className="text-[13px] text-[#6b7078] mt-1">
          Monitor your Merchant Center disapprovals 24/7.
        </p>
      </div>

      {/* Card Container */}
      <div className="rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] p-6 sm:p-7">
        {error && (
          <div className="mb-4 p-3 rounded-[3px] bg-[rgba(214,69,69,0.08)] border border-[#d64545] text-[#d64545] text-[12.5px] leading-relaxed">
            {error}
          </div>
        )}

        {/* Google 1-Click Social Sign-In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-secondary w-full justify-center !rounded-[3px] text-[13px] py-2.5 gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
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
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-[rgba(255,255,255,0.08)]" />
          <span className="absolute bg-[#0e0f11] px-2 text-[11px] font-mono text-[#45484f]">
            or sign in with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12.5px] font-semibold text-[#6b7078]">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-[3px] bg-[#f2a93b] hover:bg-[#f6b855] text-[#1a1305] text-[12.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer Register Prompt */}
      <div className="text-center mt-5 text-[13px] text-[#6b7078]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-[#b9b3a5] hover:text-[#f4f1ea] underline underline-offset-4 transition-colors font-medium"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
