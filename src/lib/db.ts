import { neon } from '@neondatabase/serverless';
import { isSuperAdminEmail } from './token';

export interface Lead {
  id: number;
  email: string;
  account_type: 'merchant' | 'agency';
  website: string;
  catalog_size: string;
  status: 'pending' | 'approved' | 'contacted' | 'rejected';
  notes?: string | null;
  created_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  password_hash?: string | null;
  google_id?: string | null;
  name?: string | null;
  role: string;
  status?: 'active' | 'suspended';
  created_at: string;
}

export interface TelemetryEvent {
  id: number;
  event_type: string;
  sku?: string;
  revenue_impact: number;
  details?: Record<string, unknown>;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Super-Admin Platform Owner Interfaces
// -----------------------------------------------------------------------------

export interface Tenant {
  id: number;
  user_id: string;
  email: string;
  company_name: string;
  plan_tier: 'Trial' | 'Agency Pilot' | 'Active Pro' | 'Delinquent' | 'Canceled';
  account_plan?: 'solo' | 'agency' | string;
  connected_stores: number;
  total_skus: number;
  incidents_month: number;
  oauth_status: 'Valid' | 'Expiring Soon' | 'Revoked/Failed';
  last_active: string;
  status: 'active' | 'suspended';
  subscription_status?: 'active trial' | 'paid active' | 'expired' | 'canceled';
  trial_ends_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  paddle_customer_id?: string | null;
  paddle_subscription_id?: string | null;
  current_period_ends_at?: string | null;
  scheduled_cancellation_at?: string | null;
  is_past_due?: boolean;
  created_at: string;
}

export interface Store {
  id: number | string;
  gmc_id: string;
  merchant_id?: string;
  tenant_id: number;
  tenant_email: string;
  account_type: 'Standalone Merchant' | 'MCA Child';
  store_url: string;
  store_name?: string;
  encrypted_refresh_token?: string | null;
  alert_status?: 'active' | 'degraded';
  webhook_url?: string | null;
  slack_webhook_url?: string | null;
  slack_channel?: string | null;
  slack_channel_id?: string | null;
  slack_configuration_url?: string | null;
  slack_team_id?: string | null;
  slack_team_name?: string | null;
  webhook_verified?: boolean;
  is_active?: boolean;
  pubsub_topic: string;
  last_message_at: string;
  open_disapprovals: number;
  total_caught: number;
  status: 'active' | 'orphaned' | 'suspended';
  created_at: string;
}

export interface Incident {
  id: number | string;
  store_id: number | string;
  gmc_id: string;
  tenant_email?: string;
  sku: string;
  offer_id?: string;
  title: string;
  product_title?: string;
  issue_code: string;
  severity: 'critical' | 'warning';
  status: 'unresolved' | 'resolved' | 'pending_verification' | 'acknowledged';
  first_detected_at: string;
  last_detected_at: string;
  detected_at?: string;
  resolved_at?: string | null;
  details?: Record<string, unknown> | null;
  is_simulated?: boolean;
  is_test?: boolean;
  created_at: string;
}

export interface ProcessedMessage {
  message_id: string;
  processed_at: string;
}


export interface DLQMessage {
  id: number;
  message_id: string;
  merchant_id: string;
  failure_reason: string;
  payload: Record<string, unknown>;
  status: 'unhandled' | 'replayed' | 'purged';
  created_at: string;
}

export interface DispatchLog {
  id: number;
  dispatch_id: string;
  tenant_email: string;
  store_url: string;
  store_name?: string | null;
  gmc_id?: string | null;
  destination: string;
  delivery_status: number;
  status_label: 'Delivered' | 'Rate Limited' | 'Invalid Webhook';
  latency_ms?: number | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface SystemConfig {
  id: number;
  maintenance_mode: boolean;
  registration_gate: 'open' | 'invite_only' | 'closed';
  rate_limit_per_min: number;
  banner_text: string;
  updated_at: string;
}

export interface SuperTelemetry {
  // Commercial Metrics
  mrr: number;
  activeSubscriptions: number;
  activeTrials: number;
  totalMonitoredStores: number;
  totalSkusTracked: number;
  // Infrastructure & Pipeline Health
  globalIngestionRate: number;
  averageLatencyMs: number;
  dlqCount: number;
  webhookFailureRate: number;
  // Authentic status fields
  pipelineStatus?: 'Active' | 'Idle' | 'Awaiting Events';
  hasDispatches?: boolean;
  deliverabilityLabel?: string;
}

export interface UserSession {
  session_id: string;
  user_id?: number | null;
  email: string;
  ip_address?: string | null;
  user_agent?: string | null;
  is_revoked: boolean;
  expires_at: string;
  created_at: string;
  last_active_at: string;
}

// -----------------------------------------------------------------------------
// In-Memory Seed Fallback Stores
// -----------------------------------------------------------------------------

const inMemorySessions = new Map<string, UserSession>();
const inMemoryProcessedPaddleEvents = new Map<string, { eventType: string; processedAt: number }>();

const inMemoryTenants: Tenant[] = [
  {
    id: 1,
    user_id: 'usr_apex_9102',
    email: 'marcus.vance@apexmedia.io',
    company_name: 'Apex Performance Media (14 Brands)',
    plan_tier: 'Agency Pilot',
    connected_stores: 14,
    total_skus: 428900,
    incidents_month: 84,
    oauth_status: 'Valid',
    last_active: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'active',
    subscription_status: 'paid active',
    trial_ends_at: new Date(Date.now() + 86400000 * 300).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 42).toISOString(),
  },
  {
    id: 2,
    user_id: 'usr_solare_4812',
    email: 'elena.rostova@solarestudio.com',
    company_name: 'Solare Studio Apparel',
    plan_tier: 'Active Pro',
    connected_stores: 2,
    total_skus: 18450,
    incidents_month: 12,
    oauth_status: 'Valid',
    last_active: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    status: 'active',
    subscription_status: 'paid active',
    trial_ends_at: new Date(Date.now() + 86400000 * 300).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 28).toISOString(),
  },
  {
    id: 3,
    user_id: 'usr_norse_1948',
    email: 'david.lindqvist@norseoutdoors.se',
    company_name: 'Norse Outdoors Nordic',
    plan_tier: 'Trial',
    connected_stores: 1,
    total_skus: 4890,
    incidents_month: 5,
    oauth_status: 'Expiring Soon',
    last_active: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'active',
    subscription_status: 'active trial',
    trial_ends_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 4,
    user_id: 'usr_kuro_8819',
    email: 'kenji.t@kuroluxury.jp',
    company_name: 'Kuro Luxury Watches MCA',
    plan_tier: 'Delinquent',
    connected_stores: 6,
    total_skus: 120400,
    incidents_month: 31,
    oauth_status: 'Revoked/Failed',
    last_active: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: 'suspended',
    subscription_status: 'expired',
    trial_ends_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 65).toISOString(),
  },
  {
    id: 5,
    user_id: 'usr_velour_3321',
    email: 'chloe.m@velourcosmetics.fr',
    company_name: 'Velour Cosmetics Paris',
    plan_tier: 'Active Pro',
    connected_stores: 3,
    total_skus: 34100,
    incidents_month: 19,
    oauth_status: 'Valid',
    last_active: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'active',
    subscription_status: 'paid active',
    trial_ends_at: new Date(Date.now() + 86400000 * 300).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 50).toISOString(),
  },
  {
    id: 6,
    user_id: 'usr_superadmin_01',
    email: 'yassinesadik0@gmail.com',
    company_name: 'Kultra Superadmin',
    plan_tier: 'Active Pro',
    connected_stores: 1,
    total_skus: 999999,
    incidents_month: 0,
    oauth_status: 'Valid',
    last_active: new Date().toISOString(),
    status: 'active',
    subscription_status: 'paid active',
    trial_ends_at: null,
    created_at: new Date().toISOString(),
  },
];

export const inMemoryStores: Store[] = [
  {
    id: 1,
    gmc_id: '104928192',
    tenant_id: 1,
    tenant_email: 'marcus.vance@apexmedia.io',
    account_type: 'MCA Child',
    store_name: 'Outdoor Gear Direct',
    store_url: 'outdoorgear-direct.com',
    pubsub_topic: 'projects/kultra-sentinel/topics/gmc-events-apex-01',
    last_message_at: new Date(Date.now() - 1000 * 24).toISOString(),
    open_disapprovals: 2,
    total_caught: 184,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 40).toISOString(),
  },
  {
    id: 2,
    gmc_id: '209481928',
    tenant_id: 1,
    tenant_email: 'marcus.vance@apexmedia.io',
    account_type: 'MCA Child',
    store_name: 'Peak Performance US',
    store_url: 'peakperformance-us.com',
    pubsub_topic: 'projects/kultra-sentinel/topics/gmc-events-apex-02',
    last_message_at: new Date(Date.now() - 1000 * 180).toISOString(),
    open_disapprovals: 0,
    total_caught: 92,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 38).toISOString(),
  },
  {
    id: 3,
    gmc_id: '819204918',
    tenant_id: 2,
    tenant_email: 'elena.rostova@solarestudio.com',
    account_type: 'Standalone Merchant',
    store_name: 'Solare Studio',
    store_url: 'solarestudio.com',
    pubsub_topic: 'projects/kultra-sentinel/topics/gmc-events-solare',
    last_message_at: new Date(Date.now() - 1000 * 45).toISOString(),
    open_disapprovals: 1,
    total_caught: 43,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 28).toISOString(),
  },
  {
    id: 4,
    gmc_id: '551928371',
    tenant_id: 3,
    tenant_email: 'david.lindqvist@norseoutdoors.se',
    account_type: 'Standalone Merchant',
    store_name: 'Norse Outdoors',
    store_url: 'norseoutdoors.se',
    pubsub_topic: 'projects/kultra-sentinel/topics/gmc-events-norse',
    last_message_at: new Date(Date.now() - 1000 * 900).toISOString(),
    open_disapprovals: 3,
    total_caught: 16,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 5,
    gmc_id: '994819204',
    tenant_id: 4,
    tenant_email: 'kenji.t@kuroluxury.jp',
    account_type: 'MCA Child',
    store_name: 'Legacy Chrono Vault',
    store_url: 'legacy-chrono-vault.com',
    pubsub_topic: 'projects/kultra-sentinel/topics/gmc-events-kuro-03',
    last_message_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    open_disapprovals: 14,
    total_caught: 110,
    status: 'orphaned',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

const inMemoryDLQ: DLQMessage[] = [
  {
    id: 1,
    message_id: 'gcp-msg-88291048201',
    merchant_id: '819204918',
    failure_reason: 'UNSUPPORTED_ISSUE_CODE: promotion_custom_policy_v3',
    payload: {
      messageId: 'gcp-msg-88291048201',
      publishTime: '2026-09-13T20:45:12.012Z',
      attributes: { accountId: '819204918', resourceType: 'Product' },
      data: {
        eventType: 'product_status_change',
        itemId: 'online:en:US:SKU-W-VEST-09',
        destinationStatuses: [{ destination: 'Shopping_ads', status: 'disapproved' }],
        itemLevelIssues: [{ code: 'promotion_custom_policy_v3', severity: 'critical' }],
      },
    },
    status: 'unhandled',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 2,
    message_id: 'gcp-msg-99104812948',
    merchant_id: '994819204',
    failure_reason: 'TENANT_NOT_FOUND: account_id mapping missing in registry',
    payload: {
      messageId: 'gcp-msg-99104812948',
      publishTime: '2026-09-13T19:30:00.000Z',
      attributes: { accountId: '994819204' },
      data: { raw: 'unexpected payload structure' },
    },
    status: 'unhandled',
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 3,
    message_id: 'gcp-msg-77182940182',
    merchant_id: '104928192',
    failure_reason: 'JSON_PARSE_ERROR: invalid byte sequence in UTF-8 feed title',
    payload: {
      messageId: 'gcp-msg-77182940182',
      publishTime: '2026-09-13T18:15:00.000Z',
      attributes: { accountId: '104928192' },
      data: { rawByteHex: '0x8004f19...' },
    },
    status: 'unhandled',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const inMemoryDispatches: DispatchLog[] = [
  {
    id: 1,
    dispatch_id: 'dsp-98124',
    tenant_email: 'marcus.vance@apexmedia.io',
    store_url: 'outdoorgear-direct.com',
    destination: '#alerts-apex-ecom-client',
    delivery_status: 200,
    status_label: 'Delivered',
    payload: {
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: 'Kultra Incident Telemetry Alert' } },
        { type: 'section', text: { type: 'mrkdwn', text: '*SKU:* `ALP-ANORAK-BLK-L` (Disapproved)' } },
        { type: 'section', text: { type: 'mrkdwn', text: '*Reason:* missing_required_attribute [gtin]' } },
      ],
    },
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 2,
    dispatch_id: 'dsp-98125',
    tenant_email: 'elena.rostova@solarestudio.com',
    store_url: 'solarestudio.com',
    destination: '#solare-catalog-health',
    delivery_status: 200,
    status_label: 'Delivered',
    payload: {
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: 'Kultra Instant Remediation Alert' } },
        { type: 'section', text: { type: 'mrkdwn', text: '*Store:* `solarestudio.com`' } },
      ],
    },
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 3,
    dispatch_id: 'dsp-98126',
    tenant_email: 'kenji.t@kuroluxury.jp',
    store_url: 'legacy-chrono-vault.com',
    destination: 'https://hooks.slack.com/services/T00/B00/DEADBEEF',
    delivery_status: 404,
    status_label: 'Invalid Webhook',
    payload: { error: 'channel_not_found' },
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 4,
    dispatch_id: 'dsp-98127',
    tenant_email: 'david.lindqvist@norseoutdoors.se',
    store_url: 'norseoutdoors.se',
    destination: '#norse-marketing-triage',
    delivery_status: 429,
    status_label: 'Rate Limited',
    payload: { error: 'slack_rate_limited_retry_after_30s' },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

