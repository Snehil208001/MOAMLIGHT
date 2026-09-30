'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * High-Performance 120 FPS Luxury Amber Cursor
 *
 * Uses direct hardware-accelerated translate3d transforms via requestAnimationFrame
 * with zero backdrop-filter or blend-mode rasterization stalls.
 */
export const CustomCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    setIsEnabled(true);

    let mouseX = -100;
    let mouseY = -100;
    let orbX = -100;
    let orbY = -100;
    let isVisible = false;
    let isHovered = false;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (orbRef.current) orbRef.current.style.opacity = '0.6';
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (orbRef.current) orbRef.current.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (orbRef.current) orbRef.current.style.opacity = isHovered ? '0.9' : '0.6';
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      const interactive =
        tag === 'A' ||
        tag === 'BUTTON' ||
        tag === 'INPUT' ||
        tag === 'SELECT' ||
        tag === 'TEXTAREA' ||
        Boolean(target.closest('a, button, [role="button"], .cursor-pointer'));

      if (interactive !== isHovered) {
        isHovered = interactive;
        if (orbRef.current) {
          orbRef.current.style.transform = `translate3d(${orbX}px, ${orbY}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.8 : 1})`;
          orbRef.current.style.borderColor = isHovered ? 'rgba(217, 119, 6, 0.9)' : 'rgba(245, 158, 11, 0.5)';
          orbRef.current.style.backgroundColor = isHovered ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.05)';
        }
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${isHovered ? 0.6 : 1})`;
        }
      }
    };

    const tick = () => {
      // Smooth lerp for trailing aura orb
      orbX += (mouseX - orbX) * 0.22;
      orbY += (mouseY - orbY) * 0.22;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${isHovered ? 0.6 : 1})`;
      }

      if (orbRef.current) {
        orbRef.current.style.transform = `translate3d(${orbX}px, ${orbY}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.8 : 1})`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      {/* 1. Trailing Ambient Aura Orb */}
      <div
        ref={orbRef}
        className="w-8 h-8 rounded-full border border-amber/50 bg-amber/5 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-[border-color,background-color] duration-150 will-change-transform"
        style={{
          opacity: 0,
          transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
        }}
      />

      {/* 2. Precision Core Dot */}
      <div
        ref={dotRef}
        className="w-2.5 h-2.5 rounded-full bg-amber shadow-[0_0_8px_rgba(245,158,11,0.8)] transition-transform duration-100 will-change-transform"
        style={{
          opacity: 0,
          transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
        }}
      />
    </div>
  );
};
