'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { View, Preload } from '@react-three/drei';
import { LenisR3FBridge } from '@/components/providers/SmoothScrollProvider';

interface GlobalCanvasProps {
  eventSourceRef?: React.RefObject<HTMLElement>;
}

export const GlobalCanvas: React.FC<GlobalCanvasProps> = ({ eventSourceRef }) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetEventSource, setTargetEventSource] = useState<HTMLElement | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    if (eventSourceRef && eventSourceRef.current) {
      setTargetEventSource(eventSourceRef.current);
    } else {
      const root = document.getElementById('app-root') || document.body;
      setTargetEventSource(root);
    }
  }, [eventSourceRef]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      id="global-r3f-canvas-container"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Canvas
        eventSource={targetEventSource || containerRef.current || undefined}
        eventPrefix="client"
        camera={{ position: [0, 1.5, 5], fov: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        shadows
        frameloop="always"
        className="w-full h-full pointer-events-none"
      >
        {/* Synchronize Lenis smooth scroll engine directly with R3F render loop */}
        <LenisR3FBridge />

        {/* Global View.Port: Renders all active Drei <View /> components positioned in the DOM */}
        <View.Port />

        {/* Preload Three.js assets and pipeline */}
        <Preload all />
      </Canvas>
    </div>
  );
};