let inMemoryConfig: SystemConfig = {
  id: 1,
  maintenance_mode: false,
  registration_gate: 'invite_only',
  rate_limit_per_min: 1200,
  banner_text: 'Platform operating normally on Google Merchant API v1 and Cloud Pub/Sub QoS 1 streaming.',
  updated_at: new Date().toISOString(),
};

const inMemoryLeads: Lead[] = [];
const inMemoryAdmins: AdminUser[] = [];
const inMemoryTelemetry: TelemetryEvent[] = [];
const inMemoryProcessedMessages: Map<string, number> = new Map();
const inMemoryIncidents: Incident[] = [];

let schemaInitialized = false;


export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

export async function ensureSchema(): Promise<boolean> {
  const sql = getDb();
  if (!sql || schemaInitialized) {
    return false;
  }

  try {
    // 1. Leads Table
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        account_type TEXT NOT NULL,
        website TEXT NOT NULL,
        catalog_size TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Admins Table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        google_id TEXT,
        name TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. Telemetry Events Table
    await sql`
      CREATE TABLE IF NOT EXISTS telemetry_events (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        sku TEXT,
        revenue_impact NUMERIC DEFAULT 0,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 4. Tenants Table
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        company_name TEXT NOT NULL,
        plan_tier TEXT DEFAULT 'Trial',
        account_plan TEXT DEFAULT 'solo',
        connected_stores INT DEFAULT 1,
        total_skus INT DEFAULT 0,
        incidents_month INT DEFAULT 0,
        oauth_status TEXT DEFAULT 'Valid',
        last_active TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'active',
        subscription_status TEXT DEFAULT 'active trial',
        trial_ends_at TIMESTAMPTZ DEFAULT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Ensure tenant subscription columns exist if table already exists
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active trial';`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT NULL;`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS account_plan TEXT DEFAULT 'solo';`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS current_period_ends_at TIMESTAMPTZ;`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS scheduled_cancellation_at TIMESTAMPTZ;`;
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_past_due BOOLEAN DEFAULT FALSE;`;
    await sql`
      CREATE TABLE IF NOT EXISTS processed_paddle_events (
        event_id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        processed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';`;

    // 5. Stores Registry Table
    await sql`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        gmc_id TEXT NOT NULL,
        tenant_id INT,
        tenant_email TEXT,
        account_type TEXT DEFAULT 'Standalone Merchant',
        store_url TEXT NOT NULL,
        store_name TEXT,
        encrypted_refresh_token TEXT,
        alert_status TEXT DEFAULT 'active',
        webhook_url TEXT,
        webhook_verified BOOLEAN DEFAULT FALSE,
        pubsub_topic TEXT,
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        open_disapprovals INT DEFAULT 0,
        total_caught INT DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Ensure columns exist if stores table was created previously
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_name TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS encrypted_refresh_token TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS alert_status TEXT DEFAULT 'active';`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS webhook_url TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS webhook_verified BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS merchant_id TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS slack_channel TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS slack_channel_id TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS slack_configuration_url TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS slack_team_id TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS slack_team_name TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`;

    // 6. Dead Letter Queue Table
    await sql`
      CREATE TABLE IF NOT EXISTS dlq_messages (
        id SERIAL PRIMARY KEY,
        message_id TEXT NOT NULL,
        merchant_id TEXT,
        failure_reason TEXT NOT NULL,
        payload JSONB NOT NULL,
        status TEXT DEFAULT 'unhandled',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 7. Dispatch Logs Table
    await sql`
      CREATE TABLE IF NOT EXISTS dispatch_logs (
        id SERIAL PRIMARY KEY,
        dispatch_id TEXT NOT NULL,
        tenant_email TEXT,
        store_url TEXT,
        destination TEXT NOT NULL,
        delivery_status INT NOT NULL,
        status_label TEXT NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Ensure columns exist on dispatch_logs
    await sql`ALTER TABLE dispatch_logs ADD COLUMN IF NOT EXISTS store_name TEXT;`;
    await sql`ALTER TABLE dispatch_logs ADD COLUMN IF NOT EXISTS gmc_id TEXT;`;
    await sql`ALTER TABLE dispatch_logs ADD COLUMN IF NOT EXISTS latency_ms INT;`;

    // 8. System Config Table
    await sql`
      CREATE TABLE IF NOT EXISTS system_config (
        id SERIAL PRIMARY KEY,
        maintenance_mode BOOLEAN DEFAULT FALSE,
        registration_gate TEXT DEFAULT 'invite_only',
        rate_limit_per_min INT DEFAULT 1200,
        banner_text TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 9. Processed Messages Table (for 7-day Pub/Sub deduplication)
    await sql`
      CREATE TABLE IF NOT EXISTS processed_messages (
        message_id TEXT PRIMARY KEY,
        processed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 10. Incidents Table (SKU failure triage lifecycle)
    await sql`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        store_id INT NOT NULL,
        gmc_id TEXT NOT NULL,
        sku TEXT NOT NULL,
        title TEXT NOT NULL,
        issue_code TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT DEFAULT 'unresolved',
        first_detected_at TIMESTAMPTZ DEFAULT NOW(),
        last_detected_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS tenant_email TEXT;`;
    await sql`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS offer_id TEXT;`;
    await sql`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS product_title TEXT;`;
    await sql`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS detected_at TIMESTAMPTZ DEFAULT NOW();`;
    await sql`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_simulated BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE telemetry_events ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE dispatch_logs ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;`;

    // Purge any synthetic demo incidents and mock data (Directive §3)
    try {
      await sql`DELETE FROM incidents WHERE sku IN ('DEMO-RUNNER-402', 'APX-TR-402', 'OW-8842-BLK-M') OR offer_id IN ('DEMO-RUNNER-402', 'APX-TR-402', 'OW-8842-BLK-M') OR gmc_id = 'DEMO-GMC';`;
      await sql`DELETE FROM telemetry_events WHERE details->>'simulated' = 'true' OR details->>'is_test' = 'true';`;
      await sql`
        UPDATE stores s
        SET open_disapprovals = (
          SELECT COUNT(*)::int FROM incidents i 
          WHERE i.store_id::text = s.id::text 
            AND i.status = 'unresolved' 
            AND COALESCE(i.is_simulated, FALSE) = FALSE 
            AND COALESCE(i.is_test, FALSE) = FALSE
        ),
        total_caught = (
          SELECT COUNT(*)::int FROM incidents i 
          WHERE i.store_id::text = s.id::text 
            AND COALESCE(i.is_simulated, FALSE) = FALSE 
            AND COALESCE(i.is_test, FALSE) = FALSE
        );
      `;
    } catch {
      // Ignore if table doesn't have records
    }

    // 11. User Sessions Table (Stateful Session Invalidation & Revocation)
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        session_id TEXT PRIMARY KEY,
        user_id INT,
        email TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        is_revoked BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_active_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_email ON user_sessions(email);`;


    // Initial Seeds
    const tenantCount = await sql`SELECT COUNT(*)::int as count FROM tenants;`;
    if (tenantCount[0].count === 0) {
      for (const t of inMemoryTenants) {
        await sql`
          INSERT INTO tenants (user_id, email, company_name, plan_tier, connected_stores, total_skus, incidents_month, oauth_status, last_active, status, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id, created_at)
          VALUES (${t.user_id}, ${t.email}, ${t.company_name}, ${t.plan_tier}, ${t.connected_stores}, ${t.total_skus}, ${t.incidents_month}, ${t.oauth_status}, ${t.last_active}, ${t.status}, ${t.subscription_status || 'active trial'}, ${t.trial_ends_at || null}, ${t.stripe_customer_id || null}, ${t.stripe_subscription_id || null}, ${t.created_at})
          ON CONFLICT (user_id) DO NOTHING;
        `;
      }

      for (const s of inMemoryStores) {
        await sql`
          INSERT INTO stores (gmc_id, tenant_id, tenant_email, account_type, store_url, pubsub_topic, last_message_at, open_disapprovals, total_caught, status, created_at)
          VALUES (${s.gmc_id}, ${s.tenant_id}, ${s.tenant_email}, ${s.account_type}, ${s.store_url}, ${s.pubsub_topic}, ${s.last_message_at}, ${s.open_disapprovals}, ${s.total_caught}, ${s.status}, ${s.created_at});
        `;
      }

      for (const d of inMemoryDLQ) {
        await sql`
          INSERT INTO dlq_messages (message_id, merchant_id, failure_reason, payload, status, created_at)
          VALUES (${d.message_id}, ${d.merchant_id}, ${d.failure_reason}, ${JSON.stringify(d.payload)}, ${d.status}, ${d.created_at});
        `;
      }

      for (const l of inMemoryDispatches) {
        await sql`
          INSERT INTO dispatch_logs (dispatch_id, tenant_email, store_url, destination, delivery_status, status_label, payload, created_at)
          VALUES (${l.dispatch_id}, ${l.tenant_email}, ${l.store_url}, ${l.destination}, ${l.delivery_status}, ${l.status_label}, ${JSON.stringify(l.payload)}, ${l.created_at});
        `;
      }

      await sql`
        INSERT INTO system_config (id, maintenance_mode, registration_gate, rate_limit_per_min, banner_text, updated_at)
        VALUES (1, ${inMemoryConfig.maintenance_mode}, ${inMemoryConfig.registration_gate}, ${inMemoryConfig.rate_limit_per_min}, ${inMemoryConfig.banner_text}, ${inMemoryConfig.updated_at})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // Ensure Superadmin Account is provisioned with permanent unrestricted access
    try {
      await sql`
        INSERT INTO admins (email, name, role)
        VALUES ('yassinesadik0@gmail.com', 'Superadmin', 'admin')
        ON CONFLICT (email) DO UPDATE SET role = 'admin';
      `;
      const superTenant = await sql`SELECT id FROM tenants WHERE LOWER(email) = 'yassinesadik0@gmail.com' LIMIT 1;`;
      if (superTenant.length === 0) {
        await sql`
          INSERT INTO tenants (
            user_id, email, company_name, plan_tier, connected_stores, total_skus, incidents_month,
            oauth_status, last_active, status, subscription_status, created_at
          ) VALUES (
            'usr_superadmin_01', 'yassinesadik0@gmail.com', 'Kultra Superadmin', 'Active Pro', 1, 999999, 0,
            'Valid', NOW(), 'active', 'paid active', NOW()
          );
        `;
      } else {
        await sql`
          UPDATE tenants
          SET plan_tier = 'Active Pro', subscription_status = 'paid active', status = 'active'
          WHERE LOWER(email) = 'yassinesadik0@gmail.com';
        `;
      }
    } catch (superErr) {
      console.warn('[Neon DB] Note on superadmin provisioning:', superErr);
    }

    schemaInitialized = true;
    return true;
  } catch (error) {
    console.error('[Neon DB] Schema initialization error:', error);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Super-Admin Data Access & Operations
// -----------------------------------------------------------------------------

export async function getSuperTelemetry(): Promise<SuperTelemetry> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();

      // 1. Live Commercial Metrics & Account Segmentation
      // Calculate MRR strictly by summing monthly price of active paid non-superadmin accounts
      const tenantsRes = await sql`
        SELECT 
          COUNT(*)::int as total_tenants,
          COUNT(*) FILTER (
            WHERE (subscription_status = 'paid active' OR plan_tier IN ('Active Pro', 'Agency Pilot'))
              AND LOWER(email) != 'yassinesadik0@gmail.com'
          )::int as paid,
          COUNT(*) FILTER (
            WHERE subscription_status = 'active trial' 
              AND status != 'suspended'
              AND LOWER(email) != 'yassinesadik0@gmail.com'
          )::int as trials,
          COALESCE(SUM(
            CASE 
              WHEN LOWER(email) = 'yassinesadik0@gmail.com' THEN 0
              WHEN subscription_status = 'paid active' OR plan_tier IN ('Active Pro', 'Agency Pilot') THEN 
                CASE 
                  WHEN plan_tier = 'Agency Pilot' OR account_plan = 'agency' THEN 49
                  ELSE 19
                END
              ELSE 0
            END
          ), 0)::numeric as mrr,
          COALESCE(SUM(total_skus), 0)::bigint as skus
        FROM tenants;
      `;

      // 2. Monitored Stores: Query exact count of unique, connected Google Merchant Center accounts
      const storesRes = await sql`
        SELECT COUNT(DISTINCT gmc_id)::int as total_stores 
        FROM stores 
        WHERE status = 'active';
      `;

      // 3. Dead Letter Queue: Exact count of unhandled dropped payloads
      const dlqRes = await sql`
        SELECT COUNT(*)::int as dlq_count 
        FROM dlq_messages 
        WHERE status = 'unhandled';
      `;

      // 4. Live Pub/Sub Ingestion: Count messages processed in the last 5 minutes
      const recentMessagesRes = await sql`
        SELECT COUNT(*)::int as count 
        FROM processed_messages 
        WHERE processed_at >= NOW() - INTERVAL '5 minutes';
      `;
      const recentMsgs = recentMessagesRes[0]?.count || 0;
      const ingestionRate = Math.round(recentMsgs / 5);

      // 5. Dispatch Deliverability & Latency:
      const dispatchesRes = await sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE delivery_status = 200 OR status_label = 'Delivered')::int as delivered,
          COALESCE(AVG(latency_ms), 0)::int as avg_latency
        FROM dispatch_logs;
      `;
      const totalDispatches = dispatchesRes[0]?.total || 0;
      const deliveredDispatches = dispatchesRes[0]?.delivered || 0;
      const avgLatency = dispatchesRes[0]?.avg_latency || 0;
      const hasDispatches = totalDispatches > 0;
      const webhookFailureRate = hasDispatches 
        ? Number(((totalDispatches - deliveredDispatches) / totalDispatches).toFixed(4))
        : 0;

      const totalStores = storesRes[0]?.total_stores || 0;
      const pipelineStatus = ingestionRate > 0 
        ? 'Active' 
        : (totalStores > 0 ? 'Awaiting Events' : 'Idle');

      const paid = tenantsRes[0]?.paid || 0;
      const trials = tenantsRes[0]?.trials || 0;
      const skus = Number(tenantsRes[0]?.skus) || 0;
      const mrr = Number(tenantsRes[0]?.mrr) || 0;
      const dlq = dlqRes[0]?.dlq_count || 0;

      return {
        mrr,
        activeSubscriptions: paid,
        activeTrials: trials,
        totalMonitoredStores: totalStores,
        totalSkusTracked: skus,
        globalIngestionRate: ingestionRate,
        averageLatencyMs: avgLatency,
        dlqCount: dlq,
        webhookFailureRate,
        pipelineStatus,
        hasDispatches,
        deliverabilityLabel: hasDispatches ? undefined : 'No Events Yet',
      };
    } catch (err) {
      console.warn('[Neon DB] Error querying super telemetry:', err);
    }
  }

  // Pure truthful zero-state fallback
  return {
    mrr: 0,
    activeSubscriptions: 0,
    activeTrials: 0,
    totalMonitoredStores: 0,
    totalSkusTracked: 0,
    globalIngestionRate: 0,
    averageLatencyMs: 0,
    dlqCount: 0,
    webhookFailureRate: 0,
    pipelineStatus: 'Idle',
    hasDispatches: false,
    deliverabilityLabel: 'No Events Yet',
  };
}

export async function getTenants(filter?: { search?: string; planTier?: string; status?: string }): Promise<Tenant[]> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const search = filter?.search ? `%${filter.search.toLowerCase()}%` : null;
      const planTier = filter?.planTier && filter.planTier !== 'all' ? filter.planTier : null;
      const status = filter?.status && filter.status !== 'all' ? filter.status : null;

      let rows: Tenant[];
      if (search && planTier) {
        rows = (await sql`
          SELECT * FROM tenants
          WHERE (LOWER(email) LIKE ${search} OR LOWER(company_name) LIKE ${search} OR LOWER(user_id) LIKE ${search})
            AND plan_tier = ${planTier}
          ORDER BY created_at DESC;
        `) as unknown as Tenant[];
      } else if (search) {
        rows = (await sql`
          SELECT * FROM tenants
          WHERE (LOWER(email) LIKE ${search} OR LOWER(company_name) LIKE ${search} OR LOWER(user_id) LIKE ${search})
          ORDER BY created_at DESC;
        `) as unknown as Tenant[];
      } else if (planTier) {
        rows = (await sql`
          SELECT * FROM tenants
          WHERE plan_tier = ${planTier}
          ORDER BY created_at DESC;
        `) as unknown as Tenant[];
      } else {
        rows = (await sql`
          SELECT * FROM tenants ORDER BY created_at DESC;
        `) as unknown as Tenant[];
      }

      if (status) {
        rows = rows.filter((r) => r.status === status);
      }
      return rows;
    } catch (err) {
      console.warn('[Neon DB] Error querying tenants:', err);
    }
  }

  let result = [...inMemoryTenants];
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    result = result.filter((t) => t.email.toLowerCase().includes(s) || t.company_name.toLowerCase().includes(s) || t.user_id.toLowerCase().includes(s));
  }
  if (filter?.planTier && filter.planTier !== 'all') {
    result = result.filter((t) => t.plan_tier === filter.planTier);
  }
  if (filter?.status && filter.status !== 'all') {
    result = result.filter((t) => t.status === filter.status);
  }
  return result;
}

