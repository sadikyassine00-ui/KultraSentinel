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
  isSignal?: boolean;
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
    let nodes: ConstellationNode[] = [];

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function resize() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      // Sparse and irregular constellation per GEMINI.md §15:
      // roughly 18-32 nodes total across the entire desktop viewport
      const count = Math.max(16, Math.min(32, Math.floor((width * height) / 45000)));
      nodes = [];

      for (let i = 0; i < count; i++) {
        const bx = Math.random() * width;
        const by = Math.random() * height;
        nodes.push({
          x: bx,
          y: by,
          baseX: bx,
          baseY: by,
          radius: 1.5 + Math.random() * 0.5, // 1.5-2px
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          speedX: 0.00015 + Math.random() * 0.0001, // ~30s+ per cycle
          speedY: 0.00012 + Math.random() * 0.0001,
          isSignal: i === 3 || i === 7, // Rare signal node near active hero/content
        });
      }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    let lastTime = performance.now();

    function render(currentTime: number) {
      if (!ctx) return;
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // Connect lines: sparse, straight 1px lines at oblique angles
      const maxLineDist = Math.min(width * 0.28, 260);

      // Update positions with ultra-slow drift (if motion not reduced)
      if (!motionQuery.matches) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.phaseX += n.speedX * dt;
          n.phaseY += n.speedY * dt;
          n.x = n.baseX + Math.sin(n.phaseX) * 14;
          n.y = n.baseY + Math.cos(n.phaseY) * 10;
        }
      }

      // Draw connecting lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'; // --network-line
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        let connectionCount = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          if (connectionCount >= 2) break; // Keep it a loose constellation, not a dense mesh
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < maxLineDist) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
            connectionCount++;
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        if (n.isSignal) {
          ctx.fillStyle = 'rgba(242, 169, 59, 0.4)'; // --network-node-signal
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'; // --network-node
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
