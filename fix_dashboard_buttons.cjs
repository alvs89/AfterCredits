const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!content.includes('const handleDelete')) {
  // Add handleDelete
  const hookTarget = `  const [editingEntry, setEditingEntry] = useState<MediaEntry | null>(null);`;
  const hookReplacement = `  const [editingEntry, setEditingEntry] = useState<MediaEntry | null>(null);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await db.media.delete(id);
    }
  };`;
  content = content.replace(hookTarget, hookReplacement);
}

const overlayTarget = `<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>`;
const overlayReplacement = `<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-20">
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

if (!content.includes('<Search className="w-3 h-3" /> View')) {
  content = content.replace(overlayTarget, overlayReplacement);
  
  // also add missing imports for Edit2, Trash2, Search
  const importTarget = `import { Clock, Star, PlayCircle, Trophy, Calendar } from 'lucide-react';`;
  const importReplacement = `import { Clock, Star, PlayCircle, Trophy, Calendar, Edit2, Trash2, Search } from 'lucide-react';`;
  content = content.replace(importTarget, importReplacement);

  fs.writeFileSync('src/pages/Dashboard.tsx', content);
  console.log("Dashboard updated");
} else {
  console.log("Dashboard already updated");
}
