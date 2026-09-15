import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/token';
import { getStoreForTenant, getIncidentsByStore } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 });
    }
    const storeId = isNaN(Number(id)) ? id : Number(id);

    // 1. Authenticate session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // 2. Composite Authorization (Anti-IDOR Defense)
    // Query requires both storeId AND authenticated session user's email
    const store = await getStoreForTenant(storeId, session.email);
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found or access unauthorized' },
        { status: 404 }
      );
    }

    const incidents = await getIncidentsByStore(storeId, session.email);

    return NextResponse.json({
      success: true,
      storeId,
      incidents,
    });
  } catch (error) {
    console.error('[Store Incidents Error]', error);
    return NextResponse.json(
      { error: 'Internal server error fetching store incidents' },
      { status: 500 }
    );
  }
}
