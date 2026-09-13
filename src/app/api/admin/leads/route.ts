import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getLeads, updateLeadStatus } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';

  try {
    const leads = await getLeads({ status, search });
    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('[Admin Leads GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve leads from database.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Lead ID and status are required.' }, { status: 400 });
    }

    const validStatuses = ['pending', 'approved', 'contacted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const updated = await updateLeadStatus(Number(id), status, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      lead: updated,
    });
  } catch (error) {
    console.error('[Admin Leads PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update lead status.' }, { status: 500 });
  }
}
