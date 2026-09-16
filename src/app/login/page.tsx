'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { sanitizeRedirectUrl } from '@/lib/security';

function LoginForm() {
  const router = useRouter();
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

      const safeDestination = sanitizeRedirectUrl(data.redirectUrl || redirectParam, '/dashboard');
      router.push(safeDestination);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials provided.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (googleClientId) {
        const redirectUri = `${window.location.origin}/api/auth/google/callback`;
        const scope = encodeURIComponent('openid email profile');
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
        window.location.href = googleAuthUrl;
        return;
      }

      // Quick fallback for test/dev mode
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoEmail: 'demo-merchant@example.com',
          demoName: 'Merchant',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google sign-in failed.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
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

        {/* Google OAuth Trigger */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-[3px] border border-[rgba(255,255,255,0.14)] text-[12.5px] font-semibold text-[#f4f1ea] hover:border-[#7a5a26] hover:bg-[#131418] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b] disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            className="w-full mt-2 py-2.5 px-4 rounded-[3px] bg-[#f2a93b] hover:bg-[#f6b855] text-[#1a1305] text-[12.5px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
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

export default function CustomerLoginPage() {
  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#0a0b0d] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-[#6b7078] text-[13px] font-mono">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
