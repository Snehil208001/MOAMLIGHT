/**
 * High-Level Typed Shopify Storefront API Methods
 *
 * MOAMLIGHT D2C E-Commerce Platform
 */

import { shopifyFetch, ShopifyApiError } from './client';
import { isShopifyConfigured } from './config';
import { GET_PRODUCTS_QUERY } from './queries/getProducts';
import { GET_PRODUCT_BY_HANDLE_QUERY } from './queries/getProduct';
import { GET_CART_QUERY } from './queries/getCart';
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_ATTRIBUTES_UPDATE_MUTATION,
} from './mutations/cart';
import { normalizeProduct } from './normalize';
import { PRODUCTS, getProductBySlug, getProductById } from '@/data/products';
import { Product } from '@/types/product';
import {
  ShopifyCart,
  GetProductsQueryResult,
  GetProductByHandleQueryResult,
  CartCreateMutationResult,
  CartLinesAddMutationResult,
  CartLinesUpdateMutationResult,
  CartLinesRemoveMutationResult,
  CartDiscountCodesUpdateMutationResult,
  CartAttributesUpdateMutationResult,
  GetCartQueryResult,
  CartLineInput,
  CartLineUpdateInput,
  AttributeInput,
} from './types';

// ==========================================
// Mock Fallback Cart Generator
// ==========================================

function createMockCart(
  lines: CartLineInput[] = [],
  attributes: AttributeInput[] = [],
  discountCodes: string[] = []
): ShopifyCart {
  const timestamp = Date.now();
  let totalQty = 0;
  let subtotal = 0;

  const edges = lines.map((line, idx) => {
    totalQty += line.quantity;
    const price = 1299;
    subtotal += price * line.quantity;
    return {
      node: {
        id: `mock_line_${timestamp}_${idx}`,
        quantity: line.quantity,
        cost: {
          totalAmount: {
            amount: String(price * line.quantity),
            currencyCode: 'INR',
          },
        },
        merchandise: {
          id: line.merchandiseId,
          title: 'Classic 240g',
          sku: 'MOAM-MOCK-240',
          price: { amount: String(price), currencyCode: 'INR' },
          compareAtPrice: { amount: String(Math.round(price * 1.25)), currencyCode: 'INR' },
          product: {
            id: 'prod-mock',
            handle: 'mock-candle',
            title: 'Handcrafted Candle',
            scentCategory: { value: 'Woody & Meditative' },
          },
          image: {
            url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
          },
          weightGrams: { value: '240' },
        },
      },
    };
  });

  return {
    id: `mock_cart_${timestamp}`,
    checkoutUrl: '/checkout',
    totalQuantity: totalQty,
    note: '',
    discountCodes: discountCodes.map((code) => ({ code, applicable: true })),
    attributes: attributes.map((attr) => ({ key: attr.key, value: attr.value })),
    cost: {
      subtotalAmount: { amount: String(subtotal), currencyCode: 'INR' },
      totalAmount: { amount: String(subtotal), currencyCode: 'INR' },
      totalTaxAmount: { amount: '0', currencyCode: 'INR' },
      totalDutyAmount: { amount: '0', currencyCode: 'INR' },
    },
    lines: {
      edges,
    },
  };
}

// In-memory store for mock carts during local testing/development
const mockCartStorage = new Map<string, ShopifyCart>();

// ==========================================
import { cache } from 'react';

// In-Memory Micro-Cache for sub-millisecond (< 1ms) response times
let inMemoryProductsCache: {
  data: Product[];
  timestamp: number;
} | null = null;

const inMemoryProductMap = new Map<string, { data: Product | null; timestamp: number }>();
const SWR_TTL_MS = 5000; // 5-second ultra-fresh cache window: loads in 0ms, updates from Shopify within 5s

export function clearShopifyMemoryCache(): void {
  inMemoryProductsCache = null;
  inMemoryProductMap.clear();
}

// ==========================================
// Catalog APIs
// ==========================================

/**
 * Fetches the product catalog from Shopify Storefront API.
 * Uses in-memory micro-cache + React.cache() for sub-millisecond response times.
 */
export const getProducts = cache(async function getProducts(options?: {
  first?: number;
  query?: string;
}): Promise<Product[]> {
  if (!isShopifyConfigured()) {
    return PRODUCTS;
  }

  const now = Date.now();
  if (
    !options?.query &&
    inMemoryProductsCache &&
    now - inMemoryProductsCache.timestamp < SWR_TTL_MS
  ) {
    return inMemoryProductsCache.data;
  }

  try {
    const data = await shopifyFetch<GetProductsQueryResult>({
      query: GET_PRODUCTS_QUERY,
      variables: {
        first: options?.first ?? 50,
        query: options?.query,
      },
      tags: ['products'],
      revalidate: 3600,
    });

    if (!data.products?.edges || data.products.edges.length === 0) {
      console.warn('[Shopify API] No products found on remote store. Using local mock dataset.');
      return PRODUCTS;
    }

    const normalized = data.products.edges.map((edge) => normalizeProduct(edge.node));
    if (!options?.query) {
      inMemoryProductsCache = { data: normalized, timestamp: now };
    }
    return normalized;
  } catch (error) {
    console.warn('[Shopify API] getProducts failed, falling back to mock catalog:', error);
    return PRODUCTS;
  }
});

