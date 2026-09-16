# usekultra.com — Fix Instructions

Two categories below: (A) design-system compliance against `GEMINI.md`, (B) conversion/copywriting changes. Both are based on the live site as of this crawl. Make every change listed — none are optional polish, each ties to a specific problem.

---

## A. Design-system compliance

### A1. Hero (already partially audited, confirm all landed)
- Button radius on "Start monitoring feed" and "View live triage demo": change to `--radius-sm` (3–4px). Audit every other button site-wide for the same fix — pricing CTAs, footer links, "Apply for..." buttons, "Edit in Shopify Admin," "Submit pilot application."
- Nav link color (How It Works / Architecture / Integrations / Pricing / FAQ): change from the current muted violet-gray to `--ghost-text` default / `--ink-primary` hover. No third accent color anywhere on the site.
- Hero subheadline copy ("Google will not text you...") contrast: move off `--ghost-text-dim` to `--ghost-text` or `--ink-secondary` for AA compliance.
- Confirm the account-switcher-style status dots (see A4) are static.
- Hero H1 weight: reduce from bold/black to 600 (Fraunces spec, §2).

### A2. "Engineered for high-volume merchant stacks" (4-card integration section)
- These four cards (Push Ingest / Catalog Protocol / Deep Links / Incident Dispatch) currently look like identical bordered boxes. Differentiate by state per §5: these are all "live" integrations, so all four can carry a light `--signal-wash` background — but if any are not yet live/connected for a given account, that card must switch to the ghost treatment (desaturated icon, `--ghost-heading` title) rather than staying visually identical to the active ones.
- Eyebrow labels ("Push Ingest," "Catalog Protocol," etc.) and the small stat lines ("< 18s latency," "Instant sync") should be mono, `--text-mono-sm`, sentence case — audit for any uppercase-tracked styling and fix per the typography rule (no uppercase outside genuine system codes).

### A3. "The cost of silence" comparison section
- This is the exact ghost/signal panel from `GEMINI.md` §0 — confirm the live implementation actually uses `--ghost-*` tokens on the "5-day blindspot" side and `--signal` on the "sub-3-minute remediation" side, not a leftover red/green pair from the original mockup screenshot.
- Timeline items (Day 1 / Day 2 / Day 4 / Day 5, and 0s / 18s / 24s / 3m): confirm dot-and-connecting-line pattern from §9, not numbered chip badges — these are genuinely time-sequenced, so dots+line is correct.
- "Average lost revenue per incident $4,800+" and "Protected ad spend $0.00 downtime" — these are real stat callouts, should be `--text-mono-xl` treatment, not the same weight as body copy.

### A4. "Incident dispatch" Slack mockup
- "Pub/Sub stream live" and "Webhook active" indicators: confirm these are static dots, zero animation. This is the single highest-risk spot for a looping pulse to sneak in (§17) — audit explicitly, don't assume.
- The Slack message card itself should follow the flat-card rule (§5): `--bg-surface`, hairline border, no drop shadow, no glassmorphism/blur.

### A5. Architecture comparison table
- "Dormant" and "Merchant API v1" header tags: apply the exact §7 pill/tag component (radius-pill, mono, bordered) — currently reading as ad-hoc inline text labels rather than the reusable tag component.
- Wrap the table in `overflow-x: auto` per the responsive rule — do not let it force horizontal page scroll on mobile.
- The "Legacy feed tools" column is a ghost-context column throughout (past/inferior approach) and "Kultra Sentinel Engine" is the signal-context column — apply ghost/signal text and border tinting consistently down every row, not just the header.

### A6. Pricing cards
- "Recommended for agencies" badge on the PPC Agency card: confirm `--signal` text on `--signal-wash` background, not a gradient or second accent color.
- Feature-list checkmarks: outline check icon in `--ghost-text`/`--signal`, never a filled colored circle-check icon.
- Button radius fix applies here too (see A1).

### A7. Pilot application form
- Form inputs (Work Email, Agency Website Domain, dropdowns) must follow the `.input` spec in §6 exactly: `--bg-canvas` background, `--hairline-strong` border, `--signal` focus ring via `--signal-glow`, not a browser-default focus outline.
- Radio-style "Account Type" selector (Shopify Merchant / PPC Agency): style as a segmented control using button/tag grammar, not native radio buttons.

### A8. Sitewide AI-slop check (§17)
- Grep all copy for em-dash constructions and middle-dot separators — none currently spotted in the crawled copy, but re-check after other edits are made, since new copy is being added per section B below.
- Confirm no fade-in-on-scroll entrance animations were added anywhere (common default when sections are rebuilt).
- Confirm the favicon/loading icon doesn't add a spinner-pulse — static or single-fade only.
also there are some texts who are extremely soft and do not have enough contrast with the background. fix those
---

## B. Conversion & copywriting changes

### B1. Unify CTA language around the free 7-day trial (correction — there IS a real free trial)
**Important fact that changes this whole section: Kultra offers a free 7-day trial.** This wasn't reflected anywhere in the crawled copy or in the earlier audit — it needs to be the headline offer across the funnel, not buried. A concrete, time-boxed free trial is one of the strongest conversion levers available and is currently invisible on the page.

