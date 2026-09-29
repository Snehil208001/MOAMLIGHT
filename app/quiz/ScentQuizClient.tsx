'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types/product';
import { formatINR } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Compass, Sparkles, ArrowRight, RotateCcw, Check, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    categoryMatch: string;
    productSlug?: string;
  }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Where is your primary sanctuary space?',
    subtitle: 'Choose the room where you spend your most mindful hours.',
    options: [
      {
        label: 'The Reading Study & Work Desk',
        description: 'Need crisp clarity, fresh tea aromas, and daytime focus.',
        categoryMatch: 'Fresh & Earthy',
        productSlug: 'darjeeling-tea-bergamot',
      },
      {
        label: 'The Living Room & Hosting Lounge',
        description: 'Warm, regal, and impressive for intimate family evenings.',
        categoryMatch: 'Woody & Meditative',
        productSlug: 'kashmir-saffron-oudh',
      },
      {
        label: 'The Bedside & Twilight Meditation Corner',
        description: 'Grounding woods, meditative ambers, and deep quietude.',
        categoryMatch: 'Woody & Meditative',
        productSlug: 'mysore-sandalwood-amber',
      },
      {
        label: 'The Cozy Dining & Tea Corner',
        description: 'Sweet spiced bakeries, monsoon nostalgia, and kitchen comfort.',
        categoryMatch: 'Spiced & Gourmand',
        productSlug: 'malabar-vanilla-cinnamon',
      },
    ],
  },
  {
    id: 2,
    question: 'What time of day do you kindle your flame?',
    subtitle: 'Candlelight interacts differently with daylight and twilight.',
    options: [
      {
        label: 'Misty Early Morning (6 AM – 9 AM)',
        description: 'To awaken senses alongside morning tea or coffee.',
        categoryMatch: 'Fresh & Earthy',
        productSlug: 'darjeeling-tea-bergamot',
      },
      {
        label: 'Late Afternoon Rainy Hours',
        description: 'When rain taps the windows and earth aromas rise.',
        categoryMatch: 'Fresh & Earthy',
        productSlug: 'monsoon-petrichor-vetiver',
      },
      {
        label: 'Twilight & Sunset Unwinding (6 PM – 8 PM)',
        description: 'Transitioning from the workday into serene personal peace.',
        categoryMatch: 'Woody & Meditative',
        productSlug: 'mysore-sandalwood-amber',
      },
      {
        label: 'Nocturnal Celebrations & Dinners (9 PM+)',
        description: 'Intoxicating night florals and festive candlelight.',
        categoryMatch: 'Floral & Nocturnal',
        productSlug: 'mogra-star-jasmine',
      },
    ],
  },
  {
    id: 3,
    question: 'Which Indian olfactory memory brings you greatest peace?',
    subtitle: 'Scent is the most powerful emotional key to memory.',
    options: [
      {
        label: 'The first drops of rain on sun-baked soil (Mitti Attar)',
        description: 'Parched red clay meeting thunderous monsoon drops.',
        categoryMatch: 'Fresh & Earthy',
        productSlug: 'monsoon-petrichor-vetiver',
      },
      {
        label: 'Ancient temple sanctum of Mysore sandalwood & incense',
        description: 'Carved wood, warm oil lamps, and sacred calm.',
        categoryMatch: 'Woody & Meditative',
        productSlug: 'mysore-sandalwood-amber',
      },
      {
        label: 'Freshly garlanded Madurai mogra blossoms at nightfall',
        description: 'Sweet dew-kissed jasmine woven for Indian celebrations.',
        categoryMatch: 'Floral & Nocturnal',
        productSlug: 'mogra-star-jasmine',
      },
      {
        label: 'Heirloom roasted cinnamon and vanilla on the Malabar coast',
        description: 'Warming spiced chai, cardamom pods, and comfort.',
        categoryMatch: 'Spiced & Gourmand',
        productSlug: 'malabar-vanilla-cinnamon',
      },
    ],
  },
];

