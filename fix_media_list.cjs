const fs = require('fs');

let content = fs.readFileSync('src/pages/MediaList.tsx', 'utf8');

if (!content.includes('import { ConfirmModal }')) {
  content = content.replace(
    "import { ViewEntryModal } from '../components/ViewEntryModal';",
    "import { ViewEntryModal } from '../components/ViewEntryModal';\nimport { ConfirmModal } from '../components/ConfirmModal';"
  );
}

content = content.replace(
  "const [viewingEntry, setViewingEntry] = useState<MediaEntry | null>(null);",
  "const [viewingEntry, setViewingEntry] = useState<MediaEntry | null>(null);\n  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);"
);

content = content.replace(
  `  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
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

// Append the ConfirmModal to the end of the return statement before the closing div/tag
// The return statement is wrapped in a main fragment probably or a div.
content = content.replace(
  "      </main>\n    </div>\n  );\n}",
  `      </main>
      <ConfirmModal
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

fs.writeFileSync('src/pages/MediaList.tsx', content);
