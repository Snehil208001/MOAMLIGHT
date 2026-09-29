'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScentCategory, Product } from '@/types/product';
import { PRODUCTS } from '@/data/products';
import { formatINR } from '@/lib/formatters';
import { StarRating } from '@/components/ui/StarRating';
import { ArrowRight, Compass, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDayNight } from '@/components/animation/DayNightScrollController';

interface MoodTab {
  category: ScentCategory;
  label: string;
  notes: string;
  description: string;
}

const MOOD_TABS: MoodTab[] = [
  {
    category: 'Woody & Meditative',
    label: 'Woody & Meditative',
    notes: 'Mysore Sandalwood • Oudh • Cardamom • Golden Amber',
    description: 'Grounding sacred woods, resinous ambers, and ancient temple rituals to anchor your focus.',
  },
  {
    category: 'Floral & Nocturnal',
    label: 'Floral & Nocturnal',
    notes: 'Madurai Mogra • Star Jasmine • Damask Rose • Ylang Ylang',
    description: 'Intoxicating night-blooming blossoms celebrating twilight romance and festive gatherings.',
  },
  {
    category: 'Spiced & Gourmand',
    label: 'Spiced & Gourmand',
    notes: 'Ceylon Cinnamon • Bourbon Vanilla • Nutmeg • Tonka',
    description: 'Comforting spice plantations of the Malabar coast, roasted sugars, and fireside warmth.',
  },
  {
    category: 'Fresh & Earthy',
    label: 'Fresh & Earthy',
    notes: 'Mitti Attar • Darjeeling Tea • Bergamot • Wild Vetiver',
    description: 'First drops of monsoon rain upon baked clay soil, mountain tea leaves, and crisp morning air.',
  },
];

interface ScentExplorerProps {
  products?: Product[];
}

export const ScentExplorer: React.FC<ScentExplorerProps> = ({ products = PRODUCTS }) => {
  const [activeCategory, setActiveCategory] = useState<ScentCategory>('Woody & Meditative');
  const { isNightMode } = useDayNight();

  const activeMood = MOOD_TABS.find((m) => m.category === activeCategory) || MOOD_TABS[0];
  const matchingProducts = products.filter((p) => p.category === activeCategory);

  return (
    <section
      id="scents"
      className="scent-trigger relative py-24 border-b border-[var(--border-daynight)] bg-transparent"
    >
      {/* Ambient Night Mode Backlight Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none rounded-full blur-3xl transition-opacity duration-1000 ${
          isNightMode ? 'bg-amber/15 opacity-100' : 'bg-terracotta/5 opacity-50'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-3 border glass-panel">
            <Compass className="w-4 h-4 text-amber animate-spin-slow" />
            <span className="text-amber font-sans">OUR SCENTS • OLFACTORY DISCOVERY</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
            Find Your Fragrance Sanctuary
          </h2>
          <p
            className={`mt-3 text-sm sm:text-base font-sans ${
              isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
            }`}
          >
            Each fragrance family is formulated with slow-evaporating therapeutic botanicals to evoke specific emotional states.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {MOOD_TABS.map((tab) => {
            const isActive = tab.category === activeCategory;
            return (
              <button
                key={tab.category}
                onClick={() => setActiveCategory(tab.category)}
                className={`px-5 sm:px-7 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'bg-amber text-charcoal shadow-amber-glow font-bold scale-105'
                    : isNightMode
                    ? 'bg-white/5 text-charcoal-light border border-white/10 hover:border-amber/40 hover:text-white'
                    : 'bg-warm-linen text-charcoal-muted border border-warm-border hover:border-amber/40 hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Mood Details Card */}
        <div
          className={`rounded-2xl p-6 sm:p-8 mb-12 border transition-all duration-500 ${
            isNightMode
              ? 'glass-panel-dark border-amber/30 shadow-amber-glow-card'
              : 'glass-panel border-warm-border shadow-warm'
          }`}
        >
          <div className="max-w-3xl">
            <span className="text-xs font-semibold text-amber uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {activeMood.notes}
            </span>
            <p className="font-serif text-xl sm:text-2xl mt-2 italic leading-relaxed">
              &quot;{activeMood.description}&quot;
            </p>
          </div>
        </div>

        {/* Matching Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {matchingProducts.map((product) => (
              <div
                key={product.id}
                className={`rounded-2xl overflow-hidden p-5 sm:p-6 flex flex-col sm:flex-row gap-6 border transition-all duration-500 group ${
                  isNightMode
                    ? 'bg-[#221F1D]/80 border-white/10 hover:border-amber/40 hover:shadow-amber-glow-card'
                    : 'bg-warm-linen border-warm-border hover:shadow-warm hover:border-amber/30'
                }`}
              >
                <div className="w-full sm:w-48 h-56 sm:h-auto rounded-xl overflow-hidden bg-warm-cream/20 shrink-0 border border-warm-border/50 relative">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-amber uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {product.intensity} Throw
                      </span>
                      <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />
                    </div>

                    <h3 className="font-serif text-2xl font-medium">
                      {product.title}
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed font-sans ${
                        isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                      }`}
                    >
                      {product.tagline}
                    </p>

                    <div
                      className={`mt-3 pt-3 border-t text-[11px] font-sans ${
                        isNightMode ? 'border-white/10 text-charcoal-light' : 'border-warm-border text-charcoal-muted'
                      }`}
                    >
                      <strong className={isNightMode ? 'text-[#F9F6F0]' : 'text-charcoal'}>
                        Key Notes:{' '}
                      </strong>
                      {product.scentPyramid.topNotes[0]} • {product.scentPyramid.heartNotes[0]} • {product.scentPyramid.baseNotes[0]}
                    </div>
                  </div>

                  <div
                    className={`mt-6 flex items-center justify-between pt-4 border-t ${
                      isNightMode ? 'border-white/10' : 'border-warm-border'
                    }`}
                  >
                    <div>
                      <span className="font-serif text-xl font-bold">
                        {formatINR(product.defaultPrice)}
                      </span>
                      <span
                        className={`text-xs line-through ml-2 ${
                          isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                        }`}
                      >
                        {formatINR(product.defaultMrp)}
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber hover:text-amber-glow group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Experience</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
