const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('https://radhikasuperspecialitydentalhospital.in/', { waitUntil: 'networkidle0' });
    
    const actionsPos = await page.evaluate(() => {
      const el = document.querySelector('.floating-actions');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      return {
        left: computed.left,
        right: computed.right,
        bottom: computed.bottom
      };
    });
    
    console.log("Floating Actions CSS:", actionsPos);
  } catch (e) {
    console.error("Error:", e);
  }
  
  await browser.close();
})();
