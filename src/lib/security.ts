/**
 * Security utilities for Kultra Platform
 * Open-redirect protection, URL sanitization, and input defense.
 */

/**
 * Validates and sanitizes post-login redirect targets to prevent open-redirect vulnerabilities.
 * Strictly permits only relative, internal application URLs starting with a single '/'.
 * Rejects external protocols (http:, https:, javascript:, data:), protocol-relative URLs (//evil.com),
 * and Windows path traversal attempts (/\\evil.com).
 *
 * @param url The redirect URL parameter to evaluate
 * @param fallback Safe internal fallback destination (default: '/admin/dashboard')
 * @returns Sanitized relative URL path or fallback
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
    // Exception: query params or anchors that might legitimately contain colons?
    // Check if colon appears before query string or hash
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

    // Ensure it strictly returns pathname + search + hash
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
