const fs = require('fs');

let content = fs.readFileSync('src/pages/MediaList.tsx', 'utf8');

// Replace the Edit/Delete button block with View/Edit/Delete
const target = `<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); }}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-xs font-semibold w-32 flex items-center justify-center gap-2 transition-colors border border-white/10"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id!); }}
                    className="bg-neutral-500/20 hover:bg-neutral-500/40 text-neutral-100 px-4 py-2 rounded text-xs font-semibold w-32 flex items-center justify-center gap-2 transition-colors border border-neutral-500/20"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>`;

const replacement = `<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setViewingEntry(entry); }}
                    className="bg-[#3B82F6]/90 hover:bg-[#3B82F6] text-white px-4 py-2 rounded text-xs font-semibold w-32 flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-white/20"
                  >
                    <Search className="w-3 h-3" /> View
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); }}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-xs font-semibold w-32 flex items-center justify-center gap-2 transition-colors border border-white/10"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id!); }}
                    className="bg-neutral-500/20 hover:bg-neutral-500/40 text-neutral-100 px-4 py-2 rounded text-xs font-semibold w-32 flex items-center justify-center gap-2 transition-colors border border-neutral-500/20"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>`;

content = content.replace(target, replacement);

if (!content.includes('<Search className="w-3 h-3" /> View')) {
    console.log("Failed to replace in MediaList.tsx");
} else {
    fs.writeFileSync('src/pages/MediaList.tsx', content);
    console.log("Replaced in MediaList.tsx successfully");
}
