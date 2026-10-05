'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { ScentSmokeSimulation } from './ScentSmokeSimulation';

interface EngravableCandleProps {
  engravingText?: string;
  engravingFont?: string; // 'serif' | 'sans' | 'script'
  waxColor?: string;
  glowColor?: string;
  isNightMode?: boolean;
}

// Color targets
const dayGlassColor = new THREE.Color('#FFFFFF');
const nightGlassColor = new THREE.Color('#FFEFE2');

// 🧊 AGENT 2: Physical Frosted Glass Material with Crown Glass Optics & Chromatic Dispersion
let physicalFrostedGlassMaterialInstance: THREE.MeshPhysicalMaterial | null = null;
function getPhysicalFrostedGlassMaterial() {
  if (!physicalFrostedGlassMaterialInstance) {
    physicalFrostedGlassMaterialInstance = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      transparent: true,
      opacity: 0.88,
      roughness: 0.06,
      metalness: 0.02,
      transmission: 0.58,
      ior: 1.48,
      thickness: 0.8,
      specularIntensity: 2.0,
      specularColor: new THREE.Color('#FFFFFF'),
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      attenuationColor: new THREE.Color('#FFF5E8'),
      attenuationDistance: 1.4,
      envMapIntensity: 1.8,
    });
  }
  return physicalFrostedGlassMaterialInstance;
}

// Scent-Specific Botanical Soy Wax Core
const botanicalWaxMaterialsCache: Record<string, THREE.MeshStandardMaterial> = {};
function getBotanicalWaxMaterial(waxColor: string) {
  if (!botanicalWaxMaterialsCache[waxColor]) {
    botanicalWaxMaterialsCache[waxColor] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(waxColor),
      roughness: 0.88,
      metalness: 0.02,
    });
  }
  return botanicalWaxMaterialsCache[waxColor];
}

// Molten Wax Pool
const moltenWaxMaterialsCache: Record<string, THREE.MeshStandardMaterial> = {};
function getMoltenWaxMaterial(waxColor: string) {
  if (!moltenWaxMaterialsCache[waxColor]) {
    moltenWaxMaterialsCache[waxColor] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(waxColor).lerp(new THREE.Color('#FFF4E0'), 0.3),
      roughness: 0.16,
      metalness: 0.08,
    });
  }
  return moltenWaxMaterialsCache[waxColor];
}

// Royal Brushed Gold Brass for Rims and Engraved Plaque
let royalGoldBrassMaterialInstance: THREE.MeshStandardMaterial | null = null;
function getRoyalGoldBrassMaterial() {
  if (!royalGoldBrassMaterialInstance) {
    royalGoldBrassMaterialInstance = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.94,
      roughness: 0.22,
    });
  }
  return royalGoldBrassMaterialInstance;
}

// Braided Cotton Wick
let wickMaterialInstance: THREE.MeshStandardMaterial | null = null;
function getWickMaterial() {
  if (!wickMaterialInstance) {
    wickMaterialInstance = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1C1613'),
      roughness: 0.92,
    });
  }
  return wickMaterialInstance;
}

// Flame Materials
let flameOuterMaterialInstance: THREE.MeshBasicMaterial | null = null;
function getFlameOuterMaterial() {
  if (!flameOuterMaterialInstance) {
    flameOuterMaterialInstance = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF7A00'),
      transparent: true,
      opacity: 0.92,
    });
  }
  return flameOuterMaterialInstance;
}

let flameInnerCoreMaterialInstance: THREE.MeshBasicMaterial | null = null;
function getFlameInnerCoreMaterial() {
  if (!flameInnerCoreMaterialInstance) {
    flameInnerCoreMaterialInstance = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFFFF0'),
    });
  }
  return flameInnerCoreMaterialInstance;
}

let flameVolumetricHaloMaterialInstance: THREE.MeshBasicMaterial | null = null;
function getFlameVolumetricHaloMaterial() {
  if (!flameVolumetricHaloMaterialInstance) {
    flameVolumetricHaloMaterialInstance = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF8C00'),
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }
  return flameVolumetricHaloMaterialInstance;
}

