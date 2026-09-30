'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatINR, calculateDiscount, getOptimizedImageUrl } from '@/lib/formatters';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, ArrowRight, Flame } from 'lucide-react';
import { useDayNight } from '@/components/animation/DayNightScrollController';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const { isNightMode } = useDayNight();
  const [isHovered, setIsHovered] = useState(false);

  const defaultVariant = product.variants[0];
  const discount = calculateDiscount(product.defaultMrp, product.defaultPrice);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(
      {
        productId: product.id,
        title: product.title,
        scentProfile: product.category,
        variantId: defaultVariant.id,
        variantName: defaultVariant.name,
        price: defaultVariant.price,
        mrp: defaultVariant.mrp,
        image: product.images[0],
        weightGrams: defaultVariant.weightGrams,
      },
      1
    );

    showToast({
      title: 'Added to Sanctuary Bag',
      message: `${product.title} (${defaultVariant.name})`,
      image: product.images[0],
      actionLabel: 'View Bag',
      onAction: () => openCart(),
    });
  };

  return (
    <div
      className="product-card-item perspective-container group"
      style={{ perspective: '1100px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="card-3d relative flex flex-col rounded-[16px] overflow-hidden border"
        style={{
          backgroundColor: 'var(--card-bg-daynight)',
          borderColor: isHovered ? 'rgba(255, 140, 0, 0.5)' : 'var(--border-daynight)',
          color: 'var(--text-daynight)',
          transform: isHovered
            ? 'rotateX(6deg) rotateY(-6deg) translateY(-8px) translateZ(14px)'
            : 'rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)',
          boxShadow: isHovered
            ? '0 25px 50px -12px rgba(255, 140, 0, 0.42), 0 0 25px rgba(255, 140, 0, 0.25)'
            : isNightMode
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
            : '0 10px 25px -5px rgba(38, 33, 30, 0.06)',
        }}
      >
        {/* Visual Container (4:5 Aspect Ratio) */}
        <Link
          href={`/products/${product.slug}`}
          prefetch={true}
          className="relative aspect-[4/5] overflow-hidden bg-warm-cream/30 block cursor-pointer"
        >
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
            {product.bestseller && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-terracotta text-warm-linen backdrop-blur-md shadow-sm">
                <Flame className="w-3 h-3 text-amber-soft" />
                Bestseller
              </span>
            )}
            {discount > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber text-charcoal backdrop-blur-md shadow-sm">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Primary Image */}
          <img
            src={getOptimizedImageUrl(product.images[0], 600, 75)}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered && product.images[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />

          {/* Secondary Lifestyle Image on Hover */}
          {product.images[1] && (
            <img
              src={getOptimizedImageUrl(product.images[1], 600, 75)}
              alt={`${product.title} atmospheric lifestyle`}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          )}

          {/* Subtle Ambient Amber Glow Sheen on Hover */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 bg-gradient-to-t from-amber/20 via-transparent to-transparent ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Glassmorphism Quick Add Button Overlay */}
          <div className="absolute inset-x-3 bottom-3 z-10 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-y-2 sm:group-hover:translate-y-0">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-2.5 px-4 backdrop-blur-md rounded-xl text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                isNightMode
                  ? 'bg-[#1A1A1A]/90 hover:bg-amber text-[#F9F6F0] hover:text-charcoal border border-white/20'
                  : 'bg-warm-linen/95 hover:bg-terracotta text-charcoal hover:text-warm-linen border border-warm-border'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Quick Add • {formatINR(product.defaultPrice)}</span>
            </button>
          </div>
        </Link>

        {/* Product Content Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Scent Notes Preview Ribbon */}
            {(() => {
              const notes = [
                product.scentPyramid?.topNotes?.[0],
                product.scentPyramid?.heartNotes?.[0],
                product.scentPyramid?.baseNotes?.[0],
              ].filter(Boolean);
              return (
                <div className="text-[11px] font-semibold text-amber-dark dark:text-amber tracking-wider uppercase truncate mb-1">
                  {notes.length > 0 ? notes.join(' • ') : product.tagline || product.category}
                </div>
              );
            })()}

            {/* Title */}
            <Link
              href={`/products/${product.slug}`}
              prefetch={true}
              className="block group-hover:text-amber transition-colors cursor-pointer"
            >
              <h3 className="font-serif text-xl font-semibold leading-snug line-clamp-1">
                {product.title}
              </h3>
            </Link>

            {/* Tagline */}
            <p
              className={`text-xs line-clamp-1 mt-1 font-sans ${
                isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
              }`}
            >
              {product.tagline}
            </p>

            {/* Star Rating */}
            <div className="mt-2.5">
              <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />
            </div>
          </div>

          {/* Price & Action */}
          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between ${
              isNightMode ? 'border-white/10' : 'border-warm-border/80'
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-bold">
                {formatINR(product.defaultPrice)}
              </span>
              <span
                className={`text-xs line-through ${
                  isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                }`}
              >
                {formatINR(product.defaultMrp)}
              </span>
            </div>

            <Link
              href={`/products/${product.slug}`}
              prefetch={true}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-amber hover:text-amber-glow active:scale-90 transition-all cursor-pointer select-none"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
