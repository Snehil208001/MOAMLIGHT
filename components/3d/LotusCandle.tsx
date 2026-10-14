'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, useGLTF, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════
 * Props
 * ═══════════════════════════════════════════════════════════════════════════ */
interface LotusCandleProps {
  engravingText?: string;
  engravingFont?: string;
  isNightMode?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Constants
 * ═══════════════════════════════════════════════════════════════════════════ */
const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio – 1.618…
const GOLDEN_ANGLE = Math.PI * 2 * (1 - 1 / PHI); // ≈ 137.508°

/* Deterministic pseudo-random from a seed (Mulberry32) */
function seededRandom(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 1.  PBR MATERIALS (shared across all meshes — allocated once globally)
 * ═══════════════════════════════════════════════════════════════════════════ */

let waxMaterialInstance: THREE.MeshPhysicalMaterial | null = null;
/** Translucent sky-blue candle wax — MeshPhysicalMaterial for SSS-like look */
function getWaxMaterial() {
  if (!waxMaterialInstance) {
    waxMaterialInstance = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#8ec8e2'),
      roughness: 0.38,
      metalness: 0.0,
      transmission: 0.18,
      thickness: 1.4,
      ior: 1.45,
      specularIntensity: 0.5,
      specularColor: new THREE.Color('#ffffff'),
      clearcoat: 0.05,
      clearcoatRoughness: 0.4,
      side: THREE.DoubleSide,
    });
  }
  return waxMaterialInstance;
}

let waxBedMaterialInstance: THREE.MeshPhysicalMaterial | null = null;
/** Flat wax bed — slightly more opaque than petal wax */
function getWaxBedMaterial() {
  if (!waxBedMaterialInstance) {
    waxBedMaterialInstance = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#a8d4ee'),
      roughness: 0.42,
      metalness: 0.0,
      transmission: 0.08,
      thickness: 0.8,
      ior: 1.45,
      specularIntensity: 0.4,
      clearcoat: 0.03,
      side: THREE.FrontSide,
    });
  }
  return waxBedMaterialInstance;
}

let goldMaterialInstance: THREE.MeshPhysicalMaterial | null = null;
/** Hammered brass / champagne-gold dish */
function getGoldMaterial() {
  if (!goldMaterialInstance) {
    goldMaterialInstance = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#bfa15f'),
      metalness: 0.85,
      roughness: 0.32,
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
      side: THREE.DoubleSide,
    });
  }
  return goldMaterialInstance;
}

let pebbleMaterialInstance: THREE.MeshStandardMaterial | null = null;
/** Off-white semi-glossy shell / pebble */
function getPebbleMaterial() {
  if (!pebbleMaterialInstance) {
    pebbleMaterialInstance = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f5f0e8'),
      roughness: 0.48,
      metalness: 0.02,
    });
  }
  return pebbleMaterialInstance;
}

let gripPadMaterialInstance: THREE.MeshStandardMaterial | null = null;
function getGripPadMaterial() {
  if (!gripPadMaterialInstance) {
    gripPadMaterialInstance = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a1816'),
      roughness: 0.92,
    });
  }
  return gripPadMaterialInstance;
}

let wickBaseMaterialInstance: THREE.MeshStandardMaterial | null = null;
function getWickBaseMaterial() {
  if (!wickBaseMaterialInstance) {
    wickBaseMaterialInstance = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e8e0d2'),
      roughness: 0.92,
    });
  }
  return wickBaseMaterialInstance;
}

let wickTipMaterialInstance: THREE.MeshStandardMaterial | null = null;
function getWickTipMaterial() {
  if (!wickTipMaterialInstance) {
    wickTipMaterialInstance = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a1410'),
      roughness: 0.95,
    });
  }
  return wickTipMaterialInstance;
}

let engravingMaterialInstance: THREE.MeshStandardMaterial | null = null;
function getEngravingMaterial() {
  if (!engravingMaterialInstance) {
    engravingMaterialInstance = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2A1E08'),
      roughness: 0.25,
      metalness: 0.85,
    });
  }
  return engravingMaterialInstance;
}

let engravingGltfMaterialInstance: THREE.MeshStandardMaterial | null = null;
function getEngravingGltfMaterial() {
  if (!engravingGltfMaterialInstance) {
    engravingGltfMaterialInstance = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#221B14'),
      roughness: 0.25,
      metalness: 0.85,
    });
  }
  return engravingGltfMaterialInstance;
}

