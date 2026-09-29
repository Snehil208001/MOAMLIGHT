import { MetadataRoute } from 'next';

/**
 * Production Crawl Policy & Robots Configuration for MOAMLIGHT
 *
 * Configures search crawler discovery:
 * - Allows Googlebot and standard crawlers on public pages
 * - Disallows sensitive checkout and backend API endpoints
 * - Points directly to canonical XML sitemap index
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moamlight.in').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/checkout', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/checkout', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
