'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ShieldCheck, ArrowRight, Smartphone, Mail, Truck, Flame, CheckCircle2 } from 'lucide-react';

function LoginPortalContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('redirect') || '';
  const shopifyAccountUrl = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL || 'https://eyj01h-j3.myshopify.com/account/login';

  const [countdown, setCountdown] = useState(3);
  const [autoRedirect, setAutoRedirect] = useState(false);

  // Allow one-click immediate redirect or auto redirect after short countdown if desired
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRedirect && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (autoRedirect && countdown === 0) {
      window.location.href = shopifyAccountUrl;
    }
    return () => clearTimeout(timer);
  }, [autoRedirect, countdown, shopifyAccountUrl]);

  return (
    <div className="bg-warm-linen min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Editorial Narrative Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-warm-cream border border-warm-border text-terracotta shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>SHOPIFY PASSWORDLESS AUTHENTICATION</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal tracking-tight">
            Sign In with Email or Phone OTP
          </h1>

          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans max-w-md mx-auto">
            MOAMLIGHT customer accounts are powered directly by Shopify. Experience instant, passwordless sign-in with a 6-digit one-time code sent directly to your email or mobile phone.
          </p>
        </div>

        {/* Main Action Card */}
        <div className="bg-warm-cream/60 border border-warm-border rounded-2xl p-6 sm:p-8 shadow-warm backdrop-blur-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/70 border border-warm-border/60">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-charcoal">Mobile Phone or Email Verification</p>
                <p className="text-charcoal-muted mt-0.5">
                  Enter your 10-digit Indian phone number or email address on Shopify to receive a 6-digit SMS or email code.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/70 border border-warm-border/60">
              <div className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-charcoal">Real-Time Consignment Tracking</p>
                <p className="text-charcoal-muted mt-0.5">
                  Track live parcel movement with Blue Dart, Delhivery, and DTDC directly through your official Shopify account.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/70 border border-warm-border/60">
              <div className="w-8 h-8 rounded-full bg-sage-dark/10 text-sage-dark flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-charcoal">Zero Passwords to Remember</p>
                <p className="text-charcoal-muted mt-0.5">
                  No forgotten passwords or reset links. Every login is securely authenticated with a one-time code.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <a
              href={shopifyAccountUrl}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-medium text-sm tracking-wide shadow-md transition-all cursor-pointer group"
            >
              <span>Continue to Shopify Login (6-Digit OTP)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Trust Banner */}
          <div className="pt-4 border-t border-warm-border/60 flex items-center justify-center gap-2 text-[11px] text-charcoal-muted">
            <ShieldCheck className="w-4 h-4 text-sage-dark shrink-0" />
            <span>Official 256-Bit SSL Shopify New Customer Accounts</span>
          </div>
        </div>

        {/* Back Link */}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-warm-linen min-h-[85vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <p className="text-xs uppercase tracking-widest text-charcoal-muted font-sans font-medium">
              Connecting to Shopify Identity...
            </p>
          </div>
        </div>
      }
    >
      <LoginPortalContent />
    </Suspense>
  );
}
