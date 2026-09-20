import { NextResponse } from 'next/server';
import { getStoreForTenant, updateStoreSlackOAuthDetails } from '@/lib/db';
import { verifySlackOAuthState } from '@/lib/token';
import { dispatchSlackWelcomePing } from '@/lib/slack';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  try {
    const errorParam = url.searchParams.get('error');
    if (errorParam) {
      console.warn('[Slack OAuth] User canceled or error returned from Slack:', errorParam);
      const redirectUrl = new URL('/dashboard', origin);
      redirectUrl.searchParams.set('slack_error', errorParam);
      return NextResponse.redirect(redirectUrl);
    }

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      const redirectUrl = new URL('/dashboard', origin);
      redirectUrl.searchParams.set('slack_error', 'missing_code_or_state');
      return NextResponse.redirect(redirectUrl);
    }

    // 1. Cryptographically verify and decode state
    const verifiedState = await verifySlackOAuthState(state);
    if (!verifiedState) {
      console.error('[Slack OAuth] Invalid or expired state parameter');
      const redirectUrl = new URL('/dashboard', origin);
      redirectUrl.searchParams.set('slack_error', 'invalid_state');
      return NextResponse.redirect(redirectUrl);
    }

    const { storeId, tenantEmail } = verifiedState;

    // 2. Validate tenant store ownership
    const store = await getStoreForTenant(storeId, tenantEmail);
    if (!store) {
      console.error('[Slack OAuth] Store not found or tenant mismatch:', storeId, tenantEmail);
      const redirectUrl = new URL('/dashboard', origin);
      redirectUrl.searchParams.set('slack_error', 'store_not_found');
      return NextResponse.redirect(redirectUrl);
    }

    // 3. Exchange temporary authorization code with Slack oauth.v2.access
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = process.env.SLACK_REDIRECT_URI || `${origin}/api/auth/slack/callback`;

    if (!clientId || !clientSecret) {
      console.error('[Slack OAuth] SLACK_CLIENT_ID or SLACK_CLIENT_SECRET missing in environment');
      const redirectUrl = new URL('/dashboard', origin);
      redirectUrl.searchParams.set('store_id', storeId);
      redirectUrl.searchParams.set('slack_error', 'slack_credentials_missing');
      return NextResponse.redirect(redirectUrl);
    }

    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok || !tokenData.incoming_webhook?.url) {
      console.error('[Slack OAuth] Token exchange failed:', tokenData);
      const redirectUrl = new URL('/dashboard', origin);
      redirectUrl.searchParams.set('store_id', storeId);
      redirectUrl.searchParams.set('slack_error', tokenData.error || 'token_exchange_failed');
      return NextResponse.redirect(redirectUrl);
    }

    const incomingWebhook = tokenData.incoming_webhook;
    const channelName = incomingWebhook.channel || '#shopping-alerts';
    const channelId = incomingWebhook.channel_id || null;
    const configurationUrl = incomingWebhook.configuration_url || null;
    const teamId = tokenData.team?.id || null;
    const teamName = tokenData.team?.name || null;

    // 4. Update store record with verified webhook and channel metadata
    const updatedStore = await updateStoreSlackOAuthDetails(storeId, tenantEmail, {
      webhookUrl: incomingWebhook.url,
      channel: channelName,
      channelId,
      configurationUrl,
      teamId,
      teamName,
    });

    // 5. Automated Proof-of-Value Welcome Ping
    if (updatedStore) {
      try {
        await dispatchSlackWelcomePing({
          store: updatedStore,
          appUrl: origin,
        });
      } catch (pingErr) {
        console.warn('[Slack OAuth] Automated welcome ping non-blocking failure:', pingErr);
      }
    }

    // 6. Redirect to dashboard with success indicator
    const redirectUrl = new URL('/dashboard', origin);
    redirectUrl.searchParams.set('store_id', storeId);
    redirectUrl.searchParams.set('slack_connected', 'true');
    redirectUrl.searchParams.set('channel', channelName.startsWith('#') ? channelName : `#${channelName}`);

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('[Slack OAuth Callback Error]', err);
    const redirectUrl = new URL('/dashboard', origin);
    redirectUrl.searchParams.set('slack_error', 'callback_internal_error');
    return NextResponse.redirect(redirectUrl);
  }
}
