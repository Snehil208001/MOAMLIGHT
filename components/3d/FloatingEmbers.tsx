'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingEmbersProps {
  count?: number;
  glowColor?: string;
  isNightMode?: boolean;
}

export const FloatingEmbers: React.FC<FloatingEmbersProps> = ({
  count = 140,
  glowColor = '#F59E0B',
  isNightMode = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const scrollVelocity = useRef(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  // Track scroll velocity in real-time
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(1, now - lastScrollTime.current);
      const currentY = window.scrollY || window.pageYOffset || 0;
      const deltaY = Math.abs(currentY - lastScrollY.current);

      // Instantaneous velocity (pixels/ms)
      const instantVelocity = deltaY / dt;
      // Smooth decay
      scrollVelocity.current = Math.min(6, scrollVelocity.current * 0.7 + instantVelocity * 2.5);

      lastScrollY.current = currentY;
      lastScrollTime.current = now;
    };

    const decayLoop = () => {
      scrollVelocity.current *= 0.94; // Exponential decay
      animationFrameId = requestAnimationFrame(decayLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    decayLoop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Generate particle positions, speeds, phases, and scales
  const [positions, speeds, phases, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);
    const scl = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread across a broad 3D frustum
      pos[i * 3 + 0] = (Math.random() - 0.5) * 14; // X: -7 to 7
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12; // Y: -6 to 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1; // Z: -5 to 3

      // Individual drifting speed
      spd[i] = 0.008 + Math.random() * 0.018;

      // Phase offset for sine sway
      phs[i] = Math.random() * Math.PI * 2;

      // Varied size for depth of field illusion (out-of-focus dust motes)
      scl[i] = 12 + Math.random() * 32;
    }

    return [pos, spd, phs, scl];
  }, [count]);

  // Create circular soft glowing texture programmatically for crisp out-of-focus blur
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(253, 230, 138, 0.85)'); // light amber
      gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)'); // base amber (#F59E0B)
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const time = state.clock.getElapsedTime();

    // Scroll speed multiplier reacting directly to user scroll velocity
    const velocityBoost = 1 + scrollVelocity.current * 3.5;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Vertical upward drift with scroll reactivity
      posAttr.array[i3 + 1] += speeds[i] * velocityBoost * (delta * 60);

      // Subtle horizontal sway (brownian dust motion)
      posAttr.array[i3 + 0] += Math.sin(time * 0.8 + phases[i]) * 0.003;
      posAttr.array[i3 + 2] += Math.cos(time * 0.6 + phases[i]) * 0.002;

      // Wrap around when particle floats above ceiling (Y > 6)
      if (posAttr.array[i3 + 1] > 6.5) {
        posAttr.array[i3 + 1] = -6.5;
        posAttr.array[i3 + 0] = (Math.random() - 0.5) * 14;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isNightMode ? 0.22 : 0.16}
        map={particleTexture}
        transparent
        opacity={isNightMode ? 0.75 : 0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        color={glowColor}
      />
    </points>
  );
};
