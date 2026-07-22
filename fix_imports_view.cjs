const fs = require('fs');
let content = fs.readFileSync('src/components/entry/ViewEntryModal.tsx', 'utf8');
content = content.replace(/from '\.\.\/types'/g, "from '../../types'");
content = content.replace(/from '\.\.\/lib\/utils'/g, "from '../../lib/utils'");
content = content.replace(/from '\.\.\/db\/db'/g, "from '../../db/db'");
content = content.replace(/from '\.\/ConfirmModal'/g, "from '../common/ConfirmModal'");
fs.writeFileSync('src/components/entry/ViewEntryModal.tsx', content);