let trayUndersideMaterialInstance: THREE.MeshPhysicalMaterial | null = null;
function getTrayUndersideMaterial() {
  if (!trayUndersideMaterialInstance) {
    trayUndersideMaterialInstance = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#bfa15f'),
      metalness: 0.85,
      roughness: 0.32,
      side: THREE.DoubleSide,
    });
  }
  return trayUndersideMaterialInstance;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2.  GEOMETRY BUILDERS  (pure, memoised, no side-effects)
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Build a single organic petal with curvature, thickness, and ruffled tip.
 * `heightScale` lets inner tiers have shorter petals.
 */
function buildPetalGeometry(heightScale = 1.0) {
  const W = 0.22;   // half-width at widest point
  const H = 0.36 * heightScale;  // petal length along Y
  const D = 0.020;   // petal thickness (extrude depth)

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(W * 0.7, H * 0.06, W, H * 0.25, W * 0.98, H * 0.50);
  shape.bezierCurveTo(W * 0.92, H * 0.72, W * 0.55, H * 0.92, 0, H);
  shape.bezierCurveTo(-W * 0.55, H * 0.92, -W * 0.92, H * 0.72, -W * 0.98, H * 0.50);
  shape.bezierCurveTo(-W, H * 0.25, -W * 0.7, H * 0.06, 0, 0);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: D,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 0.006,
    bevelThickness: 0.004,
    curveSegments: 8,
  });

  // Deform: cup inward + curl tip + subtle ruffle
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i);
    const t = Math.max(0, Math.min(1, y / H));  // 0 at base, 1 at tip

    // Bowl-cup: pushes the petal centre forward (z+)
    z += Math.sin(t * Math.PI * 0.75) * 0.11;

    // Side-curl: edges fold backward
    z -= (x * x) / (W * W) * 0.06 * (0.5 + t);

    // Tip curl-back
    if (t > 0.75) {
      const tipT = (t - 0.75) / 0.25;
      z -= tipT * tipT * 0.04;
    }

    // Subtle ruffle along edges
    const edgeFactor = Math.abs(x) / W;
    z += Math.sin(x * 22 + y * 12) * 0.008 * edgeFactor * (0.3 + t * 0.7);

    pos.setZ(i, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Build a smooth scalloped brass tray with fluted rim and depth.
 * Creates a shallow bowl with a wavy lip using sinusoidal scallops.
 */
function buildScallopedTray() {
  const scallops = 16;       // number of fluted scallops
  const baseR = 1.18;        // inner flat base radius
  const wallR = 1.24;        // wall top radius
  const rimR = 1.42;         // outermost rim radius at scallop peaks
  const rimValleyR = 1.32;   // rim radius at valleys
  const baseY = -0.10;
  const wallTopY = 0.04;
  const rimPeakY = 0.12;
  const rimValleyY = 0.02;
  const segs = 128;          // angular resolution

  const positions: number[] = [];
  const indices: number[] = [];

  // Ring 0: centre
  positions.push(0, baseY, 0);
  let v = 1;

  // Helper: push a ring of vertices
  const pushRing = (start: number, count: number, fn: (a: number) => [number, number, number]) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const [x, y, z] = fn(a);
      positions.push(x, y, z);
    }
  };

  // Ring 1: base inner
  const r1 = v;
  pushRing(v, segs, (a) => [Math.cos(a) * baseR * 0.35, baseY, Math.sin(a) * baseR * 0.35]);
  v += segs;

  // Ring 2: base outer
  const r2 = v;
  pushRing(v, segs, (a) => [Math.cos(a) * baseR, baseY, Math.sin(a) * baseR]);
  v += segs;

  // Ring 3: wall top
  const r3 = v;
  pushRing(v, segs, (a) => [Math.cos(a) * wallR, wallTopY, Math.sin(a) * wallR]);
  v += segs;

  // Ring 4: scalloped rim
  const r4 = v;
  pushRing(v, segs, (a) => {
    // Smooth sinusoidal scallop (not sharp zigzag)
    const wave = 0.5 + 0.5 * Math.cos(a * scallops);
    const r = rimValleyR + (rimR - rimValleyR) * wave;
    const y = rimValleyY + (rimPeakY - rimValleyY) * wave;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });
  v += segs;

  // Triangulate ring bands
  const triRing = (a: number, b: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const n = (i + 1) % count;
      indices.push(a + i, b + i, a + n);
      indices.push(a + n, b + i, b + n);
    }
  };

  // centre → r1
  for (let i = 0; i < segs; i++) {
    indices.push(0, r1 + i, r1 + ((i + 1) % segs));
  }
  triRing(r1, r2, segs);
  triRing(r2, r3, segs);
  triRing(r3, r4, segs);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  // Procedural "hammered" bump: perturb normals
  const norms = geom.attributes.normal;
  for (let i = 0; i < norms.count; i++) {
    const px = positions[i * 3];
    const pz = positions[i * 3 + 2];
    const bump = Math.sin(px * 35 + pz * 28) * 0.12 + Math.sin(px * 18 - pz * 42) * 0.08;
    norms.setX(i, norms.getX(i) + bump * 0.15);
    norms.setZ(i, norms.getZ(i) + bump * 0.15);
  }
  norms.needsUpdate = true;

  return geom;
}

