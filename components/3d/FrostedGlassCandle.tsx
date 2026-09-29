'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FrostedGlassCandleProps {
  glowColor?: string;
  waxColor?: string;
  isNightMode?: boolean;
}

export const FrostedGlassCandle: React.FC<FrostedGlassCandleProps> = ({
  glowColor = '#FF8C00',
  waxColor = '#FBF6EE',
  isNightMode = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const flameGroupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  // Static color targets for smooth glass tint interpolation
  const dayGlassColor = useMemo(() => new THREE.Color('#F5F0EB'), []);
  const nightGlassColor = useMemo(() => new THREE.Color('#FFEFE0'), []);

  // Luxury Frosted Glass - designed for stunning rendering across hardware and software WebGL
  const frostedGlassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F5F0EB'),
      transparent: true,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.92,
      ior: 1.45,
      thickness: 1.5,
      specularIntensity: 1.4,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.0,
    });
  }, []);

  // Soy Wax Material (Creamy artisanal finish)
  const waxMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF8F0'),
      roughness: 0.85,
      metalness: 0.0,
    });
  }, []);

  // Melted Wax Pool Surface
  const waxPoolMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF5EA'),
      roughness: 0.2,
      metalness: 0.15,
    });
  }, []);

  // Brushed Gold Brass Rim and Base
  const goldMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.9,
      roughness: 0.22,
    });
  }, []);

  // Cotton Wick
  const wickMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F1612'),
      roughness: 0.9,
    });
  }, []);

  // Flame Material (Warm amber outer)
  const flameOuterMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF9500'),
    });
  }, []);

  // Flame Material (Brilliant yellow/white core)
  const flameInnerMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFF6CC'),
    });
  }, []);

  // Volumetric Halo
  const flameHaloMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF8C00'),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Reactively blend glass tint between day and night without recreating material
    if (frostedGlassMaterial) {
      const targetColor = isNightMode ? nightGlassColor : dayGlassColor;
      frostedGlassMaterial.color.lerp(targetColor, 0.05);
    }

    if (groupRef.current) {
      // 1. Weightless floating animation (Y sine wave)
      // period ~3 seconds, amplitude 0.06
      const floatY = Math.sin((time * Math.PI * 2) / 3.0) * 0.06;
      groupRef.current.position.y = -0.1 + floatY;

      // 2. Mouse Parallax Tilt with smooth damping
      // targetRotation.current.x = -state.pointer.y * 0.22;
      // targetRotation.current.y = state.pointer.x * 0.32 + Math.sin(time * 0.35) * 0.04;
      targetRotation.current.x = THREE.MathUtils.clamp(-state.pointer.y * 0.22, -0.26, 0.26);
      targetRotation.current.y = THREE.MathUtils.clamp(state.pointer.x * 0.32 + Math.sin(time * 0.35) * 0.04, -0.26, 0.26);

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        0.05
      );
    }

    // 3. Dynamic flickering warm PointLight inside illuminating the glass
    if (pointLightRef.current) {
      const flicker1 = Math.sin(time * 3.7) * 0.4;
      const flicker2 = Math.sin(time * 7.1) * 0.2;
      const flicker3 = Math.sin(time * 13.3) * 0.1;
      const baseIntensity = isNightMode ? 2.5 : 1.8;

      pointLightRef.current.intensity = Math.max(
        0,
        baseIntensity + flicker1 + flicker2 + flicker3
      );
    }

    // 4. Flame subtle flicker sway
    if (flameGroupRef.current) {
      const swayX = Math.sin(time * 18) * 0.04;
      const swayZ = Math.cos(time * 15) * 0.03;
      const pulse = 1 + Math.sin(time * 22) * 0.06;

      flameGroupRef.current.rotation.x = swayX;
      flameGroupRef.current.rotation.z = swayZ;
      flameGroupRef.current.scale.set(pulse, pulse * 1.08, pulse);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* --- Frosted Glass Outer Jar --- */}
      {/* Cylindrical Glass Wall */}
      <mesh material={frostedGlassMaterial} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.05, 1.02, 2.0, 48, 1, true]} />
      </mesh>

      {/* Solid Glass Base */}
      <mesh material={frostedGlassMaterial} position={[0, -0.98, 0]}>
        <cylinderGeometry args={[1.02, 0.98, 0.16, 48]} />
      </mesh>

      {/* Gold Trim Collar on Top Rim */}
      <mesh material={goldMaterial} position={[0, 1.01, 0]}>
        <torusGeometry args={[1.05, 0.035, 16, 48]} />
      </mesh>

      {/* Gold Trim Base Ring */}
      <mesh material={goldMaterial} position={[0, -1.04, 0]}>
        <torusGeometry args={[1.0, 0.035, 16, 48]} />
      </mesh>

      {/* --- Inner Soy Wax Core --- */}
      <mesh material={waxMaterial} position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.96, 0.94, 1.45, 48]} />
      </mesh>

      {/* Liquid Wax Melt Pool */}
      <mesh material={waxPoolMaterial} position={[0, 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.96, 48]} />
      </mesh>

      {/* --- Label on Glass (Minimalist Artisanal Seal) --- */}
      <mesh position={[0, 0.05, 1.055]}>
        <planeGeometry args={[0.9, 0.7]} />
        <meshStandardMaterial
          color="#FFFDF9"
          roughness={0.5}
          metalness={0.05}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Label Inner Golden Border */}
      <mesh position={[0, 0.05, 1.058]}>
        <planeGeometry args={[0.84, 0.64]} />
        <meshStandardMaterial
          color="#D4AF37"
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* --- Cotton Wick --- */}
      <mesh material={wickMaterial} position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.022, 0.024, 0.28, 16]} />
      </mesh>

      {/* Glowing Ember Tip */}
      <mesh position={[0, 0.81, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#FF3300" />
      </mesh>

      {/* --- Flickering Flame --- */}
      <group ref={flameGroupRef} position={[0, 0.94, 0]}>
        {/* Outer Amber Teardrop Cone */}
        <mesh material={flameOuterMaterial} position={[0, 0, 0]}>
          <coneGeometry args={[0.075, 0.28, 20]} />
        </mesh>

        {/* Inner Brilliant Core */}
        <mesh material={flameInnerMaterial} position={[0, -0.03, 0]}>
          <coneGeometry args={[0.04, 0.18, 20]} />
        </mesh>

        {/* Volumetric Glowing Amber Aura Halo */}
        <mesh material={flameHaloMaterial} position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
        </mesh>
      </group>

      {/* --- Dynamic Flickering PointLight (Illuminates Frosted Glass from Inside) --- */}
      <pointLight
        ref={pointLightRef}
        position={[0, 0.3, 0]}
        color="#F59E0B"
        distance={3.0}
        decay={2}
        castShadow
      />

      {/* Soft Bottom Contact Shadow */}
      <mesh position={[0, -1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isNightMode ? 0.45 : 0.18}
        />
      </mesh>
    </group>
  );
};
