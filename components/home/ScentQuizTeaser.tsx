'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';

export const ScentQuizTeaser: React.FC = () => {
  return (
    <section className="py-16 bg-transparent border-t border-[var(--border-daynight)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-charcoal text-warm-linen rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Subtle Ambient Background Accent */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-10 w-48 h-48 bg-amber-gold/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-xl text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-linen/10 border border-warm-linen/20 text-amber-gold text-xs font-semibold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" />
              <span>THE 60-SECOND SCENT MATCHER</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-tight">
              Unsure which aroma fits your space?
            </h3>

            <p className="text-sm sm:text-base text-warm-linen/80 font-sans leading-relaxed">
              Answer 4 simple lifestyle questions about your daily sanctuary rituals, favorite memories, and lighting mood to unlock your tailored botanical candle match.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link href="/quiz">
              <Button
                variant="terracotta"
                size="lg"
                className="w-full sm:w-auto gap-2 bg-terracotta hover:bg-terracotta-dark text-warm-linen shadow-lg"
              >
                <span>Find Your Scent Match</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
