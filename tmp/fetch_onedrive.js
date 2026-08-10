const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const targetUrl = 'https://1drv.ms/i/c/da982d7f23aacbcf/IQARZNpEJmkxSaDaH5JkmyD4AVN67lWwr3NVbw35SEdUbNc?e=adjt5c';
  console.log('Navigating to', targetUrl);
  
  let saved = false;
  page.on('response', async (res) => {
    const url = res.url();
    const headers = res.headers();
    const contentType = headers['content-type'] || '';
    if (contentType.includes('image/') || url.includes('download') || url.includes('content') || url.includes('transform')) {
      if (res.status() === 200) {
        try {
          const buffer = await res.buffer();
          if (buffer.length > 20000) {
            console.log('FOUND IMAGE! Size:', buffer.length, 'URL:', url.substring(0, 100));
            fs.writeFileSync('/src/assets/images/scholarship_awarded_user.jpg', buffer);
            saved = true;
            console.log('Saved to /src/assets/images/scholarship_awarded_user.jpg');
          }
        } catch (e) {
          console.log('Buffer error:', e.message);
        }
      }
    }
  });

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 35000 });
    console.log('Page loaded, waiting for photo to render...');
    await page.waitForTimeout(6000);
    
    if (!saved) {
      console.log('Checking img tags...');
      const imgs = await page.$$eval('img', elements => elements.map(i => i.src));
      console.log('Images found:', imgs);
    }
  } catch (err) {
    console.log('Navigation error:', err.message);
  } finally {
    await browser.close();
    console.log('Browser closed. Saved state:', saved);
  }
})();
