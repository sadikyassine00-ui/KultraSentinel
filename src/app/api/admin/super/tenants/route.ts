import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTenants, updateTenant, suspendTenant, unsuspendTenant } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const planTier = searchParams.get('planTier') || undefined;
  const status = searchParams.get('status') || undefined;

  try {
    const tenants = await getTenants({ search, planTier, status });
    return NextResponse.json({ success: true, tenants });
  } catch (error) {
    console.error('Super Tenants Query Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve tenants' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action, plan_tier } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing tenant id or action' }, { status: 400 });
    }

    if (action === 'impersonate') {
      const tenants = await getTenants();
      const target = tenants.find((t) => t.id === Number(id));
      if (!target) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        impersonating: {
          user_id: target.user_id,
          email: target.email,
          company_name: target.company_name,
        },
        message: `Impersonation session established for ${target.email}. Viewing live tenant environment.`,
      });
    }

    if (action === 'extendTrial') {
      const updated = await updateTenant(Number(id), { plan_tier: 'Agency Pilot' });
      return NextResponse.json({ success: true, tenant: updated, message: 'Trial extended and upgraded to Agency Pilot tier.' });
    }

    if (action === 'forceReauth') {
      const updated = await updateTenant(Number(id), { oauth_status: 'Expiring Soon' });
      return NextResponse.json({ success: true, tenant: updated, message: 'OAuth re-authentication request dispatched to tenant.' });
    }

    if (action === 'suspend') {
      const result = await suspendTenant(Number(id));
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, tenant: result.tenant, message: result.message });
    }

    if (action === 'unsuspend') {
      const result = await unsuspendTenant(Number(id));
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, tenant: result.tenant, message: result.message });
    }

    if (action === 'updatePlan') {
      if (!plan_tier) {
        return NextResponse.json({ error: 'Missing plan_tier attribute' }, { status: 400 });
      }
      const updated = await updateTenant(Number(id), { plan_tier });
      return NextResponse.json({ success: true, tenant: updated, message: `Plan tier updated to ${plan_tier}.` });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('Tenant Action Error:', error);
    return NextResponse.json({ error: 'Failed to execute tenant action' }, { status: 500 });
  }
}
