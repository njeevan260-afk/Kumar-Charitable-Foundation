const fs = require('fs');
const files = fs.readdirSync('public/images');
for (const file of files) {
  if (!file.endsWith('.jpg')) continue;
  const path = 'public/images/' + file;
  const buffer = fs.readFileSync(path);
  const size = buffer.length;
  const header = buffer.slice(0, 3).toString('hex');
  const footer = buffer.slice(-2).toString('hex');
  console.log(`${file}: size=${size}, header=${header}, footer=${footer}`);
}
