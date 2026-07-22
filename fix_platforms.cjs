const fs = require('fs');
let content = fs.readFileSync('src/components/AddEntryModal.tsx', 'utf8');

// Filter out "None" from customPlatforms state init and map
content = content.replace(
  /return saved \? JSON\.parse\(saved\) : \[\];/,
  `return saved ? JSON.parse(saved).filter((p: string) => p && p.toLowerCase() !== 'none') : [];`
);

content = content.replace(
  /\.\.\.customPlatforms\.map\(p => \(\{ value: p, label: p \}\)\),/,
  `...customPlatforms.filter(p => p && p.toLowerCase() !== 'none').map(p => ({ value: p, label: p })),`
);

fs.writeFileSync('src/components/AddEntryModal.tsx', content);
