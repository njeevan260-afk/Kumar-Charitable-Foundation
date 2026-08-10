const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src', 'assets', 'images');
const destDir = path.join(process.cwd(), 'public', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  console.log(`Copied ${file} to public/images/`);
});
