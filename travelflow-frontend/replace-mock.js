const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const dirsToWalk = ['app/(dashboard)', 'components', 'features'];
let updated = 0;

dirsToWalk.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = walk(dir);
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('MockAPI')) {
        content = content
          .replace(/import\s+\{\s*MockAPI\s*\}\s+from\s+[\"']@\/lib\/mock-api[\"'];?/g, 'import { API } from "@/lib/data-source";')
          .replace(/\bMockAPI\./g, 'API.')
          .replace(/\bMockAPI\b/g, 'API');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated: ' + file);
        updated++;
      }
    });
  }
});

console.log('Total files updated: ' + updated);
