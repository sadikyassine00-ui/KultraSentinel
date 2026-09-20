import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getSuperTelemetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const telemetry = await getSuperTelemetry();
    return NextResponse.json({ success: true, telemetry });
  } catch (error) {
    console.error('Super Telemetry Query Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve super-admin telemetry' }, { status: 500 });
  }
}
