'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, Play, Volume2, VolumeX } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/formatters';
import { ProductVideo } from '@/types/product';

interface ImageGalleryProps {
  images: string[];
  videos?: ProductVideo[];
  title: string;
}

type MediaItem =
  | { type: 'image'; url: string; index: number }
  | { type: 'video'; video: ProductVideo; index: number };

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  videos = [],
  title,
}) => {
  // Combine all images and videos into a single navigable media stream
  const mediaItems: MediaItem[] = [
    ...images.map((url, idx) => ({ type: 'image' as const, url, index: idx })),
    ...videos.map((video, idx) => ({ type: 'video' as const, video, index: images.length + idx })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const activeItem = mediaItems[activeIndex] || mediaItems[0] || { type: 'image', url: images[0] || '', index: 0 };
  const hasVideos = videos.length > 0;

  return (
    <div className="space-y-3">
      {/* Header with media filters / badges */}
      <div className="flex items-center gap-2 px-1 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeItem.type === 'image'
              ? 'bg-warm-cream border border-terracotta/40 text-charcoal shadow-sm'
              : 'bg-warm-cream/50 border border-warm-border text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-terracotta" />
          <span>Photography ({images.length})</span>
        </button>

        {hasVideos && (
          <button
            type="button"
            onClick={() => setActiveIndex(images.length)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeItem.type === 'video'
                ? 'bg-amber/20 border border-amber text-charcoal font-bold shadow-sm'
                : 'bg-warm-cream/50 border border-warm-border text-charcoal-muted hover:text-charcoal hover:border-amber/40'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-dark dark:text-amber" />
            <span>Artisan Film ({videos.length})</span>
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse ml-0.5" />
          </button>
        )}
      </div>

      {/* Main Viewport Container */}
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        {/* Thumbnails Row / Column */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0">
          {mediaItems.map((item, idx) => {
            const isSelected = activeIndex === idx;

            if (item.type === 'image') {
              return (
                <button
                  key={`thumb-img-${idx}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-warm-cream relative ${
                    isSelected
                      ? 'border-terracotta ring-2 ring-terracotta/20 scale-105'
                      : 'border-warm-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(item.url, 160, 75)}
                    alt={`${title} thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            }

            // Video Thumbnail
            const poster = item.video.previewUrl || images[0] || '';
            return (
              <button
                key={`thumb-vid-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-charcoal relative group ${
                  isSelected
                    ? 'border-amber ring-2 ring-amber/30 scale-105'
                    : 'border-warm-border opacity-85 hover:opacity-100'
                }`}
                title="Play Artisan Video"
              >
                {poster ? (
                  <img
                    src={getOptimizedImageUrl(poster, 160, 75)}
                    alt={`${title} video preview`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-charcoal" />
                )}

                {/* Dark Gradient Overlay & Play Icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent flex flex-col items-center justify-center p-1">
                  <div className="w-6 h-6 rounded-full bg-amber/90 text-charcoal flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-3 h-3 fill-charcoal text-charcoal ml-0.5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-warm-linen mt-1 bg-black/60 px-1 rounded">
                    Video
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Display Area */}
        <div className="flex-1 relative aspect-[4/5] rounded-2xl overflow-hidden bg-warm-cream border border-warm-border shadow-warm flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeItem.type === 'image' ? (
              <motion.div
                key={`photo-${activeIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full relative"
              >
                <img
                  src={getOptimizedImageUrl(activeItem.url, 1000, 85)}
                  alt={`${title} view ${activeIndex + 1}`}
                  decoding="async"
                  className="w-full h-full object-cover"
                />

                {/* Media index indicator */}
                <div className="absolute bottom-3 right-3 bg-charcoal/70 backdrop-blur-md text-warm-linen text-[11px] px-2.5 py-1 rounded-full font-mono z-10">
                  {activeIndex + 1} / {mediaItems.length}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`video-${activeItem.video.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative bg-charcoal flex items-center justify-center"
              >
                <video
                  autoPlay
                  playsInline
                  muted={isMuted}
                  loop
                  controls
                  controlsList="nodownload"
                  poster={activeItem.video.previewUrl || images[0]}
                  className="w-full h-full object-contain bg-black"
                >
                  {activeItem.video.sources.map((src, sIdx) => (
                    <source key={sIdx} src={src.url} type={src.mimeType} />
                  ))}
                  Your browser does not support the video tag.
                </video>

                {/* Luxury Audio Mute/Unmute Toggle Overlay */}
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-charcoal/80 hover:bg-charcoal text-warm-linen backdrop-blur-md border border-white/20 shadow-lg transition-all"
                  title={isMuted ? 'Click to Unmute Audio' : 'Mute Audio'}
                  aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-warm-linen" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber animate-pulse" />
                  )}
                </button>

                {/* Floating Video Tag Badge */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal/80 backdrop-blur-md border border-amber/30 text-amber text-[11px] font-semibold tracking-wider uppercase shadow-md">
                    <Film className="w-3 h-3 text-amber" />
                    <span>Artisan Film</span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
