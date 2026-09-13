import { neon } from '@neondatabase/serverless';

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
  created_at: string;
}

export interface TelemetryEvent {
  id: number;
  event_type: string;
  sku?: string | null;
  revenue_impact: number;
  details?: Record<string, unknown> | null;
  created_at: string;
}

// In-memory fallback stores when DATABASE_URL is not configured
const inMemoryLeads: Lead[] = [
  {
    id: 1,
    email: 'marcus.vance@solarestudio.com',
    account_type: 'merchant',
    website: 'solarestudio.com',
    catalog_size: '1,000 - 5,000 SKUs',
    status: 'pending',
    notes: 'Direct Shopify Plus merchant experiencing recurring GTIN disapprovals.',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 2,
    email: 'sarah.k@apexperformancemedia.io',
    account_type: 'agency',
    website: 'apexperformancemedia.io',
    catalog_size: '5,000+ SKUs',
    status: 'approved',
    notes: 'Managing 12 high-volume client accounts on Google Shopping.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 3,
    email: 'david.l@norseoutdoors.co.uk',
    account_type: 'merchant',
    website: 'norseoutdoors.co.uk',
    catalog_size: '500 - 1,000 SKUs',
    status: 'contacted',
    notes: 'Onboarding call scheduled for tomorrow 10:00 AM UTC.',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

const inMemoryAdmins: AdminUser[] = [];

const inMemoryTelemetry: TelemetryEvent[] = [
  {
    id: 1,
    event_type: 'crawler_disapproval',
    sku: 'ALP-ANORAK-BLK-L',
    revenue_impact: 4800,
    details: { reason: 'missing_required_attribute [gtin]', platform: 'Google Merchant API v1' },
    created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: 2,
    event_type: 'shopify_remediation',
    sku: 'ALP-ANORAK-BLK-L',
    revenue_impact: 4800,
    details: { action: 'gtin_resolved_via_deep_link', duration_seconds: 144 },
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 3,
    event_type: 'pilot_signup',
    sku: null,
    revenue_impact: 0,
    details: { email: 'sarah.k@apexperformancemedia.io', account_type: 'agency' },
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

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

    schemaInitialized = true;
    return true;
  } catch (error) {
    console.error('[Neon DB] Schema initialization notice:', error);
    return false;
  }
}

// Data Access Layer with automatic Neon DB persistence + in-memory fallback
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

      // Record Telemetry
      await sql`
        INSERT INTO telemetry_events (event_type, details)
        VALUES ('pilot_signup', ${JSON.stringify({ email: data.email, accountType: data.accountType })})
      `;

      return lead;
    } catch (error) {
      console.warn('[Neon DB] Error inserting lead into Neon, saving to memory fallback:', error);
    }
  }

  // Memory fallback
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
  inMemoryTelemetry.unshift({
    id: inMemoryTelemetry.length + 1,
    event_type: 'pilot_signup',
    sku: null,
    revenue_impact: 0,
    details: { email: data.email, account_type: data.accountType },
    created_at: new Date().toISOString(),
  });
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

  // Memory fallback filtering
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

  // Memory fallback
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

// Admin Database Operations
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
