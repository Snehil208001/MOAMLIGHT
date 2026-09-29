const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\snehi\\.gemini\\antigravity\\brain\\6f19f07a-9027-4bce-a791-957732624f92';
const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function auditMobile() {
  console.log('Auditing Mobile Experience (390x844 iPhone Viewport)...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Mobile Hero
  console.log('Capturing Mobile Hero...');
  const heroShot = await page.screenshot({ fullPage: false });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile-hero.png'), heroShot);

  // 2. Measure Header Element Overlap on Mobile
  const headerLayout = await page.evaluate(() => {
    const leftEl = document.querySelector('header button[aria-label="Open navigation menu"]');
    const logoEl = document.querySelector('header a[href="/"]');
    const rightActions = document.querySelector('header div.flex.items-center.gap-4');

    const lRect = leftEl ? leftEl.getBoundingClientRect() : null;
    const logoRect = logoEl ? logoEl.getBoundingClientRect() : null;
    const rRect = rightActions ? rightActions.getBoundingClientRect() : null;

    return {
      viewportWidth: window.innerWidth,
      leftButtonRightEdge: lRect ? lRect.right : 0,
      logoLeftEdge: logoRect ? logoRect.left : 0,
      logoRightEdge: logoRect ? logoRect.right : 0,
      rightActionsLeftEdge: rRect ? rRect.left : 0,
      hasOverlapLeft: lRect && logoRect ? lRect.right > logoRect.left : false,
      hasOverlapRight: logoRect && rRect ? logoRect.right > rRect.left : false,
    };
  });
  console.log('Mobile Header Layout Measurements:', JSON.stringify(headerLayout, null, 2));

  // 3. Scroll to Scent Explorer & Bestsellers
  console.log('Scrolling down to Bestsellers on Mobile...');
  await page.evaluate(() => window.scrollTo({ top: 1100, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 1500));
  const scentsShot = await page.screenshot({ fullPage: false });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile-scents.png'), scentsShot);

  await page.evaluate(() => window.scrollTo({ top: 2200, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 1500));
  const productsShot = await page.screenshot({ fullPage: false });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile-products.png'), productsShot);

  // 4. Test Mobile Hamburger Menu
  console.log('Testing Mobile Drawer Menu...');
  const menuBtn = await page.$('header button[aria-label="Open navigation menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
    const menuShot = await page.screenshot({ fullPage: false });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile-menu-drawer.png'), menuShot);
  }

  await browser.close();
  console.log('Mobile audit complete!');
}

auditMobile().catch((err) => {
  console.error('Mobile audit failed:', err);
  process.exit(1);
});
