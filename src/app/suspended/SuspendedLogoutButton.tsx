'use client';

import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { startRouteTransition } from '@/components/RouteProgressBar';

export default function SuspendedLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    startRouteTransition();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue to redirect even if network drops
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
      // Clean hard navigation to login screen with zero bounce-back
      window.location.href = '/login';
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[3px] border border-[rgba(214,69,69,0.5)] bg-[rgba(214,69,69,0.08)] hover:bg-[rgba(214,69,69,0.16)] text-[#d64545] text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      <span>{loading ? 'Signing out...' : 'Sign out'}</span>
    </button>
  );
}
