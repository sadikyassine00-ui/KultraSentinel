# Architectural Directive: Decouple Tenant Workspace from Admin Console

Implement a dedicated public customer route (/dashboard) and role-aware routing architecture. Do not alter the core triage logic inside TenantTriageCenter.tsx or api/dashboard/route.ts. Focus entirely on layout isolation, route separation, and role-based session guarding.

---

### 1. Update Authentication & Session Roles (`src/lib/token.ts`)
- Remove the hard rejection error ("The user dashboard is currently in private pilot") for non-admin emails during standard login.
- Introduce role tagging in the session token payload:
  - If `ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())` -> `role = 'admin'`
  - Otherwise -> `role = 'user'`
- Ensure the role is cryptographically signed inside the session cookie alongside the user's email and ID.

---

### 2. Update Edge Route Guarding (`middleware.ts`)
Enforce strict boundary separation:
1. **Public/Guest Routes (`/login`, `/register`):**
   - If an authenticated session with `role === 'admin'` visits `/login`, redirect to `/admin/dashboard`.
   - If an authenticated session with `role === 'user'` visits `/login`, redirect to `/dashboard`.
2. **Customer Routes (`/dashboard/:path*`):**
   - Requires any authenticated session (`admin` or `user`).
   - Unauthenticated visitors redirect to `/login?callbackUrl=/dashboard`.
3. **Super Admin Perimeter (`/admin/:path*`):**
   - `/admin/login`: Accessible to unauthenticated visitors. If an authenticated admin visits, bounce to `/admin/dashboard`.
   - `/admin/dashboard/:path*`: Requires `role === 'admin'`. If a user with `role === 'user'` attempts access, reject with HTTP 403 or redirect directly to `/dashboard`.

---

### 3. Create the Dedicated Tenant Interface (`src/app/dashboard/`)
1. **Create `src/app/dashboard/layout.tsx`:**
   - Design a minimal, clean merchant navigation bar.
   - Include: Kultra brand logo, store selector dropdown, "Catalog Shield: Active" indicator, and user profile/logout menu.
   - Strictly exclude any internal admin telemetry, super-admin sidebar tabs, DLQ inspection tools, and platform analytics.
2. **Create `src/app/dashboard/page.tsx`:**
   - Mount `TenantTriageCenter.tsx` inside this layout.
   - Pass the authenticated session directly to the triage component.
   - Handle the `?just_connected=true` URL search parameter to automatically trigger State B ("Arm Your Alarm" Slack modal) upon returning from OAuth.

---

### 4. Adjust OAuth & Post-Login Callbacks
1. In `/api/auth/merchant/callback`:
   - Inspect the authenticated session role.
   - If `role === 'user'`, redirect to `/dashboard?just_connected=true`.
   - If `role === 'admin'`, redirect to `/admin/dashboard?tab=triage&just_connected=true`.
2. Ensure `/login` and `/register` form handlers complete login without forcing a redirect to `/admin/*`.

---

### 5. Verification Requirements
Verify the following before marking this complete:
1. Log in with a non-whitelisted email: verify successful access to `/dashboard` and that the zero-store onboarding funnel (State A) renders cleanly.
2. While logged in as a standard user, attempt to navigate to `/admin/dashboard`: verify immediate rejection and redirection to `/dashboard`.
3. Log in with an admin email: verify access to both `/admin/dashboard` and `/dashboard`.
4. Ensure `npm run build` compiles with 0 route or TypeScript errors.