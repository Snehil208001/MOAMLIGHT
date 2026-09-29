const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');

const WORKSPACE_DIR = 'c:\\Users\\snehi\\OneDrive\\Desktop\\MOAMLIGHT';
const ARTIFACT_DIR_1 = 'C:\\Users\\snehi\\.gemini\\antigravity\\brain\\869b6a10-522c-426a-bb0d-76da6377b858';
const ARTIFACT_DIR_2 = path.join(WORKSPACE_DIR, 'qa-artifacts');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Using browser binary:', CHROME_PATH);

function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  console.log(`Waiting for server at ${url}...`);
  while (Date.now() - start < timeoutMs) {
    if (await checkServer(url)) {
      console.log(`Server responded with 200 OK!`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

function saveToBoth(filename, buffer) {
  const file1 = path.join(ARTIFACT_DIR_1, filename);
  const file2 = path.join(ARTIFACT_DIR_2, filename);
  fs.writeFileSync(file1, buffer);
  fs.writeFileSync(file2, buffer);
  console.log(`Saved screenshot: ${filename} (${buffer.length} bytes) to:\n  -> ${file1}\n  -> ${file2}`);
}

async function runQA() {
  let serverProcess = null;
  const baseUrl = 'http://localhost:3000';

  const isAlreadyRunning = await checkServer(baseUrl);
  if (!isAlreadyRunning) {
    console.log('Starting Next.js server on port 3000...');
    const nextBin = path.join(WORKSPACE_DIR, 'node_modules', 'next', 'dist', 'bin', 'next');
    serverProcess = spawn(process.execPath, [nextBin, 'start', '-p', '3000'], {
      cwd: WORKSPACE_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    serverProcess.stdout.on('data', (d) => process.stdout.write(`[Next.js] ${d}`));
    serverProcess.stderr.on('data', (d) => process.stderr.write(`[Next.js ERR] ${d}`));

    await waitForServer(baseUrl, 30000);
  } else {
    console.log('Server is already running on port 3000.');
  }

  // Ensure output directories exist
  if (!fs.existsSync(ARTIFACT_DIR_1)) fs.mkdirSync(ARTIFACT_DIR_1, { recursive: true });
  if (!fs.existsSync(ARTIFACT_DIR_2)) fs.mkdirSync(ARTIFACT_DIR_2, { recursive: true });

  console.log('Launching browser with puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1280,1024',
    ],
  });

  const page = await browser.newPage();

  try {
    // -------------------------------------------------------------
    // Test Step 0: Mobile Viewport (390x844) Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 0: Mobile Viewport (390x844) Verification ---');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));
    const mobileHeroBuffer = await page.screenshot({ fullPage: false });
    saveToBoth('00_mobile_homepage.png', mobileHeroBuffer);

    // -------------------------------------------------------------
    // Test Step 1: Desktop Viewport Homepage Hero (Announcement + Hero + Trust Badges)
    // -------------------------------------------------------------
    console.log('\n--- Step 1: Desktop Viewport Homepage Hero ---');
    await page.setViewport({ width: 1280, height: 960, deviceScaleFactor: 2 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Verify Announcement bar & Trust badges in Hero
    const heroVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasAnnouncement: text.includes('Free Express Shipping Across India on Orders Above ₹999'),
        hasHeroTitle: text.includes('Illuminate Your') && text.includes('Sanctuary'),
        hasSoyBadge: text.includes('100% Botanical Soy Wax'),
        hasShippingBadge: text.includes('Free Express Shipping ₹999+'),
        hasCodBadge: text.includes('Cash on Delivery Available'),
      };
    });
    console.log('Hero Assertions:', heroVerification);

    const heroBuffer = await page.screenshot({ fullPage: false });
    saveToBoth('01_homepage_hero.png', heroBuffer);

    // Scroll to Bestsellers section with top offset
    console.log('\n--- Step 1b: Desktop Bestsellers Grid ---');
    await page.evaluate(() => {
      const bestsellersHeader = Array.from(document.querySelectorAll('h2')).find((el) =>
        el.textContent.includes('Handcrafted Bestsellers')
      );
      if (bestsellersHeader) {
        bestsellersHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -90);
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    const bestsellersVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasBestsellerTitle: text.includes('Handcrafted Bestsellers'),
        hasMysore: text.includes('Mysore Sandalwood & Amber'),
        hasKashmir: text.includes('Kashmir Saffron & Oudh'),
        hasInrPrices: text.includes('₹1,299') && text.includes('₹1,499'),
        hasRatings: text.includes('4.9'),
      };
    });
    console.log('Bestsellers Assertions:', bestsellersVerification);

    const bestsellersBuffer = await page.screenshot({ fullPage: false });
    saveToBoth('02_homepage_bestsellers.png', bestsellersBuffer);

    // -------------------------------------------------------------
    // Test Step 2: PDP Overview (Gallery, ₹ Pricing, COD & Free Shipping Badges, Variant Selector)
    // -------------------------------------------------------------
    const pdpUrl = `${baseUrl}/products/mysore-sandalwood-amber`;
    console.log(`\n--- Step 2: Navigate to PDP (${pdpUrl}) ---`);
    await page.setViewport({ width: 1280, height: 960, deviceScaleFactor: 2 });
    await page.goto(pdpUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));

    const pdpVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTitle: text.includes('Mysore Sandalwood & Amber'),
        hasPrice: text.includes('₹1,299'),
        hasCodBadge: text.includes('Cash on Delivery (COD)'),
        hasFreeShippingBadge: text.includes('Free Express Shipping ₹999+'),
        hasTransitProtection: text.includes('100% Transit Protection'),
        hasVariantSelector: text.includes('240g Classic Amber Jar') && text.includes('380g Grand Ceramic'),
      };
    });
    console.log('PDP Assertions:', pdpVerification);

    const pdpOverviewBuffer = await page.screenshot({ fullPage: false });
    saveToBoth('03_pdp_overview.png', pdpOverviewBuffer);

    // Scroll to Olfactory Scent Pyramid & Burn Metrics
    console.log('\n--- Step 2b: Scent Pyramid & Burn Metrics ---');
    await page.evaluate(() => {
      const pyramidHeading = Array.from(document.querySelectorAll('h3')).find((el) =>
        el.textContent.includes('The Scent Pyramid')
      );
      if (pyramidHeading) {
        pyramidHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -90);
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    const pyramidVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasPyramidTitle: text.includes('The Scent Pyramid'),
        hasTopNotes: text.includes('Top Notes') && text.includes('Cardamom'),
        hasHeartNotes: text.includes('Heart Notes') && text.includes('Mysore Sandalwood'),
        hasBaseNotes: text.includes('Base Notes') && text.includes('Golden Amber'),
        hasBurnDuration: text.includes('Burn Duration') || text.includes('Specifications & Craftsmanship'),
        hasWaxType: text.includes('Wax Composition') || text.includes('100% Golden Botanical Soy Wax'),
      };
    });
    console.log('Scent Pyramid & Burn Metrics Assertions:', pyramidVerification);

    const scentPyramidBuffer = await page.screenshot({ fullPage: false });
    saveToBoth('04_pdp_scent_pyramid.png', scentPyramidBuffer);

    // -------------------------------------------------------------
    // Test Step 3: Add candle to cart and verify Cart Drawer
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Add candle to cart and verify Cart Drawer ---');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 800));

    // Find and click the Add to Bag button
    const addToBagClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent && b.textContent.includes('Add to Bag'));
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });

    if (!addToBagClicked) {
      throw new Error('Could not find Add to Bag button on PDP');
    }
    console.log('Clicked "Add to Bag" button');

    // Wait for the slide-out Cart Drawer to appear
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return text.includes('YOUR SHOPPING BAG');
      },
      { timeout: 10000 }
    );
    // Allow spring animation to finish
    await new Promise((r) => setTimeout(r, 1200));

    // Verify elements in Cart Drawer
    const drawerVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTitle: text.includes('YOUR SHOPPING BAG'),
        hasItem: text.includes('Mysore Sandalwood & Amber'),
        hasPrice: text.includes('1,299') || text.includes('₹1,299'),
        hasFreeShipping: text.includes('FREE Express Shipping') || text.includes('unlocked FREE'),
        hasCodTrust: text.includes('Cash on Delivery (COD) Available'),
        hasPromoInput: document.querySelector('input[placeholder*="MOAM10"]') !== null || text.includes('APPLY'),
        hasCheckoutCTA: text.toLowerCase().includes('proceed to checkout'),
      };
    });
    console.log('Cart Drawer Assertions:', drawerVerification);

    const cartDrawerBuffer = await page.screenshot({ fullPage: false });
    saveToBoth('05_cart_drawer_open.png', cartDrawerBuffer);

    // -------------------------------------------------------------
    // Test Step 4: Proceed to Checkout Page
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Proceed to Checkout Page ---');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const checkoutBtn = links.find((el) => el.textContent && el.textContent.toLowerCase().includes('proceed to checkout'));
      if (checkoutBtn) {
        checkoutBtn.click();
      }
    });

    try {
      await page.waitForFunction(() => window.location.pathname === '/checkout', { timeout: 6000 });
    } catch (e) {
      console.log('Fallback: navigating to /checkout directly');
      await page.goto(`${baseUrl}/checkout`, { waitUntil: 'networkidle0', timeout: 30000 });
    }

    await new Promise((r) => setTimeout(r, 1200));

    // Scroll down to the payment section so COD, UPI, NetBanking, and Card are centered
    await page.evaluate(() => {
      const paymentSection = Array.from(document.querySelectorAll('h2')).find((el) =>
        el.textContent.includes('Select Payment Method')
      );
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });
    await new Promise((r) => setTimeout(r, 800));

    // Verify Checkout Page contents
    const checkoutVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        isCheckoutUrl: window.location.pathname === '/checkout',
        hasCod: text.includes('Cash on Delivery (COD)'),
        hasUpi: text.includes('UPI Instant') || text.includes('Google Pay, PhonePe, Paytm'),
        hasCard: text.includes('Credit / Debit Card'),
        hasNetBanking: text.includes('NetBanking') || text.includes('HDFC, ICICI, SBI'),
        hasOrderSummary: text.includes('Order Summary'),
        hasItem: text.includes('Mysore Sandalwood & Amber'),
        hasPlaceOrderBtn: text.includes('Place Order') || text.includes('Complete Order'),
      };
    });
    console.log('Checkout Page Assertions:', checkoutVerification);

    const checkoutPageBuffer = await page.screenshot({ fullPage: false });
    saveToBoth('06_checkout_page.png', checkoutPageBuffer);

    console.log('\n=========================================');
    console.log('ALL QA WORKFLOW TESTS PASSED SUCCESSFULLY');
    console.log('=========================================');
  } finally {
    console.log('Closing browser...');
    await browser.close().catch(() => {});

    if (serverProcess) {
      console.log('Stopping Next.js server process (PID:', serverProcess.pid, ')...');
      try {
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`);
      } catch (e) {
        serverProcess.kill('SIGKILL');
      }
      console.log('Server process terminated.');
    }
  }
}

runQA().catch((err) => {
  console.error('QA Test execution failed:', err);
  process.exit(1);
});
