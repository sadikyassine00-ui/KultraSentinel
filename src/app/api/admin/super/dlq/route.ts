import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getDLQMessages, replayDLQMessage, purgeDLQMessage } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const messages = await getDLQMessages();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('DLQ Query Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve DLQ messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Sole platform owner access only.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action;
    const messageId = body.messageId || body.id;

    if (!messageId || !action) {
      return NextResponse.json({ error: 'Missing messageId or action' }, { status: 400 });
    }

    if (action === 'replay') {
      const result = await replayDLQMessage(Number(messageId));
      return NextResponse.json({ success: true, message: result.message });
    }

    if (action === 'purge') {
      await purgeDLQMessage(Number(messageId));
      return NextResponse.json({ success: true, message: `Message #${messageId} purged from Dead Letter Queue.` });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('DLQ Action Error:', error);
    return NextResponse.json({ error: 'Failed to execute DLQ action' }, { status: 500 });
  }
}