function fallbackFindProduct(key: string): Product | null {
  return (
    getProductBySlug(key) ||
    getProductById(key) ||
    PRODUCTS.find((p) => p.id.replace('prod-', '') === key) ||
    null
  );
}

/**
 * Fetches a single product by handle/slug from Shopify Storefront API.
 * Uses in-memory micro-cache + React.cache() to deduplicate requests across generateMetadata and PDP components.
 */
export const getProduct = cache(async function getProduct(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured()) {
    return fallbackFindProduct(handle);
  }

  const now = Date.now();
  const cached = inMemoryProductMap.get(handle);
  if (cached && now - cached.timestamp < SWR_TTL_MS) {
    return cached.data;
  }

  try {
    const data = await shopifyFetch<GetProductByHandleQueryResult>({
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
      tags: ['products', `product-${handle}`],
      revalidate: 3600,
    });

    if (!data.product) {
      return fallbackFindProduct(handle);
    }

    const normalized = normalizeProduct(data.product);
    inMemoryProductMap.set(handle, { data: normalized, timestamp: now });
    return normalized;
  } catch (error) {
    console.warn(`[Shopify API] getProduct(${handle}) failed, fallback to mock:`, error);
    return fallbackFindProduct(handle);
  }
});

// ==========================================
// Cart APIs
// ==========================================

/**
 * Creates a new checkout-enabled cart on Shopify.
 * In mock mode, generates an in-memory mock cart with local checkout routing.
 */
export async function createCart(
  lines?: CartLineInput[],
  attributes?: AttributeInput[],
  discountCodes?: string[]
): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured()) {
    const mock = createMockCart(lines, attributes, discountCodes);
    mockCartStorage.set(mock.id, mock);
    return mock;
  }

  try {
    const data = await shopifyFetch<CartCreateMutationResult>({
      query: CART_CREATE_MUTATION,
      variables: {
        input: {
          lines,
          attributes,
          discountCodes,
        },
      },
      revalidate: false,
    });

    if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
      console.warn('[Shopify Cart API] userErrors on cartCreate:', data.cartCreate.userErrors);
    }

    if (!data.cartCreate.cart) {
      console.warn('[Shopify Cart API] cartCreate returned null (e.g. unmapped variant ID), falling back to mock cart');
      const mock = createMockCart(lines, attributes, discountCodes);
      mockCartStorage.set(mock.id, mock);
      return mock;
    }

    return data.cartCreate.cart;
  } catch (error) {
    console.error('[Shopify Cart API] createCart failed:', error);
    const mock = createMockCart(lines, attributes, discountCodes);
    mockCartStorage.set(mock.id, mock);
    return mock;
  }
}

/**
 * Adds line items to an existing Shopify cart.
 */
export async function addToCart(
  cartId: string,
  lines: CartLineInput[]
): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured() || cartId.startsWith('mock_cart_')) {
    const existing = mockCartStorage.get(cartId);
    if (existing) {
      const updatedLines = [...existing.lines.edges];
      lines.forEach((newLine) => {
        const found = updatedLines.find((e) => e.node.merchandise.id === newLine.merchandiseId);
        if (found) {
          found.node.quantity += newLine.quantity;
        } else {
          updatedLines.push({
            node: {
              id: `mock_line_${Date.now()}_${Math.random()}`,
              quantity: newLine.quantity,
              cost: {
                totalAmount: { amount: String(1299 * newLine.quantity), currencyCode: 'INR' },
              },
              merchandise: {
                id: newLine.merchandiseId,
                title: 'Selected Variant',
                price: { amount: '1299', currencyCode: 'INR' },
                product: {
                  id: 'prod-mock',
                  handle: 'mock-candle',
                  title: 'Artisan Candle',
                },
              },
            },
          });
        }
      });
      existing.lines.edges = updatedLines;
      existing.totalQuantity = updatedLines.reduce((acc, l) => acc + l.node.quantity, 0);
      mockCartStorage.set(cartId, existing);
      return existing;
    }
    return createMockCart(lines);
  }

  try {
    const data = await shopifyFetch<CartLinesAddMutationResult>({
      query: CART_LINES_ADD_MUTATION,
      variables: { cartId, lines },
      revalidate: false,
    });

    if (data.cartLinesAdd.userErrors && data.cartLinesAdd.userErrors.length > 0) {
      console.warn('[Shopify Cart API] userErrors on addToCart:', data.cartLinesAdd.userErrors);
    }

    return data.cartLinesAdd.cart;
  } catch (error) {
    console.error(`[Shopify Cart API] addToCart failed for cart ${cartId}:`, error);
    return null;
  }
}

/**
 * Updates quantities and attributes of line items in an existing cart.
 */
export async function updateCart(
  cartId: string,
  lines: CartLineUpdateInput[]
): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured() || cartId.startsWith('mock_cart_')) {
    const existing = mockCartStorage.get(cartId);
    if (existing) {
      existing.lines.edges = existing.lines.edges.map((edge) => {
        const match = lines.find((l) => l.id === edge.node.id);
        if (match) {
          return {
            ...edge,
            node: {
              ...edge.node,
              quantity: match.quantity,
            },
          };
        }
        return edge;
      });
      existing.totalQuantity = existing.lines.edges.reduce((acc, l) => acc + l.node.quantity, 0);
      mockCartStorage.set(cartId, existing);
      return existing;
    }
    return null;
  }

  try {
    const data = await shopifyFetch<CartLinesUpdateMutationResult>({
      query: CART_LINES_UPDATE_MUTATION,
      variables: { cartId, lines },
      revalidate: false,
    });

    if (data.cartLinesUpdate.userErrors && data.cartLinesUpdate.userErrors.length > 0) {
      console.warn('[Shopify Cart API] userErrors on updateCart:', data.cartLinesUpdate.userErrors);
    }

    return data.cartLinesUpdate.cart;
  } catch (error) {
    console.error(`[Shopify Cart API] updateCart failed for cart ${cartId}:`, error);
    return null;
  }
}

/**
 * Removes one or more line items from an existing cart by their line IDs.
 */
export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured() || cartId.startsWith('mock_cart_')) {
    const existing = mockCartStorage.get(cartId);
    if (existing) {
      existing.lines.edges = existing.lines.edges.filter(
        (edge) => !lineIds.includes(edge.node.id)
      );
      existing.totalQuantity = existing.lines.edges.reduce((acc, l) => acc + l.node.quantity, 0);
      mockCartStorage.set(cartId, existing);
      return existing;
    }
    return null;
  }

  try {
    const data = await shopifyFetch<CartLinesRemoveMutationResult>({
      query: CART_LINES_REMOVE_MUTATION,
      variables: { cartId, lineIds },
      revalidate: false,
    });

    if (data.cartLinesRemove.userErrors && data.cartLinesRemove.userErrors.length > 0) {
      console.warn('[Shopify Cart API] userErrors on removeFromCart:', data.cartLinesRemove.userErrors);
    }

    return data.cartLinesRemove.cart;
  } catch (error) {
    console.error(`[Shopify Cart API] removeFromCart failed for cart ${cartId}:`, error);
    return null;
  }
}

/**
 * Fetches an existing cart by its ID to rehydrate user sessions.
 */
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured() || cartId.startsWith('mock_cart_')) {
    return mockCartStorage.get(cartId) || null;
  }

  try {
    const data = await shopifyFetch<GetCartQueryResult>({
      query: GET_CART_QUERY,
      variables: { cartId },
      revalidate: false,
    });

    return data.cart;
  } catch (error) {
    console.warn(`[Shopify Cart API] getCart(${cartId}) failed:`, error);
    return null;
  }
}

/**
 * Applies or updates discount codes on an active cart.
 */
export async function applyDiscountCodes(
  cartId: string,
  discountCodes: string[]
): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured() || cartId.startsWith('mock_cart_')) {
    const existing = mockCartStorage.get(cartId);
    if (existing) {
      existing.discountCodes = discountCodes.map((code) => ({ code, applicable: true }));
      return existing;
    }
    return null;
  }

  try {
    const data = await shopifyFetch<CartDiscountCodesUpdateMutationResult>({
      query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
      variables: { cartId, discountCodes },
      revalidate: false,
    });

    return data.cartDiscountCodesUpdate.cart;
  } catch (error) {
    console.error(`[Shopify Cart API] applyDiscountCodes failed for cart ${cartId}:`, error);
    return null;
  }
}

/**
 * Updates custom attributes (e.g., gift message, packaging preferences) on an active cart.
 */
export async function updateCartAttributes(
  cartId: string,
  attributes: AttributeInput[]
): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured() || cartId.startsWith('mock_cart_')) {
    const existing = mockCartStorage.get(cartId);
    if (existing) {
      existing.attributes = attributes;
      return existing;
    }
    return null;
  }

  try {
    const data = await shopifyFetch<CartAttributesUpdateMutationResult>({
      query: CART_ATTRIBUTES_UPDATE_MUTATION,
      variables: { cartId, attributes },
      revalidate: false,
    });

    return data.cartAttributesUpdate.cart;
  } catch (error) {
    console.error(`[Shopify Cart API] updateCartAttributes failed for cart ${cartId}:`, error);
    return null;
  }
}
