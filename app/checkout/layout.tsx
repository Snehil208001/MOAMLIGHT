import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Secure Checkout',
  description: 'Complete your luxury candle order with 100% safe transit guarantee and free shipping over ₹999.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
