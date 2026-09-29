const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testCheckoutFlow() {
  console.log('Testing Shopify Checkout Redirect with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  console.log('Opening http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  // Scroll down to the products grid
  await page.evaluate(() => window.scrollTo({ top: 2100, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 1500));

  // Find a product card and hover over it to reveal Quick Add button
  console.log('Hovering over product card...');
  const productCard = await page.$('.product-card-item');
  if (productCard) {
    await productCard.hover();
    await new Promise((r) => setTimeout(r, 600));

    // Click the Quick Add button
    const quickAddBtn = await productCard.$('button');
    if (quickAddBtn) {
      console.log('Clicking Quick Add button...');
      await quickAddBtn.click();
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Check if cart drawer is open and click Proceed to Checkout
  console.log('Looking for Proceed to Checkout button in Cart Drawer...');
  const checkoutBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent && b.textContent.includes('Proceed to Checkout'));
  });

  if (checkoutBtn && checkoutBtn.asElement()) {
    console.log('Clicking Proceed to Checkout button...');
    await checkoutBtn.asElement().click();

    console.log('Waiting for navigation to Shopify-hosted checkout...');
    try {
      await page.waitForNavigation({ timeout: 15000 });
    } catch {
      // Could still be navigating
    }

    const currentUrl = page.url();
    console.log('Redirected to URL:', currentUrl);

    if (currentUrl.includes('shopify.com') || currentUrl.includes('checkouts') || currentUrl.includes('/cart/c/')) {
      console.log('SUCCESS: Successfully redirected to Shopify-Hosted Checkout!');
    } else {
      console.log('Current URL is:', currentUrl);
    }
  } else {
    console.log('Proceed to Checkout button not found or cart drawer did not open.');
  }

  await browser.close();
}

testCheckoutFlow().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
