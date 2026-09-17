import { NextResponse } from 'next/server';
import { getClearSessionCookieHeader, getAnySession } from '@/lib/auth';
import { revokeSession } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getAnySession(request);
    if (session?.sid) {
      await revokeSession(session.sid);
    }
  } catch (err) {
    console.warn('[Logout] Error revoking session:', err);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.headers.set('Set-Cookie', getClearSessionCookieHeader());
  return response;
}
