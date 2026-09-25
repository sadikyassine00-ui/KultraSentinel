'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function startRouteTransition() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kultra:route-start'));
  }
}

export function finishRouteTransition() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kultra:route-end'));
  }
}

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentPathRef = useRef(`${pathname}?${searchParams?.toString() || ''}`);

  const start = () => {
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }

    setVisible(true);
    setProgress((prev) => (prev > 0 && prev < 90 ? prev : 25));

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 90;
        }
        // Smooth logarithmic trickle: faster initially, then slowing down
        const diff = 90 - prev;
        const step = Math.max(0.5, diff * 0.15);
        return Math.min(90, prev + step);
      });
    }, 150);

    // Safety timeout: auto-finish after 8s so bar never hangs indefinitely
    safetyTimeoutRef.current = setTimeout(() => {
      finish();
    }, 8000);
  };

  const finish = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    setProgress(100);

    // Hold at 100% briefly, then fade out
    finishTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      finishTimeoutRef.current = setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  };

  // Complete progress on pathname or searchParams change
  useEffect(() => {
    const newPath = `${pathname}?${searchParams?.toString() || ''}`;
    if (newPath !== currentPathRef.current) {
      currentPathRef.current = newPath;
      finish();
    }
  }, [pathname, searchParams]);

  // Global Link Click Interceptor & Custom Event Listeners
  useEffect(() => {
    const handleRouteStart = () => start();
    const handleRouteEnd = () => finish();

    window.addEventListener('kultra:route-start', handleRouteStart);
    window.addEventListener('kultra:route-end', handleRouteEnd);

    // Global click listener for internal link navigation
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // Only primary clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // Not modified clicks

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore external, download, tel, mailto, target="_blank", or pure hash anchors
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      if (href.startsWith('#')) return;

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Check if same origin
        if (targetUrl.origin !== currentUrl.origin) return;

        // Check if same page with just hash change
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash !== currentUrl.hash
        ) {
          return;
        }

        // Only start if actually navigating to a different route or query
        if (
          targetUrl.pathname !== currentUrl.pathname ||
          targetUrl.search !== currentUrl.search
        ) {
          start();
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('kultra:route-start', handleRouteStart);
      window.removeEventListener('kultra:route-end', handleRouteEnd);
      document.removeEventListener('click', handleDocumentClick, true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  if (!visible && progress === 0) {
    return (
      <div
        id="kultra-route-progress-bar"
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[9999999] pointer-events-none opacity-0"
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <div
      id="kultra-route-progress-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Page loading progress"
      className="fixed top-0 left-0 right-0 z-[9999999] pointer-events-none transition-opacity duration-200"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="h-[3px] bg-[var(--signal)] relative shadow-[0_0_12px_rgba(242,169,59,0.8),0_0_4px_rgba(242,169,59,0.5)] transition-[width] ease-out duration-200"
        style={{
          width: `${progress}%`,
        }}
      >
        {/* Leading edge glow spark */}
        <div className="absolute right-0 top-0 bottom-0 w-24 h-full bg-gradient-to-r from-transparent via-white/40 to-white/90 blur-[1px] opacity-80" />
      </div>
    </div>
  );
}
