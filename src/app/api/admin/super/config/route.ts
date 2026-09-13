import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getSystemConfig, updateSystemConfig } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const config = await getSystemConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('System Config Query Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve system configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateSystemConfig({
      maintenance_mode: body.maintenance_mode,
      registration_gate: body.registration_gate,
      rate_limit_per_min: body.rate_limit_per_min ? Number(body.rate_limit_per_min) : undefined,
      banner_text: body.banner_text,
    });
    return NextResponse.json({ success: true, config: updated, message: 'Platform system configuration updated live.' });
  } catch (error) {
    console.error('System Config Update Error:', error);
    return NextResponse.json({ error: 'Failed to update system configuration' }, { status: 500 });
  }
}
