'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Gift } from 'lucide-react';

export const GiftOptionToggle: React.FC = () => {
  const { isGift, giftMessage, setGiftOptions } = useCart();

  return (
    <div className="bg-warm-cream/50 border border-warm-border rounded-xl p-3.5 space-y-2.5">
      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isGift}
          onChange={(e) => setGiftOptions(e.target.checked, giftMessage)}
          className="mt-1 w-4 h-4 rounded text-terracotta border-warm-border focus:ring-terracotta accent-terracotta"
        />
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal">
            <Gift className="w-3.5 h-3.5 text-terracotta" />
            <span>This order is a gift (Complimentary)</span>
          </div>
          <p className="text-[11px] text-charcoal-muted mt-0.5 leading-relaxed">
            Includes luxury unboxing, satin ribbon, and a handwritten calligraphy card.
          </p>
        </div>
      </label>

      {isGift && (
        <div className="pt-2">
          <label htmlFor="gift-message-textarea" className="sr-only">Gift Message</label>
          <textarea
            id="gift-message-textarea"
            value={giftMessage}
            onChange={(e) => setGiftOptions(true, e.target.value)}
            maxLength={150}
            rows={2}
            placeholder="Write your personalized gift message here (e.g., Happy Diwali! Love, Priya)..."
            className="w-full p-2.5 text-xs bg-warm-linen border border-warm-border rounded-lg text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:border-terracotta focus-visible:ring-2 focus-visible:ring-terracotta/60 resize-none transition-colors"
          />
          <div className="text-right text-[10px] text-charcoal-muted">
            {giftMessage.length} / 150 characters
          </div>
        </div>
      )}
    </div>
  );
};
