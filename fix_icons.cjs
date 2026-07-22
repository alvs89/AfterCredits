const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

content = content.replace(
  `import { X, Star, Calendar, Edit2, Save, Maximize2, Minimize2, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';`,
  `import { X, Star, Calendar, Edit2, Save, Maximize2, Minimize2, ChevronLeft, ChevronRight, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';`
);

content = content.replace(
  `<ChevronLeft className="w-4 h-4 text-neutral-500" />`,
  `<ArrowLeft className="w-4 h-4 text-neutral-500" />`
);
content = content.replace(
  `<ChevronRight className="w-4 h-4 text-neutral-500" />`,
  `<ArrowRight className="w-4 h-4 text-neutral-500" />`
);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