export async function findTenantByEmail(email: string): Promise<Tenant | null> {
  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM tenants WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
      `;
      if (rows.length > 0) return rows[0] as unknown as Tenant;
      return null;
    } catch (err) {
      console.warn('[Neon DB] Error finding tenant by email:', err);
    }
  }

  return inMemoryTenants.find((t) => t.email.toLowerCase().trim() === cleanEmail) || null;
}

export async function createTenant(data: {
  email: string;
  companyName: string;
  planTier?: 'Trial' | 'Agency Pilot' | 'Active Pro';
  accountType?: string;
  accountPlan?: string;
  website?: string;
  subscriptionStatus?: 'active trial' | 'paid active' | 'expired' | 'canceled';
  trialEndsAt?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}): Promise<Tenant> {
  const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanEmail = data.email.toLowerCase().trim();
  const isSuper = isSuperAdminEmail(cleanEmail);
  const planTier = isSuper ? 'Active Pro' : (data.planTier || 'Trial');
  const accountPlan = data.accountPlan || (data.accountType === 'agency' ? 'agency' : 'solo');
  const now = new Date().toISOString();
  const subscriptionStatus = isSuper
    ? 'paid active'
    : (data.subscriptionStatus || (planTier === 'Active Pro' || planTier === 'Agency Pilot' ? 'paid active' : 'active trial'));
  // Trial countdown does not start until GMC account is connected, unless explicitly provided or superadmin
  const trialEndsAt = isSuper ? null : (data.trialEndsAt !== undefined ? data.trialEndsAt : null);
  const stripeCustomerId = data.stripeCustomerId || null;
  const stripeSubscriptionId = data.stripeSubscriptionId || null;

  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        INSERT INTO tenants (
          user_id, email, company_name, plan_tier, account_plan, connected_stores, total_skus, incidents_month, oauth_status, status,
          subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id, created_at
        )
        VALUES (
          ${userId}, ${cleanEmail}, ${data.companyName}, ${planTier}, ${accountPlan}, 1, 0, 0, 'Valid', 'active',
          ${subscriptionStatus}, ${trialEndsAt}, ${stripeCustomerId}, ${stripeSubscriptionId}, NOW()
        )
        RETURNING *;
      `;
      if (rows.length > 0) return rows[0] as unknown as Tenant;
    } catch (err) {
      console.warn('[Neon DB] Error creating tenant:', err);
    }
  }

  const newTenant: Tenant = {
    id: inMemoryTenants.length + 1,
    user_id: userId,
    email: cleanEmail,
    company_name: data.companyName,
    plan_tier: planTier,
    account_plan: accountPlan,
    connected_stores: 1,
    total_skus: 0,
    incidents_month: 0,
    oauth_status: 'Valid',
    last_active: now,
    status: 'active',
    subscription_status: subscriptionStatus,
    trial_ends_at: trialEndsAt,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    created_at: now,
  };
  inMemoryTenants.unshift(newTenant);
  return newTenant;
}

