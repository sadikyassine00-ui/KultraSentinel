import { NextRequest, NextResponse } from 'next/server';
import { getPaddleInstance } from '@/lib/paddle/server';
import { processPaddleWebhookEvent } from '@/lib/paddle/process-webhook';
import { isPaddleEventProcessed, markPaddleEventProcessed } from '@/lib/db';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature') ?? '';
  const rawBody = await request.text();
  const secret =
    process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET?.trim() ||
    process.env.PADDLE_WEBHOOK_SECRET?.trim() ||
    '';

  // 1. Pre-validation: missing signature or body is an immediate client bad request (400)
  if (!signature || !rawBody) {
    return NextResponse.json(
      { error: 'Missing paddle-signature header or empty request body' },
      { status: 400 }
    );
  }

  try {
    const paddle = getPaddleInstance();

    // 2. Cryptographic signature verification and unmarshaling
    // Throws if signature HMAC does not match, timestamp is expired, or secret is invalid
    const eventData = await paddle.webhooks.unmarshal(rawBody, secret, signature);

    if (!eventData) {
      return NextResponse.json({ error: 'Malformed or empty event payload' }, { status: 400 });
    }

    // 3. Idempotency check: deduplicate on eventId
    const alreadyProcessed = await isPaddleEventProcessed(eventData.eventId);
    if (alreadyProcessed) {
      console.log(`[Paddle Webhook] Duplicate event suppressed: ${eventData.eventId}`);
      return NextResponse.json({ received: true, deduplicated: true }, { status: 200 });
    }

    // 4. Synchronous state synchronization
    await processPaddleWebhookEvent(eventData);

    // 5. Mark event as processed in persistent store
    await markPaddleEventProcessed(eventData.eventId, eventData.eventType);

    // 6. Fast 200 acknowledgment (well within Paddle's 5-second delivery window)
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Paddle Webhook Error]:', error);
    // Any non-2xx response informs Paddle to retry on its exponential backoff schedule
    return NextResponse.json(
      { error: 'Internal server error verifying or executing webhook' },
      { status: 500 }
    );
  }
}
