/**
 * Shopify Storefront GraphQL Native Fetch Client
 *
 * MOAMLIGHT D2C E-Commerce Platform
 */

import { shopifyConfig, isShopifyConfigured, logShopifyMode } from './config';
import { ShopifyGraphQLResponse, ShopifyFetchOptions } from './types';

export class ShopifyApiError extends Error {
  public status: number;
  public errors: unknown[];
  public query?: string;

  constructor(message: string, status: number = 500, errors: unknown[] = [], query?: string) {
    super(message);
    this.name = 'ShopifyApiError';
    this.status = status;
    this.errors = errors;
    this.query = query;
  }
}

/**
 * Executes a GraphQL query/mutation against the Shopify Storefront API
 * utilizing native fetch with Next.js Cache & Tag support.
 */
export async function shopifyFetch<T, V = Record<string, unknown>>({
  query,
  variables,
  tags = ['shopify'],
  revalidate = 3600,
  cache,
}: ShopifyFetchOptions<V>): Promise<T> {
  logShopifyMode();

  if (!isShopifyConfigured()) {
    throw new ShopifyApiError(
      '[Shopify Client] Shopify credentials are not configured or mock mode is active.',
      400
    );
  }

  const endpoint = `https://${shopifyConfig.storeDomain}/api/${shopifyConfig.apiVersion}/graphql.json`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
  };

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  };

  // Next.js ISR caching options
  // In development, always fetch fresh data from Shopify so price & inventory changes reflect immediately.
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev || revalidate === false || revalidate === 0) {
    fetchOptions.cache = 'no-store';
  } else {
    // Next.js extended RequestInit
    (fetchOptions as Record<string, unknown>).next = {
      tags,
      revalidate,
    };
    if (cache) {
      fetchOptions.cache = cache;
    }
  }

  let response: Response;
  try {
    response = await fetch(endpoint, fetchOptions);
  } catch (networkError: unknown) {
    const errorMsg = networkError instanceof Error ? networkError.message : String(networkError);
    console.error(`[Shopify Client Network Error] Failed to reach ${endpoint}:`, errorMsg);
    throw new ShopifyApiError(`Network failure while connecting to Shopify: ${errorMsg}`, 503);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error(`[Shopify Client HTTP ${response.status}] ${response.statusText}:`, errorText);
    throw new ShopifyApiError(
      `[Shopify Storefront API] HTTP error ${response.status}: ${response.statusText}`,
      response.status,
      [errorText],
      query
    );
  }

  const json: ShopifyGraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    const errorMessages = json.errors.map((e) => e.message).join('; ');
    console.error(`[Shopify GraphQL Errors]:`, json.errors);
    throw new ShopifyApiError(
      `[Shopify GraphQL Error] ${errorMessages}`,
      400,
      json.errors,
      query
    );
  }

  if (!json.data) {
    throw new ShopifyApiError('[Shopify API] Missing data in response payload', 500);
  }

  return json.data;
}

/**
 * Executes a GraphQL query/mutation against the Shopify Admin API
 * utilizing native fetch with server-side Admin Access Token.
 * Note: NEVER expose this on the client side.
 */
export async function shopifyAdminFetch<T, V = Record<string, unknown>>({
  query,
  variables,
}: {
  query: string;
  variables?: V;
}): Promise<T> {
  if (!shopifyConfig.storeDomain || !shopifyConfig.adminAccessToken) {
    throw new ShopifyApiError(
      '[Shopify Admin Client] Store domain or Admin Access Token is missing.',
      400
    );
  }

  const endpoint = `https://${shopifyConfig.storeDomain}/admin/api/${shopifyConfig.apiVersion}/graphql.json`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Shopify-Access-Token': shopifyConfig.adminAccessToken,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new ShopifyApiError(
      `[Shopify Admin API] HTTP error ${response.status}: ${response.statusText}`,
      response.status,
      [errorText],
      query
    );
  }

  const json: ShopifyGraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    const errorMessages = json.errors.map((e) => e.message).join('; ');
    throw new ShopifyApiError(
      `[Shopify Admin GraphQL Error] ${errorMessages}`,
      400,
      json.errors,
      query
    );
  }

  if (!json.data) {
    throw new ShopifyApiError('[Shopify Admin API] Missing data in response payload', 500);
  }

  return json.data;
}
