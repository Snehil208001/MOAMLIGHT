'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles, Leaf, ShieldCheck, Truck, Banknote, Flame } from 'lucide-react';
import { HeroCandleWrapper } from '@/components/3d/HeroCandleWrapper';
import { useDayNight } from '@/components/animation/DayNightScrollController';

/**
 * 🎨 AGENT 1: CINEMATIC TYPOGRAPHY REVEAL VARIANTS
 * 
 * MATHEMATICAL FOUNDATION OF EDITORIAL MOTION:
 * -------------------------------------------------------------
 * 1. Cubic-Bézier Curve: [0.25, 1.0, 0.5, 1.0]
 *    Standardized luxury deceleration profile. High initial velocity
 *    (instantly catching viewer eye fixation), followed by an extended,
 *    ultra-smooth 1.2-second settling tail.
 * 
 * 2. Stagger Offset (Delta t = 0.14s):
 *    Words reveal sequentially like an illuminated manuscript.
 *    Staggering words rather than individual letters preserves high-end
 *    legibility without chaotic micro-flutter.
 * 
 * 3. Chromatic Lens Rack Focus (Optical Blur 6px -> 0px):
 *    Simulates the aperture pull of an anamorphic cinema lens,
 *    where text materializes from soft focus as it reaches the plane of regard.
 */
const headlineContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.18,
    },
  },
};

const wordRevealVariants: Variants = {
  hidden: {
    y: 40,
    opacity: 0,
    rotateX: 25,
    filter: 'blur(6px)',
  },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const subtitleVariants: Variants = {
  hidden: {
    y: 35,
    opacity: 0,
    filter: 'blur(4px)',
  },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1],
      delay: 0.55,
    },
  },
};

const ctaGroupVariants: Variants = {
  hidden: {
    y: 28,
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.0,
      ease: [0.25, 1, 0.5, 1],
      delay: 0.75,
    },
  },
};

const trustRibbonVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.1,
      ease: [0.25, 1, 0.5, 1],
      delay: 0.95,
      staggerChildren: 0.12,
    },
  },
};

export const HeroSection: React.FC = () => {
  const { isNightMode } = useDayNight();

  const headlinePhrase1 = ['Illuminate', 'Your'];
  const headlinePhrase2 = ['Sanctuary.'];

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:py-16 lg:py-20 border-b border-[var(--border-daynight)] bg-transparent">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-amber/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Glassmorphism CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Atelier Luxury Eyebrow Pill */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border border-warm-border/70 text-terracotta text-xs font-semibold uppercase tracking-widest shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber animate-pulse" />
              <span className="font-sans">THE ARTISANAL HOME FRAGRANCE HOUSE</span>
            </motion.div>

            {/* Main Editorial Headline with Staggered Framer Motion Reveal */}
            <motion.h1
              variants={headlineContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="font-serif font-semibold text-charcoal leading-[1.12] perspective-[1000px]"
              style={{ fontSize: 'clamp(2.3rem, 7vw, 4.4rem)' }}
            >
              {/* Line 1: 'Illuminate Your' */}
              <div className="overflow-hidden pb-1 flex flex-wrap justify-center lg:justify-start gap-x-3.5">
                {headlinePhrase1.map((word, idx) => (
                  <motion.span
                    key={idx}
                    variants={wordRevealVariants}
                    className="inline-block transform-gpu origin-bottom"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              {/* Line 2: 'Sanctuary.' with Terracotta Gradient Stroke Accent */}
              <div className="overflow-hidden pb-2 flex flex-wrap justify-center lg:justify-start">
                {headlinePhrase2.map((word, idx) => (
                  <motion.span
                    key={idx}
                    variants={wordRevealVariants}
                    className="italic font-normal text-terracotta relative inline-block transform-gpu origin-bottom"
                  >
                    {word}
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-terracotta/70 via-amber/70 to-transparent" />
                  </motion.span>
                ))}
              </div>
            </motion.h1>

            {/* Subheading with Delayed Smooth Blur-Float */}
            <motion.p
              variants={subtitleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-sm sm:text-base text-charcoal-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-light"
            >
              Hand-poured slow-burning golden soy wax candles infused with ancient botanicals, royal spices, and therapeutic Indian aromas. Clean burning, paraffin-free, and designed for mindful luxury living.
            </motion.p>

            {/* CTAs: Glassmorphism 'Shop the Collection' CTA */}
            <motion.div
              variants={ctaGroupVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1"
            >
              <Link href="/products" className="w-full sm:w-auto">
                <button
                  className="group relative w-full sm:w-auto px-7 sm:px-10 py-3.5 sm:py-4 rounded-full glass-cta text-charcoal text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    boxShadow: isNightMode ? '0 0 30px var(--night-accent-glow)' : '',
                  }}
                >
                  {/* Subtle inner amber glow highlight */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber/20 via-amber/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <Flame className="w-4 h-4 text-amber transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative z-10">Shop the Collection</span>
                  <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/quiz" className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-full border border-warm-border hover:border-charcoal/40 text-charcoal bg-transparent hover:bg-warm-cream/50 text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] transition-all duration-300"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  Take Scent Quiz
                </button>
              </Link>
            </motion.div>

            {/* Social Proof & Connoisseur Endorsements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 1.0 }}
              className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3.5 text-xs text-charcoal-muted"
            >
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
            </motion.div>
          </div>

          {/* Right Column: Interactive 3D WebGL Frosted Glass Candle with Scrollytelling Kinematics (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <HeroCandleWrapper isNightMode={isNightMode} />
          </div>
        </div>

        {/* Indian Market Trust Highlights Ribbon */}
        <motion.div
          variants={trustRibbonVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-14 pt-8 border-t border-warm-border/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left"
        >
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
        </motion.div>
      </div>
    </section>
  );
};
