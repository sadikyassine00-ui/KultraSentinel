'use client';

import React from 'react';

export function DashboardIllustration() {
  return (
    <svg
      className="dashboard-illustration w-full h-auto block select-none pointer-events-none"
      viewBox="0 0 1200 680"
      width="100%"
      height="100%"
      fill="none"
      role="img"
      aria-label="Stylized technical illustration of Kultra telemetry console intercepting a Google Merchant disapproval event"
    >
      <defs>
        <pattern id="telemetryGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.75" strokeOpacity="0.35" />
        </pattern>
        <linearGradient id="panelBgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F1522" />
          <stop offset="100%" stopColor="#0B0F19" />
        </linearGradient>
        <linearGradient id="cardBgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141C2B" />
          <stop offset="100%" stopColor="#0D131F" />
        </linearGradient>
        <linearGradient id="accentBadgeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF788D" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FF788D" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="70%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#FF788D" />
        </linearGradient>
        <style>{`
          text, tspan {
            font-family: 'Satoshi', -apple-system, sans-serif !important;
          }
        `}</style>
        <clipPath id="productThumbClip">
          <rect width="84" height="84" rx="4" />
        </clipPath>
      </defs>

      {/* Outer Console Frame */}
      <rect x="2" y="2" width="1196" height="676" rx="6" fill="#0a0b1d" stroke="#1E293B" strokeWidth="1.5" />
      <rect x="2" y="2" width="1196" height="676" rx="6" fill="url(#telemetryGrid)" />

      {/* Console Top Chrome Bar */}
      <path d="M 2 8 C 2 4.7 4.7 2 8 2 L 1192 2 C 1195.3 2 1198 4.7 1198 8 L 1198 52 L 2 52 Z" fill="#0B0F19" stroke="#1E293B" strokeWidth="1" />
      
      {/* Brand & Console Header */}
      <image href="/assets/logos/kultraLogo-trimmed.png" x="28" y="18" width="65" height="18" preserveAspectRatio="xMinYMid meet" />
      <text x="106" y="32" fill="#94A3B8" fontSize="13" fontWeight="500">
        Telemetry Engine - Real-time stream
      </text>
      
      <rect x="1000" y="16" width="170" height="22" rx="3" fill="#141C2B" stroke="#1E293B" strokeWidth="1" />
      <text x="1015" y="32" fill="#FDF4D2" fontSize="11.5" fontWeight="500">
        Google Pub/Sub Ingest
      </text>

      {/* 1. LEFT PANEL: STREAM INGESTION TELEMETRY */}
      <g transform="translate(30, 75)">
        <rect width="250" height="570" rx="4" fill="url(#panelBgGrad)" stroke="#1E293B" strokeWidth="1" />
        
        <text x="20" y="32" fill="#FDF4D2" fontSize="14" fontWeight="600">Event Stream</text>
        <text x="20" y="50" fill="#94A3B8" fontSize="12">Direct Merchant API v1 push</text>

        <line x1="20" y1="65" x2="230" y2="65" stroke="#1E293B" strokeWidth="1" />

        <text x="20" y="92" fill="#94A3B8" fontSize="11.5">Average Ingest Latency</text>
        <text x="20" y="122" fill="#FDF4D2" fontSize="24" fontWeight="700">18.4 ms</text>
        <rect x="130" y="105" width="100" height="6" rx="2" fill="#141C2B" />
        <rect x="130" y="105" width="82" height="6" rx="2" fill="#10B981" />

        <text x="20" y="162" fill="#94A3B8" fontSize="11.5">Throughput Distribution</text>
        <g transform="translate(20, 180)">
          <line x1="0" y1="90" x2="210" y2="90" stroke="#1E293B" strokeWidth="1" />
          <rect x="5" y="65" width="10" height="25" rx="1" fill="#1E293B" />
          <rect x="20" y="45" width="10" height="45" rx="1" fill="#1E293B" />
          <rect x="35" y="30" width="10" height="60" rx="1" fill="#10B981" fillOpacity="0.8" />
          <rect x="50" y="18" width="10" height="72" rx="1" fill="#10B981" />
          <rect x="65" y="24" width="10" height="66" rx="1" fill="#10B981" fillOpacity="0.9" />
          <rect x="80" y="40" width="10" height="50" rx="1" fill="#10B981" fillOpacity="0.7" />
          <rect x="95" y="55" width="10" height="35" rx="1" fill="#1E293B" />
          <rect x="110" y="48" width="10" height="42" rx="1" fill="#1E293B" />
          <rect x="125" y="22" width="10" height="68" rx="1" fill="#10B981" />
          <rect x="140" y="35" width="10" height="55" rx="1" fill="#10B981" fillOpacity="0.85" />
          <rect x="155" y="60" width="10" height="30" rx="1" fill="#1E293B" />
          <rect x="170" y="70" width="10" height="20" rx="1" fill="#1E293B" />
          <rect x="185" y="28" width="10" height="62" rx="1" fill="#FF788D" />
          <rect x="200" y="80" width="10" height="10" rx="1" fill="#1E293B" />
        </g>

        <line x1="20" y1="300" x2="230" y2="300" stroke="#1E293B" strokeWidth="1" />

        <text x="20" y="328" fill="#FDF4D2" fontSize="13" fontWeight="600">Recent Mutations</text>

        <g transform="translate(20, 345)">
          <text x="4" y="11" fill="#FDF4D2" fontSize="12" fontWeight="500">inventory.update</text>
          <text x="4" y="25" fill="#94A3B8" fontSize="11">Sku OW-7102, sync ok</text>
          <text x="165" y="16" fill="#94A3B8" fontSize="10.5">0.8s ago</text>
        </g>

        <g transform="translate(20, 395)">
          <rect x="-6" y="0" width="222" height="48" rx="3" fill="#FF788D" fillOpacity="0.1" stroke="#FF788D" strokeWidth="1" strokeOpacity="0.4" />
          <text x="4" y="17" fill="#FDF4D2" fontSize="12" fontWeight="600">product.disapproved</text>
          <text x="4" y="32" fill="#FF788D" fontSize="11" fontWeight="500">Missing required GTIN</text>
          <text x="165" y="24" fill="#FF788D" fontSize="10.5" fontWeight="600">Live</text>
        </g>

        <g transform="translate(20, 460)">
          <text x="4" y="11" fill="#FDF4D2" fontSize="12" fontWeight="500">price.sync</text>
          <text x="4" y="25" fill="#94A3B8" fontSize="11">Item AP-3391, 24.00 USD</text>
          <text x="165" y="16" fill="#94A3B8" fontSize="10.5">4.2s ago</text>
        </g>

        <g transform="translate(20, 510)">
          <text x="4" y="11" fill="#FDF4D2" fontSize="12" fontWeight="500">catalog.verified</text>
          <text x="4" y="25" fill="#94A3B8" fontSize="11">Batch 841, zero latency</text>
          <text x="165" y="16" fill="#94A3B8" fontSize="10.5">7.1s ago</text>
        </g>
      </g>

      {/* 2. CENTER PANEL: THE INCIDENT ALERT CARD */}
      <g transform="translate(305, 75)">
        <rect width="570" height="570" rx="5" fill="url(#cardBgGrad)" stroke="#1E293B" strokeWidth="1.25" />
        
        <g transform="translate(28, 24)">
          <rect width="170" height="28" rx="3" fill="url(#accentBadgeGrad)" stroke="#FF788D" strokeWidth="1" />
          <text x="14" y="18.5" fill="#FDF4D2" fontSize="12" fontWeight="600">Disapproval Intercepted</text>
          <text x="400" y="18" fill="#94A3B8" fontSize="12" textAnchor="end">Captured in 0.4s, push event</text>
        </g>

        <line x1="28" y1="68" x2="542" y2="68" stroke="#1E293B" strokeWidth="1" />

        <g transform="translate(28, 88)">
          {/* Authentic Real Product Photo */}
          <g clipPath="url(#productThumbClip)">
            <rect width="84" height="84" rx="4" fill="#F1F5F9" />
            <image
              href="/assets/alpine-anorak.jpg"
              x="0"
              y="0"
              width="84"
              height="84"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <rect width="84" height="84" rx="4" fill="none" stroke="#1E293B" strokeWidth="1" />
          
          <text x="104" y="24" fill="#FDF4D2" fontSize="18" fontWeight="700">Alpine Expedition Anorak</text>
          <text x="104" y="46" fill="#94A3B8" fontSize="13">Variant: Slate Black / Medium</text>
          <text x="104" y="68" fill="#94A3B8" fontSize="13">
            Variant id: <tspan fill="#FDF4D2" fontWeight="600">OW-8842-BLK-M</tspan>, Catalog price: <tspan fill="#FDF4D2" fontWeight="600">$148.00 USD</tspan>
          </text>
        </g>

        <g transform="translate(28, 192)">
          <rect width="514" height="66" rx="4" fill="#0A0E17" stroke="#1E293B" strokeWidth="1" />
          <g transform="translate(20, 18)">
            <text x="0" y="14" fill="#94A3B8" fontSize="11.5">30-day Google Ads Traffic</text>
            <text x="0" y="36" fill="#FDF4D2" fontSize="17" fontWeight="700">1,840 clicks at risk</text>
          </g>
          <line x1="240" y1="12" x2="240" y2="54" stroke="#1E293B" strokeWidth="1" />
          <g transform="translate(260, 18)">
            <text x="0" y="14" fill="#94A3B8" fontSize="11.5">Campaign Budget Exposure</text>
            <text x="0" y="36" fill="#FF788D" fontSize="17" fontWeight="700">$2,428.80 ad spend / mo</text>
          </g>
        </g>

        {/* Raw Protocol Error (Monospace strictly reserved) */}
        <g transform="translate(28, 280)">
          <text x="0" y="16" fill="#94A3B8" fontSize="12" fontWeight="600">Raw Google Merchant Protocol Error</text>
          <rect y="28" width="514" height="42" rx="3" fill="#080C14" stroke="#1E293B" strokeWidth="1" />
          <text className="mono-protocol-error" x="16" y="54" fill="#FF788D" fontSize="13" fontWeight="500">
            item_disapproved: missing_required_attribute [gtin]
          </text>
        </g>

        {/* Immediate Remediation Guide */}
        <g transform="translate(28, 370)">
          <text x="0" y="16" fill="#94A3B8" fontSize="12" fontWeight="600">Immediate Remediation Guide</text>
          <rect y="28" width="514" height="68" rx="4" fill="#0F1626" stroke="#1E293B" strokeWidth="1" />
          <text x="16" y="52" fill="#FDF4D2" fontSize="13.5" fontWeight="400">
            Google requires a valid UPC or EAN barcode for branded apparel.
          </text>
          <text x="16" y="74" fill="#94A3B8" fontSize="13">
            Add manufacturer barcode in Shopify Inventory variant settings to restore Shopping ads.
          </text>
        </g>

        {/* Deep-Link Action Trigger (Small 4px radius) */}
        <g transform="translate(28, 484)">
          <rect width="514" height="52" rx="4" fill="#141C2B" stroke="#1E293B" strokeWidth="1.25" />
          <path d="M 40 26 L 46 18 L 52 26 L 40 26 Z M 38 26 L 54 26 L 52 38 L 40 38 Z" fill="#10B981" />
          <text x="68" y="32" fill="#FDF4D2" fontSize="14.5" fontWeight="600">
            One-click deep link: Fix in Shopify Admin
          </text>
          <path d="M 480 26 L 488 26 M 484 22 L 488 26 L 484 30" stroke="#FDF4D2" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* 3. RIGHT PANEL: CATALOG HEALTH MATRIX */}
      <g transform="translate(900, 75)">
        <rect width="270" height="570" rx="4" fill="url(#panelBgGrad)" stroke="#1E293B" strokeWidth="1" />
        <text x="20" y="32" fill="#FDF4D2" fontSize="14" fontWeight="600">Merchant Health</text>
        <text x="20" y="50" fill="#94A3B8" fontSize="12">Store: Patagonia Gear Lab</text>

        <line x1="20" y1="65" x2="250" y2="65" stroke="#1E293B" strokeWidth="1" />

        <rect x="20" y="85" width="230" height="88" rx="4" fill="#0D131F" stroke="#1E293B" strokeWidth="1" />
        <text x="36" y="110" fill="#94A3B8" fontSize="11.5">Approved active items</text>
        <text x="36" y="142" fill="#FDF4D2" fontSize="26" fontWeight="700">4,192</text>
        <text x="180" y="142" fill="#10B981" fontSize="12" fontWeight="600">99.4%</text>

        <rect x="20" y="188" width="230" height="88" rx="4" fill="#0D131F" stroke="#FF788D" strokeWidth="1" />
        <text x="36" y="213" fill="#94A3B8" fontSize="11.5">Disapproved / action req.</text>
        <text x="36" y="245" fill="#FF788D" fontSize="26" fontWeight="700">1 item</text>
        <text x="160" y="245" fill="#FF788D" fontSize="12" fontWeight="600">Intercepted</text>

        <rect x="20" y="291" width="230" height="88" rx="4" fill="#0D131F" stroke="#1E293B" strokeWidth="1" />
        <text x="36" y="316" fill="#94A3B8" fontSize="11.5">Wasted Spend Prevented</text>
        <text x="36" y="348" fill="#10B981" fontSize="24" fontWeight="700">$18,400</text>
        <text x="182" y="348" fill="#94A3B8" fontSize="11">YTD</text>

        <line x1="20" y1="400" x2="250" y2="400" stroke="#1E293B" strokeWidth="1" />

        <text x="20" y="426" fill="#FDF4D2" fontSize="13" fontWeight="600">Infrastructure Watch</text>

        <g transform="translate(20, 442)">
          <rect y="0" width="230" height="34" rx="3" fill="#141C2B" stroke="#1E293B" strokeWidth="1" />
          <text x="16" y="22" fill="#FDF4D2" fontSize="12">Google Cloud Pub/Sub</text>
          <text x="195" y="22" fill="#94A3B8" fontSize="10.5">Active</text>

          <rect y="44" width="230" height="34" rx="3" fill="#141C2B" stroke="#1E293B" strokeWidth="1" />
          <text x="16" y="66" fill="#FDF4D2" fontSize="12">Merchant API v1</text>
          <text x="195" y="66" fill="#94A3B8" fontSize="10.5">Synced</text>

          <rect y="88" width="230" height="34" rx="3" fill="#141C2B" stroke="#1E293B" strokeWidth="1" />
          <text x="16" y="110" fill="#FDF4D2" fontSize="12">Shopify Admin Webhook</text>
          <text x="195" y="110" fill="#94A3B8" fontSize="10.5">Ready</text>
        </g>
      </g>
    </svg>
  );
}
