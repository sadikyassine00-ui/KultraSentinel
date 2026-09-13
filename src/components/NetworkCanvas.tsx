'use client';

import React, { useEffect, useRef } from 'react';

interface IntegrationHub {
  id: string;
  name: string;
  relX: number;
  relY: number;
  drawIcon: (c: CanvasRenderingContext2D, cx: number, cy: number, alpha: number) => void;
  hoverProgress: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  floatPhase: number;
  connectedNodes: { node: TopologyNode; dist: number }[];
}

class TopologyNode {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  baseVx: number = 0;
  baseVy: number = 0;
  type: 'crosshair' | 'amber-anchor' | 'green-anchor' | 'dot' = 'dot';
  size: number = 1.5;
  color: string = 'rgba(148, 163, 184, 0.45)';

  constructor(w: number, h: number) {
    this.reset(w, h, true);
  }

  reset(w: number, h: number, randomPos = false) {
    this.x = randomPos ? Math.random() * w : (Math.random() > 0.5 ? -10 : w + 10);
    this.y = randomPos ? Math.random() * h : Math.random() * h;

    const speed = 0.2 + Math.random() * 0.22;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.baseVx = this.vx;
    this.baseVy = this.vy;

    const seed = Math.random();
    if (seed > 0.88) {
      this.type = 'crosshair';
      this.size = 3.5;
      this.color = 'rgba(148, 163, 184, 0.75)';
    } else if (seed > 0.82) {
      this.type = 'amber-anchor';
      this.size = 2.2;
      this.color = 'rgba(217, 119, 36, 0.75)';
    } else if (seed > 0.76) {
      this.type = 'green-anchor';
      this.size = 2.2;
      this.color = 'rgba(16, 185, 129, 0.75)';
    } else {
      this.type = 'dot';
      this.size = 1.2 + Math.random() * 0.8;
      this.color = 'rgba(148, 163, 184, 0.45)';
    }
  }

  update(w: number, h: number, mouse: { x: number; y: number; active: boolean }) {
    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 155 && dist > 0) {
        const factor = 1 - dist / 155;
        const force = factor * factor * 1.8;
        this.vx += (dx / dist) * force * 0.18;
        this.vy += (dy / dist) * force * 0.18;
      }
    }

    this.vx = this.vx * 0.965 + this.baseVx * 0.035;
    this.vy = this.vy * 0.965 + this.baseVy * 0.035;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -20) this.x = w + 20;
    else if (this.x > w + 20) this.x = -20;
    if (this.y < -20) this.y = h + 20;
    else if (this.y > h + 20) this.y = -20;
  }

  draw(c: CanvasRenderingContext2D) {
    if (this.type === 'crosshair') {
      c.strokeStyle = this.color;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(this.x - this.size, this.y);
      c.lineTo(this.x + this.size, this.y);
      c.moveTo(this.x, this.y - this.size);
      c.lineTo(this.x, this.y + this.size);
      c.stroke();
    } else if (this.type === 'amber-anchor' || this.type === 'green-anchor') {
      c.fillStyle = this.color;
      c.beginPath();
      c.moveTo(this.x, this.y - this.size);
      c.lineTo(this.x + this.size, this.y);
      c.lineTo(this.x, this.y + this.size);
      c.lineTo(this.x - this.size, this.y);
      c.closePath();
      c.fill();
    } else {
      c.fillStyle = this.color;
      c.beginPath();
      c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      c.fill();
    }
  }
}

// Distance helper
function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r);
  c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h);
  c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r);
  c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

