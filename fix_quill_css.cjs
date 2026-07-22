const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('.custom-quill-container .ql-editor {\n  padding: 0 !important;\n  word-wrap: break-word;\n  white-space: pre-wrap;\n  min-height: 150px;\n  overflow-y: auto;\n  flex: 1;\n}', '.custom-quill-container .ql-editor {\n  padding: 0 !important;\n  word-wrap: break-word;\n  white-space: pre-wrap;\n  min-height: 0;\n  height: 100%;\n  overflow-y: auto;\n  flex: 1;\n}');

fs.writeFileSync('src/index.css', css);
