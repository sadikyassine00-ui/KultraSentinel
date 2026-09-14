'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Building2, Globe, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

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
        // Sole admin gets immediate redirect to dashboard
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        // Tenant receives provisioned confirmation state
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

      // Quick fallback
      router.push('/admin/login');
    } catch {
      setError('Google authentication service unavailable.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#0a0b1dff] text-[#FDF4D2] flex flex-col justify-between selection:bg-[#FF788D] selection:text-white">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-10 relative">
        {/* Subtle Background Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-[460px]">
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/40 text-xs font-bold text-[#34D399] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kultra Platform Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
              Create Platform Account
            </h1>
            <p className="text-xs text-[#CBD5E1] mt-1.5 font-medium">
              Start your 14-day trial or connect your Google Merchant Center MCA.
            </p>
          </div>

          {/* Form / Provisioned Card */}
          <div className="rounded-lg bg-[#111828] border border-[#223147] p-6 sm:p-8 shadow-xl">
            {error && (
              <div className="mb-5 p-3 rounded bg-rose-500/15 border border-rose-500/50 text-[#FF788D] text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            {provisionedData ? (
              <div className="space-y-5 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#FDF4D2]">Account Provisioned Successfully</h3>
                  <p className="text-xs text-[#CBD5E1] mt-1 font-medium">
                    Your 14-day trial for <strong className="text-[#FDF4D2]">{provisionedData.company_name}</strong> is initialized.
                  </p>
                </div>

                <div className="p-4 bg-[#152033] border border-[#2B3B52] rounded-md text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Tenant ID:</span>
                    <span className="font-mono text-[#FDF4D2] font-bold">{provisionedData.user_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Plan Tier:</span>
                    <span className="text-[#FDF4D2] font-bold">{provisionedData.plan_tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Pub/Sub Stream:</span>
                    <span className="text-[#10B981] font-medium">Topic Provisioning Queued</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#94A3B8]">
                  Google Cloud Pub/Sub QoS 1 subscription is configuring. You can now access your account overview or return home.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href="/"
                    className="flex-1 py-2.5 px-4 rounded bg-[#18263D] hover:bg-[#203250] text-[#FDF4D2] border border-[#2B3E5C] text-xs font-semibold transition-colors text-center"
                  >
                    Return to Homepage
                  </a>
                  <a
                    href="/admin/login"
                    className="flex-1 py-2.5 px-4 rounded bg-[#FF788D] hover:bg-[#FF788D]/90 text-[#0a0b1dff] text-xs font-bold transition-colors text-center"
                  >
                    Sign In to Console
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Google Sign-Up */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded bg-[#152033] hover:bg-[#1C2C4A] text-[#FDF4D2] border border-[#2B3B52] hover:border-slate-500 font-semibold text-xs transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.5.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3.1l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.2L1.9 16c1.8 3.6 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-[#223147]" />
                  <span className="px-3 text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
                    Or register with work email
                  </span>
                  <div className="flex-grow border-t border-[#223147]" />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Company or Agency Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Performance Media"
                      className="w-full pl-9 pr-3 py-2 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF788D] font-medium"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF788D] font-medium"
                    />
                  </div>
                </div>

                {/* Account Type Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Account Classification
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('merchant')}
                      className={`p-2 rounded border text-xs font-semibold transition-colors text-center ${
                        accountType === 'merchant'
                          ? 'bg-[#18263D] border-[#FF788D] text-[#FDF4D2]'
                          : 'bg-[#152033] border-[#2B3B52] text-[#CBD5E1] hover:bg-[#1C2C4A]'
                      }`}
                    >
                      Merchant Store
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('agency')}
                      className={`p-2 rounded border text-xs font-semibold transition-colors text-center ${
                        accountType === 'agency'
                          ? 'bg-[#18263D] border-[#FF788D] text-[#FDF4D2]'
                          : 'bg-[#152033] border-[#2B3B52] text-[#CBD5E1] hover:bg-[#1C2C4A]'
                      }`}
                    >
                      Agency MCA
                    </button>
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Store Domain / Website
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. brandstore.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF788D] font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Account Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF788D] font-medium"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded bg-[#FF788D] hover:bg-[#FF788D]/90 text-[#0a0b1dff] font-bold text-xs transition-colors flex items-center justify-center gap-2 mt-4 shadow-md disabled:opacity-50"
                >
                  <span>{loading ? 'Provisioning Account...' : 'Create Platform Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Bottom Switcher */}
            <div className="mt-6 pt-4 border-t border-[#223147] text-center">
              <span className="text-xs text-[#CBD5E1]">
                Already have an account?{' '}
                <Link
                  href="/admin/login"
                  className="text-[#FF788D] hover:underline font-bold transition-colors ml-1"
                >
                  Sign in to Mission Control
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-[#1E293B] bg-[#0a0b1dff] text-center text-xs text-[#94A3B8]">
        &copy; {new Date().getFullYear()} Kultra Sentinel. Dedicated Google Merchant Center Watchdog.
      </footer>
    </div>
  );
}
