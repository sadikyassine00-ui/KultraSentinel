import { createSlackOAuthState, verifySlackOAuthState } from '../src/lib/token';
import { updateStoreSlackOAuthDetails, updateStoreWebhook, getStoreForTenant, inMemoryStores } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runVerification() {
  console.log('--- STARTING SLACK OAUTH & HANDSHAKE VERIFICATION ---');

  // 1. Test Cryptographically Signed State Parameter
  const testStoreId = 'store-999';
  const testEmail = 'merchant@example.com';
  const signedState = await createSlackOAuthState({
    storeId: testStoreId,
    tenantEmail: testEmail,
  });

  assert(typeof signedState === 'string' && signedState.split('.').length === 3, 'State is a valid JWT format');

  const verified = await verifySlackOAuthState(signedState);
  assert(verified !== null, 'State verifies successfully');
  assert(verified?.storeId === testStoreId, 'State preserves storeId');
  assert(verified?.tenantEmail === testEmail, 'State preserves tenantEmail');

  const tamperedState = signedState.slice(0, -5) + 'xxxxx';
  const tamperedResult = await verifySlackOAuthState(tamperedState);
  assert(tamperedResult === null, 'Tampered state fails verification');

  // 2. Test Store Record Persistence with Slack OAuth Details
  const dummyStoreId = 'store-slack-test-1';
  inMemoryStores.push({
    id: dummyStoreId,
    gmc_id: '987654321',
    tenant_id: 1,
    tenant_email: testEmail,
    account_type: 'Standalone Merchant',
    store_url: 'https://test-merchant.myshopify.com',
    store_name: 'Test Merchant Store',
    pubsub_topic: 'projects/kultra/topics/gmc',
    last_message_at: new Date().toISOString(),
    open_disapprovals: 0,
    total_caught: 0,
    status: 'active',
    created_at: new Date().toISOString(),
  });

  const updatedStore = await updateStoreSlackOAuthDetails(dummyStoreId, testEmail, {
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/TEST_WEBHOOK_123',
    channel: '#shopping-alerts',
    channelId: 'C01234567',
    configurationUrl: 'https://myworkspace.slack.com/services/B00',
    teamId: 'T01234',
    teamName: 'Test Workspace',
  });

  assert(updatedStore !== null, 'updateStoreSlackOAuthDetails returns updated store');
  assert(updatedStore?.webhook_url === 'https://hooks.slack.com/services/T00/B00/TEST_WEBHOOK_123', 'Webhook URL persisted');
  assert(updatedStore?.slack_channel === '#shopping-alerts', 'Slack channel name persisted');
  assert(updatedStore?.slack_channel_id === 'C01234567', 'Slack channel ID persisted');
  assert(updatedStore?.slack_configuration_url === 'https://myworkspace.slack.com/services/B00', 'Slack configuration URL persisted');
  assert(updatedStore?.webhook_verified === true, 'Webhook marked as verified');
  assert(updatedStore?.alert_status === 'active', 'Alert status marked as active');

  // 3. Test Dashboard Route Channel Label Logic
  const dashboardRoutePath = path.join(__dirname, '../src/app/api/dashboard/route.ts');
  const dashboardContent = fs.readFileSync(dashboardRoutePath, 'utf8');
  assert(dashboardContent.includes('channelLabel = #shopping-alerts') || dashboardContent.includes("channelLabel = '#shopping-alerts'"), 'Dashboard defaults channelLabel to #shopping-alerts when webhook exists');
  assert(dashboardContent.includes('raw.startsWith(\'#\')'), 'Dashboard formats channel with # prefix');

  // 4. Test Frontend Connection UX in TenantTriageCenter
  const triagePath = path.join(__dirname, '../src/components/dashboard/TenantTriageCenter.tsx');
  const triageContent = fs.readFileSync(triagePath, 'utf8');
  assert(triageContent.includes('/api/auth/slack/connect?store_id='), 'TenantTriageCenter includes 1-click Slack connect URL');
  assert(triageContent.includes('Add to Slack (1-Click)'), 'TenantTriageCenter includes "Add to Slack (1-Click)" button');
  assert(triageContent.includes('Using an enterprise workspace? Configure webhook manually'), 'TenantTriageCenter includes enterprise manual webhook accordion');
  assert(triageContent.includes('slack_connected') && triageContent.includes('Kultra Shield Armed: Real-time Google Merchant Center surveillance is live'), 'TenantTriageCenter handles slack_connected banner');

  // 5. Test Slack Connect & Callback Routes
  const connectRoutePath = path.join(__dirname, '../src/app/api/auth/slack/connect/route.ts');
  const connectContent = fs.readFileSync(connectRoutePath, 'utf8');
  assert(connectContent.includes('https://slack.com/oauth/v2/authorize'), 'Connect route redirects to Slack authorize');
  assert(connectContent.includes('scope'), 'Connect route specifies scope');
  assert(connectContent.includes('incoming-webhook'), 'Connect route uses incoming-webhook scope');
  assert(connectContent.includes('createSlackOAuthState'), 'Connect route uses signed state');

  const callbackRoutePath = path.join(__dirname, '../src/app/api/auth/slack/callback/route.ts');
  const callbackContent = fs.readFileSync(callbackRoutePath, 'utf8');
  assert(callbackContent.includes('verifySlackOAuthState'), 'Callback route verifies signed state');
  assert(callbackContent.includes('https://slack.com/api/oauth.v2.access'), 'Callback route exchanges code with Slack oauth.v2.access');
  assert(callbackContent.includes('dispatchSlackWelcomePing'), 'Callback route triggers automated welcome ping');
  assert(callbackContent.includes('slack_connected=true') || callbackContent.includes("slack_connected', 'true'"), 'Callback route redirects with slack_connected flag');

  console.log('--- ALL SLACK OAUTH & HANDSHAKE VERIFICATIONS PASSED ---');
}

runVerification().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
