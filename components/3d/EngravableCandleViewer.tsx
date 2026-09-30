'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EngravableCandle } from './EngravableCandle';
import { FloatingEmbers } from './FloatingEmbers';
import { Sparkles, Rotate3D } from 'lucide-react';

interface EngravableCandleViewerProps {
  engravingText?: string;
  engravingFont?: string;
  waxColor?: string;
  isNightMode?: boolean;
}

export const EngravableCandleViewer: React.FC<EngravableCandleViewerProps> = ({
  engravingText = '',
  engravingFont = 'serif',
  waxColor = '#FFFDF8',
  isNightMode = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[460px] sm:h-[520px] flex items-center justify-center rounded-2xl bg-warm-cream/50 border border-warm-border">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber/30 border-t-amber animate-spin" />
          <p className="text-xs uppercase tracking-widest text-charcoal-muted font-sans font-medium">
            Preparing 3D Atelier...
          </p>
        </div>
      </div>
    );
  }

  const hasEngraving = engravingText.trim().length > 0;

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden group select-none touch-pan-y bg-gradient-to-b from-warm-cream/30 to-warm-linen/40 border border-warm-border/80">
      {/* Ambient Radial Backlight Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none rounded-2xl"
        style={{
          background: isNightMode
            ? 'radial-gradient(circle at 50% 50%, rgba(255, 140, 0, 0.28) 0%, rgba(255, 140, 0, 0.08) 50%, transparent 80%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 140, 0, 0.2) 0%, rgba(212, 163, 115, 0.1) 50%, transparent 80%)',
        }}
      />

      {/* Dedicated R3F Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 0.35, 5.2], fov: 34 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 1.5]}
          shadows
          frameloop="always"
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <PerspectiveCamera makeDefault position={[0, 0.35, 5.2]} fov={34} />

          {/* Orbit Controls for 360 inspection */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={!hasEngraving} // Pause auto-rotate while inspecting personal engraving
            autoRotateSpeed={0.65}
            minPolarAngle={Math.PI / 3.8}
            maxPolarAngle={Math.PI / 1.8}
            enableDamping
            dampingFactor={0.06}
          />

          {isNightMode && <fog attach="fog" args={['#0C0A09', 5, 20]} />}

          <Suspense fallback={null}>
            {/* Zero-latency local studio lighting hierarchy */}
            <ambientLight
              intensity={isNightMode ? 0.35 : 0.95}
              color={isNightMode ? '#221c2e' : '#FFF9F2'}
            />

            <directionalLight
              position={[4, 6, 3]}
              intensity={isNightMode ? 0.4 : 1.2}
              color={isNightMode ? '#FFE8C8' : '#FFFFFF'}
              castShadow
            />

            <directionalLight
              position={[-4, 3, -3]}
              intensity={0.6}
              color="#FFE0B2"
            />

            {/* 3D Engravable Candle with Physical Glass & Scent Smoke */}
            <EngravableCandle
              engravingText={engravingText}
              engravingFont={engravingFont}
              waxColor={waxColor}
              isNightMode={isNightMode}
            />

            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={isNightMode ? 0.6 : 0.3}
              scale={8}
              blur={2.0}
              far={3.5}
            />

            <FloatingEmbers count={24} isNightMode={isNightMode} />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="glass-panel px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm text-xs text-charcoal font-medium border border-warm-border/60">
          <Rotate3D className="w-3.5 h-3.5 text-terracotta" />
          <span className="font-sans text-[11px] text-charcoal-muted">360° Drag to Inspect</span>
        </div>

        {hasEngraving && (
          <div className="glass-panel px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm text-xs text-amber-900 font-medium border border-amber/40 bg-amber/10 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber animate-pulse" />
            <span className="font-serif italic text-[11px]">Live 3D Engraving</span>
          </div>
        )}
      </div>
    </div>
  );
};
