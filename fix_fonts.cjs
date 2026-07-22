const fs = require('fs');

const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/MediaList.tsx',
  'src/components/ViewEntryModal.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/style=\{\{ fontFamily: 'Georgia, serif' \}\}/g, '');
  content = content.replace(/font-serif/g, 'font-sans font-semibold');
  content = content.replace(/font-light italic/g, 'font-bold tracking-tight');
  content = content.replace(/italic text-xl/g, 'text-xl');
  content = content.replace(/font-light/g, 'font-bold tracking-tight');
  
  fs.writeFileSync(file, content);
}
