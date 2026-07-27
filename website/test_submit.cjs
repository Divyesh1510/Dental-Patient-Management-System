const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));
  
  try {
    await page.goto('http://localhost:5173/enquiry', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully.');
    
    await page.type('input[name="name"]', 'Test User');
    await page.type('input[name="phone"]', '9885511349');
    await page.select('select[name="branch"]', 'West Marredpally');
    await page.type('textarea[name="problem"]', 'Test problem');
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {})
    ]);
    
    // Check if error message appeared
    const errorMsg = await page.evaluate(() => {
      const el = document.querySelector('.text-red-400');
      return el ? el.innerText : 'No error found';
    });
    
    console.log('Error message:', errorMsg);
    
  } catch (e) {
    console.error("Navigation error:", e);
  }
  
  await browser.close();
})();
