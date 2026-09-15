# Architectural Specification & Workflow Blueprint: Kultra Event Processing Engine

You are tasked with engineering the complete end-to-end integration and data lifecycle for Kultra. Implement this system strictly following the workflow stages, security boundaries, and reliability standards outlined below. Do not implement ad-hoc shortcuts. Every state mutation must be verifiable, tenant-isolated, and resilient to third-party outages.

---

## 1. System Role & Architecture Overview

The platform operates as a high-speed event processor connecting three primary entities:
1. **Google Cloud Platform & Google Merchant Center:** Sources catalog crawler decisions and dispatches status change messages.
2. **Kultra Core Application Engine:** Ingests incoming events, reconciles state against the persistent database, deduplicates messages, and verifies tenant access.
3. **Outbound Notification Endpoints (Slack / Webhooks):** Delivers actionable triage cards with direct repair deep-links to merchants and agency operators.

---

## 2. End-to-End Workflow Stages

### Stage 1: User Onboarding & Account Scoping
* **Authentication:** The user logs in via credentials or single sign-on. The server issues a cryptographically signed, encrypted session token stored in an HTTP-only, secure, browser-restricted cookie.
* **Route Protection:** 
  * An edge routing layer inspects all incoming requests. 
  * Authenticated users attempting to load guest interfaces (login/register) must be redirected immediately to the dashboard.
  * Unauthenticated requests attempting to reach internal screens or operational endpoints must be bounced to login, preserving only safe, relative destination URLs.

### Stage 2: Merchant Center Authorization (Zero-Trust OAuth Handshake)
* **Initiation:** The tenant clicks to authorize a Google Merchant Center account.
* **Scope Definition:** Request read-only access to the Merchant API and basic user profile information.
* **Token Exchange:** The server receives the authorization code, exchanges it directly with Google's servers for an access token and a persistent refresh token, and securely stores the refresh token in the database.
* **Tenant Isolation:**
  * The system immediately queries Google's API to retrieve the official Merchant Center Account ID and Store Title.
  * The resulting store entity must be inserted into the database tied explicitly to the authenticated user's account identifier. 
  * Cross-tenant account collisions must be rejected: a store entity cannot be claimed or overwritten by another tenant without re-authenticating ownership.

### Stage 3: Alert Destination Configuration & Verification
* **Channel Setup:** The user inputs an incoming notification destination (such as a Slack incoming webhook URL).
* **Synthetic Verification Ping:**
  * Before marking the notification channel active, the user triggers a verification test.
  * The server dispatches a synthetic, formatted test payload to the external destination.
  * The server measures round-trip delivery latency and verifies that the destination returns a successful delivery status.
  * If the destination returns an error or fails to respond, the endpoint is flagged as invalid, and the user is warned immediately.

### Stage 4: Real-Time Ingestion & The Deduplication Engine
* **Push Reception:** Google Cloud Pub/Sub pushes incoming catalog disapproval events to the server's public ingestion endpoint via HTTP POST.
* **Instant Ingestion SLA:** The endpoint must complete processing and return a success acknowledgment within 500 milliseconds. If the endpoint hangs or crashes, Google will assume delivery failure and repeatedly flood the system with retries.
* **Payload Verification:** The endpoint must cryptographically verify that the incoming HTTP request originated from the configured Google Cloud project (using authentication tokens or shared push secret verification) before touching the database. Unsigned requests must be rejected immediately.
* **Message Deduplication:**
  * Extract the unique message identifier assigned by Google Cloud.
  * Check whether this message identifier has already been processed within the last 7 days.
  * If the message has already been processed, acknowledge the request immediately with a success status and exit to prevent duplicate database writes or duplicate notifications.
  * If new, log the message identifier in the persistent tracking table.

### Stage 5: Incident Persistence & Triage State
* **Data Extraction:** Extract the target Merchant Account ID, Product Offer ID (SKU), Item Title, and the exact policy failure reason.
* **Store Lookup:** Query the database for the active store matching the Merchant Account ID. If no active store is registered for that ID, gracefully discard the message and log the anomaly.
* **Incident Lifecycle Logic:**
  * If an unresolved incident already exists for this exact store, SKU, and issue code: Update the last-detected timestamp rather than creating a duplicate row.
  * If the event indicates that a previously flagged SKU is now approved: Automatically transition the existing open incident to a resolved state.
  * If the event represents a new rejection: Insert an active incident record marked as unresolved, setting the severity level according to whether the item is completely blocked or merely demoted.

### Stage 6: Outbound Alert Dispatch
* **Rate Limiting & Spike Guard:**
  * Check the volume of incidents generated for this specific store within the last 60 seconds.
  * If the count exceeds the bulk threshold (e.g., 10 or more SKUs flagged in one minute due to a major catalog feed error), suppress individual messages and dispatch a single aggregated summary alert.
* **Payload Construction:** Format the alert card containing:
  * Store Name and Environment Indicator.
  * Impacted Product Title and SKU.
  * Policy Failure Code and human-readable explanation.
  * A direct deep-link navigating to the product editing screen within the store's e-commerce backend.
  * A direct deep-link to the item diagnostics view inside Google Merchant Center.
* **Delivery:** Send the alert to the store's configured notification destination. If the external platform returns an invalid destination error (e.g., deleted webhook), mark the store's alert configuration as degraded in the database so the user can be notified upon their next dashboard login.

---

## 3. Mandatory Security Standards

1. **Insecure Direct Object Reference (IDOR) Elimination:**
   * Every single database read, update, or deletion requested by a user (updating store settings, dispatching test pings, acknowledging incidents) must enforce composite authorization.
   * Never query or mutate a record solely by its item identifier. The query criteria must explicitly require both the item identifier AND the authenticated session user's identifier.
2. **Session & Token Protection:**
   * User session cookies must enforce strict HTTP-only, secure transport, and same-site flags.
   * Google OAuth refresh tokens stored in the database must be treated as sensitive credentials and encrypted at rest using the application's master encryption secret.
3. **Open Redirect Mitigation:**
   * Post-login redirection targets must be strictly validated.
   * Only internal relative destinations starting with a single forward slash are permitted. Any destination containing external hostnames, protocols, or double slashes must be discarded, falling back to the primary dashboard.
4. **Input Sanitization:**
   * User-submitted webhook destinations must be validated against expected protocol schemes and destination formats before any network connection is attempted.

---

## 4. Reliability & Failure Recovery Rules

* **Database Connection Pooling:** All database interactions must use pooled, resilient connection management to avoid connection exhaustion under sudden Pub/Sub delivery spikes.
* **Time-to-Acknowledgment Discipline:** Database queries within the webhook receiver must remain lean. Perform only the deduplication check, incident upsert, and webhook dispatch. Heavy analytics calculations, historical reporting, and audit aggregations must never run inside the ingestion loop.
* **Safe Error Handling:** Catch and handle all third-party network exceptions. A failure while delivering a Slack notification must not prevent the incident from being recorded in the database, nor should it trigger a 500 error back to Google that causes infinite delivery retries.