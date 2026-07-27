const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));
  
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log("Page loaded successfully.");
  } catch (e) {
    console.error("Error loading page:", e);
  }
  
  await browser.close();
})();
