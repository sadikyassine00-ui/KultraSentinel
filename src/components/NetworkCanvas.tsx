'use client';

import React, { useEffect, useRef } from 'react';

interface ConstellationNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  amplitudeX: number;
  amplitudeY: number;
  isSignal?: boolean;
}

interface BrandHub {
  id: string;
  name: string;
  baseXRatio: number;
  baseYRatio: number;
  x: number;
  y: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  amplitudeX: number;
  amplitudeY: number;
}

interface SignalPacket {
  fromNodeIdx: number;
  toHubIdx: number;
  progress: number; // 0 to 1
  speed: number;
}

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Direct DOM refs for 60fps zero-overhead transform updates
  const googleHubRef = useRef<HTMLDivElement | null>(null);
  const shopifyHubRef = useRef<HTMLDivElement | null>(null);
  const slackHubRef = useRef<HTMLDivElement | null>(null);
  const smsHubRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: ConstellationNode[] = [];
    let packets: SignalPacket[] = [];

    // 4 designated brand hubs connecting the network to real merchant integrations
    const hubs: BrandHub[] = [
      {
        id: 'google',
        name: 'Google Merchant',
        baseXRatio: 0.12,
        baseYRatio: 0.28,
        x: 0,
        y: 0,
        phaseX: 0.2,
        phaseY: 1.1,
        speedX: 0.00045,
        speedY: 0.00035,
        amplitudeX: 16,
        amplitudeY: 12,
      },
      {
        id: 'shopify',
        name: 'Shopify Admin',
        baseXRatio: 0.14,
        baseYRatio: 0.76,
        x: 0,
        y: 0,
        phaseX: 2.3,
        phaseY: 0.7,
        speedX: 0.00038,
        speedY: 0.00042,
        amplitudeX: 18,
        amplitudeY: 14,
      },
      {
        id: 'slack',
        name: 'Slack Telemetry',
        baseXRatio: 0.86,
        baseYRatio: 0.24,
        x: 0,
        y: 0,
        phaseX: 1.5,
        phaseY: 2.8,
        speedX: 0.00042,
        speedY: 0.00038,
        amplitudeX: 15,
        amplitudeY: 12,
      },
      {
        id: 'sms',
        name: 'SMS Watchdog',
        baseXRatio: 0.84,
        baseYRatio: 0.78,
        x: 0,
        y: 0,
        phaseX: 3.1,
        phaseY: 1.9,
        speedX: 0.0004,
        speedY: 0.00045,
        amplitudeX: 16,
        amplitudeY: 15,
      },
    ];

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function resize() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      // Initialize hub positions based on current viewport geometry
      for (const hub of hubs) {
        hub.x = width * hub.baseXRatio;
        hub.y = height * hub.baseYRatio;
      }

      // Constellation node distribution: 20-36 nodes total
      const count = Math.max(18, Math.min(36, Math.floor((width * height) / 40000)));
      nodes = [];

      for (let i = 0; i < count; i++) {
        const bx = Math.random() * width;
        const by = Math.random() * height;
        nodes.push({
          x: bx,
          y: by,
          baseX: bx,
          baseY: by,
          radius: 1.5 + Math.random() * 0.75, // 1.5 - 2.25px
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          speedX: 0.00035 + Math.random() * 0.0003,
          speedY: 0.0003 + Math.random() * 0.0003,
          amplitudeX: 12 + Math.random() * 18,
          amplitudeY: 10 + Math.random() * 14,
          isSignal: i % 7 === 0, // Strategic signal accent nodes
        });
      }

      // Seed packets
      packets = [
        { fromNodeIdx: 0, toHubIdx: 0, progress: 0.1, speed: 0.0025 },
        { fromNodeIdx: 2, toHubIdx: 1, progress: 0.5, speed: 0.003 },
        { fromNodeIdx: 4, toHubIdx: 2, progress: 0.3, speed: 0.0028 },
        { fromNodeIdx: 6, toHubIdx: 3, progress: 0.7, speed: 0.0026 },
      ];
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    let lastTime = performance.now();

    function render(currentTime: number) {
      if (!ctx) return;
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // 1. Update Hub and Node positions with smooth continuous motion
      if (!motionQuery.matches) {
        // Update brand hubs
        for (const hub of hubs) {
          hub.phaseX += hub.speedX * dt;
          hub.phaseY += hub.speedY * dt;
          const baseX = width * hub.baseXRatio;
          const baseY = height * hub.baseYRatio;
          hub.x = baseX + Math.sin(hub.phaseX) * hub.amplitudeX;
          hub.y = baseY + Math.cos(hub.phaseY) * hub.amplitudeY;
        }

        // Update constellation nodes
        for (const n of nodes) {
          n.phaseX += n.speedX * dt;
          n.phaseY += n.speedY * dt;
          n.x = n.baseX + Math.sin(n.phaseX) * n.amplitudeX;
          n.y = n.baseY + Math.cos(n.phaseY) * n.amplitudeY;
        }
      }

      // Synchronize DOM positions of the 4 brand logo badges via GPU transform
      if (googleHubRef.current) {
        googleHubRef.current.style.transform = `translate3d(${hubs[0].x}px, ${hubs[0].y}px, 0) translate(-50%, -50%)`;
      }
      if (shopifyHubRef.current) {
        shopifyHubRef.current.style.transform = `translate3d(${hubs[1].x}px, ${hubs[1].y}px, 0) translate(-50%, -50%)`;
      }
      if (slackHubRef.current) {
        slackHubRef.current.style.transform = `translate3d(${hubs[2].x}px, ${hubs[2].y}px, 0) translate(-50%, -50%)`;
      }
      if (smsHubRef.current) {
        smsHubRef.current.style.transform = `translate3d(${hubs[3].x}px, ${hubs[3].y}px, 0) translate(-50%, -50%)`;
      }

      // 2. Draw lines between nearby constellation nodes (Loose, organic web)
      const maxLineDist = Math.min(width * 0.28, 250);
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        let connectionCount = 0;

        for (let j = i + 1; j < nodes.length; j++) {
          if (connectionCount >= 2) break;
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

          if (dist < maxLineDist) {
            const alpha = (1 - dist / maxLineDist) * 0.12;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
            connectionCount++;
          }
        }
      }

      // 3. Connect constellation nodes to the 4 Brand Hubs (Slack, Google Merchant, SMS, Shopify)
      const maxHubDist = Math.min(width * 0.35, 340);

      for (let h = 0; h < hubs.length; h++) {
        const hub = hubs[h];
        let hubConnections = 0;

        for (let i = 0; i < nodes.length; i++) {
          if (hubConnections >= 3) break;
          const n = nodes[i];
          const dist = Math.hypot(n.x - hub.x, n.y - hub.y);

          if (dist < maxHubDist) {
            const alpha = (1 - dist / maxHubDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(hub.x, hub.y);
            // Signal-tinted connecting lines into live integrations
            ctx.strokeStyle = `rgba(242, 169, 59, ${alpha})`;
            ctx.stroke();
            hubConnections++;

            // Draw traveling signal packet along one active line
            if (!motionQuery.matches && packets[h] && packets[h].fromNodeIdx === i) {
              const p = packets[h];
              p.progress += p.speed * (dt / 16.6);
              if (p.progress > 1) {
                p.progress = 0;
                p.fromNodeIdx = (i + 1) % nodes.length;
              }
              const px = n.x + (hub.x - n.x) * p.progress;
              const py = n.y + (hub.y - n.y) * p.progress;

              ctx.beginPath();
              ctx.arc(px, py, 2.2, 0, Math.PI * 2);
              ctx.fillStyle = '#f2a93b'; // Signal packet
              ctx.shadowColor = 'rgba(242, 169, 59, 0.6)';
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // 4. Draw Constellation Nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        if (n.isSignal) {
          ctx.fillStyle = 'rgba(242, 169, 59, 0.45)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        }
        ctx.fill();
      }

      if (!motionQuery.matches) {
        animFrameId = requestAnimationFrame(render);
      }
    }

    if (motionQuery.matches) {
      render(performance.now());
    } else {
      animFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Full-Viewport Dynamic Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* 1. Google Merchant Center Brand Hub Node */}
      <div
        ref={googleHubRef}
        className="absolute left-0 top-0 hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-[100px] bg-[#0e0f11]/90 backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-opacity duration-300 select-none will-change-transform"
      >
        {/* Google G Vector Icon */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span className="font-mono text-[10.5px] font-medium text-[#cfcdc8] tracking-[0.02em]">
          Google Merchant
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" title="Live Feed Connected" />
      </div>

      {/* 2. Shopify Admin Brand Hub Node */}
      <div
        ref={shopifyHubRef}
        className="absolute left-0 top-0 hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-[100px] bg-[#0e0f11]/90 backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-opacity duration-300 select-none will-change-transform"
      >
        {/* Shopify Authentic Bag Icon */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none">
          <path d="M15.44 3.33a.75.75 0 0 0-.69-.47h-1.5c-.07-1.45-.88-2.86-2.65-2.86-1.54 0-2.42 1.15-2.67 2.86H6.43a.75.75 0 0 0-.74.65L4 21.65a.75.75 0 0 0 .74.85h14.52a.75.75 0 0 0 .74-.85l-1.69-18a.75.75 0 0 0-.87-.32zM10.5 1.5c.98 0 1.25.96 1.3 1.36H9.2c.05-.4.32-1.36 1.3-1.36z" fill="#95BF47"/>
          <path d="M11.8 8.75c-1.3 0-1.8.8-1.8 1.45 0 1.5 2.45 1.7 2.45 3.05 0 .8-.65 1.3-1.5 1.3-.9 0-1.45-.55-1.5-1.35h-1c.05 1.4 1.1 2.2 2.5 2.2 1.45 0 2.5-.85 2.5-2.2 0-1.75-2.45-1.95-2.45-3.15 0-.55.45-.9 1.25-.9.75 0 1.2.45 1.25 1.05h1c-.05-1.2-.95-1.9-2.2-1.9z" fill="#ffffff"/>
        </svg>
        <span className="font-mono text-[10.5px] font-medium text-[#cfcdc8] tracking-[0.02em]">
          Shopify Admin
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" title="1-Click Triage Deep Link" />
      </div>

      {/* 3. Slack Telemetry Brand Hub Node */}
      <div
        ref={slackHubRef}
        className="absolute left-0 top-0 hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-[100px] bg-[#0e0f11]/90 backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-opacity duration-300 select-none will-change-transform"
      >
        {/* Slack Authentic Logo */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
          <path d="M5.04 13.52c0-.85-.69-1.54-1.54-1.54s-1.54.69-1.54 1.54v3.85c0 .85.69 1.54 1.54 1.54s1.54-.69 1.54-1.54v-3.85zm1.54 0c0-.85.69-1.54 1.54-1.54s1.54.69 1.54 1.54-.69 1.54-1.54 1.54h-1.54v-1.54z" fill="#E01E5A"/>
          <path d="M10.48 5.04c-.85 0-1.54-.69-1.54-1.54S9.63 1.96 10.48 1.96h3.85c.85 0 1.54.69 1.54 1.54s-.69 1.54-1.54 1.54h-3.85zm0 1.54c-.85 0-1.54.69-1.54 1.54s.69 1.54 1.54 1.54 1.54-.69 1.54-1.54V6.58h-1.54z" fill="#36C5F0"/>
          <path d="M18.96 10.48c0 .85.69 1.54 1.54 1.54s1.54-.69 1.54-1.54V6.63c0-.85-.69-1.54-1.54-1.54s-1.54.69-1.54 1.54v3.85zm-1.54 0c0 .85-.69 1.54-1.54 1.54s-1.54-.69-1.54-1.54.69-1.54 1.54-1.54h1.54v1.54z" fill="#2EB67D"/>
          <path d="M13.52 18.96c.85 0 1.54.69 1.54 1.54s-.69 1.54-1.54 1.54H9.67c-.85 0-1.54-.69-1.54-1.54s.69-1.54 1.54-1.54h3.85zm0-1.54c.85 0 1.54-.69 1.54-1.54s-.69-1.54-1.54-1.54-1.54.69-1.54 1.54v1.54h1.54z" fill="#ECB22E"/>
        </svg>
        <span className="font-mono text-[10.5px] font-medium text-[#cfcdc8] tracking-[0.02em]">
          Slack Channel
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" title="Instant Incident Dispatch" />
      </div>

      {/* 4. SMS Alerts Brand Hub Node */}
      <div
        ref={smsHubRef}
        className="absolute left-0 top-0 hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-[100px] bg-[#0e0f11]/90 backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-opacity duration-300 select-none will-change-transform"
      >
        {/* SMS Chat Bubble Vector */}
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="#f2a93b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="8" cy="10" r="0.75" fill="#f2a93b"/>
          <circle cx="12" cy="10" r="0.75" fill="#f2a93b"/>
          <circle cx="16" cy="10" r="0.75" fill="#f2a93b"/>
        </svg>
        <span className="font-mono text-[10.5px] font-medium text-[#cfcdc8] tracking-[0.02em]">
          SMS Alerts
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#f2a93b]" title="Emergency Escalation Paging" />
      </div>
    </div>
  );
}
