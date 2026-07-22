const fs = require('fs');

let addEntry = fs.readFileSync('src/components/AddEntryModal.tsx', 'utf8');

addEntry = addEntry.replace(
  /className="absolute top-6 right-6 p-2 rounded bg-white\/5 hover:bg-white\/10 transition-colors border border-white\/10"/g,
  `className={cn("absolute top-6 right-6 p-2 rounded transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200")}`
);

fs.writeFileSync('src/components/AddEntryModal.tsx', addEntry);

let viewEntry = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

viewEntry = viewEntry.replace(
  /className="absolute top-4 right-4 p-2 rounded bg-white\/5 hover:bg-white\/10 transition-colors border border-white\/10 z-10 md:hidden"/g,
  `className={cn("absolute top-4 right-4 p-2 rounded transition-colors border z-10 md:hidden", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-900")}`
);

fs.writeFileSync('src/components/ViewEntryModal.tsx', viewEntry);