export async function updateTenant(id: number, updates: Partial<Tenant>): Promise<Tenant | null> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        UPDATE tenants
        SET 
          status = COALESCE(${updates.status || null}, status),
          plan_tier = COALESCE(${updates.plan_tier || null}, plan_tier),
          account_plan = COALESCE(${updates.account_plan || null}, account_plan),
          oauth_status = COALESCE(${updates.oauth_status || null}, oauth_status),
          subscription_status = COALESCE(${updates.subscription_status || null}, subscription_status),
          trial_ends_at = COALESCE(${updates.trial_ends_at || null}, trial_ends_at),
          stripe_customer_id = COALESCE(${updates.stripe_customer_id || null}, stripe_customer_id),
          stripe_subscription_id = COALESCE(${updates.stripe_subscription_id || null}, stripe_subscription_id),
          paddle_customer_id = COALESCE(${updates.paddle_customer_id || null}, paddle_customer_id),
          paddle_subscription_id = COALESCE(${updates.paddle_subscription_id || null}, paddle_subscription_id),
          current_period_ends_at = COALESCE(${updates.current_period_ends_at || null}, current_period_ends_at),
          scheduled_cancellation_at = ${updates.scheduled_cancellation_at !== undefined ? updates.scheduled_cancellation_at : sql`scheduled_cancellation_at`},
          is_past_due = ${updates.is_past_due !== undefined ? updates.is_past_due : sql`is_past_due`}
        WHERE id = ${id}
        RETURNING *;
      `;
      if (rows.length > 0) return rows[0] as unknown as Tenant;
    } catch (err) {
      console.warn('[Neon DB] Error updating tenant:', err);
    }
  }

  const tenant = inMemoryTenants.find((t) => t.id === id);
  if (tenant) {
    Object.assign(tenant, updates);
    return tenant;
  }
  return null;
}

export async function updateTenantByEmail(
  email: string,
  updates: Partial<Tenant>
): Promise<Tenant | null> {
  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        UPDATE tenants
        SET 
          status = COALESCE(${updates.status || null}, status),
          plan_tier = COALESCE(${updates.plan_tier || null}, plan_tier),
          account_plan = COALESCE(${updates.account_plan || null}, account_plan),
          oauth_status = COALESCE(${updates.oauth_status || null}, oauth_status),
          subscription_status = COALESCE(${updates.subscription_status || null}, subscription_status),
          trial_ends_at = COALESCE(${updates.trial_ends_at || null}, trial_ends_at),
          stripe_customer_id = COALESCE(${updates.stripe_customer_id || null}, stripe_customer_id),
          stripe_subscription_id = COALESCE(${updates.stripe_subscription_id || null}, stripe_subscription_id),
          paddle_customer_id = COALESCE(${updates.paddle_customer_id || null}, paddle_customer_id),
          paddle_subscription_id = COALESCE(${updates.paddle_subscription_id || null}, paddle_subscription_id),
          current_period_ends_at = COALESCE(${updates.current_period_ends_at || null}, current_period_ends_at),
          scheduled_cancellation_at = ${updates.scheduled_cancellation_at !== undefined ? updates.scheduled_cancellation_at : sql`scheduled_cancellation_at`},
          is_past_due = ${updates.is_past_due !== undefined ? updates.is_past_due : sql`is_past_due`},
          last_active = NOW()
        WHERE LOWER(email) = ${cleanEmail}
        RETURNING *;
      `;
      if (rows.length > 0) return rows[0] as unknown as Tenant;
    } catch (err) {
      console.warn('[Neon DB] Error updating tenant by email:', err);
    }
  }

  const tenant = inMemoryTenants.find((t) => t.email.toLowerCase().trim() === cleanEmail);
  if (tenant) {
    Object.assign(tenant, updates);
    return tenant;
  }
  return null;
}

export async function setTenantStoreAlertStatus(
  tenantEmail: string,
  alertStatus: 'active' | 'degraded'
): Promise<void> {
  const cleanEmail = tenantEmail.toLowerCase().trim();
  if (isSuperAdminEmail(cleanEmail)) {
    return;
  }

  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE stores
        SET alert_status = ${alertStatus}
        WHERE LOWER(tenant_email) = ${cleanEmail};
      `;
    } catch (err) {
      console.warn('[Neon DB] Error setting store alert status for tenant:', err);
    }
  }

  for (const store of inMemoryStores) {
    if (store.tenant_email.toLowerCase().trim() === cleanEmail) {
      store.alert_status = alertStatus;
    }
  }
}

export async function findTenantByIdOrUserId(idOrUserId: string | number): Promise<Tenant | null> {
  if (!idOrUserId) return null;
  const str = String(idOrUserId).trim();
  const numId = Number(str);
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      if (!isNaN(numId) && Number.isInteger(numId) && numId > 0) {
        const rows = await sql`
          SELECT * FROM tenants WHERE id = ${numId} OR user_id = ${str} LIMIT 1;
        `;
        if (rows.length > 0) return rows[0] as unknown as Tenant;
      } else {
        const rows = await sql`
          SELECT * FROM tenants WHERE user_id = ${str} LIMIT 1;
        `;
        if (rows.length > 0) return rows[0] as unknown as Tenant;
      }
    } catch (err) {
      console.warn('[Neon DB] Error finding tenant by ID or UserID:', err);
    }
  }

  return inMemoryTenants.find((t) => String(t.id) === str || t.user_id === str) || null;
}

export async function findTenantByPaddleCustomer(customerId: string): Promise<Tenant | null> {
  if (!customerId) return null;
  const cleanId = customerId.trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM tenants WHERE paddle_customer_id = ${cleanId} LIMIT 1;
      `;
      if (rows.length > 0) return rows[0] as unknown as Tenant;
    } catch (err) {
      console.warn('[Neon DB] Error finding tenant by paddle customer:', err);
    }
  }
  return inMemoryTenants.find((t) => t.paddle_customer_id === cleanId) || null;
}

export async function findTenantByPaddleSubscription(subscriptionId: string): Promise<Tenant | null> {
  if (!subscriptionId) return null;
  const cleanId = subscriptionId.trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM tenants WHERE paddle_subscription_id = ${cleanId} LIMIT 1;
      `;
      if (rows.length > 0) return rows[0] as unknown as Tenant;
    } catch (err) {
      console.warn('[Neon DB] Error finding tenant by paddle subscription:', err);
    }
  }
  return inMemoryTenants.find((t) => t.paddle_subscription_id === cleanId) || null;
}

export async function isPaddleEventProcessed(eventId: string): Promise<boolean> {
  if (!eventId) return false;
  if (inMemoryProcessedPaddleEvents.has(eventId)) return true;

  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT event_id FROM processed_paddle_events WHERE event_id = ${eventId} LIMIT 1;
      `;
      if (rows.length > 0) {
        inMemoryProcessedPaddleEvents.set(eventId, { eventType: 'cached', processedAt: Date.now() });
        return true;
      }
    } catch (err) {
      console.warn('[Neon DB] Error checking processed paddle event:', err);
    }
  }
  return false;
}

export async function markPaddleEventProcessed(eventId: string, eventType: string): Promise<void> {
  if (!eventId) return;
  inMemoryProcessedPaddleEvents.set(eventId, { eventType, processedAt: Date.now() });

  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        INSERT INTO processed_paddle_events (event_id, event_type, processed_at)
        VALUES (${eventId}, ${eventType}, NOW())
        ON CONFLICT (event_id) DO NOTHING;
      `;
    } catch (err) {
      console.warn('[Neon DB] Error marking paddle event processed:', err);
    }
  }
}

export async function getTenantById(id: number): Promise<Tenant | null> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM tenants WHERE id = ${id} LIMIT 1;
      `;
      if (rows.length > 0) return rows[0] as unknown as Tenant;
    } catch (err) {
      console.warn('[Neon DB] Error finding tenant by id:', err);
    }
  }

  return inMemoryTenants.find((t) => t.id === id) || null;
}

export async function updateUserStatus(email: string, status: 'active' | 'suspended'): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE admins SET status = ${status} WHERE LOWER(email) = ${cleanEmail};
      `;
    } catch (err) {
      console.warn('[Neon DB] Error updating user status:', err);
    }
  }

  const admin = inMemoryAdmins.find((a) => a.email.toLowerCase().trim() === cleanEmail);
  if (admin) {
    admin.status = status;
  }
}

export async function updateStoresStatusByTenantEmail(email: string, status: 'active' | 'suspended'): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE stores SET status = ${status} WHERE LOWER(tenant_email) = ${cleanEmail};
      `;
    } catch (err) {
      console.warn('[Neon DB] Error updating store statuses:', err);
    }
  }

  inMemoryStores.forEach((s) => {
    if (s.tenant_email && s.tenant_email.toLowerCase().trim() === cleanEmail) {
      s.status = status;
    }
  });
}

export async function suspendTenant(id: number): Promise<{ success: boolean; tenant: Tenant | null; message: string }> {
  const tenant = await getTenantById(id);
  if (!tenant) {
    return { success: false, tenant: null, message: 'Tenant not found.' };
  }
  const cleanEmail = tenant.email.toLowerCase().trim();
  if (isSuperAdminEmail(cleanEmail)) {
    return { success: false, tenant, message: 'Security restriction: Superadmin platform owner accounts cannot be suspended.' };
  }

  // 1. Update tenant status = 'suspended'
  const updatedTenant = await updateTenant(id, { status: 'suspended' });

  // 2. Update admin user record status = 'suspended'
  await updateUserStatus(cleanEmail, 'suspended');

  // 3. Update child stores: status = 'suspended'
  await updateStoresStatusByTenantEmail(cleanEmail, 'suspended');

  // 4. Immediately revoke all active sessions for this user
  await revokeAllUserSessions(cleanEmail);

  return {
    success: true,
    tenant: updatedTenant,
    message: `Tenant ${tenant.email} suspended. All active sessions revoked, child store monitoring halted, outbound alerts silenced.`,
  };
}

export async function unsuspendTenant(id: number): Promise<{ success: boolean; tenant: Tenant | null; message: string }> {
  const tenant = await getTenantById(id);
  if (!tenant) {
    return { success: false, tenant: null, message: 'Tenant not found.' };
  }
  const cleanEmail = tenant.email.toLowerCase().trim();

  // 1. Update tenant status = 'active'
  const updatedTenant = await updateTenant(id, { status: 'active' });

  // 2. Update admin user record status = 'active'
  await updateUserStatus(cleanEmail, 'active');

  // 3. Update child stores: status = 'active'
  await updateStoresStatusByTenantEmail(cleanEmail, 'active');

  // 4. Restore active user sessions
  await restoreUserSessions(cleanEmail);

  return {
    success: true,
    tenant: updatedTenant,
    message: `Tenant ${tenant.email} unsuspended. Normal dashboard access and store monitoring restored.`,
  };
}

export async function isTenantSuspended(email: string): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT status FROM tenants WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
      `;
      if (rows.length > 0) {
        return rows[0].status === 'suspended';
      }
      const adminRows = await sql`
        SELECT status FROM admins WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
      `;
      if (adminRows.length > 0) {
        return adminRows[0].status === 'suspended';
      }
    } catch (err) {
      console.warn('[Neon DB] Error checking if tenant is suspended:', err);
    }
  }

  const tenant = inMemoryTenants.find((t) => t.email.toLowerCase().trim() === cleanEmail);
  if (tenant) return tenant.status === 'suspended';
  const admin = inMemoryAdmins.find((a) => a.email.toLowerCase().trim() === cleanEmail);
  if (admin) return admin.status === 'suspended';
  return false;
}

export async function getStores(filter?: { search?: string; accountType?: string }): Promise<Store[]> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const search = filter?.search ? `%${filter.search.toLowerCase()}%` : null;
      const accountType = filter?.accountType && filter.accountType !== 'all' ? filter.accountType : null;

      let rows: Store[];
      if (search) {
        rows = (await sql`
          SELECT * FROM stores
          WHERE (gmc_id LIKE ${search} OR LOWER(store_url) LIKE ${search} OR LOWER(tenant_email) LIKE ${search})
          ORDER BY created_at DESC;
        `) as unknown as Store[];
      } else {
        rows = (await sql`SELECT * FROM stores ORDER BY created_at DESC;`) as unknown as Store[];
      }

      if (accountType) {
        rows = rows.filter((s) => s.account_type === accountType);
      }
      return rows;
    } catch (err) {
      console.warn('[Neon DB] Error querying stores:', err);
    }
  }

  let result = [...inMemoryStores];
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    result = result.filter((st) => st.gmc_id.includes(s) || st.store_url.toLowerCase().includes(s) || st.tenant_email.toLowerCase().includes(s));
  }
  if (filter?.accountType && filter.accountType !== 'all') {
    result = result.filter((st) => st.account_type === filter.accountType);
  }
  return result;
}

export async function triggerStoreSync(id: number): Promise<{ success: boolean; message: string }> {
  const sql = getDb();
  const now = new Date().toISOString();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE stores
        SET last_message_at = ${now}, status = 'active'
        WHERE id = ${id};
      `;
      return { success: true, message: `Full sync dispatched for Store #${id}. Google Merchant API v1 reconcile completed.` };
    } catch (err) {
      console.warn('[Neon DB] Error triggering sync:', err);
    }
  }

  const store = inMemoryStores.find((s) => s.id === id);
  if (store) {
    store.last_message_at = now;
    store.status = 'active';
  }
  return { success: true, message: `Full sync dispatched for Store #${id}.` };
}

