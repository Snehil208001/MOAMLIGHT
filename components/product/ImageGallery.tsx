'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails Row / Column */}
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
              src={img}
              alt={`${title} thumbnail ${idx + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Active Image */}
      <div className="flex-1 relative aspect-[4/5] rounded-2xl overflow-hidden bg-warm-cream border border-warm-border shadow-warm">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={`${title} view ${activeIndex + 1}`}
            decoding="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Image index indicator */}
        <div className="absolute bottom-3 right-3 bg-charcoal/70 backdrop-blur-md text-warm-linen text-[11px] px-2.5 py-1 rounded-full font-mono">
          {activeIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};
