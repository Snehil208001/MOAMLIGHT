/**
 * Shopify GraphQL Query: getProduct (by Handle)
 *
 * MOAMLIGHT D2C E-Commerce Platform
 */

import { PRODUCT_FRAGMENT } from './getProducts';

export const GET_PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
`;
