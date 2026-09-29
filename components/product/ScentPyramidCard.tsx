'use client';

import React from 'react';
import { ScentPyramid } from '@/types/product';
import { Sparkles, Wind, Flame } from 'lucide-react';

interface ScentPyramidCardProps {
  scentPyramid: ScentPyramid;
}

export const ScentPyramidCard: React.FC<ScentPyramidCardProps> = ({ scentPyramid }) => {
  return (
    <div className="bg-warm-linen border border-warm-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div>
        <div className="inline-flex items-center gap-2 text-terracotta text-xs font-semibold uppercase tracking-widest mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OLFACTORY ARCHITECTURE</span>
        </div>
        <h3 className="font-serif text-2xl font-semibold text-charcoal">
          The Scent Pyramid
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
          {scentPyramid.description}
        </p>
      </div>

      <div className="space-y-4">
        {/* Top Notes */}
        <div className="p-4 rounded-xl bg-warm-cream/50 border border-warm-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-sage-dark" />
              Top Notes
            </span>
            <span className="text-[11px] text-charcoal-muted">First 15 minutes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scentPyramid.topNotes.map((note) => (
              <span
                key={note}
                className="px-2.5 py-1 rounded-full bg-warm-linen border border-warm-border text-xs text-charcoal font-medium"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Heart Notes */}
        <div className="p-4 rounded-xl bg-warm-cream/80 border border-warm-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-terracotta" />
              Heart Notes (Soul of the Candle)
            </span>
            <span className="text-[11px] text-charcoal-muted">2–4 hours</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scentPyramid.heartNotes.map((note) => (
              <span
                key={note}
                className="px-2.5 py-1 rounded-full bg-warm-linen border border-terracotta/30 text-xs text-charcoal font-medium shadow-2xs"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Base Notes */}
        <div className="p-4 rounded-xl bg-warm-cream/50 border border-warm-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-gold" />
              Base Notes
            </span>
            <span className="text-[11px] text-charcoal-muted">Lingering room aura</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scentPyramid.baseNotes.map((note) => (
              <span
                key={note}
                className="px-2.5 py-1 rounded-full bg-warm-linen border border-warm-border text-xs text-charcoal font-medium"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