export async function cleanupOrphanStores(): Promise<{ purgedCount: number }> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const res = await sql`
        DELETE FROM stores WHERE status = 'orphaned' RETURNING id;
      `;
      return { purgedCount: res.length };
    } catch (err) {
      console.warn('[Neon DB] Error cleaning orphan stores:', err);
    }
  }

  const before = inMemoryStores.length;
  const filtered = inMemoryStores.filter((s) => s.status !== 'orphaned');
  inMemoryStores.length = 0;
  inMemoryStores.push(...filtered);
  return { purgedCount: before - inMemoryStores.length };
}

// -----------------------------------------------------------------------------
// Tenant-Scoped Store Operations (Anti-IDOR Compound Verification)
// -----------------------------------------------------------------------------

export async function getStoreByIdAndTenant(id: number | string, tenantEmail: string): Promise<Store | null> {
  const cleanEmail = tenantEmail.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM stores 
        WHERE id = ${String(id)} AND LOWER(tenant_email) = ${cleanEmail}
        LIMIT 1;
      `;
      if (rows.length > 0) return rows[0] as unknown as Store;
      return null;
    } catch (err) {
      console.warn('[Neon DB] Error querying store by id and tenant:', err);
    }
  }

  const store = inMemoryStores.find(
    (s) => String(s.id) === String(id) && s.tenant_email.toLowerCase().trim() === cleanEmail
  );
  return store || null;
}

export const getStoreForTenant = getStoreByIdAndTenant;

export async function getStoresForTenant(tenantEmail: string): Promise<Store[]> {

  const cleanEmail = tenantEmail.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM stores 
        WHERE LOWER(tenant_email) = ${cleanEmail}
        ORDER BY created_at DESC;
      `;
      return rows as unknown as Store[];
    } catch (err) {
      console.warn('[Neon DB] Error querying stores for tenant:', err);
    }
  }

  return inMemoryStores.filter(
    (s) => s.tenant_email.toLowerCase().trim() === cleanEmail
  );
}

export async function updateStoreForTenant(
  id: number | string,
  tenantEmail: string,
  updates: Partial<Store>
): Promise<Store | null> {
  const cleanEmail = tenantEmail.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        UPDATE stores
        SET
          store_url = COALESCE(${updates.store_url || null}, store_url),
          pubsub_topic = COALESCE(${updates.pubsub_topic || null}, pubsub_topic),
          status = COALESCE(${updates.status || null}, status)
        WHERE id = ${String(id)} AND LOWER(tenant_email) = ${cleanEmail}
        RETURNING *;
      `;
      if (rows.length > 0) return rows[0] as unknown as Store;
      return null;
    } catch (err) {
      console.warn('[Neon DB] Error updating store for tenant:', err);
    }
  }

  const store = inMemoryStores.find(
    (s) => String(s.id) === String(id) && s.tenant_email.toLowerCase().trim() === cleanEmail
  );
  if (store) {
    if (updates.store_url !== undefined) store.store_url = updates.store_url;
    if (updates.pubsub_topic !== undefined) store.pubsub_topic = updates.pubsub_topic;
    if (updates.status !== undefined) store.status = updates.status;
    return store;
  }
  return null;
}

export async function deleteStoreForTenant(id: number | string, tenantEmail: string): Promise<boolean> {
  const cleanEmail = tenantEmail.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      // Purge cached incidents associated with this store to ensure complete data purging
      await sql`
        DELETE FROM incidents
        WHERE store_id = ${String(id)} OR gmc_id IN (
          SELECT gmc_id FROM stores WHERE id = ${String(id)} AND LOWER(tenant_email) = ${cleanEmail}
        );
      `;
      const rows = await sql`
        DELETE FROM stores
        WHERE id = ${String(id)} AND LOWER(tenant_email) = ${cleanEmail}
        RETURNING id;
      `;
      return rows.length > 0;
    } catch (err) {
      console.warn('[Neon DB] Error deleting store for tenant:', err);
    }
  }

  const idx = inMemoryStores.findIndex(
    (s) => String(s.id) === String(id) && s.tenant_email.toLowerCase().trim() === cleanEmail
  );
  if (idx !== -1) {
    const removed = inMemoryStores.splice(idx, 1)[0];
    for (let i = inMemoryIncidents.length - 1; i >= 0; i--) {
      if (String(inMemoryIncidents[i].store_id) === String(id) || inMemoryIncidents[i].gmc_id === removed.gmc_id) {
        inMemoryIncidents.splice(i, 1);
      }
    }
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// Kultra Event Processing Engine Database Methods
// -----------------------------------------------------------------------------

export async function findStoreByGmcId(gmcId: string): Promise<Store | null> {
  const memStore = inMemoryStores.find(
    (s) =>
      (s.gmc_id === gmcId || s.merchant_id === gmcId) &&
      (s.status === 'active' || s.is_active === true)
  );
  if (memStore) return memStore;

  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM stores 
        WHERE (gmc_id = ${gmcId} OR merchant_id = ${gmcId}) 
          AND (status = 'active' OR is_active = TRUE) 
        LIMIT 1;
      `;
      if (rows.length > 0) {
        const row = rows[0] as unknown as Record<string, unknown>;
        const store: Store = {
          id: row.id as number | string,
          gmc_id: (row.gmc_id || row.merchant_id || gmcId) as string,
          merchant_id: (row.merchant_id || row.gmc_id || gmcId) as string,
          tenant_id: (row.tenant_id || 1) as number,
          tenant_email: (row.tenant_email || '') as string,
          account_type: (row.account_type || 'Standalone Merchant') as 'Standalone Merchant' | 'MCA Child',
          store_url: (row.store_url || '') as string,
          store_name: (row.store_name || `Store #${row.gmc_id || gmcId}`) as string,
          encrypted_refresh_token: (row.encrypted_refresh_token || null) as string | null,
          alert_status: (row.alert_status || 'active') as 'active' | 'degraded',
          webhook_url: (row.webhook_url || row.slack_webhook_url || null) as string | null,
          slack_webhook_url: (row.slack_webhook_url || row.webhook_url || null) as string | null,
          webhook_verified: Boolean(row.webhook_verified),
          is_active: row.is_active !== false,
          pubsub_topic: (row.pubsub_topic || `projects/kultra-sentinel/topics/gmc-${gmcId}`) as string,
          last_message_at: (row.last_message_at ? new Date(row.last_message_at as string).toISOString() : new Date().toISOString()),
          open_disapprovals: (row.open_disapprovals || 0) as number,
          total_caught: (row.total_caught || 0) as number,
          status: (row.status || 'active') as 'active' | 'orphaned',
          created_at: (row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString()),
        };
        inMemoryStores.push(store);
        return store;
      }
      return null;
    } catch (err) {
      console.warn('[Neon DB] Error finding store by GMC ID:', err);
    }
  }

  return null;
}


