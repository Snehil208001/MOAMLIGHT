import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Sparkles, Flame, Leaf, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moamlight.in').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Our Artisan Manifesto',
  description:
    'Discover MOAMLIGHT’s commitment to 100% botanical soy wax, slow-burning artisanal craft, Indian aromatherapy sanctuaries, and sustainable zero-plastic luxury.',
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: 'Our Artisan Manifesto | MOAMLIGHT Luxury Scented Candles',
    description:
      'Restoring candles to their sacred botanical origins. Handcrafted with 100% botanical soy wax in micro-batches in Bengaluru, India.',
    url: `${siteUrl}/about`,
    type: 'website',
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Our Artisan Manifesto',
        item: `${siteUrl}/about`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="bg-warm-linen min-h-screen py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Hero Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 text-terracotta text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OUR ARTISAN MANIFESTO</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl font-medium text-charcoal leading-tight">
              Restoring Candles to Their Sacred Botanical Origins.
            </h1>
            <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed font-sans">
              In ancient India, the kindling of a flame was never an industrial transaction—it was a mindful sanctuary ritual. MOAMLIGHT was founded in Bengaluru with a single conviction: to craft slow-burning, 100% botanical soy candles free of petroleum crude and synthetic shortcuts.
            </p>
          </div>

          {/* Atmospheric Visual Split */}
          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] shadow-warm border border-warm-border bg-warm-cream">
            <img
              src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1600&q=85"
              alt="MOAMLIGHT Handcrafted Soy Candle Atelier"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent flex items-end p-8 sm:p-12">
              <p className="font-serif text-2xl sm:text-3xl text-warm-linen font-medium italic max-w-xl">
                &quot;Light is not merely illumination—it is the atmosphere in which your thoughts take breath.&quot;
              </p>
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-serif text-3xl font-medium text-charcoal">
                The Four MOAM Pillars
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
                Every candle we pour adheres uncompromisingly to these standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-warm-cream/40 border border-warm-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-warm-linen flex items-center justify-center text-terracotta border border-warm-border">
                  <Leaf className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  1. 100% Botanical Golden Soy Wax
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans">
                  Paraffin wax is an industrial petroleum crude byproduct that produces black soot and allergic reactions. We use exclusively golden, slow-burning soy wax that is biodegradable, renewably sourced, and burns cool and clean for 55+ to 80+ hours.
                </p>
              </div>

              <div className="bg-warm-cream/40 border border-warm-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-warm-linen flex items-center justify-center text-terracotta border border-warm-border">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  2. Evocative Indian Olfactive Notes
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans">
                  We celebrate genuine Indian botanical heritage: aged Mysore temple sandalwood roots, hand-plucked Pampore Kashmiri saffron, Kannauj Mitti Attar (the scent of monsoon rain on parched soil), Madurai night-blooming mogra, and Malabar Ceylon cinnamon bark.
                </p>
              </div>

              <div className="bg-warm-cream/40 border border-warm-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-warm-linen flex items-center justify-center text-terracotta border border-warm-border">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  3. Lead-Free Dual Cotton Wicks
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans">
                  Many mass-market candles insert lead or zinc wire cores into their wicks to keep them rigid. We use only 100% unbleached Egyptian cotton braided wicks that burn with an even, whisper-silent flame and zero toxic heavy metals.
                </p>
              </div>

              <div className="bg-warm-cream/40 border border-warm-border rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-warm-linen flex items-center justify-center text-terracotta border border-warm-border">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-charcoal">
                  4. Heirloom Reusability & Zero Plastic
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans">
                  Our vessels—from fluted amber jars to charcoal stoneware—are designed to outlive the wax. When your burn is finished, wash with warm water and use as planters, tea lights, or desk holders. Our packaging is 100% biodegradable Kraft paper and plantable seed tags.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-charcoal text-warm-linen rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <h3 className="font-serif text-3xl sm:text-4xl font-medium">
              Ready to Kindle Your First Sanctuary?
            </h3>
            <p className="text-sm text-warm-linen/80 max-w-lg mx-auto font-sans">
              Every candle comes with our 100% safe transit guarantee and complimentary handwritten gifting note.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/products">
                <Button variant="terracotta" size="lg" className="gap-2">
                  <span>Explore The 6 Scents</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline" size="lg" className="text-warm-linen border-warm-linen/30 hover:bg-warm-linen/10">
                  Take the Scent Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
