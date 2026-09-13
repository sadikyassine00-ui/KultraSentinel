import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTelemetryStats } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const stats = await getTelemetryStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Admin Telemetry GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve telemetry stats.' }, { status: 500 });
  }
}
