/**
 * Shopify GraphQL Query: getCart
 *
 * MOAMLIGHT D2C E-Commerce Platform
 */

import { CART_FRAGMENT } from '../mutations/cart';

export const GET_CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
`;
