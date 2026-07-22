const fs = require('fs');

function updateFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');

  // Let's replace the mangled dates block in Dashboard.tsx:
  // The mangled block starts with {(entry.dateStarted || entry.dateCompleted) && (
  // and has extra parts. We'll replace the whole `.mt-auto` block.
  
  const regex = /<div className="mt-auto flex flex-col gap-1 pt-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

  const replacement = `<div className="mt-auto flex flex-col gap-1 pt-2">
                  <div className={cn("flex items-center justify-between text-[10px]", isDarkMode ? "text-white/40" : "text-neutral-500")}>
                    <span>{entry.platform || 'Unknown'}</span>
                    <span>{formatWatchStatus(entry.status)}</span>
                  </div>
                  
                  {(entry.dateStarted || entry.dateCompleted) && (
                    <div className={cn("flex items-center gap-1.5 text-[10px] mt-1", isDarkMode ? "text-white/40" : "text-neutral-500")}>
                      <Calendar className="w-3 h-3 opacity-40 shrink-0" />
                      <span className="truncate">
                        {entry.dateStarted ? new Date(entry.dateStarted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '?'}
                        {' – '}
                        {entry.dateCompleted ? new Date(entry.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Present'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>`;

  content = content.replace(regex, replacement);
  fs.writeFileSync(filename, content);
}

updateFile('src/pages/Dashboard.tsx');
updateFile('src/pages/MediaList.tsx');
