const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching browser to inspect Google Drive folder...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const folderUrl = 'https://drive.google.com/drive/folders/1CEbq1K4cN-Nx_3de4RQ-f0Em6RoQH9qM';
  console.log('Navigating to', folderUrl);

  const foundUrls = [];
  const imageBuffers = [];

  page.on('response', async (res) => {
    const url = res.url();
    const headers = res.headers();
    const contentType = headers['content-type'] || '';

    // Catch googleusercontent images or drive thumbnail responses
    if ((contentType.includes('image/') || url.includes('googleusercontent.com') || url.includes('thumbnail')) && res.status() === 200) {
      try {
        const buffer = await res.buffer();
        if (buffer.length > 10000) { // skip tiny icons/avatars
          console.log('Intercepted image response! Size:', buffer.length, 'URL:', url.substring(0, 120));
          foundUrls.push({ url, size: buffer.length });
          imageBuffers.push({ url, buffer });
        }
      } catch (e) {
        // ignore
      }
    }
  });

  try {
    await page.goto(folderUrl, { waitUntil: 'networkidle', timeout: 40000 });
    console.log('Page loaded, waiting for grid items...');
    await page.waitForTimeout(5000);

    // Get all img src attributes and aria-labels/titles
    const imgData = await page.$$eval('img', imgs => imgs.map(i => ({ src: i.src, alt: i.alt, width: i.width, height: i.height })));
    console.log('Image elements found on page:', imgData.length);
    imgData.forEach((img, idx) => {
      console.log(`Img ${idx}: src=${img.src.substring(0, 100)}, alt=${img.alt}, size=${img.width}x${img.height}`);
    });

    // Also look for grid items or links
    const itemLinks = await page.$$eval('a[data-id], div[data-id], [role="row"], [role="gridcell"]', els => els.map(e => ({
      dataId: e.getAttribute('data-id'),
      ariaLabel: e.getAttribute('aria-label') || e.innerText,
      innerHTML: e.innerHTML.substring(0, 200)
    })));
    console.log('Items found in folder layout:', itemLinks.slice(0, 10));

    // Save full page HTML snippet or screenshot if needed
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);

    // Also check for googleusercontent images with high resolutions
    const largeBuffers = imageBuffers.filter(b => b.buffer.length > 25000);
    console.log(`Found ${largeBuffers.length} large image buffers (>25KB)`);

    // Let's save the top 5 largest image buffers to /tmp for inspection
    largeBuffers.sort((a, b) => b.buffer.length - a.buffer.length);
    largeBuffers.slice(0, 10).forEach((item, index) => {
      const filename = `/tmp/drive_img_${index + 1}.jpg`;
      fs.writeFileSync(filename, item.buffer);
      console.log(`Saved buffer ${index + 1} (${item.buffer.length} bytes) to ${filename}`);
    });

  } catch (err) {
    console.log('Error during drive scraping:', err.message);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
