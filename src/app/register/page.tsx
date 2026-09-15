'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Building, Globe } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [accountType, setAccountType] = useState<'merchant' | 'agency'>('merchant');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          accountType,
          website,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please check your details.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }

      router.push(data.redirectUrl || '/dashboard?just_connected=true');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px]">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-4">
          <Image
            src="/assets/logos/kultraLogo-trimmed.png"
            alt="Kultra"
            width={130}
            height={28}
            className="h-[28px] w-auto mx-auto object-contain brightness-110"
            priority
          />
        </Link>
        <h1 className="text-[26px] font-semibold text-[#f4f1ea] tracking-tight font-display">
          Start your 14-day trial
        </h1>
        <p className="text-[13px] text-[#6b7078] mt-1">
          Sub-30-second disapproval detection for Google Shopping.
        </p>
      </div>

      {/* Register Card */}
      <div className="rounded-[4px] bg-[#0e0f11] border border-[rgba(255,255,255,0.08)] p-6 sm:p-7">
        {error && (
          <div className="mb-4 p-3 rounded-[3px] bg-[rgba(214,69,69,0.08)] border border-[#d64545] text-[#d64545] text-[12.5px] leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1">
              Store or agency name
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

          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1">
              Work email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@acme.com"
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1">
              Store website (optional)
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

          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1">
              Account type
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
                Standalone Merchant
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
                Agency / MCA
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-[#6b7078] mb-1">
              Create password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#45484f]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#0a0b0d] border border-[rgba(255,255,255,0.14)] text-[#f4f1ea] text-[13px] placeholder:text-[#45484f] focus:border-[#f2a93b] focus:outline-none focus:ring-1 focus:ring-[#f2a93b] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full !mt-5 py-2.5 px-4 rounded-[3px] bg-[#f2a93b] hover:bg-[#f6b855] text-[#1a1305] text-[12.5px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating workspace...' : 'Start 14-day free trial'}
          </button>
        </form>
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
