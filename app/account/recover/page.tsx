'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, ArrowRight, Smartphone, Mail } from 'lucide-react';

export default function RecoverPasswordPage() {
  const shopifyAccountUrl = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL || 'https://eyj01h-j3.myshopify.com/account/login';

  return (
    <div className="bg-warm-linen min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-warm-cream border border-warm-border text-terracotta shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>PASSWORDLESS ACCOUNTS</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal tracking-tight">
            No Passwords Needed
          </h1>

          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-sans max-w-sm mx-auto">
            MOAMLIGHT accounts use Shopify New Customer Accounts. You never need to reset a password—simply log in using a 6-digit OTP code sent to your email or phone.
          </p>
        </div>

        <div className="bg-warm-cream/60 border border-warm-border rounded-2xl p-6 sm:p-8 shadow-warm backdrop-blur-sm space-y-5">
          <div className="p-4 rounded-xl bg-white/70 border border-warm-border/60 text-xs text-charcoal-muted space-y-2">
            <p className="font-semibold text-charcoal flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-terracotta" />
              <span>Instant Verification via SMS / Email</span>
            </p>
            <p>
              Whenever you sign in, Shopify sends an instant 6-digit verification code. There are no passwords to lose or reset.
            </p>
          </div>

          <a
            href={shopifyAccountUrl}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-medium text-sm tracking-wide shadow-md transition-all cursor-pointer group"
          >
            <span>Sign In with 6-Digit OTP</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="pt-3 border-t border-warm-border/60 flex items-center justify-center gap-2 text-[11px] text-charcoal-muted">
            <ShieldCheck className="w-4 h-4 text-sage-dark shrink-0" />
            <span>256-Bit SSL Encrypted Direct Shopify Connection</span>
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
