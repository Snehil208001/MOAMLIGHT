'use client';

import React, { useState } from 'react';
import { estimatePincodeDelivery, PincodeInfo } from '@/data/pincodes';
import { Truck, Check, AlertCircle, MapPin } from 'lucide-react';

export const PincodeEstimator: React.FC = () => {
  const [pincode, setPincode] = useState('');
  const [estimate, setEstimate] = useState<PincodeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setError('Please enter a valid 6-digit Indian postal code');
      setEstimate(null);
      return;
    }

    const res = estimatePincodeDelivery(trimmed);
    if (res) {
      setEstimate(res);
    } else {
      setError('Pincode serviceability currently unavailable.');
    }
  };

  return (
    <div className="bg-warm-cream/40 border border-warm-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
        <MapPin className="w-4 h-4 text-terracotta" />
        <span>Check Estimated Delivery Date & COD:</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ''));
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && pincode.length === 6) {
              handleCheck(e);
            }
          }}
          placeholder="Enter 6-digit pincode (e.g. 560001)"
          className="flex-1 px-3 py-2 text-xs bg-warm-linen border border-warm-border rounded-lg text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:border-terracotta transition-colors"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={pincode.length !== 6}
          className="px-4 py-2 bg-charcoal hover:bg-black text-warm-linen text-xs font-semibold uppercase tracking-wider rounded-lg disabled:opacity-40 transition-colors shrink-0"
        >
          Check
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {estimate && (
        <div className="space-y-1.5 pt-1 text-xs">
          <div className="flex items-center gap-2 text-sage-dark font-medium">
            <Truck className="w-4 h-4 text-sage-dark shrink-0" />
            <span>
              Delivery in <strong>{estimate.daysToDeliver}</strong> to {estimate.city} ({estimate.pincode})
            </span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-muted text-[11px] pl-6">
            <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />
            <span>Cash on Delivery (COD) is available</span>
          </div>
        </div>
      )}
    </div>
  );
};
