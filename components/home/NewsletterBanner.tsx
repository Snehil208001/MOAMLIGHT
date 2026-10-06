'use client';

import React, { useState } from 'react';
import { Mail, Check, Sparkles, Copy } from 'lucide-react';

export const NewsletterBanner: React.FC = () => {
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setSubmitted(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('MOAM10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-16 bg-transparent border-t border-[var(--border-daynight)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 text-amber text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JOIN THE SANCTUARY CIRCLE</span>
        </div>

        <h3 className="font-serif text-3xl sm:text-4xl font-medium">
          Receive 10% Off Your First Handcrafted Burn
        </h3>

        <p className="mt-2 text-sm text-[var(--text-muted-daynight)] max-w-lg mx-auto">
          Subscribe for early access to limited festive candle editions, artisanal home styling guides, and candle care rituals.
        </p>

        {submitted ? (
          <div className="mt-8 p-6 bg-warm-cream border border-warm-border rounded-2xl max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 text-sage-dark font-semibold text-sm">
              <Check className="w-4 h-4 text-sage-dark" />
              <span>Welcome to MOAMLIGHT!</span>
            </div>
            <p className="text-xs text-charcoal-muted">
              Here is your 10% welcome coupon. Use it anytime at checkout:
            </p>
            <div className="flex items-center justify-center gap-3 bg-warm-linen border border-dashed border-terracotta/40 py-2.5 px-4 rounded-xl">
              <span className="font-mono text-base font-bold text-terracotta tracking-wider">
                MOAM10
              </span>
              <button
                onClick={handleCopyCode}
                className="text-xs font-semibold uppercase tracking-wider text-charcoal hover:text-terracotta flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <label htmlFor="newsletter-input" className="sr-only">Email or WhatsApp</label>
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted" />
              <input
                id="newsletter-input"
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter Email or WhatsApp (+91)..."
                className="w-full pl-10 pr-4 py-3 bg-warm-cream/50 border border-warm-border rounded-xl text-xs sm:text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:border-terracotta focus-visible:ring-2 focus-visible:ring-terracotta/60 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-terracotta hover:bg-terracotta-dark text-warm-linen text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shrink-0 shadow-sm"
            >
              Get 10% Off
            </button>
          </form>
        )}

        <p className="mt-3 text-[11px] text-charcoal-muted">
          We honor your privacy. Unsubscribe at any time with one click.
        </p>
      </div>
    </section>
  );
};
