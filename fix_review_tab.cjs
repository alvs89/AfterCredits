const fs = require('fs');

let content = fs.readFileSync('src/components/ViewEntryModal.tsx', 'utf8');

const regex = /\{activeTab === 'review' && \([\s\S]*?\n\s+\)\}/;

const reviewTabReplacement = `{activeTab === 'review' && (
                <div className="flex flex-col h-full w-full min-h-0">
                  <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2", isDarkMode ? "text-white/80" : "text-neutral-800")}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={localJournal[currentJournalIndex]?.title || ''}
                        onChange={(e) => {
                          const updated = [...localJournal];
                          if (updated[currentJournalIndex]) {
                            updated[currentJournalIndex].title = e.target.value;
                            setLocalJournal(updated);
                          }
                        }}
                        onBlur={() => {
                          if (localJournal[currentJournalIndex]) {
                            handleUpdateJournalMeta(currentJournalIndex, { title: localJournal[currentJournalIndex].title });
                          }
                        }}
                        className={cn("bg-transparent border-b font-semibold outline-none focus:border-[#3B82F6] transition-colors w-32 sm:w-auto text-sm pb-1", isDarkMode ? "border-white/10" : "border-neutral-200")}
                        placeholder="Page Title (e.g. Ep 1-3)"
                      />
                      <input 
                        type="date"
                        value={localJournal[currentJournalIndex]?.date ? localJournal[currentJournalIndex].date.substring(0, 10) : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const newDate = new Date(e.target.value).toISOString();
                            handleUpdateJournalMeta(currentJournalIndex, { date: newDate });
                          }
                        }}
                        className={cn("text-xs bg-transparent border rounded p-1 outline-none", isDarkMode ? "border-white/10 text-white/70" : "border-neutral-200 text-neutral-600")}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentJournalIndex(Math.max(0, currentJournalIndex - 1))}
                        disabled={currentJournalIndex === 0}
                        className="p-1.5 rounded hover:bg-neutral-500/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-medium w-8 text-center">
                        {currentJournalIndex + 1} / {Math.max(1, localJournal.length)}
                      </span>
                      <button 
                        onClick={() => setCurrentJournalIndex(Math.min(localJournal.length - 1, currentJournalIndex + 1))}
                        disabled={currentJournalIndex === localJournal.length - 1 || localJournal.length === 0}
                        className="p-1.5 rounded hover:bg-neutral-500/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className={cn("w-px h-4 mx-1", isDarkMode ? "bg-white/10" : "bg-neutral-300")} />

                      <button 
                        onClick={handleAddJournalPage}
                        className="p-1.5 rounded hover:bg-[#3B82F6]/20 text-[#3B82F6] transition-colors"
                        title="Add new page"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteJournalPage(currentJournalIndex)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Delete page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {localJournal[currentJournalIndex] && (
                    <ReactQuill
                      theme="snow"
                      value={localJournal[currentJournalIndex].content}
                      onChange={(val) => {
                        const updated = [...localJournal];
                        if (updated[currentJournalIndex]) {
                          updated[currentJournalIndex].content = val;
                          setLocalJournal(updated);
                        }
                      }}
                      onBlur={() => handleSaveJournalPage(localJournal[currentJournalIndex].content)}
                      placeholder="Write your journal entry here..."
                      className="w-full flex-1 flex flex-col h-full min-h-0"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', '', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'clean']
                        ]
                      }}
                    />
                  )}
                </div>
              )}`;

content = content.replace(regex, reviewTabReplacement);

fs.writeFileSync('src/components/ViewEntryModal.tsx', content);
console.log("Replaced via regex!");
