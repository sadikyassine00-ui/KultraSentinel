'use client';

import React from 'react';

export function DashboardIllustration() {
  return (
    <svg
      className="dashboard-illustration w-full h-auto block select-none"
      viewBox="0 0 1200 680"
      width="100%"
      height="100%"
      fill="none"
      role="img"
      aria-label="High-tech proof of work loop: Detection, Interception, and Notification with incident triage card and floating Slack alert"
    >
      <defs>
        {/* Technical Telemetry Grid */}
        <pattern id="proofGrid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
        </pattern>

        {/* Ambient Depth of Field Radial Glow */}
        <radialGradient id="depthOfFieldGlow" cx="42%" cy="48%" r="65%">
          <stop offset="0%" stopColor="#181d26" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#0f1117" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0a0b0d" stopOpacity="0" />
        </radialGradient>

        {/* Incident Card Glowing Red Border Filter */}
        <filter id="incidentGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#d64545" floodOpacity="0.32" />
          <feDropShadow dx="0" dy="16" stdDeviation="24" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        {/* Floating Slack Card Deep Elevation Shadow */}
        <filter id="slackElevation" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="28" stdDeviation="32" floodColor="#000000" floodOpacity="0.75" />
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.35" />
        </filter>

        {/* Laser Glow Filter */}
        <filter id="laserBeamGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Data Stream Gradient */}
        <linearGradient id="dataStreamGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d64545" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#f2a93b" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>

        {/* Laser Vertical Gradient */}
        <linearGradient id="laserGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff5a5a" stopOpacity="0" />
          <stop offset="25%" stopColor="#ff4d4d" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="75%" stopColor="#ff4d4d" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff5a5a" stopOpacity="0" />
        </linearGradient>

        {/* Product Thumbnail Clip */}
        <clipPath id="productThumbClip">
          <rect width="84" height="84" rx="4" />
        </clipPath>

        {/* Card Frame Clip for Laser Sweep */}
        <clipPath id="errorBoxClip">
          <rect x="0" y="24" width="492" height="52" rx="3" />
        </clipPath>

        {/* Embedded Typography & Micro-Animations */}
        <style>{`
          .hero-text {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .hero-mono {
            font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          }
          .hero-display {
            font-family: 'Fraunces', Georgia, serif;
          }

          /* Laser Scan Sweeping Keyframe */
          @keyframes scanLaser {
            0% {
              transform: translateX(16px);
            }
            48% {
              transform: translateX(476px);
            }
            52% {
              transform: translateX(476px);
            }
            98% {
              transform: translateX(16px);
            }
            100% {
              transform: translateX(16px);
            }
          }

          /* Data Stream Dashoffset Flow */
          @keyframes streamFlow {
            from {
              stroke-dashoffset: 48;
            }
            to {
              stroke-dashoffset: 0;
            }
          }

          /* Glowing Pulse for Live Detection Indicators */
          @keyframes pulseLive {
            0%, 100% {
              opacity: 0.9;
              transform: scale(1);
            }
            50% {
              opacity: 0.45;
              transform: scale(1.15);
            }
          }

          /* Subtle Floating Hover on Slack Card */
          @keyframes slackLevitate {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          .laser-scanner {
            animation: scanLaser 3.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          }

          .data-stream-path {
            stroke-dasharray: 6 6;
            animation: streamFlow 1.2s linear infinite;
          }

          .floating-slack-card {
            animation: slackLevitate 5s ease-in-out infinite;
            transform-origin: 900px 300px;
          }

          .live-ping-dot {
            animation: pulseLive 2s ease-in-out infinite;
            transform-origin: center;
          }

          @media (prefers-reduced-motion: reduce) {
            .laser-scanner,
            .data-stream-path,
            .floating-slack-card,
            .live-ping-dot {
              animation: none !important;
            }
          }
        `}</style>
      </defs>

      {/* ============================================================ */}
      {/* 0. TECHNICAL BACKDROP & SHALLOW DEPTH OF FIELD STAGE          */}
      {/* ============================================================ */}
      {/* Outer Viewport Canvas */}
      <rect x="0" y="0" width="1200" height="680" fill="#0a0b0d" />
      <rect x="0" y="0" width="1200" height="680" fill="url(#depthOfFieldGlow)" />
      <rect x="0" y="0" width="1200" height="680" fill="url(#proofGrid)" />

      {/* Subtle Network Constellation Lines (Design Language §15) */}
      <g stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3">
        <line x1="80" y1="50" x2="640" y2="50" />
        <line x1="640" y1="50" x2="1140" y2="50" />
        <line x1="80" y1="630" x2="1140" y2="630" />
        <line x1="640" y1="50" x2="640" y2="630" stroke="rgba(255,255,255,0.03)" />
      </g>
      <circle cx="80" cy="50" r="2.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="640" cy="50" r="2.5" fill="#f2a93b" opacity="0.6" />
      <circle cx="1140" cy="50" r="2.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="80" cy="630" r="2.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="1140" cy="630" r="2.5" fill="rgba(255,255,255,0.2)" />

      {/* ============================================================ */}
      {/* 3. CONNECTING GLOWING DATA STREAM LINE                       */}
      {/* Interception point (x: 590, y: 366) -> Slack card (x: 680, y: 220) */}
      {/* ============================================================ */}
      <g id="data-stream-connector">
        {/* Ambient glow tube behind stream */}
        <path
          d="M 590 366 C 650 366, 660 230, 684 220"
          fill="none"
          stroke="#d64545"
          strokeWidth="6"
          strokeOpacity="0.2"
          filter="url(#laserBeamGlow)"
        />
        {/* Solid base stream line */}
        <path
          d="M 590 366 C 650 366, 660 230, 684 220"
          fill="none"
          stroke="url(#dataStreamGrad)"
          strokeWidth="2.2"
          strokeOpacity="0.6"
        />
        {/* Animated pulsing data packets */}
        <path
          className="data-stream-path"
          d="M 590 366 C 650 366, 660 230, 684 220"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Origin Target Node at Laser Scan Area */}
        <circle cx="590" cy="366" r="5" fill="#d64545" filter="url(#laserBeamGlow)" />
        <circle cx="590" cy="366" r="2.5" fill="#ffffff" />

        {/* Mid-flight telemetry beacon */}
        <circle cx="645" cy="285" r="3" fill="#f2a93b" opacity="0.85" />
        <circle cx="645" cy="285" r="6" fill="none" stroke="#f2a93b" strokeWidth="1" opacity="0.4" />

        {/* Destination Target Node at Slack Card */}
        <circle cx="684" cy="220" r="5" fill="#ffffff" filter="url(#laserBeamGlow)" />
        <circle cx="684" cy="220" r="2.5" fill="#e01e5a" />
      </g>

      {/* ============================================================ */}
      {/* 1. CENTER-LEFT ELEMENT: THE STREAMLINED INCIDENT CARD        */}
      {/* "Alpine Anorak", vibrant glowing red border, laser scan      */}
      {/* ============================================================ */}
      <g id="incident-card" transform="translate(80, 75)">
        {/* Vibrant Glowing Red Border Backing */}
        <rect
          x="0"
          y="0"
          width="540"
          height="520"
          rx="4"
          fill="#0e0f11"
          stroke="#d64545"
          strokeWidth="1.75"
          filter="url(#incidentGlow)"
        />

        {/* Inner Card Background with Hairline Overlay */}
        <rect
          x="0"
          y="0"
          width="540"
          height="520"
          rx="4"
          fill="#0e0f11"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        {/* Card Header: Triage Status & Latency Metric */}
        <g transform="translate(24, 22)">
          {/* Status Pill Badge */}
          <rect
            x="0"
            y="0"
            width="172"
            height="26"
            rx="100"
            fill="rgba(214,69,69,0.1)"
            stroke="#d64545"
            strokeWidth="1"
          />
          {/* Pulsing indicator dot */}
          <circle cx="14" cy="13" r="3.5" fill="#d64545" className="live-ping-dot" />
          <text
            className="hero-mono"
            x="24"
            y="17"
            fill="#d64545"
            fontSize="10.5"
            fontWeight="600"
            letterSpacing="0.04em"
          >
            DISAPPROVAL DETECTED
          </text>

          {/* Real Latency Metric: "Captured in <1s" */}
          <rect
            x="368"
            y="0"
            width="124"
            height="26"
            rx="100"
            fill="rgba(242,169,59,0.08)"
            stroke="rgba(242,169,59,0.3)"
            strokeWidth="1"
          />
          <circle cx="380" cy="13" r="3" fill="#f2a93b" />
          <text
            className="hero-mono"
            x="390"
            y="17"
            fill="#f4f1ea"
            fontSize="11"
            fontWeight="500"
            letterSpacing="0.01em"
          >
            Captured in &lt;1s
          </text>
        </g>

        {/* Subtle Horizontal Divider */}
        <line x1="24" y1="62" x2="516" y2="62" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* Product Identity Block: Alpine Anorak */}
        <g transform="translate(24, 80)">
          {/* Authentic Product Photo (Alpine Anorak) */}
          <g clipPath="url(#productThumbClip)">
            <rect width="84" height="84" rx="4" fill="#131418" />
            <image
              href="/assets/alpine-anorak.jpg"
              x="0"
              y="0"
              width="84"
              height="84"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <rect
            width="84"
            height="84"
            rx="4"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />

          {/* Product Titles & Metadata */}
          <text
            className="hero-mono"
            x="102"
            y="16"
            fill="#6b7078"
            fontSize="10.5"
            letterSpacing="0.04em"
          >
            CATALOG SKU: OW-8842-BLK-M
          </text>
          <text
            className="hero-text"
            x="102"
            y="42"
            fill="#f4f1ea"
            fontSize="18"
            fontWeight="600"
            letterSpacing="-0.01em"
          >
            Alpine Anorak
          </text>
          <text className="hero-text" x="102" y="64" fill="#b9b3a5" fontSize="13">
            Variant: Slate Black / Medium · Price: $148.00 USD
          </text>
          <text className="hero-mono" x="102" y="82" fill="#45484f" fontSize="11">
            GMC Offer ID: raw_feed_91024_us
          </text>
        </g>

        {/* Ad Traffic Risk Metric Exposure Band */}
        <g transform="translate(24, 184)">
          <rect
            x="0"
            y="0"
            width="492"
            height="58"
            rx="3"
            fill="#131418"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <g transform="translate(18, 14)">
            <text className="hero-text" x="0" y="12" fill="#6b7078" fontSize="11">
              Active Traffic Exposure
            </text>
            <text className="hero-mono" x="0" y="32" fill="#f4f1ea" fontSize="15" fontWeight="500">
              1,840 clicks at risk
            </text>
          </g>
          <line x1="230" y1="10" x2="230" y2="48" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <g transform="translate(248, 14)">
            <text className="hero-text" x="0" y="12" fill="#6b7078" fontSize="11">
              Google Ads Campaign Status
            </text>
            <text className="hero-mono" x="0" y="32" fill="#d64545" fontSize="15" fontWeight="500">
              Shopping Ads Auction Paused
            </text>
          </g>
        </g>

        {/* Protocol Error Box & Active Laser Scanning Interception */}
        <g transform="translate(24, 260)">
          <text className="hero-mono" x="0" y="14" fill="#6b7078" fontSize="11" letterSpacing="0.04em">
            INTERCEPTED PROTOCOL ERROR
          </text>
          <text className="hero-mono" x="492" y="14" fill="#d64545" fontSize="10.5" textAnchor="end">
            [CRITICAL]
          </text>

          {/* Dark Error Code Box */}
          <rect
            x="0"
            y="24"
            width="492"
            height="52"
            rx="3"
            fill="#07080a"
            stroke="rgba(214,69,69,0.35)"
            strokeWidth="1"
          />

          {/* Core Protocol Error String (Strictly Monospace) */}
          <text
            className="hero-mono"
            x="16"
            y="56"
            fill="#f4f1ea"
            fontSize="12.5"
            fontWeight="500"
            letterSpacing="-0.01em"
          >
            item_disapproved: missing_required_attribute [gtin]
          </text>

          {/* Clipped Laser Scanner Visualization Passing Over Error */}
          <g clipPath="url(#errorBoxClip)">
            {/* Animated Laser Beam */}
            <g className="laser-scanner">
              {/* Diffuse glow beam */}
              <rect
                x="-14"
                y="24"
                width="28"
                height="52"
                fill="url(#laserGrad)"
                opacity="0.3"
                filter="url(#laserBeamGlow)"
              />
              {/* Sharp radiant laser line */}
              <line
                x1="0"
                y1="26"
                x2="0"
                y2="74"
                stroke="#ffffff"
                strokeWidth="1.8"
                filter="url(#laserBeamGlow)"
              />
              {/* Laser Core Head Dots */}
              <circle cx="0" cy="28" r="2.5" fill="#ff4d4d" />
              <circle cx="0" cy="72" r="2.5" fill="#ff4d4d" />
            </g>
          </g>

          {/* Contextual Remediation Helper Note */}
          <text className="hero-text" x="0" y="96" fill="#b9b3a5" fontSize="12">
            Google crawler rejected SKU feed. Missing UPC/GTIN barcode attribute.
          </text>
        </g>

        {/* Agnostic Action Buttons: [Edit Product] and [GMC Console] */}
        <g transform="translate(24, 432)">
          {/* Primary High-Contrast Action Button: [Edit Product] */}
          <g>
            <rect
              x="0"
              y="0"
              width="236"
              height="48"
              rx="3"
              fill="#f2a93b"
              stroke="#f2a93b"
              strokeWidth="1"
            />
            {/* Button Label & Icon */}
            <text
              className="hero-text"
              x="100"
              y="29"
              fill="#1a1305"
              fontSize="13.5"
              fontWeight="600"
              textAnchor="middle"
            >
              Edit Product
            </text>
            {/* Edit Icon Graphic */}
            <path
              d="M 152 20 L 160 28 M 147 25 L 145 32 L 152 30 L 163 19 C 164 18 164 17 163 16 L 161 14 C 160 13 159 13 158 14 Z"
              fill="none"
              stroke="#1a1305"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* High-Contrast Secondary Action Button: [GMC Console] */}
          <g transform="translate(256, 0)">
            <rect
              x="0"
              y="0"
              width="236"
              height="48"
              rx="3"
              fill="#131418"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />
            <text
              className="hero-text"
              x="104"
              y="29"
              fill="#f4f1ea"
              fontSize="13.5"
              fontWeight="600"
              textAnchor="middle"
            >
              GMC Console
            </text>
            {/* External Link Icon Graphic */}
            <path
              d="M 158 18 L 166 18 L 166 26 M 166 18 L 155 29 M 150 21 L 147 21 C 145.8 21 145 21.8 145 23 L 145 32 C 145 33.2 145.8 34 147 34 L 156 34 C 157.2 34 158 33.2 158 32 L 158 29"
              fill="none"
              stroke="#b9b3a5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>

      {/* ============================================================ */}
      {/* 2. THE CONVERSION DRIVER: FLOATING LIGHT SLACK BLOCK CARD     */}
      {/* Overlaid slightly above the dark card, high contrast & punch  */}
      {/* ============================================================ */}
      <g id="floating-slack-notification" className="floating-slack-card" transform="translate(680, 105)">
        {/* Light-Themed Slack Card Surface with Deep Elevation */}
        <rect
          x="0"
          y="0"
          width="440"
          height="460"
          rx="6"
          fill="#ffffff"
          filter="url(#slackElevation)"
        />
        {/* Subtle 1px Outer Border */}
        <rect
          x="0"
          y="0"
          width="440"
          height="460"
          rx="6"
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="1"
        />

        {/* Slack Channel Header Ribbon */}
        <g transform="translate(24, 20)">
          {/* Slack Hash Icon */}
          <text className="hero-text" x="0" y="15" fill="#616061" fontSize="14" fontWeight="600">
            #
          </text>
          <text className="hero-text" x="14" y="15" fill="#1d1c1d" fontSize="13" fontWeight="700">
            merchant-alerts
          </text>
          <text className="hero-mono" x="392" y="14" fill="#007a5a" fontSize="10.5" fontWeight="500" textAnchor="end">
            LIVE DISPATCH · 0.28s
          </text>
        </g>

        {/* Header Divider Line */}
        <line x1="24" y1="46" x2="416" y2="46" stroke="#f0f0f0" strokeWidth="1" />

        {/* Slack App Identity */}
        <g transform="translate(24, 62)">
          {/* Kultra Bot Avatar (Dark badge with gold icon) */}
          <rect x="0" y="0" width="38" height="38" rx="5" fill="#0e0f11" />
          {/* Stylized Kultra Constellation Icon */}
          <g transform="translate(4, 4) scale(0.62)">
            <line x1="20" y1="20" x2="6" y2="10" stroke="#6b7078" strokeWidth="2" />
            <line x1="20" y1="20" x2="8" y2="32" stroke="#6b7078" strokeWidth="2" />
            <line x1="20" y1="20" x2="33" y2="33" stroke="#6b7078" strokeWidth="2" />
            <line x1="20" y1="20" x2="34" y2="9" stroke="#f2a93b" strokeWidth="2.5" />
            <circle cx="6" cy="10" r="3.2" fill="#6b7078" />
            <circle cx="8" cy="32" r="3.2" fill="#6b7078" />
            <circle cx="33" cy="33" r="2.8" fill="#6b7078" />
            <circle cx="34" cy="9" r="4.2" fill="#f2a93b" />
            <circle cx="20" cy="20" r="5.5" fill="#f2a93b" />
          </g>

          {/* App Name */}
          <text className="hero-text" x="48" y="16" fill="#1d1c1d" fontSize="14.5" fontWeight="700">
            Kultra Sentinel
          </text>

          {/* Official Slack APP Pill */}
          <rect x="160" y="5" width="30" height="15" rx="3" fill="#f2f2f2" />
          <text className="hero-text" x="165" y="16" fill="#616061" fontSize="9.5" fontWeight="700">
            APP
          </text>

          {/* Timestamp */}
          <text className="hero-text" x="200" y="16" fill="#616061" fontSize="12">
            12:04 PM
          </text>
        </g>

        {/* Verbatim Slack Block Notification Box with Red Left Accent Bar */}
        <g transform="translate(24, 118)">
          {/* Slack Official Left Alert Bar (#e01e5a) */}
          <rect x="0" y="0" width="4" height="230" rx="2" fill="#e01e5a" />

          {/* Inner Light Block Surface */}
          <rect
            x="4"
            y="0"
            width="388"
            height="230"
            rx="0"
            fill="#fafafa"
            stroke="#f0f0f0"
            strokeWidth="1"
          />

          {/* Block Content Container */}
          <g transform="translate(18, 16)">
            {/* Verbatim Headline */}
            <text className="hero-text" x="0" y="16" fill="#1d1c1d" fontSize="15" fontWeight="700">
              🚨 Critical Disapproval Detected
            </text>

            <line x1="0" y1="32" x2="352" y2="32" stroke="#ebebeb" strokeWidth="1" />

            {/* Verbatim Line 1: Merchant ID */}
            <g transform="translate(0, 48)">
              <text className="hero-text" x="0" y="14" fill="#1d1c1d" fontSize="13" fontWeight="700">
                Merchant ID:
              </text>
              <text className="hero-mono" x="98" y="14" fill="#1d1c1d" fontSize="13" fontWeight="500">
                4918374
              </text>
            </g>

            {/* Verbatim Line 2: Item */}
            <g transform="translate(0, 80)">
              <text className="hero-text" x="0" y="14" fill="#1d1c1d" fontSize="13" fontWeight="700">
                Item:
              </text>
              <text className="hero-text" x="46" y="14" fill="#1d1c1d" fontSize="13" fontWeight="500">
                ACR-909 (Apex Carbon Runner)
              </text>
            </g>

            {/* Verbatim Line 3: Error */}
            <g transform="translate(0, 112)">
              <text className="hero-text" x="0" y="14" fill="#1d1c1d" fontSize="13" fontWeight="700">
                Error:
              </text>
              <text className="hero-text" x="50" y="14" fill="#e01e5a" fontSize="13" fontWeight="600">
                Missing GTIN. Ad traffic paused.
              </text>
            </g>

            {/* Traffic Impact Highlight Pill */}
            <g transform="translate(0, 150)">
              <rect x="0" y="0" width="352" height="30" rx="3" fill="#feeef1" stroke="#fad2da" strokeWidth="1" />
              <text className="hero-mono" x="12" y="19" fill="#e01e5a" fontSize="11" fontWeight="500">
                Campaign Impact: 24 active ads suspended
              </text>
            </g>
          </g>
        </g>

        {/* Link Text (Proof of utility) Footer Action */}
        <g transform="translate(28, 380)">
          {/* Interactive Button Background */}
          <rect
            x="0"
            y="0"
            width="384"
            height="44"
            rx="4"
            fill="#111214"
            stroke="#111214"
            strokeWidth="1"
          />
          {/* Verbatim Footer Link: "Open Triage Log" */}
          <text
            className="hero-text"
            x="192"
            y="27"
            fill="#ffffff"
            fontSize="13.5"
            fontWeight="600"
            textAnchor="middle"
          >
            Open Triage Log →
          </text>
        </g>

        {/* Sub-label micro-copy */}
        <text
          className="hero-text"
          x="220"
          y="442"
          fill="#868686"
          fontSize="11"
          textAnchor="middle"
        >
          Direct deep link to Google Merchant Center & Shopify fix
        </text>
      </g>
    </svg>
  );
}
