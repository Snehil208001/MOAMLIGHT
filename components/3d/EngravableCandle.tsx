'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ScentSmokeSimulation } from './ScentSmokeSimulation';

interface EngravableCandleProps {
  engravingText?: string;
  engravingFont?: string; // 'serif' | 'sans' | 'script'
  waxColor?: string;
  glowColor?: string;
  isNightMode?: boolean;
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

  const displayText = engravingText.trim() ? engravingText.trim().toUpperCase() : 'MOAMLIGHT';
  const hasCustomEngraving = engravingText.trim().length > 0;

  // Real-time CanvasTexture for the engraved gold plaque (100% offline, zero network delay, never suspends)
  const plaqueTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Metallic brushed brass background
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 768);
    bgGrad.addColorStop(0.0, '#E6C762');
    bgGrad.addColorStop(0.3, '#F5DE88');
    bgGrad.addColorStop(0.5, '#D4AF37');
    bgGrad.addColorStop(0.7, '#C59C27');
    bgGrad.addColorStop(1.0, '#E1BF54');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 768);

    // Outer & inner decorative embossed borders
    ctx.strokeStyle = '#997316';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 952, 696);

    ctx.strokeStyle = '#FFE89E';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(48, 48, 928, 672);

    // Decorative corner rivets
    const drawRivet = (x: number, y: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#6D4F0C';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF2BD';
      ctx.fill();
    };
    drawRivet(48, 48);
    drawRivet(976, 48);
    drawRivet(48, 720);
    drawRivet(976, 720);

    // Top emblem
    ctx.fillStyle = '#6D4F0C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '26px serif';
    ctx.fillText('✦   ✧   ✦', 512, 160);

    // Engraved Typography (with subtle bevel / engraved shadow)
    const mainFontSize = displayText.length > 14 ? 44 : displayText.length > 9 ? 52 : 62;
    const mainFontFamily = engravingFont === 'script'
      ? 'italic Georgia, "Cormorant Garamond", serif'
      : '"Cinzel", "Cormorant Garamond", Georgia, serif';

    // Engraved highlight (sunken text bevel)
    ctx.fillStyle = '#FFEAA8';
    ctx.font = `700 ${mainFontSize}px ${mainFontFamily}`;
    ctx.letterSpacing = displayText.length > 14 ? '4px' : '8px';
    ctx.fillText(displayText, 513, 351);

    // Engraved deep shadow
    ctx.fillStyle = '#3E2A05';
    ctx.fillText(displayText, 512, 350);

    // Divider
    ctx.strokeStyle = '#6D4F0C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(320, 430);
    ctx.lineTo(704, 430);
    ctx.stroke();

    // Sub-heading
    ctx.fillStyle = '#4E380E';
    ctx.font = '600 22px "Plus Jakarta Sans", "Montserrat", system-ui, sans-serif';
    ctx.letterSpacing = '5px';
    const subText = hasCustomEngraving
      ? '✦ BESPOKE ARTISANAL ENGRAVING ✦'
      : 'BOTANICAL SOY WAX · ATELIER';
    ctx.fillText(subText, 512, 500);

    // Origin stamp
    ctx.fillStyle = '#6D4F0C';
    ctx.font = '500 16px "Plus Jakarta Sans", "Montserrat", system-ui, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('HAND-POURED IN INDIA', 512, 580);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [displayText, hasCustomEngraving, engravingFont]);

  // Color targets
  const dayGlassColor = useMemo(() => new THREE.Color('#FFFFFF'), []);
  const nightGlassColor = useMemo(() => new THREE.Color('#FFEFE2'), []);

  // 🧊 AGENT 2: Physical Frosted Glass Material with Crown Glass Optics & Chromatic Dispersion
  const physicalFrostedGlassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
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
  }, []);

  // Scent-Specific Botanical Soy Wax Core
  const botanicalWaxMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(waxColor),
      roughness: 0.88,
      metalness: 0.02,
    });
  }, [waxColor]);

  // Molten Wax Pool
  const moltenWaxMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(waxColor).lerp(new THREE.Color('#FFF4E0'), 0.3),
      roughness: 0.16,
      metalness: 0.08,
    });
  }, [waxColor]);

  // Royal Brushed Gold Brass for Rims and Engraved Plaque
  const royalGoldBrassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.94,
      roughness: 0.22,
    });
  }, []);

  // Braided Cotton Wick
  const wickMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1C1613'),
      roughness: 0.92,
    });
  }, []);

  // Flame Materials
  const flameOuterMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF7A00'),
      transparent: true,
      opacity: 0.92,
    });
  }, []);

  const flameInnerCoreMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFFFF0'),
    });
  }, []);

  const flameVolumetricHaloMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF8C00'),
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Caustic Glow Ring below base
  const causticRingMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF9922'),
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

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

  return (
    <group ref={groupRef} position={[0, -0.08, 0]}>
      {/* ================================================================= */}
      {/* 1. BOTANICAL SOY WAX CORE & MELT POOL (Color matched to scent)   */}
      {/* ================================================================= */}
      <mesh material={botanicalWaxMaterial} position={[0, -0.16, 0]} renderOrder={1}>
        <cylinderGeometry args={[0.96, 0.93, 1.48, 64]} />
      </mesh>
      <mesh material={moltenWaxMaterial} position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <circleGeometry args={[0.96, 64]} />
      </mesh>

      {/* ================================================================= */}
      {/* 2. COTTON WICK & EMBER                                            */}
      {/* ================================================================= */}
      <mesh material={wickMaterial} position={[0, 0.72, 0]} renderOrder={1}>
        <cylinderGeometry args={[0.02, 0.023, 0.28, 16]} />
      </mesh>
      <mesh position={[0, 0.85, 0]} renderOrder={1}>
        <sphereGeometry args={[0.038, 16, 16]} />
        <meshBasicMaterial color="#FF3B00" />
      </mesh>

      {/* ================================================================= */}
      {/* 3. VOLUMETRIC FLAME & SCENT SMOKE SIMULATION                      */}
      {/* ================================================================= */}
      <group ref={flameGroupRef} position={[0, 0.99, 0]} renderOrder={1}>
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

      {/* ================================================================= */}
      {/* 4. PHYSICAL FROSTED GLASS JAR                                     */}
      {/* ================================================================= */}
      <mesh material={physicalFrostedGlassMaterial} position={[0, 0, 0]} renderOrder={2}>
        <cylinderGeometry args={[1.06, 1.03, 2.02, 64, 1, true]} />
      </mesh>
      <mesh material={physicalFrostedGlassMaterial} position={[0, -0.96, 0]} renderOrder={2}>
        <cylinderGeometry args={[1.03, 0.98, 0.22, 64]} />
      </mesh>
      <mesh material={physicalFrostedGlassMaterial} position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <torusGeometry args={[1.045, 0.024, 16, 64]} />
      </mesh>
      <mesh material={royalGoldBrassMaterial} position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <torusGeometry args={[1.055, 0.022, 16, 64]} />
      </mesh>
      <mesh material={royalGoldBrassMaterial} position={[0, -1.04, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <torusGeometry args={[1.005, 0.025, 16, 64]} />
      </mesh>

      {/* ================================================================= */}
      {/* 5. REAL-TIME 3D ENGRAVED BESPOKE GOLD PLAQUE                      */}
      {/* ================================================================= */}
      {/* Metallic Gold Framing Rim */}
      <mesh position={[0, 0.04, 1.068]} renderOrder={3}>
        <planeGeometry args={[0.96, 0.72]} />
        <meshStandardMaterial
          color="#D4AF37"
          roughness={0.25}
          metalness={0.9}
        />
      </mesh>

      {/* Real-time Engraved Plaque Canvas Surface */}
      <mesh position={[0, 0.04, 1.071]} renderOrder={4}>
        <planeGeometry args={[0.92, 0.69]} />
        <meshStandardMaterial
          map={plaqueTexture || undefined}
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>

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
