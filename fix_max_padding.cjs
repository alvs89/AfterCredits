const fs = require('fs');
let code = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

code = code.replace(
  /className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black\/80 backdrop-blur-sm"/,
  `className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm", isMaximized ? "p-0" : "p-4")}`
);

fs.writeFileSync('src/components/ViewEntryModal.tsx', code);
