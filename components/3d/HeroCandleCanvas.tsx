'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { useLenis } from '@/components/providers/SmoothScrollProvider';
import * as THREE from 'three';
import { FrostedGlassCandle } from './FrostedGlassCandle';
import { FloatingEmbers } from './FloatingEmbers';
import { Move } from 'lucide-react';

interface HeroCandleCanvasProps {
  isNightMode?: boolean;
}

/**
 * 🧊 AGENT 2: ScrollDrivenCandleKinematics
 * 
 * MATHEMATICAL FOUNDATION OF SCROLL KINEMATICS & SCROLLYTELLING:
 * -------------------------------------------------------------------------
 * 1. Normalized Scroll Progress:
 *    Let y = window.scrollY (driven by Lenis smooth scroll).
 *    Let H = threshold height (approximately 85% of viewport height).
 *    p_raw = clamp(y / H, 0.0, 1.0)
 * 
 * 2. Asymmetric Hermite Smoothstep Shaping:
 *    To prevent mechanical stiffness, we map p_raw through an S-curve:
 *      S(p) = p * p * (3.0 - 2.0 * p)
 *    This produces zero first-derivative velocity at both scroll extremes,
 *    giving a graceful start from rest and an imperceptible soft landing.
 * 
 * 3. Frame-Rate Independent Exponential Damping (LERP):
 *    alpha = 1.0 - exp(-lambda * delta)
 *    currentProgress = currentProgress + (targetProgress - currentProgress) * alpha
 *    Using lambda = 5.8 gives an agile yet weighted response (~150ms settling time),
 *    completely independent of client refresh rate (60Hz, 120Hz, 144Hz).
 * 
 * 4. Multi-Axis Rotational Coupling:
 *    - Rotation Y: 0.0 -> +1.18 rad (~67.6 deg).
 *      Exposes the side profile of the vessel, aligning with the directional light
 *      vector to maximize Fresnel rim-highlights and physical glass transmission.
 *    - Rotation X: 0.0 -> +0.22 rad (~12.6 deg).
 *      Tilts the top rim downward toward the camera, revealing the molten wax
 *      pool surface tension and incandescent ember tip.
 *    - Rotation Z: 0.0 -> -0.06 rad (~-3.4 deg).
 *      Provides organic gyroscopic inertia (counter-roll).
 * 
 * 5. Spatial Translation Vector:
 *    - position.x: 0.0 -> -0.32 (drifts toward editorial text hierarchy)
 *    - position.y: 0.0 -> -0.28 (sinks naturally with scroll momentum)
 *    - position.z: 0.0 -> +0.15 (subtle zoom towards lens focal plane)
 */