let trayGeomInstance: THREE.BufferGeometry | null = null;
function getTrayGeom() {
  if (!trayGeomInstance) {
    trayGeomInstance = buildScallopedTray();
  }
  return trayGeomInstance;
}

let petalGeomsInstance: THREE.BufferGeometry[] | null = null;
function getPetalGeoms() {
  if (!petalGeomsInstance) {
    petalGeomsInstance = [
      buildPetalGeometry(1.0),   // tier 0 – outer skirt
      buildPetalGeometry(0.92),  // tier 1
      buildPetalGeometry(0.82),  // tier 2
      buildPetalGeometry(0.68),  // tier 3
      buildPetalGeometry(0.50),  // tier 4 – inner bud
    ];
  }
  return petalGeomsInstance;
}

let tiersInstance: { count: number; r: number; y: number; tilt: number; s: number; gi: number }[] | null = null;
function getTiers() {
  if (!tiersInstance) {
    tiersInstance = [
      { count: 14, r: 0.48, y: 0.005, tilt: 1.28, s: 1.05, gi: 0 },
      { count: 12, r: 0.40, y: 0.035, tilt: 1.05, s: 0.96, gi: 0 },
      { count: 11, r: 0.33, y: 0.075, tilt: 0.82, s: 0.88, gi: 1 },
      { count: 10, r: 0.27, y: 0.12, tilt: 0.62, s: 0.78, gi: 1 },
      { count: 9,  r: 0.22, y: 0.17, tilt: 0.48, s: 0.70, gi: 2 },
      { count: 8,  r: 0.17, y: 0.22, tilt: 0.36, s: 0.60, gi: 2 },
      { count: 7,  r: 0.13, y: 0.27, tilt: 0.26, s: 0.50, gi: 3 },
      { count: 6,  r: 0.09, y: 0.31, tilt: 0.18, s: 0.42, gi: 3 },
      { count: 5,  r: 0.05, y: 0.34, tilt: 0.10, s: 0.34, gi: 4 },
      { count: 4,  r: 0.02, y: 0.36, tilt: 0.05, s: 0.26, gi: 4 },
    ];
  }
  return tiersInstance;
}

let pebblesInstance: { x: number; z: number; sx: number; sy: number; sz: number; ry: number }[] | null = null;
function getPebbles() {
  if (!pebblesInstance) {
    const out: { x: number; z: number; sx: number; sy: number; sz: number; ry: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + seededRandom(i * 3) * 0.5;
      const dist = 0.62 + seededRandom(i * 7) * 0.34;
      out.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        sx: 0.04 + seededRandom(i * 11) * 0.03,
        sy: 0.015 + seededRandom(i * 13) * 0.01,
        sz: 0.04 + seededRandom(i * 17) * 0.025,
        ry: seededRandom(i * 19) * Math.PI * 2,
      });
    }
    pebblesInstance = out;
  }
  return pebblesInstance;
}

let gripPadsInstance: { x: number; z: number }[] | null = null;
function getGripPads() {
  if (!gripPadsInstance) {
    gripPadsInstance = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => ({
      x: Math.cos(a) * 0.72,
      z: Math.sin(a) * 0.72,
    }));
  }
  return gripPadsInstance;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3.  LotusCandleProcedural — the photorealistic procedural component
 * ═══════════════════════════════════════════════════════════════════════════ */
