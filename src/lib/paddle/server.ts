import { Environment, LogLevel, Paddle, type PaddleOptions, EventName, type EventEntity } from '@paddle/paddle-node-sdk';
import { getPaddleEnvironment } from './config';

let cachedPaddle: Paddle | null = null;

export function getPaddleInstance(): Paddle {
  const apiKey = (process.env.PADDLE_API_KEY || process.env.PADDLE_SANDBOX_API_KEY)?.trim();
  if (!apiKey) {
    throw new Error('PADDLE_API_KEY or PADDLE_SANDBOX_API_KEY is not set in environment variables');
  }

  if (cachedPaddle) {
    return cachedPaddle;
  }

  const isProduction = getPaddleEnvironment() === 'production';
  const options: PaddleOptions = {
    environment: isProduction ? Environment.production : Environment.sandbox,
    logLevel: isProduction ? LogLevel.error : LogLevel.warn,
  };

  cachedPaddle = new Paddle(apiKey, options);
  return cachedPaddle;
}

export async function unmarshalPaddleWebhook(
  rawBody: string,
  signature: string,
  secretOverride?: string
): Promise<EventEntity> {
  const secret = secretOverride || process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET?.trim() || '';
  if (!secret) {
    throw new Error('PADDLE_NOTIFICATION_WEBHOOK_SECRET is not set');
  }

  const paddle = getPaddleInstance();
  const event = await paddle.webhooks.unmarshal(rawBody, secret, signature);
  if (!event) {
    throw new Error('Paddle webhook signature verification yielded empty event payload');
  }
  return event;
}

export { EventName };
export type { EventEntity };
