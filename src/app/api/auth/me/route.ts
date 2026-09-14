import { NextResponse } from 'next/server';
import { getAnySession, isAllowedAdminEmail } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getAnySession(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const isAdmin = isAllowedAdminEmail(session.email);

  return NextResponse.json({
    authenticated: true,
    user: {
      ...session,
      isAdmin,
    },
  });
}
