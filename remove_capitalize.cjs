const fs = require('fs');

const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/Statistics.tsx',
  'src/pages/MediaList.tsx',
  'src/components/AddEntryModal.tsx',
  'src/components/ViewEntryModal.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Just removing capitalize from the most obvious places where it's used with formatMediaType or formatWatchStatus
  content = content.replace(/capitalize/g, '');
  
  // also fix textTransform: 'capitalize' in Statistics.tsx
  content = content.replace(/textTransform: ''/g, "textTransform: 'none'");
  
  fs.writeFileSync(file, content);
}
