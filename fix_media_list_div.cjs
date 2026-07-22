const fs = require('fs');

let content = fs.readFileSync('src/pages/MediaList.tsx', 'utf8');

// The problematic block in MediaList:
/*
                </div>
              </div>
              {entry.genres && entry.genres.length > 0 && (
*/
content = content.replace(
  `                </div>\n              </div>\n              {entry.genres && entry.genres.length > 0 && (`,
  `                </div>\n              {entry.genres && entry.genres.length > 0 && (`
);

fs.writeFileSync('src/pages/MediaList.tsx', content);

// Also need to check if I closed extra divs in Dashboard?
// In Dashboard, I pushed `            ))} ` but in the original Dashboard:
