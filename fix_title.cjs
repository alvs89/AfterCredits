const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

const badTitle = `onChange={(e) => {
                          const updated = [...localJournal];
                          if (updated[currentJournalIndex]) {
                            updated[currentJournalIndex].title = e.target.value;
                            setLocalJournal(updated);
                          }
                        }}`;
const goodTitle = `onChange={(e) => {
                          const updated = [...localJournal];
                          if (updated[currentJournalIndex]) {
                            updated[currentJournalIndex] = { ...updated[currentJournalIndex], title: e.target.value };
                            setLocalJournal(updated);
                          }
                        }}`;
content = content.replace(badTitle, goodTitle);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
