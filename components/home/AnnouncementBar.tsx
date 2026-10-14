'use client';

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-charcoal text-warm-linen text-xs py-2 px-4 relative z-40 border-b border-warm-border/10">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center">
        <Sparkles className="w-3.5 h-3.5 text-amber-gold shrink-0 hidden sm:inline-block" />
        <p className="font-medium tracking-wide">
          <span>Free Express Shipping Across India on Orders Above ₹999</span>
          <span className="mx-2 text-charcoal-muted">|</span>
          <span>Use Code <span className="font-bold text-amber-gold underline underline-offset-2">MOAM10</span> for 10% Off</span>
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-linen/60 hover:text-warm-linen transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-linen/60 rounded"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
