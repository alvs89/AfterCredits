const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!content.includes('import { ConfirmModal }')) {
  content = content.replace(
    "import { AddEntryModal } from '../components/AddEntryModal';",
    "import { AddEntryModal } from '../components/AddEntryModal';\nimport { ConfirmModal } from '../components/ConfirmModal';"
  );
}

content = content.replace(
  "const [editingEntry, setEditingEntry] = useState<MediaEntry | null>(null);",
  "const [editingEntry, setEditingEntry] = useState<MediaEntry | null>(null);\n  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);"
);

content = content.replace(
  `  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await db.media.delete(id);
    }
  };`,
  `  const handleDelete = async (id: number) => {
    setEntryToDelete(id);
  };
  
  const confirmDelete = async () => {
    if (entryToDelete) {
      await db.media.delete(entryToDelete);
      setEntryToDelete(null);
    }
  };`
);

content = content.replace(
  "    </div>\n  );\n}",
  `      <ConfirmModal
        isOpen={entryToDelete !== null}
        onClose={() => setEntryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        isDarkMode={isDarkMode}
      />
    </div>
  );
}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
