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
import {
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
  CUSTOMER_RECOVER_MUTATION,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
} from './mutations/customer';
import { GET_CUSTOMER_QUERY } from './queries/getCustomer';
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
  Customer,
  CustomerAccessToken,
  CustomerCreateInput,
  CustomerAccessTokenCreateInput,
  CustomerCreateMutationResult,
  CustomerAccessTokenCreateMutationResult,
  CustomerAccessTokenDeleteMutationResult,
  CustomerRecoverMutationResult,
  GetCustomerQueryResult,
  CartBuyerIdentityUpdateMutationResult,
  ShopifyUserError,
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
        attributes: (line.attributes || []).map((attr) => ({ key: attr.key, value: attr.value })),
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
const SWR_TTL_MS = process.env.NODE_ENV === 'production' ? 60000 : 2000;
let isRevalidatingAll = false;
const revalidatingHandles = new Set<string>();

async function revalidateProductsInBackground(): Promise<void> {
  if (isRevalidatingAll) return;
  isRevalidatingAll = true;
  try {
    const data = await shopifyFetch<GetProductsQueryResult>({
      query: GET_PRODUCTS_QUERY,
      variables: { first: 50 },
      tags: ['products'],
      revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0,
    });
    if (data.products?.edges && data.products.edges.length > 0) {
      const normalized = data.products.edges.map((edge) => normalizeProduct(edge.node));
      const now = Date.now();
      inMemoryProductsCache = { data: normalized, timestamp: now };
      // Pre-warm individual handle and ID lookup maps
      for (const p of normalized) {
        inMemoryProductMap.set(p.slug, { data: p, timestamp: now });
        inMemoryProductMap.set(p.id, { data: p, timestamp: now });
      }
    }
  } catch {
    // Non-blocking background revalidation failure handled gracefully
  } finally {
    isRevalidatingAll = false;
  }
}

async function revalidateProductInBackground(handle: string): Promise<void> {
  if (revalidatingHandles.has(handle)) return;
  revalidatingHandles.add(handle);
  try {
    const data = await shopifyFetch<GetProductByHandleQueryResult>({
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
      tags: ['products', `product-${handle}`],
      revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0,
    });
    if (data.product) {
      const normalized = normalizeProduct(data.product);
      const now = Date.now();
      inMemoryProductMap.set(handle, { data: normalized, timestamp: now });
      inMemoryProductMap.set(normalized.slug, { data: normalized, timestamp: now });
      inMemoryProductMap.set(normalized.id, { data: normalized, timestamp: now });
    }
  } catch {
    // Non-blocking background revalidation failure handled gracefully
  } finally {
    revalidatingHandles.delete(handle);
  }
}

export function clearShopifyMemoryCache(): void {
  inMemoryProductsCache = null;
  inMemoryProductMap.clear();
}

// ==========================================
// Catalog APIs
// ==========================================

/**
 * Fetches the product catalog from Shopify Storefront API.
 * Uses in-memory micro-cache + true Stale-While-Revalidate for sub-millisecond response times.
 */