// 1. Google Merchant API v1 (Real Google "G" in official 4 brand colors)
function drawMerchantIcon(c: CanvasRenderingContext2D, cx: number, cy: number, alpha: number) {
  c.save();
  c.globalAlpha = Math.min(1, alpha * 1.2);
  const r = 5.6;
  c.lineWidth = 2;
  c.lineCap = 'round';

  // Red arc (top)
  c.strokeStyle = '#EA4335';
  c.beginPath();
  c.arc(cx, cy, r, -Math.PI * 0.8, -Math.PI * 0.2);
  c.stroke();

  // Yellow arc (left)
  c.strokeStyle = '#FBBC05';
  c.beginPath();
  c.arc(cx, cy, r, -Math.PI * 1.25, -Math.PI * 0.8);
  c.stroke();

  // Green arc (bottom)
  c.strokeStyle = '#34A853';
  c.beginPath();
  c.arc(cx, cy, r, Math.PI * 0.22, Math.PI * 0.78);
  c.stroke();

  // Blue arc & crossbar (right)
  c.strokeStyle = '#4285F4';
  c.beginPath();
  c.arc(cx, cy, r, -Math.PI * 0.2, Math.PI * 0.22);
  c.stroke();

  c.beginPath();
  c.moveTo(cx, cy);
  c.lineTo(cx + r, cy);
  c.stroke();

  c.restore();
}

// 3. Shopify (Real Shopify Green #96BF48 bag with white "S" monogram)
function drawShopifyIcon(c: CanvasRenderingContext2D, cx: number, cy: number, alpha: number) {
  c.save();
  c.globalAlpha = Math.min(1, alpha * 1.2);

  // Bag Body in official Shopify Green
  c.fillStyle = '#96BF48';
  c.beginPath();
  c.moveTo(cx - 4.5, cy - 2);
  c.lineTo(cx - 6, cy + 6);
  c.lineTo(cx + 6, cy + 6);
  c.lineTo(cx + 4.5, cy - 2);
  c.closePath();
  c.fill();

  // Left shadow seam
  c.fillStyle = '#5E8E3E';
  c.beginPath();
  c.moveTo(cx - 4.5, cy - 2);
  c.lineTo(cx - 6, cy + 6);
  c.lineTo(cx - 2.5, cy + 6);
  c.lineTo(cx - 1.5, cy - 2);
  c.closePath();
  c.fill();

  // White Handle
  c.strokeStyle = '#FFFFFF';
  c.lineWidth = 1.35;
  c.lineCap = 'round';
  c.beginPath();
  c.arc(cx, cy - 2, 2.5, Math.PI, 0, false);
  c.stroke();

  // White "S" monogram
  c.strokeStyle = '#FFFFFF';
  c.lineWidth = 1.35;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx + 1.8, cy + 0.3);
  c.lineTo(cx - 0.2, cy + 0.3);
  c.lineTo(cx - 1.2, cy + 1.8);
  c.lineTo(cx + 1.2, cy + 2.5);
  c.lineTo(cx + 0.2, cy + 4.1);
  c.lineTo(cx - 1.8, cy + 4.1);
  c.stroke();

  c.restore();
}

