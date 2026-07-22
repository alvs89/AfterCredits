const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const regex = /<div className="flex items-center justify-between text-\[10px\] mb-2">[\s\S]*?\}\s*<\/div>\s*\)\}\s*<\/div>/;

const replacement = `<div className="mt-auto flex flex-col gap-1 pt-2">
                  <div className={cn("flex items-center justify-between text-[10px]", isDarkMode ? "text-white/40" : "text-neutral-500")}>
                    <span>{entry.platform || 'Unknown'}</span>
                    <span>{formatWatchStatus(entry.status)}</span>
                  </div>
                  
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
                </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/Dashboard.tsx', content);

// And update MediaList again to match exact styles (smaller icons, pt-2)
let contentML = fs.readFileSync('src/pages/MediaList.tsx', 'utf8');
const regexML = /<div className="mt-auto flex flex-col gap-1">[\s\S]*?\}\s*<\/div>\s*\)\}\s*<\/div>/;
contentML = contentML.replace(regexML, replacement);
fs.writeFileSync('src/pages/MediaList.tsx', contentML);
