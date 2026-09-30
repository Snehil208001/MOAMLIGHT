/**
 * Shopify GraphQL Query: getCustomer
 *
 * MOAMLIGHT D2C E-Commerce Platform
 * 100% Native Shopify Storefront API Customer Profile & Order History
 */

export const GET_CUSTOMER_QUERY = /* GraphQL */ `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      displayName
      email
      phone
      defaultAddress {
        id
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            zip
            country
            phone
          }
        }
      }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            statusUrl
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url(transform: { maxWidth: 200, preferredContentType: WEBP })
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
