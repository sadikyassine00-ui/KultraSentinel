import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { markIncidentPendingVerification, findTenantByEmail } from '@/lib/db';
import { evaluateSubscription } from '@/lib/subscription';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAnySession(request);
    if (!session?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const tenant = await findTenantByEmail(session.email);
    const billing = evaluateSubscription(tenant);
    if (billing.isLocked && !billing.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Trial expired. Triage actions are disabled while your account is locked. Please upgrade to restore full triage capabilities.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Incident identifier is required' }, { status: 400 });
    }

    const result = await markIncidentPendingVerification(id, session.email);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Incident not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Incident marked as pending verification.',
      incident: result.incident,
    });
  } catch (error) {
    console.error('[Verify Incident Action Error]', error);
    return NextResponse.json(
      { error: 'Internal server error updating incident status' },
      { status: 500 }
    );
  }
}
