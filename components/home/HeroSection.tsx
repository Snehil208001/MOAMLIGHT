'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Leaf, ShieldCheck, Truck, Banknote, Flame } from 'lucide-react';
import { HeroCandleWrapper } from '@/components/3d/HeroCandleWrapper';
import { useDayNight } from '@/components/animation/DayNightScrollController';
import gsap from 'gsap';

const splitText = (text: string) => {
  return text.split('').map((char, index) => (
    <span key={index} className="inline-block char" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
      {char}
    </span>
  ));
};

export const HeroSection: React.FC = () => {
  const { isNightMode } = useDayNight();
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.fromTo('.char', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.02 }
      )
      .fromTo('.subtitle',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.4"
      )
      .fromTo('.cta-button',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' },
        "-=0.6"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative overflow-hidden pt-6 pb-16 sm:py-16 lg:py-20 border-b border-[var(--border-daynight)] bg-transparent">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-amber/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Glassmorphism CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Atelier Luxury Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border border-warm-border/70 text-terracotta text-xs font-semibold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber animate-pulse" />
              <span className="font-sans">THE ARTISANAL HOME FRAGRANCE HOUSE</span>
            </div>

            {/* Main Editorial Headline with Cormorant Garamond */}
            <h1 className="font-serif font-semibold text-charcoal leading-[1.12]" style={{ fontSize: 'clamp(2.1rem, 7vw, 4.2rem)' }}>
              <div className="overflow-hidden pb-1">{splitText('Illuminate Your')}</div>
              <span className="italic font-normal text-terracotta relative inline-block overflow-hidden pb-2">
                {splitText('Sanctuary.')}
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-terracotta/60 via-amber/60 to-transparent" />
              </span>
            </h1>

            {/* Subheading in clean Inter font */}
            <p className="subtitle text-sm sm:text-base text-charcoal-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-light">
              Hand-poured slow-burning golden soy wax candles infused with ancient botanicals, royal spices, and therapeutic Indian aromas. Clean burning, paraffin-free, and designed for mindful luxury living.
            </p>

            {/* CTAs: Glassmorphism 'Shop the Collection' CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link href="/products" className="w-full sm:w-auto cta-button">
                <button 
                  className="group relative w-full sm:w-auto px-7 sm:px-10 py-3.5 sm:py-4 rounded-full glass-cta text-charcoal text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif', boxShadow: isNightMode ? '0 0 30px var(--night-accent-glow)' : '' }}
                >
                  {/* Subtle inner amber glow highlight */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber/20 via-amber/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <Flame className="w-4 h-4 text-amber transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative z-10">Shop the Collection</span>
                  <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/quiz" className="w-full sm:w-auto cta-button">
                <button className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-full border border-warm-border hover:border-charcoal/40 text-charcoal bg-transparent hover:bg-warm-cream/50 text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] transition-all duration-300" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>
                  Take Scent Quiz
                </button>
              </Link>
            </div>

            {/* Social Proof & Connoisseur Endorsements */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3.5 text-xs text-charcoal-muted">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-warm-linen object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Fragrance Patron"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-warm-linen object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Fragrance Patron"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-warm-linen object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Fragrance Patron"
                />
              </div>
              <p className="font-sans">
                Rated <strong className="text-charcoal font-semibold">4.9/5</strong> by 600+ fragrance connoisseurs across India
              </p>
            </div>
          </div>

          {/* Right Column: Interactive 3D WebGL Frosted Glass Candle (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <HeroCandleWrapper isNightMode={isNightMode} />
          </div>
        </div>

        {/* Indian Market Trust Highlights Ribbon */}
        <div className="mt-14 pt-8 border-t border-warm-border/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sage-light text-sage-dark flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">
                100% Botanical Soy Wax
              </h4>
              <p className="text-xs text-charcoal-muted mt-0.5 font-sans">
                Paraffin-free, non-toxic clean burn
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-warm-cream text-terracotta flex items-center justify-center shrink-0 border border-warm-border/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">
                Handcrafted in India
              </h4>
              <p className="text-xs text-charcoal-muted mt-0.5 font-sans">
                Micro-batches with pure cotton wicks
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-warm-cream text-terracotta flex items-center justify-center shrink-0 border border-warm-border/60">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">
                Free Express Delivery
              </h4>
              <p className="text-xs text-charcoal-muted mt-0.5 font-sans">
                On all Indian orders above ₹999
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber/15 text-amber flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">
                Cash on Delivery
              </h4>
              <p className="text-xs text-charcoal-muted mt-0.5 font-sans">
                COD available across 19,000+ pincodes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
