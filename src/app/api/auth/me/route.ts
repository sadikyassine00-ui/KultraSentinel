import { NextResponse } from 'next/server';
import { getAnySession, isAllowedAdminEmail } from '@/lib/auth';
import { isTenantSuspended } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAnySession(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const isSuspended = await isTenantSuspended(session.email);
  const isAdmin = isAllowedAdminEmail(session.email);

  return NextResponse.json({
    authenticated: true,
    isSuspended,
    user: {
      ...session,
      isAdmin,
      isSuspended,
    },
  });
}
