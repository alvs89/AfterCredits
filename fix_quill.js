const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

if (!css.includes('.custom-quill-container .ql-editor {')) {
    console.log("Not found");
} else {
    css = css.replace(
        /\.custom-quill-container \.ql-editor \{([\s\S]*?)\}/,
        ".custom-quill-container .ql-editor {$1  color: inherit;\n}"
    );
    // Also strip color styles from * inside ql-editor
    css += `\n\n/* Force WCAG compliant theme-aware colors in Quill */\n.custom-quill-container .ql-editor * {\n  color: inherit !important;\n  background-color: transparent !important;\n}\n`;
    fs.writeFileSync('src/index.css', css);
}
