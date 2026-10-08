'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ScentSmokeSimulationProps {
  origin?: [number, number, number];
  color?: string;
  isNightMode?: boolean;
}

/**
 * 🧊 AGENT 2: ScentSmokeSimulation
 * Real-time curling fluid/smoke aroma simulation rising gracefully from the candle flame.
 * Generates organic micro-curls and turbulent dispersion reacting to frame time.
 */

let smokeTextureInstance: THREE.CanvasTexture | null = null;
function getSmokeTexture() {
  if (!smokeTextureInstance) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 248, 240, 0.9)');
      gradient.addColorStop(0.3, 'rgba(255, 230, 200, 0.45)');
      gradient.addColorStop(0.7, 'rgba(240, 230, 220, 0.15)');
      gradient.addColorStop(1, 'rgba(240, 230, 220, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    smokeTextureInstance = new THREE.CanvasTexture(canvas);
    smokeTextureInstance.needsUpdate = true;
  }
  return smokeTextureInstance;
}

export const ScentSmokeSimulation: React.FC<ScentSmokeSimulationProps> = ({
  origin = [0, 1.15, 0],
  color = '#FFF8F0',
  isNightMode = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 70;

  // Initialize particle attributes: position, velocity, lifetime, phase, scale
  const [positions, initialPhases, velocities, opacities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    const vels = new Float32Array(particleCount * 3);
    const opacs = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Stagger vertical progression so smoke is continuously flowing
      const progress = i / particleCount;
      const height = progress * 1.8; // Rises up to 1.8 units

      // Slight initial radius
      const angle = Math.random() * Math.PI * 2;
      const radius = progress * 0.15;

      pos[i * 3 + 0] = origin[0] + Math.cos(angle) * radius;
      pos[i * 3 + 1] = origin[1] + height;
      pos[i * 3 + 2] = origin[2] + Math.sin(angle) * radius;

      phases[i] = Math.random() * Math.PI * 2;
      vels[i * 3 + 0] = (Math.random() - 0.5) * 0.003;
      vels[i * 3 + 1] = 0.008 + Math.random() * 0.006; // Ascending speed
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.003;

      opacs[i] = 0.0;
    }

    return [pos, phases, vels, opacs];
  }, [origin]);

  const smokeTexture = getSmokeTexture();

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const phase = initialPhases[i];

      // Ascend along Y
      posArray[idx + 1] += velocities[idx + 1];

      // Relative vertical height from origin
      const currentHeight = posArray[idx + 1] - origin[1];

      // Curling spiral physics (fluid eddy simulation)
      const curlFreq = 2.4;
      const curlAmp = 0.0035 * Math.min(2.5, currentHeight * 1.5);
      posArray[idx + 0] += Math.sin(time * curlFreq + phase + currentHeight * 4.0) * curlAmp;
      posArray[idx + 2] += Math.cos(time * (curlFreq * 0.9) + phase + currentHeight * 3.5) * curlAmp;

      // Recycle particles when they reach maximum height
      if (currentHeight > 1.8) {
        posArray[idx + 0] = origin[0] + (Math.random() - 0.5) * 0.04;
        posArray[idx + 1] = origin[1] + (Math.random() * 0.05);
        posArray[idx + 2] = origin[2] + (Math.random() - 0.5) * 0.04;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        map={smokeTexture}
        transparent
        opacity={isNightMode ? 0.35 : 0.25}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={color}
      />
    </points>
  );
};
