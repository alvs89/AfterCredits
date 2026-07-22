const fs = require('fs');
let c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
c = c.replace(/                  \}\)\}\n                <\/div>\n            \}\)\}\n          <\/div>/g, 
  "                  )}\n                </div>\n              </div>\n            ))}\n          </div>");
fs.writeFileSync('src/pages/Dashboard.tsx', c);
