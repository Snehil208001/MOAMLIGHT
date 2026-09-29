import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  });
}

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

console.log('Testing live products query to Shopify Storefront API:');
console.log('Domain:', domain);

const query = `
  query getProducts {
    products(first: 10) {
      edges {
        node {
          id
          handle
          title
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                sku
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const res = await fetch(`https://${domain}/api/2024-07/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({ query }),
});

const data = await res.json();
if (data.errors) {
  console.error('GraphQL Errors:', data.errors);
} else {
  const products = data.data.products.edges;
  console.log(`\n✅ Fetched ${products.length} LIVE PRODUCTS from Shopify:`);
  products.forEach(({ node }, i) => {
    console.log(`\n${i + 1}. [Shopify ID: ${node.id}]`);
    console.log(`   Title:   ${node.title}`);
    console.log(`   Handle:  ${node.handle}`);
    console.log(`   Price:   ${node.priceRange.minVariantPrice.currencyCode} ${node.priceRange.minVariantPrice.amount}`);
    console.log(`   Variants (${node.variants.edges.length}):`);
    node.variants.edges.forEach(({ node: v }) => {
      console.log(`     - Variant ID: ${v.id} | ${v.title} | ${v.price.currencyCode} ${v.price.amount} | SKU: ${v.sku}`);
    });
  });
}