export const getProducts = cache(async function getProducts(options?: {
  first?: number;
  query?: string;
}): Promise<Product[]> {
  if (!isShopifyConfigured()) {
    return PRODUCTS;
  }

  const now = Date.now();
  if (process.env.NODE_ENV === 'production' && !options?.query && inMemoryProductsCache) {
    if (now - inMemoryProductsCache.timestamp >= SWR_TTL_MS) {
      // Revalidate in background without blocking response
      revalidateProductsInBackground();
    }
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
      revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0,
    });

    if (!data.products?.edges || data.products.edges.length === 0) {
      console.warn('[Shopify API] No products found on remote store. Using local mock dataset.');
      return PRODUCTS;
    }

    const normalized = data.products.edges.map((edge) => normalizeProduct(edge.node));
    if (!options?.query) {
      inMemoryProductsCache = { data: normalized, timestamp: now };
      // Pre-warm individual handle and ID lookup maps for instantaneous PDP loads
      for (const p of normalized) {
        inMemoryProductMap.set(p.slug, { data: p, timestamp: now });
        inMemoryProductMap.set(p.id, { data: p, timestamp: now });
      }
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
 * Uses in-memory micro-cache in production, or live fetch in dev.
 */
export const getProduct = cache(async function getProduct(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured()) {
    return fallbackFindProduct(handle);
  }

  const now = Date.now();

  if (process.env.NODE_ENV === 'production') {
    // 1. Direct hit in individual product map (0 ms)
    const cached = inMemoryProductMap.get(handle);
    if (cached && cached.data) {
      if (now - cached.timestamp >= SWR_TTL_MS) {
        // Revalidate in background without blocking response
        revalidateProductInBackground(handle);
      }
      return cached.data;
    }

    // 2. Fast-path hit from catalog cache (e.g. loaded via homepage or products catalog)
    if (inMemoryProductsCache?.data) {
      const found = inMemoryProductsCache.data.find(
        (p) => p.slug === handle || p.id === handle || p.id.replace('prod-', '') === handle
      );
      if (found) {
        inMemoryProductMap.set(handle, { data: found, timestamp: now });
        inMemoryProductMap.set(found.slug, { data: found, timestamp: now });
        inMemoryProductMap.set(found.id, { data: found, timestamp: now });
        return found;
      }
    }
  }

  // 3. Remote Shopify Storefront GraphQL fetch
  try {
    const data = await shopifyFetch<GetProductByHandleQueryResult>({
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
      tags: ['products', `product-${handle}`],
      revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0,
    });

    if (!data.product) {
      return fallbackFindProduct(handle);
    }

    const normalized = normalizeProduct(data.product);
    inMemoryProductMap.set(handle, { data: normalized, timestamp: now });
    inMemoryProductMap.set(normalized.slug, { data: normalized, timestamp: now });
    inMemoryProductMap.set(normalized.id, { data: normalized, timestamp: now });
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
          // Sentinel: Weak random number generation (Math.random()) replaced with cryptographically secure API.
          const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString();
          updatedLines.push({
            node: {
              id: `mock_line_${Date.now()}_${uuid}`,
              quantity: newLine.quantity,
              cost: {
                totalAmount: { amount: String(1299 * newLine.quantity), currencyCode: 'INR' },
              },
              attributes: (newLine.attributes || []).map((attr) => ({ key: attr.key, value: attr.value })),
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

// ==========================================
// Customer Authentication & Account APIs
// 100% Native Shopify Storefront API
// ==========================================

export async function loginCustomer(
  input: CustomerAccessTokenCreateInput
): Promise<{ token: CustomerAccessToken | null; userErrors: ShopifyUserError[] }> {
  if (!isShopifyConfigured()) {
    return {
      token: {
        accessToken: `mock_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      userErrors: [],
    };
  }

  try {
    const data = await shopifyFetch<CustomerAccessTokenCreateMutationResult>({
      query: CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
      variables: { input },
      revalidate: false,
    });

    return {
      token: data.customerAccessTokenCreate.customerAccessToken,
      userErrors: data.customerAccessTokenCreate.customerUserErrors || [],
    };
  } catch (error) {
    console.error('[Shopify Auth API] loginCustomer failed:', error);
    return {
      token: null,
      userErrors: [{ message: 'Unable to connect to Shopify. Please try again.' }],
    };
  }
}

export async function registerCustomer(
  input: CustomerCreateInput
): Promise<{ customer: { id: string; email: string } | null; userErrors: ShopifyUserError[] }> {
  if (!isShopifyConfigured()) {
    return {
      customer: {
        id: `mock_customer_${Date.now()}`,
        email: input.email,
      },
      userErrors: [],
    };
  }

  try {
    const data = await shopifyFetch<CustomerCreateMutationResult>({
      query: CUSTOMER_CREATE_MUTATION,
      variables: { input },
      revalidate: false,
    });

    return {
      customer: data.customerCreate.customer,
      userErrors: data.customerCreate.customerUserErrors || [],
    };
  } catch (error) {
    console.error('[Shopify Auth API] registerCustomer failed:', error);
    return {
      customer: null,
      userErrors: [{ message: 'Registration failed. Please try again.' }],
    };
  }
}

export async function logoutCustomer(
  customerAccessToken: string
): Promise<{ success: boolean; userErrors: ShopifyUserError[] }> {
  if (!isShopifyConfigured() || customerAccessToken.startsWith('mock_token_')) {
    return { success: true, userErrors: [] };
  }

  try {
    const data = await shopifyFetch<CustomerAccessTokenDeleteMutationResult>({
      query: CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
      variables: { customerAccessToken },
      revalidate: false,
    });

    return {
      success: Boolean(data.customerAccessTokenDelete.deletedAccessToken),
      userErrors: data.customerAccessTokenDelete.userErrors || [],
    };
  } catch (error) {
    console.error('[Shopify Auth API] logoutCustomer failed:', error);
    return { success: false, userErrors: [] };
  }
}

export async function getCustomer(
  customerAccessToken: string
): Promise<Customer | null> {
  if (!isShopifyConfigured() || customerAccessToken.startsWith('mock_token_')) {
    return {
      id: 'mock_cust_01',
      firstName: 'Sanctuary',
      lastName: 'Connoisseur',
      displayName: 'Sanctuary Connoisseur',
      email: 'patron@moamlight.in',
      phone: '+91 98765 43210',
      defaultAddress: {
        id: 'mock_addr_01',
        address1: '14/2 Indiranagar 100ft Rd',
        city: 'Bengaluru',
        province: 'Karnataka',
        zip: '560038',
        country: 'India',
        phone: '+91 98765 43210',
      },
      orders: {
        edges: [
          {
            node: {
              id: 'mock_order_101',
              name: '#MOAM-1042',
              orderNumber: 1042,
              processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              financialStatus: 'PAID',
              fulfillmentStatus: 'FULFILLED',
              statusUrl: 'https://eyj01h-j3.myshopify.com',
              totalPrice: { amount: '2598', currencyCode: 'INR' },
              lineItems: {
                edges: [
                  {
                    node: {
                      title: 'Mysore Sandalwood & Amber (450g)',
                      quantity: 1,
                      variant: {
                        id: 'v1',
                        title: 'Grand 450g',
                        price: { amount: '2199', currencyCode: 'INR' },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    };
  }

  try {
    const data = await shopifyFetch<GetCustomerQueryResult>({
      query: GET_CUSTOMER_QUERY,
      variables: { customerAccessToken },
      revalidate: false,
    });

    return data.customer;
  } catch (error) {
    console.warn('[Shopify Auth API] getCustomer failed:', error);
    return null;
  }
}

export async function recoverCustomerPassword(
  email: string
): Promise<{ success: boolean; userErrors: ShopifyUserError[] }> {
  if (!isShopifyConfigured()) {
    return { success: true, userErrors: [] };
  }

  try {
    const data = await shopifyFetch<CustomerRecoverMutationResult>({
      query: CUSTOMER_RECOVER_MUTATION,
      variables: { email },
      revalidate: false,
    });

    return {
      success: (data.customerRecover.customerUserErrors || []).length === 0,
      userErrors: data.customerRecover.customerUserErrors || [],
    };
  } catch (error) {
    console.error('[Shopify Auth API] recoverCustomerPassword failed:', error);
    return {
      success: false,
      userErrors: [{ message: 'Unable to send recovery email.' }],
    };
  }
}

export async function updateCartBuyerIdentity(
  cartId: string,
  buyerIdentity: { customerAccessToken?: string; email?: string; phone?: string }
): Promise<ShopifyCart | null> {
  if (!isShopifyConfigured() || cartId.startsWith('mock_cart_')) {
    return mockCartStorage.get(cartId) || null;
  }

  try {
    const data = await shopifyFetch<CartBuyerIdentityUpdateMutationResult>({
      query: CART_BUYER_IDENTITY_UPDATE_MUTATION,
      variables: {
        cartId,
        buyerIdentity,
      },
      revalidate: false,
    });

    return data.cartBuyerIdentityUpdate.cart;
  } catch (error) {
    console.error('[Shopify Cart API] updateCartBuyerIdentity failed:', error);
    return null;
  }
}

