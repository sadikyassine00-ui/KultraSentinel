# Architectural Specification: Google Merchant Center OAuth, Live Dashboard Engine & Conversion UX

You are tasked with turning the current Kultra prototype dashboard into a production-grade, conversion-optimized monitoring hub. Implement the complete Google Merchant Center (GMC) OAuth connection flow, live database hydration, and a high-converting user experience based on the exact specifications below.

---

## 1. Primary Objectives

1. **Self-Serve Merchant Onboarding:** Eliminate manual database inserts by building a seamless Google OAuth 2.0 connection that extracts the user's Merchant ID, Store Name, and Catalog URL in two clicks.
2. **Automated Notification Subscription:** Programmatically register Kultra's Google Cloud Pub/Sub topic with the user's Merchant Center account upon connection so disapproval events stream automatically.
3. **Conversion-Driven Dashboard Hierarchy:** Replace all shell/mock components with dynamic queries from Neon, architected specifically to drive activation, prove immediate value, and lock in retention through instant Slack alerts.
4. **Zero-Trust Security & Multi-Tenant Isolation:** Enforce stateful CSRF protection on OAuth, encrypt sensitive credentials at rest, and strictly bind all store mutations and queries to the authenticated tenant.

---

## 2. Google Merchant Center OAuth Flow & Security Architecture

### Step 1: OAuth Initiation
* **User Trigger:** The user clicks the primary action button: **"Connect Google Merchant Center"**.
* **State Verification & CSRF Defense:** Generate a cryptographically random, non-guessable state token. Store this token in an encrypted, short-lived (10-minute), HTTP-only cookie.
* **Redirection Parameters:** Direct the user's browser to Google's OAuth 2.0 authorization endpoint requesting:
  * Read-only Content API access scope: `https://www.googleapis.com/auth/content.readonly`
  * Basic profile/email verification scopes.
  * `access_type=offline` (mandatory to acquire a permanent refresh token).
  * `prompt=consent` (mandatory to guarantee Google returns a refresh token on subsequent reconnects).
  * The state token generated above.

### Step 2: Callback Handling & Credential Ingestion
* **State Parameter Validation:** Intercept the authorization code and state parameter sent back by Google. Verify that the returned state matches the value stored in the encrypted cookie. Reject mismatches immediately to prevent OAuth login CSRF attacks.
* **Token Exchange:** Exchange the authorization code directly with Google's token endpoint to acquire the access token, ID token, and refresh token.
* **Credential Encryption at Rest:** Never store plaintext refresh tokens. Encrypt the refresh token using AES-256-GCM with a unique 12-byte initialization vector and an authentication tag derived from the application security secret before database insertion.

### Step 3: Account Discovery & Store Ingestion
* **Metadata Resolution:** Using the newly acquired access token, immediately query the Google Merchant API to inspect the authorized account.
* **Account Resolution:** Fetch the primary Merchant Center Account ID, the official Store Name, and the verified Website Domain.
* **Multi-Account Edge Handling:** If the user authenticates with an Multi-Client Account (MCA) umbrella managing multiple sub-accounts, detect this state and present an account selector so the user can choose which specific client feed to monitor.
* **Collision Check & Tenant Isolation:**
  * Check the database to see if the Merchant ID is already claimed.
  * If claimed by another tenant: Reject the binding with a conflict status to prevent cross-account feed hijacking.
  * If unclaimed or previously owned by the same user: Upsert the record in the stores table, setting the foreign key strictly to the authenticated tenant session.

### Step 4: Auto-Registering the Event Pipeline
* Once the store record is created, the server must automatically call Google's Merchant Notifications API using the access token.
* Register a new notification subscription linking the merchant's account to Kultra's GCP Pub/Sub topic for catalog status change events.
* This guarantees the merchant's crawler rejections will immediately trigger Kultra's webhook ingestion engine without requiring the user to configure Google Cloud settings manually.

---

## 3. Dashboard UX & Conversion Architecture

The dashboard must be optimized for **time-to-value** and **activation**. Every UI state must guide the user toward arming their alert system and seeing catalog protection in action.
### State A: The Zero-Store State (The Onboarding Funnel)
When a user logs into a fresh account with zero linked stores, suppress complex navigation, empty graphs, and blank tables. Replace the screen with a focused **Activation Card**:
1. **Headline:** *"Automated, sub-30-second disapproval protection for your Google Shopping campaigns."*
2. **Proof Mechanism:** A 3-step visualization showing: Connect GMC $\rightarrow$ Set Alert Destination $\rightarrow$ Protect Hero SKUs from silent revenue drops.
3. **Primary Action:** Large high-contrast button: **"Connect Google Merchant Center"**.
4. **Friction Reducer:** Micro-copy stating: *"Read-only access. No code or feed changes required."*

