import { NextResponse } from 'next/server';
import { getAnySession, isAllowedAdminEmail } from '@/lib/auth';
import { isTenantSuspended, findTenantByEmail } from '@/lib/db';
import { evaluateSubscription } from '@/lib/subscription';

export async function GET(request: Request) {
  const session = await getAnySession(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const isSuspended = await isTenantSuspended(session.email);
  const isAdmin = isAllowedAdminEmail(session.email) || session.role === 'admin' || session.isSuperAdmin;

  let planName = isAdmin ? 'Admin' : 'Active Plan';
  let planTier = isAdmin ? 'Superadmin' : 'Solo';

  try {
    const tenant = await findTenantByEmail(session.email);
    if (tenant) {
      const sub = evaluateSubscription(tenant);
      planName = sub.planName;
      planTier = sub.planTier;
    }
  } catch {
    // Non-blocking fallback
  }

  return NextResponse.json({
    authenticated: true,
    isSuspended,
    user: {
      ...session,
      isAdmin: Boolean(isAdmin),
      isSuspended,
      planName,
      planTier,
    },
  });
}
