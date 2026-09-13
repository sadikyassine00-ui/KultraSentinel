import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDispatchLogs, retryDispatch, disableWebhook } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const dispatches = await getDispatchLogs();
    return NextResponse.json({ success: true, dispatches });
  } catch (error) {
    console.error('Dispatch Logs Query Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve dispatch logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, dispatchId, destination } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    if (action === 'retry') {
      if (!dispatchId) {
        return NextResponse.json({ error: 'Missing dispatchId for retry' }, { status: 400 });
      }
      const result = await retryDispatch(Number(dispatchId));
      return NextResponse.json({ success: true, message: result.message });
    }

    if (action === 'disableWebhook') {
      if (!destination) {
        return NextResponse.json({ error: 'Missing destination for disableWebhook' }, { status: 400 });
      }
      const result = await disableWebhook(destination);
      return NextResponse.json({ success: true, message: result.message });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('Dispatch Action Error:', error);
    return NextResponse.json({ error: 'Failed to execute dispatch action' }, { status: 500 });
  }
}