// 4. Slack (Real 4-Color Slack Octothorpe: Blue #36C5F0, Green #2EB67D, Red #E01E5A, Yellow #ECB22E)
function drawSlackIcon(c: CanvasRenderingContext2D, cx: number, cy: number, alpha: number) {
  c.save();
  c.globalAlpha = Math.min(1, alpha * 1.2);
  c.lineCap = 'round';

  // Blue Top-Left (#36C5F0)
  c.strokeStyle = '#36C5F0';
  c.lineWidth = 2.1;
  c.beginPath();
  c.moveTo(cx - 2, cy - 5.5);
  c.lineTo(cx - 2, cy - 1.5);
  c.stroke();
  c.fillStyle = '#36C5F0';
  c.beginPath();
  c.arc(cx + 3.2, cy - 3.5, 1.2, 0, Math.PI * 2);
  c.fill();

  // Green Top-Right (#2EB67D)
  c.strokeStyle = '#2EB67D';
  c.beginPath();
  c.moveTo(cx + 5.5, cy - 2);
  c.lineTo(cx + 1.5, cy - 2);
  c.stroke();
  c.fillStyle = '#2EB67D';
  c.beginPath();
  c.arc(cx + 3.5, cy + 3.2, 1.2, 0, Math.PI * 2);
  c.fill();

  // Red Bottom-Right (#E01E5A)
  c.strokeStyle = '#E01E5A';
  c.beginPath();
  c.moveTo(cx + 2, cy + 5.5);
  c.lineTo(cx + 2, cy + 1.5);
  c.stroke();
  c.fillStyle = '#E01E5A';
  c.beginPath();
  c.arc(cx - 3.2, cy + 3.5, 1.2, 0, Math.PI * 2);
  c.fill();

  // Yellow Bottom-Left (#ECB22E)
  c.strokeStyle = '#ECB22E';
  c.beginPath();
  c.moveTo(cx - 5.5, cy + 2);
  c.lineTo(cx - 1.5, cy + 2);
  c.stroke();
  c.fillStyle = '#ECB22E';
  c.beginPath();
  c.arc(cx - 3.5, cy - 3.2, 1.2, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

// 5. WhatsApp (Real WhatsApp Green #25D366 bubble + white handset)
function drawWhatsAppIcon(c: CanvasRenderingContext2D, cx: number, cy: number, alpha: number) {
  c.save();
  c.globalAlpha = Math.min(1, alpha * 1.2);

  // WhatsApp Green Circle Badge
  c.fillStyle = '#25D366';
  c.beginPath();
  c.arc(cx, cy - 0.5, 6.2, 0, Math.PI * 2);
  c.fill();

  // Bubble tail at bottom-left
  c.beginPath();
  c.moveTo(cx - 5, cy + 3);
  c.lineTo(cx - 7.5, cy + 6.5);
  c.lineTo(cx - 3, cy + 5.2);
  c.closePath();
  c.fill();

  // White Telephone Handset
  c.strokeStyle = '#FFFFFF';
  c.fillStyle = '#FFFFFF';
  c.lineWidth = 1.35;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  c.beginPath();
  c.arc(cx - 0.2, cy - 0.7, 3.1, -Math.PI * 0.6, Math.PI * 0.1, false);
  c.stroke();

  c.beginPath();
  c.arc(cx - 1.9, cy - 2.9, 1.1, 0, Math.PI * 2);
  c.fill();

  c.beginPath();
  c.arc(cx + 2.4, cy + 1.4, 1.1, 0, Math.PI * 2);
  c.fill();

  c.restore();
}

// 6. SMS Alerts (Real Messaging Blue #007AFF bubble + clean white "SMS")
function drawSMSIcon(c: CanvasRenderingContext2D, cx: number, cy: number, alpha: number) {
  c.save();
  c.globalAlpha = Math.min(1, alpha * 1.2);

  // Messaging Blue Bubble
  c.fillStyle = '#007AFF';
  c.beginPath();
  c.arc(cx, cy - 0.5, 6.2, 0, Math.PI * 2);
  c.fill();

  // Bubble tail at bottom-left
  c.beginPath();
  c.moveTo(cx - 4.8, cy + 3);
  c.lineTo(cx - 7.2, cy + 6.2);
  c.lineTo(cx - 2.8, cy + 5);
  c.closePath();
  c.fill();

  // White "SMS" text
  c.fillStyle = '#FFFFFF';
  c.font = "bold 6px 'Satoshi', -apple-system, sans-serif";
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('SMS', cx + 0.2, cy - 0.4);

  c.restore();
}

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: TopologyNode[] = [];

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
      radius: 195,
    };

    const hubs: IntegrationHub[] = [
      {
        id: 'merchant',
        name: 'Merchant API v1',
        relX: 0.90,
        relY: 0.13,
        drawIcon: drawMerchantIcon,
        hoverProgress: 0,
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
        floatPhase: 0,
        connectedNodes: [],
      },
      {
        id: 'shopify',
        name: 'Shopify',
        relX: 0.08,
        relY: 0.18,
        drawIcon: drawShopifyIcon,
        hoverProgress: 0,
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
        floatPhase: 1.25,
        connectedNodes: [],
      },
      {
        id: 'slack',
        name: 'Slack',
        relX: 0.95,
        relY: 0.23,
        drawIcon: drawSlackIcon,
        hoverProgress: 0,
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
        floatPhase: 2.5,
        connectedNodes: [],
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        relX: 0.12,
        relY: 0.32,
        drawIcon: drawWhatsAppIcon,
        hoverProgress: 0,
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
        floatPhase: 3.75,
        connectedNodes: [],
      },
      {
        id: 'sms',
        name: 'SMS Gateway',
        relX: 0.88,
        relY: 0.33,
        drawIcon: drawSMSIcon,
        hoverProgress: 0,
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
        floatPhase: 5.0,
        connectedNodes: [],
      },
    ];

    const hubConnections: [string, string][] = [
      ['merchant', 'shopify'],
      ['merchant', 'slack'],
      ['shopify', 'slack'],
      ['shopify', 'whatsapp'],
      ['slack', 'sms'],
      ['whatsapp', 'sms'],
      ['merchant', 'sms'],
      ['merchant', 'whatsapp'],
      ['shopify', 'sms'],
    ];

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx?.scale(dpr, dpr);

      const isMobile = width < 860;
      hubs.forEach((hub) => {
        let rx = hub.relX;
        let ry = hub.relY;
        if (isMobile) {
          if (rx < 0.5) rx = Math.max(0.12, rx * 0.95);
          else rx = Math.min(0.88, 1 - (1 - rx) * 0.95);
        }
        hub.baseX = rx * width;
        hub.baseY = ry * height;
        hub.x = hub.baseX;
        hub.y = hub.baseY;
      });

      const targetCount = Math.min(Math.max(Math.floor((width * height) / 7200), 55), 175);
      nodes = [];
      for (let i = 0; i < targetCount; i++) {
        nodes.push(new TopologyNode(width, height));
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    resize();

    function renderLoop() {
      const now = Date.now() * 0.001;

      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.16;
        mouse.y += (mouse.targetY - mouse.y) * 0.16;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      ctx?.clearRect(0, 0, width, height);

      const connectionDist = 110;
      const facetMaxDist = 88;
      const nodeCount = nodes.length;

      for (let i = 0; i < nodeCount; i++) {
        nodes[i].update(width, height, mouse);
      }

      // Hub update
      hubs.forEach((hub) => {
        hub.x = hub.baseX + Math.cos(now * 0.45 + hub.floatPhase) * 4.5;
        hub.y = hub.baseY + Math.sin(now * 0.55 + hub.floatPhase) * 4.0;

        hub.connectedNodes = [];
        for (let i = 0; i < nodeCount; i++) {
          const n = nodes[i];
          const dist = Math.hypot(n.x - hub.x, n.y - hub.y);
          if (dist < connectionDist * 1.25) {
            hub.connectedNodes.push({ node: n, dist });
          }
        }

        const mouseDist = Math.hypot(hub.x - mouse.x, hub.y - mouse.y);
        let isLineHovered = false;

        if (mouse.active) {
          if (mouseDist < 195) {
            isLineHovered = true;
          } else {
            for (let k = 0; k < hub.connectedNodes.length; k++) {
              const targetNode = hub.connectedNodes[k].node;
              if (distToSegment(mouse.x, mouse.y, hub.x, hub.y, targetNode.x, targetNode.y) < 36) {
                isLineHovered = true;
                break;
              }
            }
            if (!isLineHovered) {
              for (let p = 0; p < hubConnections.length; p++) {
                const [idA, idB] = hubConnections[p];
                if (hub.id === idA || hub.id === idB) {
                  const otherHub = hubs.find((h) => h.id === (hub.id === idA ? idB : idA));
                  if (otherHub && distToSegment(mouse.x, mouse.y, hub.x, hub.y, otherHub.x, otherHub.y) < 32) {
                    isLineHovered = true;
                    break;
                  }
                }
              }
            }
          }
        }

        const targetHover = isLineHovered ? Math.max(0.7, 1 - mouseDist / 280) : 0;
        hub.hoverProgress += (targetHover - hub.hoverProgress) * 0.14;
        if (hub.hoverProgress < 0.003) hub.hoverProgress = 0;
      });

      // Pass 1: Facets
      if (ctx) {
        for (let i = 0; i < nodeCount; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodeCount; j++) {
            const n2 = nodes[j];
            const d12 = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (d12 > facetMaxDist) continue;

            for (let k = j + 1; k < nodeCount; k++) {
              const n3 = nodes[k];
              const d23 = Math.hypot(n2.x - n3.x, n2.y - n3.y);
              if (d23 > facetMaxDist) continue;
              const d31 = Math.hypot(n3.x - n1.x, n3.y - n1.y);
              if (d31 > facetMaxDist) continue;

              const avgDist = (d12 + d23 + d31) / 3;
              const facetAlpha = (1 - avgDist / facetMaxDist) * 0.055;

              ctx.fillStyle = `rgba(30, 41, 59, ${facetAlpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.lineTo(n3.x, n3.y);
              ctx.closePath();
              ctx.fill();
            }
          }
        }

        // Pass 2: Lattice Lines
        for (let i = 0; i < nodeCount; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodeCount; j++) {
            const n2 = nodes[j];
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (dist < connectionDist) {
              const alpha = (1 - dist / connectionDist) * 0.22;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(148, 163, 184, ${alpha.toFixed(3)})`;
              ctx.lineWidth = 0.85;
              ctx.stroke();
            }
          }

          if (mouse.active) {
            const mdist = Math.hypot(n1.x - mouse.x, n1.y - mouse.y);
            if (mdist < mouse.radius) {
              const mAlpha = (1 - mdist / mouse.radius) * 0.38;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(148, 163, 184, ${mAlpha.toFixed(3)})`;
              ctx.lineWidth = 1;
              ctx.stroke();

              const midX = (n1.x + mouse.x) * 0.5;
              const midY = (n1.y + mouse.y) * 0.5;
              ctx.fillStyle = `rgba(148, 163, 184, ${mAlpha.toFixed(3)})`;
              ctx.fillRect(midX - 1, midY - 1, 2, 2);
            }
          }

          n1.draw(ctx);
        }

        // Pass 3: Lines connected to individual nodes
        hubs.forEach((hub) => {
          hub.connectedNodes.forEach((item, idx) => {
            const targetNode = item.node;
            const baseAlpha = (1 - item.dist / (connectionDist * 1.25)) * 0.26;
            const lineAlpha = baseAlpha + hub.hoverProgress * 0.42;

            ctx.beginPath();
            ctx.moveTo(hub.x, hub.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 1 + hub.hoverProgress * 0.6;
            ctx.stroke();

            const packetSpeed = 0.28;
            const packetOffset = idx * 0.22;
            const t = (now * packetSpeed + packetOffset) % 1;
            const px = hub.x + (targetNode.x - hub.x) * t;
            const py = hub.y + (targetNode.y - hub.y) * t;

            const packetAlpha = 0.25 + hub.hoverProgress * 0.7;
            ctx.fillStyle = `rgba(16, 185, 129, ${packetAlpha.toFixed(3)})`;
            ctx.fillRect(px - 1, py - 1, 2.5, 2.5);
          });

          if (mouse.active) {
            const mdist = Math.hypot(hub.x - mouse.x, hub.y - mouse.y);
            if (mdist < mouse.radius * 1.15) {
              const mAlpha = (1 - mdist / (mouse.radius * 1.15)) * 0.55;
              ctx.beginPath();
              ctx.moveTo(hub.x, hub.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(148, 163, 184, ${mAlpha.toFixed(3)})`;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            }
          }
        });

        // Pass 3b: Interconnected Hub Backbones (Enterprise Telemetry Mesh)
        hubConnections.forEach(([idA, idB], pairIdx) => {
          const hubA = hubs.find((h) => h.id === idA);
          const hubB = hubs.find((h) => h.id === idB);
          if (!hubA || !hubB) return;

          const anyHovered = hubA.hoverProgress > 0.04 || hubB.hoverProgress > 0.04;
          const maxHp = Math.max(hubA.hoverProgress, hubB.hoverProgress);
          const baseAlpha = 0.22 + maxHp * 0.45;

          ctx.beginPath();
          ctx.moveTo(hubA.x, hubA.y);
          ctx.lineTo(hubB.x, hubB.y);
          ctx.strokeStyle = anyHovered
            ? `rgba(255, 120, 141, ${(baseAlpha * 0.85).toFixed(3)})`
            : `rgba(148, 163, 184, ${(baseAlpha * 0.55).toFixed(3)})`;
          ctx.lineWidth = anyHovered ? 1.4 : 0.85;
          ctx.stroke();

          // Inter-hub live telemetry streaming packets
          const packetSpeed = 0.24;
          const offset = pairIdx * 0.21;
          const t = (now * packetSpeed + offset) % 1;
          const px = hubA.x + (hubB.x - hubA.x) * t;
          const py = hubA.y + (hubB.y - hubA.y) * t;

          ctx.fillStyle = anyHovered
            ? 'rgba(255, 120, 141, 0.95)'
            : 'rgba(16, 185, 129, 0.85)';
          ctx.beginPath();
          ctx.arc(px, py, anyHovered ? 2.4 : 1.75, 0, Math.PI * 2);
          ctx.fill();
        });

        // Pass 4: Hub Nodes & Satoshi Disclosure Pills
        hubs.forEach((hub) => {
          const hp = hub.hoverProgress;
          const hubRadius = 14.5 + hp * 2.8;

          ctx.fillStyle = `rgba(15, 21, 34, ${(0.88 + hp * 0.1).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(hub.x, hub.y, hubRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(148, 163, 184, ${(0.35 + hp * 0.55).toFixed(3)})`;
          ctx.lineWidth = 1 + hp * 0.5;
          ctx.stroke();

          // Authentic full-color real brand logo
          hub.drawIcon(ctx, hub.x, hub.y, 0.88 + hp * 0.12);

          if (hp > 0.04) {
            ctx.save();
            const pillHeight = 32;
            const pillWidth = 168;
            const isLeftSide = hub.x < width * 0.5;
            let pillX = isLeftSide ? hub.x + hubRadius + 10 : hub.x - hubRadius - pillWidth - 10;
            pillX = Math.max(8, Math.min(width - pillWidth - 8, pillX));
            let pillY = hub.y - pillHeight * 0.5;
            pillY = Math.max(8, Math.min(height - pillHeight - 8, pillY));

            ctx.fillStyle = `rgba(15, 21, 34, ${(0.96 * hp).toFixed(3)})`;
            roundRect(ctx, pillX, pillY, pillWidth, pillHeight, 3);
            ctx.fill();

            ctx.strokeStyle = `rgba(30, 41, 59, ${(0.96 * hp).toFixed(3)})`;
            ctx.lineWidth = 1;
            roundRect(ctx, pillX, pillY, pillWidth, pillHeight, 3);
            ctx.stroke();

            // Satoshi Brand Label
            ctx.font = "600 11px 'Satoshi', -apple-system, sans-serif";
            ctx.fillStyle = `rgba(253, 244, 210, ${(0.95 * hp).toFixed(3)})`;
            ctx.fillText(hub.name, pillX + 11, pillY + 14);

            // Steady Emerald Connected Status (Zero dots or blinking)
            const dotY = pillY + 23;
            ctx.font = "500 9.5px 'Satoshi', -apple-system, sans-serif";
            ctx.fillStyle = `rgba(16, 185, 129, ${(0.95 * hp).toFixed(3)})`;
            ctx.fillText('Connected', pillX + 11, dotY);

            ctx.restore();
          }
        });

        // Cursor Reticle
        if (mouse.active) {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animFrameId = requestAnimationFrame(renderLoop);
    }

    animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
}
