# Design System — "Ghost / Signal"

This document defines the visual language for the entire app. It is written to be handed directly to an engineering agent implementing UI. Follow it literally: exact values, not approximations. Where a decision isn't covered here, default to restraint — quiet, not decorative.

---

## 0. Core idea (read this first)

The whole visual system is built on one metaphor: **ghost vs. signal**.

- **Ghost** = anything dormant, past, disabled, unmonitored, or "before." Desaturated, low-contrast, quiet.
- **Signal** = anything live, active, current, protected, or "after." The one accent color in the entire app, used sparingly and only for things that are actually alive right now.

Every component below is really just an expression of this duality. A button's default state is "ghost." Its hover/focus/active states are shades of "signal." A disabled state is "ghost" and stays ghost no matter what. This isn't a metaphor for one screen — it's the operating logic of every element in the product. When in doubt about how to style something, ask: "is this dormant or is this alive right now?" and style accordingly.

Do not introduce a second accent color anywhere in the product. One signal color, used consistently, is what makes it read as intentional rather than templated.

---

## 1. Color tokens

```css
:root {
  /* base */
  --bg-canvas:      #0a0b0d;   /* app background */
  --bg-surface:     #0e0f11;   /* card / panel background */
  --bg-surface-2:   #131418;   /* nested surface, one level up */
  --hairline:       rgba(255,255,255,0.08);   /* all borders/dividers */
  --hairline-strong: rgba(255,255,255,0.14);  /* borders that need to read on hover */

  /* ghost (dormant / inactive / "before") */
  --ghost-text:     #6b7078;   /* secondary/body text on dark */
  --ghost-text-dim: #45484f;   /* tertiary text, timestamps, labels */
  --ghost-line:     #3a3d43;   /* inactive icon strokes, disabled borders */
  --ghost-heading:  #cfcdc8;   /* headings in a dormant/ghost context */

  /* signal (active / live / "after") — THE accent, do not add a second one */
  --signal:         #f2a93b;
  --signal-dim:     #7a5a26;   /* muted signal for borders/backgrounds */
  --signal-glow:    rgba(242,169,59,0.35);   /* focus rings, active glows */
  --signal-wash:    rgba(242,169,59,0.06);   /* subtle background tint */

  /* content on dark */
  --ink-primary:    #f4f1ea;   /* primary text / headings */
  --ink-secondary:  #b9b3a5;   /* body copy */

  /* semantic (used ONLY where the product must show true error/danger —
     never for ordinary "before/after" or "inactive/active" contrasts,
     which are always ghost/signal) */
  --danger:         #d64545;
  --danger-wash:    rgba(214,69,69,0.08);

  /* paper (rare — inverted surfaces, e.g. tooltips, seam badges) */
  --paper:          #f4f1ea;
  --paper-ink:      #111214;
}
```

Rules:
- `--danger` exists only for destructive confirmation and true system failure states (payment failed, delete this forever). It is not a substitute for "before" states — those stay ghost, not red. This is a deliberate break from the red/green convention: ghost/signal carries the "before/after" meaning everywhere else in the product.
- Never use pure black (`#000`) or pure white (`#fff`). Always the tokens above.
- Gradients are permitted only as a **wash** (`--signal-wash` radiating from one corner, ~5–8% opacity) behind a signal-state surface — never as a decorative bar, never on ghost surfaces.

---

## 2. Typography

Three families, three jobs. Do not add a fourth.

| Role | Family | Notes |
|---|---|---|
| Display / headings | `Fraunces` (serif, optical sizing) | weights 400/600/700. Used for H1–H3 only. |
| Body / UI text | `Inter` | weights 400/500/600. Everything that isn't a heading or data. |
| Data / labels / timestamps / code | `IBM Plex Mono` | weights 400/500. Numbers, timers, eyebrows, badges, table figures. |

```css
--font-display: 'Fraunces', serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'IBM Plex Mono', monospace;
```

Type scale (desktop):

