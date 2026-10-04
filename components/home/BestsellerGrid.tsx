'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { ArrowRight, Flame } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useDayNight } from '@/components/animation/DayNightScrollController';

interface BestsellerGridProps {
  products?: Product[];
}

export const BestsellerGrid: React.FC<BestsellerGridProps> = ({ products = PRODUCTS }) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const { isNightMode } = useDayNight();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const container = gridContainerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.product-card-item');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 60,
          scale: 0.94,
          rotateX: 4,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, gridContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={gridContainerRef}
      className="py-20 border-b border-[var(--border-daynight)] bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-amber text-xs font-semibold uppercase tracking-widest mb-2.5">
              <Flame className="w-4 h-4 text-amber animate-pulse" />
              <span className="font-sans">SIGNATURE BOTANICAL EDITIONS</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
              Handcrafted Bestsellers
            </h2>
            <p
              className={`mt-2.5 text-sm sm:text-base max-w-xl font-sans ${
                isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
              }`}
            >
              Slow-poured in small artisanal micro-batches with pure golden soy wax, rare Indian botanicals, and lead-free cotton wicks.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <Link href="/products">
              <button
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                  isNightMode
                    ? 'border border-amber/40 text-amber hover:bg-amber/10'
                    : 'border border-warm-border text-charcoal hover:border-amber hover:text-amber'
                }`}
              >
                <span>View All {products.length > 0 ? `${products.length} ` : ''}Scents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* 6 Products Grid with Staggered Entrance & 3D Isometric Hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
