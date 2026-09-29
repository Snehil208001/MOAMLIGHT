import { MetadataRoute } from 'next';
import { getProducts } from '@/src/integrations/shopify';

export const revalidate = 3600; // 1-hour ISR revalidation

/**
 * Dynamic XML Sitemap Generator for MOAMLIGHT
 *
 * Produces production-grade sitemap indexing:
 * - Core static storefront landing pages (/, /products, /about, /quiz, /checkout)
 * - Dynamic product detail pages (/products/[slug])
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moamlight.in').replace(/\/$/, '');
  const currentDate = new Date();

  // Core static storefront routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  try {
    const products = await getProducts();
    const seenSlugs = new Set<string>();
    const productRoutes: MetadataRoute.Sitemap = [];

    for (const product of products) {
      if (product.slug && !seenSlugs.has(product.slug)) {
        seenSlugs.add(product.slug);
        productRoutes.push({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.85,
        });
      }
    }

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error('[Sitemap] Failed to fetch dynamic products for sitemap:', error);
    return staticRoutes;
  }
}