function ScrollDrivenCandleKinematics({ isNightMode }: { isNightMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const targetProgress = useRef<number>(0);
  const currentProgress = useRef<number>(0);

  // Hook directly into Lenis smooth scroll engine
  useLenis((lenis) => {
    const scroll = lenis.scroll;
    // Map scroll down the initial 800px hero threshold
    const heroThreshold = typeof window !== 'undefined' ? Math.min(850, window.innerHeight * 0.95) : 800;
    targetProgress.current = Math.min(1.0, Math.max(0.0, scroll / heroThreshold));
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Frame-rate independent exponential lerp damping (lambda = 5.8)
    const dampingAlpha = 1.0 - Math.exp(-5.8 * delta);
    currentProgress.current = THREE.MathUtils.lerp(
      currentProgress.current,
      targetProgress.current,
      dampingAlpha
    );

    const raw = currentProgress.current;
    // Cubic Hermite smoothstep curve: S(p) = p^2 * (3 - 2p)
    const smoothProgress = raw * raw * (3.0 - 2.0 * raw);

    // 1. Multi-axis Kinematic Rotation
    groupRef.current.rotation.y = smoothProgress * 1.18; // Side profile reveal
    groupRef.current.rotation.x = smoothProgress * 0.22; // Forward tilt to show molten pool
    groupRef.current.rotation.z = -smoothProgress * 0.06; // Organic gyroscopic counter-roll

    // 2. Spatial Translation
    groupRef.current.position.x = -smoothProgress * 0.32;
    groupRef.current.position.y = -smoothProgress * 0.28;
    groupRef.current.position.z = smoothProgress * 0.15;

    // 3. Dynamic directional lighting shift (catches glass refraction grazing angle)
    if (directionalLightRef.current) {
      // Light sweeps dynamically from [4, 6, 3] to [6, 4.5, 4] during scroll
      directionalLightRef.current.position.x = THREE.MathUtils.lerp(4.0, 6.2, smoothProgress);
      directionalLightRef.current.position.y = THREE.MathUtils.lerp(6.0, 4.5, smoothProgress);
      directionalLightRef.current.position.z = THREE.MathUtils.lerp(3.0, 4.2, smoothProgress);
      directionalLightRef.current.intensity = (isNightMode ? 0.4 : 1.3) + smoothProgress * 0.25;
    }
  });

  return (
    <>
      <directionalLight
        ref={directionalLightRef}
        position={[4, 6, 3]}
        intensity={isNightMode ? 0.4 : 1.3}
        color={isNightMode ? '#FFE8C8' : '#FFFFFF'}
        castShadow
      />

      <group ref={groupRef}>
        <FrostedGlassCandle isNightMode={isNightMode} />
      </group>
    </>
  );
}

export const HeroCandleCanvas: React.FC<HeroCandleCanvasProps> = ({ isNightMode = false }) => {
  const [mounted, setMounted] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center rounded-3xl bg-warm-cream/50 border border-warm-border/60">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-amber/30 border-t-amber animate-spin" />
          <p className="text-xs uppercase tracking-widest text-charcoal-muted font-sans font-medium">
            Illuminating Sanctuary...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden group select-none touch-pan-y bg-gradient-to-b from-warm-cream/40 to-warm-linen/20 border border-warm-border/50 shadow-sm"
    >
      {/* Atmospheric Ambient Backlight Glow behind the Candle */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none rounded-3xl"
        style={{
          background: isNightMode
            ? 'radial-gradient(circle at 50% 50%, rgba(255, 140, 0, 0.22) 0%, rgba(255, 140, 0, 0.06) 50%, transparent 80%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 180, 80, 0.16) 0%, rgba(212, 163, 115, 0.06) 50%, transparent 80%)',
        }}
      />

      {/* Dedicated R3F WebGL Canvas - pauses rendering when scrolled offscreen */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 0.15, 7.8], fov: 32 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 1.5]}
          shadows
          frameloop={isInView ? 'always' : 'never'}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <PerspectiveCamera makeDefault position={[0, 0.15, 7.8]} fov={32} />

          {isNightMode && <fog attach="fog" args={['#0C0A09', 5, 20]} />}

          <Suspense fallback={null}>
            {/* Zero-latency local studio lighting hierarchy (replaces heavy external HDR download) */}
            <ambientLight
              intensity={isNightMode ? 0.45 : 1.1}
              color={isNightMode ? '#2a2233' : '#FFF8EE'}
            />

            {/* Warm Rim Highlight Light (grazes glass bevel edges) */}
            <directionalLight
              position={[-5, 4, -4]}
              intensity={isNightMode ? 0.6 : 0.85}
              color="#FFE8C2"
            />

            {/* Front Soft Fill Light */}
            <directionalLight
              position={[0, -2, 5]}
              intensity={0.35}
              color="#FFF0D4"
            />

            {/* 3D Scrollytelling Kinematics with Physical Glass Refraction */}
            <ScrollDrivenCandleKinematics isNightMode={isNightMode} />

            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={isNightMode ? 0.6 : 0.3}
              scale={8}
              blur={2.0}
              far={3.5}
            />

            {/* Interactive Floating Embers with Mouse Repulsion Physics */}
            <FloatingEmbers count={32} isNightMode={isNightMode} />
          </Suspense>
        </Canvas>
      </div>

      {/* Interactive Glassmorphism Overlay Pill Badge */}
      <div className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-6 pointer-events-none z-10">
        <div className="glass-panel px-4 py-2 rounded-full inline-flex items-center gap-2.5 shadow-sm text-xs text-charcoal font-medium border border-warm-border/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber" />
          </span>
          <span className="font-serif italic text-charcoal">Real-time 3D</span>
          <span className="text-[11px] text-charcoal-muted flex items-center gap-1 font-sans">
            <Move className="w-3 h-3" /> Move cursor &amp; scroll to inspect
          </span>
        </div>
      </div>
    </div>
  );
};
