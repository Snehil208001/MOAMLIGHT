import React from 'react';

/**
 * Luxury Botanical Shimmer Skeleton for Product Detail Page
 * Provides instant (<10ms) App Router Suspense feedback when navigating to /products/[id].
 */
export default function ProductDetailLoading() {
  return (
    <div className="bg-warm-linen min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shimmer Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-3 w-12 bg-warm-cream/80 rounded animate-pulse" />
          <div className="h-3 w-3 bg-warm-border/60 rounded" />
          <div className="h-3 w-16 bg-warm-cream/80 rounded animate-pulse" />
          <div className="h-3 w-3 bg-warm-border/60 rounded" />
          <div className="h-3 w-32 bg-amber/20 rounded animate-pulse" />
        </div>

        {/* Top Section: Gallery + Product Action Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Gallery Skeleton (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Mode Switcher Header Skeleton */}
            <div className="flex items-center justify-between px-1">
              <div className="h-8 w-60 bg-warm-cream/90 rounded-full border border-warm-border/60 animate-pulse" />
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-4">
              {/* Thumbnails Placeholder */}
              <div className="flex lg:flex-col gap-3 shrink-0">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-warm-cream/90 border border-warm-border/60 animate-pulse"
                  />
                ))}
              </div>

              {/* Main Image Viewport Skeleton */}
              <div className="flex-1 relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-warm-cream via-amber/5 to-warm-cream border border-warm-border shadow-warm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <div className="w-10 h-10 rounded-full border-2 border-amber/30 border-t-amber animate-spin" />
                  <p className="text-[11px] uppercase tracking-widest text-charcoal-muted font-sans font-semibold">
                    Awakening Fragrance Sanctuary...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Purchase Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Badges Skeleton */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-24 bg-terracotta/20 rounded-full animate-pulse" />
                <div className="h-5 w-20 bg-sage-light/60 rounded-full animate-pulse" />
              </div>

              {/* Title & Tagline Skeleton */}
              <div className="h-10 sm:h-12 w-4/5 bg-warm-cream/90 rounded-lg animate-pulse mb-3" />
              <div className="h-4 w-full bg-warm-cream/70 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-warm-cream/60 rounded animate-pulse" />

              {/* Star Rating Skeleton */}
              <div className="mt-4 flex items-center gap-2">
                <div className="h-4 w-28 bg-amber/20 rounded animate-pulse" />
                <div className="h-3 w-16 bg-warm-cream/80 rounded animate-pulse" />
              </div>
            </div>

            {/* Price Box Skeleton */}
            <div className="p-4 rounded-xl bg-warm-cream/60 border border-warm-border space-y-2">
              <div className="flex items-baseline gap-3">
                <div className="h-8 w-24 bg-charcoal/15 rounded animate-pulse" />
                <div className="h-4 w-16 bg-warm-cream/80 rounded animate-pulse" />
                <div className="h-5 w-20 bg-amber/30 rounded-full animate-pulse" />
              </div>
              <div className="h-3 w-48 bg-warm-cream/70 rounded animate-pulse" />
            </div>

            {/* Variant Selector Skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-28 bg-warm-cream/80 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-xl bg-warm-cream/80 border border-amber/30 animate-pulse" />
                <div className="h-16 rounded-xl bg-warm-cream/50 border border-warm-border animate-pulse" />
              </div>
            </div>

            {/* Engraving Studio Box Skeleton */}
            <div className="p-4 rounded-xl bg-warm-cream/40 border border-dashed border-warm-border h-24 animate-pulse" />

            {/* Add to Bag & Buy Now Buttons Skeleton */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-28 rounded-xl bg-warm-cream/80 border border-warm-border animate-pulse" />
                <div className="h-12 flex-1 rounded-xl bg-terracotta/30 animate-pulse" />
              </div>
              <div className="h-12 w-full rounded-xl bg-charcoal/20 animate-pulse" />
            </div>

            {/* Trust Highlights Skeleton */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg bg-warm-cream/40 border border-warm-border animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Narrative & In-Depth Specifications Skeletons */}
        <div className="mt-20 pt-16 border-t border-warm-border grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-6">
            <div className="h-48 rounded-2xl bg-warm-cream/60 border border-warm-border animate-pulse" />
            <div className="h-40 rounded-2xl bg-warm-cream/50 border border-warm-border animate-pulse" />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <div className="h-48 rounded-2xl bg-warm-cream/60 border border-warm-border animate-pulse" />
            <div className="h-40 rounded-2xl bg-warm-cream/50 border border-warm-border animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
