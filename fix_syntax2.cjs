const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

// Replace the very last </div>\n  );\n} with </>\n  );\n}
content = content.replace(/<\/div>\s*\);\s*}/g, '</>\n  );\n}');

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
