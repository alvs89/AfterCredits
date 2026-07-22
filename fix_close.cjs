const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

const hookTarget = `  const handleSave = async (field: 'summary' | 'review' | 'notes', value: string) => {`;
const hookReplacement = `  const handleClose = async () => {
    if (entry && entry.id) {
       await db.media.update(entry.id, {
          summary: localSummary,
          notes: localNotes,
          journal: localJournal,
          updatedAt: new Date().toISOString()
       } as any);
    }
    onClose();
  };

  const handleSave = async (field: 'summary' | 'review' | 'notes', value: string) => {`;

content = content.replace(hookTarget, hookReplacement);

content = content.replace(/onClick={onClose}/g, 'onClick={handleClose}');
content = content.replace(/onClose\(\);/g, 'handleClose();');

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
