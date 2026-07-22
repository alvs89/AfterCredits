const fs = require('fs');
let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');
content = content.replace(
  `{localJournal[currentJournalIndex] && (
                    <ReactQuill
                      key={currentJournalIndex}`,
  `{localJournal[currentJournalIndex] && (
                    <div key={currentJournalIndex} className="w-full flex-1 flex flex-col h-full min-h-0">
                      <ReactQuill`
);
content = content.replace(
  `                    />
                  )}
                </div>`,
  `                    />
                    </div>
                  )}
                </div>`
);
fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
