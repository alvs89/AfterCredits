const fs = require('fs');

function updateFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');

  // Let's replace the whole dates part
  // Look for:
  // <div className="mt-auto flex flex-col gap-1 pt-2">
  // ...
  // {entry.dateCompleted && ( ...
  // ...
  // ))}

  const lines = content.split('\n');
  let newLines = [];
  let skip = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<div className="mt-auto flex flex-col gap-1 pt-2">')) {
      skip = true;
      newLines.push(lines[i]); // Keep the mt-auto div
      newLines.push(`                  <div className={cn("flex items-center justify-between text-[10px]", isDarkMode ? "text-white/40" : "text-neutral-500")}>`);
      newLines.push(`                    <span>{entry.platform || 'Unknown'}</span>`);
      newLines.push(`                    <span>{formatWatchStatus(entry.status)}</span>`);
      newLines.push(`                  </div>`);
      newLines.push(`                  {(entry.dateStarted || entry.dateCompleted) && (`);
      newLines.push(`                    <div className={cn("flex items-center gap-1.5 text-[10px] mt-1", isDarkMode ? "text-white/40" : "text-neutral-500")}>`);
      newLines.push(`                      <Calendar className="w-3 h-3 opacity-40 shrink-0" />`);
      newLines.push(`                      <span className="truncate">`);
      newLines.push(`                        {entry.dateStarted ? new Date(entry.dateStarted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '?'}`);
      newLines.push(`                        {' – '}`);
      newLines.push(`                        {entry.dateCompleted ? new Date(entry.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Present'}`);
      newLines.push(`                      </span>`);
      newLines.push(`                    </div>`);
      newLines.push(`                  )}`);
      newLines.push(`                </div>`);
      newLines.push(`              </div>`);
      if (filename === 'src/pages/Dashboard.tsx') {
        newLines.push(`            ))} `);
      }
      continue;
    }
    
    if (skip) {
      if (filename === 'src/pages/Dashboard.tsx' && lines[i].includes('))}')) {
        skip = false;
      } else if (filename === 'src/pages/MediaList.tsx' && lines[i].includes('{entry.genres && entry.genres.length > 0 && (')) {
        skip = false;
        newLines.push(lines[i]);
      }
    } else {
      newLines.push(lines[i]);
    }
  }

  fs.writeFileSync(filename, newLines.join('\n'));
}

updateFile('src/pages/Dashboard.tsx');
updateFile('src/pages/MediaList.tsx');
