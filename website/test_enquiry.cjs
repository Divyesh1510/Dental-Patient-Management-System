const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));
  
  try {
    await page.goto('http://localhost:5173/enquiry', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully.');
    
    // Check if the form is rendering
    const formHtml = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? 'Form found' : 'Form not found';
    });
    console.log(formHtml);
    
  } catch (e) {
    console.error("Navigation error:", e);
  }
  
  await browser.close();
})();
