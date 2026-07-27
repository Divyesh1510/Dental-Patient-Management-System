const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('https://radhikasuperspecialitydentalhospital.in/', { waitUntil: 'networkidle0' });
    
    // Wait a bit for Fastbots to inject
    await new Promise(r => setTimeout(r, 3000));
    
    // Find any iframes or divs related to fastbots
    const elements = await page.evaluate(() => {
      const fastbots = document.querySelectorAll('iframe, [id*="fastbot"], [class*="fastbot"]');
      return Array.from(fastbots).map(el => ({
        tag: el.tagName,
        id: el.id,
        className: el.className,
        style: el.getAttribute('style')
      }));
    });
    
    console.log("Found Fastbots elements:", elements);
  } catch (e) {
    console.error("Error:", e);
  }
  
  await browser.close();
})();
