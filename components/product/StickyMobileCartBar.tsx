'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatINR } from '@/lib/formatters';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyMobileCartBarProps {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}

export const StickyMobileCartBar: React.FC<StickyMobileCartBarProps> = ({
  product,
  selectedVariant,
  quantity,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once scrolled 450px down
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      message: `${product.title} (${selectedVariant.name})`,
      image: product.images[0],
      actionLabel: 'View Bag',
      onAction: () => openCart(),
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-warm-linen/95 backdrop-blur-md border-t border-warm-border p-3.5 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="min-w-0 flex-1">
              <h4 className="font-serif text-sm font-semibold text-charcoal truncate">
                {product.title}
              </h4>
              <p className="text-xs text-charcoal-muted truncate">
                {selectedVariant.name} • <span className="font-bold text-terracotta">{formatINR(selectedVariant.price)}</span>
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              className="py-2.5 px-5 bg-terracotta hover:bg-terracotta-dark text-warm-linen text-xs font-semibold uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2 shrink-0 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
