import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { ScentExplorer } from '@/components/home/ScentExplorer';
import { BestsellerGrid } from '@/components/home/BestsellerGrid';
import { BrandStory } from '@/components/home/BrandStory';
import { CustomerReviews } from '@/components/home/CustomerReviews';
import { ScentQuizTeaser } from '@/components/home/ScentQuizTeaser';
import { NewsletterBanner } from '@/components/home/NewsletterBanner';
import { DayNightScrollController } from '@/components/animation/DayNightScrollController';
import { BackgroundEmbersWrapper } from '@/components/3d/BackgroundEmbersWrapper';

import { getProducts } from '@/src/integrations/shopify';

export const revalidate = 0; // Fresh real-time data on every request

export default async function HomePage() {
  const products = await getProducts();

  return (
    <DayNightScrollController>
      {/* Global Atmospheric 3D Floating Embers reacting to scroll velocity */}
      <BackgroundEmbersWrapper />

      <div className="relative z-10 space-y-0">
        <HeroSection />
        <ScentExplorer products={products} />
        <BestsellerGrid products={products} />
        <BrandStory />
        <CustomerReviews />
        <ScentQuizTeaser />
        <NewsletterBanner />
      </div>
    </DayNightScrollController>
  );
}
