const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // iPhone 13 Pro Max dimensions
  await page.setViewport({
    width: 428,
    height: 926,
    isMobile: true,
    hasTouch: true,
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Take a screenshot
  const screenshotPath = 'C:\\Users\\Divyesh Reddy\\.gemini\\antigravity-ide\\scratch\\mobile_view.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log('Mobile view screenshot saved to: ' + screenshotPath);
  await browser.close();
})();
