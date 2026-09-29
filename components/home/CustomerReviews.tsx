'use client';

import React, { useState } from 'react';
import { StarRating } from '@/components/ui/StarRating';
import { CheckCircle2, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  city: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Ananya Sharma',
    city: 'Indiranagar, Bengaluru',
    product: 'Mysore Sandalwood & Amber',
    rating: 5,
    comment: 'Most store-bought sandalwood candles smell like synthetic soap, but this is pure, divine temple santal. The amber glass casts the warmest glow across our reading room.',
    date: 'Verified Purchase • 2 weeks ago',
  },
  {
    id: 'rev-2',
    author: 'Rohan Mehra',
    city: 'Bandra West, Mumbai',
    product: 'Monsoon Petrichor & Vetiver',
    rating: 5,
    comment: 'Unbelievably accurate baked earth Mitti aroma. Lit this during a thunderstorm in Mumbai and it genuinely felt sacred. Zero headaches even after burning for 4 hours.',
    date: 'Verified Purchase • 1 month ago',
  },
  {
    id: 'rev-3',
    author: 'Dr. Priya V.',
    city: 'Vasant Vihar, New Delhi',
    product: 'Kashmir Saffron & Oudh',
    rating: 5,
    comment: 'The throw on this saffron oudh is breathtaking. My living area smells like an opulent heritage haveli. Packaging was 100% plastic-free with basil seed paper.',
    date: 'Verified Purchase • 3 weeks ago',
  },
  {
    id: 'rev-4',
    author: 'Vikramaditya C.',
    city: 'Koregaon Park, Pune',
    product: 'Madurai Mogra & Star Jasmine',
    rating: 5,
    comment: 'Reminds me of nocturnal summer jasmine garlands in South India. Not cloying, perfectly balanced with crisp green ivy. MOAMLIGHT is my go-to gifting atelier now.',
    date: 'Verified Purchase • 1 week ago',
  },
];

export const CustomerReviews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 border-b border-[var(--border-daynight)] bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-amber text-xs font-semibold uppercase tracking-widest mb-2">
              <Quote className="w-4 h-4" />
              <span>THE MOAMLIGHT COMMUNITY</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium">
              Sanctuaries We Have Lit
            </h2>
            <p className="mt-2 text-sm max-w-xl text-[var(--text-muted-daynight)]">
              Authentic reviews from verified homes across Bengaluru, Mumbai, Delhi NCR, Chennai, and Pune.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-6 md:mt-0">
            <button
              onClick={prevReview}
              className="p-2.5 rounded-full border border-[var(--border-daynight)] hover:border-amber transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextReview}
              className="p-2.5 rounded-full border border-[var(--border-daynight)] hover:border-amber transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel / Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, index) => {
            const isFeatured = index === currentIndex;
            return (
              <div
                key={review.id}
                className={`rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 ${
                  isFeatured ? 'border-amber/50 shadow-amber-glow-card scale-[1.02]' : 'border-[var(--border-daynight)]'
                }`}
                style={{
                  backgroundColor: 'var(--card-bg-daynight)',
                  color: 'var(--text-daynight)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StarRating rating={review.rating} showCount={false} />
                    <span className="text-[11px] text-amber font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>

                  <p className="font-serif text-base italic leading-relaxed mb-4">
                    &quot;{review.comment}&quot;
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-daynight)]">
                  <p className="font-semibold text-xs">{review.author}</p>
                  <p className="text-[11px] text-[var(--text-muted-daynight)]">{review.city}</p>
                  <p className="text-[11px] font-medium text-amber mt-1 truncate">
                    {review.product}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
