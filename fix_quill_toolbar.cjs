const fs = require('fs');
let code = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');
code = code.replace(/\[\{ 'color': \[\] \}, \{ 'background': \[\] \}\],\n/g, '');
fs.writeFileSync('src/components/ViewEntryModal.tsx', code);
