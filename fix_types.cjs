const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');

const journalEntry = `export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  title?: string;
}

`;

if (!content.includes('JournalEntry')) {
    content = content.replace('export interface MediaEntry {', journalEntry + 'export interface MediaEntry {\n  journal?: JournalEntry[];');
    fs.writeFileSync('src/types.ts', content);
}
