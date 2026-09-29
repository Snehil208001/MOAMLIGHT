'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const BackgroundEmbersCanvas = dynamic(
  () => import('./BackgroundEmbersCanvas').then((mod) => mod.BackgroundEmbersCanvas),
  { ssr: false }
);

interface BackgroundEmbersWrapperProps {
  isNightMode?: boolean;
}

export const BackgroundEmbersWrapper: React.FC<BackgroundEmbersWrapperProps> = ({
  isNightMode = false,
}) => {
  return <BackgroundEmbersCanvas isNightMode={isNightMode} />;
};
