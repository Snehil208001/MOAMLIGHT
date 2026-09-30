'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/formatters';
import { Sparkles, Truck, CheckCircle2 } from 'lucide-react';

interface FreeShippingBarProps {
  /** Optional custom threshold; defaults to store threshold ($75 USD / ₹999 INR) */
  threshold?: number;
}

/**
 * ============================================================================
 * 🎁 AGENT 1 & 3: PROGRESSIVE CART REWARDS & AOV GAMIFICATION
 * ============================================================================
 *
 * MATHEMATICAL FOUNDATION & PROGRESS CALCULATION:
 *
 * 1. Threshold Determination:
 *    - In headless multi-currency e-commerce, CartContext maintains an active subtotal.
 *    - We evaluate whether the subtotal is scaled to USD or INR:
 *      If subtotal < 300, we operate in USD with threshold = $75.
 *      If subtotal >= 300, we operate in INR with threshold = ₹999 (~$75 equivalent).
 *
 * 2. Progress Ratio & Clamping:
 *    progressRatio = clamp(subtotal / effectiveThreshold, 0, 1)
 *    progressPercent = progressRatio * 100
 *
 * 3. Delta Remaining:
 *    deltaRemaining = max(0, effectiveThreshold - subtotal)
 *
 * 4. Physics-Based Motion Spring:
 *    Framer Motion spring (stiffness: 100, damping: 16) produces a luxurious,
 *    smooth fluid fluid-fill animation without sharp linear steps.
 */
export const FreeShippingBar: React.FC<FreeShippingBarProps> = ({ threshold }) => {
  const { subtotal, freeShippingThreshold = 999, items } = useCart();

  if (items.length === 0) return null;

  // Determine scale: USD ($75) or INR (₹999)
  const isUsdScale = subtotal > 0 && subtotal < 300;
  const effectiveThreshold = threshold ?? (isUsdScale ? 75 : freeShippingThreshold);
  const isUnlocked = subtotal >= effectiveThreshold;
  const amountRemaining = Math.max(0, effectiveThreshold - subtotal);

  // Clamped progress percentage (0% to 100%)
  const progressRatio = Math.min(1, Math.max(0, subtotal / effectiveThreshold));
  const progressPercent = Math.round(progressRatio * 100);

  // Formatted remaining string for prompt compliance & global readiness
  const remainingLabel = isUsdScale
    ? `$${amountRemaining}`
    : `${formatINR(amountRemaining)} ($${Math.max(1, Math.round(amountRemaining / 83))})`;

  return (
    <div
      className={`border-y transition-colors duration-500 p-3.5 sm:p-4 text-center relative overflow-hidden ${
        isUnlocked
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border-amber/40 shadow-xs'
          : 'bg-warm-cream/70 border-warm-border'
      }`}
    >
      {/* Background Radiance Pulse when unlocked */}
      {isUnlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-amber-200/20 via-amber-300/30 to-amber-200/20 pointer-events-none"
        />
      )}

      <div className="relative z-10 space-y-2">
        {/* Dynamic Status Messaging */}
        {isUnlocked ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-amber-950 font-serif"
          >
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
            <span>Complimentary Shipping Unlocked ✨</span>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-charcoal">
            <Truck className="w-4 h-4 text-terracotta shrink-0" />
            <span>
              You are <strong className="text-terracotta font-bold">{remainingLabel}</strong> away from{' '}
              <strong>Complimentary Shipping</strong>.
            </span>
          </div>
        )}

        {/* Spring-Driven Progress Bar Track */}
        <div className="w-full h-2.5 bg-warm-border/50 rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 15, mass: 0.3 }}
            className={`h-full rounded-full relative transition-all duration-300 ${
              isUnlocked
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-[0_0_12px_rgba(255,191,0,0.85)]'
                : 'bg-gradient-to-r from-amber-gold to-terracotta'
            }`}
          >
            {/* Shimmer Light Bar */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            />
          </motion.div>
        </div>

        {/* Milestone Indicator Pills */}
        <div className="flex justify-between items-center text-[10px] text-charcoal-muted px-1 font-mono">
          <span>{isUsdScale ? '$0' : '₹0'}</span>
          <span>
            {isUnlocked ? (
              <span className="text-amber-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-600" /> Goal Reached
              </span>
            ) : (
              `${progressPercent}% to Free Shipping`
            )}
          </span>
          <span>{isUsdScale ? '$75' : '₹999 ($75)'}</span>
        </div>
      </div>
    </div>
  );
};

