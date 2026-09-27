/**
 * Google OAuth Token Lifecycle & Revocation Utilities
 * 
 * Complies with Google Trust & Safety and OAuth API verification standards:
 * - Direct revocation on Google OAuth 2.0 servers (https://oauth2.googleapis.com/revoke)
 * - Defensive handling for tokens already revoked externally in Google Account settings
 */

export interface TokenRevocationResult {
  success: boolean;
  alreadyRevoked?: boolean;
  error?: string;
}

/**
 * Revokes a granted Google OAuth access or refresh token on official Google servers.
 *
 * @param token Plaintext Google OAuth refresh or access token
 * @returns TokenRevocationResult with success status and graceful revocation flags
 */
export async function revokeGoogleOAuthToken(token: string): Promise<TokenRevocationResult> {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { success: true };
  }

  const cleanToken = token.trim();

  try {
    const response = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `token=${encodeURIComponent(cleanToken)}`,
    });

    if (response.ok) {
      console.log('[Google OAuth Revoke] Token successfully revoked on Google identity servers.');
      return { success: true };
    }

    const responseText = await response.text();
    console.warn(`[Google OAuth Revoke] Google revocation response (${response.status}): ${responseText}`);

    // Google returns 400 Bad Request if the token was already expired or revoked externally
    // in Google Account Security settings. We catch this gracefully without blocking local deletion.
    if (
      response.status === 400 ||
      responseText.includes('invalid_token') ||
      responseText.includes('already_revoked') ||
      responseText.includes('Token is expired or revoked')
    ) {
      console.info('[Google OAuth Revoke] Token was already revoked or expired externally in Google Account settings.');
      return { success: true, alreadyRevoked: true };
    }

    return {
      success: false,
      error: `Google revocation failed with status ${response.status}: ${responseText}`,
    };
  } catch (error) {
    // Network or DNS failure communicating with Google OAuth servers
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Google OAuth Revoke] Network error contacting Google OAuth revocation endpoint:', message);
    return { success: false, error: message };
  }
}
