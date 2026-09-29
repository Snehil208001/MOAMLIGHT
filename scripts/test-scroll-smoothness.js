const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testSmoothness() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  await new Promise((r) => setTimeout(r, 2000));

  console.log('Testing incremental scroll color transition from 0px to 2400px in steps of 200px:');
  const samples = [];

  for (let scrollY = 0; scrollY <= 2400; scrollY += 200) {
    await page.evaluate((y) => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
    }, scrollY);

    await new Promise((r) => setTimeout(r, 120)); // brief pause for GSAP scrub lag (1.2s lag moves smoothly)

    const state = await page.evaluate(() => {
      const container = document.querySelector('.daynight-smooth-container');
      const rootStyle = getComputedStyle(document.documentElement);
      return {
        scrollY: window.scrollY,
        containerBg: container ? getComputedStyle(container).backgroundColor : null,
        cssVarBg: rootStyle.getPropertyValue('--bg-daynight').trim(),
        textColor: container ? getComputedStyle(container).color : null,
      };
    });

    samples.push(state);
    console.log(`Scroll: ${state.scrollY}px | Container BG: ${state.containerBg} | CSS Var: ${state.cssVarBg}`);
  }

  await browser.close();
  console.log('Smoothness test complete. Sample count:', samples.length);
}

testSmoothness().catch(console.error);
