'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/formatters';
import { Tag, Check, X } from 'lucide-react';

export const PromoCodeInput: React.FC = () => {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!code.trim()) return;

    const res = applyCoupon(code);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setCode('');
    }
  };

  if (appliedCoupon) {
    return (
      <div className="bg-sage-light/60 border border-sage/30 rounded-lg p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-sage-dark font-medium">
          <Check className="w-4 h-4 text-sage-dark" />
          <span>
            Code <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercentage}% off: -{formatINR(appliedCoupon.discountAmount)})
          </span>
        </div>
        <button
          onClick={removeCoupon}
          className="text-charcoal-muted hover:text-charcoal p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60 rounded"
          title="Remove coupon"
          aria-label="Remove coupon"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setErrorMsg('');
            }}
            placeholder="PROMO CODE (e.g. MOAM10)"
            className="w-full pl-9 pr-3 py-2 text-xs uppercase font-medium bg-warm-linen border border-warm-border rounded-lg text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:border-terracotta transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!code.trim()}
          className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider bg-charcoal text-warm-linen hover:bg-black rounded-lg disabled:opacity-40 transition-colors"
        >
          Apply
        </button>
      </form>

      {errorMsg ? (
        <p className="text-[11px] text-red-600 font-medium">{errorMsg}</p>
      ) : (
        <p className="text-[11px] text-charcoal-muted">
          💡 Use code <span className="font-semibold text-terracotta">MOAM10</span> for 10% off your order
        </p>
      )}
    </div>
  );
};
