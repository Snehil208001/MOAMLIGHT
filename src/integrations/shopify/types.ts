/**
 * Shopify Storefront API GraphQL TypeScript Types
 *
 * MOAMLIGHT D2C E-Commerce Platform
 */

// ==========================================
// Base Scalar & Entity Types
// ==========================================

export interface ShopifyImage {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface ShopifyMetafield {
  value?: string | null;
  key?: string;
  namespace?: string;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyUserError {
  field?: string[] | string | null;
  message: string;
  code?: string | null;
}

// ==========================================
// Variant & Product Types
// ==========================================

export interface ShopifyVariant {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  selectedOptions?: ShopifySelectedOption[];
  weight?: number | null;
  weightUnit?: string | null;
  weightGrams?: ShopifyMetafield | null;
  burnTimeHours?: ShopifyMetafield | null;
  wicksCount?: ShopifyMetafield | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  tags: string[];
  vendor?: string;
  productType?: string;
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
  } | null;
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: { node: ShopifyVariant }[];
  };
  tagline?: ShopifyMetafield | null;
  scentCategory?: ShopifyMetafield | null;
  mood?: ShopifyMetafield | null;
  intensity?: ShopifyMetafield | null;
  topNotes?: ShopifyMetafield | null;
  heartNotes?: ShopifyMetafield | null;
  baseNotes?: ShopifyMetafield | null;
  scentDescription?: ShopifyMetafield | null;
  waxType?: ShopifyMetafield | null;
  wickType?: ShopifyMetafield | null;
  vessel?: ShopifyMetafield | null;
  dimensions?: ShopifyMetafield | null;
  burnTime?: ShopifyMetafield | null;
  origin?: ShopifyMetafield | null;
  ritualFirstBurn?: ShopifyMetafield | null;
  ritualMaintenance?: ShopifyMetafield | null;
  ritualSafety?: ShopifyMetafield | null;
  ritualVesselReuse?: ShopifyMetafield | null;
}

// ==========================================
// Cart Types
// ==========================================

export interface ShopifyCartDiscountCode {
  code: string;
  applicable: boolean;
}

export interface ShopifyCartAttribute {
  key: string;
  value: string;
}

export interface ShopifyCartCost {
  subtotalAmount: ShopifyMoney;
  totalAmount: ShopifyMoney;
  totalTaxAmount?: ShopifyMoney | null;
  totalDutyAmount?: ShopifyMoney | null;
}

export interface ShopifyCartLineMerchandise {
  id: string;
  title: string;
  sku?: string | null;
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  product: {
    id: string;
    handle: string;
    title: string;
    scentCategory?: ShopifyMetafield | null;
  };
  image?: ShopifyImage | null;
  weightGrams?: ShopifyMetafield | null;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyMoney;
  };
  merchandise: ShopifyCartLineMerchandise;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  note?: string | null;
  discountCodes?: ShopifyCartDiscountCode[];
  attributes?: ShopifyCartAttribute[];
  cost: ShopifyCartCost;
  lines: {
    edges: { node: ShopifyCartLine }[];
  };
}

// ==========================================
// GraphQL Mutation & Query Input Types
// ==========================================

export interface AttributeInput {
  key: string;
  value: string;
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: AttributeInput[];
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
  merchandiseId?: string;
  attributes?: AttributeInput[];
}

export interface CartInput {
  lines?: CartLineInput[];
  attributes?: AttributeInput[];
  discountCodes?: string[];
  note?: string;
}

// ==========================================
// API Response Wrappers
// ==========================================

export interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, unknown>;
  }>;
}

export interface GetProductsQueryResult {
  products: {
    edges: {
      cursor?: string;
      node: ShopifyProduct;
    }[];
    pageInfo?: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
}

export interface GetProductByHandleQueryResult {
  product: ShopifyProduct | null;
}

export interface CartCreateMutationResult {
  cartCreate: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartLinesAddMutationResult {
  cartLinesAdd: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartLinesUpdateMutationResult {
  cartLinesUpdate: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartLinesRemoveMutationResult {
  cartLinesRemove: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartDiscountCodesUpdateMutationResult {
  cartDiscountCodesUpdate: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface CartAttributesUpdateMutationResult {
  cartAttributesUpdate: {
    cart: ShopifyCart | null;
    userErrors: ShopifyUserError[];
  };
}

export interface GetCartQueryResult {
  cart: ShopifyCart | null;
}

// ==========================================
// Client Fetch Options
// ==========================================

export interface ShopifyFetchOptions<V = Record<string, unknown>> {
  query: string;
  variables?: V;
  tags?: string[];
  revalidate?: number | false;
  cache?: RequestCache;
}
