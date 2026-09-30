'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, ArrowRight, Flame, Gift, CheckCircle2 } from 'lucide-react';

function RegisterPortalContent() {
  const shopifyAccountUrl = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL || 'https://eyj01h-j3.myshopify.com/account/login';

  return (
    <div className="bg-warm-linen min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Editorial Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-warm-cream border border-warm-border text-terracotta shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>JOIN THE SANCTUARY</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal tracking-tight">
            Create Your Sanctuary Account
          </h1>

          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans max-w-md mx-auto">
            Account registration is automatic and passwordless via Shopify. Simply sign in with your email or mobile phone to receive a 6-digit OTP code.
          </p>
        </div>

        {/* Welcome Voucher Callout */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-charcoal">Connoisseur Welcome Privilege</p>
            <p className="text-charcoal-muted mt-0.5">
              Enjoy 10% off your maiden artisanal order with coupon code <span className="font-mono font-bold text-terracotta">MOAM10</span> at checkout.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-warm-cream/60 border border-warm-border rounded-2xl p-6 sm:p-8 shadow-warm backdrop-blur-sm space-y-6">
          <div className="space-y-3 text-xs text-charcoal-muted">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sage-dark shrink-0" />
              <span>Instant registration using your Indian mobile phone or email</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sage-dark shrink-0" />
              <span>Direct SMS / Email 6-digit verification code — zero passwords needed</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sage-dark shrink-0" />
              <span>Real-time logistics tracking on Blue Dart, Delhivery, & DTDC</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={shopifyAccountUrl}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-medium text-sm tracking-wide shadow-md transition-all cursor-pointer group"
            >
              <span>Continue with Shopify OTP Registration</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="pt-4 border-t border-warm-border/60 flex items-center justify-center gap-2 text-[11px] text-charcoal-muted">
            <ShieldCheck className="w-4 h-4 text-sage-dark shrink-0" />
            <span>Official Shopify New Customer Accounts</span>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted hover:text-terracotta transition-colors"
          >
            ← Return to MOAMLIGHT Fragrance Atelier
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-warm-linen min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterPortalContent />
    </Suspense>
  );
}
