const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const newHtml = html.replace(
  '</head>',
  `  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">\n  <style>body { font-family: 'Inter', sans-serif; }</style>\n  </head>`
);
fs.writeFileSync('index.html', newHtml);
