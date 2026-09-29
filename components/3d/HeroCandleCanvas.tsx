'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { FrostedGlassCandle } from './FrostedGlassCandle';
import { FloatingEmbers } from './FloatingEmbers';
import { Sparkles, Move } from 'lucide-react';

interface HeroCandleCanvasProps {
  isNightMode?: boolean;
}

export const HeroCandleCanvas: React.FC<HeroCandleCanvasProps> = ({ isNightMode = false }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center rounded-3xl bg-warm-cream/50 border border-warm-border">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-amber/30 border-t-amber animate-spin" />
          <p className="text-xs uppercase tracking-widest text-charcoal-muted font-sans font-medium">
            Illuminating Sanctuary...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[460px] lg:min-h-[580px] rounded-3xl overflow-hidden group select-none touch-pan-y">
      {/* Ambient Radial Backlight Glow behind the Candle */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none rounded-3xl"
        style={{
          background: isNightMode
            ? 'radial-gradient(circle at 50% 50%, rgba(255, 140, 0, 0.28) 0%, rgba(255, 140, 0, 0.08) 50%, transparent 80%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 140, 0, 0.22) 0%, rgba(212, 163, 115, 0.1) 50%, transparent 80%)',
        }}
      />

      {/* R3F WebGL 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        shadows
        frameloop="always"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {isNightMode && <fog attach="fog" args={['#0C0A09', 5, 20]} />}
        
        <Suspense fallback={null}>
          <Environment preset={isNightMode ? 'night' : 'studio'} />

          <ambientLight 
            intensity={isNightMode ? 0.15 : 0.8} 
            color={isNightMode ? '#1a1a2e' : '#FFF8F0'} 
          />

          <directionalLight
            position={[4, 5, 3]}
            intensity={isNightMode ? 0.3 : 1.2}
            color={isNightMode ? '#FFE4B5' : '#FFFFFF'}
            castShadow
          />

          {/* Interactive Frosted Glass Candle */}
          <FrostedGlassCandle isNightMode={isNightMode} />

          <ContactShadows 
            position={[0, -1.2, 0]}
            opacity={isNightMode ? 0.6 : 0.3}
            scale={10}
            blur={2.5}
            far={4}
          />

          {/* Local drifting ambient embers */}
          <FloatingEmbers count={80} isNightMode={isNightMode} />
        </Suspense>
      </Canvas>

      {/* Interactive Glassmorphism Overlay Pill Badge */}
      <div className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-6 pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-full inline-flex items-center gap-2.5 shadow-sm text-xs text-charcoal font-medium border border-warm-border/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber" />
          </span>
          <span className="font-serif italic text-charcoal">Real-time 3D</span>
          <span className="text-[11px] text-charcoal-muted flex items-center gap-1 font-sans">
            <Move className="w-3 h-3" /> Move cursor to tilt
          </span>
        </div>
      </div>
    </div>
  );
};