| Token | Size / Line-height | Family | Use |
|---|---|---|---|
| `--text-h1` | 34px / 1.15, tracking -0.01em | display, 600 | Page-level headline |
| `--text-h2` | 26px / 1.2 | display, 600 | Section / card headline |
| `--text-h3` | 18px / 1.3 | display, 600 | Subsection |
| `--text-body` | 14.5px / 1.55 | body, 400 | Paragraph copy |
| `--text-body-sm` | 13px / 1.5 | body, 400 | Secondary copy, helper text |
| `--text-label` | 12.5px / 1.4 | body, 600 | Form labels, button text |
| `--text-mono-lg` | 14px / 1.3 | mono, 500 | Key data figures |
| `--text-mono-sm` | 10.5–11px / 1.4, tracking 0.02em | mono, 400 | Eyebrows, timestamps, tags |

Rules:
- Headings never take the accent color as a decorative treatment (no single colored word inside a headline).
- No `text-transform: uppercase` on body or label text. Mono eyebrows are the **only** place uppercase is allowed, and even there, prefer sentence case unless the label is genuinely a system code (e.g. `EVT_402`).
- Line length for body text: max ~70ch.
- Never use a system font stack as fallback-only silent substitution — if the three fonts fail to load, fall back to `Georgia` for display and `system-ui` for body/mono, but treat font-load failure as a bug to fix, not a state to design around.

---

## 3. Spacing, radius, elevation

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 40px;
--space-8: 56px;