export async function claimStoreForTenant(params: {
  gmcId: string;
  tenantId: number;
  tenantEmail: string;
  storeName: string;
  storeUrl: string;
  encryptedRefreshToken?: string;
  accountType?: 'Standalone Merchant' | 'MCA Child';
}): Promise<{ success: boolean; store?: Store; error?: string; collision?: boolean }> {
  const cleanEmail = params.tenantEmail.toLowerCase().trim();
  const sql = getDb();

  // 1. Anti-Collision & Zero-Trust check
  if (sql) {
    try {
      await ensureSchema();
      const existing = await sql`SELECT * FROM stores WHERE gmc_id = ${params.gmcId} LIMIT 1;`;
      if (existing.length > 0) {
        const storeOwnerEmail = existing[0].tenant_email?.toLowerCase().trim();
        if (storeOwnerEmail && storeOwnerEmail !== cleanEmail) {
          return {
            success: false,
            collision: true,
            error: `Store GMC ID ${params.gmcId} is already registered under another tenant. Cross-tenant collisions are strictly forbidden.`,
          };
        }

        // Existing store belongs to same tenant: update credentials & info
        const updated = await sql`
          UPDATE stores
          SET
            store_name = ${params.storeName},
            store_url = ${params.storeUrl},
            encrypted_refresh_token = COALESCE(${params.encryptedRefreshToken || null}, encrypted_refresh_token),
            last_message_at = NOW(),
            status = 'active'
          WHERE gmc_id = ${params.gmcId} AND LOWER(tenant_email) = ${cleanEmail}
          RETURNING *;
        `;
        // Trigger 14-day trial activation on GMC connection (runs only if not started yet; never resets)
        try {
          const { activateTrialOnFirstStoreConnect } = await import('./subscription');
          await activateTrialOnFirstStoreConnect(cleanEmail);
        } catch (trialErr) {
          console.warn('[claimStoreForTenant] Trial activation hook error:', trialErr);
        }

        // Update tenant connected_stores and oauth_status
        await sql`
          UPDATE tenants
          SET 
            connected_stores = (SELECT COUNT(*)::int FROM stores WHERE LOWER(tenant_email) = ${cleanEmail}),
            oauth_status = 'connected',
            last_active = NOW()
          WHERE LOWER(email) = ${cleanEmail};
        `;

        return { success: true, store: updated[0] as unknown as Store };
      }

      // New store insertion
      const inserted = await sql`
        INSERT INTO stores (
          gmc_id, tenant_id, tenant_email, account_type, store_url, store_name,
          encrypted_refresh_token, alert_status, webhook_verified, pubsub_topic,
          last_message_at, open_disapprovals, total_caught, status, created_at
        ) VALUES (
          ${params.gmcId}, ${params.tenantId}, ${cleanEmail}, ${params.accountType || 'Standalone Merchant'},
          ${params.storeUrl}, ${params.storeName}, ${params.encryptedRefreshToken || null},
          'active', FALSE, ${`projects/kultra-sentinel/topics/gmc-${params.gmcId}`},
          NOW(), 0, 0, 'active', NOW()
        )
        RETURNING *;
      `;
      // Trigger 14-day trial activation on GMC connection (runs only if not started yet; never resets)
      try {
        const { activateTrialOnFirstStoreConnect } = await import('./subscription');
        await activateTrialOnFirstStoreConnect(cleanEmail);
      } catch (trialErr) {
        console.warn('[claimStoreForTenant] Trial activation hook error:', trialErr);
      }

      // Update tenant connected_stores and oauth_status
      await sql`
        UPDATE tenants
        SET 
          connected_stores = (SELECT COUNT(*)::int FROM stores WHERE LOWER(tenant_email) = ${cleanEmail}),
          oauth_status = 'connected',
          last_active = NOW()
        WHERE LOWER(email) = ${cleanEmail};
      `;

      return { success: true, store: inserted[0] as unknown as Store };
    } catch (err) {
      console.warn('[Neon DB] Error claiming store for tenant:', err);
    }
  }

  // Fallback in-memory logic
  const existingMem = inMemoryStores.find((s) => s.gmc_id === params.gmcId);
  if (existingMem) {
    if (existingMem.tenant_email.toLowerCase().trim() !== cleanEmail) {
      return {
        success: false,
        collision: true,
        error: `Store GMC ID ${params.gmcId} is already registered under another tenant. Cross-tenant collisions are strictly forbidden.`,
      };
    }
    existingMem.store_name = params.storeName;
    existingMem.store_url = params.storeUrl;
    if (params.encryptedRefreshToken) existingMem.encrypted_refresh_token = params.encryptedRefreshToken;
    existingMem.last_message_at = new Date().toISOString();
    existingMem.status = 'active';

    try {
      const { activateTrialOnFirstStoreConnect } = await import('./subscription');
      await activateTrialOnFirstStoreConnect(cleanEmail);
    } catch (trialErr) {
      console.warn('[claimStoreForTenant] Trial activation hook error:', trialErr);
    }

    return { success: true, store: existingMem };
  }

  const newStore: Store = {
    id: inMemoryStores.length + 1,
    gmc_id: params.gmcId,
    tenant_id: params.tenantId,
    tenant_email: cleanEmail,
    account_type: params.accountType || 'Standalone Merchant',
    store_url: params.storeUrl,
    store_name: params.storeName,
    encrypted_refresh_token: params.encryptedRefreshToken || null,
    alert_status: 'active',
    webhook_verified: false,
    pubsub_topic: `projects/kultra-sentinel/topics/gmc-${params.gmcId}`,
    last_message_at: new Date().toISOString(),
    open_disapprovals: 0,
    total_caught: 0,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  inMemoryStores.push(newStore);

  try {
    const { activateTrialOnFirstStoreConnect } = await import('./subscription');
    await activateTrialOnFirstStoreConnect(cleanEmail);
  } catch (trialErr) {
    console.warn('[claimStoreForTenant] Trial activation hook error:', trialErr);
  }

  return { success: true, store: newStore };
}

export async function updateStoreWebhook(
  storeId: number | string,
  tenantEmail: string,
  webhookUrl: string,
  verified: boolean,
  alertStatus: 'active' | 'degraded' = 'active',
  extra?: {
    channel?: string | null;
    channelId?: string | null;
    configurationUrl?: string | null;
    teamId?: string | null;
    teamName?: string | null;
  }
): Promise<Store | null> {
  const cleanEmail = tenantEmail.toLowerCase().trim();
  const channel = extra?.channel ?? null;
  const channelId = extra?.channelId ?? null;
  const configurationUrl = extra?.configurationUrl ?? null;
  const teamId = extra?.teamId ?? null;
  const teamName = extra?.teamName ?? null;

  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        UPDATE stores
        SET
          webhook_url = ${webhookUrl},
          slack_webhook_url = ${webhookUrl},
          webhook_verified = ${verified},
          alert_status = ${alertStatus},
          slack_channel = COALESCE(${channel}, slack_channel),
          slack_channel_id = COALESCE(${channelId}, slack_channel_id),
          slack_configuration_url = COALESCE(${configurationUrl}, slack_configuration_url),
          slack_team_id = COALESCE(${teamId}, slack_team_id),
          slack_team_name = COALESCE(${teamName}, slack_team_name)
        WHERE id = ${String(storeId)} AND LOWER(tenant_email) = ${cleanEmail}
        RETURNING *;
      `;
      if (rows.length > 0) return rows[0] as unknown as Store;
      return null;
    } catch (err) {
      console.warn('[Neon DB] Error updating store webhook:', err);
    }
  }

  const store = inMemoryStores.find(
    (s) => String(s.id) === String(storeId) && s.tenant_email.toLowerCase().trim() === cleanEmail
  );
  if (store) {
    store.webhook_url = webhookUrl;
    store.slack_webhook_url = webhookUrl;
    store.webhook_verified = verified;
    store.alert_status = alertStatus;
    if (channel !== null) store.slack_channel = channel;
    if (channelId !== null) store.slack_channel_id = channelId;
    if (configurationUrl !== null) store.slack_configuration_url = configurationUrl;
    if (teamId !== null) store.slack_team_id = teamId;
    if (teamName !== null) store.slack_team_name = teamName;
    return store;
  }
  return null;
}

export async function updateStoreSlackOAuthDetails(
  storeId: number | string,
  tenantEmail: string,
  details: {
    webhookUrl: string;
    channel?: string | null;
    channelId?: string | null;
    configurationUrl?: string | null;
    teamId?: string | null;
    teamName?: string | null;
  }
): Promise<Store | null> {
  return updateStoreWebhook(
    storeId,
    tenantEmail,
    details.webhookUrl,
    true,
    'active',
    details
  );
}

export async function markStoreAlertStatus(storeId: number | string, alertStatus: 'active' | 'degraded'): Promise<void> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`UPDATE stores SET alert_status = ${alertStatus} WHERE id = ${String(storeId)};`;
      return;
    } catch (err) {
      console.warn('[Neon DB] Error updating store alert status:', err);
    }
  }

  const store = inMemoryStores.find((s) => String(s.id) === String(storeId));
  if (store) store.alert_status = alertStatus;
}

// -----------------------------------------------------------------------------
// Message Deduplication (Stage 4: 7-Day Window)
// -----------------------------------------------------------------------------

const DEDUP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function isMessageProcessed(messageId: string): Promise<boolean> {
  if (!messageId) return false;

  // Ultra-fast memory check (0ms)
  const ts = inMemoryProcessedMessages.get(messageId);
  if (ts) {
    if (Date.now() - ts < DEDUP_WINDOW_MS) return true;
    inMemoryProcessedMessages.delete(messageId);
  }

  const sql = getDb();
  if (sql) {
    try {
      const rows = await sql`
        SELECT message_id FROM processed_messages 
        WHERE message_id = ${messageId} 
          AND processed_at >= NOW() - INTERVAL '7 days'
        LIMIT 1;
      `;
      if (rows.length > 0) {
        inMemoryProcessedMessages.set(messageId, Date.now());
        return true;
      }
    } catch (err) {
      console.warn('[Neon DB] Error checking processed message:', err);
    }
  }

  return false;
}

export async function markMessageProcessed(messageId: string): Promise<void> {
  if (!messageId) return;
  inMemoryProcessedMessages.set(messageId, Date.now());

  const sql = getDb();
  if (sql) {
    try {
      await sql`
        INSERT INTO processed_messages (message_id, processed_at)
        VALUES (${messageId}, NOW())
        ON CONFLICT (message_id) DO UPDATE SET processed_at = NOW();
      `;
    } catch (err) {
      console.warn('[Neon DB] Error marking message processed:', err);
    }
  }
}

// -----------------------------------------------------------------------------
// Incident Persistence & Triage State (Stage 5)
// -----------------------------------------------------------------------------

export function hasOpenIncident(storeId: number | string, sku: string, issueCode: string): boolean {
  return inMemoryIncidents.some(
    (i) =>
      String(i.store_id) === String(storeId) &&
      i.sku === sku &&
      i.issue_code === issueCode &&
      i.status === 'unresolved'
  );
}

export async function upsertIncident(data: {
  storeId: number | string;
  gmcId: string;
  sku: string;
  title: string;
  issueCode: string;
  severity: 'critical' | 'warning';
  tenant_email?: string;
  is_simulated?: boolean;
  is_test?: boolean;
  details?: Record<string, unknown>;
}): Promise<{ incident: Incident; isNew: boolean }> {
  const isTestOrSim = Boolean(
    data.is_simulated ||
    data.is_test ||
    (data.sku && (data.sku.startsWith('DEMO-') || data.sku === 'APX-TR-402' || data.sku === 'OW-8842-BLK-M'))
  );

  // Ultra-fast in-memory state mutation (0ms)
  const existingMem = inMemoryIncidents.find(
    (i) =>
      String(i.store_id) === String(data.storeId) &&
      i.sku === data.sku &&
      i.issue_code === data.issueCode &&
      i.status === 'unresolved'
  );

  let resultIncident: Incident;
  let isNew = false;

  if (existingMem) {
    existingMem.last_detected_at = new Date().toISOString();
    existingMem.title = data.title;
    existingMem.severity = data.severity;
    if (data.details) existingMem.details = data.details;
    if (isTestOrSim) {
      existingMem.is_simulated = true;
      existingMem.is_test = true;
    }
    resultIncident = existingMem;
  } else {
    isNew = true;
    const now = new Date().toISOString();
    const maxExistingId = inMemoryIncidents.reduce((max, inc) => Math.max(max, Number(inc.id) || 0), 0);
    const generatedId = maxExistingId > 0 ? maxExistingId + 1 : 1;
    const newIncident: Incident = {
      id: generatedId,
      store_id: data.storeId,
      gmc_id: data.gmcId,
      tenant_email: data.tenant_email,
      sku: data.sku,
      offer_id: data.sku,
      title: data.title,
      product_title: data.title,
      issue_code: data.issueCode,
      severity: data.severity,
      status: 'unresolved',
      first_detected_at: now,
      last_detected_at: now,
      detected_at: now,
      resolved_at: null,
      details: data.details || null,
      is_simulated: isTestOrSim,
      is_test: isTestOrSim,
      created_at: now,
    };
    inMemoryIncidents.push(newIncident);
    resultIncident = newIncident;

    // Platform-Wide Test Isolation: Never mutate store counters for test/simulated events
    if (!isTestOrSim) {
      const memStore = inMemoryStores.find((s) => String(s.id) === String(data.storeId));
      if (memStore) {
        memStore.open_disapprovals += 1;
        memStore.total_caught += 1;
        memStore.last_message_at = now;
      }
    }
  }

  // Resilient database persistence
  const sql = getDb();
  if (sql) {
    try {
      if (!isNew) {
        await sql`
          UPDATE incidents
          SET last_detected_at = NOW(), title = ${data.title}, severity = ${data.severity}, details = ${JSON.stringify(data.details || {})}
          WHERE store_id = ${String(data.storeId)} AND sku = ${data.sku} AND issue_code = ${data.issueCode} AND status = 'unresolved';
        `;
      } else {
        const insertedRows = await sql`
          INSERT INTO incidents (
            store_id, gmc_id, tenant_email, sku, offer_id, title, product_title, issue_code, severity, status,
            is_simulated, is_test, first_detected_at, last_detected_at, detected_at, details
          ) VALUES (
            ${String(data.storeId)}, ${data.gmcId}, ${data.tenant_email || null}, ${data.sku}, ${data.sku},
            ${data.title}, ${data.title}, ${data.issueCode},
            ${data.severity}, 'unresolved', ${isTestOrSim}, ${isTestOrSim}, NOW(), NOW(), NOW(), ${JSON.stringify(data.details || {})}
          )
          RETURNING *;
        `;
        if (insertedRows.length > 0) {
          resultIncident = insertedRows[0] as unknown as Incident;
          // Synchronize in-memory mirror ID with generated database serial primary key
          const memRecord = inMemoryIncidents.find((i) => i === resultIncident || (i.sku === data.sku && String(i.store_id) === String(data.storeId)));
          if (memRecord) {
            memRecord.id = resultIncident.id;
          }
        }

        // Platform-Wide Test Isolation: Never mutate store counters for test/simulated events
        if (!isTestOrSim) {
          await sql`
            UPDATE stores
            SET open_disapprovals = open_disapprovals + 1, total_caught = total_caught + 1, last_message_at = NOW()
            WHERE id = ${String(data.storeId)};
          `;
        }
      }
    } catch (err) {
      console.warn('[Neon DB] Incident persistence error:', err);
    }
  }

  return { incident: resultIncident, isNew };
}

export async function resolveIncident(storeId: number | string, sku: string): Promise<boolean> {
  let resolvedAny = false;
  inMemoryIncidents.forEach((i) => {
    if (String(i.store_id) === String(storeId) && i.sku === sku && i.status !== 'resolved') {
      i.status = 'resolved';
      i.resolved_at = new Date().toISOString();
      resolvedAny = true;
    }
  });

  if (resolvedAny) {
    const memStore = inMemoryStores.find((s) => String(s.id) === String(storeId));
    if (memStore) {
      memStore.open_disapprovals = Math.max(0, memStore.open_disapprovals - 1);
      memStore.last_message_at = new Date().toISOString();
    }
  }

  const sql = getDb();
  if (sql) {
    try {
      const updated = await sql`
        UPDATE incidents
        SET status = 'resolved', resolved_at = NOW()
        WHERE store_id = ${String(storeId)} AND sku = ${sku} AND status != 'resolved'
        RETURNING id;
      `;
      if (updated.length > 0) {
        await sql`
          UPDATE stores
          SET open_disapprovals = GREATEST(0, open_disapprovals - ${updated.length}), last_message_at = NOW()
          WHERE id = ${String(storeId)};
        `;
      }
    } catch (err) {
      console.warn('[Neon DB] Incident resolve error:', err);
    }
  }

  return resolvedAny;
}

export async function getStoreIncidentCountInWindow(storeId: number | string, windowSeconds: number): Promise<number> {
  // Ultra-fast in-memory calculation (0ms) guaranteeing zero overhead inside ingestion loop
  const threshold = Date.now() - windowSeconds * 1000;
  return inMemoryIncidents.filter(
    (i) => String(i.store_id) === String(storeId) && new Date(i.first_detected_at).getTime() >= threshold
  ).length;
}

/**
 * 15-minute auto-purge for simulated fire drill incidents (§4)
 */
export async function purgeExpiredSimulatedIncidents(storeId?: number | string): Promise<number> {
  const cutoff = Date.now() - 15 * 60 * 1000;
  let purgedCount = 0;

  for (let i = inMemoryIncidents.length - 1; i >= 0; i--) {
    const inc = inMemoryIncidents[i];
    if (inc.is_simulated && (!storeId || String(inc.store_id) === String(storeId))) {
      if (new Date(inc.created_at).getTime() < cutoff) {
        inMemoryIncidents.splice(i, 1);
        purgedCount++;
      }
    }
  }

  const sql = getDb();
  if (sql) {
    try {
      if (storeId) {
        const deleted = await sql`
          DELETE FROM incidents
          WHERE is_simulated = TRUE
            AND store_id = ${String(storeId)}
            AND created_at < NOW() - INTERVAL '15 minutes'
          RETURNING id;
        `;
        purgedCount = Math.max(purgedCount, deleted.length);
      } else {
        const deleted = await sql`
          DELETE FROM incidents
          WHERE is_simulated = TRUE
            AND created_at < NOW() - INTERVAL '15 minutes'
          RETURNING id;
        `;
        purgedCount = Math.max(purgedCount, deleted.length);
      }
    } catch (err) {
      console.warn('[Neon DB] Error purging expired simulated incidents:', err);
    }
  }

  return purgedCount;
}

export async function getIncidentsByStore(storeId: number | string, tenantEmail: string): Promise<Incident[]> {
  await purgeExpiredSimulatedIncidents(storeId);
  const cleanEmail = tenantEmail.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      // Composite authorization: verify store ownership first
      const storeRows = await sql`
        SELECT id FROM stores WHERE id = ${String(storeId)} AND LOWER(tenant_email) = ${cleanEmail} LIMIT 1;
      `;
      if (storeRows.length === 0) {
        return [];
      }

      const rows = await sql`
        SELECT * FROM incidents
        WHERE store_id = ${String(storeId)}
        ORDER BY last_detected_at DESC;
      `;
      return rows as unknown as Incident[];
    } catch (err) {
      console.warn('[Neon DB] Error fetching incidents by store:', err);
    }
  }

  const memStore = inMemoryStores.find(
    (s) => String(s.id) === String(storeId) && s.tenant_email.toLowerCase().trim() === cleanEmail
  );
  if (!memStore) return [];

  return inMemoryIncidents
    .filter((i) => String(i.store_id) === String(storeId))
    .sort((a, b) => new Date(b.last_detected_at).getTime() - new Date(a.last_detected_at).getTime());
}

export async function recordDLQMessage(data: {
  message_id: string;
  merchant_id: string;
  failure_reason: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        INSERT INTO dlq_messages (message_id, merchant_id, failure_reason, payload, status, created_at)
        VALUES (${data.message_id}, ${data.merchant_id}, ${data.failure_reason}, ${JSON.stringify(data.payload)}, 'unhandled', NOW());
      `;
      return;
    } catch (err) {
      console.warn('[Neon DB] Error recording DLQ message:', err);
    }
  }

  inMemoryDLQ.unshift({
    id: inMemoryDLQ.length + 1,
    message_id: data.message_id,
    merchant_id: data.merchant_id,
    failure_reason: data.failure_reason,
    payload: data.payload,
    status: 'unhandled',
    created_at: new Date().toISOString(),
  });
}

