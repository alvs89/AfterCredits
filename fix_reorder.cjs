const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

const replacementFunc = `
  const handleMoveJournalPage = async (index: number, direction: 'left' | 'right') => {
    if (!entry || !entry.id) return;
    if (direction === 'left' && index > 0) {
      const updatedJournal = [...localJournal];
      [updatedJournal[index - 1], updatedJournal[index]] = [updatedJournal[index], updatedJournal[index - 1]];
      setLocalJournal(updatedJournal);
      setCurrentJournalIndex(index - 1);
      await db.media.update(entry.id, { journal: updatedJournal, updatedAt: new Date().toISOString() });
    } else if (direction === 'right' && index < localJournal.length - 1) {
      const updatedJournal = [...localJournal];
      [updatedJournal[index], updatedJournal[index + 1]] = [updatedJournal[index + 1], updatedJournal[index]];
      setLocalJournal(updatedJournal);
      setCurrentJournalIndex(index + 1);
      await db.media.update(entry.id, { journal: updatedJournal, updatedAt: new Date().toISOString() });
    }
  };

  const handleUpdateJournalMeta = async (index: number, updates: Partial<JournalEntry>) => {`;

content = content.replace(
  `  const handleUpdateJournalMeta = async (index: number, updates: Partial<JournalEntry>) => {`,
  replacementFunc
);


const replacementUI = `                      <div className={cn("w-px h-4 mx-1", isDarkMode ? "bg-white/10" : "bg-neutral-300")} />

                      <button 
                        onClick={() => handleMoveJournalPage(currentJournalIndex, 'left')}
                        disabled={currentJournalIndex === 0}
                        className="p-1.5 rounded hover:bg-neutral-500/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Move page left"
                      >
                        <ChevronLeft className="w-4 h-4 text-neutral-500" />
                      </button>
                      <button 
                        onClick={() => handleMoveJournalPage(currentJournalIndex, 'right')}
                        disabled={currentJournalIndex === localJournal.length - 1}
                        className="p-1.5 rounded hover:bg-neutral-500/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Move page right"
                      >
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      </button>

                      <div className={cn("w-px h-4 mx-1", isDarkMode ? "bg-white/10" : "bg-neutral-300")} />

                      <button `;

content = content.replace(
  `                      <div className={cn("w-px h-4 mx-1", isDarkMode ? "bg-white/10" : "bg-neutral-300")} />

                      <button `,
  replacementUI
);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
