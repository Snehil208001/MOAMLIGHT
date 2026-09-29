import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'terracotta' | 'sage' | 'amber' | 'neutral' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  children,
  ...props
}) => {
  const variants = {
    terracotta: 'bg-terracotta/10 text-terracotta border-terracotta/20',
    sage: 'bg-sage-light text-sage-dark border-sage/20',
    amber: 'bg-amber-gold/15 text-amber-gold-dark border-amber-gold/30',
    neutral: 'bg-warm-cream text-charcoal border-warm-border',
    outline: 'bg-transparent text-charcoal-muted border-warm-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
