const fs = require('fs');
let content = fs.readFileSync('src/components/common/ConfirmModal.tsx', 'utf8');
content = content.replace(/from '\.\.\/lib\/utils'/g, "from '../../lib/utils'");
fs.writeFileSync('src/components/common/ConfirmModal.tsx', content);

let content2 = fs.readFileSync('src/components/common/SearchableDropdown.tsx', 'utf8');
content2 = content2.replace(/from '\.\.\/lib\/utils'/g, "from '../../lib/utils'");
fs.writeFileSync('src/components/common/SearchableDropdown.tsx', content2);
