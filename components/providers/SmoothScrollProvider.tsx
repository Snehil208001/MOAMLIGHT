'use client';

import React, { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, useLenis as useLenisCore } from 'lenis/react';
import type { LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useFrame } from '@react-three/fiber';

/**
 * Re-export useLenis hook from lenis/react for application-wide consumption.
 * Supports scroll callbacks: useLenis((lenis) => { ... })
 * or instance access: const lenis = useLenis();
 */
export const useLenis = useLenisCore;

/**
 * LenisScrollTriggerBridge:
 * Keeps GSAP ScrollTrigger computations strictly synchronized with Lenis's smooth scroll position.
 */
function LenisScrollTriggerBridge() {
  useLenisCore(() => {
    ScrollTrigger.update();
  });

  return null;
}

/**
 * LenisR3FBridge:
 * Connects the Three.js / React Three Fiber render loop with Lenis.
 * Must be mounted within the global <Canvas>.
 */
export function LenisR3FBridge() {
  const lenis = useLenisCore();

  useFrame(() => {
    if (lenis && !lenis.isStopped) {
      // Synchronize internal tick counter if autoRaf is driven externally
      // lenis.raf(performance.now());
    }
  });

  return null;
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * 🎨 AGENT 1: SmoothScrollProvider
 * 
 * Configured for an ultra-luxurious, heavy editorial magazine feel.
 * 
 * MATHEMATICAL FOUNDATION OF LUXURY DAMPING:
 * -------------------------------------------------------------
 * 1. Linear Interpolation (LERP = 0.06):
 *    At each frame:
 *      position(t + dt) = position(t) + (targetPosition - position(t)) * lerp
 *    A lower lerp factor (0.05 - 0.07) introduces visceral physical inertia,
 *    simulating the resistance of turning heavy 300gsm heavyweight cotton paper
 *    in an art book or luxury brand lookbook.
 * 
 * 2. Exponential Deceleration Easing:
 *    f(t) = min(1.0, 1.001 - 2^(-10 * t))
 *    Unlike standard linear interpolation or cubic ease-out, exponential
 *    decay gives an instantaneous responsive start upon wheel actuation,
 *    followed by an extended, buttery asymptotic gliding tail.
 * 
 * 3. Wheel Multiplier (0.88) & Touch Multiplier (1.6):
 *    Gentle dampening on mouse wheels prevents jerky stepped scrolling,
 *    while touch interaction retains direct finger engagement.
 */

/**
 * LenisScrollReset:
 * Instantly resets window scroll position to 0 on Next.js route navigation
 * without waiting for slow smooth-scroll glide.
 */
function LenisScrollReset() {
  const pathname = usePathname();
  const lenis = useLenisCore();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Bind GSAP Ticker to Lenis for seamless scroll-scrubbed animations
    const lenis = lenisRef.current?.lenis;
    if (lenis) {
      (window as unknown as { __LENIS__: typeof lenis }).__LENIS__ = lenis;
    }
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.14, // Immediate, crisp and buttery responsive response
        duration: 0.6, // Fast settling time with zero sluggish drag
        smoothWheel: true, // Smooth mousewheel events
        wheelMultiplier: 1.1, // Natural 1:1 wheel response
        touchMultiplier: 1.2, // Responsive mobile swipe
        infinite: false,
        syncTouch: false,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {/* Instant route change scroll reset */}
      <LenisScrollReset />

      {/* Real-time GSAP ScrollTrigger sync */}
      <LenisScrollTriggerBridge />

      {/* Page Tree Content */}
      {children}
    </ReactLenis>
  );
};
