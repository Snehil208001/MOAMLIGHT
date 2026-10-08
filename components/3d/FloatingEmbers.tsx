'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingEmbersProps {
  count?: number;
  glowColor?: string;
  isNightMode?: boolean;
}

/**
 * 🧊 AGENT 2: FloatingEmbers
 * 
 * MATHEMATICAL FOUNDATION OF TACTILE PARTICLE PHYSICS:
 * -------------------------------------------------------------------------
 * 1. World-Space Mouse Projection (Raycast Planar Intersection):
 *    In R3F, `state.pointer` provides Normalized Device Coordinates (NDC) in [-1, 1].
 *    Given a perspective camera at distance Z_cam with vertical FOV (theta):
 *      H_world = 2.0 * tan(theta / 2.0) * Z_cam
 *      W_world = H_world * aspect
 *      M_world = (pointer.x * W_world / 2.0, pointer.y * H_world / 2.0, 0.0)
 *    This converts the screen-space cursor into the exact 3D world coordinate
 *    at the focal plane of the candle jar.
 * 
 * 2. Inverse-Quadratic Heat Aura Repulsion & Swirl Dynamics:
 *    Let P_i = position of ember i.
 *    Delta = (P_i.x - M_world.x, P_i.y - M_world.y)
 *    Distance d = sqrt(Delta.x^2 + Delta.y^2)
 * 
 *    Within radius R_aura = 2.4 units, an inverse-quadratic impulse is applied:
 *      intensity = (1.0 - d / R_aura)^2
 *      F_radial  = (Delta / d) * intensity * repulsionStrength
 * 
 *    To simulate fluid turbulence (eddies in warm air), a perpendicular cross-field
 *    tangential vortex is added:
 *      F_vortex  = (-Delta.y / d, Delta.x / d) * intensity * swirlStrength
 *      vel_i += (F_radial + F_vortex) * delta
 * 
 * 3. Thermal Updraft & Aerodynamic Drag (Viscous Damping):
 *    - Updraft: v_y += baseUpwardSpeed + sin(time * freq + phase) * microTurbulence
 *    - Drag: v_x *= exp(-gamma * dt), v_z *= exp(-gamma * dt) (air resistance)
 *    - Restitution: particles slowly return toward their origin lattice to prevent clumping.
 * 
 * 4. Scroll Convection Boost:
 *    As the user scrolls, aerodynamic drag draws air upward:
 *      updraftVelocity = baseSpeed * (1.0 + scrollVelocity * 3.2)
 */

let particleTextureInstance: THREE.CanvasTexture | null = null;
function getParticleTexture() {
  if (!particleTextureInstance) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.25, 'rgba(255, 215, 0, 0.9)');
      gradient.addColorStop(0.55, 'rgba(255, 140, 0, 0.45)');
      gradient.addColorStop(0.85, 'rgba(255, 100, 0, 0.12)');
      gradient.addColorStop(1.0, 'rgba(255, 100, 0, 0.0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    particleTextureInstance = new THREE.CanvasTexture(canvas);
    particleTextureInstance.needsUpdate = true;
  }
  return particleTextureInstance;
}

