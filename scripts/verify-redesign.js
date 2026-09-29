const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\snehi\\.gemini\\antigravity\\brain\\c74a3b97-5e53-4e85-a0ca-edba6a279ac0';
const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function verify() {
  console.log('Launching browser with binary:', CHROME_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  console.log('Waiting for WebGL 3D Canvas initialization...');
  await new Promise((r) => setTimeout(r, 3500));

  // 1. Capture Light Mode Hero Screenshot (Current Viewport at scrollY = 0)
  console.log('Capturing Light Mode Hero Section...');
  const heroScreenshotPath = path.join(ARTIFACT_DIR, 'light_mode_hero.png');
  await page.screenshot({
    path: heroScreenshotPath,
    fullPage: false,
  });
  console.log('Saved Light Mode Hero screenshot to:', heroScreenshotPath);

  // 2. Scroll directly into Dark Mode Product Grid
  console.log('Scrolling down directly to Bestseller Grid for Dark Mode capture...');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const card = document.querySelector('.product-card-item');
    if (card) {
      const top = card.getBoundingClientRect().top + window.pageYOffset - 180;
      window.scrollTo(0, top);
    } else {
      window.scrollTo(0, 2300);
    }
  });

  // Wait 2.5s for GSAP ScrollTrigger to complete Day-to-Night transition and staggered entrance
  await new Promise((r) => setTimeout(r, 2500));

  const scrollInfo = await page.evaluate(() => ({
    scrollY: window.scrollY,
    theme: document.querySelector('.night-theme') ? 'night-theme' : 'day-theme',
  }));
  console.log('Scroll and theme info:', scrollInfo);

  // 3. Hover over the second product card to actuate 3D Isometric Tilt and Amber Glow Shadow
  console.log('Hovering over second product card to trigger 3D Isometric tilt and glowing amber shadow...');
  const cards = await page.$$('.product-card-item');
  if (cards.length > 1) {
    const box = await cards[1].boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise((r) => setTimeout(r, 1000)); // Wait for 3D CSS transition
    }
  }

  // Capture Dark Mode Product Grid Screenshot (Current Viewport as scrolled)
  console.log('Capturing Dark Mode Product Grid Screenshot...');
  const darkGridScreenshotPath = path.join(ARTIFACT_DIR, 'dark_mode_product_grid.png');
  await page.screenshot({
    path: darkGridScreenshotPath,
    fullPage: false,
  });
  console.log('Saved Dark Mode Product Grid screenshot to:', darkGridScreenshotPath);

  // 4. Test Mobile Responsive Viewport
  console.log('Testing Mobile Viewport (375x812)...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 2000));

  const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'mobile_hero_view.png');
  await page.screenshot({
    path: mobileScreenshotPath,
    fullPage: false,
  });
  console.log('Saved Mobile Hero screenshot to:', mobileScreenshotPath);

  await browser.close();
  console.log('Verification finished successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
