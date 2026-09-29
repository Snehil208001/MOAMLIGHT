'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// SSR-safe dynamic import for WebGL Canvas
const HeroCandleCanvas = dynamic(
  () => import('./HeroCandleCanvas').then((mod) => mod.HeroCandleCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center rounded-3xl bg-warm-cream/50 border border-warm-border/60">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber/30 border-t-amber animate-spin" />
          <p className="text-xs uppercase tracking-widest text-charcoal-muted font-sans font-medium">
            Awakening 3D Sanctuary...
          </p>
        </div>
      </div>
    ),
  }
);

interface HeroCandleWrapperProps {
  isNightMode?: boolean;
}

export const HeroCandleWrapper: React.FC<HeroCandleWrapperProps> = ({ isNightMode = false }) => {
  return <HeroCandleCanvas isNightMode={isNightMode} />;
};
