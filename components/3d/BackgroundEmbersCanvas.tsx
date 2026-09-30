'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { View, PerspectiveCamera } from '@react-three/drei';
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
    <View
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      style={{
        opacity: isNightMode ? 0.95 : 0.6,
        transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />
      <Suspense fallback={null}>
        <FloatingEmbers count={120} isNightMode={isNightMode} />
      </Suspense>
    </View>
  );
};
