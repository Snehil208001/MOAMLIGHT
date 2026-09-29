'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Modal } from '@/components/ui/Modal';
import { PRODUCTS } from '@/data/products';
import { formatINR } from '@/lib/formatters';
import { Search, ShoppingBag, Menu, X, Flame, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDayNight } from '@/components/animation/DayNightScrollController';

export const Header: React.FC = () => {
  const { totalItemsCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isNightMode } = useDayNight();
  const accountUrl = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL || 'https://shopify.com/79258517672/account';

  const filteredProducts = searchQuery.trim()
    ? PRODUCTS.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.scentPyramid.topNotes.some((n) => n.toLowerCase().includes(query)) ||
          p.scentPyramid.heartNotes.some((n) => n.toLowerCase().includes(query)) ||
          p.scentPyramid.baseNotes.some((n) => n.toLowerCase().includes(query))
        );
      })
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 h-[72px] bg-[var(--card-bg-daynight)] backdrop-blur-[20px] border-b border-[var(--border-daynight)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          <div className="flex items-center justify-between h-full relative">
            {/* Left Column: Mobile Hamburger & Desktop Navigation */}
            <div className="flex items-center">
              {/* Mobile Hamburger */}
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 hover:text-amber-500 transition-colors cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              {/* Desktop Navigation Left */}
              <nav className="hidden lg:flex items-center gap-8 text-xs font-medium uppercase tracking-[0.08em]">
                <Link href="/products" className="hover:text-amber-500 transition-colors cursor-pointer">
                  All Candles
                </Link>
                <Link href="/#scents" className="hover:text-amber-500 transition-colors cursor-pointer">
                  Fragrance Moods
                </Link>
                <Link href="/quiz" className="hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer">
                  <span>Scent Quiz</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                </Link>
              </nav>
            </div>

            {/* Brand Logo (True Absolute Center - Scaled for Mobile) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex justify-center pointer-events-auto z-10">
              <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2 group cursor-pointer whitespace-nowrap">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-transparent flex items-center justify-center border border-[var(--border-daynight)] group-hover:scale-105 transition-transform shrink-0">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                </span>
                <span className="font-serif text-base sm:text-xl lg:text-2xl font-semibold tracking-[0.10em] sm:tracking-[0.18em]">
                  MOAMLIGHT
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Right & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-6 ml-auto">
              <nav className="hidden lg:flex items-center gap-8 text-xs font-medium uppercase tracking-[0.08em]">
                <Link href="/about" className="hover:text-amber-500 transition-colors cursor-pointer">
                  Artisan Story
                </Link>
              </nav>

              {/* Search Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 sm:p-2.5 hover:text-amber-500 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Search fragrances"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Customer Account & Orders */}
              <a
                href={accountUrl}
                className="hidden sm:flex p-2 sm:p-2.5 hover:text-amber-500 transition-colors cursor-pointer min-w-[40px] min-h-[40px] items-center justify-center"
                aria-label="Customer account and order history"
                title="Sign In / My Account"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                className="relative p-2 sm:p-2.5 hover:text-amber-500 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="View shopping bag"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-amber-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {totalItemsCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-4/5 max-w-sm bg-warm-linen shadow-2xl flex flex-col h-full z-10 p-6 border-r border-warm-border justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-warm-border">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-terracotta fill-terracotta" />
                    <span className="font-serif text-xl font-semibold tracking-widest text-charcoal">
                      MOAMLIGHT
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full text-charcoal-muted hover:text-charcoal"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="mt-8 flex flex-col gap-6 text-sm font-semibold uppercase tracking-wider text-charcoal">
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-terracotta transition-colors flex items-center justify-between"
                  >
                    <span>All Candles</span>
                    <ArrowRight className="w-4 h-4 text-charcoal-muted" />
                  </Link>
                  <Link
                    href="/#scents"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-terracotta transition-colors flex items-center justify-between"
                  >
                    <span>Fragrance Moods</span>
                    <ArrowRight className="w-4 h-4 text-charcoal-muted" />
                  </Link>
                  <Link
                    href="/quiz"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-terracotta transition-colors flex items-center justify-between text-terracotta"
                  >
                    <span>Take Scent Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-terracotta transition-colors flex items-center justify-between"
                  >
                    <span>Our Artisan Story</span>
                    <ArrowRight className="w-4 h-4 text-charcoal-muted" />
                  </Link>
                  <a
                    href={accountUrl}
                    className="hover:text-terracotta transition-colors flex items-center justify-between pt-3 border-t border-warm-border/60"
                  >
                    <span className="flex items-center gap-2 normal-case font-medium">
                      <User className="w-4 h-4 text-terracotta" />
                      Sign In / My Account
                    </span>
                    <ArrowRight className="w-4 h-4 text-charcoal-muted" />
                  </a>
                </nav>
              </div>

              {/* Mobile Support */}
              <div className="pt-6 border-t border-warm-border text-xs text-charcoal-muted space-y-2">
                <p className="font-semibold text-charcoal">WhatsApp Concierge:</p>
                <p>+91 98765 43210</p>
                <p>Mon–Sat, 10 AM – 7 PM IST</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Scent Search Modal */}
      <Modal
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setSearchQuery('');
        }}
        title="Search MOAMLIGHT Sanctuaries"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scent note (e.g. Sandalwood, Saffron, Vanilla, Bergamot)..."
              className="w-full pl-10 pr-4 py-3 bg-warm-cream/50 border border-warm-border rounded-xl text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-warm-border/60">
            {searchQuery.trim() === '' ? (
              <div className="py-6 text-center text-xs text-charcoal-muted space-y-2">
                <p className="font-semibold text-charcoal">POPULAR OLFACTORY SEARCHES</p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {['Mysore Sandalwood', 'Kashmir Saffron', 'Madurai Mogra', 'Mitti Petrichor', 'Ceylon Cinnamon'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-3 py-1.5 rounded-full bg-warm-cream border border-warm-border text-xs text-charcoal hover:border-terracotta transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal-muted">
                No fragrances found matching &quot;{searchQuery}&quot;. Try exploring our botanical categories.
              </div>
            ) : (
              <div className="divide-y divide-warm-border/60">
                {filteredProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-warm-cream/60 transition-colors group"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-12 h-14 object-cover rounded-md border border-warm-border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-semibold text-charcoal group-hover:text-terracotta transition-colors truncate">
                        {p.title}
                      </h4>
                      <p className="text-xs text-charcoal-muted truncate">{p.tagline}</p>
                      <p className="text-[11px] text-terracotta font-medium mt-0.5">
                        {formatINR(p.defaultPrice)} • {p.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
