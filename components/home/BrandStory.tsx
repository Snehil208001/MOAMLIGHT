'use client';

import React, { useRef, useEffect } from 'react';
import { Check, X, Flame, Leaf, Clock, HeartHandshake } from 'lucide-react';
import { useDayNight } from '@/components/animation/DayNightScrollController';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export const BrandStory: React.FC = () => {
  const { isNightMode } = useDayNight();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const ctx = gsap.context(() => {
      const parallaxImages = sectionRef.current?.querySelectorAll('.parallax-image');
      if (parallaxImages && parallaxImages.length > 0) {
        gsap.to(parallaxImages, {
          yPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="brand-story-section py-20 sm:py-24 border-y border-[var(--border-daynight)] bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-amber text-xs font-semibold uppercase tracking-widest mb-3">
            <Leaf className="w-4 h-4" />
            <span>THE SLOW-CRAFT PHILOSOPHY</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium">
            The Clean Burn Manifesto
          </h2>
          <p
            className={`mt-4 text-sm sm:text-base leading-relaxed ${
              isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
            }`}
          >
            Most commercial candles are formulated with petroleum refinery byproducts that release toxic black soot and benzene into your home. MOAMLIGHT was born to restore candles to their ancient, sacred botanical origins.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">
          {/* MOAMLIGHT Soy Wax */}
          <div
            className={`rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between border transition-all duration-500 ${
              isNightMode
                ? 'bg-[#221F1D] border-amber/40 shadow-amber-glow-card text-[#F9F6F0]'
                : 'bg-warm-linen border-2 border-terracotta/30 shadow-warm text-charcoal'
            }`}
          >
            <div className="absolute top-0 right-0 bg-terracotta text-warm-linen text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-bl-xl">
              MOAMLIGHT STANDARD
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                    isNightMode
                      ? 'bg-amber/15 text-amber border-amber/30'
                      : 'bg-warm-cream text-terracotta border-warm-border'
                  }`}
                >
                  <Flame className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold">
                    100% Golden Botanical Soy Wax
                  </h3>
                  <p className="text-xs text-amber font-medium tracking-wide">
                    Clean, Biodegradable & Therapeutic
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sage-light text-sage-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Zero Soot & Headaches</h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                      }`}
                    >
                      Burns up to 50% cooler than paraffin, releasing clean essential vapor without petro-chemicals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sage-light text-sage-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Pure Dual Cotton Wicks</h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                      }`}
                    >
                      100% unbleached Egyptian cotton braided wicks. Completely lead-free and zinc-free.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sage-light text-sage-dark flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Reusable Heirloom Vessels</h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                      }`}
                    >
                      Hand-blown fluted amber glass and earthenware ceramic designed to be repurposed forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`mt-8 pt-6 border-t text-xs italic ${
                isNightMode ? 'border-white/10 text-charcoal-light' : 'border-warm-border text-charcoal-muted'
              }`}
            >
              &quot;A flame that purifies the mind, instead of polluting your living air.&quot;
            </div>
          </div>

          {/* Mass Commercial Candles */}
          <div
            className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between border transition-all duration-500 ${
              isNightMode
                ? 'bg-[#181615] border-white/5 text-[#F9F6F0]'
                : 'bg-warm-linen/60 border border-warm-border text-charcoal'
            }`}
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-charcoal/10 flex items-center justify-center text-charcoal-muted">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold opacity-75">
                    Commercial Paraffin Wax
                  </h3>
                  <p className="text-xs text-charcoal-muted tracking-wide">
                    Standard Industrial Candles
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Toxic Black Carbon Soot</h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                      }`}
                    >
                      Refined petroleum crude sludge that stains walls and triggers headaches and allergic rhinitis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Fast & Tunneling Burn</h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                      }`}
                    >
                      Burns hot and rapidly, tunneling down the center and wasting over 40% of the candle wax.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Metal Core Wicks</h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                      }`}
                    >
                      Often contains zinc or lead wires inside the wick for stiffness, vaporizing toxic particles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Synthetic Phthalates</h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
                      }`}
                    >
                      Heavy synthetic chemical aroma concentrates that trigger nausea and throat irritation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`mt-8 pt-6 border-t text-xs ${
                isNightMode ? 'border-white/10 text-charcoal-light' : 'border-warm-border text-charcoal-muted'
              }`}
            >
              Cheap petroleum wax compromises your respiratory health.
            </div>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className={`p-6 rounded-xl border text-center transition-all duration-500 ${
              isNightMode
                ? 'bg-[#221F1D] border-white/10'
                : 'bg-warm-linen border-warm-border'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-amber/10 flex items-center justify-center text-amber mb-4 border border-amber/20">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-semibold mb-1">
              Micro-Batch Curing
            </h4>
            <p
              className={`text-xs leading-relaxed ${
                isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
              }`}
            >
              Every batch cures for 14 days in temperature-regulated rooms so the botanical oil bonds completely with the soy crystals.
            </p>
          </div>

          <div
            className={`p-6 rounded-xl border text-center transition-all duration-500 ${
              isNightMode
                ? 'bg-[#221F1D] border-white/10'
                : 'bg-warm-linen border-warm-border'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-amber/10 flex items-center justify-center text-amber mb-4 border border-amber/20">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-semibold mb-1">
              Zero-Plastic Unboxing
            </h4>
            <p
              className={`text-xs leading-relaxed ${
                isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
              }`}
            >
              Packed exclusively with recycled Kraft paper, biodegradable honeycomb padding, and plantable wild basil seed paper dust covers.
            </p>
          </div>

          <div
            className={`p-6 rounded-xl border text-center transition-all duration-500 ${
              isNightMode
                ? 'bg-[#221F1D] border-white/10'
                : 'bg-warm-linen border-warm-border'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-amber/10 flex items-center justify-center text-amber mb-4 border border-amber/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-lg font-semibold mb-1">
              Indian Artisan Fair Wage
            </h4>
            <p
              className={`text-xs leading-relaxed ${
                isNightMode ? 'text-charcoal-light' : 'text-charcoal-muted'
              }`}
            >
              Hand-poured by skilled women artisans in Bengaluru, ensuring dignity, safe craft conditions, and above-market livable compensation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
