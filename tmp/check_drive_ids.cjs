const fs = require('fs');
const path = require('path');

const fileIds = [
  '1imA3WtT4CzksYbIook--RCSUzb1q1bv-',
  '1-WxBUkxg-gLRygNyS60BRJA2Bb9qyLlJ',
  '1066kJE2pPy8Pd4dnQ1iok-CSbDIOiU3B',
  '1XOCyHpWUPK0Urpv5NTKfFNzqcgec1ybL'
];

const outDir = path.join(process.cwd(), 'tmp', 'test_images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function downloadDriveFile(fileId, index) {
  console.log(`\n--- Testing File ID [${index}]: ${fileId} ---`);

  // Try lh3 direct URL
  const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
  const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  const ucUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  const urlsToTry = [
    { name: 'lh3', url: lh3Url },
    { name: 'thumb', url: thumbUrl },
    { name: 'uc', url: ucUrl }
  ];

  for (const item of urlsToTry) {
    try {
      console.log(`Fetching ${item.name} for ${fileId}...`);
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`Status: ${res.status}, Type: ${res.headers.get('content-type')}, Length: ${res.headers.get('content-length')}`);
      if (res.status === 200) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 10000) {
          const filePath = path.join(outDir, `img_${index}_${item.name}.jpg`);
          fs.writeFileSync(filePath, buffer);
          console.log(`SUCCESS! Saved ${buffer.length} bytes to ${filePath}`);
          return { fileId, filePath, url: item.url, size: buffer.length };
        }
      }
    } catch (e) {
      console.log(`Error with ${item.name}:`, e.message);
    }
  }
  return null;
}

async function run() {
  for (let i = 0; i < fileIds.length; i++) {
    await downloadDriveFile(fileIds[i], i + 1);
  }
}

run().catch(console.error);
