import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import {
  getStoreByIdAndTenant,
  disconnectStoreForTenant,
  isTenantSuspended,
} from '@/lib/db';
import { decryptToken } from '@/lib/security';
import { revokeGoogleOAuthToken } from '@/lib/googleAuth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getAnySession(request);
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required to disconnect store.' },
      { status: 401 }
    );
  }

  if (await isTenantSuspended(session.email)) {
    return NextResponse.json(
      { error: 'Account access has been suspended. Please contact support@usekultra.com.', isSuspended: true },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid store identifier.' }, { status: 400 });
  }
  const storeId = isNaN(Number(id)) ? id : Number(id);

  // 1. Anti-IDOR: Verify store exists and belongs to authenticated tenant
  const store = await getStoreByIdAndTenant(storeId, session.email);
  if (!store) {
    return NextResponse.json(
      { error: 'Store record not found or access denied for authenticated tenant.' },
      { status: 404 }
    );
  }

  // 2. Google OAuth Token Revocation: Call Google OAuth revocation endpoint with stored refresh token
  if (store.encrypted_refresh_token) {
    try {
      const plaintextToken = await decryptToken(store.encrypted_refresh_token);
      if (plaintextToken) {
        const revokeResult = await revokeGoogleOAuthToken(plaintextToken);
        if (revokeResult.alreadyRevoked) {
          console.info(`[Store Disconnect] Store #${storeId} token was already revoked on Google identity servers.`);
        } else if (!revokeResult.success) {
          console.warn(`[Store Disconnect] Store #${storeId} token revocation notice: ${revokeResult.error}`);
        }
      }
    } catch (revokeErr) {
      console.warn(`[Store Disconnect] Gracefully continuing store disconnect after token error:`, revokeErr);
    }
  }

  // 3. Update store in Neon DB: remove encrypted tokens, set status to disconnected, halt Pub/Sub alerts
  const disconnected = await disconnectStoreForTenant(storeId, session.email);
  if (!disconnected) {
    return NextResponse.json(
      { error: 'Failed to disconnect store. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Store disconnected and Google OAuth access revoked successfully.',
  });
}
