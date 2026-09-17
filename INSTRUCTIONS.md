# Architectural Directive: Initial Catalog Audit on Connect, "Found Money" Alert & Fire Drill Engine

Implement an automated historical backfill on initial connection, an instant "Found Money" Slack notification, and an interactive crawler simulation button. This eliminates silent 7-day trial drop-offs by giving users instant value within 60 seconds of OAuth completion. 

All Google Content API calls are 100% free with no per-request charges from Google.

---

### 1. Objective & Flow Overview
[ OAuth Callback Complete ]
|
v
[ Trigger Background Task via Next.js after() ]
|
+---> 1. Fetch Existing Product Statuses via Google Content API
|
+---> 2. Filter & Ingest Disapproved SKUs into Neon DB
|
+---> 3. Dispatch "Found Money" Alert to Slack (or "Zero Errors Clean Slate")
|
v
[ User Lands on /dashboard Hydrated with Real Catalog Issues ]

---

### 2. Implementation Specs: Initial Catalog Audit

**File Target:** `src/lib/merchant_api.ts` & `src/app/api/auth/merchant/callback/route.ts`

1. **Google Content API Disapproval Scanner:**
   * Create an async function `auditExistingDisapprovals(merchantId: string, accessToken: string)`.
   * Query Google's Content API v2.1:
     `GET https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/productstatuses?maxResults=250`
   * Parse the `resources` array. An item is an active issue if:
     * `destinationStatuses` contains any status with `approvalStatus: "disapproved"`, OR
     * `itemLevelIssues` contains entries where `servability: "disapproved"` or `resolution: "merchant_action"`.
   * For each disapproved item, extract:
     * `productId` / `offerId` (clean SKU string).
     * `title` (fallback to `offerId` if title is empty).
     * Primary issue reason (e.g., `issue.code` / `issue.detail`, isolated cleanly like `missing_value [gtin]`).
     * `severity`: Mark as `CRITICAL_DISAPPROVAL`.

2. **Database Ingestion (Neon):**
   * Batch upsert detected disapprovals into the `incidents` table.
   * Enforce schema fields: `store_id`, `tenant_email`, `offer_id`, `product_title`, `issue_code`, `status: "ACTIVE"`, `detected_at: NOW()`.
   * Prevent duplicate rows if the same SKU and error code already exist.

3. **Non-Blocking Execution:**
   * In `/api/auth/merchant/callback/route.ts`, do NOT block the OAuth redirect while scanning hundreds of products.
   * Wrap the scan inside Next.js 15's native `after()`:
     ```typescript
     after(async () => {
       await auditExistingDisapprovals(merchantId, accessToken);
       await dispatchInitialAuditSlackNotification(storeId, tenantEmail);
     });
     ```
   * Redirect the merchant immediately to `/dashboard?just_connected=true`.

---

### 3. "Found Money" Slack Notification Engine

**File Target:** `src/lib/slack.ts` & notification workers

When the initial audit completes and the Slack webhook is saved:

* **Scenario A: Disapprovals Detected ($$$ Value Found Immediately):**
  * Format a high-urgency Slack Block Kit card:
    * **Header:** `🚨 Kultra Shield Armed: [X] Existing Disapprovals Detected`
    * **Body:** *"We ran an initial diagnostic check across your catalog. Google's crawler is currently blocking [X] products from shopping ad traffic."*
    * **Top Offender SKU & Title:** Display the first 2-3 flagged products with their raw error codes in monospace.
    * **Action Button:** Include a link button: *"Triage Disapprovals in Kultra"*.
* **Scenario B: Zero Disapprovals (Clean Slate):**
  * Format an operational confirmation card:
    * **Header:** `🛡️ Kultra Shield Armed: Catalog 100% Eligible`
    * **Body:** *"Initial diagnostic sweep complete: 0 products currently disapproved. 24/7 crawler monitoring active. We will ping this channel the second a crawler violation occurs."*

---

### 4. Synthetic Fire Drill: "Simulate Crawler Disapproval"

**File Target:** `src/components/TenantTriageCenter.tsx` & `src/app/api/stores/[storeId]/simulate/route.ts`

Give users (especially those with 0 current errors) an instant way to test the system and demo it to their team:

1. **Backend Route (`POST /api/stores/[storeId]/simulate`):**
   * Ensure the request is session-bound to the tenant.
   * Send a synthetic, realistic disapproval card directly to the store's configured Slack webhook:
     * **Product:** `Apex Carbon Runner - Size 10.5 (Demo Item)`
     * **Reason:** `item_disapproved: missing_required_attribute [gtin]`
     * **Action:** Direct link to `https://${store.domain}/admin/products?query=DEMO-RUNNER`
   * Insert a temporary demo incident into the database flagged as `is_simulated: true` with a 15-minute auto-purge.
2. **Dashboard Trigger Button:**
   * In `TenantTriageCenter.tsx`, place a secondary button next to the active store status:
     **"Run Test Fire Drill"**.
   * On click: show a brief loading state, trigger the endpoint, and display a confirmation banner:
     *"Test disapproval alert sent to your Slack channel. Check your channel to inspect the alert layout."*

---

### 5. Verification Checklist

1. Connect a test Google Merchant Center account containing existing test disapprovals.
2. Confirm the user is redirected to `/dashboard` immediately without timeout.
3. Verify that `/dashboard` hydrates with the pre-existing disapproved products inside the triage table.
4. Verify that the configured Slack channel receives the "Found Money" alert showing the exact count and top disapproved SKU.
5. Click **"Run Test Fire Drill"** on a clean account: verify a realistic simulated alert arrives in Slack in under 1 second.
6. Verify `npm run build` succeeds with 0 errors.