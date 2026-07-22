const fs = require('fs');
let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');
content = content.replace(
  `        await db.media.update(entry.id, { \n          [field]: value, \n          updatedAt: new Date().toISOString() \n        });`,
  `        await db.media.update(entry.id, { \n          [field]: value, \n          updatedAt: new Date().toISOString() \n        } as any);`
);
fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