export const FloatingEmbers: React.FC<FloatingEmbersProps> = ({
  count = 90,
  glowColor = '#F59E0B',
  isNightMode = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const scrollVelocity = useRef<number>(0);
  const lastScrollY = useRef<number>(0);
  const lastScrollTime = useRef<number>(Date.now());

  // Track instantaneous scroll velocity via event listener (decay happens in useFrame)
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(1, now - lastScrollTime.current);
      const currentY = window.scrollY || window.pageYOffset || 0;
      const deltaY = Math.abs(currentY - lastScrollY.current);

      const instantVel = deltaY / dt; // px/ms
      scrollVelocity.current = Math.min(4.0, scrollVelocity.current * 0.65 + instantVel * 2.0);

      lastScrollY.current = currentY;
      lastScrollTime.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Initialize particle states: positions, velocities, original anchors, phases, sizes
  const [positions, velocities, anchorsX, phases, scales, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const anchX = new Float32Array(count);
    const phs = new Float32Array(count);
    const scl = new Float32Array(count);
    const col = new Float32Array(count * 3);

    const goldColor = new THREE.Color('#FFD700');
    const amberColor = new THREE.Color('#FF8C00');
    const nightAmberColor = new THREE.Color('#FF4500');

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 12.0; // Broad horizontal field
      const y = (Math.random() - 0.5) * 10.0;
      const z = (Math.random() - 0.5) * 6.0 - 0.5;

      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      anchX[i] = x;

      vel[i * 3 + 0] = 0;
      vel[i * 3 + 1] = 0.009 + Math.random() * 0.016; // Baseline upward thermal buoyancy
      vel[i * 3 + 2] = 0;

      phs[i] = Math.random() * Math.PI * 2.0;
      scl[i] = 10.0 + Math.random() * 26.0;

      // Color variation across the golden amber spectrum
      const mixedColor = new THREE.Color().copy(goldColor).lerp(
        isNightMode ? nightAmberColor : amberColor,
        Math.random()
      );
      col[i * 3 + 0] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }

    return [pos, vel, anchX, phs, scl, col];
  }, [count, isNightMode]);

  const particleTexture = getParticleTexture();

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const time = state.clock.getElapsedTime();

    // 1. Calculate World-Space Mouse Coordinates at Z = 0
    const vFovRad = (state.camera as THREE.PerspectiveCamera).fov
      ? ((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 180.0
      : (35.0 * Math.PI) / 180.0;
    const camZ = state.camera.position.z || 5.0;
    const planeH = 2.0 * Math.tan(vFovRad / 2.0) * camZ;
    const planeW = planeH * ((state.camera as THREE.PerspectiveCamera).aspect || 1.6);

    const mouseWorldX = (state.pointer.x * planeW) / 2.0;
    const mouseWorldY = (state.pointer.y * planeH) / 2.0;

    // Scroll speed multiplier & decay
    const scrollMultiplier = 1.0 + scrollVelocity.current * 3.2;
    scrollVelocity.current *= 0.94;
    const repulsionRadius = 2.4;
    const repulsionStrength = 0.055;
    const swirlStrength = 0.022;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const px = posArray[idx + 0];
      const py = posArray[idx + 1];

      // 2. Vector from Mouse to Particle
      const dx = px - mouseWorldX;
      const dy = py - mouseWorldY;
      const distSq = dx * dx + dy * dy + 0.0001;
      const dist = Math.sqrt(distSq);

      // 3. Tactile "Heat Aura" Repulsion + Swirl Vortex
      if (dist < repulsionRadius) {
        const falloff = Math.pow(1.0 - dist / repulsionRadius, 2.0);

        // Normalized radial direction
        const nx = dx / dist;
        const ny = dy / dist;

        // Tangential swirl vector (-ny, nx)
        velocities[idx + 0] += (nx * repulsionStrength + -ny * swirlStrength) * falloff;
        velocities[idx + 1] += (ny * repulsionStrength + nx * swirlStrength) * falloff;
        velocities[idx + 2] += (Math.random() - 0.5) * 0.015 * falloff;
      }

      // 4. Upward Buoyant Thermal Draft + Harmonic Micro-Curling
      posArray[idx + 1] += (velocities[idx + 1] + Math.sin(time * 2.2 + phases[i]) * 0.002) * scrollMultiplier * (delta * 60.0);
      posArray[idx + 0] += velocities[idx + 0];
      posArray[idx + 2] += velocities[idx + 2];

      // 5. Viscous Drag & Elastic Spring Restoring Force
      velocities[idx + 0] *= 0.91; // Air friction damping
      velocities[idx + 2] *= 0.91;
      // Gentle spring returning X toward original distributed anchor
      posArray[idx + 0] += (anchorsX[i] - posArray[idx + 0]) * 0.008;

      // 6. Natural Horizontal Sway (Brownian Air Current)
      posArray[idx + 0] += Math.sin(time * 0.75 + phases[i]) * 0.0035;

      // 7. Infinite Vertical Recycle Loop
      if (posArray[idx + 1] > 5.5) {
        posArray[idx + 1] = -5.5;
        posArray[idx + 0] = anchorsX[i] + (Math.random() - 0.5) * 1.5;
        velocities[idx + 0] = 0;
        velocities[idx + 2] = 0;
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
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isNightMode ? 0.24 : 0.17}
        map={particleTexture}
        vertexColors
        transparent
        opacity={isNightMode ? 0.8 : 0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
