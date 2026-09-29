'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'terracotta' | 'outline' | 'charcoal' | 'ghost' | 'sage';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'terracotta', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg tracking-wider transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      terracotta: 'bg-terracotta text-warm-linen hover:bg-terracotta-dark shadow-sm hover:shadow-warm',
      outline: 'border border-warm-border bg-transparent text-charcoal hover:bg-warm-cream/50 hover:border-charcoal/20',
      charcoal: 'bg-charcoal text-warm-linen hover:bg-black shadow-sm',
      ghost: 'bg-transparent text-charcoal hover:bg-warm-cream/40',
      sage: 'bg-sage text-warm-linen hover:bg-sage-dark shadow-sm',
    };

    const sizes = {
      sm: 'text-xs uppercase px-3 py-2 gap-1.5',
      md: 'text-xs sm:text-sm uppercase px-5 py-3 gap-2',
      lg: 'text-sm sm:text-base uppercase px-7 py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
