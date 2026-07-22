const fs = require('fs');
let content = fs.readFileSync('src/components/entry/AddEntryModal.tsx', 'utf8');
content = content.replace(/from '\.\.\/lib\/utils'/g, "from '../../lib/utils'");
content = content.replace(/from '\.\.\/db\/db'/g, "from '../../db/db'");
content = content.replace(/from '\.\/SearchableDropdown'/g, "from '../common/SearchableDropdown'");
content = content.replace(/from '\.\.\/types'/g, "from '../../types'");
fs.writeFileSync('src/components/entry/AddEntryModal.tsx', content);