export const LotusCandleProcedural: React.FC<LotusCandleProps> = ({
  engravingText = '',
  engravingFont = 'serif',
  isNightMode = false,
}) => {
  const wickGlowRef = useRef<THREE.PointLight>(null);

  // ── Materials ──
  const waxMat = getWaxMaterial();
  const waxBedMat = getWaxBedMaterial();
  const goldMat = getGoldMaterial();
  const pebbleMat = getPebbleMaterial();
  const gripPadMat = getGripPadMaterial();
  const wickBaseMat = getWickBaseMaterial();
  const wickTipMat = getWickTipMaterial();
  const engravingMat = getEngravingMaterial();
  const trayUndersideMat = getTrayUndersideMaterial();

  // ── Geometries & Arrays (lazy singletons) ──
  const trayGeom = getTrayGeom();
  const petalGeoms = getPetalGeoms();
  const tiers = getTiers();
  const pebbles = getPebbles();
  const gripPads = getGripPads();

  // ── Animation: subtle wick glow flicker ──
  useFrame((state) => {
    if (wickGlowRef.current) {
      const t = state.clock.getElapsedTime();
      wickGlowRef.current.intensity = 0.6 + Math.sin(t * 3.5) * 0.08 + Math.sin(t * 7.2) * 0.04;
    }
  });

  const displayText = engravingText.trim() ? engravingText.trim().toUpperCase() : '';

  return (
    <group position={[0, -0.05, 0]}>

      {/* ═══════════════ STUDIO LIGHTING (local to model) ═══════════════ */}
      {/* Warm key light — top-left, casting soft contact shadows */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={isNightMode ? 0.7 : 1.8}
        color="#fff4e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
      />
      {/* Cool ambient fill to lift shadow contrasts */}
      <ambientLight
        intensity={isNightMode ? 0.25 : 0.6}
        color="#e0ecf8"
      />
      {/* Warm rim light from behind-right for gold dish highlights */}
      <pointLight
        position={[-2, 1.5, -3]}
        intensity={0.9}
        color="#ffe8c0"
        distance={6}
        decay={2}
      />

      {/* ═══════════════ A. SCALLOPED BRASS TRAY ═══════════════════════ */}
      <mesh
        geometry={trayGeom}
        material={goldMat}
        castShadow
        receiveShadow
      />
      {/* Tray underside disc */}
      <mesh position={[0, -0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.18, 64]} />
        <primitive object={trayUndersideMat} attach="material" />
      </mesh>
      {/* Grip pads */}
      {gripPads.map((p, i) => (
        <mesh key={`grip-${i}`} position={[p.x, -0.165, p.z]}>
          <cylinderGeometry args={[0.055, 0.055, 0.01, 16]} />
          <primitive object={gripPadMat} attach="material" />
        </mesh>
      ))}

      {/* ═══════════════ B. WAX BED (flat fill inside tray) ════════════ */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.15, 64]} />
        <primitive object={waxBedMat} attach="material" />
      </mesh>
      {/* Wax body cylinder */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[1.14, 1.14, 0.09, 64]} />
        <primitive object={waxBedMat} attach="material" />
      </mesh>

      {/* ═══════════════ C. ORGANIC LOTUS / PEONY BLOOM ════════════════ */}
      <group position={[0, 0.015, 0]}>
        {tiers.map((tier, ti) => {
          const geom = petalGeoms[tier.gi];
          // Phyllotaxis golden-angle offset per tier
          const tierOffset = ti * GOLDEN_ANGLE * 0.618;
          return (
            <group key={`tier-${ti}`}>
              {Array.from({ length: tier.count }).map((_, pi) => {
                const baseAngle = (pi / tier.count) * Math.PI * 2 + tierOffset;
                // Deterministic jitter for organic look
                const seed = ti * 100 + pi;
                const aJitter = (seededRandom(seed) - 0.5) * 0.14;
                const yJitter = (seededRandom(seed + 1) - 0.5) * 0.012;
                const tiltJitter = (seededRandom(seed + 2) - 0.5) * 0.08;
                const angle = baseAngle + aJitter;

                return (
                  <group key={`p-${ti}-${pi}`} rotation={[0, angle, 0]}>
                    <mesh
                      geometry={geom}
                      position={[0, tier.y + yJitter, tier.r]}
                      rotation={[tier.tilt + tiltJitter, 0, 0]}
                      scale={[tier.s, tier.s, tier.s]}
                      castShadow
                      receiveShadow
                    >
                      <primitive object={waxMat} attach="material" />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })}

        {/* Centre dome cap */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <sphereGeometry args={[0.05, 16, 16]} />
          <primitive object={waxMat} attach="material" />
        </mesh>

        {/* ═══════════ D. BRAIDED COTTON WICK ═══════════════════════════ */}
        {/* Off-white cotton base */}
        <mesh position={[0, 0.45, 0.005]} rotation={[0.04, 0, 0.02]}>
          <cylinderGeometry args={[0.007, 0.011, 0.14, 8]} />
          <primitive object={wickBaseMat} attach="material" />
        </mesh>
        {/* Charred black tip */}
        <mesh position={[0, 0.525, 0.006]} rotation={[0.04, 0, 0.02]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <primitive object={wickTipMat} attach="material" />
        </mesh>

        {/* Wick-area warm glow */}
        <pointLight
          ref={wickGlowRef}
          position={[0, 0.52, 0]}
          color="#ffc87a"
          distance={1.8}
          intensity={0.6}
          decay={2}
        />
      </group>

      {/* ═══════════════ E. SCATTERED PEBBLES / DROPS ══════════════════ */}
      {pebbles.map((p, i) => (
        <mesh
          key={`pebble-${i}`}
          position={[p.x, 0.022, p.z]}
          rotation={[0, p.ry, 0]}
          scale={[p.sx, p.sy, p.sz]}
          castShadow
        >
          <sphereGeometry args={[1, 12, 10]} />
          <primitive object={pebbleMat} attach="material" />
        </mesh>
      ))}

      {/* ═══════════════ F. CONTACT SHADOW (beneath tray) ══════════════ */}
      <ContactShadows
        position={[0, -0.18, 0]}
        opacity={isNightMode ? 0.55 : 0.35}
        scale={5}
        blur={2.5}
        far={3}
        color="#3a3020"
      />

      {/* ═══════════════ G. BESPOKE ENGRAVING ══════════════════════════ */}
      {displayText.length > 0 && (
        <group position={[0, 0.06, 1.35]} rotation={[-0.5, 0, 0]}>
          <Text
            fontSize={0.06}
            letterSpacing={engravingFont === 'script' ? 0.08 : 0.14}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.4}
            textAlign="center"
          >
            {displayText}
            <primitive object={engravingMat} attach="material" />
          </Text>
        </group>
      )}
    </group>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * 4.  GLTF Loader (if public/flower-candle.glb exists)
 * ═══════════════════════════════════════════════════════════════════════════ */
function LotusCandleGLTFModel({
  engravingText = '',
  engravingFont = 'serif',
}: {
  engravingText?: string;
  engravingFont?: string;
}) {
  const { scene } = useGLTF('/flower-candle.glb');
  const engravingGltfMat = getEngravingGltfMaterial();

  return (
    <group position={[0, -0.05, 0]}>
      <primitive object={scene} scale={1.4} position={[0, 0, 0]} />
      {engravingText && (
        <group position={[0, 0.12, 1.25]} rotation={[-Math.PI / 4, 0, 0]}>
          <Text
            fontSize={0.065}
            letterSpacing={engravingFont === 'script' ? 0.08 : 0.14}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.4}
            textAlign="center"
          >
            {engravingText.toUpperCase()}
            <primitive object={engravingGltfMat} attach="material" />
          </Text>
        </group>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5.  Error Boundary for GLTF
 * ═══════════════════════════════════════════════════════════════════════════ */
class GLTFErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('GLTF fallback:', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 6.  Exported <LotusCandle /> — auto-detects GLB, wraps in Float
 * ═══════════════════════════════════════════════════════════════════════════ */
export const LotusCandle: React.FC<LotusCandleProps> = (props) => {
  const [hasGLTF, setHasGLTF] = useState(false);

  useEffect(() => {
    fetch('/flower-candle.glb', { method: 'HEAD' })
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        if (res.ok && !ct.includes('text/html')) setHasGLTF(true);
      })
      .catch(() => setHasGLTF(false));
  }, []);

  return (
    <Float
      speed={2.0}
      rotationIntensity={0.28}
      floatIntensity={0.9}
      floatingRange={[-0.05, 0.05]}
    >
      {hasGLTF ? (
        <GLTFErrorBoundary fallback={<LotusCandleProcedural {...props} />}>
          <LotusCandleGLTFModel
            engravingText={props.engravingText}
            engravingFont={props.engravingFont}
          />
        </GLTFErrorBoundary>
      ) : (
        <LotusCandleProcedural {...props} />
      )}
    </Float>
  );
};
