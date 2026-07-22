const fs = require('fs');

// AddEntryModal.tsx
let addEntryModal = fs.readFileSync('src/components/AddEntryModal.tsx', 'utf8');
addEntryModal = addEntryModal.replace(/import \{ cn \} from '\.\.\/lib\/utils';/, "import { cn, formatMediaType, formatWatchStatus } from '../lib/utils';");
addEntryModal = addEntryModal.replace(/\{Object.values\(MediaType\).map\(t => \(\s*<option key=\{t\} value=\{t\}>[^<]+<\/option>\s*\)\)\}/, "{Object.values(MediaType).map(t => (\n                      <option key={t} value={t}>{formatMediaType(t)}</option>\n                    ))}");
addEntryModal = addEntryModal.replace(/\{Object.values\(WatchStatus\).map\(t => \(\s*<option key=\{t\} value=\{t\}>[^<]+<\/option>\s*\)\)\}/, "{Object.values(WatchStatus).map(t => (\n                      <option key={t} value={t}>{formatWatchStatus(t)}</option>\n                    ))}");
fs.writeFileSync('src/components/AddEntryModal.tsx', addEntryModal);

// ViewEntryModal.tsx
let viewEntryModal = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');
viewEntryModal = viewEntryModal.replace(/import \{ cn \} from '\.\.\/lib\/utils';/, "import { cn, formatMediaType, formatWatchStatus } from '../lib/utils';");
viewEntryModal = viewEntryModal.replace(/\{entry.type.replace\(\/_\/g, ' '\)\}/, "{formatMediaType(entry.type)}");
viewEntryModal = viewEntryModal.replace(/\{entry.status.replace\(\/_\/g, ' '\)\}/, "{formatWatchStatus(entry.status)}");
fs.writeFileSync('src/components/ViewEntryModal.tsx', viewEntryModal);

// Dashboard.tsx
let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/import \{ cn \} from '\.\.\/lib\/utils';/, "import { cn, formatMediaType, formatWatchStatus } from '../lib/utils';");
dashboard = dashboard.replace(/\{entry.type.replace\(\/_\/g, ' '\)\}/g, "{formatMediaType(entry.type)}");
dashboard = dashboard.replace(/\{entry.status.replace\(\/_\/g, ' '\)\}/g, "{formatWatchStatus(entry.status)}");
fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);

// MediaList.tsx
let mediaList = fs.readFileSync('src/pages/MediaList.tsx', 'utf8');
mediaList = mediaList.replace(/import \{ cn \} from '\.\.\/lib\/utils';/, "import { cn, formatMediaType, formatWatchStatus } from '../lib/utils';");
mediaList = mediaList.replace(/\{entry.type.replace\(\/_\/g, ' '\)\}/g, "{formatMediaType(entry.type)}");
mediaList = mediaList.replace(/\{entry.status.replace\(\/_\/g, ' '\)\}/g, "{formatWatchStatus(entry.status)}");
fs.writeFileSync('src/pages/MediaList.tsx', mediaList);

// Statistics.tsx
let statistics = fs.readFileSync('src/pages/Statistics.tsx', 'utf8');
statistics = statistics.replace(/import \{ cn \} from '\.\.\/lib\/utils';/, "import { cn, formatMediaType, formatWatchStatus } from '../lib/utils';");
statistics = statistics.replace(/curr.type.replace\(\/_\/g, ' '\)/g, "formatMediaType(curr.type)");
statistics = statistics.replace(/curr.status.replace\(\/_\/g, ' '\)/g, "formatWatchStatus(curr.status)");
fs.writeFileSync('src/pages/Statistics.tsx', statistics);

