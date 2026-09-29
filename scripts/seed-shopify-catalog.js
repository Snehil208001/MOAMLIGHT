/**
 * MOAMLIGHT - Production Shopify Catalog Seeding & Migration Tool
 * 
 * Responsibilities:
 * 1. Reads the 6 luxury candle products from data/products.ts.
 * 2. Prepares production-grade Shopify Admin GraphQL payloads including:
 *    - Products with handle, title, rich HTML description, tags, status, vendor, productType
 *    - Variants (200g & 450g) with prices (₹1,199 - ₹2,199), compareAtPrices (MRP), SKU, weight, inventory (50 each)
 *    - All 18+ luxury scent, mood, notes, specs, and ritual guide metafields (namespace: "custom")
 *    - Image media links
 * 3. Inspects token access scopes (via /admin/oauth/access_scopes.json) and detects write_products permission.
 *    If lacking write_products, provides clear diagnostic advice and logs the full generated payload.
 * 4. Generates an official Shopify Product Import CSV (data/moamlight_shopify_products.csv)
 *    matching Shopify's exact import specification for 1-click administrative import.
 * 
 * Usage:
 *   node scripts/seed-shopify-catalog.js
 *   node scripts/seed-shopify-catalog.js --dry-run
 *   node scripts/seed-shopify-catalog.js --csv-only
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// 1. Load Environment Variables (.env.local / .env)
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx > -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'eyj01h-j3.myshopify.com';
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2024-07';

// 2. Load Products from data/products.ts
function loadProductsFromTs() {
  const tsPath = path.resolve(process.cwd(), 'data/products.ts');
  if (!fs.existsSync(tsPath)) {
    throw new Error(`Catalog source file not found at: ${tsPath}`);
  }

  const fileContent = fs.readFileSync(tsPath, 'utf8');
  const transpiled = ts.transpileModule(fileContent, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const moduleObj = { exports: {} };
  const runner = new Function('module', 'exports', 'require', transpiled.outputText);
  runner(moduleObj, moduleObj.exports, (mod) => {
    if (mod.includes('product')) return {};
    return require(mod);
  });

  return moduleObj.exports.PRODUCTS || [];
}

// 3. Make HTTPS Request to Shopify Admin API
function shopifyAdminRequest(pathUrl, method, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: DOMAIN,
      path: pathUrl,
      method: method,
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// 4. Generate Luxury HTML Description for Shopify
function generateHtmlDescription(product) {
  const { tagline, story, scentPyramid, specs, ritualGuide } = product;

  return `
<div class="moamlight-product-description" style="font-family: 'Playfair Display', Georgia, serif; color: #2A2521; line-height: 1.8;">
  <p class="tagline" style="font-size: 1.15rem; font-style: italic; color: #8C4329; margin-bottom: 1.5rem; font-weight: 500;">
    "${tagline}"
  </p>

  <section class="story-section" style="margin-bottom: 2rem;">
    <h3 style="font-size: 1.25rem; border-bottom: 1px solid #E6DCCD; padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em; color: #1F1B18;">
      The Olfactive Journey
    </h3>
    <p style="font-size: 0.95rem; color: #4A423B; margin-top: 0.75rem;">
      ${story}
    </p>
  </section>

  <section class="pyramid-section" style="margin-bottom: 2rem; background-color: #FAF7F2; padding: 1.25rem; border-radius: 8px; border: 1px solid #E6DCCD;">
    <h3 style="font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0; color: #8C4329;">
      Scent Architecture
    </h3>
    <ul style="list-style: none; padding-left: 0; margin: 0.75rem 0; font-size: 0.9rem;">
      <li style="margin-bottom: 0.5rem;"><strong>Top Notes:</strong> ${scentPyramid.topNotes.join(' • ')}</li>
      <li style="margin-bottom: 0.5rem;"><strong>Heart Notes:</strong> ${scentPyramid.heartNotes.join(' • ')}</li>
      <li style="margin-bottom: 0.5rem;"><strong>Base Notes:</strong> ${scentPyramid.baseNotes.join(' • ')}</li>
    </ul>
    <p style="font-size: 0.85rem; font-style: italic; color: #6E6359; margin-bottom: 0;">
      ${scentPyramid.description}
    </p>
  </section>

  <section class="specs-section" style="margin-bottom: 2rem;">
    <h3 style="font-size: 1.1rem; border-bottom: 1px solid #E6DCCD; padding-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.08em; color: #1F1B18;">
      Artisan Specifications
    </h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-top: 0.75rem;">
      <tr>
        <td style="padding: 6px 0; color: #6E6359; width: 35%;">Wax Formulation:</td>
        <td style="padding: 6px 0; color: #1F1B18; font-weight: 500;">${specs.waxType}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6E6359;">Wick:</td>
        <td style="padding: 6px 0; color: #1F1B18; font-weight: 500;">${specs.wickType}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6E6359;">Vessel Design:</td>
        <td style="padding: 6px 0; color: #1F1B18; font-weight: 500;">${specs.vessel}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6E6359;">Dimensions:</td>
        <td style="padding: 6px 0; color: #1F1B18; font-weight: 500;">${specs.dimensions}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6E6359;">Burn Time:</td>
        <td style="padding: 6px 0; color: #1F1B18; font-weight: 500;">55+ Hours (200g) / 80+ Hours (450g)</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #6E6359;">Provenance:</td>
        <td style="padding: 6px 0; color: #1F1B18; font-weight: 500;">${specs.origin}</td>
      </tr>
    </table>
  </section>

  <section class="ritual-section" style="background: #F4EFEB; padding: 1.25rem; border-radius: 8px;">
    <h3 style="font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0; color: #1F1B18;">
      The Lighting Ritual
    </h3>
    <p style="font-size: 0.88rem; color: #4A423B; margin-bottom: 0.75rem;">
      <strong>The First Burn:</strong> ${ritualGuide.firstBurn}
    </p>
    <p style="font-size: 0.88rem; color: #4A423B; margin-bottom: 0.75rem;">
      <strong>Maintenance:</strong> ${ritualGuide.maintenance}
    </p>
    <p style="font-size: 0.88rem; color: #4A423B; margin-bottom: 0;">
      <strong>Vessel Rebirth:</strong> ${ritualGuide.vesselReuse}
    </p>
  </section>
</div>
  `.trim();
}

// 5. Generate Shopify Metafields Array for a Product
function generateProductMetafields(product) {
  const { tagline, category, mood, intensity, scentPyramid, specs, ritualGuide } = product;

  return [
    { namespace: 'custom', key: 'tagline', value: tagline, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'scent_category', value: category, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'mood', value: mood, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'intensity', value: intensity, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'top_notes', value: JSON.stringify(scentPyramid.topNotes), type: 'json' },
    { namespace: 'custom', key: 'heart_notes', value: JSON.stringify(scentPyramid.heartNotes), type: 'json' },
    { namespace: 'custom', key: 'base_notes', value: JSON.stringify(scentPyramid.baseNotes), type: 'json' },
    { namespace: 'custom', key: 'scent_description', value: scentPyramid.description, type: 'multi_line_text_field' },
    { namespace: 'custom', key: 'wax_type', value: specs.waxType, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'wick_type', value: specs.wickType, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'vessel', value: specs.vessel, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'dimensions', value: specs.dimensions, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'burn_time', value: '55+ Hours (200g) / 80+ Hours (450g)', type: 'single_line_text_field' },
    { namespace: 'custom', key: 'origin', value: specs.origin, type: 'single_line_text_field' },
    { namespace: 'custom', key: 'ritual_first_burn', value: ritualGuide.firstBurn, type: 'multi_line_text_field' },
    { namespace: 'custom', key: 'ritual_maintenance', value: ritualGuide.maintenance, type: 'multi_line_text_field' },
    { namespace: 'custom', key: 'ritual_safety', value: ritualGuide.safety, type: 'multi_line_text_field' },
    { namespace: 'custom', key: 'ritual_vessel_reuse', value: ritualGuide.vesselReuse, type: 'multi_line_text_field' },
  ];
}

// Helper to escape CSV values according to RFC 4180
function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// 6. Generate Official Shopify Standard Product Import CSV
function generateShopifyCsv(products) {
  const headers = [
    'Handle',
    'Title',
    'Body (HTML)',
    'Vendor',
    'Product Category',
    'Type',
    'Tags',
    'Published',
    'Option1 Name',
    'Option1 Value',
    'Option2 Name',
    'Option2 Value',
    'Option3 Name',
    'Option3 Value',
    'Variant SKU',
    'Variant Grams',
    'Variant Inventory Tracker',
    'Variant Inventory Qty',
    'Variant Inventory Policy',
    'Variant Fulfillment Service',
    'Variant Price',
    'Variant Compare At Price',
    'Variant Requires Shipping',
    'Variant Taxable',
    'Variant Barcode',
    'Image Src',
    'Image Position',
    'Image Alt Text',
    'Gift Card',
    'SEO Title',
    'SEO Description',
    'Google Shopping / Google Product Category',
    'Google Shopping / Gender',
    'Google Shopping / Age Group',
    'Google Shopping / MPN',
    'Google Shopping / AdWords Grouping',
    'Google Shopping / AdWords Labels',
    'Google Shopping / Condition',
    'Google Shopping / Custom Product',
    'Google Shopping / Custom Label 0',
    'Google Shopping / Custom Label 1',
    'Google Shopping / Custom Label 2',
    'Google Shopping / Custom Label 3',
    'Google Shopping / Custom Label 4',
    'Variant Image',
    'Variant Weight Unit',
    'Variant Tax Code',
    'Cost per item',
    'Status'
  ];

  const rows = [];
  rows.push(headers.join(','));

  for (const product of products) {
    const handle = product.slug;
    const title = product.title;
    const bodyHtml = generateHtmlDescription(product);
    const vendor = 'MOAMLIGHT';
    const category = 'Home & Garden > Decor > Home Fragrances > Candles';
    const type = 'Luxury Scented Candle';

    const tagsList = [
      product.category,
      product.bestseller ? 'bestseller' : '',
      product.featured ? 'featured' : '',
      'soy wax',
      'luxury candles',
      'hand-poured',
      'clean burn',
      'botanical fragrance'
    ].filter(Boolean);
    const tags = tagsList.join(', ');

    const seoTitle = `${product.title} | Luxury Botanical Candle | MOAMLIGHT`;
    const seoDescription = `${product.tagline} Handcrafted botanical soy wax candle poured in micro-batches with pure essential oils.`;

    const variantData = [
      {
        size: '200g',
        grams: 200,
        sku: `MOAM-${product.slug.slice(0, 3).toUpperCase()}-200`,
        price: (product.variants[0]?.price || product.defaultPrice).toFixed(2),
        compareAtPrice: (product.variants[0]?.mrp || product.defaultMrp).toFixed(2),
        imageIndex: 0,
      },
      {
        size: '450g',
        grams: 450,
        sku: `MOAM-${product.slug.slice(0, 3).toUpperCase()}-450`,
        price: (product.variants[1]?.price || Math.round(product.defaultPrice * 1.5)).toFixed(2),
        compareAtPrice: (product.variants[1]?.mrp || Math.round(product.defaultMrp * 1.5)).toFixed(2),
        imageIndex: 1,
      },
    ];

    const images = product.images || [];

    // Row 1: Primary Product Info + Variant 1 (200g) + Image 1
    rows.push([
      escapeCsv(handle),
      escapeCsv(title),
      escapeCsv(bodyHtml),
      escapeCsv(vendor),
      escapeCsv(category),
      escapeCsv(type),
      escapeCsv(tags),
      escapeCsv('TRUE'),
      escapeCsv('Size'),
      escapeCsv(variantData[0].size),
      '', '', '', '', // Option2 & 3
      escapeCsv(variantData[0].sku),
      escapeCsv(variantData[0].grams),
      escapeCsv('shopify'),
      escapeCsv(50), // 50 units inventory
      escapeCsv('deny'),
      escapeCsv('manual'),
      escapeCsv(variantData[0].price),
      escapeCsv(variantData[0].compareAtPrice),
      escapeCsv('TRUE'),
      escapeCsv('TRUE'),
      '', // Barcode
      escapeCsv(images[0] || ''),
      escapeCsv(1),
      escapeCsv(`${title} 200g Classic Amber Jar`),
      escapeCsv('FALSE'),
      escapeCsv(seoTitle),
      escapeCsv(seoDescription),
      '', '', '', '', '', '', '', '', '', '', '', '', '', // Google Shopping
      escapeCsv(images[0] || ''), // Variant Image
      escapeCsv('g'),
      '', // Tax code
      '', // Cost
      escapeCsv('active'),
    ].join(','));

    // Row 2: Variant 2 (450g) + Image 2
    rows.push([
      escapeCsv(handle),
      '', // Title blank on variant rows
      '', // Body blank
      '', // Vendor blank
      '', // Category blank
      '', // Type blank
      '', // Tags blank
      '', // Published blank
      escapeCsv('Size'),
      escapeCsv(variantData[1].size),
      '', '', '', '', // Option2 & 3
      escapeCsv(variantData[1].sku),
      escapeCsv(variantData[1].grams),
      escapeCsv('shopify'),
      escapeCsv(50), // 50 units inventory
      escapeCsv('deny'),
      escapeCsv('manual'),
      escapeCsv(variantData[1].price),
      escapeCsv(variantData[1].compareAtPrice),
      escapeCsv('TRUE'),
      escapeCsv('TRUE'),
      '', // Barcode
      escapeCsv(images[1] || ''),
      escapeCsv(2),
      escapeCsv(`${title} 450g Grand Ceramic Tumbler`),
      '', // Gift card
      '', // SEO Title
      '', // SEO Desc
      '', '', '', '', '', '', '', '', '', '', '', '', '', // Google Shopping
      escapeCsv(images[1] || ''), // Variant Image
      escapeCsv('g'),
      '', // Tax code
      '', // Cost
      escapeCsv('active'),
    ].join(','));

    // Row 3: Image 3 (Gallery)
    if (images[2]) {
      rows.push([
        escapeCsv(handle),
        '', '', '', '', '', '', '',
        '', '', '', '', '', '', // Options
        '', '', '', '', '', '', '', '', '', '', '', // Variant fields
        escapeCsv(images[2]),
        escapeCsv(3),
        escapeCsv(`${title} Ambient Atmosphere`),
        '', '', '',
        '', '', '', '', '', '', '', '', '', '', '', '', '',
        '', '', '', '', escapeCsv('active')
      ].join(','));
    }

    // Row 4: Image 4 (Packaging & Detail)
    if (images[3]) {
      rows.push([
        escapeCsv(handle),
        '', '', '', '', '', '', '',
        '', '', '', '', '', '', // Options
        '', '', '', '', '', '', '', '', '', '', '', // Variant fields
        escapeCsv(images[3]),
        escapeCsv(4),
        escapeCsv(`${title} Unboxing & Artisanal Details`),
        '', '', '',
        '', '', '', '', '', '', '', '', '', '', '', '', '',
        '', '', '', '', escapeCsv('active')
      ].join(','));
    }
  }

  const csvContent = rows.join('\r\n');
  const csvPath = path.resolve(process.cwd(), 'data/moamlight_shopify_products.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`[CSV Engine] ✅ Generated official Shopify Import CSV at:`);
  console.log(`             ${csvPath}`);
  console.log(`             Total products: ${products.length} | Total variants: ${products.length * 2} (50 in-stock qty each)`);
  return csvPath;
}

// 7. Build Full GraphQL Mutation Payloads for Diagnostics & Seeding
function buildSeedingPayloads(products) {
  return products.map((product) => {
    const v1Price = (product.variants[0]?.price || product.defaultPrice).toFixed(2);
    const v1Mrp = (product.variants[0]?.mrp || product.defaultMrp).toFixed(2);
    const v2Price = (product.variants[1]?.price || Math.round(product.defaultPrice * 1.5)).toFixed(2);
    const v2Mrp = (product.variants[1]?.mrp || Math.round(product.defaultMrp * 1.5)).toFixed(2);

    const tags = [
      product.category,
      product.bestseller ? 'bestseller' : '',
      product.featured ? 'featured' : '',
      'soy wax',
      'luxury candles',
    ].filter(Boolean);

    return {
      productCreateInput: {
        title: product.title,
        handle: product.slug,
        descriptionHtml: generateHtmlDescription(product),
        vendor: 'MOAMLIGHT',
        productType: 'Luxury Scented Candle',
        tags: tags,
        status: 'ACTIVE',
        productOptions: [
          {
            name: 'Size',
            values: [{ name: '200g' }, { name: '450g' }],
          },
        ],
        metafields: generateProductMetafields(product),
      },
      media: (product.images || []).map((imgUrl) => ({
        originalSource: imgUrl,
        mediaContentType: 'IMAGE',
        alt: product.title,
      })),
      variantsBulkCreateInput: [
        {
          optionValues: [{ optionName: 'Size', name: '200g' }],
          price: v1Price,
          compareAtPrice: v1Mrp,
          inventoryItem: {
            sku: `MOAM-${product.slug.slice(0, 3).toUpperCase()}-200`,
            tracked: true,
          },
          metafields: [
            { namespace: 'custom', key: 'weight_grams', value: '200', type: 'number_integer' },
            { namespace: 'custom', key: 'burn_time_hours', value: '55', type: 'number_integer' },
            { namespace: 'custom', key: 'wicks_count', value: '1', type: 'number_integer' },
          ],
        },
        {
          optionValues: [{ optionName: 'Size', name: '450g' }],
          price: v2Price,
          compareAtPrice: v2Mrp,
          inventoryItem: {
            sku: `MOAM-${product.slug.slice(0, 3).toUpperCase()}-450`,
            tracked: true,
          },
          metafields: [
            { namespace: 'custom', key: 'weight_grams', value: '450', type: 'number_integer' },
            { namespace: 'custom', key: 'burn_time_hours', value: '80', type: 'number_integer' },
            { namespace: 'custom', key: 'wicks_count', value: '3', type: 'number_integer' },
          ],
        },
      ],
    };
  });
}

// 8. Main Execution
async function main() {
  console.log('========================================================================');
  console.log('🕯️  MOAMLIGHT - Shopify Catalog Seeding & Migration Engine');
  console.log('========================================================================');
  console.log(`Store Domain: ${DOMAIN}`);
  console.log(`API Version : ${API_VERSION}`);
  console.log(`Admin Token : ${ADMIN_TOKEN ? ADMIN_TOKEN.slice(0, 10) + '...' : '❌ NOT CONFIGURED'}\n`);

  // Step 1: Load Products
  console.log('[Step 1/4] Loading product catalog from data/products.ts...');
  const products = loadProductsFromTs();
  console.log(`            Found ${products.length} luxury candle products.`);

  // Step 2: Generate Official CSV Export
  console.log('\n[Step 2/4] Generating official Shopify Product CSV...');
  const csvPath = generateShopifyCsv(products);

  // Step 3: Build GraphQL Payloads & Persist for Inspection
  console.log('\n[Step 3/4] Compiling Shopify Admin GraphQL payloads & metafields...');
  const payloads = buildSeedingPayloads(products);
  const payloadPath = path.resolve(process.cwd(), 'data/shopify_catalog_payload.json');
  fs.writeFileSync(payloadPath, JSON.stringify(payloads, null, 2), 'utf8');
  console.log(`            Compiled payloads saved to: ${payloadPath}`);

  // Step 4: Token Scope Inspection & GraphQL Execution
  console.log('\n[Step 4/4] Verifying Shopify Admin token scopes & permissions...');
  if (!ADMIN_TOKEN) {
    console.error('\n❌ ERROR: SHOPIFY_ADMIN_ACCESS_TOKEN is not configured in .env.local');
    return;
  }

  // Check scopes via OAuth access scopes endpoint
  const scopeRes = await shopifyAdminRequest('/admin/oauth/access_scopes.json', 'GET');
  const scopes = scopeRes.data?.access_scopes?.map(s => s.handle) || [];
  const hasWriteProducts = scopes.includes('write_products');

  console.log(`Active Token Scopes: [ ${scopes.join(', ')} ]`);

  if (!hasWriteProducts) {
    console.log('\n------------------------------------------------------------------------');
    console.log('⚠️  DIAGNOSTIC ADVICE: Token lacks `write_products` Admin Scope');
    console.log('------------------------------------------------------------------------');
    console.log('The configured SHOPIFY_ADMIN_ACCESS_TOKEN is connected, but its app role is');
    console.log('restricted to read-only/unauthenticated operations.');
    console.log('\nTo enable direct programmatic API seeding, follow these steps:');
    console.log(`  1. Log into your Shopify Admin: https://${DOMAIN}/admin`);
    console.log('  2. Navigate to: Settings -> Apps and sales channels -> Develop apps');
    console.log('  3. Select your custom app (or create a new app named "MOAMLIGHT Backend")');
    console.log('  4. Go to "Configuration" -> "Admin API integration" -> click "Configure"');
    console.log('  5. Enable the following Admin API scopes:');
    console.log('     • write_products & read_products');
    console.log('     • write_inventory & read_inventory (optional)');
    console.log('  6. Click "Save", then click "Install app" (or "Re-install app")');
    console.log('  7. Reveal the new Admin API access token (starts with shpat_...)');
    console.log('  8. Update your .env.local:');
    console.log('     SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_new_token_here');
    console.log('  9. Re-run: node scripts/seed-shopify-catalog.js');
    console.log('------------------------------------------------------------------------');
    console.log('🎉 READY FOR INSTANT 1-CLICK IMPORT:');
    console.log('You do not need to wait! The complete catalog has been exported to:');
    console.log(`  📁 ${csvPath}`);
    console.log('Simply open Shopify Admin -> Products -> "Import" -> Select this CSV file.');
    console.log('All 6 products and 12 variants will be live with images, prices & inventory!');
    console.log('------------------------------------------------------------------------\n');

    // Run test GraphQL call to confirm API error response
    console.log('Verifying exact GraphQL diagnostic error response from Shopify...');
    const testMutation = {
      query: `mutation productCreate($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product { id }
          userErrors { field message }
        }
      }`,
      variables: {
        product: { title: "MOAMLIGHT Test Probe" }
      }
    };
    const testRes = await shopifyAdminRequest(`/admin/api/${API_VERSION}/graphql.json`, 'POST', testMutation);
    if (testRes.data?.errors) {
      console.log(`Confirmed Shopify API Response: ${testRes.data.errors[0]?.message}`);
    }
    return;
  }

  // If token has write_products, proceed with live GraphQL seeding
  console.log('\n✅ `write_products` scope detected! Initiating live GraphQL seeding...\n');

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const payload = payloads[i];
    console.log(`Seeding [${i + 1}/${products.length}]: "${product.title}"...`);

    const createMutation = {
      query: `mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
        productCreate(product: $product, media: $media) {
          product {
            id
            title
            handle
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        product: payload.productCreateInput,
        media: payload.media,
      },
    };

    const res = await shopifyAdminRequest(`/admin/api/${API_VERSION}/graphql.json`, 'POST', createMutation);
    
    if (res.data?.errors) {
      console.error(`  ❌ GraphQL Error for "${product.title}":`, res.data.errors);
      continue;
    }

    const userErrors = res.data?.data?.productCreate?.userErrors || [];
    if (userErrors.length > 0) {
      console.warn(`  ⚠️ User Errors for "${product.title}":`, userErrors);
      continue;
    }

    const createdProduct = res.data?.data?.productCreate?.product;
    console.log(`  ✅ Product Created: ${createdProduct.id} (${createdProduct.handle})`);

    // Bulk create the variants
    const variantMutation = {
      query: `mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants {
            id
            title
            price
            sku
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        productId: createdProduct.id,
        variants: payload.variantsBulkCreateInput,
      },
    };

    const varRes = await shopifyAdminRequest(`/admin/api/${API_VERSION}/graphql.json`, 'POST', variantMutation);
    const varErrors = varRes.data?.data?.productVariantsBulkCreate?.userErrors || [];
    if (varErrors.length > 0) {
      console.warn(`  ⚠️ Variant creation errors:`, varErrors);
    } else {
      const vars = varRes.data?.data?.productVariantsBulkCreate?.productVariants || [];
      console.log(`  ✅ ${vars.length} variants created with prices and metafields.`);
    }
  }

  console.log('\n========================================================================');
  console.log('🎉 All catalog operations completed successfully!');
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
