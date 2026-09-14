'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }
      router.push('/admin/dashboard');
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

      // Quick-connect fallback for development / initial setup
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoEmail: 'admin@kultra.ai',
          demoName: 'Google Verified Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google authentication failed.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#0a0b1dff] text-[#FDF4D2] flex flex-col justify-between selection:bg-[#FF788D] selection:text-white">
      {/* Main Login Card Area */}
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

        <div className="relative z-10 w-full max-w-[420px]">
          {/* Card Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/40 text-xs font-bold text-[#34D399] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sentinel Mission Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FDF4D2] tracking-tight">
              Sign In to Platform
            </h1>
            <p className="text-xs text-[#CBD5E1] mt-1.5 font-medium">
              Access real-time Google Merchant Center telemetry and defense controls.
            </p>
          </div>

          {/* Login Panel */}
          <div className="rounded-lg bg-[#111828] border border-[#223147] p-6 sm:p-8 shadow-xl">
            {error && (
              <div className="mb-5 p-3 rounded bg-rose-500/15 border border-rose-500/50 text-[#FF788D] text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
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
                Or sign in with password
              </span>
              <div className="flex-grow border-t border-[#223147]" />
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF788D] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#152033] border border-[#2B3B52] rounded text-xs text-[#FDF4D2] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF788D] font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded bg-[#FF788D] hover:bg-[#FF788D]/90 text-[#0a0b1dff] font-bold text-xs transition-colors flex items-center justify-center gap-2 mt-4 shadow-md disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Bottom Switcher */}
            <div className="mt-6 pt-4 border-t border-[#223147] text-center">
              <span className="text-xs text-[#CBD5E1]">
                Don&apos;t have an account?{' '}
                <a
                  href="/admin/register"
                  className="text-[#FF788D] hover:underline font-bold transition-colors ml-1"
                >
                  Register for Platform Access
                </a>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-[#1f2c42] bg-[#0c101c] text-center text-xs text-[#94A3B8]">
        <span>&copy; {new Date().getFullYear()} Kultra Sentinel. Mission Critical Google Merchant Center Defense.</span>
      </footer>
    </div>
  );
}
