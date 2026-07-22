const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

if (!content.includes('import { ConfirmModal }')) {
  content = content.replace(
    "import ReactQuill from 'react-quill-new';",
    "import ReactQuill from 'react-quill-new';\nimport { ConfirmModal } from './ConfirmModal';"
  );
}

content = content.replace(
  "const [saveStatus, setSaveStatus] = useState<'' | 'Saving...' | 'Saved'>('');",
  "const [saveStatus, setSaveStatus] = useState<'' | 'Saving...' | 'Saved'>('');\n  const [journalPageToDelete, setJournalPageToDelete] = useState<number | null>(null);"
);

content = content.replace(
  `  const handleDeleteJournalPage = async (index: number) => {
    if (!entry || !entry.id) return;
    if (localJournal.length <= 1) {
      const updatedJournal = [{ ...localJournal[0], content: '', title: 'Page 1' }];
      setLocalJournal(updatedJournal);
      await db.media.update(entry.id, { journal: updatedJournal, updatedAt: new Date().toISOString() });
      return;
    }
    const updatedJournal = localJournal.filter((_, i) => i !== index);
    setLocalJournal(updatedJournal);
    setCurrentJournalIndex(Math.max(0, index - 1));
    await db.media.update(entry.id, { journal: updatedJournal, updatedAt: new Date().toISOString() });
  };`,
  `  const handleDeleteJournalPage = async (index: number) => {
    setJournalPageToDelete(index);
  };
  
  const confirmDeleteJournalPage = async () => {
    if (journalPageToDelete === null || !entry || !entry.id) return;
    const index = journalPageToDelete;
    if (localJournal.length <= 1) {
      const updatedJournal = [{ ...localJournal[0], content: '', title: 'Page 1' }];
      setLocalJournal(updatedJournal);
      await db.media.update(entry.id, { journal: updatedJournal, updatedAt: new Date().toISOString() });
    } else {
      const updatedJournal = localJournal.filter((_, i) => i !== index);
      setLocalJournal(updatedJournal);
      setCurrentJournalIndex(Math.max(0, index - 1));
      await db.media.update(entry.id, { journal: updatedJournal, updatedAt: new Date().toISOString() });
    }
    setJournalPageToDelete(null);
  };`
);

content = content.replace(
  `    </>
  );
}`,
  `      <ConfirmModal
        isOpen={journalPageToDelete !== null}
        onClose={() => setJournalPageToDelete(null)}
        onConfirm={confirmDeleteJournalPage}
        title="Delete Page"
        message="Are you sure you want to delete this journal page? This action cannot be undone."
        isDarkMode={isDarkMode}
      />
    </>
  );
}`
);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
