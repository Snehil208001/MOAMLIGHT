'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Rotate3D } from 'lucide-react';
import { EngravableCandleWrapper } from '@/components/3d/EngravableCandleWrapper';
import { getOptimizedImageUrl } from '@/lib/formatters';

interface ImageGalleryProps {
  images: string[];
  title: string;
  viewMode?: 'photo' | '3d';
  onViewModeChange?: (mode: 'photo' | '3d') => void;
  engravingText?: string;
  engravingFont?: string;
  waxColor?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  title,
  viewMode: controlledViewMode,
  onViewModeChange,
  engravingText = '',
  engravingFont = 'serif',
  waxColor = '#FFFDF8',
}) => {
  const [internalViewMode, setInternalViewMode] = useState<'photo' | '3d'>('photo');
  const [activeIndex, setActiveIndex] = useState(0);

  const activeMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;

  const handleModeChange = (mode: 'photo' | '3d') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  return (
    <div className="space-y-3">
      {/* Studio View Mode Switcher Header */}
      <div className="flex items-center justify-between px-1">
        <div className="inline-flex p-1 rounded-full bg-warm-cream border border-warm-border/80 shadow-inner">
          <button
            type="button"
            onClick={() => handleModeChange('photo')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeMode === 'photo'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-terracotta" />
            <span>Photography ({images.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('3d')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeMode === '3d'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>3D Studio & Engraving</span>
          </button>
        </div>

        {activeMode === '3d' && (
          <span className="text-[11px] font-medium text-terracotta hidden sm:inline-flex items-center gap-1">
            <Rotate3D className="w-3.5 h-3.5" /> 360° Interactive
          </span>
        )}
      </div>

      {/* Main Viewport Container */}
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        {/* Thumbnails Row / Column (visible in photo mode) */}
        {activeMode === 'photo' && (
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-warm-cream ${
                  activeIndex === idx
                    ? 'border-terracotta ring-2 ring-terracotta/20 scale-105'
                    : 'border-warm-border opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={getOptimizedImageUrl(img, 160, 75)}
                  alt={`${title} thumbnail ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Display Area */}
        <div className="flex-1 relative aspect-[4/5] rounded-2xl overflow-hidden bg-warm-cream border border-warm-border shadow-warm">
          <AnimatePresence mode="wait">
            {activeMode === 'photo' ? (
              <motion.div
                key="photo-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full relative"
              >
                <img
                  src={getOptimizedImageUrl(images[activeIndex], 1000, 85)}
                  alt={`${title} view ${activeIndex + 1}`}
                  decoding="async"
                  className="w-full h-full object-cover"
                />

                {/* Image index indicator */}
                <div className="absolute bottom-3 right-3 bg-charcoal/70 backdrop-blur-md text-warm-linen text-[11px] px-2.5 py-1 rounded-full font-mono z-10">
                  {activeIndex + 1} / {images.length}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="3d-studio-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <EngravableCandleWrapper
                  engravingText={engravingText}
                  engravingFont={engravingFont}
                  waxColor={waxColor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
