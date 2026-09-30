'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export interface FrostedGlassCandleProps {
  glowColor?: string;
  waxColor?: string;
  isNightMode?: boolean;
  engravingText?: string;
  engravingFont?: string; // 'serif' | 'sans' | 'script'
}

export const FrostedGlassCandle: React.FC<FrostedGlassCandleProps> = ({
  glowColor = '#FF8C00',
  waxColor = '#FBF6EE',
  isNightMode = false,
  engravingText = '',
  engravingFont = 'serif',
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const flameGroupRef = useRef<THREE.Group>(null);
  const flameOuterRef = useRef<THREE.Mesh>(null);
  const internalLightRef = useRef<THREE.PointLight>(null);
  const causticLightRef = useRef<THREE.PointLight>(null);
  const causticRingRef = useRef<THREE.Mesh>(null);

  const targetRotation = useRef({ x: 0, y: 0 });
  const mouseVelocity = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });

  // Dynamic font sizing based on character count so engraving never overflows glass boundary
  const fontSize = useMemo(() => {
    const len = engravingText.trim().length;
    if (len <= 8) return 0.072;
    if (len <= 14) return 0.058;
    if (len <= 20) return 0.048;
    return 0.042;
  }, [engravingText]);

  const displayText = engravingText.trim() ? engravingText.trim().toUpperCase() : 'MOAMLIGHT';
  const hasCustomEngraving = engravingText.trim().length > 0;

  // Luxury Glass Color targets for day / night atmospheric ambiance
  const dayGlassColor = useMemo(() => new THREE.Color('#FFFFFF'), []);
  const nightGlassColor = useMemo(() => new THREE.Color('#FFEFE2'), []);
  const dayAttenuationColor = useMemo(() => new THREE.Color('#FFF5E8'), []);
  const nightAttenuationColor = useMemo(() => new THREE.Color('#FFDDB8'), []);

  // =========================================================================
  // 🧊 AGENT 2: HIGH-END PHYSICAL TRANSMISSION & REFRACTION GLASS
  // Crown glass optics (IOR 1.52), physical transmission, spectral dispersion,
  // volumetric attenuation, and a frosted satin exterior.
  // =========================================================================
  const physicalFrostedGlassMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      transparent: true,
      opacity: 0.88,
      roughness: 0.06, // Crisp satin frosted tactile finish
      metalness: 0.02,
      transmission: 0.58, // Balanced optical transmission for high-contrast clarity
      ior: 1.48, // Optical Crown Glass refraction index
      thickness: 0.8, // Volumetric wall depth
      specularIntensity: 2.0,
      specularColor: new THREE.Color('#FFFFFF'),
      clearcoat: 1.0, // High-gloss outer glaze reflection
      clearcoatRoughness: 0.03,
      attenuationColor: new THREE.Color('#FFF5E8'), // Warm champagne tone along optical path
      attenuationDistance: 1.4,
      envMapIntensity: 1.8, // Crisp environment reflections
    });

    return mat;
  }, []);

  // Artisanal Botanical Soy Wax (Alabaster cream with soft sub-surface scatter look)
  const botanicalSoyWaxMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFDF8'),
      roughness: 0.88,
      metalness: 0.02,
    });
  }, []);

  // Molten Liquid Wax Pool (Surface tension meniscus with glossy sheen)
  const moltenWaxPoolMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF5E4'),
      roughness: 0.15,
      metalness: 0.08,
    });
  }, []);

  // Royal Brushed Gold / Brass Trim Rim & Ring
  const royalGoldBrassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.94,
      roughness: 0.22,
    });
  }, []);

  // Braided Cotton Wick (Charred organic fiber)
  const braidedWickMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1C1613'),
      roughness: 0.92,
    });
  }, []);

  // Glowing Incandescent Flame Materials (3-layer volumetric hierarchy)
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

  // Concentrated Ground Caustic Glow Ring below glass base
  const causticRingMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF9922'),
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Frame Loop: Smooth mouse parallax, organic flicker, and day/night transitions
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Smoothly interpolate glass tint & volumetric attenuation between Day / Night
    if (physicalFrostedGlassMaterial) {
      const targetColor = isNightMode ? nightGlassColor : dayGlassColor;
      const targetAtten = isNightMode ? nightAttenuationColor : dayAttenuationColor;
      physicalFrostedGlassMaterial.color.lerp(targetColor, 0.04);
      physicalFrostedGlassMaterial.attenuationColor.lerp(targetAtten, 0.04);
    }

    // 2. Track mouse velocity for organic flame drag & inertia
    const deltaX = state.pointer.x - mouseVelocity.current.lastX;
    const deltaY = state.pointer.y - mouseVelocity.current.lastY;
    mouseVelocity.current.lastX = state.pointer.x;
    mouseVelocity.current.lastY = state.pointer.y;
    mouseVelocity.current.x = THREE.MathUtils.lerp(mouseVelocity.current.x, deltaX, 0.1);
    mouseVelocity.current.y = THREE.MathUtils.lerp(mouseVelocity.current.y, deltaY, 0.1);

    // 3. Weightless Floating Levitation & Interactive Cursor Parallax
    if (groupRef.current) {
      const floatY = Math.sin((time * Math.PI * 2) / 3.4) * 0.055;
      groupRef.current.position.y = -0.08 + floatY;

      // Smooth clamped cursor tilt
      targetRotation.current.x = THREE.MathUtils.clamp(-state.pointer.y * 0.24, -0.28, 0.28);
      targetRotation.current.y = THREE.MathUtils.clamp(
        state.pointer.x * 0.35 + Math.sin(time * 0.4) * 0.035,
        -0.32,
        0.32
      );

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        0.06
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        0.06
      );
    }

    // 4. Multi-frequency Organic Flame Flicker & Aerodynamic Drag
    if (flameGroupRef.current) {
      // Natural convection micro-sway + drag against mouse movement
      const dragSwayZ = -mouseVelocity.current.x * 1.8;
      const dragSwayX = mouseVelocity.current.y * 1.4;

      const swayX = Math.sin(time * 16.5) * 0.035 + Math.sin(time * 24.2) * 0.015 + dragSwayX;
      const swayZ = Math.cos(time * 13.8) * 0.03 + Math.cos(time * 27.5) * 0.012 + dragSwayZ;
      const pulseY = 1.0 + Math.sin(time * 20.0) * 0.07 + Math.sin(time * 33.0) * 0.03;
      const pulseXZ = 1.0 + Math.cos(time * 17.5) * 0.04;

      flameGroupRef.current.rotation.x = THREE.MathUtils.lerp(flameGroupRef.current.rotation.x, swayX, 0.15);
      flameGroupRef.current.rotation.z = THREE.MathUtils.lerp(flameGroupRef.current.rotation.z, swayZ, 0.15);
      flameGroupRef.current.scale.set(pulseXZ, pulseY, pulseXZ);
    }

    // 5. Dynamic Light Flicker (illuminates physical transmission glass from within)
    if (internalLightRef.current) {
      const f1 = Math.sin(time * 4.3) * 0.35;
      const f2 = Math.sin(time * 9.1) * 0.22;
      const f3 = Math.sin(time * 16.7) * 0.1;
      const baseIntensity = isNightMode ? 2.8 : 2.0;

      const intensity = Math.max(0, baseIntensity + f1 + f2 + f3);
      internalLightRef.current.intensity = intensity;

      if (causticLightRef.current) {
        causticLightRef.current.intensity = intensity * 0.45;
      }

      if (causticRingRef.current) {
        causticRingMaterial.opacity = (isNightMode ? 0.42 : 0.24) + f1 * 0.06;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.08, 0]}>
      {/* ================================================================= */}
      {/* 1. PHYSICAL FROSTED GLASS ENCLOSURE (With refraction & caustics) */}
      {/* ================================================================= */}

      {/* Cylindrical Refractive Outer Glass Wall */}
      <mesh material={physicalFrostedGlassMaterial} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.06, 1.03, 2.02, 64, 1, true]} />
      </mesh>

      {/* Heavy Solid Optical Glass Base (Produces light caustics underneath) */}
      <mesh material={physicalFrostedGlassMaterial} position={[0, -0.96, 0]}>
        <cylinderGeometry args={[1.03, 0.98, 0.22, 64]} />
      </mesh>

      {/* Precision Rounded Glass Top Rim */}
      <mesh material={physicalFrostedGlassMaterial} position={[0, 1.01, 0]}>
        <torusGeometry args={[1.045, 0.024, 16, 64]} />
      </mesh>

      {/* Royal Brushed Brass Collar on Upper Rim */}
      <mesh material={royalGoldBrassMaterial} position={[0, 1.01, 0]}>
        <torusGeometry args={[1.055, 0.022, 16, 64]} />
      </mesh>

      {/* Royal Brushed Brass Foot Ring on Bottom Base */}
      <mesh material={royalGoldBrassMaterial} position={[0, -1.04, 0]}>
        <torusGeometry args={[1.005, 0.025, 16, 64]} />
      </mesh>

      {/* ================================================================= */}
      {/* 2. ARTISANAL BOTANICAL SOY WAX CORE & MOLTEN POOL                */}
      {/* ================================================================= */}

      {/* Solid Botanical Soy Wax Body */}
      <mesh material={botanicalSoyWaxMaterial} position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.96, 0.93, 1.48, 64]} />
      </mesh>

      {/* Molten Liquid Wax Pool at Top */}
      <mesh material={moltenWaxPoolMaterial} position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.96, 64]} />
      </mesh>

      {/* Soft Wax Meniscus Rim */}
      <mesh material={moltenWaxPoolMaterial} position={[0, 0.582, 0]}>
        <torusGeometry args={[0.95, 0.015, 12, 64]} />
      </mesh>

      {/* ================================================================= */}
      {/* 3. REAL-TIME 3D METALLIC GOLD ENGRAVING & ARTISANAL SEAL         */}
      {/* ================================================================= */}

      {/* Warm Cream Label Base Mount */}
      <mesh position={[0, 0.04, 1.066]}>
        <planeGeometry args={[0.94, 0.74]} />
        <meshStandardMaterial
          color="#F5EFE6"
          roughness={0.65}
          metalness={0.02}
        />
      </mesh>

      {/* Royal Gold Leaf Inlay Framing Rim */}
      <mesh position={[0, 0.04, 1.069]}>
        <planeGeometry args={[0.88, 0.68]} />
        <meshStandardMaterial
          color="#C69B37"
          roughness={0.25}
          metalness={0.9}
        />
      </mesh>

      {/* Inner Precision Label Surface */}
      <mesh position={[0, 0.04, 1.070]}>
        <planeGeometry args={[0.84, 0.64]} />
        <meshStandardMaterial
          color="#FFFDF9"
          roughness={0.7}
          metalness={0.01}
        />
      </mesh>

      {/* Real-Time Etched Typography on Frosted Glass */}
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
            color="#24170E"
            roughness={0.3}
            metalness={0.2}
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
      {/* 4. BRAIDED COTTON WICK & RED-HOT EMBER                           */}
      {/* ================================================================= */}

      {/* Charred Cotton Wick */}
      <mesh material={braidedWickMaterial} position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.02, 0.023, 0.28, 16]} />
      </mesh>

      {/* Incandescent Carbon Ember Tip */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.038, 16, 16]} />
        <meshBasicMaterial color="#FF3B00" />
      </mesh>

      {/* ================================================================= */}
      {/* 5. VOLUMETRIC FLAME (3-Layer Incandescent Teardrop)              */}
      {/* ================================================================= */}

      <group ref={flameGroupRef} position={[0, 1.06, 0]}>
        {/* Outer Translucent Amber Flame Body */}
        <mesh ref={flameOuterRef} material={flameOuterMaterial} position={[0, 0, 0]}>
          <coneGeometry args={[0.11, 0.36, 32]} />
        </mesh>

        {/* Inner Brilliant Incandescent White Core */}
        <mesh material={flameInnerCoreMaterial} position={[0, -0.04, 0]}>
          <coneGeometry args={[0.055, 0.22, 32]} />
        </mesh>

        {/* Volumetric Glowing Amber Aura Halo */}
        <mesh material={flameVolumetricHaloMaterial} position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.32, 20, 20]} />
        </mesh>
      </group>

      {/* ================================================================= */}
      {/* 6. INTERNAL LIGHT SOURCE (Transmits through physical glass)       */}
      {/* ================================================================= */}

      {/* Flame Light Source illuminating glass from inside */}
      <pointLight
        ref={internalLightRef}
        position={[0, 0.35, 0]}
        color="#FFA32B"
        distance={3.4}
        decay={2}
        castShadow
      />

      {/* Downward Caustic Light Accent */}
      <pointLight
        ref={causticLightRef}
        position={[0, -0.7, 0]}
        color="#FF8C00"
        distance={2.0}
        decay={2}
      />

      {/* ================================================================= */}
      {/* 7. PHYSICAL CAUSTICS GLOW RING ON TABLE SURFACE                  */}
      {/* ================================================================= */}

      {/* Concentrated light caustic ring underneath heavy glass bottom */}
      <mesh
        ref={causticRingRef}
        material={causticRingMaterial}
        position={[0, -1.16, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.3, 1.45, 48]} />
      </mesh>
    </group>
  );
};
