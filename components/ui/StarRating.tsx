import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // e.g. 4.9
  reviewsCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewsCount,
  size = 'sm',
  showCount = true,
  className,
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5 text-amber-gold">
        {[...Array(5)].map((_, i) => {
          const isFilled = i < fullStars;
          const isHalf = i === fullStars && hasHalfStar;

          return (
            <div key={i} className="relative">
              <Star
                className={cn(
                  iconSize,
                  isFilled ? 'fill-amber-gold text-amber-gold' : 'text-warm-border fill-warm-cream'
                )}
              />
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className={cn(iconSize, 'fill-amber-gold text-amber-gold')} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCount && (
        <span className="text-xs font-medium text-charcoal-muted tracking-tight">
          <span className="font-semibold text-charcoal">{rating.toFixed(1)}</span>
          {reviewsCount !== undefined && ` (${reviewsCount})`}
        </span>
      )}
    </div>
  );
};
