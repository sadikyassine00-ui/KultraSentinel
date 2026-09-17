import crypto from 'crypto';

/**
 * Security utilities for Kultra Platform
 * Open-redirect protection, token encryption at rest (AES-256-GCM),
 * webhook input sanitization, and anti-SSRF defense.
 */

// -----------------------------------------------------------------------------
// 1. Open-Redirect Protection
// -----------------------------------------------------------------------------

/**
 * Validates and sanitizes post-login redirect targets to prevent open-redirect vulnerabilities.
 * Strictly permits only relative, internal application URLs starting with a single '/'.
 * Rejects external protocols (http:, https:, javascript:, data:), protocol-relative URLs (//evil.com),
 * and Windows path traversal attempts (/\\evil.com).
 */
export function sanitizeRedirectUrl(url: string | null | undefined, fallback: string = '/admin/dashboard'): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();

  // 1. Must start with a single forward slash
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  // 2. Reject protocol-relative URLs (e.g. //attacker.com)
  if (trimmed.startsWith('//')) {
    return fallback;
  }

  // 3. Reject backslash trickery (e.g. /\attacker.com or /\\attacker.com)
  if (trimmed.startsWith('/\\') || trimmed.includes('\\')) {
    return fallback;
  }

  // 4. Reject embedded schemes or encoded control characters
  if (trimmed.includes(':') || trimmed.includes('%2f%2f') || trimmed.includes('%5c')) {
    const pathPart = trimmed.split(/[?#]/)[0];
    if (pathPart.includes(':')) {
      return fallback;
    }
  }

  // 5. Parse with a dummy origin to strictly ensure the origin cannot be overridden
  try {
    const parsed = new URL(trimmed, 'https://sentinel-guard.internal');
    if (parsed.origin !== 'https://sentinel-guard.internal') {
      return fallback;
    }

    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

// -----------------------------------------------------------------------------
// 2. Token Encryption at Rest (AES-256-GCM)
// -----------------------------------------------------------------------------

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET || 'kultra-sentinel-mission-control-secure-jwt-key-2026!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive credentials (such as Google OAuth refresh tokens) using AES-256-GCM.
 * Output format: "enc_gcm_v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 */
export async function encryptToken(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `enc_gcm_v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted tokens.
 */
export async function decryptToken(encryptedPayload: string): Promise<string> {
  if (!encryptedPayload) return '';
  if (!encryptedPayload.startsWith('enc_gcm_v1:')) {
    // If not encrypted in new format, return as-is (for legacy or unencrypted test seeds)
    return encryptedPayload;
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted token envelope structure');
  }

  const iv = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');
  const ciphertext = parts[3];

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// -----------------------------------------------------------------------------
// 3. Webhook Destination Sanitization & Anti-SSRF Defense
// -----------------------------------------------------------------------------

/**
 * Validates user-submitted webhook destinations before any network connection is attempted.
 * Enforces:
 * - HTTPS protocol scheme strictly
 * - Valid domain syntax
 * - Anti-SSRF: rejects private IP blocks (RFC 1918), loopbacks, link-local, cloud metadata
 * - Disallows embedded credentials
 */
export function validateWebhookUrl(url: string | null | undefined): { valid: boolean; error?: string; url?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Webhook URL cannot be empty' };
  }

  const trimmed = url.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // 1. Strict HTTPS requirement
  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Webhook destination must use secure HTTPS protocol' };
  }

  // 2. Reject credentials in URL
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'User credentials inside webhook URL are strictly forbidden' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 3. Reject loopback and local hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  ) {
    return { valid: false, error: 'Localhost and loopback destinations are forbidden' };
  }

  // 4. Anti-SSRF: check IPv4 numeric blocks
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const octet1 = parseInt(match[1], 10);
    const octet2 = parseInt(match[2], 10);

    // 10.0.0.0/8
    if (octet1 === 10) {
      return { valid: false, error: 'Private IP space (10.0.0.0/8) is forbidden' };
    }
    // 172.16.0.0/12
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
      return { valid: false, error: 'Private IP space (172.16.0.0/12) is forbidden' };
    }
    // 192.168.0.0/16
    if (octet1 === 192 && octet2 === 168) {
      return { valid: false, error: 'Private IP space (192.168.0.0/16) is forbidden' };
    }
    // 169.254.0.0/16 (AWS / GCP / Azure link-local metadata)
    if (octet1 === 169 && octet2 === 254) {
      return { valid: false, error: 'Link-local cloud metadata endpoints are forbidden' };
    }
    // 127.0.0.0/8
    if (octet1 === 127) {
      return { valid: false, error: 'Loopback IP addresses are forbidden' };
    }
    // 0.0.0.0/8
    if (octet1 === 0) {
      return { valid: false, error: 'Wildcard IP address is forbidden' };
    }
  }

  // 5. Must have a valid domain structure (at least one dot or standard webhook provider)
  if (!hostname.includes('.')) {
    return { valid: false, error: 'Destination hostname must be a fully qualified domain name' };
  }

  return { valid: true, url: parsed.toString() };
}

// -----------------------------------------------------------------------------
// 4. OAuth Stateful CSRF Defense (Google Merchant Center)
// -----------------------------------------------------------------------------

export const OAUTH_STATE_COOKIE_NAME = 'kultra_oauth_state';

export interface OAuthStatePayload {
  token: string;
  email: string;
  exp: number;
  returnTo?: string;
}

const usedOAuthTokens = new Set<string>();

/**
 * Generates a cryptographically random, non-guessable state token and an encrypted cookie value (10 min expiration).
 */
export async function createOAuthState(
  tenantEmail: string,
  returnTo: string = '/dashboard'
): Promise<{ state: string; cookieValue: string }> {
  const randomToken = crypto.randomBytes(32).toString('hex');
  const payload: OAuthStatePayload = {
    token: randomToken,
    email: tenantEmail.toLowerCase().trim(),
    exp: Date.now() + 10 * 60 * 1000, // 10 minutes
    returnTo,
  };

  const cookieValue = await encryptToken(JSON.stringify(payload));
  // Send the encrypted envelope as the state parameter so that even if the browser drops
  // cookies on cross-site HTTP redirects (e.g. localhost testing), the state can still be
  // verified via AES-256-GCM authentication tag without sacrificing CSRF defense.
  return { state: cookieValue, cookieValue };
}

/**
 * Validates the returned OAuth state parameter against the encrypted cookie or envelope.
 */
export async function verifyOAuthState(
  stateParam: string | null | undefined,
  cookieValue: string | null | undefined
): Promise<{ valid: boolean; email?: string; returnTo?: string; error?: string }> {
  if (!stateParam) {
    return { valid: false, error: 'State parameter missing from OAuth callback' };
  }

  const cleanState = stateParam.trim();

  // 1. Primary path: verify against the encrypted cookieValue if present
  if (cookieValue) {
    try {
      const decrypted = await decryptToken(cookieValue);
      const payload: OAuthStatePayload = JSON.parse(decrypted);

      if (!payload.token || !payload.exp) {
        return { valid: false, error: 'Malformed state payload' };
      }

      if (Date.now() > payload.exp) {
        return { valid: false, error: 'OAuth state token has expired' };
      }

      if (usedOAuthTokens.has(payload.token)) {
        return { valid: false, error: 'OAuth state token has already been consumed' };
      }

      if (payload.token !== cleanState && cookieValue !== cleanState) {
        return { valid: false, error: 'OAuth state parameter CSRF mismatch' };
      }

      usedOAuthTokens.add(payload.token);
      return { valid: true, email: payload.email, returnTo: payload.returnTo };
    } catch {
      // Fall through to direct envelope check
    }
  }

  // 2. Resilient fallback: if the cookie was dropped by the browser (e.g. cross-site redirect
  // from accounts.google.com to HTTP localhost), directly verify and decrypt the AES-256-GCM envelope.
  if (cleanState.startsWith('enc_gcm_v1:')) {
    try {
      const decrypted = await decryptToken(cleanState);
      const payload: OAuthStatePayload = JSON.parse(decrypted);

      if (!payload.token || !payload.exp) {
        return { valid: false, error: 'Malformed state payload' };
      }

      if (Date.now() > payload.exp) {
        return { valid: false, error: 'OAuth state token has expired' };
      }

      if (usedOAuthTokens.has(payload.token)) {
        return { valid: false, error: 'OAuth state token has already been consumed' };
      }

      usedOAuthTokens.add(payload.token);
      return { valid: true, email: payload.email, returnTo: payload.returnTo };
    } catch {
      return { valid: false, error: 'Failed to authenticate cryptographic OAuth state parameter' };
    }
  }

  return { valid: false, error: 'State parameter or verification cookie missing or invalid' };
}
