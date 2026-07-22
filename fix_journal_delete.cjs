const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

const regex = /const handleDeleteJournalPage = async \(index: number\) => \{[\s\S]*?updatedAt: new Date\(\)\.toISOString\(\)\s*\}\);\s*\};/;

const replacement = `const handleDeleteJournalPage = async (index: number) => {
    setJournalPageToDelete(index);
  };
  
  const confirmDeleteJournalPage = async () => {
    if (journalPageToDelete === null || !entry || !entry.id) return;
    const index = journalPageToDelete;
    
    if (localJournal.length <= 1) {
      const updatedJournal = [{ ...localJournal[0], content: '', title: 'Page 1' }];
      setLocalJournal(updatedJournal);
      await db.media.update(entry.id, { journal: updatedJournal, updatedAt: new Date().toISOString() });
      setJournalPageToDelete(null);
      return;
    }

    const updatedJournal = localJournal.filter((_, i) => i !== index);
    setLocalJournal(updatedJournal);
    if (currentJournalIndex >= updatedJournal.length) {
      setCurrentJournalIndex(Math.max(0, updatedJournal.length - 1));
    }
    await db.media.update(entry.id, {
      journal: updatedJournal,
      updatedAt: new Date().toISOString()
    });
    setJournalPageToDelete(null);
  };`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
