import { NextResponse } from 'next/server';
import { getAnySession } from '@/lib/auth';
import { getStoreForTenant, getStoresForTenant, isTenantSuspended } from '@/lib/db';
import { createSlackOAuthState } from '@/lib/token';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = url.origin;

    // 1. Authenticate user
    const session = await getAnySession(request);
    if (!session?.email) {
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('redirect', url.pathname + url.search);
      return NextResponse.redirect(loginUrl);
    }

    if (await isTenantSuspended(session.email)) {
      return NextResponse.redirect(new URL('/suspended', origin));
    }

    // 2. Resolve target store with strict tenant ownership validation
    const storeIdParam = url.searchParams.get('store_id');
    let targetStore = null;

    if (storeIdParam) {
      targetStore = await getStoreForTenant(storeIdParam, session.email);
    }

    if (!targetStore) {
      const userStores = await getStoresForTenant(session.email);
      if (userStores.length > 0) {
        targetStore = userStores[0];
      }
    }

    if (!targetStore) {
      const redirectUrl = new URL('/dashboard', origin);
      redirectUrl.searchParams.set('slack_error', 'no_store_found');
      return NextResponse.redirect(redirectUrl);
    }

    // 3. Inspect Slack App Credentials
    const clientId = process.env.SLACK_CLIENT_ID;
    if (!clientId) {
      console.warn('[Slack OAuth] SLACK_CLIENT_ID is not configured in environment variables.');
      const redirectUrl = new URL('/dashboard', origin);
      redirectUrl.searchParams.set('store_id', String(targetStore.id));
      redirectUrl.searchParams.set('slack_error', 'slack_not_configured');
      return NextResponse.redirect(redirectUrl);
    }

    // 4. Construct Slack Authorize URL with incoming-webhook scope & cryptographically signed state
    const redirectUri = process.env.SLACK_REDIRECT_URI || `${origin}/api/auth/slack/callback`;
    const state = await createSlackOAuthState({
      storeId: targetStore.id,
      tenantEmail: session.email,
    });

    const slackAuthorizeUrl = new URL('https://slack.com/oauth/v2/authorize');
    slackAuthorizeUrl.searchParams.set('client_id', clientId);
    slackAuthorizeUrl.searchParams.set('scope', 'incoming-webhook');
    slackAuthorizeUrl.searchParams.set('redirect_uri', redirectUri);
    slackAuthorizeUrl.searchParams.set('state', state);

    return NextResponse.redirect(slackAuthorizeUrl.toString());
  } catch (err) {
    console.error('[Slack Connect Error]', err);
    const url = new URL(request.url);
    const redirectUrl = new URL('/dashboard', url.origin);
    redirectUrl.searchParams.set('slack_error', 'internal_error');
    return NextResponse.redirect(redirectUrl);
  }
}
