import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isTenantSuspended } from '@/lib/db';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Kultra',
  description:
    'Sign in to your Kultra account to monitor Google Merchant Center product feed disapprovals and receive instant alerts.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/login',
  },
};

export default async function CustomerLoginPage() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value;

  if (rawToken) {
    const session = await verifySessionToken(rawToken);
    if (session?.email) {
      const isSuspended = await isTenantSuspended(session.email);
      if (isSuspended) {
        redirect('/suspended');
      }
      redirect(session.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#0a0b0d] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-[#6b7078] text-[13px] font-mono">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
