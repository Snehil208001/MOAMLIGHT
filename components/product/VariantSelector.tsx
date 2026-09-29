'use client';

import React from 'react';
import { ProductVariant } from '@/types/product';
import { formatINR } from '@/lib/formatters';
import { Flame } from 'lucide-react';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-charcoal">
          Select Vessel & Size:
        </span>
        <span className="text-charcoal-muted">
          {selectedVariant.weightGrams}g ({selectedVariant.burnTimeHours}+ Hours Burn)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variants.map((v) => {
          const isSelected = v.id === selectedVariant.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVariant(v)}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'border-terracotta bg-warm-cream/50 ring-2 ring-terracotta/20 shadow-sm'
                  : 'border-warm-border bg-warm-linen hover:border-terracotta/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-charcoal">{v.name}</span>
                <span className="font-serif text-sm font-bold text-charcoal">
                  {formatINR(v.price)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-[11px] text-charcoal-muted">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-terracotta" />
                  {v.burnTimeHours}+ hrs
                </span>
                <span>•</span>
                <span>{v.wicksCount === 1 ? 'Single wick' : `${v.wicksCount}-wick`}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
