'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface LotusCandleProps {
  engravingText?: string;
  engravingFont?: string;
  isNightMode?: boolean;
}

/**
 * Procedural Artisan Lotus Candle — rebuilt to match the real product photos:
 * 1. SHALLOW FLAT GOLD TRAY with sharp angular zigzag crimped edges
 * 2. BABY-BLUE WAX filling the tray flush to the rim
 * 3. DENSE BLUE PEONY dome — thick ruffled petals, ALL BLUE color
 * 4. Small white spiral seashells on the blue wax
 * 5. Cotton wick sticking up from the center
 */
export const LotusCandleProcedural: React.FC<LotusCandleProps> = ({
  engravingText = '',
  engravingFont = 'serif',
  isNightMode = false,
}) => {
  const coreLightRef = useRef<THREE.PointLight>(null);

  // ===== 1. GOLD TRAY: 3D dish with crimped pie-crust rim =====
  // The real product is a shallow circular dish (like a shallow bowl) with
  // the rim folded into sharp triangular crimps, like pie crust pinching.
  const dishGeometry = useMemo(() => {
    const segments = 14; // number of zigzag crimps
    const baseR = 1.15;       // radius of the flat base
    const wallR = 1.22;       // radius at the top of the wall
    const rimPeakR = 1.42;    // outer radius at crimp peaks
    const rimValleyR = 1.26;  // outer radius at crimp valleys
    const baseY = -0.12;      // bottom of the dish
    const wallTopY = 0.02;    // top of the straight wall
    const rimPeakY = 0.15;    // peak height of crimped folds
    const rimValleyY = 0.00;  // valley of crimped folds
    const stepsPerSeg = 6;
    const totalSteps = segments * stepsPerSeg;

    const positions: number[] = [];
    const indices: number[] = [];

    // Ring 0: Center point (base)
    positions.push(0, baseY, 0);
    let vIdx = 1;

    // Ring 1: Base inner (r=0.4*baseR)
    const r1Start = vIdx;
    for (let i = 0; i < totalSteps; i++) {
      const a = (i / totalSteps) * Math.PI * 2;
      positions.push(Math.cos(a) * baseR * 0.4, baseY, Math.sin(a) * baseR * 0.4);
    }
    vIdx += totalSteps;

    // Ring 2: Base outer (r=baseR)
    const r2Start = vIdx;
    for (let i = 0; i < totalSteps; i++) {
      const a = (i / totalSteps) * Math.PI * 2;
      positions.push(Math.cos(a) * baseR, baseY, Math.sin(a) * baseR);
    }
    vIdx += totalSteps;

    // Ring 3: Wall top (r=wallR, y=wallTopY) — vertical wall of the dish
    const r3Start = vIdx;
    for (let i = 0; i < totalSteps; i++) {
      const a = (i / totalSteps) * Math.PI * 2;
      positions.push(Math.cos(a) * wallR, wallTopY, Math.sin(a) * wallR);
    }
    vIdx += totalSteps;

    // Ring 4: Crimped rim edge — alternating peaks and valleys
    const r4Start = vIdx;
    for (let i = 0; i < totalSteps; i++) {
      const a = (i / totalSteps) * Math.PI * 2;
      const segProgress = (i % stepsPerSeg) / stepsPerSeg;
      // Sharp triangle wave
      const tri = segProgress < 0.5 ? segProgress * 2 : 2 - segProgress * 2;
      const r = rimValleyR + (rimPeakR - rimValleyR) * tri;
      const y = rimValleyY + (rimPeakY - rimValleyY) * tri;
      positions.push(Math.cos(a) * r, y, Math.sin(a) * r);
    }
    vIdx += totalSteps;

    // Triangles: center → ring1
    for (let i = 0; i < totalSteps; i++) {
      const n = (i + 1) % totalSteps;
      indices.push(0, r1Start + i, r1Start + n);
    }
    // ring1 → ring2
    for (let i = 0; i < totalSteps; i++) {
      const n = (i + 1) % totalSteps;
      indices.push(r1Start + i, r2Start + i, r1Start + n);
      indices.push(r1Start + n, r2Start + i, r2Start + n);
    }
    // ring2 → ring3 (wall)
    for (let i = 0; i < totalSteps; i++) {
      const n = (i + 1) % totalSteps;
      indices.push(r2Start + i, r3Start + i, r2Start + n);
      indices.push(r2Start + n, r3Start + i, r3Start + n);
    }
    // ring3 → ring4 (crimped rim)
    for (let i = 0; i < totalSteps; i++) {
      const n = (i + 1) % totalSteps;
      indices.push(r3Start + i, r4Start + i, r3Start + n);
      indices.push(r3Start + n, r4Start + i, r4Start + n);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Gold material — polished mirror gold matching photos
  const goldMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4A830'),
      emissive: new THREE.Color('#3D2A06'),
      emissiveIntensity: 0.18,
      metalness: 0.95,
      roughness: 0.15,
      side: THREE.DoubleSide,
    });
  }, []);

  // ===== 2. BABY-BLUE WAX FILL — flat disc filling the tray =====
  const blueWaxMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#B4D8EE'),
      roughness: 0.88,
      metalness: 0.01,
    });
  }, []);

  // ===== 3. DENSE BLUE PEONY — wide, ruffled petals, ALL BLUE =====
  // Key insight: real product petals are SHORT, WIDE, RUFFLED and uniformly BLUE
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // SHORT and WIDE petal shape — peony style (width:height ≈ 1.6:1)
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.16, 0.02, 0.24, 0.08, 0.25, 0.16);
    shape.bezierCurveTo(0.26, 0.22, 0.22, 0.28, 0.14, 0.32);
    shape.bezierCurveTo(0.08, 0.35, 0.03, 0.36, 0, 0.36);
    shape.bezierCurveTo(-0.03, 0.36, -0.08, 0.35, -0.14, 0.32);
    shape.bezierCurveTo(-0.22, 0.28, -0.26, 0.22, -0.25, 0.16);
    shape.bezierCurveTo(-0.24, 0.08, -0.16, 0.02, 0, 0);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.006,
    });

    // Apply cupping + ruffling deformation
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      let z = pos.getZ(i);
      const t = Math.max(0, Math.min(1, y / 0.36));
      // Cup the petal inward (bowl shape)
      z += Math.sin(t * Math.PI * 0.8) * 0.12 - (x * x) * 0.6;
      // Add ruffling along the edges (irregular wave)
      const edgeFactor = Math.abs(x) / 0.25;
      z += Math.sin(x * 18 + y * 8) * 0.012 * edgeFactor;
      pos.setZ(i, z);
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Petal material: SOLID BLUE — matching the real product (not white-tipped!)
  const blueWaxPetalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7EB4D8'), // cornflower/periwinkle blue
      roughness: 0.78,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
  }, []);

  // Slightly lighter blue for the outer petals (subtle variation)
  const lighterPetalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8FC4E4'),
      roughness: 0.78,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
  }, []);

  // ===== Peony dome tiers — DENSE, TALL, rounded dome of petals =====
  // tilt: angle from vertical. ~1.4 = almost horizontal (outer). ~0.05 = nearly vertical (inner bud).
  // Petals progressively cup inward/upward to form the dome silhouette.
  const flowerTiers = useMemo(() => {
    return [
      // Skirt: very large petals lying flat outward (touching the wax)
      { count: 16, radius: 0.52, y: 0.005, tilt: 1.35, scale: 1.1, mat: 'light' },
      // Outer open layer
      { count: 14, radius: 0.44, y: 0.02, tilt: 1.15, scale: 1.02, mat: 'light' },
      // Transition layers — starting to cup upward
      { count: 13, radius: 0.38, y: 0.06, tilt: 0.92, scale: 0.95, mat: 'light' },
      { count: 12, radius: 0.32, y: 0.10, tilt: 0.74, scale: 0.88, mat: 'main' },
      // Mid dome — significantly cupped
      { count: 11, radius: 0.26, y: 0.15, tilt: 0.56, scale: 0.80, mat: 'main' },
      { count: 10, radius: 0.21, y: 0.20, tilt: 0.42, scale: 0.72, mat: 'main' },
      // Upper dome — tight petals
      { count: 9, radius: 0.165, y: 0.25, tilt: 0.32, scale: 0.62, mat: 'main' },
      { count: 8, radius: 0.12, y: 0.30, tilt: 0.22, scale: 0.52, mat: 'main' },
      // Inner bud — nearly vertical petals
      { count: 7, radius: 0.08, y: 0.34, tilt: 0.14, scale: 0.44, mat: 'main' },
      { count: 5, radius: 0.04, y: 0.37, tilt: 0.07, scale: 0.36, mat: 'main' },
    ];
  }, []);

  // ===== 4. WHITE SEASHELL GEOMETRIES =====
  const spiralShellGeometry = useMemo(() => {
    const geom = new THREE.ConeGeometry(0.05, 0.13, 12);
    geom.rotateZ(Math.PI / 2);
    return geom;
  }, []);

  const fanShellGeometry = useMemo(() => {
    const geom = new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI, 0, Math.PI * 0.65);
    geom.scale(1.1, 0.45, 1.0);
    geom.rotateX(Math.PI / 2);
    return geom;
  }, []);

  const shellMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FBF8F3'),
      roughness: 0.55,
      metalness: 0.04,
    });
  }, []);

  // Shell positions matching the photos (scattered on wax around the flower)
  const shellPositions = useMemo(() => [
    { x: 0.72, z: 0.26, rot: 0.6, type: 'spiral' },
    { x: -0.68, z: 0.34, rot: 2.2, type: 'fan' },
    { x: -0.30, z: -0.74, rot: -1.0, type: 'spiral' },
    { x: 0.60, z: -0.50, rot: 3.1, type: 'fan' },
    { x: -0.76, z: -0.14, rot: 0.5, type: 'spiral' },
    { x: 0.20, z: 0.76, rot: 1.7, type: 'fan' },
    { x: 0.50, z: 0.56, rot: 2.9, type: 'spiral' },
  ], []);

  // 3 grip pads on the bottom
  const gripPads = useMemo(() => {
    return [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => ({
      x: Math.cos(angle) * 0.68,
      z: Math.sin(angle) * 0.68,
      key: i,
    }));
  }, []);

  // Gentle light flicker
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreLightRef.current) {
      coreLightRef.current.intensity = 0.8 + Math.sin(time * 4.0) * 0.1;
    }
  });

  const displayText = engravingText.trim() ? engravingText.trim().toUpperCase() : '';
  const hasCustomEngraving = displayText.length > 0;

  return (
    <group position={[0, -0.05, 0]}>
      {/* ================================================================= */}
      {/* 1. GOLD ZIGZAG TRAY                                              */}
      {/* ================================================================= */}
      <mesh geometry={dishGeometry} material={goldMaterial} castShadow receiveShadow />
      {/* Bottom disc (underside of tray) */}
      <mesh position={[0, -0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 64]} />
        <meshStandardMaterial
          color="#D4A830"
          metalness={0.92}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3 Grip Pads */}
      {gripPads.map((pad) => (
        <mesh key={pad.key} position={[pad.x, -0.19, pad.z]}>
          <cylinderGeometry args={[0.06, 0.06, 0.012, 16]} />
          <meshStandardMaterial color="#1A1816" roughness={0.92} />
        </mesh>
      ))}

      {/* ================================================================= */}
      {/* 2. BABY-BLUE WAX FILL (flat disc flush with rim)                 */}
      {/* ================================================================= */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.11, 64]} />
        <meshStandardMaterial
          color="#B4D8EE"
          roughness={0.85}
          metalness={0.01}
        />
      </mesh>
      {/* Wax thickness cylinder */}
      <mesh position={[0, -0.045, 0]} material={blueWaxMaterial}>
        <cylinderGeometry args={[1.10, 1.10, 0.10, 64]} />
      </mesh>

      {/* ================================================================= */}
      {/* 3. DENSE BLUE PEONY DOME (all-blue thick ruffled petals)         */}
      {/* ================================================================= */}
      <group position={[0, 0.01, 0]}>
        {flowerTiers.map((tier, tierIdx) => {
          const offset = (tierIdx % 2) * (Math.PI / tier.count);
          const mat = tier.mat === 'light' ? lighterPetalMaterial : blueWaxPetalMaterial;
          return (
            <group key={tierIdx}>
              {Array.from({ length: tier.count }).map((_, petalIdx) => {
                const angle = (petalIdx / tier.count) * Math.PI * 2 + offset;
                // Add slight random variation to make it look organic
                const jitter = ((petalIdx * 7 + tierIdx * 13) % 17) / 170;
                return (
                  <group key={petalIdx} rotation={[0, angle + jitter, 0]}>
                    <mesh
                      geometry={petalGeometry}
                      material={mat}
                      position={[0, tier.y, tier.radius]}
                      rotation={[tier.tilt, 0, 0]}
                      scale={[tier.scale, tier.scale, tier.scale]}
                      castShadow
                      receiveShadow
                    />
                  </group>
                );
              })}
            </group>
          );
        })}

        {/* Center dome cap */}
        <mesh position={[0, 0.40, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#8CBAD6" roughness={0.75} />
        </mesh>

        {/* Cotton wick (visible in the candle version) */}
        <mesh position={[0, 0.50, 0]}>
          <cylinderGeometry args={[0.008, 0.010, 0.18, 8]} />
          <meshStandardMaterial color="#3A3028" roughness={0.92} />
        </mesh>

        {/* Subtle warm glow from wick area */}
        <pointLight
          ref={coreLightRef}
          position={[0, 0.55, 0]}
          color="#FFC87A"
          distance={2.0}
          intensity={0.8}
          decay={2}
        />
      </group>

      {/* ================================================================= */}
      {/* 4. WHITE SEASHELLS ON BLUE WAX                                   */}
      {/* ================================================================= */}
      {shellPositions.map((shell, i) => (
        <group key={i} position={[shell.x, 0.018, shell.z]} rotation={[0, shell.rot, 0]}>
          {shell.type === 'spiral' ? (
            <mesh geometry={spiralShellGeometry} material={shellMaterial} castShadow />
          ) : (
            <mesh geometry={fanShellGeometry} material={shellMaterial} castShadow />
          )}
        </group>
      ))}

      {/* ================================================================= */}
      {/* 5. BESPOKE ENGRAVING (embossed on gold rim front)                */}
      {/* ================================================================= */}
      {hasCustomEngraving && (
        <group position={[0, 0.08, 1.32]} rotation={[-0.5, 0, 0]}>
          <Text
            fontSize={0.065}
            letterSpacing={engravingFont === 'script' ? 0.08 : 0.14}
            anchorX="center"
            anchorY="middle"
            maxWidth={1.4}
            textAlign="center"
          >
            {displayText}
            <meshStandardMaterial
              color="#2A1E08"
              roughness={0.25}
              metalness={0.85}
            />
          </Text>
        </group>
      )}
    </group>
  );
};

/**
 * GLTF Loader for 'public/flower-candle.glb'
 */
function LotusCandleGLTFModel({
  engravingText = '',
  engravingFont = 'serif',
}: {
  engravingText?: string;
  engravingFont?: string;
}) {
  const { scene } = useGLTF('/flower-candle.glb');

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
            <meshStandardMaterial color="#221B14" roughness={0.25} metalness={0.85} />
          </Text>
        </group>
      )}
    </group>
  );
}

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
          <LotusCandleGLTFModel engravingText={props.engravingText} engravingFont={props.engravingFont} />
        </GLTFErrorBoundary>
      ) : (
        <LotusCandleProcedural {...props} />
      )}
    </Float>
  );
};
