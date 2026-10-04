'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types/product';
import { formatINR } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import {
  Compass,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  ShoppingBag,
  Mail,
  Loader2,
  Lock,
  Gift,
} from 'lucide-react';
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

/**
 * Mock Klaviyo / Mailchimp lead synchronization service.
 * Respects security rules: uses process.env placeholders and mock delay.
 */
async function mockKlaviyoLeadCapture(email: string, quizProfile: string): Promise<boolean> {
  // Simulating async network roundtrip to CRM endpoint
  // Delay removed to unblock UI
  if (process.env.NODE_ENV === 'development') {
    console.info(`[Klaviyo Lead Captured] Email: ${email} | Scent Profile: ${quizProfile}`);
  }
  return true;
}

export function ScentQuizClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);

  // Lead capture state
  const [isLeadGateActive, setIsLeadGateActive] = useState<boolean>(false);
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadError, setLeadError] = useState<string>('');
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [hasUnlockedDiscount, setHasUnlockedDiscount] = useState<boolean>(false);

  const { addItem, openCart, applyCoupon } = useCart();
  const { showToast } = useToast();

  const handleSelectOption = (productSlug: string) => {
    const updated = [...answers, productSlug];
    setAnswers(updated);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calculate top scent match
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

      // Intercept results with lead capture gate screen
      setIsLeadGateActive(true);
      setCurrentStep(QUESTIONS.length);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadEmail.trim())) {
      setLeadError('Please provide a valid email address to unlock your match.');
      return;
    }

    setLeadError('');
    setIsSubmittingLead(true);

    try {
      await mockKlaviyoLeadCapture(leadEmail.trim(), matchedProduct?.category || 'Atelier Scent');
      
      // Auto-apply the 10% coupon directly to the cart context
      applyCoupon('MOAM10');
      setHasUnlockedDiscount(true);

      showToast({
        title: '10% Welcome Gift Unlocked!',
        message: 'Coupon code MOAM10 has been automatically applied to your sanctuary bag.',
        actionLabel: 'View Bag',
        onAction: () => openCart(),
      });

      // Smoothly dismiss lead gate and reveal match
      setIsLeadGateActive(false);
    } catch (err) {
      setLeadError('Unable to connect to lead service. Please try again or skip.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleSkipLead = () => {
    // Subtle skip allows user to view their results unconditionally
    setIsLeadGateActive(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setMatchedProduct(null);
    setIsLeadGateActive(false);
    setLeadEmail('');
    setLeadError('');
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
      title: 'Added Match to Sanctuary Bag',
      message: `${matchedProduct.title} (240g)`,
      image: matchedProduct.images[0],
      actionLabel: 'View Bag',
      onAction: () => openCart(),
    });

    openCart();
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

        {/* Progress Bar (Visible during questions) */}
        {currentStep < QUESTIONS.length && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-charcoal-muted mb-2 font-medium">
              <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-warm-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-terracotta"
                initial={{ width: `${(currentStep / QUESTIONS.length) * 100}%` }}
                animate={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Multi-Step Engine */}
        <AnimatePresence mode="wait">
          {currentStep < QUESTIONS.length ? (
            /* ============================================================= */
            /* 1. QUESTIONS VIEW                                            */
            /* ============================================================= */
            <motion.div
              key={`question-${currentStep}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
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
                    className="w-full text-left p-4 rounded-xl border border-warm-border bg-warm-linen hover:border-terracotta hover:bg-warm-cream/60 transition-all duration-200 group flex items-start justify-between gap-4 cursor-pointer"
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
          ) : isLeadGateActive ? (
            /* ============================================================= */
            /* 2. THE MONETIZATION LEAD CAPTURE GATE (Agent 1 & Agent 3)    */
            /* ============================================================= */
            <motion.div
              key="lead-gate"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              className="relative overflow-hidden bg-gradient-to-b from-warm-cream to-warm-linen border border-amber/30 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6"
            >
              {/* Luxury Accent Glow Ring */}
              <div
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(255,140,0,0.4) 0%, transparent 70%)' }}
              />

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber/15 border border-amber/30 text-amber-900 text-xs font-semibold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5 text-amber-700" />
                <span>10% First Order Welcome Gift</span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal leading-tight">
                  Your signature scent has been discovered.
                </h2>
                <p className="text-sm sm:text-base text-charcoal-muted max-w-lg mx-auto font-sans leading-relaxed">
                  Enter your email to reveal your match and unlock 10% off your first order.
                </p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleLeadSubmit} className="max-w-md mx-auto space-y-3 pt-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-warm-border bg-white text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber transition-all shadow-inner"
                  />
                </div>

                {leadError && (
                  <p className="text-xs text-terracotta text-left font-medium animate-fade-in">
                    {leadError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmittingLead}
                  variant="terracotta"
                  size="lg"
                  className="w-full gap-2 text-sm uppercase tracking-wider shadow-warm"
                >
                  {isSubmittingLead ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-warm-linen" />
                      <span>Unlocking Your Match...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-gold fill-amber-gold" />
                      <span>Reveal My Match & Unlock 10% Off</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Trust Footnote & Subtle Skip Option */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-muted">
                  <Lock className="w-3 h-3 text-sage-dark" />
                  <span>No spam. Pure olfactory inspiration and private archival launches.</span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleSkipLead}
                    className="text-xs text-charcoal-muted/70 hover:text-charcoal transition-colors underline underline-offset-4 decoration-warm-border hover:decoration-charcoal"
                  >
                    Skip to my results →
                  </button>
                </div>
              </div>
            </motion.div>
          ) : matchedProduct ? (
            /* ============================================================= */
            /* 3. REVEALED RESULTS SCREEN                                   */
            /* ============================================================= */
            <motion.div
              key="quiz-results"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              className="bg-warm-cream/50 border border-warm-border rounded-3xl p-6 sm:p-10 shadow-warm text-center space-y-6"
            >
              {/* 10% Coupon Welcome Banner if email was submitted */}
              {hasUnlockedDiscount && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-gradient-to-r from-amber-50 via-warm-cream to-amber-50 border border-amber/40 rounded-xl inline-flex items-center gap-2 text-xs font-semibold text-amber-900 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber" />
                  <span>✦ 10% OFF APPLIED: Code <strong>MOAM10</strong> is active for your order! ✦</span>
                </motion.div>
              )}

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
                {matchedProduct.scentPyramid.topNotes
                  .concat(matchedProduct.scentPyramid.heartNotes)
                  .slice(0, 4)
                  .map((n) => (
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-muted hover:text-charcoal transition-colors cursor-pointer"
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

