'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatINR, calculateDiscount } from '@/lib/formatters';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ImageGallery } from '@/components/product/ImageGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { PincodeEstimator } from '@/components/product/PincodeEstimator';
import { ScentPyramidCard } from '@/components/product/ScentPyramidCard';
import { SpecsGrid } from '@/components/product/SpecsGrid';
import { CandleRitualsAccordion } from '@/components/product/CandleRitualsAccordion';
import { StickyMobileCartBar } from '@/components/product/StickyMobileCartBar';
import { CrossSellSection } from '@/components/product/CrossSellSection';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  Banknote,
  Minus,
  Plus,
  ChevronRight,
  HeartHandshake,
  Loader2,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem, openCart, redirectToCheckout } = useCart();
  const { showToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);

  const discount = calculateDiscount(selectedVariant.mrp, selectedVariant.price);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        title: product.title,
        scentProfile: product.category,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        mrp: selectedVariant.mrp,
        image: product.images[0],
        weightGrams: selectedVariant.weightGrams,
      },
      quantity
    );

    showToast({
      title: 'Added to Sanctuary Bag',
      message: `${quantity} × ${product.title} (${selectedVariant.name})`,
      image: product.images[0],
      actionLabel: 'View Bag',
      onAction: () => openCart(),
    });
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      addItem(
        {
          productId: product.id,
          title: product.title,
          scentProfile: product.category,
          variantId: selectedVariant.id,
          variantName: selectedVariant.name,
          price: selectedVariant.price,
          mrp: selectedVariant.mrp,
          image: product.images[0],
          weightGrams: selectedVariant.weightGrams,
        },
        quantity
      );

      if (redirectToCheckout) {
        await redirectToCheckout();
      } else {
        router.push('/checkout');
      }
    } catch (err) {
      console.error('Failed express checkout redirect:', err);
      router.push('/checkout');
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="bg-warm-linen min-h-screen py-8">
      {/* Sticky Mobile Bar */}
      <StickyMobileCartBar
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-charcoal-muted uppercase tracking-wider mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-charcoal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-warm-border" />
          <Link href="/products" className="hover:text-charcoal transition-colors">
            Candles
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-warm-border" />
          <span className="text-terracotta font-medium truncate">{product.title}</span>
        </nav>

        {/* Top Section: Gallery + Product Action Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Gallery (7 cols on desktop) */}
          <div className="lg:col-span-7">
            <ImageGallery images={product.images} title={product.title} />
          </div>

          {/* Product Purchase Column (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="terracotta">{product.category}</Badge>
                <Badge variant="sage">{product.intensity} Throw</Badge>
                {product.bestseller && <Badge variant="amber">Bestseller</Badge>}
              </div>

              {/* Title & Tagline */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-charcoal leading-tight">
                {product.title}
              </h1>
              <p className="mt-2 text-sm text-charcoal-muted leading-relaxed font-sans">
                {product.tagline}
              </p>

              {/* Star Rating */}
              <div className="mt-3">
                <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />
              </div>
            </div>

            {/* Price Row */}
            <div className="p-4 rounded-xl bg-warm-cream/50 border border-warm-border space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-charcoal">
                  {formatINR(selectedVariant.price)}
                </span>
                <span className="text-sm text-charcoal-muted line-through">
                  {formatINR(selectedVariant.mrp)}
                </span>
                {discount > 0 && (
                  <Badge variant="amber">
                    Save {discount}% ({formatINR(selectedVariant.mrp - selectedVariant.price)})
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-charcoal-muted">
                Inclusive of all Indian taxes (GST). Free shipping applied on orders above ₹999.
              </p>
            </div>

            {/* Variant Selector */}
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />

            {/* Quantity Stepper & Add To Cart CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-warm-border rounded-xl bg-warm-linen p-1">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-charcoal-muted hover:text-charcoal hover:bg-warm-cream rounded-lg transition-colors disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-charcoal">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="p-2 text-charcoal-muted hover:text-charcoal hover:bg-warm-cream rounded-lg transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  variant="terracotta"
                  size="lg"
                  className="flex-1 gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag • {formatINR(selectedVariant.price * quantity)}</span>
                </Button>
              </div>

              {/* Express Checkout */}
              <Button
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                variant="charcoal"
                size="lg"
                className="w-full gap-2 cursor-pointer disabled:opacity-75"
              >
                {isBuyingNow ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-warm-linen" />
                    <span>Preparing Express Checkout...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-gold fill-amber-gold" />
                    <span>Buy Now (Express Checkout)</span>
                  </>
                )}
              </Button>
            </div>

            {/* Indian Trust Highlights */}
            <div className="grid grid-cols-2 gap-2 text-xs text-charcoal-muted pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warm-cream/30 border border-warm-border">
                <Banknote className="w-4 h-4 text-terracotta shrink-0" />
                <span>Cash on Delivery (COD)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warm-cream/30 border border-warm-border">
                <Truck className="w-4 h-4 text-sage-dark shrink-0" />
                <span>Free Express Shipping ₹999+</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warm-cream/30 border border-warm-border">
                <ShieldCheck className="w-4 h-4 text-terracotta shrink-0" />
                <span>Dispatched within 24h</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warm-cream/30 border border-warm-border">
                <HeartHandshake className="w-4 h-4 text-sage-dark shrink-0" />
                <span>100% Transit Protection</span>
              </div>
            </div>

            {/* Pincode Estimator */}
            <PincodeEstimator />
          </div>
        </div>

        {/* Narrative & In-Depth Specifications */}
        <div className="mt-20 pt-16 border-t border-warm-border grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Scent Pyramid & Specs */}
          <div className="lg:col-span-6 space-y-8">
            <ScentPyramidCard scentPyramid={product.scentPyramid} />
            <SpecsGrid specs={product.specs} />
          </div>

          {/* Right Column: Scent Story & Candle Rituals */}
          <div className="lg:col-span-6 space-y-8">
            {/* The Scent Story */}
            <div className="bg-warm-linen border border-warm-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="text-terracotta text-xs font-semibold uppercase tracking-widest">
                HERITAGE BOTANICAL INSPIRATION
              </div>
              <h3 className="font-serif text-2xl font-semibold text-charcoal">
                The Scent Story
              </h3>
              <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
                {product.story.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
              </p>
            </div>

            <CandleRitualsAccordion guide={product.ritualGuide} />
          </div>
        </div>

        {/* Verified Customer Reviews Section */}
        <div className="mt-20 pt-16 border-t border-warm-border">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-serif text-3xl font-semibold text-charcoal">
              Sanctuary Testimonials
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Verified experiences for {product.title}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-warm-linen border border-warm-border rounded-2xl p-6 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StarRating rating={rev.rating} showCount={false} />
                    <span className="text-[11px] text-terracotta font-medium">
                      Verified Buyer
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-semibold text-charcoal mb-1">
                    {rev.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-warm-border text-xs text-charcoal-muted flex justify-between items-center">
                  <span className="font-medium text-charcoal">{rev.author}, {rev.city}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Sell Recommendations */}
        <CrossSellSection currentProduct={product} />
      </div>
    </div>
  );
}
