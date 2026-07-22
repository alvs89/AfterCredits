const fs = require('fs');
let c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

c = c.replace(
  `                    </div>\n                  )}\n                </div>\n            ))}`,
  `                    </div>\n                  )}\n                </div>\n              </div>\n            ))}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', c);
