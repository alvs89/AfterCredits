const fs = require('fs');

function update(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the Search icon in the View button with Eye
    content = content.replace('<Search className="w-3 h-3" /> View', '<Eye className="w-3 h-3" /> View');
    
    // Add Eye to imports
    if (file === 'src/pages/MediaList.tsx') {
        content = content.replace('Search, Filter, Star', 'Search, Filter, Star, Eye');
    } else {
        content = content.replace('Edit2, Trash2, Search', 'Edit2, Trash2, Search, Eye');
    }

    fs.writeFileSync(file, content);
}

update('src/pages/MediaList.tsx');
update('src/pages/Dashboard.tsx');
