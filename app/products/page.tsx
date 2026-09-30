import type { Metadata } from 'next';
import React from 'react';
import { getProducts } from '@/src/integrations/shopify';
import { ProductsCatalogClient } from './ProductsCatalogClient';

export const revalidate = 60; // Instant prefetching with background cache revalidation

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moamlight.in').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'All Fragrance Sanctuaries',
  description:
    'Explore our artisanal collection of slow-burning 100% botanical soy wax candles. Handcrafted in micro-batches with Mysore sandalwood, Kashmir saffron, Kannauj mitti attar, and Madurai mogra.',
  alternates: {
    canonical: `${siteUrl}/products`,
  },
  openGraph: {
    title: 'All Fragrance Sanctuaries | MOAMLIGHT Luxury Scented Candles',
    description:
      'Handcrafted slow-burning 100% botanical soy wax candles infused with ancient Indian botanicals. Mysore Sandalwood, Kashmir Saffron, Kannauj Mitti Attar, and Madurai Mogra.',
    url: `${siteUrl}/products`,
    type: 'website',
  },
};

export default async function ProductsPage() {
  const products = await getProducts();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Fragrance Sanctuaries',
        item: `${siteUrl}/products`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ProductsCatalogClient products={products} />
    </>
  );
}
