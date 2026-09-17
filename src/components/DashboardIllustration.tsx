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
      aria-label="Technical illustration of Kultra telemetry console intercepting a Google Merchant disapproval event"
    >
      <defs>
        <pattern id="telemetryGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
        <style>{`
          .console-text {
            font-family: 'Inter', system-ui, sans-serif;
          }
          .console-mono {
            font-family: 'Roboto Mono', monospace;
          }
          .console-display {
            font-family: 'Fraunces', serif;
          }
        `}</style>
        <clipPath id="productThumbClip">
          <rect width="84" height="84" rx="3" />
        </clipPath>
      </defs>

      {/* Outer Console Frame */}
      <rect x="1" y="1" width="1198" height="678" rx="4" fill="#0a0b0d" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="1" y="1" width="1198" height="678" rx="4" fill="url(#telemetryGrid)" />

      {/* Console Top Chrome Bar */}
      <path d="M 1 4 C 1 2.3 2.3 1 4 1 L 1196 1 C 1197.7 1 1199 2.3 1199 4 L 1199 50 L 1 50 Z" fill="#0e0f11" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      
      {/* Brand & Console Header */}
      <image href="/assets/logos/kultra-logo-horizontal.svg" x="24" y="17" width="62" height="16" preserveAspectRatio="xMinYMid meet" />
      <text className="console-mono" x="100" y="30" fill="#6b7078" fontSize="11" letterSpacing="0.02em">
        TELEMETRY_ENGINE / LIVE_INGEST
      </text>
      
      <rect x="1000" y="14" width="176" height="22" rx="3" fill="#131418" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <text className="console-mono" x="1015" y="29" fill="#f4f1ea" fontSize="10.5">
        Google Pub/Sub Ingest
      </text>

      {/* 1. LEFT PANEL: STREAM INGESTION TELEMETRY (Ghost panel) */}
      <g transform="translate(24, 68)">
        <rect width="256" height="588" rx="4" fill="#0e0f11" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        
        <text className="console-text" x="20" y="30" fill="#cfcdc8" fontSize="14" fontWeight="600">Event Stream</text>
        <text className="console-text" x="20" y="48" fill="#6b7078" fontSize="12">Merchant API v1 push</text>

        <line x1="20" y1="64" x2="236" y2="64" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        <text className="console-text" x="20" y="90" fill="#6b7078" fontSize="11.5">Average Ingest Latency</text>
        <text className="console-mono" x="20" y="122" fill="#f4f1ea" fontSize="22" fontWeight="500">18.4 ms</text>
        <rect x="136" y="106" width="100" height="4" rx="2" fill="#131418" />
        <rect x="136" y="106" width="82" height="4" rx="2" fill="#f2a93b" />

        <text className="console-text" x="20" y="160" fill="#6b7078" fontSize="11.5">Throughput Distribution</text>
        <g transform="translate(20, 176)">
          <line x1="0" y1="90" x2="216" y2="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x="5" y="65" width="10" height="25" rx="1" fill="#3a3d43" />
          <rect x="20" y="45" width="10" height="45" rx="1" fill="#3a3d43" />
          <rect x="35" y="30" width="10" height="60" rx="1" fill="#6b7078" />
          <rect x="50" y="18" width="10" height="72" rx="1" fill="#f2a93b" />
          <rect x="65" y="24" width="10" height="66" rx="1" fill="#6b7078" />
          <rect x="80" y="40" width="10" height="50" rx="1" fill="#6b7078" />
          <rect x="95" y="55" width="10" height="35" rx="1" fill="#3a3d43" />
          <rect x="110" y="48" width="10" height="42" rx="1" fill="#3a3d43" />
          <rect x="125" y="22" width="10" height="68" rx="1" fill="#6b7078" />
          <rect x="140" y="35" width="10" height="55" rx="1" fill="#6b7078" />
          <rect x="155" y="60" width="10" height="30" rx="1" fill="#3a3d43" />
          <rect x="170" y="70" width="10" height="20" rx="1" fill="#3a3d43" />
          <rect x="185" y="28" width="10" height="62" rx="1" fill="#d64545" />
          <rect x="200" y="80" width="10" height="10" rx="1" fill="#3a3d43" />
        </g>

        <line x1="20" y1="298" x2="236" y2="298" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        <text className="console-text" x="20" y="324" fill="#cfcdc8" fontSize="13" fontWeight="600">Recent Mutations</text>

        <g transform="translate(20, 342)">
          <text className="console-mono" x="4" y="12" fill="#f4f1ea" fontSize="11">inventory.update</text>
          <text className="console-text" x="4" y="26" fill="#6b7078" fontSize="11">Sku OW-7102, synced</text>
          <text className="console-mono" x="165" y="16" fill="#45484f" fontSize="10">0.8s</text>
        </g>

        <g transform="translate(20, 392)">
          <rect x="-4" y="0" width="224" height="48" rx="3" fill="rgba(214,69,69,0.08)" stroke="#d64545" strokeWidth="1" />
          <text className="console-mono" x="6" y="18" fill="#d64545" fontSize="11" fontWeight="500">product.disapproved</text>
          <text className="console-text" x="6" y="34" fill="#d64545" fontSize="11">Missing required GTIN</text>
          <text className="console-mono" x="175" y="26" fill="#d64545" fontSize="10">LIVE</text>
        </g>

        <g transform="translate(20, 460)">
          <text className="console-mono" x="4" y="12" fill="#f4f1ea" fontSize="11">price.sync</text>
          <text className="console-text" x="4" y="26" fill="#6b7078" fontSize="11">Item AP-3391, 24.00 USD</text>
          <text className="console-mono" x="165" y="16" fill="#45484f" fontSize="10">4.2s</text>
        </g>

        <g transform="translate(20, 510)">
          <text className="console-mono" x="4" y="12" fill="#f4f1ea" fontSize="11">catalog.verified</text>
          <text className="console-text" x="4" y="26" fill="#6b7078" fontSize="11">Batch 841, zero latency</text>
          <text className="console-mono" x="165" y="16" fill="#45484f" fontSize="10">7.1s</text>
        </g>
      </g>

      {/* 2. CENTER PANEL: THE INCIDENT ALERT CARD (Signal wash + danger for error) */}
      <g transform="translate(298, 68)">
        <rect width="588" height="588" rx="4" fill="#0e0f11" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        
        <g transform="translate(28, 22)">
          <rect width="180" height="26" rx="100" fill="rgba(242,169,59,0.06)" stroke="#7a5a26" strokeWidth="1" />
          <text className="console-mono" x="14" y="17" fill="#f2a93b" fontSize="10.5" fontWeight="500">DISAPPROVAL INTERCEPTED</text>
          <text className="console-mono" x="532" y="17" fill="#6b7078" fontSize="11" textAnchor="end">Captured in 0.4s</text>
        </g>

        <line x1="28" y1="62" x2="560" y2="62" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        <g transform="translate(28, 80)">
          {/* Authentic Real Product Photo */}
          <g clipPath="url(#productThumbClip)">
            <rect width="84" height="84" rx="3" fill="#131418" />
            <image
              href="/assets/alpine-anorak.jpg"
              x="0"
              y="0"
              width="84"
              height="84"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <rect width="84" height="84" rx="3" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          
          <text className="console-text" x="102" y="24" fill="#f4f1ea" fontSize="17" fontWeight="600">Alpine Expedition Anorak</text>
          <text className="console-text" x="102" y="46" fill="#b9b3a5" fontSize="13">Variant: Slate Black / Medium</text>
          <text className="console-mono" x="102" y="68" fill="#6b7078" fontSize="12">
            SKU: OW-8842-BLK-M / PRICE: $148.00 USD
          </text>
        </g>

        <g transform="translate(28, 184)">
          <rect width="532" height="64" rx="3" fill="#131418" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <g transform="translate(18, 16)">
            <text className="console-text" x="0" y="14" fill="#6b7078" fontSize="11.5">30-day Google Ads Traffic</text>
            <text className="console-mono" x="0" y="36" fill="#f4f1ea" fontSize="17" fontWeight="500">1,840 clicks at risk</text>
          </g>
          <line x1="250" y1="12" x2="250" y2="52" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <g transform="translate(268, 16)">
            <text className="console-text" x="0" y="14" fill="#6b7078" fontSize="11.5">Campaign Budget Exposure</text>
            <text className="console-mono" x="0" y="36" fill="#d64545" fontSize="17" fontWeight="500">$2,428.80 ad spend / mo</text>
          </g>
        </g>

        {/* Raw Protocol Error (Monospace strictly reserved per §2 and §16) */}
        <g transform="translate(28, 272)">
          <text className="console-text" x="0" y="16" fill="#6b7078" fontSize="12">Raw Google Merchant Protocol Error</text>
          <rect y="26" width="532" height="42" rx="3" fill="#0a0b0d" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text className="console-mono" x="14" y="52" fill="#d64545" fontSize="12.5" fontWeight="500">
            item_disapproved: missing_required_attribute [gtin]
          </text>
        </g>

        {/* Immediate Remediation Guide */}
        <g transform="translate(28, 362)">
          <text className="console-text" x="0" y="16" fill="#6b7078" fontSize="12">Immediate Remediation Guide</text>
          <rect y="26" width="532" height="66" rx="3" fill="#131418" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text className="console-text" x="14" y="50" fill="#f4f1ea" fontSize="13" fontWeight="400">
            Google requires a valid UPC or EAN barcode for branded apparel.
          </text>
          <text className="console-text" x="14" y="70" fill="#b9b3a5" fontSize="12.5">
            Add manufacturer barcode in Shopify Inventory variant settings to restore Shopping ads.
          </text>
        </g>

        {/* Deep-Link Action Trigger (.btn-secondary style) */}
        <g transform="translate(28, 480)">
          <rect width="532" height="48" rx="3" fill="#131418" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <text className="console-text" x="20" y="29" fill="#f4f1ea" fontSize="13.5" fontWeight="600">
            Open in Shopify Admin
          </text>
          <text className="console-mono" x="512" y="29" fill="#6b7078" fontSize="11" textAnchor="end">
            DEEP_LINK
          </text>
        </g>
      </g>

      {/* 3. RIGHT PANEL: CATALOG HEALTH MATRIX */}
      <g transform="translate(904, 68)">
        <rect width="272" height="588" rx="4" fill="#0e0f11" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <text className="console-text" x="20" y="30" fill="#cfcdc8" fontSize="14" fontWeight="600">Merchant Health</text>
        <text className="console-text" x="20" y="48" fill="#6b7078" fontSize="12">Store: Patagonia Gear Lab</text>

        <line x1="20" y1="64" x2="252" y2="64" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        <rect x="20" y="80" width="232" height="84" rx="3" fill="#131418" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <text className="console-text" x="32" y="104" fill="#6b7078" fontSize="11.5">Approved active items</text>
        <text className="console-mono" x="32" y="136" fill="#f4f1ea" fontSize="24" fontWeight="500">4,192</text>
        <text className="console-mono" x="190" y="136" fill="#f2a93b" fontSize="12" fontWeight="500">99.4%</text>

        <rect x="20" y="180" width="232" height="84" rx="3" fill="#131418" stroke="#d64545" strokeWidth="1" />
        <text className="console-text" x="32" y="204" fill="#6b7078" fontSize="11.5">Disapproved items</text>
        <text className="console-mono" x="32" y="236" fill="#d64545" fontSize="24" fontWeight="500">1 item</text>
        <text className="console-mono" x="168" y="236" fill="#d64545" fontSize="11">HOLD</text>

        <rect x="20" y="280" width="232" height="84" rx="3" fill="#131418" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <text className="console-text" x="32" y="304" fill="#6b7078" fontSize="11.5">Ad spend protected</text>
        <text className="console-mono" x="32" y="336" fill="#f2a93b" fontSize="24" fontWeight="500">$18,400</text>
        <text className="console-mono" x="194" y="336" fill="#6b7078" fontSize="11">YTD</text>

        <line x1="20" y1="384" x2="252" y2="384" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        <text className="console-text" x="20" y="412" fill="#cfcdc8" fontSize="13" fontWeight="600">Infrastructure Watch</text>

        <g transform="translate(20, 428)">
          <rect y="0" width="232" height="34" rx="3" fill="#131418" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text className="console-text" x="14" y="22" fill="#f4f1ea" fontSize="12">Google Cloud Pub/Sub</text>
          <text className="console-mono" x="195" y="22" fill="#f2a93b" fontSize="10.5">LIVE</text>

          <rect y="42" width="232" height="34" rx="3" fill="#131418" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text className="console-text" x="14" y="64" fill="#f4f1ea" fontSize="12">Merchant API v1</text>
          <text className="console-mono" x="195" y="64" fill="#f2a93b" fontSize="10.5">SYNCED</text>

          <rect y="84" width="232" height="34" rx="3" fill="#131418" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text className="console-text" x="14" y="106" fill="#f4f1ea" fontSize="12">Shopify Admin Webhook</text>
          <text className="console-mono" x="195" y="106" fill="#6b7078" fontSize="10.5">READY</text>
        </g>
      </g>
    </svg>
  );
}