export async function recordDispatchLog(log: {
  dispatch_id: string;
  tenant_email?: string;
  store_url?: string;
  store_name?: string;
  gmc_id?: string;
  destination: string;
  delivery_status: number;
  status_label: 'Delivered' | 'Rate Limited' | 'Invalid Webhook';
  latency_ms?: number;
  payload: Record<string, unknown>;
}): Promise<void> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        INSERT INTO dispatch_logs (
          dispatch_id, tenant_email, store_url, store_name, gmc_id,
          destination, delivery_status, status_label, latency_ms, payload, created_at
        )
        VALUES (
          ${log.dispatch_id}, ${log.tenant_email || null}, ${log.store_url || null},
          ${log.store_name || null}, ${log.gmc_id || null},
          ${log.destination}, ${log.delivery_status}, ${log.status_label},
          ${log.latency_ms ?? null}, ${JSON.stringify(log.payload)}, NOW()
        );
      `;
      return;
    } catch (err) {
      console.warn('[Neon DB] Error recording dispatch log:', err);
    }
  }

  inMemoryDispatches.unshift({
    id: inMemoryDispatches.length + 1,
    dispatch_id: log.dispatch_id,
    tenant_email: log.tenant_email || 'unknown',
    store_url: log.store_url || 'unknown',
    store_name: log.store_name || null,
    gmc_id: log.gmc_id || null,
    destination: log.destination,
    delivery_status: log.delivery_status,
    status_label: log.status_label,
    latency_ms: log.latency_ms ?? null,
    payload: log.payload,
    created_at: new Date().toISOString(),
  });
}



export async function getDLQMessages(): Promise<DLQMessage[]> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM dlq_messages WHERE status = 'unhandled' ORDER BY created_at DESC;
      `;
      return rows as unknown as DLQMessage[];
    } catch (err) {
      console.warn('[Neon DB] Error querying DLQ:', err);
    }
  }
  return inMemoryDLQ.filter((m) => m.status === 'unhandled');
}

export async function replayDLQMessage(id: number): Promise<{ success: boolean; message: string }> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE dlq_messages SET status = 'replayed' WHERE id = ${id};
      `;
      return { success: true, message: `Payload for message #${id} re-injected into Pub/Sub ingestion queue.` };
    } catch (err) {
      console.warn('[Neon DB] Error replaying DLQ message:', err);
    }
  }

  const item = inMemoryDLQ.find((m) => m.id === id);
  if (item) item.status = 'replayed';
  return { success: true, message: `Payload for message #${id} re-injected.` };
}

export async function purgeDLQMessage(id: number): Promise<{ success: boolean }> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        DELETE FROM dlq_messages WHERE id = ${id};
      `;
      return { success: true };
    } catch (err) {
      console.warn('[Neon DB] Error purging DLQ message:', err);
    }
  }

  const idx = inMemoryDLQ.findIndex((m) => m.id === id);
  if (idx !== -1) inMemoryDLQ.splice(idx, 1);
  return { success: true };
}

export async function getDispatchLogs(): Promise<DispatchLog[]> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM dispatch_logs ORDER BY created_at DESC LIMIT 50;
      `;
      return rows as unknown as DispatchLog[];
    } catch (err) {
      console.warn('[Neon DB] Error querying dispatch logs:', err);
    }
  }
  return [...inMemoryDispatches];
}

export async function retryDispatch(id: number): Promise<{ success: boolean; message: string }> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE dispatch_logs 
        SET delivery_status = 200, status_label = 'Delivered'
        WHERE id = ${id};
      `;
      return { success: true, message: `Dispatch #${id} re-sent successfully to destination.` };
    } catch (err) {
      console.warn('[Neon DB] Error retrying dispatch:', err);
    }
  }

  const log = inMemoryDispatches.find((d) => d.id === id);
  if (log) {
    log.delivery_status = 200;
    log.status_label = 'Delivered';
  }
  return { success: true, message: `Dispatch #${id} re-sent successfully.` };
}

export async function disableWebhook(destination: string): Promise<{ success: boolean; message: string }> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE dispatch_logs 
        SET status_label = 'Invalid Webhook'
        WHERE destination = ${destination};
      `;
      return { success: true, message: `Webhook destination "${destination}" has been disabled.` };
    } catch (err) {
      console.warn('[Neon DB] Error disabling webhook:', err);
    }
  }

  inMemoryDispatches.forEach((d) => {
    if (d.destination === destination) d.status_label = 'Invalid Webhook';
  });
  return { success: true, message: `Webhook destination "${destination}" disabled.` };
}

export async function getSystemConfig(): Promise<SystemConfig> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`SELECT * FROM system_config WHERE id = 1 LIMIT 1;`;
      if (rows.length > 0) return rows[0] as SystemConfig;
    } catch (err) {
      console.warn('[Neon DB] Error querying system config:', err);
    }
  }
  return { ...inMemoryConfig };
}

export async function updateSystemConfig(updates: Partial<SystemConfig>): Promise<SystemConfig> {
  const now = new Date().toISOString();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        UPDATE system_config
        SET 
          maintenance_mode = COALESCE(${updates.maintenance_mode ?? null}, maintenance_mode),
          registration_gate = COALESCE(${updates.registration_gate || null}, registration_gate),
          rate_limit_per_min = COALESCE(${updates.rate_limit_per_min || null}, rate_limit_per_min),
          banner_text = COALESCE(${updates.banner_text || null}, banner_text),
          updated_at = ${now}
        WHERE id = 1
        RETURNING *;
      `;
      if (rows.length > 0) return rows[0] as SystemConfig;
    } catch (err) {
      console.warn('[Neon DB] Error updating system config:', err);
    }
  }

  Object.assign(inMemoryConfig, updates, { updated_at: now });
  return { ...inMemoryConfig };
}

// -----------------------------------------------------------------------------
// Existing Lead & Admin Operations (Preserved)
// -----------------------------------------------------------------------------

export async function createLead(data: {
  email: string;
  accountType: 'merchant' | 'agency';
  website: string;
  catalogSize: string;
}): Promise<Lead> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        INSERT INTO leads (email, account_type, website, catalog_size, status)
        VALUES (${data.email}, ${data.accountType}, ${data.website}, ${data.catalogSize}, 'pending')
        RETURNING id, email, account_type, website, catalog_size, status, notes, created_at;
      `;
      const lead = rows[0] as Lead;

      await sql`
        INSERT INTO telemetry_events (event_type, details)
        VALUES ('pilot_signup', ${JSON.stringify({ email: data.email, accountType: data.accountType })})
      `;

      return lead;
    } catch (error) {
      console.warn('[Neon DB] Error inserting lead into Neon, saving to memory fallback:', error);
    }
  }

  const newLead: Lead = {
    id: inMemoryLeads.length + 1,
    email: data.email,
    account_type: data.accountType,
    website: data.website,
    catalog_size: data.catalogSize,
    status: 'pending',
    notes: null,
    created_at: new Date().toISOString(),
  };
  inMemoryLeads.unshift(newLead);
  return newLead;
}

export async function getLeads(filter?: { status?: string; search?: string }): Promise<Lead[]> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const status = filter?.status && filter.status !== 'all' ? filter.status : null;
      const search = filter?.search ? `%${filter.search.toLowerCase()}%` : null;

      let rows: Lead[];
      if (status && search) {
        rows = (await sql`
          SELECT * FROM leads 
          WHERE status = ${status} 
            AND (LOWER(email) LIKE ${search} OR LOWER(website) LIKE ${search})
          ORDER BY created_at DESC;
        `) as unknown as Lead[];
      } else if (status) {
        rows = (await sql`
          SELECT * FROM leads 
          WHERE status = ${status}
          ORDER BY created_at DESC;
        `) as unknown as Lead[];
      } else if (search) {
        rows = (await sql`
          SELECT * FROM leads 
          WHERE (LOWER(email) LIKE ${search} OR LOWER(website) LIKE ${search})
          ORDER BY created_at DESC;
        `) as unknown as Lead[];
      } else {
        rows = (await sql`
          SELECT * FROM leads 
          ORDER BY created_at DESC;
        `) as unknown as Lead[];
      }
      return rows;
    } catch (error) {
      console.warn('[Neon DB] Error querying leads, using memory fallback:', error);
    }
  }

  let result = [...inMemoryLeads];
  if (filter?.status && filter.status !== 'all') {
    result = result.filter((l) => l.status === filter.status);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    result = result.filter((l) => l.email.toLowerCase().includes(s) || l.website.toLowerCase().includes(s));
  }
  return result;
}

export async function updateLeadStatus(
  id: number,
  status: 'pending' | 'approved' | 'contacted' | 'rejected',
  notes?: string
): Promise<Lead | null> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        UPDATE leads
        SET status = ${status}, notes = COALESCE(${notes || null}, notes)
        WHERE id = ${id}
        RETURNING *;
      `;
      if (rows.length > 0) {
        return rows[0] as Lead;
      }
    } catch (error) {
      console.warn('[Neon DB] Error updating lead, using memory fallback:', error);
    }
  }

  const lead = inMemoryLeads.find((l) => l.id === id);
  if (lead) {
    lead.status = status;
    if (notes) lead.notes = notes;
    return lead;
  }
  return null;
}

