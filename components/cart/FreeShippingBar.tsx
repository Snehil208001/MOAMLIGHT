'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/formatters';
import { Sparkles, CheckCircle2, Truck } from 'lucide-react';

export const FreeShippingBar: React.FC = () => {
  const { subtotal, freeShippingThreshold, hasFreeShipping, amountNeededForFreeShipping, items } = useCart();

  if (items.length === 0) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="bg-warm-cream/70 border-y border-warm-border p-3.5 sm:p-4 text-center">
      {hasFreeShipping && subtotal >= freeShippingThreshold ? (
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-terracotta">
          <CheckCircle2 className="w-4 h-4 text-terracotta shrink-0" />
          <span>🎉 You&apos;ve unlocked <strong>FREE Express Shipping</strong> across India!</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-charcoal">
            <Truck className="w-4 h-4 text-terracotta shrink-0" />
            <span>
              Add <strong className="text-terracotta font-bold">{formatINR(amountNeededForFreeShipping)}</strong> more for <strong>FREE Express Shipping</strong>
            </span>
          </div>

          <div className="w-full h-2 bg-warm-border/60 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-gold to-terracotta rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