### State B: The "Arm Your Alarm" Activation Modal (Post-OAuth)
Immediately upon returning from a successful Google OAuth handshake, redirect the user back to the dashboard and trigger an unclosable or high-priority onboarding modal:
* **The Goal:** Force notification setup. A monitoring tool with no configured alert destination has zero retention.
* **The Interface:**
  * Displays the newly linked store name and Merchant ID with a green checkmark.
  * Input field: *"Where should we wake you up when an ad-blocking disapproval occurs?"* (Paste Slack Incoming Webhook URL).
  * Action button: **"Send Test Alert & Arm System"**.
* **The Verification Ping:**
  * When clicked, the server dispatches a synthetic alert card to that webhook.
  * The UI listens for success, plays a confirmation animation, and displays: *"Alert pipeline verified. Your campaigns are now monitored 24/7."*
  * Close the modal and reveal the full active dashboard.

### State C: The Active Dashboard (The Triage Center)
Replace all static shell mockups with real data queries structured into three distinct visual tiers:

#### Tier 1: Global Health & Triage Banner (Top Priority)
* **Healthy State:** If open incidents equal zero, show an emerald-green banner:
  * Badge: **"Catalog Shield Active"**.
  * Copy: *"All items eligible for Google Shopping. Google crawler last checked: [Dynamic Timestamp]."*
* **Threat State:** If one or more items are disapproved, render a high-visibility warning banner at the very top:
  * Headline: *"Disapprovals Detected - Ad Traffic at Risk"*.
  * Shows the most critical impacted product title and SKU in bold.
  * Displays the raw policy rejection reason (e.g., `missing_value [gtin]`).
  * Action buttons:
    * **"Fix in Shopify":** Opens `https://[store-domain]/admin/products?query=[SKU]` in a new tab, instantly filtering their Shopify admin to that exact product variant.
    * **"View in Merchant Center":** Deep-links directly to Google Merchant Center's Diagnostics panel for that specific item.
    * **"Mark Pending Verification":** Allows the user to flag that they've pushed a fix, updating the incident state in the UI.

#### Tier 2: Real-Time Metric Counters
Three high-level diagnostic cards:
1. **Monitored Products:** Total active products currently tracked under this Merchant ID.
2. **Active Disapprovals:** Count of currently blocked SKUs (colored in red if > 0).
3. **Alert Pipeline Status:** Displays the configured Slack channel name and latency status (e.g., *"Connected to #ppc-alerts (12ms)"*) with an inline "Send Test" button for peace of mind.

#### Tier 3: Incident History & Resolution Audit Table
A clean, paginated table hydrated from the database:
* **Columns:** Product Title & SKU, Error Reason, Severity (`CRITICAL_DISAPPROVAL` vs `DEMOTION`), First Detected Timestamp, Last Status Update, Triage Action.
* **Auto-Resolution Feedback:** When an item is fixed in Shopify and re-approved by Google's crawler, the table dynamically badges the item as **"Auto-Resolved"** with an emerald checkmark, showing the exact downtime duration (e.g., *"Resolved in 42 minutes"*). This quantifies the ROI of using the software.

---

## 4. Multi-Tenant Scoping & Database Query Rules

All server actions, page data loaders, and API routes must adhere to strict tenant isolation:

1. **Session-Bound Data Fetching:**
   * Every SQL query fetching store details, statistics, or incident logs must include:
     `WHERE stores.tenant_email = session.email` (or `stores.user_id = session.userId`).
   * Never accept a raw `storeId` from client query parameters or request bodies without verifying that the store belongs to the active authenticated session.
2. **Deep-Link Construction Rule:**
   * When building the Shopify admin fix URL, sanitize the product SKU or Offer ID.
   * Construct the URL using the native Shopify query parameter:
     `https://${store.domain}/admin/products?query=${encodeURIComponent(incident.offerId)}`
   * If the store domain is not yet saved, default safely to the Shopify admin unified hub (`https://admin.shopify.com`).
3. **Token Refresh Routine:**
   * When calling Google APIs on behalf of a store (e.g., manual re-sync or account verification), check access token expiration.
   * If expired, decrypt the stored refresh token, request a new access token from Google, and update the cache without user intervention.

---

## 5. Verification Checklist

Before completing this milestone, verify the following workflows:
1. **Clean Connect:** Log into an empty test account, click "Connect Google Merchant Center", approve permissions on Google, and verify you are redirected back to the dashboard with the store details correctly populated in the database.
2. **CSRF Rejection:** Simulate an invalid OAuth state parameter on callback and confirm the request is rejected with a 403 Forbidden.
3. **Double Claim Rejection:** Attempt to connect the same Google Merchant Center ID from a secondary user account and verify the system blocks the registration with a clear error.
4. **Slack Activation:** Paste a valid Slack incoming webhook into the post-onboarding modal, trigger the test alert, and confirm delivery in the Slack channel.
5. **Dynamic Triage:** Trigger the local Pub/Sub test event and verify the dashboard instantly reflects the new critical disapproval banner and triage table row without requiring a database wipe.
6. **Shopify Link:** Click "Fix in Shopify" on an active incident and ensure the resulting URL uses `?query=` to open the specific product in Shopify admin.