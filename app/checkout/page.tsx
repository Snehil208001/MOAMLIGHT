'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/formatters';
import { estimatePincodeDelivery } from '@/data/pincodes';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Gift,
  Lock,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    discountTotal,
    shippingFee,
    finalTotal,
    appliedCoupon,
    isGift,
    giftMessage,
    clearCart,
    redirectToCheckout,
    isSyncing,
  } = useCart();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | 'netbanking'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Auto-detect city & state when pincode changes
  useEffect(() => {
    if (pincode.length === 6) {
      const info = estimatePincodeDelivery(pincode);
      if (info) {
        setCity(info.city);
        setState(info.state);
      }
    }
  }, [pincode]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine || !pincode) {
      alert('Please fill out all required shipping details.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const generatedId = `MOAM-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
    }, 1800);
  };

  if (orderComplete) {
    return (
      <div className="bg-warm-linen min-h-screen py-16 px-4">
        <div className="max-w-xl mx-auto bg-warm-cream/50 border border-warm-border rounded-3xl p-8 sm:p-10 text-center shadow-warm">
          <div className="w-16 h-16 bg-sage-light text-sage-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-terracotta uppercase tracking-widest">
            ORDER CONFIRMED
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal mt-1">
            Thank you, {fullName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-charcoal-muted mt-2">
            Your sanctuary order <strong className="text-charcoal font-mono">#{orderId}</strong> has been placed successfully.
          </p>

          <div className="bg-warm-linen border border-warm-border rounded-2xl p-5 my-6 text-left space-y-2.5 text-xs text-charcoal">
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Payment Mode:</span>
              <span className="font-semibold uppercase">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Shipping Destination:</span>
              <span className="font-medium text-right">{city}, {state} ({pincode})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Estimated Delivery:</span>
              <span className="font-semibold text-terracotta">Within 2–4 Business Days</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-warm-border text-sm font-serif font-bold">
              <span>Total Paid / Payable:</span>
              <span className="text-terracotta">{formatINR(finalTotal)}</span>
            </div>
          </div>

          <p className="text-xs text-charcoal-muted mb-6 leading-relaxed">
            A confirmation WhatsApp & SMS with live BlueDart consignment tracking will be sent to <strong>+91 {phone}</strong> within 2 hours.
          </p>

          <Link href="/">
            <Button variant="terracotta" size="md">
              Return to Sanctuary Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-warm-linen min-h-screen py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="font-serif text-3xl font-medium text-charcoal">Your bag is empty</h2>
          <p className="text-sm text-charcoal-muted">
            Add your favorite handcrafted Indian soy candles before proceeding to checkout.
          </p>
          <Link href="/products">
            <Button variant="terracotta" size="md">
              Explore Candles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-linen min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-muted hover:text-charcoal transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Shipping & Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1-Click Shopify Checkout Banner (Razorpay & Shiprocket) */}
            <div className="bg-gradient-to-r from-amber/15 via-warm-cream to-amber/10 border border-amber/30 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-dark uppercase tracking-wider bg-amber/20 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber" />
                  <span>Shopify Express Checkout</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-charcoal">
                  Pay via Razorpay & Shiprocket Delivery
                </h3>
                <p className="text-xs text-charcoal-muted max-w-md leading-relaxed">
                  Fast, encrypted checkout supporting UPI (Google Pay, PhonePe, Paytm), Cards, Net Banking, and COD with Shiprocket tracking.
                </p>
              </div>
              <Button
                variant="terracotta"
                size="lg"
                disabled={isSyncing}
                onClick={async (e) => {
                  e.preventDefault();
                  if (redirectToCheckout) {
                    await redirectToCheckout();
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs uppercase tracking-wider"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Shopify Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-warm-border"></div>
              <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-charcoal-muted font-medium">Or enter shipping details manually</span>
              <div className="flex-grow border-t border-warm-border"></div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Shipping Details */}
              <div className="bg-warm-linen border border-warm-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase tracking-wider">
                  <Truck className="w-4 h-4" />
                  <span>1. Delivery Destination</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-charcoal">
                  Shipping Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-charcoal">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full p-2.5 bg-warm-cream/40 border border-warm-border rounded-lg text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-charcoal">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full p-2.5 bg-warm-cream/40 border border-warm-border rounded-lg text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-charcoal">Mobile Number (+91) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full p-2.5 bg-warm-cream/40 border border-warm-border rounded-lg text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-charcoal">Flat, House No., Building, Street *</label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="Apartment 4B, Shanti Enclave, 12th Main Rd"
                      className="w-full p-2.5 bg-warm-cream/40 border border-warm-border rounded-lg text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-charcoal">6-digit Postal Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="560038"
                      className="w-full p-2.5 bg-warm-cream/40 border border-warm-border rounded-lg text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-charcoal">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full p-2.5 bg-warm-cream/40 border border-warm-border rounded-lg text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-warm-linen border border-warm-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>2. Payment Option</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-charcoal">
                  Select Payment Method
                </h2>

                <div className="space-y-3 pt-2">
                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-terracotta bg-warm-cream/60 ring-2 ring-terracotta/20'
                        : 'border-warm-border bg-warm-linen hover:border-terracotta/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-terracotta accent-terracotta"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-charcoal flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-terracotta" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[11px] font-bold text-sage-dark bg-sage-light px-2 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        Pay with cash or UPI directly to the courier agent upon doorstep delivery.
                      </p>
                    </div>
                  </label>

                  {/* UPI */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-terracotta bg-warm-cream/60 ring-2 ring-terracotta/20'
                        : 'border-warm-border bg-warm-linen hover:border-terracotta/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mt-1 text-terracotta accent-terracotta"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-charcoal flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-terracotta" />
                        UPI Instant (Google Pay, PhonePe, Paytm, CRED)
                      </span>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        Scan instant QR code or pay via any verified UPI ID.
                      </p>
                    </div>
                  </label>

                  {/* Cards */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-terracotta bg-warm-cream/60 ring-2 ring-terracotta/20'
                        : 'border-warm-border bg-warm-linen hover:border-terracotta/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-1 text-terracotta accent-terracotta"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-charcoal flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-terracotta" />
                        Credit / Debit Card (RuPay, Visa, Mastercard)
                      </span>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        Protected with 256-bit Indian banking grade encryption.
                      </p>
                    </div>
                  </label>

                  {/* NetBanking */}
                  <label
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-terracotta bg-warm-cream/60 ring-2 ring-terracotta/20'
                        : 'border-warm-border bg-warm-linen hover:border-terracotta/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="mt-1 text-terracotta accent-terracotta"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-charcoal flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-terracotta" />
                        NetBanking (HDFC, ICICI, SBI, Axis & 50+ Banks)
                      </span>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        Direct authorization through your Indian retail bank portal.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="terracotta"
                size="lg"
                isLoading={isProcessing}
                className="w-full flex items-center justify-between px-8 py-4 text-base"
              >
                <span>Complete Sanctuary Order</span>
                <span className="font-bold">{formatINR(finalTotal)}</span>
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-charcoal-muted">
                <Lock className="w-3.5 h-3.5 text-terracotta" />
                <span>256-Bit SSL Encrypted • 100% Free Courier Damage Replacement Guarantee</span>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-5 bg-warm-cream/50 border border-warm-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-28">
            <h3 className="font-serif text-xl font-semibold text-charcoal border-b border-warm-border pb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Line items list */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-14 h-16 rounded-lg overflow-hidden bg-warm-linen border border-warm-border shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-semibold text-charcoal truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-charcoal-muted">
                      Qty: {item.quantity} • {item.variantName}
                    </p>
                  </div>
                  <div className="text-right font-semibold text-xs text-charcoal">
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Gift note indicator if present */}
            {isGift && (
              <div className="p-3 bg-warm-linen border border-warm-border rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-terracotta">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Complimentary Gifting Card Added:</span>
                </div>
                {giftMessage && (
                  <p className="text-[11px] text-charcoal italic">&quot;{giftMessage}&quot;</p>
                )}
              </div>
            )}

            {/* Breakdown */}
            <div className="space-y-2 pt-4 border-t border-warm-border text-xs text-charcoal-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-charcoal">{formatINR(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-terracotta font-medium">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-{formatINR(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-sage-dark uppercase">FREE</span>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-warm-border font-serif text-xl font-bold text-charcoal">
                <span>Total Amount</span>
                <span className="text-terracotta">{formatINR(finalTotal)}</span>
              </div>
              <p className="text-[10px] text-charcoal-muted text-right">
                Inclusive of GST • Zero hidden fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