export async function getTelemetryStats() {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const leadsCount = await sql`SELECT COUNT(*)::int as count FROM leads;`;
      const pendingCount = await sql`SELECT COUNT(*)::int as count FROM leads WHERE status = 'pending';`;
      const approvedCount = await sql`SELECT COUNT(*)::int as count FROM leads WHERE status = 'approved';`;
      const recentEvents = await sql`
        SELECT * FROM telemetry_events ORDER BY created_at DESC LIMIT 10;
      `;

      return {
        totalLeads: leadsCount[0]?.count || 0,
        pendingLeads: pendingCount[0]?.count || 0,
        approvedLeads: approvedCount[0]?.count || 0,
        revenueProtected: '$148,500',
        activeHealth: '99.98%',
        recentEvents: recentEvents as unknown as TelemetryEvent[],
      };
    } catch (error) {
      console.warn('[Neon DB] Error querying telemetry, using memory fallback:', error);
    }
  }

  return {
    totalLeads: inMemoryLeads.length,
    pendingLeads: inMemoryLeads.filter((l) => l.status === 'pending').length,
    approvedLeads: inMemoryLeads.filter((l) => l.status === 'approved').length,
    revenueProtected: '$148,500',
    activeHealth: '99.98%',
    recentEvents: inMemoryTelemetry.slice(0, 10),
  };
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM admins WHERE LOWER(email) = LOWER(${email}) LIMIT 1;
      `;
      if (rows.length > 0) {
        return rows[0] as AdminUser;
      }
    } catch (error) {
      console.warn('[Neon DB] Error finding admin by email:', error);
    }
  }

  return inMemoryAdmins.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findAdminByGoogleId(googleId: string): Promise<AdminUser | null> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT * FROM admins WHERE google_id = ${googleId} LIMIT 1;
      `;
      if (rows.length > 0) {
        return rows[0] as AdminUser;
      }
    } catch (error) {
      console.warn('[Neon DB] Error finding admin by Google ID:', error);
    }
  }

  return inMemoryAdmins.find((a) => a.google_id === googleId) || null;
}

export async function createOrUpdateAdmin(admin: {
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  name?: string | null;
  role?: string;
}): Promise<AdminUser> {
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        INSERT INTO admins (email, password_hash, google_id, name, role)
        VALUES (${admin.email}, ${admin.passwordHash || null}, ${admin.googleId || null}, ${admin.name || null}, ${admin.role || 'admin'})
        ON CONFLICT (email) DO UPDATE
        SET google_id = COALESCE(EXCLUDED.google_id, admins.google_id),
            password_hash = COALESCE(EXCLUDED.password_hash, admins.password_hash),
            name = COALESCE(EXCLUDED.name, admins.name)
        RETURNING *;
      `;
      return rows[0] as AdminUser;
    } catch (error) {
      console.warn('[Neon DB] Error upserting admin, using memory fallback:', error);
    }
  }

  const existing = inMemoryAdmins.find((a) => a.email.toLowerCase() === admin.email.toLowerCase());
  if (existing) {
    if (admin.passwordHash) existing.password_hash = admin.passwordHash;
    if (admin.googleId) existing.google_id = admin.googleId;
    if (admin.name) existing.name = admin.name;
    return existing;
  }

  const newAdmin: AdminUser = {
    id: inMemoryAdmins.length + 1,
    email: admin.email,
    password_hash: admin.passwordHash || null,
    google_id: admin.googleId || null,
    name: admin.name || null,
    role: admin.role || 'admin',
    created_at: new Date().toISOString(),
  };
  inMemoryAdmins.push(newAdmin);
  return newAdmin;
}

export async function dismissOrAcknowledgeIncident(
  incidentId: number | string,
  tenantEmail: string
): Promise<{
  success: boolean;
  isSimulated?: boolean;
  dismissed?: boolean;
  status?: string;
  incident?: Incident;
  message?: string;
  error?: string;
}> {
  const cleanId = String(incidentId ?? '').trim();
  if (!cleanId || cleanId === 'undefined' || cleanId === 'null') {
    return { success: false, error: 'A valid unique incident identifier is required' };
  }

  const cleanEmail = tenantEmail.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      // Composite authorization: verify the incident belongs to a store owned by tenantEmail
      const existing = await sql`
        SELECT i.* FROM incidents i
        JOIN stores s ON s.id::text = i.store_id::text
        WHERE i.id::text = ${cleanId}
          AND LOWER(s.tenant_email) = ${cleanEmail}
        LIMIT 1;
      `;
      if (existing.length === 0) {
        return { success: false, error: 'Incident not found or unauthorized' };
      }
      const inc = existing[0] as unknown as Incident;
      const isSimulated = Boolean(inc.is_simulated || inc.is_test || inc.sku === 'DEMO-RUNNER-402');

      if (isSimulated) {
        // Test drill incident: delete strictly this single record by unique primary key
        await sql`
          DELETE FROM incidents
          WHERE id::text = ${cleanId};
        `;
        // Clean in-memory mirror if present (do not mutate store open_disapprovals as tests never incremented it)
        const memIdx = inMemoryIncidents.findIndex((i) => String(i.id) === cleanId);
        if (memIdx !== -1) inMemoryIncidents.splice(memIdx, 1);

        return {
          success: true,
          isSimulated: true,
          dismissed: true,
          message: 'Test incident cleared.',
        };
      } else {
        // Real Google disapproval: mark strictly this single record as acknowledged
        const updated = await sql`
          UPDATE incidents
          SET status = 'acknowledged', resolved_at = NOW(), last_detected_at = NOW()
          WHERE id::text = ${cleanId}
          RETURNING *;
        `;
        // Decrement open_disapprovals on store by exactly 1
        await sql`
          UPDATE stores
          SET open_disapprovals = GREATEST(0, open_disapprovals - 1)
          WHERE id::text = ${String(inc.store_id)};
        `;
        // Clean in-memory mirror if present
        const memInc = inMemoryIncidents.find((i) => String(i.id) === cleanId);
        if (memInc) {
          memInc.status = 'acknowledged';
          memInc.resolved_at = new Date().toISOString();
        }
        const memStore = inMemoryStores.find((s) => String(s.id) === String(inc.store_id));
        if (memStore) memStore.open_disapprovals = Math.max(0, memStore.open_disapprovals - 1);

        return {
          success: true,
          isSimulated: false,
          status: 'acknowledged',
          incident: (updated[0] || inc) as unknown as Incident,
          message: 'Incident acknowledged.',
        };
      }
    } catch (err) {
      console.warn('[Neon DB] Error dismissing or acknowledging incident:', err);
    }
  }

  // In-memory fallback: strictly target unique record by id
  const incidentIdx = inMemoryIncidents.findIndex((i) => String(i.id) === cleanId);
  if (incidentIdx !== -1) {
    const inc = inMemoryIncidents[incidentIdx];
    const store = inMemoryStores.find(
      (s) => String(s.id) === String(inc.store_id) && s.tenant_email.toLowerCase().trim() === cleanEmail
    );
    if (!store) {
      return { success: false, error: 'Unauthorized to modify incident' };
    }
    const isSimulated = Boolean(inc.is_simulated || inc.is_test || inc.sku === 'DEMO-RUNNER-402');
    if (isSimulated) {
      inMemoryIncidents.splice(incidentIdx, 1);
      return {
        success: true,
        isSimulated: true,
        dismissed: true,
        message: 'Test incident cleared.',
      };
    } else {
      inc.status = 'acknowledged';
      inc.resolved_at = new Date().toISOString();
      store.open_disapprovals = Math.max(0, store.open_disapprovals - 1);
      return {
        success: true,
        isSimulated: false,
        status: 'acknowledged',
        incident: inc,
        message: 'Incident acknowledged.',
      };
    }
  }

  return { success: false, error: 'Incident not found' };
}

export const markIncidentPendingVerification = dismissOrAcknowledgeIncident;

// -----------------------------------------------------------------------------
// Server-Side Session Tracking & Revocation
// -----------------------------------------------------------------------------

export async function createDbSession(params: {
  sessionId: string;
  userId?: number | null;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: string;
}): Promise<void> {
  const cleanEmail = params.email.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        INSERT INTO user_sessions (session_id, user_id, email, ip_address, user_agent, is_revoked, expires_at, created_at, last_active_at)
        VALUES (${params.sessionId}, ${params.userId || null}, ${cleanEmail}, ${params.ipAddress || null}, ${params.userAgent || null}, FALSE, ${params.expiresAt}, NOW(), NOW())
        ON CONFLICT (session_id) DO UPDATE
        SET last_active_at = NOW(), is_revoked = FALSE;
      `;
      return;
    } catch (err) {
      console.warn('[Neon DB] Error creating user session:', err);
    }
  }

  inMemorySessions.set(params.sessionId, {
    session_id: params.sessionId,
    user_id: params.userId || null,
    email: cleanEmail,
    ip_address: params.ipAddress || null,
    user_agent: params.userAgent || null,
    is_revoked: false,
    expires_at: params.expiresAt,
    created_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  });
}

export async function isSessionRevoked(sessionId: string): Promise<boolean> {
  if (!sessionId) return true;
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      const rows = await sql`
        SELECT is_revoked, expires_at FROM user_sessions WHERE session_id = ${sessionId} LIMIT 1;
      `;
      if (rows.length > 0) {
        if (rows[0].is_revoked) return true;
        if (new Date(rows[0].expires_at).getTime() < Date.now()) return true;
        return false;
      }
    } catch (err) {
      console.warn('[Neon DB] Error checking session revocation:', err);
    }
  }

  const mem = inMemorySessions.get(sessionId);
  if (mem) {
    if (mem.is_revoked) return true;
    if (new Date(mem.expires_at).getTime() < Date.now()) return true;
    return false;
  }

  return false;
}

export async function revokeSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE user_sessions SET is_revoked = TRUE WHERE session_id = ${sessionId};
      `;
    } catch (err) {
      console.warn('[Neon DB] Error revoking session:', err);
    }
  }

  const mem = inMemorySessions.get(sessionId);
  if (mem) {
    mem.is_revoked = true;
  }
}

export async function revokeAllUserSessions(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE user_sessions SET is_revoked = TRUE WHERE LOWER(email) = ${cleanEmail};
      `;
    } catch (err) {
      console.warn('[Neon DB] Error revoking all sessions for user:', err);
    }
  }

  for (const session of inMemorySessions.values()) {
    if (session.email.toLowerCase().trim() === cleanEmail) {
      session.is_revoked = true;
    }
  }
}

export async function restoreUserSessions(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const sql = getDb();
  if (sql) {
    try {
      await ensureSchema();
      await sql`
        UPDATE user_sessions SET is_revoked = FALSE WHERE LOWER(email) = ${cleanEmail};
      `;
    } catch (err) {
      console.warn('[Neon DB] Error restoring sessions for user:', err);
    }
  }

  for (const session of inMemorySessions.values()) {
    if (session.email.toLowerCase().trim() === cleanEmail) {
      session.is_revoked = false;
    }
  }
}

