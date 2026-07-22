const fs = require('fs');

let addEntry = fs.readFileSync('src/components/AddEntryModal.tsx', 'utf8');

addEntry = addEntry.replace(
  /"w-full px-4 py-2 rounded border focus:outline-none  bg-\[#14161C\] border-white\/10 text-sm"/g,
  `isDarkMode ? "w-full px-4 py-2 rounded border focus:outline-none bg-[#14161C] border-white/10 text-sm text-white" : "w-full px-4 py-2 rounded border focus:outline-none bg-white border-neutral-200 text-sm text-neutral-900"`
);

addEntry = addEntry.replace(
  /"w-full px-4 py-2 rounded border focus:outline-none bg-white\/5 border-white\/10 text-sm focus:border-\[#3B82F6\]\/50 transition-colors"/g,
  `"w-full px-4 py-2 rounded border focus:outline-none text-sm transition-colors", isDarkMode ? "bg-white/5 border-white/10 focus:border-[#3B82F6]/50 text-white" : "bg-white border-neutral-200 focus:border-[#3B82F6] text-neutral-900"`
);

addEntry = addEntry.replace(
  /"w-full px-4 py-2 rounded border focus:outline-none bg-white\/5 border-white\/10 text-sm focus:border-\[#3B82F6\]\/50 transition-colors",\s*isDarkMode && "\[color-scheme:dark\]"/g,
  `"w-full px-4 py-2 rounded border focus:outline-none text-sm transition-colors", isDarkMode ? "bg-white/5 border-white/10 focus:border-[#3B82F6]/50 text-white [color-scheme:dark]" : "bg-white border-neutral-200 focus:border-[#3B82F6] text-neutral-900"`
);

addEntry = addEntry.replace(
  /"flex-1 px-4 py-2 rounded border focus:outline-none text-sm bg-white\/5 border-white\/10 focus:border-\[#3B82F6\]\/50 transition-colors"/g,
  `"flex-1 px-4 py-2 rounded border focus:outline-none text-sm transition-colors", isDarkMode ? "bg-white/5 border-white/10 focus:border-[#3B82F6]/50 text-white" : "bg-white border-neutral-200 focus:border-[#3B82F6] text-neutral-900"`
);

addEntry = addEntry.replace(
  /className="block text-\[10px\] font-bold uppercase tracking-widest mb-1 text-white\/50"/g,
  `className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/50" : "text-neutral-500")}`
);

addEntry = addEntry.replace(
  /className="block text-\[10px\] font-bold uppercase tracking-widest mb-2 text-white\/50"/g,
  `className={cn("block text-[10px] font-bold uppercase tracking-widest mb-2", isDarkMode ? "text-white/50" : "text-neutral-500")}`
);

addEntry = addEntry.replace(
  /"bg-white\/5 border-white\/10 text-white\/50 hover:text-white hover:border-white\/20"/g,
  `isDarkMode ? "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20" : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"`
);

addEntry = addEntry.replace(
  /className="px-2 py-1 rounded bg-white\/5 border border-white\/10 text-\[10px\] text-white\/70 flex items-center gap-1"/g,
  `className={cn("px-2 py-1 rounded border text-[10px] flex items-center gap-1", isDarkMode ? "bg-white/5 border-white/10 text-white/70" : "bg-neutral-100 border-neutral-200 text-neutral-700")}`
);

addEntry = addEntry.replace(
  /className="w-3 h-3 text-white\/30 hover:text-white"/g,
  `className={cn("w-3 h-3", isDarkMode ? "text-white/30 hover:text-white" : "text-neutral-400 hover:text-neutral-900")}`
);

addEntry = addEntry.replace(
  /className="p-2 rounded bg-white\/5 border border-white\/10 text-white hover:bg-white\/10 transition-colors"/g,
  `className={cn("p-2 rounded border transition-colors", isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200")}`
);

addEntry = addEntry.replace(
  /className="flex justify-end gap-3 pt-6 border-t border-white\/5"/g,
  `className={cn("flex justify-end gap-3 pt-6 border-t", isDarkMode ? "border-white/5" : "border-neutral-200")}`
);

addEntry = addEntry.replace(
  /className="px-6 py-2 rounded font-semibold text-xs transition-colors text-white\/50 hover:text-white hover:bg-white\/5"/g,
  `className={cn("px-6 py-2 rounded font-semibold text-xs transition-colors", isDarkMode ? "text-white/50 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100")}`
);

addEntry = addEntry.replace(
  /className="text-2xl font-bold tracking-tight text-white mb-2"/g,
  `className={cn("text-2xl font-bold tracking-tight mb-2", isDarkMode ? "text-white" : "text-neutral-900")}`
);

addEntry = addEntry.replace(
  /className="text-white\/50 text-sm"/g,
  `className={cn("text-sm", isDarkMode ? "text-white/50" : "text-neutral-500")}`
);

addEntry = addEntry.replace(
  /className="w-full aspect-\[2\/3\] bg-\[#14161C\] rounded-lg flex flex-col items-center justify-center text-white\/20 border border-dashed border-white\/10 hover:border-[#3B82F6]\/50 hover:text-[#3B82F6]\/50 transition-colors cursor-pointer"/g,
  `className={cn("w-full aspect-[2/3] rounded-lg flex flex-col items-center justify-center border border-dashed transition-colors cursor-pointer", isDarkMode ? "bg-[#14161C] text-white/20 border-white/10 hover:border-[#3B82F6]/50 hover:text-[#3B82F6]/50" : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:border-[#3B82F6]/50 hover:text-[#3B82F6]/50")}`
);

addEntry = addEntry.replace(
  /className="absolute inset-0 bg-black\/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg"/g,
  `className={cn("absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg", isDarkMode ? "bg-black/50 text-white" : "bg-white/50 text-neutral-900")}`
);

fs.writeFileSync('src/components/AddEntryModal.tsx', addEntry);
