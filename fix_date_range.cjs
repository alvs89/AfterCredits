const fs = require('fs');

function updateFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');

  // Dashboard & MediaList have this block:
  /*
                  {(entry.dateStarted || entry.dateCompleted) && (
                    <div className={cn("flex items-center justify-between text-[9px]", isDarkMode ? "text-white/30" : "text-neutral-400")}>
                      {entry.dateStarted && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2 h-2 opacity-50" />
                          {new Date(entry.dateStarted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {entry.dateCompleted && (
                        <span className={cn("flex items-center gap-1", entry.dateStarted ? "ml-auto" : "")}>
                          {entry.dateStarted && <span className="opacity-40 px-0.5">→</span>}
                          {!entry.dateStarted && <Calendar className="w-2 h-2 opacity-50" />}
                          {new Date(entry.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
  */

  const regex = /\{\(entry\.dateStarted \|\| entry\.dateCompleted\) && \([\s\S]*?\n\s*\)\}/g;
  
  const replacement = `{(entry.dateStarted || entry.dateCompleted) && (
                    <div className={cn("flex items-center gap-1.5 text-[10px]", isDarkMode ? "text-white/40" : "text-neutral-500")}>
                      <Calendar className="w-3 h-3 opacity-40 shrink-0" />
                      <span className="truncate">
                        {entry.dateStarted ? new Date(entry.dateStarted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '?'}
                        {' – '}
                        {entry.dateCompleted ? new Date(entry.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Present'}
                      </span>
                    </div>
                  )}`;

  content = content.replace(regex, replacement);
  fs.writeFileSync(filename, content);
}

updateFile('src/pages/Dashboard.tsx');
updateFile('src/pages/MediaList.tsx');
