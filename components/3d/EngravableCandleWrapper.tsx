'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// SSR-safe dynamic import for 3D Engravable Candle View
const DynamicViewer = dynamic(
  () => import('./EngravableCandleViewer').then((mod) => mod.EngravableCandleViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] lg:min-h-[520px] flex items-center justify-center rounded-2xl bg-warm-cream/50 border border-warm-border">
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

interface EngravableCandleWrapperProps {
  engravingText?: string;
  engravingFont?: string;
  waxColor?: string;
  isNightMode?: boolean;
  productSlug?: string;
}

export const EngravableCandleWrapper: React.FC<EngravableCandleWrapperProps> = (props) => {
  return <DynamicViewer {...props} />;
};
