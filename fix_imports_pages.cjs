const fs = require('fs');
['Dashboard.tsx', 'MediaList.tsx', 'Settings.tsx', 'Statistics.tsx'].forEach(file => {
  const path = `src/pages/${file}`;
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/from '\.\.\/components\/ViewEntryModal'/g, "from '../components/entry/ViewEntryModal'");
    content = content.replace(/from '\.\.\/components\/AddEntryModal'/g, "from '../components/entry/AddEntryModal'");
    content = content.replace(/from '\.\.\/components\/ConfirmModal'/g, "from '../components/common/ConfirmModal'");
    content = content.replace(/from '\.\.\/components\/SearchableDropdown'/g, "from '../components/common/SearchableDropdown'");
    fs.writeFileSync(path, content);
  }
});
