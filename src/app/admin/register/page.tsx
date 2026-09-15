'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Building2, Globe, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [accountType, setAccountType] = useState<'merchant' | 'agency'>('merchant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisionedData, setProvisionedData] = useState<{
    company_name: string;
    user_id: string;
    plan_tier: string;
    isAdmin: boolean;
  } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          companyName,
          website,
          accountType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }

      if (data.isAdmin) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setProvisionedData({
          company_name: data.tenant?.company_name || companyName,
          user_id: data.tenant?.user_id || 'usr_' + Date.now().toString(36),
          plan_tier: data.tenant?.plan_tier || 'Trial',
          isAdmin: false,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration error. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

      router.push('/admin/login');
    } catch {
      setError('Google authentication service unavailable.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[var(--bg-canvas)] text-[var(--ink-primary)] flex flex-col justify-between selection:bg-[var(--signal-glow)] selection:text-[var(--ink-primary)]">
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative">
        <div className="relative z-10 w-full max-w-[460px]">
          {/* Header Title */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block mb-3">
              <Image
                src="/assets/logos/kultraLogo-trimmed.png"
                alt="Kultra"
                width={130}
                height={26}
                className="h-[26px] w-auto mx-auto object-contain brightness-105"
              />
            </Link>
            <div className="tag-pill tag-signal text-[11px] mb-3">
              Platform Registration
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tracking-tight">
              Create platform account
            </h1>
            <p className="text-[13px] text-[var(--ghost-text)] mt-1.5">
              Start your 14-day trial or connect your Merchant Center MCA.
            </p>
          </div>

          {/* Form / Provisioned Card */}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--hairline)] p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-[var(--radius-sm)] bg-[var(--danger-wash)] border border-[var(--danger)] text-[var(--danger)] text-[12.5px] leading-relaxed">
                {error}
              </div>
            )}

            {provisionedData ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-10 h-10 rounded-full bg-[var(--signal-wash)] border border-[var(--signal-dim)] flex items-center justify-center mx-auto text-[var(--signal)]">
                  <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[var(--ink-primary)]">Account initialized</h3>
                  <p className="text-[13px] text-[var(--ghost-text)] mt-1">
                    Your 14-day trial for <strong className="text-[var(--ink-primary)]">{provisionedData.company_name}</strong> is ready.
                  </p>
                </div>

                <div className="p-3.5 bg-[var(--bg-canvas)] border border-[var(--hairline)] rounded-[var(--radius-sm)] text-left font-mono text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[var(--ghost-text-dim)]">TENANT_ID:</span>
                    <span className="text-[var(--ink-primary)]">{provisionedData.user_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--ghost-text-dim)]">PLAN_TIER:</span>
                    <span className="text-[var(--signal)]">{provisionedData.plan_tier}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href="/"
                    className="btn-secondary flex-1 justify-center text-[12px] py-2"
                  >
                    Return home
                  </a>
                  <a
                    href="/dashboard"
                    className="btn-primary flex-1 justify-center text-[12px] py-2"
                  >
                    Open dashboard
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="btn-secondary w-full justify-center text-[12.5px] py-2.5 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.5.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3.1l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.2L1.9 16c1.8 3.6 5.6 7 10.1 7z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-full border-t border-[var(--hairline)]" />
                  <span className="absolute bg-[var(--bg-surface)] px-2 font-mono text-[10.5px] text-[var(--ghost-text-dim)]">
                    or register with email
                  </span>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[var(--ghost-text)] mb-1">
                    Company or agency name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ghost-text-dim)]" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Performance Media"
                      className="input w-full pl-9"
                    />
                  </div>
                </div>

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
                      placeholder="you@company.com"
                      className="input w-full pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[var(--ghost-text)] mb-1">
                    Account type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('merchant')}
                      className={`p-2 rounded-[var(--radius-sm)] border text-[12px] font-semibold transition-colors text-center ${
                        accountType === 'merchant'
                          ? 'bg-[var(--signal-wash)] border-[var(--signal-dim)] text-[var(--signal)]'
                          : 'bg-[var(--bg-canvas)] border-[var(--hairline-strong)] text-[var(--ghost-text)]'
                      }`}
                    >
                      Merchant Store
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('agency')}
                      className={`p-2 rounded-[var(--radius-sm)] border text-[12px] font-semibold transition-colors text-center ${
                        accountType === 'agency'
                          ? 'bg-[var(--signal-wash)] border-[var(--signal-dim)] text-[var(--signal)]'
                          : 'bg-[var(--bg-canvas)] border-[var(--hairline-strong)] text-[var(--ghost-text)]'
                      }`}
                    >
                      Agency MCA
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[var(--ghost-text)] mb-1">
                    Store domain or website
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ghost-text-dim)]" />
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. brandstore.com"
                      className="input w-full pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[var(--ghost-text)] mb-1">
                    Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ghost-text-dim)]" />
                    <input
                      type="password"
                      required
                      minLength={8}
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
                    <span>{loading ? 'Provisioning account...' : 'Create platform account'}</span>
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 pt-3.5 border-t border-[var(--hairline)] text-center">
              <span className="text-[12.5px] text-[var(--ghost-text)]">
                Already have an account?{' '}
                <Link
                  href="/admin/login"
                  className="text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:underline font-medium ml-1 transition-colors"
                >
                  Sign in to Mission Control
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 border-t border-[var(--hairline)] bg-[var(--bg-canvas)] text-center font-mono text-[11px] text-[var(--ghost-text-dim)]">
        &copy; {new Date().getFullYear()} Kultra Sentinel. Dedicated Google Merchant Center Watchdog.
      </footer>
    </div>
  );
}
