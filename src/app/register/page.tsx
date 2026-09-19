import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { isTenantSuspended } from '@/lib/db';
import RegisterForm from './RegisterForm';

export default async function CustomerRegisterPage() {
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
        <RegisterForm />
      </Suspense>
    </div>
  );
}
