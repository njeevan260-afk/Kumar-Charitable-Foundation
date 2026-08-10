const fs = require('fs');

async function fetchDriveFolder() {
  const folderUrl = 'https://drive.google.com/drive/folders/1CEbq1K4cN-Nx_3de4RQ-f0Em6RoQH9qM';
  console.log('Fetching:', folderUrl);

  const res = await fetch(folderUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    }
  });

  const html = await res.text();
  console.log('Fetched HTML length:', html.length);
  fs.writeFileSync('./tmp/drive_folder.html', html);

  // Extract file IDs or googleusercontent URLs
  const fileIdRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/g;
  const ids = new Set();
  let match;
  while ((match = fileIdRegex.exec(html)) !== null) {
    ids.add(match[1]);
  }

  // Also search for "id":"..." or data-id="..."
  const dataIdRegex = /"([a-zA-Z0-9_-]{25,45})"/g;
  while ((match = dataIdRegex.exec(html)) !== null) {
    if (match[1].length >= 28 && !match[1].startsWith('1CEbq1K4cN')) {
      ids.add(match[1]);
    }
  }

  console.log('Found potential file IDs:', Array.from(ids));

  // Look for lh3.googleusercontent.com URLs
  const lh3Regex = /https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9_-]+/g;
  const lh3Urls = new Set();
  while ((match = lh3Regex.exec(html)) !== null) {
    lh3Urls.add(match[0]);
  }
  console.log('Found lh3 URLs:', Array.from(lh3Urls));
}

fetchDriveFolder().catch(console.error);
