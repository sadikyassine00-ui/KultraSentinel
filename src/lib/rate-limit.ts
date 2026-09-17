/**
 * In-Memory Sliding Window Rate Limiter for Authentication & Abuse Prevention
 * Protects login and registration endpoints against credential stuffing and brute-force attacks.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Remove timestamps older than 1 hour
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  totalAttempts: number;
  retryAfterSeconds: number;
}

/**
 * Checks and increments rate limit for a given key.
 *
 * @param key Identifier (typically `login:${ip}` or `register:${ip}`)
 * @param maxAttempts Maximum allowed attempts within the window
 * @param windowSeconds Window duration in seconds
 * @returns RateLimitResult with allow status and retry-after metadata
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 15 * 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxAttempts) {
    // Oldest attempt in the current window dictates the retry time
    const oldest = record.timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      allowed: false,
      remaining: 0,
      totalAttempts: record.timestamps.length,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - record.timestamps.length,
    totalAttempts: record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Records an attempt for the key.
 */
export function recordAttempt(key: string): void {
  const now = Date.now();
  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }
  record.timestamps.push(now);
}

/**
 * Returns current attempt count within window.
 */
export function getAttemptCount(key: string, windowSeconds: number = 15 * 60): number {
  const record = rateLimitStore.get(key);
  if (!record) return 0;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
  return record.timestamps.length;
}

/**
 * Progressive exponential delay (backoff) applied after 3 consecutive failed attempts:
 * - 3 failures: 500ms
 * - 4 failures: 1200ms
 * - 5+ failures: 2500ms
 */
export async function applyExponentialBackoff(attemptCount: number): Promise<void> {
  if (attemptCount < 3) return;
  let delayMs = 0;
  if (attemptCount === 3) delayMs = 500;
  else if (attemptCount === 4) delayMs = 1200;
  else delayMs = 2500;

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

/**
 * Registration flooding protection: limits account creation per IP address.
 * Hard limit: 5 account creations per IP per rolling hour.
 */
export function checkRegistrationRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(`register:${ip}`, 5, 60 * 60);
}

/**
 * Resets rate limit for a key (used upon successful authentication).
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Extracts client IP address reliably from HTTP request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return '127.0.0.1';
}