// Caustic Glow Ring below base
let causticRingMaterialInstance: THREE.MeshBasicMaterial | null = null;
function getCausticRingMaterial() {
  if (!causticRingMaterialInstance) {
    causticRingMaterialInstance = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF9922'),
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }
  return causticRingMaterialInstance;
}

export const EngravableCandle: React.FC<EngravableCandleProps> = ({
  engravingText = '',
  engravingFont = 'serif',
  waxColor = '#FFFDF8',
  glowColor = '#FF8C00',
  isNightMode = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const flameGroupRef = useRef<THREE.Group>(null);
  const internalLightRef = useRef<THREE.PointLight>(null);
  const causticRingRef = useRef<THREE.Mesh>(null);

  // Dynamic font sizing based on character count so engraving never overflows
  const fontSize = useMemo(() => {
    const len = engravingText.trim().length;
    if (len <= 8) return 0.072;
    if (len <= 14) return 0.058;
    if (len <= 20) return 0.048;
    return 0.042;
  }, [engravingText]);

  // Color targets

  const physicalFrostedGlassMaterial = getPhysicalFrostedGlassMaterial();
  const botanicalWaxMaterial = getBotanicalWaxMaterial(waxColor);
  const moltenWaxMaterial = getMoltenWaxMaterial(waxColor);
  const royalGoldBrassMaterial = getRoyalGoldBrassMaterial();
  const wickMaterial = getWickMaterial();
  const flameOuterMaterial = getFlameOuterMaterial();
  const flameInnerCoreMaterial = getFlameInnerCoreMaterial();
  const flameVolumetricHaloMaterial = getFlameVolumetricHaloMaterial();
  const causticRingMaterial = getCausticRingMaterial();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Reactive glass tint
    if (physicalFrostedGlassMaterial) {
      const targetColor = isNightMode ? nightGlassColor : dayGlassColor;
      physicalFrostedGlassMaterial.color.lerp(targetColor, 0.05);
    }

    // 2. Flame flicker sway
    if (flameGroupRef.current) {
      const swayX = Math.sin(time * 16.0) * 0.035;
      const swayZ = Math.cos(time * 14.0) * 0.03;
      const pulseY = 1.0 + Math.sin(time * 20.0) * 0.07;
      flameGroupRef.current.rotation.x = swayX;
      flameGroupRef.current.rotation.z = swayZ;
      flameGroupRef.current.scale.set(1.0, pulseY, 1.0);
    }

    // 3. Dynamic flickering internal light
    if (internalLightRef.current) {
      const f1 = Math.sin(time * 4.3) * 0.35;
      const f2 = Math.sin(time * 9.1) * 0.22;
      const baseIntensity = isNightMode ? 2.8 : 2.0;
      internalLightRef.current.intensity = Math.max(0, baseIntensity + f1 + f2);
    }
  });

  const displayText = engravingText.trim() ? engravingText.trim().toUpperCase() : 'MOAMLIGHT';
  const hasCustomEngraving = engravingText.trim().length > 0;

  return (
    <group ref={groupRef} position={[0, -0.08, 0]}>
      {/* ================================================================= */}
      {/* 1. PHYSICAL FROSTED GLASS JAR                                     */}
      {/* ================================================================= */}
      <mesh material={physicalFrostedGlassMaterial} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.06, 1.03, 2.02, 64, 1, true]} />
      </mesh>
      <mesh material={physicalFrostedGlassMaterial} position={[0, -0.96, 0]}>
        <cylinderGeometry args={[1.03, 0.98, 0.22, 64]} />
      </mesh>
      <mesh material={physicalFrostedGlassMaterial} position={[0, 1.01, 0]}>
        <torusGeometry args={[1.045, 0.024, 16, 64]} />
      </mesh>
      <mesh material={royalGoldBrassMaterial} position={[0, 1.01, 0]}>
        <torusGeometry args={[1.055, 0.022, 16, 64]} />
      </mesh>
      <mesh material={royalGoldBrassMaterial} position={[0, -1.04, 0]}>
        <torusGeometry args={[1.005, 0.025, 16, 64]} />
      </mesh>

      {/* ================================================================= */}
      {/* 2. BOTANICAL SOY WAX CORE & MELT POOL (Color matched to scent)   */}
      {/* ================================================================= */}
      <mesh material={botanicalWaxMaterial} position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.96, 0.93, 1.48, 64]} />
      </mesh>
      <mesh material={moltenWaxMaterial} position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.96, 64]} />
      </mesh>

      {/* ================================================================= */}
      {/* 3. REAL-TIME 3D ENGRAVED BESPOKE GOLD PLAQUE                      */}
      {/* ================================================================= */}
      {/* Artisan Plaque Mount on Glass Surface */}
      <mesh position={[0, 0.04, 1.066]}>
        <planeGeometry args={[0.94, 0.74]} />
        <meshStandardMaterial
          color="#FFFDF9"
          roughness={0.55}
          metalness={0.02}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Metallic Gold Framing Rim */}
      <mesh position={[0, 0.04, 1.069]}>
        <planeGeometry args={[0.88, 0.68]} />
        <meshStandardMaterial
          color="#D4AF37"
          roughness={0.25}
          metalness={0.88}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Real-time 3D Typography Rendered with Gold Metallic Shader */}
      <group position={[0, hasCustomEngraving ? 0.06 : 0.05, 1.074]}>
        <Text
          fontSize={fontSize}
          letterSpacing={engravingFont === 'script' ? 0.06 : 0.12}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.78}
          textAlign="center"
        >
          {displayText}
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.94}
            roughness={0.2}
            emissive="#382900"
            emissiveIntensity={0.15}
          />
        </Text>

        {/* Sub-label indicating Bespoke Atelier Craftsmanship */}
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.028}
          letterSpacing={0.16}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.7}
          textAlign="center"
        >
          {hasCustomEngraving ? '✦ BESPOKE ARTISANAL ENGRAVING ✦' : 'BOTANICAL SOY WAX · ATELIER'}
          <meshStandardMaterial
            color="#8A775C"
            roughness={0.4}
            metalness={0.2}
          />
        </Text>
      </group>

      {/* ================================================================= */}
      {/* 4. COTTON WICK & EMBER                                            */}
      {/* ================================================================= */}
      <mesh material={wickMaterial} position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.02, 0.023, 0.28, 16]} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.038, 16, 16]} />
        <meshBasicMaterial color="#FF3B00" />
      </mesh>

      {/* ================================================================= */}
      {/* 5. VOLUMETRIC FLAME & SCENT SMOKE SIMULATION                      */}
      {/* ================================================================= */}
      <group ref={flameGroupRef} position={[0, 0.99, 0]}>
        <mesh material={flameOuterMaterial} position={[0, 0, 0]}>
          <coneGeometry args={[0.078, 0.29, 24]} />
        </mesh>
        <mesh material={flameInnerCoreMaterial} position={[0, -0.035, 0]}>
          <coneGeometry args={[0.042, 0.19, 24]} />
        </mesh>
        <mesh material={flameVolumetricHaloMaterial} position={[0, 0.015, 0]}>
          <sphereGeometry args={[0.24, 20, 20]} />
        </mesh>
      </group>

      {/* Fluid Scent Smoke Simulation rising from flame tip */}
      <ScentSmokeSimulation origin={[0, 1.15, 0]} isNightMode={isNightMode} />

      {/* ================================================================= */}
      {/* 6. INTERNAL LIGHT SOURCE TRANSMITTING THROUGH PHYSICAL GLASS       */}
      {/* ================================================================= */}
      <pointLight
        ref={internalLightRef}
        position={[0, 0.35, 0]}
        color="#FFA32B"
        distance={3.4}
        decay={2}
        castShadow
      />

      {/* 7. PHYSICAL CAUSTICS GLOW RING ON TABLE SURFACE */}
      <mesh
        ref={causticRingRef}
        material={causticRingMaterial}
        position={[0, -1.16, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.3, 1.45, 48]} />
      </mesh>
      <mesh position={[0, -1.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isNightMode ? 0.48 : 0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
