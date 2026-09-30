/**
 * Shopify GraphQL Query: getProducts
 *
 * MOAMLIGHT D2C E-Commerce Platform
 */

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFragment on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    vendor
    productType
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          url(transform: { maxWidth: 1200, preferredContentType: WEBP })
          altText
          width
          height
        }
      }
    }
    media(first: 20) {
      edges {
        node {
          mediaContentType
          ... on MediaImage {
            id
            image {
              url(transform: { maxWidth: 1200, preferredContentType: WEBP })
              altText
              width
              height
            }
          }
          ... on Video {
            id
            previewImage {
              url(transform: { maxWidth: 1200, preferredContentType: WEBP })
            }
            sources {
              url
              mimeType
              format
              height
              width
            }
          }
          ... on ExternalVideo {
            id
            embedUrl
            host
            previewImage {
              url(transform: { maxWidth: 1200, preferredContentType: WEBP })
            }
          }
        }
      }
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          sku
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          weight
          weightUnit
          weightGrams: metafield(namespace: "custom", key: "weight_grams") {
            value
          }
          burnTimeHours: metafield(namespace: "custom", key: "burn_time_hours") {
            value
          }
          wicksCount: metafield(namespace: "custom", key: "wicks_count") {
            value
          }
        }
      }
    }
    tagline: metafield(namespace: "custom", key: "tagline") {
      value
    }
    scentCategory: metafield(namespace: "custom", key: "scent_category") {
      value
    }
    mood: metafield(namespace: "custom", key: "mood") {
      value
    }
    intensity: metafield(namespace: "custom", key: "intensity") {
      value
    }
    topNotes: metafield(namespace: "custom", key: "top_notes") {
      value
    }
    heartNotes: metafield(namespace: "custom", key: "heart_notes") {
      value
    }
    baseNotes: metafield(namespace: "custom", key: "base_notes") {
      value
    }
    scentDescription: metafield(namespace: "custom", key: "scent_description") {
      value
    }
    waxType: metafield(namespace: "custom", key: "wax_type") {
      value
    }
    wickType: metafield(namespace: "custom", key: "wick_type") {
      value
    }
    vessel: metafield(namespace: "custom", key: "vessel") {
      value
    }
    dimensions: metafield(namespace: "custom", key: "dimensions") {
      value
    }
    burnTime: metafield(namespace: "custom", key: "burn_time") {
      value
    }
    origin: metafield(namespace: "custom", key: "origin") {
      value
    }
    ritualFirstBurn: metafield(namespace: "custom", key: "ritual_first_burn") {
      value
    }
    ritualMaintenance: metafield(namespace: "custom", key: "ritual_maintenance") {
      value
    }
    ritualSafety: metafield(namespace: "custom", key: "ritual_safety") {
      value
    }
    ritualVesselReuse: metafield(namespace: "custom", key: "ritual_vessel_reuse") {
      value
    }
  }
`;

export const GET_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query getProducts(
    $first: Int = 50,
    $query: String,
    $sortKey: ProductSortKeys = BEST_SELLING,
    $reverse: Boolean = false
  ) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      edges {
        cursor
        node {
          ...ProductFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
