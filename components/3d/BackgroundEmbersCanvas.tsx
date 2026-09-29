'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { FloatingEmbers } from './FloatingEmbers';

interface BackgroundEmbersCanvasProps {
  isNightMode?: boolean;
}

export const BackgroundEmbersCanvas: React.FC<BackgroundEmbersCanvasProps> = ({
  isNightMode = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        opacity: isNightMode ? 0.95 : 0.6,
        transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        }}
        dpr={1} // Keep light for background canvas
        className="w-full h-full pointer-events-none"
      >
        <Suspense fallback={null}>
          <FloatingEmbers count={120} isNightMode={isNightMode} />
        </Suspense>
      </Canvas>
    </div>
  );
};
