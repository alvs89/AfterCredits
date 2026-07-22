const fs = require('fs');
let viewEntry = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

viewEntry = viewEntry.replace(
  /className="w-full md:w-\[300px\] shrink-0 bg-\[#1A1D24\] relative flex flex-col"/g,
  `className={cn("w-full md:w-[300px] shrink-0 relative flex flex-col border-r", isDarkMode ? "bg-[#1A1D24] border-white/5" : "bg-neutral-50 border-neutral-200")}`
);

viewEntry = viewEntry.replace(
  /className="w-full h-full flex items-center justify-center text-white\/10 font-sans font-semibold  text-xl px-4 text-center"/g,
  `className={cn("w-full h-full flex items-center justify-center font-sans font-semibold text-xl px-4 text-center", isDarkMode ? "text-white/10" : "text-neutral-300")}`
);

viewEntry = viewEntry.replace(
  /className="absolute inset-0 bg-gradient-to-t from-\[#1A1D24\] via-transparent to-transparent pointer-events-none"/g,
  `className={cn("absolute inset-0 bg-gradient-to-t via-transparent to-transparent pointer-events-none", isDarkMode ? "from-[#1A1D24]" : "from-neutral-50")}`
);

viewEntry = viewEntry.replace(
  /className="bg-white\/10 text-white\/80 text-\[10px\] font-bold px-2 py-1 rounded  backdrop-blur-sm"/g,
  `className={cn("text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm", isDarkMode ? "bg-white/10 text-white/80" : "bg-white/60 text-neutral-800")}`
);

viewEntry = viewEntry.replace(
  /className="w-full bg-white\/5 hover:bg-white\/10 text-white px-4 py-2\.5 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-white\/10"/g,
  `className={cn("w-full px-4 py-2.5 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 text-white border-white/10" : "bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 shadow-sm")}`
);

viewEntry = viewEntry.replace(
  /className="text-\[10px\] font-bold uppercase tracking-widest text-white\/30 mb-1"/g,
  `className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/30" : "text-neutral-500")}`
);

viewEntry = viewEntry.replace(
  /className="text-sm  font-medium text-white\/80"/g,
  `className={cn("text-sm font-medium", isDarkMode ? "text-white/80" : "text-neutral-800")}`
);

viewEntry = viewEntry.replace(
  /className="text-sm font-medium text-white\/80"/g,
  `className={cn("text-sm font-medium", isDarkMode ? "text-white/80" : "text-neutral-800")}`
);

viewEntry = viewEntry.replace(
  /className="flex flex-col gap-1 text-sm text-white\/80"/g,
  `className={cn("flex flex-col gap-1 text-sm", isDarkMode ? "text-white/80" : "text-neutral-800")}`
);

fs.writeFileSync('src/components/ViewEntryModal.tsx', viewEntry);
