'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { FreeShippingBar } from './FreeShippingBar';
import { CartItemRow } from './CartItemRow';
import { PromoCodeInput } from './PromoCodeInput';
import { GiftOptionToggle } from './GiftOptionToggle';
import { formatINR } from '@/lib/formatters';
import { X, ShoppingBag, ShieldCheck, Banknote, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CartDrawer: React.FC = () => {
  const {
    isOpen,
    closeCart,
    items,
    totalItemsCount,
    subtotal,
    discountTotal,
    shippingFee,
    finalTotal,
    isSyncing,
    redirectToCheckout,
  } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-screen lg:w-[420px] bg-white/80 backdrop-blur-[20px] shadow-2xl flex flex-col h-full z-10 border-l border-warm-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-border/40 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-terracotta" />
                <h2 className="font-serif text-lg font-semibold tracking-wide text-charcoal">
                  YOUR SHOPPING BAG {totalItemsCount > 0 && `(${totalItemsCount})`}
                </h2>
                {isSyncing && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-terracotta bg-warm-cream px-2 py-0.5 rounded-full border border-warm-border">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Syncing</span>
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-warm-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Tracker */}
            <FreeShippingBar />

            {/* Drawer Body */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-warm-cream flex items-center justify-center text-terracotta mb-4 border border-warm-border">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                  Your Sanctuary is Empty
                </h3>
                <p className="text-sm text-charcoal-muted max-w-xs mb-6">
                  Fill your home with the calming aroma of slow-crafted Indian botanicals and pure golden soy wax.
                </p>
                <Link href="/products" onClick={closeCart}>
                  <Button variant="terracotta" size="md">
                    Explore Collection
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 divide-y divide-warm-border/60">
                {/* Items List */}
                <div className="py-2">
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>

                {/* Gifting Add-On */}
                <div className="py-4">
                  <GiftOptionToggle />
                </div>

                {/* Promo Code Engine */}
                <div className="py-4">
                  <PromoCodeInput />
                </div>

                {/* Trust Badges */}
                <div className="py-4 grid grid-cols-2 gap-2 text-[11px] text-charcoal-muted">
                  <div className="flex items-center gap-1.5 p-2 bg-warm-cream/50 rounded-lg border border-warm-border/60">
                    <Banknote className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Cash on Delivery (COD) Available</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-warm-cream/50 rounded-lg border border-warm-border/60">
                    <ShieldCheck className="w-4 h-4 text-sage shrink-0" />
                    <span>100% Safe Transit Guarantee</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-warm-border bg-warm-cream/40 shrink-0 space-y-4">
                <div className="space-y-1.5 text-xs text-charcoal-muted">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-charcoal">{formatINR(subtotal)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-terracotta font-medium">
                      <span>Promo Discount</span>
                      <span>-{formatINR(discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="font-semibold text-sage-dark uppercase tracking-wider">FREE</span>
                      ) : (
                        formatINR(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-warm-border font-serif text-lg font-semibold text-charcoal">
                    <span>Total Amount</span>
                    <span className="text-terracotta">{formatINR(finalTotal)}</span>
                  </div>
                  <p className="text-[10px] text-charcoal-muted/70 text-right">
                    Inclusive of ₹{Math.round(finalTotal * 0.18)} GST • Free returns if broken in transit
                  </p>
                </div>

                <Button
                  variant="terracotta"
                  size="lg"
                  disabled={isSyncing}
                  onClick={async () => {
                    if (redirectToCheckout) {
                      await redirectToCheckout();
                    }
                  }}
                  className="w-full flex items-center justify-between px-6 py-4 cursor-pointer disabled:opacity-75"
                >
                  <div className="flex items-center gap-2">
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-warm-linen" />
                        <span>Connecting to Checkout...</span>
                      </>
                    ) : (
                      <span>Proceed to Checkout</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatINR(finalTotal)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
