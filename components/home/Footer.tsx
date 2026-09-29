'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, MessageCircle, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-warm-linen pt-16 pb-12 border-t border-warm-border/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-warm-linen/10">
          {/* Brand Info (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-full bg-warm-cream/10 flex items-center justify-center border border-warm-linen/20 text-terracotta">
                <Flame className="w-4 h-4 fill-terracotta" />
              </span>
              <span className="font-serif text-2xl font-semibold tracking-[0.18em] text-warm-linen">
                MOAMLIGHT
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-warm-linen/70 leading-relaxed font-sans max-w-sm">
              An artisanal Indian home fragrance house handcrafting slow-burning 100% botanical soy wax candles infused with ancient botanicals and mindful aromatherapy.
            </p>

            <div className="pt-2 space-y-2 text-xs text-warm-linen/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-gold shrink-0" />
                <span>Atelier: 14/2 Indiranagar 100ft Rd, Bengaluru, KA 560038</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-gold shrink-0" />
                <span>support@moamlight.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-amber-gold shrink-0" />
                <span>WhatsApp Concierge: +91 98765 43210 (10 AM - 7 PM IST)</span>
              </div>
            </div>
          </div>

          {/* Scent Collections */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-amber-gold">
              Fragrance Collections
            </h4>
            <ul className="space-y-2 text-xs text-warm-linen/70">
              <li>
                <Link href="/products" className="hover:text-warm-linen transition-colors">
                  All 6 Scent Sanctuaries
                </Link>
              </li>
              <li>
                <Link href="/#scents" className="hover:text-warm-linen transition-colors">
                  Woody & Meditative
                </Link>
              </li>
              <li>
                <Link href="/#scents" className="hover:text-warm-linen transition-colors">
                  Floral & Nocturnal
                </Link>
              </li>
              <li>
                <Link href="/#scents" className="hover:text-warm-linen transition-colors">
                  Spiced & Gourmand
                </Link>
              </li>
              <li>
                <Link href="/#scents" className="hover:text-warm-linen transition-colors">
                  Fresh & Earthy (Petrichor)
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-warm-linen transition-colors text-amber-gold">
                  Find Your Match (Quiz)
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-amber-gold">
              Indian D2C Care
            </h4>
            <ul className="space-y-2 text-xs text-warm-linen/70">
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL || 'https://shopify.com/79258517672/account'}
                  className="hover:text-warm-linen transition-colors cursor-pointer flex items-center gap-1.5 text-warm-linen font-medium"
                >
                  <span>My Account & Orders</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-gold px-1.5 py-0.5 rounded font-mono">Sign In</span>
                </a>
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL || 'https://shopify.com/79258517672/account'}
                  className="hover:text-warm-linen transition-colors cursor-pointer"
                >
                  Track Consignment (Live Status)
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-warm-linen transition-colors">
                  Artisan Soy Wax Manifesto
                </Link>
              </li>
              <li>
                <span className="hover:text-warm-linen transition-colors cursor-pointer">
                  Cash on Delivery (COD) FAQs
                </span>
              </li>
              <li>
                <span className="hover:text-warm-linen transition-colors cursor-pointer">
                  Pincode Coverage Check
                </span>
              </li>
              <li>
                <span className="hover:text-warm-linen transition-colors cursor-pointer">
                  Candle Memory Burn Guide
                </span>
              </li>
            </ul>
          </div>

          {/* Guarantees & Policies */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-amber-gold">
              Trust & Guarantees
            </h4>
            <div className="space-y-2.5 text-xs text-warm-linen/70">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sage-light shrink-0 mt-0.5" />
                <span>
                  <strong>Transit Breakage Guarantee:</strong> Instant free replacement if damaged in courier.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <span>
                  <strong>100% Paraffin Free:</strong> Hypoallergenic soy wax, pure cotton wicks.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-warm-linen/50">
          <p>© {new Date().getFullYear()} MOAMLIGHT Home Fragrance Atelier Pvt Ltd. All rights reserved.</p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="px-2 py-0.5 rounded bg-warm-linen/10 text-[10px] text-warm-linen/80 font-mono">
              UPI Accepted
            </span>
            <span className="px-2 py-0.5 rounded bg-warm-linen/10 text-[10px] text-warm-linen/80 font-mono">
              RuPay / Visa / MC
            </span>
            <span className="px-2 py-0.5 rounded bg-warm-linen/10 text-[10px] text-warm-linen/80 font-mono">
              NetBanking
            </span>
            <span className="px-2 py-0.5 rounded bg-warm-linen/10 text-[10px] text-warm-linen/80 font-mono">
              COD Available
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
