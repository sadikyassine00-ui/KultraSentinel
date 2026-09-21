'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { sanitizeRedirectUrl } from '@/lib/security';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err) {
        setError(decodeURIComponent(err));
      }
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const redirectParam = params ? params.get('redirect') : null;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, redirect: redirectParam }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }

      const safeDestination = sanitizeRedirectUrl(data.redirectUrl || redirectParam, '/admin/dashboard');
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
      window.location.href = '/api/auth/google?prompt=select_account&from=/admin/login';
    } catch {
      setError('Google authentication service unavailable.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[var(--bg-canvas)] text-[var(--ink-primary)] flex flex-col justify-between selection:bg-[var(--signal-glow)] selection:text-[var(--ink-primary)]">
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative">
        <div className="relative z-10 w-full max-w-[420px]">
          {/* Card Header Title */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block mb-3">
              <Image
                src="/assets/logos/kultra-logo-horizontal.svg"
                alt="Kultra"
                width={140}
                height={36}
                className="h-[28px] sm:h-[30px] w-auto mx-auto object-contain brightness-105"
              />
            </Link>
            <div className="tag-pill tag-signal text-[11px] mb-3">
              Mission Control
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tracking-tight">
              Sign in to platform
            </h1>
            <p className="text-[13px] text-[var(--ghost-text)] mt-1.5">
              Access real-time Google Merchant Center telemetry.
            </p>
          </div>

          {/* Login Panel */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-[var(--danger)] text-[12.5px] leading-relaxed">
                {error}
              </div>
            )}

            {/* Google Sign-In Button */}
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

            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-[var(--hairline)]" />
              <span className="absolute bg-[var(--bg-surface)] px-2 font-mono text-[10.5px] text-[var(--ghost-text-dim)]">
                or sign in with password
              </span>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--ghost-text)] mb-1">
                  Work email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ghost-text-dim)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="input w-full pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--ghost-text)] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ghost-text-dim)]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input w-full pl-9"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center text-[13px] py-2.5 disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign in to Console'}</span>
                </button>
              </div>
            </form>

            <div className="mt-5 pt-3.5 border-t border-[var(--hairline)] text-center">
              <span className="text-[12.5px] text-[var(--ghost-text)]">
                Don&apos;t have an account?{' '}
                <Link
                  href="/admin/register"
                  className="text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:underline font-medium ml-1 transition-colors"
                >
                  Register for platform access
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 border-t border-[var(--hairline)] bg-[var(--bg-canvas)] text-center font-mono text-[11px] text-[var(--ghost-text-dim)]">
        &copy; {new Date().getFullYear()} Kultra (usekultra.com). Dedicated Google Merchant Center Watchdog.
      </footer>
    </div>
  );
}
