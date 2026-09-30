'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatINR } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ExternalLink,
  Sparkles,
  Flame,
  Truck,
  ShieldCheck,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'perks'>('orders');

  // Protect route: redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/account/login?redirect=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !customer) {
    return (
      <div className="bg-warm-linen min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          <p className="text-xs uppercase tracking-widest text-charcoal-muted font-sans font-medium">
            Accessing Sanctuary Profile...
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    showToast({
      title: 'Signed Out',
      message: 'You have been safely logged out of your Sanctuary account.',
    });
    router.push('/');
  };

  const orders = customer.orders?.edges || [];
  const addresses = customer.addresses?.edges || [];
  const defaultAddress = customer.defaultAddress || (addresses.length > 0 ? addresses[0].node : null);

  const initials = `${(customer.firstName || '').charAt(0)}${(customer.lastName || '').charAt(0)}`.toUpperCase() || 'M';

  return (
    <div className="bg-warm-linen min-h-screen py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-charcoal-muted uppercase tracking-wider">
          <Link href="/" className="hover:text-charcoal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-warm-border" />
          <span className="text-terracotta font-medium">My Sanctuary Account</span>
        </nav>

        {/* Member Header Card */}
        <div className="bg-warm-cream/60 border border-warm-border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            {/* Monogram Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-terracotta text-warm-linen font-serif text-2xl sm:text-3xl font-bold flex items-center justify-center shadow-warm shrink-0">
              {initials}
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber/20 text-charcoal border border-amber/30">
                <Sparkles className="w-3 h-3 text-amber-dark" />
                Sanctuary Connoisseur Circle
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
                Welcome back, {customer.firstName || 'Sanctuary Patron'}
              </h1>
              <p className="text-xs text-charcoal-muted font-sans">
                {customer.email} {customer.phone ? `• ${customer.phone}` : ''}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/products" className="flex-1 md:flex-initial">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Flame className="w-3.5 h-3.5 text-amber" />
                <span>Shop Fragrances</span>
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-muted hover:text-red-700 hover:bg-red-50/60 border border-warm-border transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-warm-border pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('perks')}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'perks'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Member Privileges</span>
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-16 px-4 bg-warm-cream/30 border border-warm-border rounded-3xl space-y-4">
                <div className="w-14 h-14 rounded-full bg-warm-cream border border-warm-border flex items-center justify-center mx-auto text-charcoal-muted">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-charcoal">
                  No Fragrance Orders Yet
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto">
                  Your handcrafted slow-burning botanical soy candles will appear here with live courier dispatch and tracking updates.
                </p>
                <div className="pt-2">
                  <Link href="/products">
                    <Button variant="terracotta" size="md">
                      Explore Candle Collections
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              orders.map(({ node: order }) => (
                <div
                  key={order.id}
                  className="bg-warm-cream/40 border border-warm-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-warm transition-shadow"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-xl font-bold text-charcoal">
                          {order.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.fulfillmentStatus === 'FULFILLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber/20 text-amber-900'
                          }`}
                        >
                          {order.fulfillmentStatus === 'FULFILLED' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-700" />
                          )}
                          {order.fulfillmentStatus || 'PROCESSING'}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-muted">
                        Placed on {new Date(order.processedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-charcoal-muted uppercase tracking-wider block">
                          Total Paid
                        </span>
                        <span className="font-serif text-lg font-bold text-charcoal">
                          {formatINR(Number(order.totalPrice.amount))}
                        </span>
                      </div>

                      {order.statusUrl && (
                        <a
                          href={order.statusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-charcoal text-warm-linen hover:bg-black transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Track Delivery</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-3">
                    {order.lineItems?.edges?.map(({ node: item }, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-4 py-2">
                        {item.variant?.image?.url ? (
                          <img
                            src={item.variant.image.url}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover border border-warm-border shrink-0 bg-warm-cream"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-warm-cream border border-warm-border flex items-center justify-center shrink-0">
                            <Flame className="w-6 h-6 text-amber" />
                          </div>
                        )}

                        <div className="flex-1">
                          <h4 className="font-serif text-base font-semibold text-charcoal">
                            {item.title}
                          </h4>
                          <p className="text-xs text-charcoal-muted">
                            Quantity: {item.quantity} {item.variant?.title ? `• ${item.variant.title}` : ''}
                          </p>
                        </div>

                        {item.variant?.price && (
                          <span className="text-sm font-semibold text-charcoal">
                            {formatINR(Number(item.variant.price.amount) * item.quantity)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Delivery Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            {defaultAddress ? (
              <div className="bg-warm-cream/40 border border-warm-border rounded-2xl p-6 sm:p-8 max-w-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-terracotta/15 text-terracotta">
                    Default Sanctuary Address
                  </span>
                  <MapPin className="w-4 h-4 text-terracotta" />
                </div>

                <div className="space-y-1 text-sm text-charcoal">
                  <p className="font-semibold text-base">
                    {customer.displayName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()}
                  </p>
                  <p>{defaultAddress.address1}</p>
                  {defaultAddress.address2 && <p>{defaultAddress.address2}</p>}
                  <p>
                    {defaultAddress.city}, {defaultAddress.province} {defaultAddress.zip}
                  </p>
                  <p>{defaultAddress.country}</p>
                  {defaultAddress.phone && (
                    <p className="text-xs text-charcoal-muted pt-1">
                      Phone: {defaultAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-14 px-4 bg-warm-cream/30 border border-warm-border rounded-3xl space-y-3">
                <MapPin className="w-8 h-8 text-charcoal-muted mx-auto" />
                <h3 className="font-serif text-xl font-medium text-charcoal">
                  No Saved Delivery Address
                </h3>
                <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                  Your address will automatically save to your profile when you complete your first order.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Member Privileges */}
        {activeTab === 'perks' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-warm-cream/50 border border-warm-border rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber/20 text-amber-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-dark" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-charcoal">
                10% Welcome Pour
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Use code <span className="font-mono font-bold text-terracotta">MOAM10</span> on any purchase of handcrafted 200g or 450g candles.
              </p>
            </div>

            <div className="bg-warm-cream/50 border border-warm-border rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage-light text-sage-dark flex items-center justify-center">
                <Truck className="w-5 h-5 text-sage-dark" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-charcoal">
                Complimentary Express Shipping
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Automatic free delivery across India on every order above ₹999.
              </p>
            </div>

            <div className="bg-warm-cream/50 border border-warm-border rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-warm-cream text-terracotta border border-warm-border flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-terracotta" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-charcoal">
                WhatsApp Concierge
              </h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Direct access to our Bengaluru scent artisans for bespoke gifting and formulation queries.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
