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
import { EngravingStudioSelector } from '@/components/product/EngravingStudioSelector';
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
  Check,
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
  const [addToCartStatus, setAddToCartStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // 3D Atelier & Bespoke Engraving State
  const [isEngravingEnabled, setIsEngravingEnabled] = useState<boolean>(false);
  const [engravingText, setEngravingText] = useState<string>('');
  const [engravingFont, setEngravingFont] = useState<string>('serif');
  const [galleryViewMode, setGalleryViewMode] = useState<'photo' | '3d'>('photo');

  // Bespoke Engraving Add-On Fee (+$10 USD / ₹850 INR)
  const ENGRAVING_FEE = 850;
  const effectiveUnitPrice = selectedVariant.price + (isEngravingEnabled ? ENGRAVING_FEE : 0);
  const effectiveTotalPrice = effectiveUnitPrice * quantity;

  const discount = calculateDiscount(selectedVariant.mrp, selectedVariant.price);

  // Match wax tint dynamically to artisanal Indian botanical note
  const waxColor = React.useMemo(() => {
    const cat = (product.category + ' ' + product.title).toLowerCase();
    if (cat.includes('sandalwood') || cat.includes('oudh')) return '#FAF0DD';
    if (cat.includes('saffron')) return '#FDEED9';
    if (cat.includes('mitti') || cat.includes('vetiver')) return '#F7ECE1';
    if (cat.includes('mogra') || cat.includes('jasmine')) return '#FFFDF8';
    return '#FFFDF8';
  }, [product.category, product.title]);

  const activeEngravingText = isEngravingEnabled && engravingText.trim() ? engravingText.trim() : undefined;
  const activeEngravingFont = activeEngravingText
    ? (engravingFont === 'script' ? 'Poetic Script' : engravingFont === 'sans' ? 'Modern Sans' : 'Royal Atelier Serif')
    : undefined;

  const handleAddToCart = async () => {
    if (addToCartStatus !== 'idle') return;

    setAddToCartStatus('loading');

    // Tactile micro-delay for smooth UX feedback
    await new Promise((resolve) => setTimeout(resolve, 380));

    addItem(
      {
        productId: product.id,
        title: product.title,
        scentProfile: product.category,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        price: effectiveUnitPrice,
        mrp: selectedVariant.mrp + (isEngravingEnabled ? ENGRAVING_FEE : 0),
        image: product.images[0],
        weightGrams: selectedVariant.weightGrams,
        engravingText: activeEngravingText,
        engravingFont: activeEngravingFont,
      },
      quantity
    );

    setAddToCartStatus('success');

    showToast({
      title: 'Added to Sanctuary Bag',
      message: `${quantity} × ${product.title} (${selectedVariant.name})${activeEngravingText ? ` · Engraved: "${activeEngravingText}"` : ''}`,
      image: product.images[0],
      actionLabel: 'View Bag',
      onAction: () => openCart(),
    });

    // Immediately slide open the Cart Drawer as required in Task 4!
    openCart();

    // Auto revert micro-interaction button state back to idle
    setTimeout(() => {
      setAddToCartStatus('idle');
    }, 1500);
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
          price: effectiveUnitPrice,
          mrp: selectedVariant.mrp + (isEngravingEnabled ? ENGRAVING_FEE : 0),
          image: product.images[0],
          weightGrams: selectedVariant.weightGrams,
          engravingText: activeEngravingText,
          engravingFont: activeEngravingFont,
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
        engravingText={activeEngravingText}
        engravingFont={activeEngravingFont}
        customPrice={effectiveUnitPrice}
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
          {/* Gallery with 3D Studio Toggle (7 cols on desktop) */}
          <div className="lg:col-span-7">
            <ImageGallery
              images={product.images}
              title={product.title}
              viewMode={galleryViewMode}
              onViewModeChange={setGalleryViewMode}
              engravingText={isEngravingEnabled ? engravingText : ''}
              engravingFont={engravingFont}
              waxColor={waxColor}
            />
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
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-serif text-3xl font-bold text-charcoal">
                  {formatINR(effectiveUnitPrice)}
                </span>
                <span className="text-sm text-charcoal-muted line-through">
                  {formatINR(selectedVariant.mrp + (isEngravingEnabled ? ENGRAVING_FEE : 0))}
                </span>
                {discount > 0 && (
                  <Badge variant="amber">
                    Save {discount}% ({formatINR(selectedVariant.mrp - selectedVariant.price)})
                  </Badge>
                )}
                {isEngravingEnabled && (
                  <span className="text-[11px] font-semibold text-amber-900 bg-amber/20 px-2 py-0.5 rounded-full border border-amber/30">
                    Includes ₹850 ($10) Bespoke Engraving
                  </span>
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

            {/* Bespoke Real-Time 3D Engraving Studio */}
            <EngravingStudioSelector
              isEngravingEnabled={isEngravingEnabled}
              onToggleEngraving={(enabled) => {
                setIsEngravingEnabled(enabled);
                if (enabled) {
                  setGalleryViewMode('3d');
                }
              }}
              engravingText={engravingText}
              onTextChange={setEngravingText}
              engravingFont={engravingFont}
              onFontChange={setEngravingFont}
              onPreview3D={() => setGalleryViewMode('3d')}
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
                  disabled={addToCartStatus !== 'idle'}
                  variant="terracotta"
                  size="lg"
                  className="flex-1 gap-2 transition-all duration-300 relative overflow-hidden"
                >
                  {addToCartStatus === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-warm-linen" />
                      <span>Adding to Sanctuary...</span>
                    </>
                  ) : addToCartStatus === 'success' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                      <span className="font-semibold text-white tracking-wide">Added ✓</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag • {formatINR(effectiveTotalPrice)}</span>
                    </>
                  )}
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
