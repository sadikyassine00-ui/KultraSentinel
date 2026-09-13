# Kultra Design System & Restraint Standards (`GEMINI.md`)

## 1. Absolute Banned List (Zero Tolerance)
- **Zero Glow:** No `box-shadow` glows, no text glows, no radial gradient light-blobs, no luminous aura borders.
- **Zero Pulsing or Blinking:** No `animate-pulse`, no flashing beacons or blinking status dots. Telemetry indicators must remain steady.
- **Zero Middle-Dots:** No `"A · B · C"` strings or bulleted taglines. Use clean semantic structure or full sentences.
- **Zero Emojis:** No unicode emojis (⚠️, ✨, 🚀, etc.). Use clean SVG geometric glyphs only when appropriate.
- **Zero Bento Grids:** No cluttered multi-tile bento boxes.
- **Zero ALL-CAPS:** No uppercase tracking for labels, nav links, buttons, or technical attributes. Use normal sentence case or Title Case with size and font weight for emphasis.
- **Strict Monospace Isolation:** Monospace font (`JetBrains Mono`, `Geist Mono`) is permitted **strictly and exclusively** for the raw protocol error string:
  `item_disapproved: missing_required_attribute [gtin]`
  All navigation, button labels, card headers, and timestamps must use the standard body typeface.
- **Zero Em-Dashes (`—`):** Zero em-dashes anywhere in copy, headlines, or micro-copy. Use standard commas, periods, colons, or clean hyphens.
- **Zero Fabricated Proof:** Strictly no invented customer logos or synthetic testimonials. Only factual integration platforms (Google Cloud Pub/Sub, Merchant API v1, Shopify, Slack).

## 2. Nocturne Sentinel Palette
- **Void Canvas:** `#0a0b1dff` (Obsidian Midnight Dark Canvas)
- **Surface Panel:** `#0F1522`
- **Structural Stroke:** `#1E293B`
- **Primary Pill Surface:** `#141C2B` (Hover: `#1E293B`)
- **Alert Incident Accent:** `#FF788D` (Vibrant coral-rose signal; no glow)
- **Active Telemetry State:** `#10B981` (Disciplined active status)
- **Primary Text:** `#FDF4D2` (Warm ivory typography)
- **Muted Text:** `#94A3B8`

## 3. Motion System & Signature Interaction
- **One Signature Interaction:** The hero dashboard illustration smoothly fades out (`opacity: 1 -> 0`) and subtly drifts upward (`translateY: 0 -> -20px`) tied directly to scroll progress as the visitor leaves the hero viewport.
- **Accessibility:** Under `prefers-reduced-motion: reduce`, the illustration remains locked at 100% opacity with zero scroll-linked fade.
- **Static Periphery:** Navigation, social proof, and subsequent sections remain completely static on scroll.
