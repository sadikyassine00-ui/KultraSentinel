import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { getDashboardDataPayload } from '@/lib/dashboard';

export async function GET(request: Request) {
  try {
    const session = await getAnySession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const requestedStoreId = url.searchParams.get('store_id');
    const impersonateParam = url.searchParams.get('impersonate');
    const isAdmin = session.role === 'admin' || session.isSuperAdmin;

    const tenantEmail = (isAdmin && impersonateParam)
      ? impersonateParam.toLowerCase().trim()
      : session.email.toLowerCase().trim();

    const result = await getDashboardDataPayload(tenantEmail, requestedStoreId, isAdmin, impersonateParam);
    if (result.error) {
      return NextResponse.json(
        { error: result.error, isSuspended: result.isSuspended, supportEmail: result.supportEmail },
        { status: result.status }
      );
    }
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('[Dashboard Hydration API Error]', error);
    return NextResponse.json({ error: 'Failed to hydrate dashboard data' }, { status: 500 });
  }
}
