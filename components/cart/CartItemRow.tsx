'use client';

import React from 'react';
import Link from 'next/link';
import { CartItem } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/formatters';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateQuantity, removeItem, closeCart } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-warm-border/60 last:border-b-0">
      {/* Product Image */}
      <Link
        href={`/products/${item.productId.replace('prod-', '')}`}
        onClick={closeCart}
        className="w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-warm-cream border border-warm-border group"
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/products/${item.productId.replace('prod-', '')}`}
                onClick={closeCart}
                className="font-serif text-base font-semibold text-charcoal hover:text-terracotta transition-colors line-clamp-1"
              >
                {item.title}
              </Link>
              <p className="text-xs text-charcoal-muted mt-0.5">{item.variantName}</p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-charcoal-muted hover:text-terracotta p-1 transition-colors rounded"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pricing and Stepper */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-warm-border rounded-md bg-warm-linen">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-1.5 text-charcoal-muted hover:text-charcoal hover:bg-warm-cream transition-colors rounded-l-md"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-charcoal">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 text-charcoal-muted hover:text-charcoal hover:bg-warm-cream transition-colors rounded-r-md"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="font-semibold text-sm text-charcoal">
              {formatINR(item.price * item.quantity)}
            </span>
            {item.quantity > 1 && (
              <p className="text-[11px] text-charcoal-muted">
                {formatINR(item.price)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
