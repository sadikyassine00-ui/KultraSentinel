import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountSelectorClient from './AccountSelectorClient';
import { DiscoveredGmcAccount } from '@/lib/merchant_api';

interface SelectCookieData {
  email: string;
  accounts: DiscoveredGmcAccount[];
  createdAt: number;
}

export default async function SelectAccountPage() {
  const cookieStore = await cookies();
  const selectCookie = cookieStore.get('kultra_gmc_select')?.value;

  if (!selectCookie) {
    redirect('/dashboard?error=Account%20selection%20session%20expired.');
  }

  let data: SelectCookieData;
  try {
    data = JSON.parse(Buffer.from(selectCookie, 'base64').toString('utf-8'));
  } catch {
    redirect('/dashboard?error=Invalid%20account%20selection%20session.');
  }

  if (!Array.isArray(data.accounts) || data.accounts.length === 0) {
    redirect('/dashboard/connect/no-account');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <AccountSelectorClient accounts={data.accounts} email={data.email} />
    </div>
  );
}
