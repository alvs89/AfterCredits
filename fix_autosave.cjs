const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

// Add save status state
content = content.replace(
  `  const [currentJournalIndex, setCurrentJournalIndex] = useState(0);`,
  `  const [currentJournalIndex, setCurrentJournalIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'' | 'Saving...' | 'Saved'>('');
  const isFirstRender = useRef(true);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);`
);

// Reset isFirstRender when modal opens/closes or entry changes
content = content.replace(
  `  useEffect(() => {
    if (entry) {`,
  `  useEffect(() => {
    isFirstRender.current = true;
    setSaveStatus('');
    if (entry) {`
);

// Add the auto-save effect
const saveEffect = `
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (!entry || !entry.id) return;

    setSaveStatus('Saving...');
    
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }
    
    autoSaveTimeout.current = setTimeout(async () => {
      await db.media.update(entry.id!, {
        summary: localSummary,
        notes: localNotes,
        journal: localJournal,
        updatedAt: new Date().toISOString()
      } as any);
      setSaveStatus('Saved');
      
      setTimeout(() => {
        setSaveStatus((prev) => prev === 'Saved' ? '' : prev);
      }, 2000);
    }, 1000);

    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, [localSummary, localNotes, localJournal]);

`;

content = content.replace(
  `  const handleSaveJournalPage = async (content: string) => {`,
  saveEffect + `  const handleSaveJournalPage = async (content: string) => {`
);

// Add UI indicator next to the tabs
const navReplacement = `<div className={cn("flex gap-6 border-b mb-6 shrink-0 mt-2 relative", isDarkMode ? "border-white/5" : "border-neutral-200")}>
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={cn("pb-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 relative top-[1px]", activeTab === 'summary' ? "text-[#3B82F6] border-[#3B82F6]" : (isDarkMode ? "text-white/60 border-transparent hover:text-white" : "text-neutral-600 border-transparent hover:text-neutral-900"))}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('review')}
                  className={cn("pb-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 relative top-[1px]", activeTab === 'review' ? "text-[#3B82F6] border-[#3B82F6]" : (isDarkMode ? "text-white/60 border-transparent hover:text-white" : "text-neutral-600 border-transparent hover:text-neutral-900"))}
                >
                  Review
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={cn("pb-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 relative top-[1px]", activeTab === 'notes' ? "text-[#3B82F6] border-[#3B82F6]" : (isDarkMode ? "text-white/60 border-transparent hover:text-white" : "text-neutral-600 border-transparent hover:text-neutral-900"))}
                >
                  Notes
                </button>
              </div>
              <div className="ml-auto flex items-center mb-3">
                <span className={cn("text-xs transition-opacity duration-300", saveStatus ? "opacity-100" : "opacity-0", saveStatus === 'Saved' ? "text-green-500" : "text-neutral-500")}>
                  {saveStatus}
                </span>
              </div>
            </div>`;

content = content.replace(
  /<div className=\{cn\("flex gap-6 border-b mb-6 shrink-0 mt-2", isDarkMode \? "border-white\/5" : "border-neutral-200"\)\}>[\s\S]*?<\/div>/,
  navReplacement
);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
