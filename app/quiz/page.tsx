import type { Metadata } from 'next';
import React from 'react';
import ScentQuizClient from './ScentQuizClient';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moamlight.in').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Scent Sanctuary Quiz',
  description:
    'Find your olfactive soulmate candle in 60 seconds. Discover your tailored fragrance ritual based on your spaces, diurnal rhythms, and cherished memories.',
  alternates: {
    canonical: `${siteUrl}/quiz`,
  },
  openGraph: {
    title: 'Scent Sanctuary Quiz | MOAMLIGHT Luxury Scented Candles',
    description:
      'Discover your ideal bespoke candle fragrance blend based on your sanctuary space, mood, and mindful rituals.',
    url: `${siteUrl}/quiz`,
    type: 'website',
  },
};

export default function ScentQuizPage() {
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
        name: 'Scent Finder Quiz',
        item: `${siteUrl}/quiz`,
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
      <ScentQuizClient />
    </>
  );
}
