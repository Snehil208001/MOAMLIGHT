import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts, getProduct } from '@/src/integrations/shopify';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 60; // Instant cached serving with background revalidation

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.flatMap((p) => [
    { id: p.slug },
    { id: p.id },
  ]);
}

/**
 * Dynamic SEO Metadata for Individual Fragrance Sanctuary Pages
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Fragrance Sanctuary Not Found',
      description: 'The requested luxury candle fragrance could not be located in our sanctuary collection.',
    };
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moamlight.in').replace(/\/$/, '');
  const canonicalUrl = `${siteUrl}/products/${product.slug}`;
  const title = `${product.title} - ${product.category}`;
  const topNotesStr = (product.scentPyramid?.topNotes || []).slice(0, 3).join(', ');
  const heartNotesStr = (product.scentPyramid?.heartNotes || []).slice(0, 2).join(', ');
  const description = `${product.tagline} Handcrafted slow-burning 100% botanical soy wax candle. Notes of ${topNotesStr}${heartNotesStr ? ` and ${heartNotesStr}` : ''}. Hand-poured in micro-batches in Bengaluru, India. Free shipping on orders over ₹999.`;

  const keywords = [
    product.title,
    product.category,
    product.mood,
    'scented candle',
    'luxury candle india',
    'botanical soy wax candle',
    'hand poured candles bengaluru',
    'clean burn non-toxic candle',
    ...(product.scentPyramid?.topNotes || []),
    ...(product.scentPyramid?.heartNotes || []),
    ...(product.scentPyramid?.baseNotes || []),
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} | MOAMLIGHT Luxury Scented Candles`,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'MOAMLIGHT',
      locale: 'en_IN',
      images: (product.images || []).map((imgUrl, idx) => ({
        url: imgUrl,
        width: 1000,
        height: 1000,
        alt: `${product.title} - Handcrafted Indian Luxury Soy Candle (Image ${idx + 1})`,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | MOAMLIGHT Luxury Scented Candles`,
      description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

/**
 * Server Component: Product Detail Page with Rich JSON-LD Structured Data
 */
export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moamlight.in').replace(/\/$/, '');
  const productUrl = `${siteUrl}/products/${product.slug}`;

  // Calculate pricing range
  const variantPrices = product.variants.map((v) => v.price);
  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.defaultPrice;
  const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : product.defaultPrice;

  // Schema.org Product, Offer & AggregateRating JSON-LD
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: product.story || product.tagline,
    image: product.images,
    sku: product.variants[0]?.sku || product.id,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'MOAMLIGHT',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'MOAMLIGHT',
      url: siteUrl,
    },
    material: product.specs?.waxType || '100% Golden Botanical Soy Wax',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'India',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: product.variants.length,
      offers: product.variants.map((variant) => ({
        '@type': 'Offer',
        '@id': `${productUrl}#offer-${variant.id}`,
        name: `${product.title} - ${variant.name}`,
        sku: variant.sku,
        price: variant.price,
        priceCurrency: 'INR',
        availability: variant.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: productUrl,
        priceValidUntil: '2027-12-31',
        seller: {
          '@type': 'Organization',
          name: 'MOAMLIGHT',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: variant.price >= 999 ? '0' : '99',
            currency: 'INR',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'IN',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'd',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 2,
              maxValue: 4,
              unitCode: 'd',
            },
          },
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'IN',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
      })),
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
      bestRating: '5',
      worstRating: '1',
    },
    ...(product.reviews && product.reviews.length > 0
      ? {
          review: product.reviews.map((review) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: review.author,
            },
            datePublished: review.date,
            reviewBody: review.comment,
            name: review.title,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: review.rating,
              bestRating: '5',
              worstRating: '1',
            },
          })),
        }
      : {}),
  };

  // Schema.org BreadcrumbList JSON-LD
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
        name: 'Fragrance Collection',
        item: `${siteUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      {/* Schema.org Product & Offer Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Schema.org BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Client Interactive Product View */}
      <ProductDetailClient product={product} />
    </>
  );
}
