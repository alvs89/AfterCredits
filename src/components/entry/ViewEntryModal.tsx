import React, { useState, useEffect, useRef } from 'react';
import { MediaEntry, JournalEntry } from '../../types';
import { X, Star, Calendar, Edit2, Save, Maximize2, Minimize2, ChevronLeft, ChevronRight, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn, formatMediaType, formatWatchStatus } from '../../lib/utils';
import { db } from '../../db/db';
import ReactQuill from 'react-quill-new';
import { ConfirmModal } from '../common/ConfirmModal';
import 'react-quill-new/dist/quill.snow.css';

export function ViewEntryModal({ 
  entry, 
  isOpen, 
  onClose, 
  isDarkMode, 
  onEdit 
}: { 
  entry: MediaEntry | null, 
  isOpen: boolean, 
  onClose: () => void, 
  isDarkMode: boolean,
  onEdit: (entry: MediaEntry) => void
}) {
  const [activeTab, setActiveTab] = useState<'summary' | 'review' | 'notes'>('summary');
  const [isMaximized, setIsMaximized] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  const [localSummary, setLocalSummary] = useState('');
  const [localReview, setLocalReview] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  
  const [localJournal, setLocalJournal] = useState<JournalEntry[]>([]);
  const [currentJournalIndex, setCurrentJournalIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'' | 'Saving...' | 'Saved'>('');
  const [journalPageToDelete, setJournalPageToDelete] = useState<number | null>(null);
  const isFirstRender = useRef(true);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleQuillClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLImageElement) {
      setFullscreenImage(e.target.src);
    }
  };

  useEffect(() => {
    isFirstRender.current = true;
    setSaveStatus('');
    if (entry) {
      setLocalSummary(entry.summary || '');
      setLocalReview(entry.review || '');
      setLocalNotes(entry.notes || '');

      let journals = entry.journal || [];
      if (journals.length === 0 && entry.review) {
        journals = [{
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          content: entry.review,
          title: 'Review'
        }];
      } else if (journals.length === 0) {
        journals = [{
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          content: '',
          title: 'Page 1'
        }];
      }
      setLocalJournal(journals);
      setCurrentJournalIndex(0);
    }
  }, [entry]);


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

  const handleSaveJournalPage = async (content: string) => {
    if (!entry || !entry.id) return;
    const updatedJournal = [...localJournal];
    updatedJournal[currentJournalIndex] = {
      ...updatedJournal[currentJournalIndex],
      content
    };
    setLocalJournal(updatedJournal);
    await db.media.update(entry.id, {
      journal: updatedJournal,
      review: '', // clear old review
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddJournalPage = async () => {
    if (!entry || !entry.id) return;
    const newPage: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      content: '',
      title: `Page ${localJournal.length + 1}`
    };
    const updatedJournal = [...localJournal, newPage];
    setLocalJournal(updatedJournal);
    setCurrentJournalIndex(updatedJournal.length - 1);
    await db.media.update(entry.id, {
      journal: updatedJournal,
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteJournalPage = async (index: number) => {
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
  };


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

  const handleUpdateJournalMeta = async (index: number, updates: Partial<JournalEntry>) => {
    if (!entry || !entry.id) return;
    const updatedJournal = [...localJournal];
    updatedJournal[index] = { ...updatedJournal[index], ...updates };
    setLocalJournal(updatedJournal);
    await db.media.update(entry.id, {
      journal: updatedJournal,
      updatedAt: new Date().toISOString()
    });
  };

  const handleClose = async () => {
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

  const handleSave = async (field: 'summary' | 'review' | 'notes', value: string) => {
    if (entry && entry.id) {
      if (entry[field] !== value) {
        await db.media.update(entry.id, { 
          [field]: value, 
          updatedAt: new Date().toISOString() 
        } as any);
      }
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <>
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm", isMaximized ? "p-0" : "p-4")} onClick={handleClose}>
      <div 
        className={cn(
          "w-full overflow-hidden shadow-2xl transition-all relative border flex flex-col md:flex-row",
          isMaximized ? "max-w-[100vw] h-[100vh] max-h-[100vh] rounded-none border-none" : "max-w-6xl max-h-[90vh] rounded-2xl",
          isDarkMode ? "bg-[#14161C] border-white/10 text-white" : "bg-white text-neutral-900"
        )}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          className={cn("absolute top-4 right-4 p-2 rounded transition-colors border z-10 md:hidden", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-900")}
        >
          <X className={cn("w-4 h-4", isDarkMode ? "text-white/70" : "text-neutral-600")} />
        </button>

        {/* Poster Sidebar */}
        <div className={cn("w-full md:w-[300px] shrink-0 relative flex flex-col border-r", isDarkMode ? "bg-[#1A1D24] border-white/5" : "bg-neutral-50 border-neutral-200")}>
          <div className="aspect-[2/3] w-full relative">
            {entry.posterBlob ? (
              <img src={URL.createObjectURL(entry.posterBlob)} alt={entry.title} className="w-full h-full object-cover" />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center font-sans font-semibold text-xl px-4 text-center", isDarkMode ? "text-white/70" : "text-neutral-600")}>
                {entry.title}
              </div>
            )}
            <div className={cn("absolute inset-0 bg-gradient-to-t via-transparent to-transparent pointer-events-none", isDarkMode ? "from-[#1A1D24]" : "from-neutral-50")}></div>
            
            <div className="absolute bottom-4 left-4 flex gap-1 z-10">
              <div className="bg-[#3B82F6] text-[#0A0B0E] text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                {entry.rating}
              </div>
              <div className={cn("text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm", isDarkMode ? "bg-white/10 text-white/80" : "bg-white/60 text-neutral-800")}>
                {formatMediaType(entry.type)}
              </div>
            </div>
          </div>
          
          <div className="p-6 flex flex-col gap-4">
            <button 
              onClick={() => {
                handleClose();
                onEdit(entry);
              }}
              className={cn("w-full px-4 py-2.5 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 text-white border-white/10" : "bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 shadow-sm")}
            >
              <Edit2 className="w-4 h-4" /> Edit Entry
            </button>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/60" : "text-neutral-600")}>Status</p>
                  <p className={cn("text-sm font-medium truncate pr-2", isDarkMode ? "text-white/80" : "text-neutral-800")}>{formatWatchStatus(entry.status)}</p>
                </div>
                
                <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/60" : "text-neutral-600")}>Platform</p>
                  <p className={cn("text-sm font-medium truncate", isDarkMode ? "text-white/80" : "text-neutral-800")}>{entry.platform || 'N/A'}</p>
                </div>
              </div>

              {(entry.dateStarted || entry.dateCompleted) && (
                <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/60" : "text-neutral-600")}>Dates</p>
                  <div className={cn("flex flex-col gap-1 text-sm", isDarkMode ? "text-white/80" : "text-neutral-800")}>
                    {entry.dateStarted && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>Started: {new Date(entry.dateStarted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                    {entry.dateCompleted && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>Finished: {new Date(entry.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute top-6 right-6 z-20 hidden md:flex gap-2">
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className={cn("p-2 rounded transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-900")}
            >
              {isMaximized ? (
                <Minimize2 className={cn("w-4 h-4", isDarkMode ? "text-white/70" : "text-neutral-600")} />
              ) : (
                <Maximize2 className={cn("w-4 h-4", isDarkMode ? "text-white/70" : "text-neutral-600")} />
              )}
            </button>
            <button 
              onClick={handleClose}
              className={cn("p-2 rounded transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-900")}
            >
              <X className={cn("w-4 h-4", isDarkMode ? "text-white/70" : "text-neutral-600")} />
            </button>
          </div>
          
          <div className="p-8 pb-4 shrink-0 pr-16">
            <h2  className={cn("text-4xl font-bold tracking-tight mb-4", isDarkMode ? "text-white" : "text-neutral-900")}>
              {entry.title}
            </h2>
            
            {entry.genres && entry.genres.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {entry.genres.map(g => (
                  <span key={g} className={cn("text-[10px] px-3 py-1.5 rounded-full border font-medium", isDarkMode ? "bg-white/5 border-white/10 text-white/70" : "bg-neutral-100 border-neutral-200 text-neutral-700")}>
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 overflow-hidden px-8">
            <div className={cn("flex gap-6 border-b mb-6 shrink-0 mt-2 relative", isDarkMode ? "border-white/5" : "border-neutral-200")}>
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
            </div>
            
            <div className="flex-1 flex flex-col pb-8 pr-4 custom-quill-container min-h-0" onClick={handleQuillClick}>
              {activeTab === 'summary' && (
                <ReactQuill
                  theme="snow"
                  value={localSummary}
                  onChange={setLocalSummary}
                  onBlur={() => handleSave('summary', localSummary)}
                  placeholder="Add a summary..."
                  className="w-full flex-1 flex flex-col h-full min-h-0"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image', 'clean']
                    ]
                  }}
                />
              )}
              {activeTab === 'review' && (
                <div className="flex flex-col h-full w-full min-h-0">
                  <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2", isDarkMode ? "text-white/80" : "text-neutral-800")}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={localJournal[currentJournalIndex]?.title || ''}
                        onChange={(e) => {
                          const updated = [...localJournal];
                          if (updated[currentJournalIndex]) {
                            updated[currentJournalIndex] = { ...updated[currentJournalIndex], title: e.target.value };
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
                        onClick={async () => {
                          await db.media.update(entry.id!, { journal: localJournal } as any);
                          setCurrentJournalIndex(Math.max(0, currentJournalIndex - 1));
                        }}
                        disabled={currentJournalIndex === 0}
                        className="p-1.5 rounded hover:bg-neutral-500/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-medium w-8 text-center">
                        {currentJournalIndex + 1} / {Math.max(1, localJournal.length)}
                      </span>
                      <button 
                        onClick={async () => {
                          await db.media.update(entry.id!, { journal: localJournal } as any);
                          setCurrentJournalIndex(Math.min(localJournal.length - 1, currentJournalIndex + 1));
                        }}
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
                    <div key={currentJournalIndex} className="w-full flex-1 flex flex-col h-full min-h-0">
                      <ReactQuill
                      theme="snow"
                      value={localJournal[currentJournalIndex].content}
                      onChange={(val) => {
                        const updated = [...localJournal];
                        if (updated[currentJournalIndex]) {
                          updated[currentJournalIndex] = { ...updated[currentJournalIndex], content: val };
                          setLocalJournal(updated);
                        }
                      }}
                      onBlur={() => handleSaveJournalPage(localJournal[currentJournalIndex].content)}
                      placeholder="Write your journal entry here..."
                      className="w-full flex-1 flex flex-col h-full min-h-0"
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image', 'clean']
                        ]
                      }}
                    />
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'notes' && (
                <ReactQuill
                  theme="snow"
                  value={localNotes}
                  onChange={setLocalNotes}
                  onBlur={() => handleSave('notes', localNotes)}
                  placeholder="Add personal notes..."
                  className="w-full flex-1 flex flex-col h-full min-h-0"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image', 'clean']
                    ]
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[70]"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain cursor-default" onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={journalPageToDelete !== null}
        onClose={() => setJournalPageToDelete(null)}
        onConfirm={confirmDeleteJournalPage}
        title="Delete Page"
        message="Are you sure you want to delete this journal page? This action cannot be undone."
        isDarkMode={isDarkMode}
      />
    </>
  );
}
