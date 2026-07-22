const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

const navLeftTarget = `onClick={() => setCurrentJournalIndex(Math.max(0, currentJournalIndex - 1))}`;
const navLeftReplacement = `onClick={async () => {
                          await db.media.update(entry.id!, { journal: localJournal } as any);
                          setCurrentJournalIndex(Math.max(0, currentJournalIndex - 1));
                        }}`;

const navRightTarget = `onClick={() => setCurrentJournalIndex(Math.min(localJournal.length - 1, currentJournalIndex + 1))}`;
const navRightReplacement = `onClick={async () => {
                          await db.media.update(entry.id!, { journal: localJournal } as any);
                          setCurrentJournalIndex(Math.min(localJournal.length - 1, currentJournalIndex + 1));
                        }}`;

content = content.replace(navLeftTarget, navLeftReplacement);
content = content.replace(navRightTarget, navRightReplacement);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
