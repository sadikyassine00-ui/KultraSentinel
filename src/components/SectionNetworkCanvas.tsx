'use client';

import React, { useEffect, useRef } from 'react';

class SparseNode {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  baseVx: number = 0;
  baseVy: number = 0;
  type: 'crosshair' | 'dot' | 'anchor' = 'dot';
  size: number = 1.2;
  color: string = 'rgba(148, 163, 184, 0.35)';

  constructor(w: number, h: number) {
    this.reset(w, h, true);
  }

  reset(w: number, h: number, randomPos = false) {
    this.x = randomPos ? Math.random() * w : (Math.random() > 0.5 ? -10 : w + 10);
    this.y = randomPos ? Math.random() * h : Math.random() * h;

    const speed = 0.15 + Math.random() * 0.18;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.baseVx = this.vx;
    this.baseVy = this.vy;

    const seed = Math.random();
    if (seed > 0.85) {
      this.type = 'crosshair';
      this.size = 3.5;
      this.color = 'rgba(148, 163, 184, 0.6)';
    } else if (seed > 0.72) {
      this.type = 'anchor';
      this.size = 2;
      this.color = 'rgba(16, 185, 129, 0.6)';
    } else {
      this.type = 'dot';
      this.size = 1.0 + Math.random() * 0.6;
      this.color = 'rgba(148, 163, 184, 0.35)';
    }
  }

  update(w: number, h: number, mouse: { x: number; y: number; active: boolean }) {
    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 130 && dist > 0) {
        const factor = 1 - dist / 130;
        const force = factor * factor * 1.5;
        this.vx += (dx / dist) * force * 0.15;
        this.vy += (dy / dist) * force * 0.15;
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
    } else if (this.type === 'anchor') {
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

interface SectionNetworkCanvasProps {
  densityMultiplier?: number;
}

export function SectionNetworkCanvas({ densityMultiplier = 1 }: SectionNetworkCanvasProps) {
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
    let nodes: SparseNode[] = [];
    let isVisible = false;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
      radius: 140,
    };

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx?.scale(dpr, dpr);

      // Sparser density than hero (approx 20 - 45 nodes per section)
      const targetCount = Math.min(
        Math.max(Math.floor(((width * height) / 24000) * densityMultiplier), 18),
        48
      );

      nodes = [];
      for (let i = 0; i < targetCount; i++) {
        nodes.push(new SparseNode(width, height));
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
        mouse.active = true;
      } else {
        mouse.active = false;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    // Viewport Visibility Observer: Pause animation when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          renderLoop();
        } else {
          cancelAnimationFrame(animFrameId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    resize();

    function renderLoop() {
      if (!isVisible) return;

      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.14;
        mouse.y += (mouse.targetY - mouse.y) * 0.14;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      ctx?.clearRect(0, 0, width, height);

      const connectionDist = 125;
      const facetMaxDist = 95;
      const nodeCount = nodes.length;

      for (let i = 0; i < nodeCount; i++) {
        nodes[i].update(width, height, mouse);
      }

      if (ctx) {
        // Pass 1: Subtle geometric mesh facets
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
              const facetAlpha = (1 - avgDist / facetMaxDist) * 0.038;

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

        // Pass 2: Clean lattice lines between nearby nodes
        for (let i = 0; i < nodeCount; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodeCount; j++) {
            const n2 = nodes[j];
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (dist < connectionDist) {
              const alpha = (1 - dist / connectionDist) * 0.16;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(148, 163, 184, ${alpha.toFixed(3)})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }

          // Subtle connection to mouse cursor
          if (mouse.active) {
            const mdist = Math.hypot(n1.x - mouse.x, n1.y - mouse.y);
            if (mdist < mouse.radius) {
              const mAlpha = (1 - mdist / mouse.radius) * 0.28;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(148, 163, 184, ${mAlpha.toFixed(3)})`;
              ctx.lineWidth = 0.9;
              ctx.stroke();
            }
          }

          n1.draw(ctx);
        }
      }

      animFrameId = requestAnimationFrame(renderLoop);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, [densityMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      aria-hidden="true"
    />
  );
}
