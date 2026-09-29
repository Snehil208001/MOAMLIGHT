const http = require('http');
const { spawn } = require('child_process');

async function main() {
  const PORT = 3008;
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    shell: true,
    stdio: 'inherit',
  });

  const get = (urlPath) =>
    new Promise((resolve, reject) => {
      http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, data }));
      }).on('error', reject);
    });

  // Wait for server to come up
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const test = await get('/');
      if (test.status === 200) {
        ready = true;
        break;
      }
    } catch (e) {
      // not ready yet
    }
  }

  if (!ready) {
    console.error('Server failed to start on port', PORT);
    server.kill();
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('1. VALIDATING SITEMAP.XML');
  console.log('========================================');
  const sitemapRes = await get('/sitemap.xml');
  console.log('HTTP Status:', sitemapRes.status);
  console.log(sitemapRes.data);

  console.log('\n========================================');
  console.log('2. VALIDATING ROBOTS.TXT');
  console.log('========================================');
  const robotsRes = await get('/robots.txt');
  console.log('HTTP Status:', robotsRes.status);
  console.log(robotsRes.data);

  console.log('\n========================================');
  console.log('3. VALIDATING HOMEPAGE METADATA & ORG JSON-LD');
  console.log('========================================');
  const homeRes = await get('/');
  console.log('Home Status:', homeRes.status);
  const homeOrgJsonLd = homeRes.data.includes('@type":"Organization"') || homeRes.data.includes('"@type":"Organization"');
  console.log('Organization JSON-LD found in Home HTML:', homeOrgJsonLd);

  console.log('\n========================================');
  console.log('4. VALIDATING PDP METADATA & JSON-LD');
  console.log('========================================');
  const pdpRes = await get('/products/mysore-sandalwood-amber');
  console.log('PDP Status:', pdpRes.status);
  const titleMatch = pdpRes.data.match(/<title>(.*?)<\/title>/);
  console.log('Page Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
  const hasProductSchema = pdpRes.data.includes('"@type":"Product"') || pdpRes.data.includes('@type":"Product"');
  const hasOfferSchema = pdpRes.data.includes('"@type":"Offer"') || pdpRes.data.includes('@type":"Offer"');
  const hasRatingSchema = pdpRes.data.includes('"@type":"AggregateRating"') || pdpRes.data.includes('@type":"AggregateRating"');
  const hasBreadcrumbs = pdpRes.data.includes('"@type":"BreadcrumbList"') || pdpRes.data.includes('@type":"BreadcrumbList"');
  console.log('Product Schema present:', hasProductSchema);
  console.log('Offer Schema present:', hasOfferSchema);
  console.log('AggregateRating Schema present:', hasRatingSchema);
  console.log('BreadcrumbList Schema present:', hasBreadcrumbs);

  console.log('\nVerification complete!');
  server.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
