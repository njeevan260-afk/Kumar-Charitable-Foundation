const fs = require('fs');
const path = require('path');

const driveFiles = [
  { id: '1imA3WtT4CzksYbIook--RCSUzb1q1bv-', filename: 'gallery_drive_1.jpg' },
  { id: '1-WxBUkxg-gLRygNyS60BRJA2Bb9qyLlJ', filename: 'gallery_drive_2.jpg' },
  { id: '1066kJE2pPy8Pd4dnQ1iok-CSbDIOiU3B', filename: 'gallery_drive_3.jpg' },
  { id: '1XOCyHpWUPK0Urpv5NTKfFNzqcgec1ybL', filename: 'gallery_drive_4.jpg' }
];

const targetDirSrc = path.join(process.cwd(), 'src', 'assets', 'images');
const targetDirPublic = path.join(process.cwd(), 'public', 'images');

if (!fs.existsSync(targetDirPublic)) fs.mkdirSync(targetDirPublic, { recursive: true });

async function downloadHighRes(fileId, filename) {
  const urls = [
    `https://lh3.googleusercontent.com/d/${fileId}=s2048`,
    `https://lh3.googleusercontent.com/d/${fileId}=s1600`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2048`,
    `https://drive.google.com/uc?export=download&id=${fileId}`
  ];

  for (const url of urls) {
    try {
      console.log(`Downloading ${filename} from ${url}...`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (res.status === 200) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 15000) {
          const filePathSrc = path.join(targetDirSrc, filename);
          const filePathPublic = path.join(targetDirPublic, filename);
          fs.writeFileSync(filePathSrc, buffer);
          fs.writeFileSync(filePathPublic, buffer);
          console.log(`Successfully saved ${filename} (${buffer.length} bytes)`);
          return;
        }
      }
    } catch (e) {
      console.log(`Error fetching ${url}:`, e.message);
    }
  }
  throw new Error(`Failed to download high res image for ${fileId}`);
}

async function main() {
  for (const item of driveFiles) {
    await downloadHighRes(item.id, item.filename);
  }
  console.log('All 4 Google Drive images downloaded & synced to src and public!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
