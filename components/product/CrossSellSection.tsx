'use client';

import React from 'react';
import { Product } from '@/types/product';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/home/ProductCard';
import { Sparkles } from 'lucide-react';

interface CrossSellSectionProps {
  currentProduct: Product;
}

export const CrossSellSection: React.FC<CrossSellSectionProps> = ({ currentProduct }) => {
  const pairedProducts = PRODUCTS.filter((p) =>
    currentProduct.pairsWithSlugs.includes(p.slug)
  );

  if (pairedProducts.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-warm-border">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-terracotta text-xs font-semibold uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HARMONIOUS PAIRINGS</span>
        </div>
        <h3 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal">
          Complements Your Sanctuary
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
          Pair these fragrances together in adjoining rooms to create a multi-dimensional olfactory journey.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {pairedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
