const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\snehi\\.gemini\\antigravity\\brain\\6f19f07a-9027-4bce-a791-957732624f92';
const QA_DIR = path.join(__dirname, '..', 'qa-artifacts');

if (!fs.existsSync(QA_DIR)) {
  fs.mkdirSync(QA_DIR, { recursive: true });
}

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function verify() {
  console.log('Launching browser with:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();
  const consoleMessages = [];
  page.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleMessages.push(`[PAGE ERROR] ${err.toString()}`));

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for 3 seconds for 3D canvas and fonts to initialize
  await new Promise((r) => setTimeout(r, 3000));

  console.log('Taking Light Mode Hero screenshot...');
  const heroShot = await page.screenshot({ fullPage: false });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'light-mode-hero.png'), heroShot);
  fs.writeFileSync(path.join(QA_DIR, 'light-mode-hero.png'), heroShot);

  console.log('Scrolling down to Scent Explorer...');
  await page.evaluate(() => {
    window.scrollTo({ top: 1100, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Taking Light Mode Scent Explorer screenshot...');
  const lightScentShot = await page.screenshot({ fullPage: false });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'light-mode-scents.png'), lightScentShot);
  fs.writeFileSync(path.join(QA_DIR, 'light-mode-scents.png'), lightScentShot);

  console.log('Scrolling down to Bestseller Product Grid...');
  await page.evaluate(() => {
    window.scrollTo({ top: 2100, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Taking Light Mode Bestseller Grid screenshot...');
  const lightGridShot = await page.screenshot({ fullPage: false });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'light-mode-products.png'), lightGridShot);
  fs.writeFileSync(path.join(QA_DIR, 'light-mode-products.png'), lightGridShot);

  await browser.close();

  console.log('--- CONSOLE LOGS & ERRORS ---');
  consoleMessages.forEach((m) => console.log(m));
  console.log('Screenshots saved successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