--radius-sm: 3px;   /* inputs, buttons, tags */
--radius-md: 4px;   /* cards, panels */
--radius-pill: 100px; /* badges, seam labels, avatars only */
```

Rules:
- Radius is **not decoration** — it's a size-coded signal. Small interactive elements (buttons, inputs, tags) get `--radius-sm`. Containers (cards, modals, panels) get `--radius-md`, deliberately smaller than the SaaS-template default of 12–16px. Pills are reserved for genuinely round content (avatars, status dots, the seam-badge pattern) — not applied to every chip and button as a default.
- No drop shadows for elevation. Elevation is communicated by:
  1. a 1px hairline border (`--hairline`), and
  2. a background one step lighter (`--bg-surface` → `--bg-surface-2`).
- If a floating element (dropdown, modal, tooltip) needs separation from content behind it, use a large soft shadow only there: `0 16px 40px rgba(0,0,0,0.5)`. Never apply shadows to cards sitting flat in a layout.

---

## 4. Buttons

Buttons follow ghost/signal directly: unclicked = ghost-adjacent (quiet), primary action = signal.

### Primary button (the one signal action per screen)
```css
.btn-primary {
  background: var(--signal);
  color: #1a1305;              /* dark text on the light accent, not white */
  border: 1px solid var(--signal);
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  font: 600 var(--text-label) var(--font-body);
  transition: background 120ms ease, transform 80ms ease;
}
.btn-primary:hover  { background: #f6b855; }
.btn-primary:active { background: #d9932a; transform: scale(0.98); }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--signal-glow);
}
.btn-primary:disabled {
  background: var(--ghost-line);
  border-color: var(--ghost-line);
  color: var(--ghost-text-dim);
  cursor: not-allowed;
}
```

### Secondary button (ghost by default)
```css
.btn-secondary {
  background: transparent;
  color: var(--ink-secondary);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  font: 600 var(--text-label) var(--font-body);
  transition: border-color 120ms ease, color 120ms ease;
}
.btn-secondary:hover  { border-color: var(--signal-dim); color: var(--ink-primary); }
.btn-secondary:active { border-color: var(--signal); }
.btn-secondary:focus-visible { box-shadow: 0 0 0 3px var(--signal-glow); }
```

### Destructive button
Same shape as secondary, but hover/active shift toward `--danger` instead of `--signal`. Never make a destructive action the visually loudest thing on a screen — it earns emphasis through a confirmation step, not through color intensity.

### Text / link button
No border, no background, ever. `color: var(--ghost-text)`, underline appears only on hover (`text-decoration: underline; text-underline-offset: 3px`), color shifts to `--ink-primary` on hover. Never colors itself `--signal` just because it's a link — signal is reserved for state, not for "this is clickable."

Rules for all buttons:
- One primary button per view. If a screen seems to need two, one of them is actually secondary — decide which.
- No icon-only button without an accessible label and a tooltip on hover (appears after 400ms, not instantly).
- Button text is a verb phrase describing the actual result ("Save changes," not "Submit" or "OK").

---

## 5. Cards & panels

- Background `--bg-surface`, border `1px solid var(--hairline)`, radius `--radius-md`.
- No two cards should look identical if they mean different things. A card representing a dormant/past state should visually read as **ghost** (desaturated icon, `--ghost-heading` for its title, muted border) even if its container shape is the same as a "live" card, which gets the `--signal-wash` radial background and a `--signal`-tinted border.
- Padding: `--space-6` top, `--space-5` sides/bottom, standard.
- Card hover (only if the card is clickable/navigable): border brightens to `--hairline-strong`, no shadow, no lift/translate. Transition: `border-color 150ms ease`.
- Never apply the same soft grey box-shadow under every card — this system uses zero card shadows, full stop (see §3).
- Dividers inside a card are `1px solid var(--hairline)`, never a visible drop-shadow line.

---

## 6. Form inputs

```css
.input {
  background: var(--bg-canvas);
  border: 1px solid var(--hairline-strong);
  border-radius: var(--radius-sm);
  color: var(--ink-primary);
  font: 400 var(--text-body) var(--font-body);
  padding: 10px 12px;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.input::placeholder { color: var(--ghost-text-dim); }
.input:hover   { border-color: var(--ghost-text); }
.input:focus   { border-color: var(--signal); box-shadow: 0 0 0 3px var(--signal-glow); outline: none; }
.input:disabled{ background: var(--bg-surface); color: var(--ghost-text-dim); border-color: var(--hairline); }
.input.error   { border-color: var(--danger); }
```

- Labels sit above the field, `--text-label`, `--ghost-text` color, `--space-2` gap below.
- Helper/error text sits below the field, `--text-body-sm`. Error text uses `--danger`; it never uses signal-colored text for an error, ever — signal means "healthy and active," not "attention needed."
- Checkboxes/radios/toggles: unchecked = ghost outline only; checked = filled `--signal` background. Toggle animation: thumb slides over `150ms cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 7. Tags, badges, status pills

- One visual grammar only: `font: 500 var(--text-mono-sm) var(--font-mono)`, `padding: 4px 10px`, `border-radius: var(--radius-pill)`, `border: 1px solid`.
- Ghost/dormant tag: `border-color: var(--ghost-line); color: var(--ghost-text);` transparent background.
- Signal/active tag: `border-color: var(--signal-dim); color: var(--signal); background: var(--signal-wash);`
- Danger tag: same shape, `border-color`/`color` from `--danger`.
- Do not invent a fourth tag color. Do not vary tag shape by context — the pill grammar is the whole point; consistency here is what will read as "designed," not sameness-as-laziness, because it's the *only* place pills are used repeatedly and it's semantically justified (status is genuinely categorical).

---

## 8. Data visualization

This app shows real operational data (events, timings, traffic). Charts must show real data shape, not decorative curves.

- Line charts: `stroke-width: 2–2.25px`. Ghost/before series: `--ghost-text` stroke. Signal/after or live series: `--signal` stroke.
- Mark real events as small circles (`r: 3.5px`) at the data point, not as generic dots along a smooth curve. An open circle (`fill: var(--bg-canvas); stroke: [series color]`) marks an event start; a filled circle marks resolution/completion.
- Gridlines: `stroke: var(--hairline)`, `stroke-width: 1px`, never more than 2 per chart (avoid a busy grid).
- Never use a smoothed/bezier interpolation to imply data that wasn't measured — use straight segments (`linear` or `step`) unless the underlying metric is genuinely continuous.
- Axis labels: `--text-mono-sm`, `--ghost-text-dim`, positioned outside the plot area, never rotated.
- No gradient fill under line charts as decoration. A fill is permitted only if it represents a real cumulative quantity (area = total).

---

## 9. Timelines / sequences

Use the connected vertical-line-with-dots pattern (not repeated identical cards) whenever content is a genuine sequence of events over time:

- A 1px vertical line (`--ghost-line`, or `--signal-dim` in a signal context) connects dot markers.
- Each dot: 9px circle, background `--bg-canvas`, 1.5px border in the ghost or signal color; active/current step gets a `box-shadow: 0 0 0 3px var(--signal-glow)`.
- Timestamp in mono above the title, title in body-600, description in body-sm/ghost-text.
- Do not use numbered badges (01/02/03) for sequences — the dot-and-line already encodes order. Numbered chip badges are reserved for content that is a sequence but NOT time-based (e.g. ranked list, steps in a wizard with no duration attached).

---

## 10. Motion

One rule above all: **motion answers an action, it doesn't decorate a load.**

- No fade-in/slide-up entrance animations on page load or on scroll into view. Content appears immediately.
- No hover animation on every card by default. Hover feedback exists only on interactive elements (buttons, inputs, clickable cards, tabs) and is a property transition (color/border/background), never a transform-based "lift."
- Permitted transform-based motion: `:active` states on buttons (`scale(0.98)`), toggle thumbs sliding, an accordion/panel expanding or collapsing height, a modal/tooltip entrance.
- Standard durations:
  - Micro (color, border, opacity on hover/focus): **120–150ms**, `ease` or `cubic-bezier(0.4,0,0.2,1)`.
  - Structural (expand/collapse, modal in/out, drawer): **200–250ms**, `cubic-bezier(0.4,0,0.2,1)` in, `cubic-bezier(0.4,0,1,1)` out.
  - Active/press feedback: **80ms**, linear.
- One moment per flow is allowed to be more expressive: the exact instant a "before" state flips to a "resolved/signal" state (a status changing live, an alert clearing). That transition gets a single non-repeating flash — `box-shadow` expands to `--signal-glow` and fades out once, ~400ms, `ease-out`. It fires exactly once, on the state change, and never loops. This is different from a pulsing/breathing animation (see §17) — a pulse repeats indefinitely to draw attention to something static; this flash fires once because something real just changed.
- Respect `prefers-reduced-motion`: disable the flash and any transform-based motion; keep only opacity/color transitions capped at 100ms.

---

## 11. Empty, loading, and error states

- Empty states: not decorative illustrations. A short sentence in `--ghost-text` explaining what will appear here and, if applicable, a single secondary button to create the first item. Icon (if any) is a simple outline stroke in `--ghost-line`, never colored.
- Loading: static skeleton blocks using `--bg-surface-2` on `--bg-surface`. No shimmer sweep, no breathing/pulsing opacity loop — skeletons hold still. When real content arrives, it replaces the skeleton with a single 150ms opacity fade-in, not a loop of any kind.
- Errors speak in the interface's voice, stating what happened and the fix, never apologizing ("Payment failed — check your card details and try again," not "Oops! Something went wrong"). Error surfaces use `--danger-wash` as a subtle full-width background band above the relevant field, not a red-bordered card floating in space.

---

## 12. Iconography

- Outline style only, 1.5px stroke, no filled icons except for small status dots.
- Default icon color: `--ghost-text`. On hover/active/selected: `--signal` or `--ink-primary` depending on context — never both an icon color change AND a background change for the same interaction unless it's a toggle/selected state.
- Icon size: 16px inline with text, 20px standalone in buttons/nav.

---

## 13. Accessibility floor (non-negotiable)

- All interactive elements have a visible `:focus-visible` state using the `--signal-glow` ring pattern shown above — never remove `outline` without replacing it.
- Color is never the only signal: ghost/signal/danger states are paired with icon, label, or position changes too, so the product remains legible for color-blind users.
- Minimum contrast: body text on `--bg-canvas`/`--bg-surface` must meet WCAG AA (4.5:1). Check `--ghost-text-dim` usage — it's for tertiary/decorative labels only, never for content the user must read to use the product.
- Hit targets minimum 40×40px regardless of visual size.
- Motion beyond opacity/color must respect `prefers-reduced-motion: reduce` (see §10).

---

## 14. What to avoid (explicit anti-patterns for this app)

- A second accent color anywhere, for any reason.
- Drop shadows under flat cards.
- Rounded-pill shape applied to anything that isn't a tag/badge/avatar/seam-label.
- Uppercase body or button text.
- Fade/slide entrance animations on scroll or page load.
- Decorative gradients under charts.
- Red/green as the default "bad/good" contrast — that job belongs to ghost/signal everywhere except true destructive/danger actions.
- Numbered (01/02/03) badges on non-sequential content.
- Any icon-only button without a label.

---

## 15. Background — the line-network motif

The app's background already has a distinct identity: a sparse constellation of thin connecting lines and nodes. This is a brand asset, not a placeholder — preserve it everywhere and formalize it as follows.

```css
--network-line: rgba(255,255,255,0.06);   /* line stroke */
--network-node: rgba(255,255,255,0.14);   /* node fill */
--network-node-signal: rgba(242,169,59,0.4); /* rare — a node near live/signal content */
```

- Implementation: one fixed, full-viewport SVG (or canvas) layer, `position: fixed; inset: 0; z-index: 0; pointer-events: none;`, sitting directly on `--bg-canvas` beneath all content layers.
- Composition: sparse and irregular — a handful of nodes (1.5–2px radius circles) per viewport connected by straight 1px lines at oblique angles, like a loose constellation, not a dense mesh or grid. Irregular spacing reads as intentional; a perfectly even grid reads as a "network background" stock asset.
- Color: monochrome, `--network-line` / `--network-node` only. A node may tint toward `--network-node-signal` only where it sits directly behind genuinely live/signal content (e.g. behind an active status card) — this should be rare, a hint rather than a decoration.
- Motion: static by default. If motion is used at all, it must be an extremely slow, barely-perceptible drift (30s+ per cycle) of node positions — never fast movement, never a mouse-follow parallax effect, never a "particles connecting" burst on interaction. Those are the generic interactive-background clichés this system explicitly avoids.
- Where to show it: full strength on marketing pages, auth screens, and empty states. On dense dashboard interior views (tables, multi-panel data screens) drop it to `--bg-canvas` alone — the network competes with real charts and tables and the product needs to win that contrast fight. On dashboard overview/summary screens, keep it at reduced density (roughly half the node count) behind the page background only, never behind cards or panels themselves.
- The network must never reduce text/foreground contrast below the WCAG AA floor in §13 — it sits behind `--bg-canvas`, not behind text directly.

---

## 16. Dashboard components

### Sidebar
- Width: 240px expanded, 64px collapsed (icon-only). Background `--bg-surface`, right edge `1px solid var(--hairline)`.
- Nav item: icon (`--ghost-text`, 20px) + label (`--text-body`, `--ghost-text`), `--space-3` vertical padding, full-width row, `--radius-sm` on the hover background only (the row itself has no radius against the sidebar edge).
- Hover: background `--bg-surface-2`, label color → `--ink-primary`. Transition 120ms, color/background only.
- Current page: `2px solid var(--signal)` left border flush against the sidebar edge, background `--signal-wash`, icon and label → `--ink-primary` (not full `--signal` text — the left bar alone carries the "this is active" meaning; don't double it with colored text too).
- Section dividers between nav groups: `1px solid var(--hairline)`, `--space-4` margin above/below, optional `--text-mono-sm` group label in `--ghost-text-dim` (sentence case, not uppercase-tracked).
- Collapsed state: icon only, centered; tooltip with the label appears on hover after 400ms, to the right of the icon, using the paper/dark tooltip surface from §3's floating-element shadow rule.
- No pill-shaped or fully-rounded nav items. No colored icon "badges" with unread-count bubbles unless the count is real and meaningful — and when used, the count bubble is a small `--radius-pill` chip in `--signal-wash`/`--signal`, sized to content, never animated.

### Top bar
- Height: 56–64px, `1px solid var(--hairline)` bottom border, background `--bg-canvas` (flush with page, not a separate surface).
- Breadcrumb: `--text-mono-sm`, `--ghost-text-dim`, segments separated by a plain `/` with a space on each side — not a middle dot, not a chevron icon, not an em dash.
- Search field: standard `.input` styling from §6, width-constrained, not full-bleed.
- Account/user menu: circular avatar (the one place a full circle is earned — a person's identity, not decoration), 32px, `1px solid var(--hairline)` ring by default. An online/active status dot (static, not pulsing) may sit at the avatar's corner in `--signal`.

### Stat / metric cards (dashboard KPIs)
- Big figure in mono: introduce `--text-mono-xl` (32px / 1.1) for the headline number, label (`--text-label`, `--ghost-text`) above it.
- Change/delta indicator: a small arrow (up/down/flat) plus a mono value. Color follows ghost/signal/danger by what the change *means for the user*, not by direction alone — an increase in "orders shipped" is signal-colored, an increase in "failed syncs" is danger-colored, and a flat/negligible change is ghost. Never default to green-up/red-down without checking whether up is actually good for that specific metric.
- No sparkline-as-decoration behind the number unless it's real recent history — if included, follow the §8 chart rules (straight segments, real event marks, no gradient fill unless it's a true cumulative area).

### Tables
- Row divider: `1px solid var(--hairline)` only — no zebra striping.
- Header row: `--text-mono-sm`, `--ghost-text-dim`, sentence case. A sort affordance (small arrow icon) appears on hover of a sortable header, not permanently visible on every column.
- Row hover: background → `--bg-surface-2`, 120ms transition.
- Selected row: background `--signal-wash`, `2px solid var(--signal)` left border — same visual grammar as the sidebar's active-item pattern, for consistency.
- Pagination controls: plain text/number buttons (`.btn-secondary`-style on hover only), not a row of filled pill buttons.

### Filters, dropdown menus, popovers
- Same shape language as inputs/buttons (§4/§6): `--radius-sm`, `--hairline-strong` border, `--bg-surface` background.
- Entrance: 180–200ms, `cubic-bezier(0.4,0,0.2,1)`, opacity + a small (4–6px) upward translate on open — no spring/bounce easing (see §17).
- Multi-select filter chips reuse the tag grammar from §7 exactly — don't invent a second chip style for filters.

---

## 17. AI-slop checklist — read before shipping anything

This is the explicit list of tells that make an interface look AI-generated rather than designed. If you're about to ship any of these, stop and use the alternative described elsewhere in this document instead.

**Motion**
- ❌ Looping/breathing "pulse" animations on anything — status dots, skeleton loaders, glowing card borders, notification badges. If it repeats forever to draw attention to something that isn't actually changing, cut it. → Use static states; reserve motion for real, one-time state changes (§10).
- ❌ Shimmer sweeps across skeleton loaders.
- ❌ Spring/bounce easing on menus, modals, or buttons (the "overshoot and settle" feel). → Use the `cubic-bezier(0.4,0,0.2,1)` curves specified in §10/§16, no overshoot.
- ❌ Fade-and-slide-up entrance animations on every section as it scrolls into view.
- ❌ Confetti, checkmark-bounce, or "celebration" micro-animations on ordinary success states (form saved, item added). Success is communicated by the state change itself, not a performance.
- ❌ Mouse-follow parallax or "particles connecting to your cursor" backgrounds.

**Typography & copy**
- ❌ Middle-dot separated meta strings (`Draft · 2 min read · 4 comments`). → Use a plain separator: spaces, a plain `/`, or just line breaks.
- ❌ Em-dash constructions in headings, labels, or button text (`"Fast — and reliable"`, `"Ship — with confidence"`). → Rewrite as a plain sentence, or split into two short sentences.
- ❌ Tracked-out ALL-CAPS eyebrows above every heading.
- ❌ A trailing arrow glyph (`→`) appended to every link/button ("Learn more →", "Get started →"). Use it only where it's load-bearing (e.g. indicating real directional navigation).
- ❌ Generic marketing filler ("Unlock the power of...", "Seamlessly...", "Effortlessly..."). Say what the thing does, in plain words, from the user's perspective (see §"writing" principles this system is built on).

**Layout & structure**
- ❌ Identical rounded cards with identical shadows used for content that means different things (see the ghost/signal duality in §0/§5 — use it instead).
- ❌ Glassmorphism / frosted-blur panels as a default surface treatment.
- ❌ Gradient text or gradient icon fills.
- ❌ A soft radial gradient wash behind every hero/section regardless of content.
- ❌ Numbered 01/02/03 badges on content that isn't actually sequential (§9).
- ❌ Rainbow/multi-color "AI-powered" badge chips.

**Color**
- ❌ A second accent color introduced anywhere "for variety." One signal color, full stop (§0/§14).
- ❌ Reflexive red/down = bad, green/up = good on every metric without checking whether that's true for the specific metric (§16, stat cards).

If a component you're building matches one of these patterns, don't ask "does this look nice" — it probably does, in isolation. Ask "would every other AI-generated dashboard also produce exactly this," and if yes, go back to §0 and re-derive the treatment from ghost/signal and the network motif instead.

NO OVERUSE OF BADGES AND DOTS, CUT THAT SHIT OUT