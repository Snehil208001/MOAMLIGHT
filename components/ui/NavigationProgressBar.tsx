'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Luxury Amber Route Transition Progress Bar
 *
 * Provides immediate 0ms visual feedback at the top of the browser viewport
 * whenever an internal link is clicked, settling smoothly upon pathname update.
 */
export const NavigationProgressBar: React.FC = () => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete and hide progress when route finishes changing
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(hideTimer);
    }
  }, [pathname, isNavigating]);

  // Intercept client clicks on internal <a> links for immediate feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Only handle internal standard navigations
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        (!targetAttr || targetAttr === '_self') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey &&
        href !== pathname &&
        !href.startsWith('#')
      ) {
        setIsNavigating(true);
        setProgress(25);

        if (timerRef.current) clearInterval(timerRef.current);

        // Gradually advance progress while waiting for RSC payload
        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 88) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 88;
            }
            return prev + (prev < 50 ? 20 : 8);
          });
        }, 120);
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ height: '3px' }}
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-amber via-terracotta to-amber shadow-sm transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 10px rgba(217, 119, 6, 0.7), 0 0 4px rgba(245, 158, 11, 0.9)',
        }}
      />
    </div>
  );
};
