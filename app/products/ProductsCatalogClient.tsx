'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Product, ScentCategory } from '@/types/product';
import { ProductCard } from '@/components/home/ProductCard';
import { Sparkles, SlidersHorizontal, ChevronRight } from 'lucide-react';

const CATEGORIES: ('All' | ScentCategory)[] = [
  'All',
  'Woody & Meditative',
  'Floral & Nocturnal',
  'Spiced & Gourmand',
  'Fresh & Earthy',
];

interface ProductsCatalogClientProps {
  products: Product[];
}

export function ProductsCatalogClient({ products }: ProductsCatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ScentCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.defaultPrice - b.defaultPrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.defaultPrice - a.defaultPrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, sortBy]);

  return (
    <div className="bg-warm-linen min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-charcoal-muted uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-charcoal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-warm-border" />
          <span className="text-terracotta font-medium">All Candles</span>
        </nav>

        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-terracotta text-xs font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE COMPLETE BOTANICAL REPERTOIRE</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-charcoal">
            Artisanal Scent Sanctuaries
          </h1>
          <p className="mt-3 text-sm text-charcoal-muted leading-relaxed">
            Hand-poured slow-burning soy wax candles infused with ancient botanicals, royal spices, and clean aromas. Discover your signature room scent.
          </p>
        </div>

        {/* Filters and Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-y border-warm-border mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All' ? products.length : products.filter((p) => p.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-terracotta text-warm-linen shadow-sm'
                      : 'bg-warm-cream/60 text-charcoal hover:bg-warm-cream'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-charcoal self-end sm:self-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-muted" />
            <span className="font-semibold uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-warm-linen border border-warm-border rounded-lg px-2.5 py-1.5 text-xs text-charcoal focus:outline-none focus:border-terracotta transition-colors"
            >
              <option value="featured">Featured Collection</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
