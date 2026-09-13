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
      // Check if Google Client ID is configured
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (googleClientId) {
        // Construct standard OAuth 2.0 authorization redirect
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

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0b1dff] text-[#FDF4D2] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Subtle Background Grid Accent */}
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
        {/* Brand Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-4" aria-label="Return to Kultra Home">
            <Image
              src="/assets/logos/kultraLogo-trimmed.png"
              alt="Kultra"
              width={150}
              height={32}
              className="h-8 w-auto mx-auto object-contain"
              priority
            />
          </a>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[0.75rem] font-bold text-[#10B981] px-2.5 py-0.5 rounded-[2px] bg-[#10B981]/10 border border-[#10B981]/30">
              Sentinel Mission Control
            </span>
          </div>
          <h1 className="text-[1.5rem] font-bold text-[#FDF4D2] tracking-tight">
            Administrator Access
          </h1>
          <p className="text-[0.85rem] text-[#94A3B8] mt-1">
            Sign in to manage pilot submissions and live telemetry.
          </p>
        </div>

        {/* Login Panel */}
        <div className="rounded-[6px] bg-[#0F1522] border border-[#1E293B] p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-[3px] bg-[#FF788D]/10 border border-[#FF788D]/30 text-[#FF788D] text-[0.8125rem] leading-snug">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-[4px] bg-[#141C2B] hover:bg-[#1E293B] text-[#FDF4D2] border border-[#1E293B] hover:border-[#334155] font-semibold text-[0.875rem] transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {/* Clean SVG Google Icon */}
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
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E293B]" />
            </div>
            <span className="relative bg-[#0F1522] px-3 text-[0.75rem] text-[#64748B] uppercase tracking-wider">
              or sign in with password
            </span>
          </div>

          {/* Email + Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-[0.78rem] font-semibold text-[#94A3B8] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kultra.ai"
                  className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B] text-[#FDF4D2] placeholder-[#475569] text-[0.875rem] focus:outline-none focus:border-[#FF788D] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.78rem] font-semibold text-[#94A3B8] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-[4px] bg-[#0a0b1dff] border border-[#1E293B] text-[#FDF4D2] placeholder-[#475569] text-[0.875rem] focus:outline-none focus:border-[#FF788D] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-[4px] bg-[#FF788D] hover:bg-[#FF8FA2] text-[#0a0b1dff] font-bold text-[0.875rem] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </form>

          {/* Setup Hint */}
          <div className="mt-6 pt-5 border-t border-[#1E293B] text-center">
            <p className="text-[0.75rem] text-[#64748B]">
              Default credential bootstrap: <code className="text-[#94A3B8]">admin@kultra.ai</code> / <code className="text-[#94A3B8]">KultraSentinel2026!</code>
            </p>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-[0.75rem] text-[#64748B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Encrypted Session with Argon2/Bcrypt and HttpOnly Cookies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
