const fs = require('fs');

function updateFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');

  // We need to replace the platform/status div and the dates div in both files.
  // In Dashboard.tsx:
  /*
                <div className="flex items-center justify-between text-[10px] mb-2">
                  <span className={cn("text-white/50")}>{entry.platform || 'Unknown Platform'}</span>
                  <span className={isDarkMode ? "text-white/60" : "text-neutral-600"}>{formatWatchStatus(entry.status)}</span>
                </div>
                
                {(entry.dateStarted || entry.dateCompleted) && (
                  <div className={cn("flex items-center justify-between text-[9px] px-2 py-1.5 rounded mb-1 mt-auto border", isDarkMode ? "text-white/50 bg-[#1A1D24] border-white/5" : "text-neutral-500 bg-neutral-50 border-neutral-200")}>
                    {entry.dateStarted && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-2.5 h-2.5 text-[#3B82F6]" />
                        <span>{new Date(entry.dateStarted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                    {entry.dateCompleted && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        {entry.dateStarted && <span className={cn("px-0.5", isDarkMode ? "text-white/20" : "text-neutral-300")}>→</span>}
                        <span className={!entry.dateStarted ? "flex items-center gap-1.5" : ""}>
                          {!entry.dateStarted && <Calendar className="w-2.5 h-2.5 text-[#3B82F6]" />}
                          {new Date(entry.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
  */

  // Let's just use regex to replace everything from the platform div to the end of the dates div.
  // The structure is roughly:
  // <div className="flex items-center justify-between...
  // ...
  // </div>
  // 
  // {(entry.dateStarted || entry.dateCompleted) && (
  //   <div className={cn("flex items-center justify-between text-[9px]...
  //     ...
  //   </div>
  // )}

  const replacement = `<div className="mt-auto flex flex-col gap-1">
                <div className={cn("flex items-center justify-between text-[10px]", isDarkMode ? "text-white/40" : "text-neutral-500")}>
                  <span>{entry.platform || 'Unknown'}</span>
                  <span>{formatWatchStatus(entry.status)}</span>
                </div>
                
                {(entry.dateStarted || entry.dateCompleted) && (
                  <div className={cn("flex items-center justify-between text-[9px]", isDarkMode ? "text-white/30" : "text-neutral-400")}>
                    {entry.dateStarted && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 opacity-50" />
                        {new Date(entry.dateStarted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {entry.dateCompleted && (
                      <span className={cn("flex items-center gap-1", entry.dateStarted ? "ml-auto" : "")}>
                        {entry.dateStarted && <span className="opacity-40 px-0.5">→</span>}
                        {!entry.dateStarted && <Calendar className="w-2.5 h-2.5 opacity-50" />}
                        {new Date(entry.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                )}
              </div>`;

  if (filename === 'src/pages/Dashboard.tsx') {
    const regex = /<div className="flex items-center justify-between text-\[10px\] mb-2">[\s\S]*?\}\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>/;
    content = content.replace(regex, replacement + '\n              </div>\n            </div>');
    fs.writeFileSync(filename, content);
  } else if (filename === 'src/pages/MediaList.tsx') {
    const regex = /<div className=\{cn\("flex items-center justify-between mt-auto text-\[10px\] mb-2"[\s\S]*?\}\s*<\/div>\s*\)\}/;
    content = content.replace(regex, replacement);
    fs.writeFileSync(filename, content);
  }
}

updateFile('src/pages/Dashboard.tsx');
updateFile('src/pages/MediaList.tsx');
