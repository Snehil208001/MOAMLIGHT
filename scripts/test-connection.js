// Script to test live connection to Shopify Storefront & Admin APIs
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  });
}

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'eyj01h-j3.myshopify.com';
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

console.log('---------------------------------------------');
console.log('MOAMLIGHT Shopify Connection Diagnostic');
console.log(`Store Domain: ${domain}`);
console.log(`Admin Token: ${adminToken ? adminToken.slice(0, 10) + '...' : 'Not Set'}`);
console.log(`Storefront Token: ${storefrontToken ? storefrontToken.slice(0, 10) + '...' : 'Not Set'}`);
console.log('---------------------------------------------\n');

function testAdmin() {
  if (!adminToken) {
    console.log('[Admin API] ⚠️ No SHOPIFY_ADMIN_ACCESS_TOKEN configured.');
    return;
  }

  const req = https.request({
    hostname: domain,
    path: '/admin/api/2024-07/shop.json',
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': adminToken,
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          console.log(`[Admin API] ✅ Successfully connected! Store Name: "${parsed.shop.name}"`);
        } catch (e) {
          console.log(`[Admin API] ✅ Connected with HTTP 200`);
        }
      } else {
        console.log(`[Admin API] ❌ HTTP ${res.statusCode}: ${data}`);
      }
    });
  });
  req.on('error', (e) => console.log(`[Admin API] Error: ${e.message}`));
  req.end();
}

function testStorefront() {
  if (!storefrontToken) {
    console.log('[Storefront API] ⚠️ No NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN configured yet.');
    console.log('                  (The app is currently using Graceful Mock Fallback mode)');
    return;
  }

  const body = JSON.stringify({
    query: '{ shop { name } products(first: 3) { edges { node { id title } } } }'
  });

  const req = https.request({
    hostname: domain,
    path: '/api/2024-07/graphql.json',
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': storefrontToken,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) {
            console.log(`[Storefront API] ❌ GraphQL Error:`, parsed.errors);
          } else {
            console.log(`[Storefront API] ✅ Successfully connected! Storefront live.`);
          }
        } catch (e) {
          console.log(`[Storefront API] ✅ HTTP 200`);
        }
      } else {
        console.log(`[Storefront API] ❌ HTTP ${res.statusCode}: ${data}`);
      }
    });
  });
  req.on('error', (e) => console.log(`[Storefront API] Error: ${e.message}`));
  req.write(body);
  req.end();
}

testAdmin();
testStorefront();
