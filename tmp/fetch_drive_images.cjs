const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching browser to inspect Google Drive folder...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const folderUrl = 'https://drive.google.com/drive/folders/1CEbq1K4cN-Nx_3de4RQ-f0Em6RoQH9qM';
  console.log('Navigating to', folderUrl);

  const imageBuffers = [];

  page.on('response', async (res) => {
    const url = res.url();
    const headers = res.headers();
    const contentType = headers['content-type'] || '';

    if ((contentType.includes('image/') || url.includes('googleusercontent.com') || url.includes('thumbnail')) && res.status() === 200) {
      try {
        const buffer = await res.buffer();
        if (buffer.length > 8000) {
          console.log('Intercepted image response! Size:', buffer.length, 'URL:', url.substring(0, 100));
          imageBuffers.push({ url, buffer, contentType });
        }
      } catch (e) {
        // ignore
      }
    }
  });

  try {
    await page.goto(folderUrl, { waitUntil: 'networkidle', timeout: 40000 });
    console.log('Page loaded, scrolling down to trigger image loading...');

    // Scroll page multiple times to load all thumbnails
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(1000);
    }

    await page.waitForTimeout(4000);

    // Get all file names and aria-labels in the drive folder
    const fileElements = await page.$$eval('[data-[#]], [role="row"], [role="gridcell"], div[aria-label]', els => els.map(e => e.getAttribute('aria-label')).filter(Boolean));
    console.log('Aria labels found:', fileElements.slice(0, 15));

    // Get all img elements on page
    const imgs = await page.$$eval('img', elements => elements.map(i => ({
      src: i.src,
      alt: i.alt,
      w: i.naturalWidth || i.width,
      h: i.naturalHeight || i.height
    })));
    console.log('All img tags found:', imgs);

    // Check for large googleusercontent URLs directly
    const lh3Urls = imgs.filter(i => i.src.includes('googleusercontent.com'));
    console.log('lh3 URLs from img tags:', lh3Urls);

    // Save image buffers sorted by size
    imageBuffers.sort((a, b) => b.buffer.length - a.buffer.length);
    console.log(`Total image buffers intercepted: ${imageBuffers.length}`);

    // Create a output dir /tmp/drive_out
    const outDir = path.join(process.cwd(), 'tmp', 'drive_out');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    imageBuffers.forEach((item, idx) => {
      const filePath = path.join(outDir, `img_${idx + 1}_${item.buffer.length}.jpg`);
      fs.writeFileSync(filePath, item.buffer);
      console.log(`Saved image ${idx + 1}: ${filePath} (${item.buffer.length} bytes), URL: ${item.url.substring(0, 80)}`);
    });

  } catch (err) {
    console.log('Error during drive scraping:', err.message);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
