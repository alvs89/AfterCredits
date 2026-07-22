const fs = require('fs');

let viewEntry = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

// Top-right close button
viewEntry = viewEntry.replace(
  /className="absolute top-6 right-6 p-2 rounded bg-white\/5 hover:bg-white\/10 transition-colors border border-white\/10 z-10 hidden md:block"/g,
  `className={cn("absolute top-6 right-6 p-2 rounded transition-colors border z-10 hidden md:block", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-900")}`
);

viewEntry = viewEntry.replace(
  /<X className="w-4 h-4 text-white\/50" \/>/g,
  `<X className={cn("w-4 h-4", isDarkMode ? "text-white/50" : "text-neutral-500")} />`
);

// Title
viewEntry = viewEntry.replace(
  /className="text-4xl font-bold tracking-tight  mb-4 text-white"/g,
  `className={cn("text-4xl font-bold tracking-tight mb-4", isDarkMode ? "text-white" : "text-neutral-900")}`
);

// Genres
viewEntry = viewEntry.replace(
  /className="text-\[10px\] px-3 py-1\.5 rounded-full bg-white\/5 border border-white\/10 text-white\/70 font-medium"/g,
  `className={cn("text-[10px] px-3 py-1.5 rounded-full border font-medium", isDarkMode ? "bg-white/5 border-white/10 text-white/70" : "bg-neutral-100 border-neutral-200 text-neutral-700")}`
);

// Tabs container border
viewEntry = viewEntry.replace(
  /className="flex gap-6 border-b border-white\/5 mb-6 shrink-0 mt-2"/g,
  `className={cn("flex gap-6 border-b mb-6 shrink-0 mt-2", isDarkMode ? "border-white/5" : "border-neutral-200")}`
);

// Tabs active/inactive
viewEntry = viewEntry.replace(
  /activeTab === 'summary' \? "text-\[#3B82F6\] border-\[#3B82F6\]" : "text-white\/40 border-transparent hover:text-white"/g,
  `activeTab === 'summary' ? "text-[#3B82F6] border-[#3B82F6]" : (isDarkMode ? "text-white/40 border-transparent hover:text-white" : "text-neutral-400 border-transparent hover:text-neutral-900")`
);

viewEntry = viewEntry.replace(
  /activeTab === 'review' \? "text-\[#3B82F6\] border-\[#3B82F6\]" : "text-white\/40 border-transparent hover:text-white"/g,
  `activeTab === 'review' ? "text-[#3B82F6] border-[#3B82F6]" : (isDarkMode ? "text-white/40 border-transparent hover:text-white" : "text-neutral-400 border-transparent hover:text-neutral-900")`
);

viewEntry = viewEntry.replace(
  /activeTab === 'notes' \? "text-\[#3B82F6\] border-\[#3B82F6\]" : "text-white\/40 border-transparent hover:text-white"/g,
  `activeTab === 'notes' ? "text-[#3B82F6] border-[#3B82F6]" : (isDarkMode ? "text-white/40 border-transparent hover:text-white" : "text-neutral-400 border-transparent hover:text-neutral-900")`
);

// We should also check the editor text colors which are handled by global css (index.css) probably.
// Wait, the main container bg is `isDarkMode ? "bg-[#0A0B0E]" : "bg-white"` in App.tsx or MediaList.tsx or Dashboard.tsx, but what about the modal?
// Let's check where the modal container is defined.

fs.writeFileSync('src/components/ViewEntryModal.tsx', viewEntry);
