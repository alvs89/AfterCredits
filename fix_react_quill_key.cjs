const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

content = content.replace(
  `{localJournal[currentJournalIndex] && (
                    <ReactQuill`,
  `{localJournal[currentJournalIndex] && (
                    <ReactQuill
                      key={currentJournalIndex}`
);

// We should also fix the onChange to not mutate in place!
const badOnChange = `onChange={(val) => {
                        const updated = [...localJournal];
                        if (updated[currentJournalIndex]) {
                          updated[currentJournalIndex].content = val;
                          setLocalJournal(updated);
                        }
                      }}`;
const goodOnChange = `onChange={(val) => {
                        const updated = [...localJournal];
                        if (updated[currentJournalIndex]) {
                          updated[currentJournalIndex] = { ...updated[currentJournalIndex], content: val };
                          setLocalJournal(updated);
                        }
                      }}`;
content = content.replace(badOnChange, goodOnChange);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