export function ScentQuizClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);

  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  const handleSelectOption = (productSlug: string) => {
    const updated = [...answers, productSlug];
    setAnswers(updated);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Tally winner
      const counts: Record<string, number> = {};
      updated.forEach((slug) => {
        counts[slug] = (counts[slug] || 0) + 1;
      });

      let topSlug = updated[updated.length - 1];
      let maxCount = 0;
      Object.entries(counts).forEach(([slug, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topSlug = slug;
        }
      });

      const match = PRODUCTS.find((p) => p.slug === topSlug) || PRODUCTS[0];
      setMatchedProduct(match);
      setCurrentStep(QUESTIONS.length);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setMatchedProduct(null);
  };

  const handleAddToCart = () => {
    if (!matchedProduct) return;
    const variant = matchedProduct.variants[0];

    addItem(
      {
        productId: matchedProduct.id,
        title: matchedProduct.title,
        scentProfile: matchedProduct.category,
        variantId: variant.id,
        variantName: variant.name,
        price: variant.price,
        mrp: variant.mrp,
        image: matchedProduct.images[0],
        weightGrams: variant.weightGrams,
      },
      1
    );

    showToast({
      title: 'Added Match to Bag',
      message: `${matchedProduct.title} (240g)`,
      image: matchedProduct.images[0],
      actionLabel: 'View Bag',
      onAction: () => openCart(),
    });
  };

  return (
    <div className="bg-warm-linen min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-terracotta text-xs font-semibold uppercase tracking-widest mb-2">
            <Compass className="w-4 h-4" />
            <span>THE 60-SECOND SCENT FINDER</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-charcoal">
            Find Your Scent Soulmate
          </h1>
          <p className="mt-2 text-sm text-charcoal-muted">
            Tell us about your rituals and uncover the signature candle crafted for your space.
          </p>
        </div>

        {/* Progress Bar */}
        {currentStep < QUESTIONS.length && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-charcoal-muted mb-2 font-medium">
              <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-warm-border rounded-full overflow-hidden">
              <div
                className="h-full bg-terracotta transition-all duration-300"
                style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quiz Steps */}
        <AnimatePresence mode="wait">
          {currentStep < QUESTIONS.length ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-warm-cream/40 border border-warm-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
                  {QUESTIONS[currentStep].question}
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-muted mt-1 font-sans">
                  {QUESTIONS[currentStep].subtitle}
                </p>
              </div>

              <div className="space-y-3">
                {QUESTIONS[currentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.productSlug || 'mysore-sandalwood-amber')}
                    className="w-full text-left p-4 rounded-xl border border-warm-border bg-warm-linen hover:border-terracotta hover:bg-warm-cream/60 transition-all duration-200 group flex items-start justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-serif text-base font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                        {opt.label}
                      </h3>
                      <p className="text-xs text-charcoal-muted mt-1">
                        {opt.description}
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-warm-border flex items-center justify-center text-warm-linen group-hover:border-terracotta group-hover:bg-terracotta transition-colors shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : matchedProduct ? (
            /* Results Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-warm-cream/50 border border-warm-border rounded-3xl p-6 sm:p-10 shadow-warm text-center space-y-6"
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sage-light text-sage-dark text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Ideal Olfactory Match</span>
              </div>

              <div className="max-w-md mx-auto aspect-[4/5] rounded-2xl overflow-hidden border border-warm-border bg-warm-linen shadow-md">
                <img
                  src={matchedProduct.images[0]}
                  alt={matchedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-terracotta uppercase tracking-wider">
                  {matchedProduct.category} • {matchedProduct.intensity} Throw
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mt-1">
                  {matchedProduct.title}
                </h2>
                <p className="text-sm text-charcoal-muted mt-2 max-w-lg mx-auto font-sans leading-relaxed">
                  {matchedProduct.story}
                </p>
              </div>

              {/* Scent notes pills */}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {matchedProduct.scentPyramid.topNotes.concat(matchedProduct.scentPyramid.heartNotes).slice(0, 4).map((n) => (
                  <span
                    key={n}
                    className="px-3 py-1 bg-warm-linen border border-warm-border rounded-full text-xs font-medium text-charcoal"
                  >
                    {n}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  onClick={handleAddToCart}
                  variant="terracotta"
                  size="lg"
                  className="w-full sm:w-auto gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag • {formatINR(matchedProduct.defaultPrice)}</span>
                </Button>

                <Link href={`/products/${matchedProduct.slug}`} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                    <span>Explore PDP & Rituals</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t border-warm-border">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-muted hover:text-charcoal transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Scent Quiz</span>
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default ScentQuizClient;
