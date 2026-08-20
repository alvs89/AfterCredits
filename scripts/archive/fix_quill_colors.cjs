const fs = require('fs');

const colors = [
  '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
  '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
  '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff',
  '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
  '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'
];

let css = '\n/* Quill Color Fixes */\n';
colors.forEach(color => {
  // Quill uses hex values or rgb values? 
  // Quill standard classes are like .ql-color-red. Wait, no. Quill 1.3+ uses custom hex values in style attribute for custom colors, but for standard palette it uses classes IF you configure it, or inline styles IF you don't?
  // Wait! Actually, in React Quill, standard colors are added as inline styles if they are NOT in the default class list. BUT the default 35 colors use inline styles too if you configure them with hex!
  // No, standard colors use inline styles ONLY IF you use the inline format.
  // By default, Quill uses classes like `ql-color-#e60000`? NO. Quill uses `.ql-color-red` ? No, Quill classes are NOT named like that.
});
