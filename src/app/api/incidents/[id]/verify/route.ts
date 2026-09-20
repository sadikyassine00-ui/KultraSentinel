import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { dismissOrAcknowledgeIncident, findTenantByEmail } from '@/lib/db';
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
    if (tenant?.status === 'suspended') {
      return NextResponse.json(
        { error: 'Account access has been suspended. Please contact support@usekultra.com.', isSuspended: true },
        { status: 403 }
      );
    }
    const billing = evaluateSubscription(tenant);
    if (billing.isLocked && !billing.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Trial expired. Triage actions are disabled while your account is locked. Please upgrade to restore full triage capabilities.' },
        { status: 403 }
      );
    }

    const { id: paramId } = await params;

    // Enforce inspection of request payload for unique incident identifier
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty if called without explicit payload
    }

    const payloadIncidentId = body?.incidentId ?? body?.id;
    const targetId = payloadIncidentId ? String(payloadIncidentId).trim() : (paramId ? String(paramId).trim() : '');

    if (!targetId || targetId === 'undefined' || targetId === 'null') {
      return NextResponse.json(
        { error: 'A valid unique incident identifier is required in the request' },
        { status: 400 }
      );
    }

    if (payloadIncidentId && paramId && String(payloadIncidentId).trim() !== String(paramId).trim()) {
      return NextResponse.json(
        { error: 'Mismatched incident identifier between route parameter and payload' },
        { status: 400 }
      );
    }

    const result = await dismissOrAcknowledgeIncident(targetId, session.email);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Incident not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      incidentId: targetId,
      isSimulated: result.isSimulated,
      dismissed: result.dismissed,
      status: result.status,
      message: result.message || (result.isSimulated ? 'Test incident cleared.' : 'Incident acknowledged.'),
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
