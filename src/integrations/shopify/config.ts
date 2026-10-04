/**
 * Shopify Storefront API Configuration & Mode Detection
 *
 * MOAMLIGHT D2C E-Commerce Platform
 */

export interface ShopifyConfig {
  storeDomain: string;
  storefrontAccessToken: string;
  adminAccessToken: string;
  apiVersion: string;
  revalidationSecret: string;
  forceMock: boolean;
}

const cleanDomain = (domain?: string): string => {
  if (!domain) return '';
  return domain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
};

export const shopifyConfig: ShopifyConfig = {
  storeDomain: cleanDomain(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN),
  storefrontAccessToken: (process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '').trim(),
  adminAccessToken: (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '').trim(),
  apiVersion: (process.env.SHOPIFY_STOREFRONT_API_VERSION || '2024-07').trim(),
  revalidationSecret: (process.env.SHOPIFY_REVALIDATION_SECRET || '').trim(),
  forceMock: process.env.NEXT_PUBLIC_FORCE_MOCK_DATA === 'true',
};

/**
 * Validates whether Shopify credentials are present and not placeholder values.
 * When false, the application gracefully falls back to local mock data.
 */
export const isShopifyConfigured = (): boolean => {
  return (
    !shopifyConfig.forceMock &&
    Boolean(shopifyConfig.storeDomain) &&
    Boolean(shopifyConfig.storefrontAccessToken) &&
    !shopifyConfig.storeDomain.includes('your-store') &&
    !shopifyConfig.storeDomain.includes('placeholder') &&
    !shopifyConfig.storefrontAccessToken.includes('your-token') &&
    !shopifyConfig.storefrontAccessToken.includes('placeholder')
  );
};

