const fs = require('fs');

const html = fs.readFileSync('./tmp/drive_folder.html', 'utf8');

const ids = [
  '1imA3WtT4CzksYbIook--RCSUzb1q1bv-',
  '1-WxBUkxg-gLRygNyS60BRJA2Bb9qyLlJ',
  '1066kJE2pPy8Pd4dnQ1iok-CSbDIOiU3B',
  '1XOCyHpWUPK0Urpv5NTKfFNzqcgec1ybL'
];

ids.forEach(id => {
  const pos = html.indexOf(id);
  if (pos !== -1) {
    const snippet = html.substring(Math.max(0, pos - 200), Math.min(html.length, pos + 300));
    console.log(`\nSnippet for ${id}:\n`, snippet);
  }
});