Current state has four different, and now inaccurate, CTA verbs:
- Nav: "Start trial" (correct instinct, but doesn't say "free" or "7-day" — underselling its own strongest offer)
- Hero: "Start monitoring feed"
- Pricing: "Apply for Merchant pilot" / "Apply for Agency pilot"
- Form: "Submit pilot application"

**Fix:** Standardize the entire funnel around the free-trial offer instead of application/pilot framing (application framing implies a review gate, which adds friction the free trial doesn't need to have).
- Nav: change "Start trial" → **"Start free 7-day trial"**
- Hero primary CTA: change to **"Start your free 7-day trial"** (replaces "Start monitoring feed" — the trial is a stronger, more concrete promise than a vague action verb). Keep "View live triage demo" as the secondary CTA unchanged.
- Pricing CTAs: change "Apply for Merchant pilot" / "Apply for Agency pilot" → **"Start free 7-day trial"** on both cards. Add a small line under each price: **"Free for 7 days, then $19/mo"** (or $99/mo) so the trial and the eventual price are both visible together — never show one without the other.
- Form submit button: change "Submit pilot application" → **"Start my free trial"** (matches the now-consistent funnel language; drop "Get my feed audit" as an alternative unless the trial and the audit are genuinely two different things — if they're the same thing, "Start my free trial" is the stronger, more concrete promise of the two).
- If the underlying flow genuinely still requires manual review before the trial activates, say so plainly next to the button in small text ("Reviewed within 24h" or similar) — don't let the button promise instant access if there's still a review step behind it. This document assumes the trial itself is not gated by review; correct the copy below if that assumption is wrong.

### B2. (Resolved) "Start trial" is accurate — just needs to be more specific
The earlier audit flagged "Start trial" as an over-promise because no free trial was visible anywhere on the page — it looked like marketing language for what was actually an application process. Now that the free 7-day trial is confirmed real, the fix isn't to remove trial language, it's to make it specific and consistent everywhere per B1 above ("free," "7-day," and the post-trial price all stated together, every time).

### B3. Add a direct non-mutation FAQ entry
The current FAQ ("Why doesn't Google Merchant Center alert me immediately...", "How does Kultra link directly to my specific Shopify product admin?", etc.) never directly addresses the biggest objection to granting API access: *will this tool ever write to or break my catalog?*

**Add this FAQ entry**, positioned second (right after the "why doesn't Google alert me" one, since that's what establishes the problem — this should immediately follow with the safety answer):

> **Does Kultra ever modify my product feed or campaign settings?**
> No. Kultra requests Google Merchant API access exclusively for passive health monitoring, diagnostic reporting, and event subscription. Kultra's codebase does not modify, create, update, or delete your product feeds, prices, listings, or campaign settings — full stop. Every fix is executed by you, in one click, directly inside Shopify Admin or Google Merchant Center. Kultra only ever watches and reports.

### B4. Re-anchor the cost-of-inaction stat next to pricing
"$4,800+ average lost revenue per incident" currently appears only in the "cost of silence" section, several scrolls above pricing. By the time a visitor reaches the $19/mo price, the anchor has faded from memory.

**Add a single line directly above or beside the pricing cards**, e.g.:
> One prevented disapproval covers **250 months** of Solo Merchant pricing.

(Adjust the exact multiple if you want to recompute from the real $4,800 stat ÷ $19 — the point is making the arithmetic explicit right where the price is shown, not just implied elsewhere on the page.)

### B5. Surface urgency AND the free trial near the hero CTA, not just at the bottom
The scarcity framing ("Onboarding a select cohort of 10 boutique PPC agencies and 25 Shopify merchants") only appears in the pilot section near the bottom of the page, and the free trial doesn't appear near the hero at all. Add a short, honest line under the hero CTA buttons combining both:

> Small mono line under the hero buttons: `Free 7-day trial, no credit card required — limited pilot cohort this month (10 agency / 25 merchant seats).`

Keep the scarcity numbers factual and specific (matches the real numbers already used lower on the page) — do not inflate or fabricate a countdown/timer, which would read as manipulative rather than genuinely scarce. The "no credit card required" detail is doing real conversion work here too — free trial + zero payment friction removed is a materially stronger hook than either fact alone.

### B6. State the free-trial-to-paid billing transition explicitly
Now that the trial is confirmed free and (per B1) not application-gated, the previous ambiguity about "no credit card required" vs. the listed $19/$99 monthly prices has a clean answer — it just needs to be stated everywhere the price appears, not left implied:

**Standard line to reuse across pricing cards, the form, and the FAQ:**
> Free for 7 days, no credit card required. After your trial ends, continue for $19/mo (Solo Merchant) or $99/mo (PPC Agency) — cancel anytime before then and you won't be charged.

Use this to directly answer the existing empty FAQ question **"What happens during the pilot? How fast do I get access after applying?"** — rewrite that question itself to **"What happens after my free trial ends?"** if the "pilot application" framing is being retired in favor of instant trial signup per B1.

### B7. Fill in the empty FAQ answers
The crawl shows several FAQ questions with no visible answer content:
- "How does Kultra link directly to my specific Shopify product admin?"
- "Does Kultra require a Shopify app installation or slow down storefront performance?"
- "How does Kultra handle Google's migration from Content API to Merchant API v1?"
- "What happens during the pilot? How fast do I get access after applying?"

Confirm whether these are genuinely empty or just collapsed accordion panels not captured by the crawl. If genuinely empty, write direct answers — the page copy elsewhere already has the raw material (e.g. "Zero theme scripts, zero tracking pixels, and zero impact on storefront page speed" answers the second question almost verbatim; the architecture comparison table answers the third).

---

## Priority order for implementation
1. **B1 (free 7-day trial messaging)** — this is a missing headline offer, not a polish item. Every CTA on the page currently undersells or misrepresents the actual offer. Fix this first.
2. B3 (non-mutation FAQ) and B6 (trial-to-paid billing clarity) — these directly affect trust and click-through at the point of conversion.
3. A1, A4, A5, A6 (visible design-system violations most likely to already exist in the live build).
4. B4, B5, B7 — remaining copy/positioning refinements.
5. A2, A3, A7, A8 — deeper audit pass once the above are live.