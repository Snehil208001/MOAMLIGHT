'use client';

import React, { ButtonHTMLAttributes, forwardRef, useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'terracotta' | 'outline' | 'charcoal' | 'ghost' | 'sage';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  magnetic?: boolean;
}

/**
 * ============================================================================
 * 🧲 AGENT 1 (CREATIVE DIRECTOR): MAGNETIC BUTTON COMPONENT
 * ============================================================================
 *
 * Implements Awwwards-winning physics-based cursor attraction.
 *
 * MATHEMATICAL FOUNDATION:
 * 1. Calculate the bounding box of the element: (rect.left, rect.top, width, height)
 * 2. Find the element's geometric center: C = (rect.left + width/2, rect.top + height/2)
 * 3. Compute relative displacement vector: D = (mouse.x - C.x, mouse.y - C.y)
 * 4. Scale displacement by magnetic intensity factor (k = 0.28 for tactile luxury pull)
 * 5. Feed into a second-order critically damped spring:
 *    F = -k*x - c*v (stiffness: 180, damping: 14, mass: 0.15)
 *    This produces buttery, zero-jitter cursor tracking and smooth inertia on exit.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'terracotta',
      size = 'md',
      isLoading = false,
      magnetic = false,
      children,
      disabled,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [canHover, setCanHover] = useState(false);

    // Detect if device supports hover/fine pointer (disable magnetic on mobile touch)
    useEffect(() => {
      setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    }, []);

    // Motion coordinates for magnetic attraction
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);

    // Damped luxury spring physics
    const springConfig = { stiffness: 180, damping: 14, mass: 0.15 };
    const springX = useSpring(rawX, springConfig);
    const springY = useSpring(rawY, springConfig);

    // Content elevation spring (subtle parallax between button shell & inner content)
    const contentSpringX = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
    const contentSpringY = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !canHover || disabled || isLoading) return;

      const element = internalRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Magnetic pull: Shell pulls 28%, Content inner parallax pulls 14%
      rawX.set(deltaX * 0.28);
      rawY.set(deltaY * 0.28);
      contentSpringX.set(deltaX * 0.14);
      contentSpringY.set(deltaY * 0.14);

      if (!isHovered) setIsHovered(true);
      if (onMouseMove) onMouseMove(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Return spring to equilibrium (0, 0)
      rawX.set(0);
      rawY.set(0);
      contentSpringX.set(0);
      contentSpringY.set(0);
      setIsHovered(false);

      if (onMouseLeave) onMouseLeave(e);
    };

    const baseStyles =
      'group relative inline-flex items-center justify-center font-semibold rounded-xl tracking-wider select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] overflow-hidden transition-colors duration-250 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60 focus-visible:ring-offset-2 focus-visible:ring-offset-warm-linen';

    const variants = {
      terracotta:
        'bg-terracotta text-warm-linen hover:bg-terracotta-dark shadow-sm hover:shadow-warm border border-transparent',
      outline:
        'border border-warm-border bg-transparent text-charcoal hover:bg-warm-cream/60 hover:border-charcoal/30 shadow-none',
      charcoal:
        'bg-charcoal text-warm-linen hover:bg-black shadow-sm border border-transparent',
      ghost:
        'bg-transparent text-charcoal hover:bg-warm-cream/40 border border-transparent shadow-none',
      sage:
        'bg-sage text-warm-linen hover:bg-sage-dark shadow-sm border border-transparent',
    };

    const sizes = {
      sm: 'text-xs uppercase px-3.5 py-2 gap-1.5 min-h-[36px]',
      md: 'text-xs sm:text-sm uppercase px-5 py-3 gap-2 min-h-[44px]',
      lg: 'text-sm sm:text-base uppercase px-7 py-3.5 gap-2.5 min-h-[52px]',
    };

    // Combine refs
    const setRefs = (node: HTMLButtonElement | null) => {
      (internalRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    return (
      <motion.button
        ref={setRefs}
        disabled={disabled || isLoading}
        style={{
          x: magnetic && canHover ? springX : 0,
          y: magnetic && canHover ? springY : 0,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {/* Subtle Ambient Glow Aura on Hover */}
        <span
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          aria-hidden="true"
        />

        {/* Upward Text-Reveal Parallax Wrapper */}
        <motion.span
          style={{
            x: magnetic && canHover ? contentSpringX : 0,
            y: magnetic && canHover ? contentSpringY : 0,
          }}
          className="relative z-10 inline-flex items-center justify-center gap-2 transform transition-transform duration-300 group-hover:-translate-y-0.5"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />}
          {children}
        </motion.span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

