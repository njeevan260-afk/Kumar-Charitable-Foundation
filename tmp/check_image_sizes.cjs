const fs = require('fs');
const path = require('path');

const imgDir = path.join(process.cwd(), 'src', 'assets', 'images');
const files = fs.readdirSync(imgDir);

files.forEach(f => {
  const stat = fs.statSync(path.join(imgDir, f));
  console.log(`${f}: ${stat.size} bytes`);
});
