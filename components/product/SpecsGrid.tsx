'use client';

import React from 'react';
import { CandleSpecs } from '@/types/product';
import { Clock, Leaf, Scissors, Sparkles, Ruler, MapPin } from 'lucide-react';

interface SpecsGridProps {
  specs: CandleSpecs;
}

export const SpecsGrid: React.FC<SpecsGridProps> = ({ specs }) => {
  const items = [
    { label: 'Burn Duration', value: specs.burnTime, icon: Clock },
    { label: 'Wax Composition', value: specs.waxType, icon: Leaf },
    { label: 'Wick Specification', value: specs.wickType, icon: Scissors },
    { label: 'Vessel Material', value: specs.vessel, icon: Sparkles },
    { label: 'Dimensions', value: specs.dimensions, icon: Ruler },
    { label: 'Atelier Origin', value: specs.origin, icon: MapPin },
  ];

  return (
    <div className="bg-warm-linen border border-warm-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      <h3 className="font-serif text-2xl font-semibold text-charcoal">
        Specifications & Craftsmanship
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-warm-cream/40 border border-warm-border flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-warm-linen flex items-center justify-center text-terracotta border border-warm-border shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
                  {item.label}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-charcoal mt-0.5">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
